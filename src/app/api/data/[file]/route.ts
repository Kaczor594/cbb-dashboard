import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { ALLOWED, dataUrl } from "@/lib/dataSource";

// Serves the six data blobs (allow-list + URL shape in dataSource.ts). The
// backtest is static, so by default this reads the committed local file from
// `public/data/`; if DATA_BASE_URL is set it proxies that remote bucket instead.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!ALLOWED.has(file)) {
    return NextResponse.json({ error: "unknown file" }, { status: 404 });
  }
  const remote = dataUrl(file);
  try {
    if (remote) {
      const r = await fetch(remote, { cache: "no-store" });
      if (!r.ok) {
        return NextResponse.json({ error: `upstream ${r.status}` }, { status: 502 });
      }
      return NextResponse.json(await r.json(), {
        headers: { "Cache-Control": "public, max-age=300, s-maxage=600" },
      });
    }
    const p = path.join(process.cwd(), "public", "data", `${file}.json`);
    const body = JSON.parse(await readFile(p, "utf8"));
    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "read failed" }, { status: 502 });
  }
}
