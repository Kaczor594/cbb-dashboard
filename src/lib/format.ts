// Fixed locale so server-rendered and client-rendered numbers match (avoids
// React hydration mismatches when the viewer's locale differs from the build's).
const NF = new Intl.NumberFormat("en-US");

/** Thousands-separated integer, locale-stable. */
export const int = (v: number | null | undefined): string =>
  v == null ? "—" : NF.format(Math.round(v));

export const pct = (v: number | null | undefined, digits = 0): string =>
  v == null ? "—" : `${(v * 100).toFixed(digits)}%`;

export const num = (v: number | null | undefined, digits = 2): string =>
  v == null ? "—" : v.toFixed(digits);

export const signed = (v: number | null | undefined, digits = 2): string =>
  v == null ? "—" : `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(digits)}`;

/** "Nov 4, 2024" from an ISO date (date-only, no timezone surprises). */
export const gameDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
