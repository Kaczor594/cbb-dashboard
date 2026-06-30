// Single source of truth for the dashboard's data origin.
// The backtest is static off-season data, so by default the six JSON blobs are
// served locally from `public/data/<file>.json` (committed, bundled at build).
// Setting DATA_BASE_URL flips both the SSR seed (`serverFetch.ts`) and the API
// proxy (`app/api/data/[file]/route.ts`) to a remote bucket without touching
// any page — the allow-list + URL shape live here so the two can't drift.

export const ALLOWED = new Set<string>([
  "meta",
  "summary",
  "monthly",
  "calibration",
  "market",
  "games",
]);

/** Upstream URL for one data file, or null when no remote is configured
 *  (the normal case — fall back to the local static file). */
export function dataUrl(file: string): string | null {
  const base = process.env.DATA_BASE_URL;
  return base ? `${base}/cbb/${file}.json` : null;
}
