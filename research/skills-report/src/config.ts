// Shared config for the scraper.
//
// IMPORTANT: set a truthful, contactable User-Agent. This is both good etiquette
// and part of the legal/credibility posture in the data-gathering plan (public,
// logged-off data, polite throttling, no fake identity). Edit CONTACT before a
// large run.
const CONTACT = "research@coderscreen.com";

export const USER_AGENT = `CoderScreenResearchBot/0.1 (+https://coderscreen.com; ${CONTACT})`;

export const YC_BASE = "https://www.ycombinator.com";
export const YC_OSS_ALL = "https://yc-oss.github.io/api/companies/all.json";

// Default location of the SQLite landing DB (gitignored).
export const DB_PATH = new URL("../data/skills-report.sqlite", import.meta.url).pathname;

// Politeness defaults — override via CLI flags.
export const DEFAULTS = {
  concurrency: 4, // simultaneous in-flight requests
  minDelayMs: 150, // floor delay applied per request slot (jittered)
  retries: 4, // retry attempts on network / 429 / 5xx
};
