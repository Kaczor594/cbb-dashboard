// First-paint SSR data. Server Components await this so the initial HTML carries
// real content (KPIs, charts, the results table) — crawlers, link-preview bots
// and no-JS clients all see the dashboard.
//
// The backtest is static, so by default we read the committed local file from
// `public/data/`. If DATA_BASE_URL is set, we fetch from that remote bucket
// instead (same allow-list + URL shape as the API proxy, via dataSource.ts).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ALLOWED, dataUrl } from "@/lib/dataSource";

export async function fetchBlob<T>(file: string): Promise<T | null> {
  if (!ALLOWED.has(file)) return null;
  const remote = dataUrl(file);
  try {
    if (remote) {
      const r = await fetch(remote, { cache: "no-store" });
      return r.ok ? ((await r.json()) as T) : null;
    }
    const p = path.join(process.cwd(), "public", "data", `${file}.json`);
    return JSON.parse(await readFile(p, "utf8")) as T;
  } catch {
    return null;
  }
}
