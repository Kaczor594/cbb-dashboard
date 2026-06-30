import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Rail from "@/components/shell/Rail";
import Header from "@/components/shell/Header";
import Footer from "@/components/shell/Footer";
import { fetchBlob } from "@/lib/serverFetch";
import type { Meta } from "@/lib/types";

// viewport-fit=cover lets env(safe-area-inset-bottom) work on iOS so the
// bottom nav clears the home indicator.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cbb-dashboard.vercel.app"),
  title: "CBB model — backtest dashboard",
  description:
    "An XGBoost college-basketball prediction model, scored out-of-sample across two full seasons: accuracy, calibration and a head-to-head against the betting market.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const meta = await fetchBlob<Meta>("meta");
  return (
    <html lang="en">
      <body>
        <div className="construction-banner" role="status">
          <span className="cb-tag">Preview</span>
          <span className="cb-text">
            Built in the off-season — the model and data will be refreshed when the
            2026–27 season tips off in November.
          </span>
        </div>
        <div className="app">
          <Rail />
          <Header meta={meta} />
          <main className="main">
            {children}
            <Footer />
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
