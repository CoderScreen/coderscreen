import { buildAssessmentsLaunchEmail } from '@coderscreen/email/marketing/assessments-launch';
import { Resend } from 'resend';

/**
 * Creates the Assessments-launch marketing email as a Resend Broadcast targeting
 * a segment. Sending through Broadcasts (not per-contact emails.send) means Resend
 * handles unsubscribe links, suppression, and the {{{FIRST_NAME}}} merge variable.
 *
 * Required env (in packages/scripts/.env):
 *   RESEND_API_KEY          — Resend API key
 *   RESEND_SEGMENT_ID       — target segment id (optional; defaults below)
 *   MARKETING_FROM          — sender, e.g. "CoderScreen <hello@mail.coderscreen.com>" (optional default below)
 *   ASSESSMENTS_CTA_URL     — CTA link (optional; defaults below)
 *   COMPANY_ADDRESS         — physical mailing address for the footer (optional)
 *   ASSESSMENTS_HERO_IMAGE  — hero screenshot URL (optional)
 *   ASSESSMENTS_RESULT_IMAGE— results screenshot URL (optional)
 *   SENDER_NAME             — name in the sign-off (optional; defaults below)
 *
 * Usage:
 *   pnpm --filter scripts send-assessments-email -- --test you@example.com   # send a rendered preview to one address
 *   pnpm --filter scripts send-assessments-email                 # create as DRAFT (review in dashboard, then send)
 *   pnpm --filter scripts send-assessments-email -- --send       # create and send immediately
 *   pnpm --filter scripts send-assessments-email -- --send --at "in 1 hour"   # schedule
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_SEGMENT_ID =
  process.env.RESEND_SEGMENT_ID ?? '5482d87a-0e2a-4a47-88aa-b3a4f785f027';
const MARKETING_FROM = process.env.MARKETING_FROM ?? 'CoderScreen <team@coderscreen.com>';
const CTA_URL = process.env.ASSESSMENTS_CTA_URL ?? 'https://app.coderscreen.com/assessments';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS ?? '';
const HERO_IMAGE = process.env.ASSESSMENTS_HERO_IMAGE;
const RESULT_IMAGE = process.env.ASSESSMENTS_RESULT_IMAGE;
const SENDER_NAME = process.env.SENDER_NAME ?? 'Kuba';

const args = process.argv.slice(2);
const SEND_NOW = args.includes('--send');
const atIndex = args.indexOf('--at');
const SCHEDULED_AT = atIndex >= 0 ? args[atIndex + 1] : undefined;
const testIndex = args.indexOf('--test');
const TEST_EMAIL = testIndex >= 0 ? args[testIndex + 1] : undefined;

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

const resend = new Resend(RESEND_API_KEY);

async function main() {
  const { subject, previewText, html } = buildAssessmentsLaunchEmail({
    ctaUrl: CTA_URL,
    senderName: SENDER_NAME,
    companyAddress: COMPANY_ADDRESS,
    heroImageUrl: HERO_IMAGE,
    resultImageUrl: RESULT_IMAGE,
  });

  if (!COMPANY_ADDRESS) {
    console.warn(
      'WARNING: COMPANY_ADDRESS is empty. Marketing email legally requires a physical mailing address (CAN-SPAM).'
    );
  }
  if (!HERO_IMAGE || !RESULT_IMAGE) {
    console.warn('Note: hero/result image not set — those rows are omitted from the email.');
  }

  // --test: send a single rendered preview to one address via emails.send.
  // Broadcasts can only target a segment, so a self-test goes through the
  // transactional API. Merge variables are substituted with placeholders here
  // since emails.send does not fill them.
  if (TEST_EMAIL) {
    const previewHtml = html
      .replace(/\{\{\{FIRST_NAME[^}]*\}\}\}/g, 'there')
      .replace(/\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/g, '#');

    console.log(`Sending a test preview to ${TEST_EMAIL} (from ${MARKETING_FROM})...`);
    const { data, error } = await resend.emails.send({
      from: MARKETING_FROM,
      to: TEST_EMAIL,
      subject: `[TEST] ${subject}`,
      html: previewHtml,
    });
    if (error) {
      throw new Error(`Failed to send test email: ${error.message}`);
    }
    console.log(`Sent test email: ${data?.id}`);
    return;
  }

  console.log(`Creating broadcast for segment ${RESEND_SEGMENT_ID}`);
  console.log(`  from:    ${MARKETING_FROM}`);
  console.log(`  subject: ${subject}`);
  console.log(`  mode:    ${SEND_NOW ? (SCHEDULED_AT ? `scheduled (${SCHEDULED_AT})` : 'send now') : 'DRAFT'}`);

  const { data, error } = await resend.broadcasts.create({
    segmentId: RESEND_SEGMENT_ID,
    from: MARKETING_FROM,
    subject,
    previewText,
    html,
    name: 'Assessments launch',
    ...(SEND_NOW ? { send: true, ...(SCHEDULED_AT ? { scheduledAt: SCHEDULED_AT } : {}) } : {}),
  });

  if (error) {
    throw new Error(`Failed to create broadcast: ${error.message}`);
  }

  console.log(`\nBroadcast created: ${data?.id}`);
  if (SEND_NOW) {
    console.log(SCHEDULED_AT ? 'Scheduled to send.' : 'Sending now.');
  } else {
    console.log('Created as a DRAFT — review it in the Resend dashboard, then hit Send.');
    console.log('Re-run with `-- --send` to send immediately instead.');
  }
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
