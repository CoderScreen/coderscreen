import { user } from '@coderscreen/db/user.db';
import { Resend } from 'resend';
import { db } from './utils/db';

/**
 * Loads all CoderScreen users (the people who signed up — not interview
 * candidates) into a Resend segment so they can be sent marketing email.
 *
 * Required env (in packages/scripts/.env):
 *   DATABASE_URL          — already used by ./utils/db
 *   RESEND_API_KEY        — Resend API key
 *   RESEND_SEGMENT_ID     — target segment id (optional; defaults below)
 *
 * Usage:
 *   pnpm --filter scripts sync-resend-audience            # live sync
 *   pnpm --filter scripts sync-resend-audience -- --dry-run   # preview only
 *
 * Re-running is safe: Resend dedupes contacts by email, so existing contacts
 * are updated rather than duplicated.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_SEGMENT_ID =
  process.env.RESEND_SEGMENT_ID ?? '5482d87a-0e2a-4a47-88aa-b3a4f785f027';
const DRY_RUN = process.argv.includes('--dry-run');

// Resend allows 5 requests/second. Send batches of BATCH_SIZE and ensure each
// batch spans at least BATCH_INTERVAL_MS, keeping us comfortably under the cap.
const BATCH_SIZE = 4;
const BATCH_INTERVAL_MS = 1100;
const MAX_RETRIES = 5;

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

const resend = new Resend(RESEND_API_KEY);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isRateLimit = (msg: string | undefined) =>
  !!msg && /too many requests|rate limit/i.test(msg);

// Split a single "name" field into the firstName/lastName Resend expects.
function splitName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim();
  if (!trimmed) return { firstName: '', lastName: '' };
  const [first, ...rest] = trimmed.split(/\s+/);
  return { firstName: first, lastName: rest.join(' ') };
}

async function main() {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user);

  // Dedupe by lowercased email (the column is unique already, but guard anyway).
  const seen = new Set<string>();
  const contacts = users
    .filter((u) => {
      const key = u.email.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((u) => ({ email: u.email.trim(), ...splitName(u.name) }));

  console.log(`Found ${contacts.length} unique users to sync into segment ${RESEND_SEGMENT_ID}`);

  if (DRY_RUN) {
    for (const c of contacts) {
      console.log(`  [dry-run] ${c.email} (${c.firstName} ${c.lastName})`.trimEnd());
    }
    console.log(`\nDry run — no contacts were created. ${contacts.length} would be synced.`);
    return;
  }

  let created = 0;
  let failed = 0;

  // Create one contact, retrying on rate-limit (429) with exponential backoff.
  const createContact = async (c: (typeof contacts)[number]): Promise<void> => {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const { error } = await resend.contacts.create({
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        unsubscribed: false,
        segments: [{ id: RESEND_SEGMENT_ID }],
      });

      if (!error) {
        created++;
        return;
      }

      if (isRateLimit(error.message) && attempt < MAX_RETRIES) {
        await sleep(BATCH_INTERVAL_MS * (attempt + 1)); // back off: 1.1s, 2.2s, ...
        continue;
      }

      failed++;
      console.error(`  x failed ${c.email}: ${error.message}`);
      return;
    }
  };

  // Send BATCH_SIZE at a time, pacing each batch to stay under 5 req/sec.
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batchStart = Date.now();
    const batch = contacts.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(createContact));

    console.log(`  progress: ${Math.min(i + BATCH_SIZE, contacts.length)}/${contacts.length}`);

    // Throttle: ensure each batch window spans at least BATCH_INTERVAL_MS,
    // unless this was the last batch.
    if (i + BATCH_SIZE < contacts.length) {
      const elapsed = Date.now() - batchStart;
      if (elapsed < BATCH_INTERVAL_MS) await sleep(BATCH_INTERVAL_MS - elapsed);
    }
  }

  console.log(`\nDone. Synced ${created}, failed ${failed}, of ${contacts.length} total.`);
}

main()
  .then(() => {
    console.log('✅ Finished running script');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error running script', err);
    process.exit(1);
  });
