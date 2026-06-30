# cbb-dashboard

Public dashboard for a college-basketball (NCAA D-I) win-prediction model — an
**out-of-sample backtest** across two complete seasons (2025 + 2026, ~11,000
games). Sibling of [wc26-dashboard](https://github.com/Kaczor594/wc26-dashboard);
reuses the same kaczor-design system and Next.js architecture.

The model itself lives in
[cbb-prediction-model](https://github.com/Kaczor594/cbb-prediction-model); this
repo is the frontend only.

## Pages

- **Overview** — KPIs (accuracy, Brier, log-loss, AUC, vs-market), accuracy by
  month, a calibration curve, a model-vs-market comparison by edge bucket,
  notable conviction (upset) calls, and a sortable/filterable per-game log.
- **Method** — how the model works: point-in-time features, the XGBoost +
  symmetric-prediction model, walk-forward backtesting, and why every figure is
  leak-free / out-of-sample.

## Architecture

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Recharts.
- **Static data**: six JSON blobs in `public/data/` produced by the publisher in
  the model repo (`scripts/publish_dashboard.py`). The small blobs are SSR-seeded
  for instant KPIs/charts + SEO; the ~3 MB per-game blob is lazy-loaded
  client-side from `/api/data/games`.
- `src/lib/dataSource.ts` is the single source of truth for the data origin. By
  default it reads local `public/data/`; set `DATA_BASE_URL` to flip both the SSR
  seed and the API route to a remote bucket without touching any page.
- Design system vendored at `src/styles/tokens.css` + `src/app/globals.css`.

## Refresh the data

From the model repo:

```bash
cd ../cbb-prediction-model && source .venv/bin/activate
python scripts/publish_dashboard.py --out ../cbb-dashboard/public/data
```

## Develop

```bash
npm install
npm run dev      # http://localhost:3000 (falls back to 3001)
npm run build
```
