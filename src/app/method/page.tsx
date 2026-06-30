import { Fragment } from "react";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Method — how the CBB model works",
  description:
    "A plain-language walkthrough of the college-basketball prediction model: point-in-time features, an XGBoost win model, walk-forward backtesting, and why every number on this site is out-of-sample.",
};

/* ---- content ---------------------------------------------------------- */

const FLOW = [
  {
    n: 1,
    name: "Features",
    desc: "Each game described by 44 features — ratings, form, roster strength, travel — all computed before tip-off.",
  },
  {
    n: 2,
    name: "Walk-forward",
    desc: "The model is retrained every calendar day on prior seasons plus games already played — never the future.",
  },
  {
    n: 3,
    name: "Predict",
    desc: "XGBoost returns a win probability, averaged over both orientations to cancel home/away bias.",
  },
  {
    n: 4,
    name: "Score",
    desc: "Every prediction is graded against the result: accuracy, Brier, calibration and a market head-to-head.",
  },
];

// Accuracy on the out-of-sample backtest. Longer bar = better. Scale starts at
// 0.45 so the (honest) gap between the model, the market and the baselines is
// legible; the ≋ flag marks the truncation.
const SCALE_MIN = 0.45;
const SCALE_MAX = 0.75;
const w = (v: number) => `${(((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100).toFixed(0)}%`;
const BARS = [
  { label: "Market line", v: 0.718, focal: false },
  { label: "This model", v: 0.716, focal: true },
  { label: "Always pick home", v: 0.640, focal: false },
  { label: "Coin flip", v: 0.5, focal: false },
];

const GLOSSARY: [string, string][] = [
  [
    "XGBoost",
    "A gradient-boosted decision-tree model: it builds hundreds of small trees in sequence, each one correcting the errors of the last. It is the workhorse for tabular prediction problems like this one and handles non-linear interactions between features automatically.",
  ],
  [
    "point-in-time",
    "Every input is frozen as it stood before the game tipped off. Season form, ratings and roster strength are computed from games already played — never from the game being predicted or anything after it. This is what makes a backtest honest rather than a memory test.",
  ],
  [
    "data leakage",
    "When information that wouldn't have been available at prediction time sneaks into the features — e.g. using end-of-season ratings to 'predict' a November game. Leakage inflates backtest accuracy and is the single most common way sports models fool their builders. This pipeline is built specifically to avoid it.",
  ],
  [
    "walk-forward validation",
    "Instead of one train/test split, the model is retrained as time moves forward: to predict a given day, it trains only on prior seasons and the games already played that season. It mirrors exactly how the model would have been used live.",
  ],
  [
    "Brier score",
    "The mean squared error of a probability forecast: average of (probability − outcome)². Lower is better; 0 is perfect, 0.25 is a coin flip. It rewards being both right and appropriately confident.",
  ],
  [
    "AUC",
    "Area under the ROC curve: the chance that a randomly chosen winner was given a higher probability than a randomly chosen loser. 0.5 is no skill, 1.0 is perfect ranking. It measures ordering, independent of calibration.",
  ],
  [
    "calibration (ECE)",
    "Whether stated probabilities match reality: of the games called 70%, do about 70% actually happen? Expected Calibration Error is the average gap between predicted and observed rates across probability bins — smaller is better.",
  ],
  [
    "vig",
    "The bookmaker's built-in margin: turn a book's odds into probabilities and they sum to more than 100%. To compare the model and the market fairly, that excess is stripped out and the two sides rescaled to a clean 100% — the 'vig-free' line used throughout.",
  ],
];

const CAVEATS: [string, string][] = [
  [
    "The market is a hard baseline.",
    "On the games with odds, the closing line edges the model on raw accuracy. The model's value is in specific spots where it disagrees with the book — not in beating the line everywhere.",
  ],
  [
    "Probabilities, not prophecies.",
    "A 70% favourite still loses about three times in ten. A wrong call on a confident game is usually variance, not a broken model.",
  ],
  [
    "Two seasons is a finite sample.",
    "Roughly 11,000 games is a solid test, but two seasons of college basketball still carry real year-to-year variation. Treat small edges as noise.",
  ],
  [
    "Some things aren't modelled.",
    "Injuries beyond what roster availability captures, coaching changes, in-game momentum and motivation never enter the math. This is a calibrated baseline, not the final word.",
  ],
];

/* ---- helpers ---------------------------------------------------------- */

function Formula({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mthd-formula">
      <code>{children}</code>
      {note && <span className="mthd-formula-note">{note}</span>}
    </div>
  );
}

/* ---- page ------------------------------------------------------------- */

