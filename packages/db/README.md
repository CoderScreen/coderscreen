# @coderscreen/db

Drizzle schema (`src/*.db.ts`) and the SQL migrations generated from it
(`drizzle/`). Every database (production, staging, local, CI) is changed only
by running these migrations, in order.

## Changing the schema

1. Edit the `*.db.ts` files.
2. Generate a migration and give it a name that says what it does:
   ```bash
   pnpm --filter @coderscreen/db db:generate --name add_candidate_phone
   ```
3. Read the SQL in `drizzle/`. You can edit it before committing, for example
   to backfill data or add `IF NOT EXISTS`. Commit the SQL and the `meta/`
   changes together with the schema change.
4. Before deploying code that uses the change, run the migration against that
   environment:
   ```bash
   DATABASE_URL=... pnpm --filter @coderscreen/db db:migrate
   ```

CI fails if a schema change has no migration. The API tests and
`pnpm dev:local` run these same migrations, so a broken migration shows up
there before it reaches production.

Prefer changes that old code can live with (new nullable columns, new
tables), since the migration runs before the new code is deployed.

## Commands

| Command | What it does |
| --- | --- |
| `db:generate` | Writes a migration for whatever changed in the schema |
| `db:migrate` | Applies migrations the database hasn't run yet |
| `db:check` | Checks the migration files are consistent |
| `db:studio` | Opens Drizzle Studio |

`DATABASE_URL` comes from the environment, or from `packages/db/.env`.
