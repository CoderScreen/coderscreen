import { questionLibraryTestCaseTable } from '@coderscreen/db/questionLibraryTestCase.db';
import { testCaseResultTable } from '@coderscreen/db/testCaseResult.db';
import { and, isNotNull, isNull, sql } from 'drizzle-orm';
import { db } from './utils/db';

/**
 * Copies each test case's label/args/expected/hidden/position onto the
 * test_case_results rows written before results carried their own snapshot.
 * Once filled, editing or deleting a test case can no longer change or erase
 * what reviewers see for past submissions.
 *
 * Rows whose test case is already gone (deleted before this change) have
 * nothing to copy and are left null; the detail view shows them without
 * inputs, same as before.
 *
 * Run after `db:push` has added the snapshot columns. Safe to re-run: it only
 * touches rows that are still missing a snapshot.
 * Dry run by default: bun run src/backfill-test-result-snapshots.ts --apply
 */

const apply = process.argv.includes('--apply');

async function main() {
  const missing = and(isNull(testCaseResultTable.args), isNotNull(testCaseResultTable.testCaseId));

  const counts = await db
    .select({
      fillable: sql<number>`count(*) filter (where ${questionLibraryTestCaseTable.id} is not null)::int`,
      orphaned: sql<number>`count(*) filter (where ${questionLibraryTestCaseTable.id} is null)::int`,
    })
    .from(testCaseResultTable)
    .leftJoin(
      questionLibraryTestCaseTable,
      sql`${questionLibraryTestCaseTable.id} = ${testCaseResultTable.testCaseId}`
    )
    .where(missing)
    .then((r) => r[0]);

  console.log(`- ${counts.fillable} results missing a snapshot with a live test case to copy`);
  console.log(`- ${counts.orphaned} results missing a snapshot whose test case no longer exists`);

  if (apply && counts.fillable > 0) {
    const updated = await db.execute(sql`
      UPDATE ${testCaseResultTable} r
      SET label = tc.label,
          args = tc.args,
          expected_return = tc.expected_return,
          is_hidden = tc.is_hidden,
          position = tc.position
      FROM ${questionLibraryTestCaseTable} tc
      WHERE r.test_case_id = tc.id
        AND r.args IS NULL
    `);
    console.log(`  filled ${updated.count} results`);
  }

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to write these changes.');
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