export default function MethodPage() {
  return (
    <>
      {/* Hero ----------------------------------------------------------- */}
      <Card
        className="span-2 mthd-hero"
        eyebrow="How it works"
        title="A win-probability model for college basketball — and a backtest built to be honest."
        prose
      >
        <div className="mthd-lede">
          <p>
            This model predicts the winner of NCAA Division I men&apos;s
            basketball games. The harder problem isn&apos;t the prediction —
            it&apos;s proving the prediction would have worked. Sports models are
            notoriously easy to fool: feed them a little information from the
            future and last season&apos;s results look uncannily predictable.
          </p>
          <p>
            So the whole pipeline is built around one rule — every game is
            forecast using only what was known <em>before tip-off</em> — and the
            numbers on the overview page are the result: out-of-sample accuracy,
            calibration, and a head-to-head against the betting market across two
            complete seasons. This page explains how it&apos;s built and why the
            backtest can be trusted.
          </p>
        </div>
      </Card>

      {/* Pipeline diagram ---------------------------------------------- */}
      <Card
        className="span-2"
        eyebrow="The pipeline"
        title="Four stages, run forward through time."
        prose
        source="Each game is predicted as if live, then graded once it's played · read left to right"
      >
        <div className="mthd-flow">
          {FLOW.map((s, i) => (
            <Fragment key={s.n}>
              <div className="mthd-flow-step">
                <span className="mthd-flow-num">{s.n}</span>
                <span className="mthd-flow-name">{s.name}</span>
                <span className="mthd-flow-desc">{s.desc}</span>
              </div>
              {i < FLOW.length - 1 && <span className="mthd-flow-arrow">→</span>}
            </Fragment>
          ))}
        </div>
      </Card>

      {/* Step 1 — point-in-time features (centerpiece) ----------------- */}
      <Card
        eyebrow="Step 1 · Features"
        title="Every feature is frozen as it stood before tip-off."
        prose
      >
        <div className="mthd-prose">
          <p>
            Each game is turned into <strong>44 features</strong> describing the
            two teams: prior-season efficiency and ranking, running form within
            the current season (win rate, scoring margin, last-ten record,
            strength of schedule), eligibility-adjusted <strong>roster
            strength</strong>, home court, and travel distance and time-zone
            shift.
          </p>
          <p>
            The critical detail is <strong>when</strong> each number is measured.
            Season-form features are computed by stepping through games in
            chronological order and locking each game&apos;s features{" "}
            <em>before</em> updating the running totals — so a November game only
            ever sees October&apos;s games, never March&apos;s. Roster strength
            blends prior-season player ratings with a Bayesian update as the
            season unfolds. Nothing from the game being predicted, or any later
            game, can touch its features.
          </p>
          <p>
            This is the guard against <strong>data leakage</strong> — the most
            common way a sports backtest quietly cheats. Get this wrong and the
            accuracy on this site would be fiction.
          </p>
        </div>
      </Card>

      {/* Step 2 — the model -------------------------------------------- */}
      <Card
        eyebrow="Step 2 · The model"
        title="An XGBoost classifier, predicted from both sides and averaged."
        prose
      >
        <div className="mthd-prose">
          <p>
            The features feed an <strong>XGBoost</strong> gradient-boosted tree
            model that outputs a single number: the probability the home team
            wins. Trees handle the non-linear interactions between ratings, form
            and context without hand-built rules.
          </p>
          <p>
            One subtlety: a model can develop a small bias toward whichever side
            is labelled &quot;team A.&quot; To cancel it, each game is predicted{" "}
            <strong>twice</strong> — once as listed and once with the teams
            swapped — and the two are averaged. This{" "}
            <strong>symmetric prediction</strong> removes positional bias and
            measurably improved the scores.
          </p>
          <Formula note="p_swap = the model run with the two teams exchanged">
            p(home) = ½ · [ p(home) + (1 − p_swap) ]
          </Formula>
        </div>
      </Card>

      {/* Step 3 — walk-forward ----------------------------------------- */}
      <Card
        eyebrow="Step 3 · Walk-forward backtest"
        title="The model is retrained every day, on the past only."
        prose
      >
        <div className="mthd-prose">
          <p>
            Rather than train once and test on a held-out chunk, the backtest{" "}
            <strong>walks forward through the calendar</strong>. To predict a
            given day&apos;s games, the model is retrained on all prior seasons
            plus every game already played that season — and nothing after. The
            next day, that day&apos;s results join the training set and the model
            retrains again.
          </p>
          <p>
            This mirrors exactly how the model would have been used in real time,
            and it&apos;s why each of the ~11,000 predictions is genuinely{" "}
            <strong>out-of-sample</strong>. The trade-off is cost — hundreds of
            model fits instead of one — but it&apos;s the only way to get an
            accuracy number you can believe.
          </p>
        </div>
      </Card>

      {/* Validation bars ----------------------------------------------- */}
      <Card
        className="span-2"
        eyebrow="Validation"
        title="Out-of-sample, the model clears the naive baselines and runs close to the market."
        prose
        source="Win-prediction accuracy · 2025 + 2026 seasons (~11,000 games) · point-in-time, walk-forward · market = vig-free closing line on the subset with odds"
      >
        <div className="mthd-prose mthd-prose--wide">
          <p>
            The honest scoreboard: the model beats &quot;always pick the home
            team&quot; and a coin flip comfortably, and lands just behind the
            betting market&apos;s closing line on the games where odds exist. The
            market is a famously efficient baseline — running step-for-step with
            it out-of-sample is the real result here.
          </p>
        </div>
        <div className="mthd-bars">
          {BARS.map((b) => (
            <div className="mthd-bar-row" key={b.label}>
              <span className="mthd-bar-label">{b.label}</span>
              <span className="mthd-bar-track">
                <span
                  className={`mthd-bar-fill ${b.focal ? "focal" : ""}`}
                  style={{ width: w(b.v) }}
                />
              </span>
              <span className="mthd-bar-val num">{(b.v * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <p className="mthd-note">
          <span className="mthd-trunc">≋</span> Scale starts at 45%, not 0 ·
          longer is better. Accuracy is the share of games where the
          higher-probability side won. The market and the model are measured on
          the same subset of games that carry odds.
        </p>
      </Card>

      {/* How it's built ------------------------------------------------- */}
      <Card
        className="span-2"
        eyebrow="How it's built"
        title="A reproducible pipeline — and this dashboard only ever reads its published output."
        prose
        source="The model lives in a separate repo; the dashboard renders the aggregated backtest it publishes"
      >
        <div className="mthd-arch">
          <div className="mthd-arch-node">
            <span className="mthd-arch-k">Ingest</span>
            <span className="mthd-arch-name">ESPN + Barttorvik</span>
            <span className="mthd-arch-desc">
              Games, scores, team efficiency and player data into a SQLite
              warehouse.
            </span>
          </div>
          <span className="mthd-arch-arrow">→</span>
          <div className="mthd-arch-node">
            <span className="mthd-arch-k">Model</span>
            <span className="mthd-arch-name">Python + XGBoost</span>
            <span className="mthd-arch-desc">
              Point-in-time features, walk-forward retraining, symmetric
              prediction.
            </span>
          </div>
          <span className="mthd-arch-arrow">→</span>
          <div className="mthd-arch-node">
            <span className="mthd-arch-k">Publish</span>
            <span className="mthd-arch-name">JSON blobs</span>
            <span className="mthd-arch-desc">
              The backtest aggregated into six small files — no raw data leaves
              the model repo.
            </span>
          </div>
          <span className="mthd-arch-arrow">→</span>
          <div className="mthd-arch-node">
            <span className="mthd-arch-k">Serve</span>
            <span className="mthd-arch-name">This dashboard</span>
            <span className="mthd-arch-desc">
              A Next.js front end renders the published backtest.
            </span>
          </div>
        </div>
        <div className="mthd-stack">
          {["Python", "XGBoost", "SQLite", "Next.js", "TypeScript", "Vercel"].map(
            (t) => (
              <span className="mthd-chip" key={t}>
                {t}
              </span>
            ),
          )}
        </div>
        <p className="mthd-note">
          The whole system is hand-built: the data warehouse, the feature
          engineering, the walk-forward backtest harness, the publish step and
          this dashboard — the same data-modelling, pipeline and visualisation
          work that sits behind any production analytics system.
        </p>
      </Card>

      {/* Limits -------------------------------------------------------- */}
      <Card eyebrow="Limits" title="What it can't do." prose>
        <div className="mthd-defs">
          {CAVEATS.map(([t, d]) => (
            <div className="mthd-def" key={t}>
              <span className="mthd-def-term">{t}</span>
              <span className="mthd-def-body">{d}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Glossary ------------------------------------------------------ */}
      <Card eyebrow="Key terms" title="A quick statistical glossary." prose>
        <div className="mthd-defs">
          {GLOSSARY.map(([t, d]) => (
            <div className="mthd-def" key={t}>
              <span className="mthd-def-term mthd-def-term--mono">{t}</span>
              <span className="mthd-def-body">{d}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer note --------------------------------------------------- */}
      <Card className="span-2 mthd-foot" prose>
        <p className="mthd-note">
          Built by Isaac Kaczor. The model and this dashboard are independent
          hobby work — not affiliated with the NCAA or any betting operator.
          Forecasts are for interest and discussion only.
        </p>
      </Card>
    </>
  );
}
