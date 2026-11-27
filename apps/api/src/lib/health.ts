import postgres from 'postgres';

export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/** `SELECT 1` over a fresh connection, so a bad password or a dead DB fails it. */
export async function pingPostgres(connectionString: string, timeoutMs = 2000): Promise<void> {
  const sql = postgres(connectionString, {
    max: 1,
    fetch_types: false,
    connect_timeout: Math.ceil(timeoutMs / 1000),
  });
  try {
    await withTimeout(sql`select 1`, timeoutMs, 'postgres ping');
  } finally {
    await sql.end({ timeout: 1 }).catch(() => {});
  }
}

/**
 * Backs `GET /health`. Never throws; the details go to the logs, not the
 * public response body.
 */
export async function checkHealth(probe: () => Promise<void>): Promise<{ ok: boolean }> {
  try {
    await probe();
    return { ok: true };
  } catch (err) {
    console.error('[health] database check failed:', err);
    return { ok: false };
  }
}
