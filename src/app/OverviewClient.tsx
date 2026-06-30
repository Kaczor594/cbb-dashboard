"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Empty } from "@/components/ui/Card";
import { Kpi } from "@/components/ui/Kpi";
import { num, pct, signed, int, gameDate } from "@/lib/format";
import { chartTooltipStyle } from "@/lib/chartStyles";
import type {
  SummaryBlob,
  MonthlyBlob,
  CalibrationBlob,
  MarketBlob,
  GamesBlob,
  GameRow,
  SeasonMetrics,
} from "@/lib/types";

type SeasonSel = "all" | number;
type SortKey = "date" | "model_prob" | "edge" | "correct";
type FilterMode = "all" | "upsets" | "correct" | "incorrect";

const TABLE_CAP = 200;

export default function OverviewClient({
  summary,
  monthly,
  calibration,
  market,
}: {
  summary: SummaryBlob | null;
  monthly: MonthlyBlob | null;
  calibration: CalibrationBlob | null;
  market: MarketBlob | null;
}) {
  const [season, setSeason] = useState<SeasonSel>("all");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // The per-game blob is ~3 MB — load it client-side so the initial HTML is
  // light. KPIs and charts above render immediately from the SSR seed.
  const [games, setGames] = useState<GamesBlob | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/data/games")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive) setGames(j as GamesBlob);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const selKey = season === "all" ? "all" : String(season);
  const seasons = summary?.by_season.map((s) => s.season as number) ?? [];

  const metrics: SeasonMetrics | null = useMemo(() => {
    if (!summary) return null;
    if (season === "all") return summary.overall;
    return summary.by_season.find((s) => s.season === season) ?? summary.overall;
  }, [summary, season]);

  const sparkAcc = useMemo(() => {
    if (!monthly) return undefined;
    const pts =
      season === "all"
        ? monthly.points
        : monthly.points.filter((p) => p.season === season);
    return pts.map((p) => p.accuracy);
  }, [monthly, season]);

  const cal = calibration?.seasons[selKey] ?? null;
  const calRows = useMemo(
    () =>
      (cal?.bins ?? [])
        .filter((b) => b.n > 0 && b.predicted != null && b.actual != null)
        .sort((a, b) => (a.predicted ?? 0) - (b.predicted ?? 0)),
    [cal],
  );

  const mk = market?.seasons[selKey] ?? null;
  const marketBars = useMemo(
    () => (mk?.edge_buckets ?? []).filter((b) => b.n > 0),
    [mk],
  );

  // Upset highlight: model beat the market on the winner; biggest conviction first.
  const upsets = useMemo(() => {
    if (!games) return [];
    return games.rows
      .filter((r) => r.upset_call && (season === "all" || r.season === season))
      .sort((a, b) => Math.abs(b.edge ?? 0) - Math.abs(a.edge ?? 0))
      .slice(0, 8);
  }, [games, season]);

  const tableRows = useMemo(() => {
    if (!games) return [];
    const q = query.trim().toLowerCase();
    let rows = games.rows.filter((r) => {
      if (season !== "all" && r.season !== season) return false;
      if (filter === "upsets" && !r.upset_call) return false;
      if (filter === "correct" && !r.correct) return false;
      if (filter === "incorrect" && r.correct) return false;
      if (q && !`${r.home} ${r.away}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    rows = rows.slice().sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortKey) {
        case "date":
          av = a.date;
          bv = b.date;
          break;
        case "model_prob":
          av = a.model_prob;
          bv = b.model_prob;
          break;
        case "edge":
          av = Math.abs(a.edge ?? -1);
          bv = Math.abs(b.edge ?? -1);
          break;
        case "correct":
          av = a.correct ? 1 : 0;
          bv = b.correct ? 1 : 0;
          break;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return rows;
  }, [games, season, filter, query, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  if (!summary || !metrics) {
    return (
      <Card className="span-2" eyebrow="Overview">
        <Empty
          title="No backtest data found"
          sub="run the publisher: python scripts/publish_dashboard.py --out ../cbb-dashboard/public/data"
        />
      </Card>
    );
  }

  const seasonLabel = season === "all" ? "both seasons" : `${season} season`;
  const marketCov =
    mk && metrics.n ? mk.n / metrics.n : null;

  return (
    <>
      {/* Season selector ------------------------------------------------ */}
      <div className="span-2 seg-row">
        <span className="eyebrow">Season</span>
        <div className="seg">
          <button
            className={`seg-btn ${season === "all" ? "active" : ""}`}
            onClick={() => setSeason("all")}
          >
            All
          </button>
          {seasons.map((s) => (
            <button
              key={s}
              className={`seg-btn ${season === s ? "active" : ""}`}
              onClick={() => setSeason(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row (4) ---------------------------------------------------- */}
      <div className="kpi-row span-2">
        <Kpi
          label="Accuracy"
          value={pct(metrics.accuracy, 1)}
          delta={`${int(metrics.n)} games · the model's pick won`}
          spark={sparkAcc}
        />
        <Kpi
          label="Brier score"
          value={num(metrics.brier, 3)}
          delta="probability error · lower is better"
        />
        <Kpi
          label="Log loss"
          value={num(metrics.log_loss, 3)}
          delta="confidence-weighted · lower is better"
        />
        <Kpi
          label="AUC"
          value={num(metrics.auc, 3)}
          delta="ranking skill · 0.5 = none, 1 = perfect"
        />
      </div>

      {/* HERO — Calibration -------------------------------------------- */}
      <Card
        className="span-2"
        eyebrow="Calibration"
        title={
          cal && cal.ece <= 0.05
            ? "When the model says 70%, it wins about 70% — the probabilities are honest."
            : "How predicted probabilities compare to what actually happened."
        }
        prose
        source={`Reliability diagram · x = predicted home-win probability, y = observed win rate · 10 bins · ${cal ? int(cal.n) : "—"} games · ECE ${cal ? num(cal.ece, 3) : "—"} (mean gap from the diagonal) · ${seasonLabel}`}
      >
        {calRows.length === 0 ? (
          <Empty title="No calibration data" />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={calRows} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="var(--chart-grid)" />
              <XAxis
                type="number"
                dataKey="predicted"
                domain={[0, 1]}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                tickLine={false}
                axisLine={{ stroke: "var(--chart-axis)" }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={44}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v, name) => [
                  typeof v === "number" ? `${(v * 100).toFixed(1)}%` : String(v),
                  name === "actual" ? "observed win rate" : String(name),
                ]}
                labelFormatter={(v) => `predicted ${(Number(v) * 100).toFixed(0)}%`}
              />
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                ]}
                stroke="var(--chart-context)"
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
              />
              <Line
                dataKey="actual"
                stroke="var(--moss-50)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--moss-50)" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="card-note">
          The dashed line is perfect calibration. Points on it mean the model&apos;s
          stated probabilities match real-world frequencies — the property that
          actually matters for a forecasting model, and the hardest to fake.
        </p>
      </Card>

      {/* Market comparison --------------------------------------------- */}
      <Card
        eyebrow="Versus the market"
        title={
          mk && mk.market_accuracy != null && mk.model_accuracy != null
            ? mk.market_accuracy > mk.model_accuracy
              ? "The closing line is sharp — the model trails it slightly, but stays close."
              : "The model holds its own against the closing line."
            : "Model accuracy against the betting market."
        }
        prose
        source={
          mk && mk.n > 0
            ? `Closing moneylines (sportsdata.io), vig removed · only ${int(mk.n)} of ${int(metrics.n)} games (${pct(marketCov, 0)}) carry odds · ${seasonLabel}`
            : "no market data for this season"
        }
      >
        {!mk || mk.n === 0 ? (
          <Empty title="No market overlap in this view" />
        ) : (
          <>
            <div className="vs-row">
              <div className="vs-cell">
                <span className="eyebrow">Model</span>
                <span className="vs-val">{pct(mk.model_accuracy, 1)}</span>
              </div>
              <div className="vs-cell">
                <span className="eyebrow">Market</span>
                <span className="vs-val">{pct(mk.market_accuracy, 1)}</span>
              </div>
              <div className="vs-cell">
                <span className="eyebrow">Games w/ odds</span>
                <span className="vs-val">{int(mk.n)}</span>
              </div>
            </div>
            {marketBars.length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marketBars} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: "var(--chart-axis)" }}
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(v, name) => [
                      typeof v === "number" ? `${(v * 100).toFixed(1)}%` : String(v),
                      name === "model" ? "model" : "market",
                    ]}
                  />
                  <Bar dataKey="model" fill="var(--moss-50)" barSize={14} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="market" fill="var(--chart-context)" barSize={14} radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <p className="card-note">
              Accuracy by how far the model&apos;s probability sits from the
              market&apos;s, split by side. Most games have no odds in the data, so
              treat this as a sample, not the whole picture.
            </p>
          </>
        )}
      </Card>

      {/* Conviction calls ---------------------------------------------- */}
      <Card
        eyebrow="Conviction calls"
        title="Where the model disagreed with the market — and was right."
        prose
        source="Games where the model and the market picked different winners and the model called it · biggest disagreement first"
      >
        {!games ? (
          <Empty title="Loading games…" />
        ) : upsets.length === 0 ? (
          <Empty title="No qualifying calls in this view" />
        ) : (
          <div className="mini-list">
            {upsets.map((r) => (
              <div className="mini-row" key={r.game_id}>
                <span className="mini-main">
                  {r.away} @ {r.home}
                </span>
                <span className="mini-sub">
                  {gameDate(r.date)} · model {pct(r.model_prob, 0)} home / market{" "}
                  {pct(r.market_prob, 0)}
                </span>
                <span className="badge badge-upset">
                  +{Math.round(Math.abs(r.edge ?? 0) * 100)}pp
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Results table ------------------------------------------------- */}
      <Card
        className="span-2"
        eyebrow="Every game"
        title="The full out-of-sample log."
        prose
        right={
          <div className="tbl-controls">
            <input
              className="tbl-search"
              placeholder="team…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="seg seg-sm">
              {(["all", "upsets", "correct", "incorrect"] as FilterMode[]).map((m) => (
                <button
                  key={m}
                  className={`seg-btn ${filter === m ? "active" : ""}`}
                  onClick={() => setFilter(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        }
        source={`showing ${int(Math.min(tableRows.length, TABLE_CAP))} of ${int(tableRows.length)} games · ${seasonLabel} · model p = P(home win)`}
      >
        {!games ? (
          <Empty title="Loading the full game log…" sub="out-of-sample predictions" />
        ) : tableRows.length === 0 ? (
          <Empty title="No games match these filters" />
        ) : (
          <div className="table-scroll">
            <table className="mtable sticky-first sortable">
              <thead>
                <tr>
                  <th onClick={() => toggleSort("date")} className="sortable-th">
                    Date {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th>Matchup</th>
                  <th className="num">Score</th>
                  <th onClick={() => toggleSort("model_prob")} className="num sortable-th">
                    Model p(H) {sortKey === "model_prob" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th onClick={() => toggleSort("correct")} className="num sortable-th">
                    Result {sortKey === "correct" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="num">Mkt p(H)</th>
                  <th onClick={() => toggleSort("edge")} className="num sortable-th">
                    Edge {sortKey === "edge" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(0, TABLE_CAP).map((r) => (
                  <GameTr key={r.game_id} r={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function GameTr({ r }: { r: GameRow }) {
  const score =
    r.home_score != null && r.away_score != null
      ? `${r.home_score}–${r.away_score}`
      : "—";
  return (
    <tr className={r.correct ? "sig" : "dim"}>
      <td>{gameDate(r.date)}</td>
      <td>
        {r.away} @ {r.home}
        {r.neutral_site && (
          <>
            {" "}
            <span className="badge badge-prior">N</span>
          </>
        )}
        {r.upset_call && (
          <>
            {" "}
            <span className="badge badge-upset">dog call ✓</span>
          </>
        )}
      </td>
      <td className="num">{score}</td>
      <td className="num">{pct(r.model_prob, 0)}</td>
      <td className="num">{r.correct ? "✓" : "✗"}</td>
      <td className="num">{r.market_prob != null ? pct(r.market_prob, 0) : "—"}</td>
      <td className="num">{r.edge != null ? signed(r.edge * 100, 0) : "—"}</td>
    </tr>
  );
}
