// TS mirror of the blob contract produced by
// cbb-prediction-model/scripts/publish_dashboard.py (schema_version 1).
// The data is a STATIC, out-of-sample backtest (off-season) — no live polling.
// Change this file and the publisher together.

export interface Meta {
  generated_at: string; // ISO; when the publish script ran
  data_through: string; // ISO date of the last game in the backtest
  seasons: number[]; // e.g. [2025, 2026]
  schema_version: number; // 1
  counts: {
    games: number; // total scored games
    games_with_market: number; // games that had odds
  };
}

export interface SeasonMetrics {
  season: number | "all"; // 2025 | 2026 | "all"
  n: number;
  accuracy: number; // 0–1; predict home iff p >= 0.5
  brier: number; // mean (p − y)^2 on home-win prob
  log_loss: number; // mean −[y ln p + (1−y) ln(1−p)]
  auc: number; // ROC AUC of model_prob vs home_winner
  // market head-to-head on the subset that has odds (null if none)
  n_market: number;
  accuracy_market: number | null; // market's accuracy on that subset
  accuracy_model_on_market: number | null; // model accuracy on the same subset
  brier_market: number | null;
  brier_model_on_market: number | null;
}

export interface SummaryBlob {
  generated_at: string;
  overall: SeasonMetrics; // season = "all"
  by_season: SeasonMetrics[]; // [2025, 2026]
}

export interface MonthlyPoint {
  i: number; // ordinal x-axis index
  month: string; // "2025-11"
  label: string; // "Nov '25"
  season: number; // which season this month belongs to
  n: number;
  accuracy: number;
  brier: number;
}

export interface MonthlyBlob {
  generated_at: string;
  points: MonthlyPoint[];
}

export interface CalibrationBin {
  bin: number; // 0..9
  lo: number; // bin lower edge
  hi: number; // bin upper edge
  mid: number; // midpoint (x for the reliability curve)
  n: number; // games in bin
  predicted: number | null; // mean model_prob in bin
  actual: number | null; // empirical home-win rate in bin
}

export interface Calibration {
  bins: CalibrationBin[];
  ece: number; // expected calibration error
  n: number;
}

// Keyed by "all" | "2025" | "2026" so the season selector can switch views.
export interface CalibrationBlob {
  generated_at: string;
  seasons: Record<string, Calibration>;
}

export interface EdgeBucket {
  label: string; // e.g. "agree ±3%"
  model: number | null; // model accuracy in bucket
  market: number | null; // market accuracy in bucket
  n: number;
}

export interface Market {
  n: number; // games with odds
  model_accuracy: number | null;
  market_accuracy: number | null;
  model_brier: number | null;
  market_brier: number | null;
  edge_buckets: EdgeBucket[];
}

export interface MarketBlob {
  generated_at: string;
  seasons: Record<string, Market>;
}

export interface GameRow {
  game_id: number;
  date: string; // "2025-11-04"
  season: number;
  home: string; // team short_name
  away: string;
  home_score: number | null;
  away_score: number | null;
  model_prob: number; // P(home win)
  home_winner: 0 | 1;
  pred_home: boolean; // model_prob >= 0.5
  correct: boolean;
  market_prob: number | null; // vig-free P(home win), null if no odds
  market_correct: boolean | null;
  edge: number | null; // model_prob − market_prob (home frame)
  neutral_site: boolean;
  upset_call: boolean; // model backed the eventual winner against the market
}

export interface GamesBlob {
  generated_at: string;
  rows: GameRow[];
}
