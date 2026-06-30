"use client";

import { usePathname } from "next/navigation";
import { int } from "@/lib/format";
import type { Meta } from "@/lib/types";

const PAGE_NAME: Record<string, string> = {
  "/": "Overview",
  "/method": "Method",
};

export default function Header({ meta = null }: { meta?: Meta | null }) {
  const path = usePathname();

  // Static off-season backtest — no live feed. The badge states the scope of
  // the backtest instead of a liveness clock; reuse the gray ".stale" look so
  // it reads as a calm label, not a pulsing "live" dot.
  const seasons = meta?.seasons ?? [];
  const seasonLabel =
    seasons.length === 0
      ? null
      : seasons.length === 1
        ? `${seasons[0]} season`
        : `${seasons.length} seasons`;
  const games = meta?.counts.games;

  return (
    <header className="dh">
      <div className="dh-left">
        <div className="dh-title">
          <span className="eyebrow">CBB model</span>
          <span className="dh-page">{PAGE_NAME[path] ?? "Dashboard"}</span>
        </div>
      </div>
      <div className="dh-right">
        {seasonLabel && games != null && (
          <span className="dh-breadcrumb">
            <span className="eyebrow">
              out-of-sample · {seasonLabel} · {int(games)} games
            </span>
          </span>
        )}
        <span className="badge-live stale">
          <span className="dot" />
          backtest
        </span>
      </div>
    </header>
  );
}
