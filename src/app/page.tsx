import OverviewClient from "./OverviewClient";
import { fetchBlob } from "@/lib/serverFetch";
import type {
  SummaryBlob,
  MonthlyBlob,
  CalibrationBlob,
  MarketBlob,
} from "@/lib/types";

export default async function Page() {
  // SSR-seed the small blobs (KPIs, charts, SEO). The large per-game table
  // (~3 MB) is fetched client-side from /api/data/games after mount so the
  // initial HTML stays light.
  const [summary, monthly, calibration, market] = await Promise.all([
    fetchBlob<SummaryBlob>("summary"),
    fetchBlob<MonthlyBlob>("monthly"),
    fetchBlob<CalibrationBlob>("calibration"),
    fetchBlob<MarketBlob>("market"),
  ]);

  return (
    <OverviewClient
      summary={summary}
      monthly={monthly}
      calibration={calibration}
      market={market}
    />
  );
}
