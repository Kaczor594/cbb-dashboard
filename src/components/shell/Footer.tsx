/** Site-wide colophon. Subtle by design — there for anyone (a recruiter, a
 *  curious friend) who wants to know who built it and how. */
export default function Footer() {
  return (
    <footer className="site-foot span-2">
      <div className="site-foot-l">
        <span className="site-foot-name">Isaac Kaczor</span>
        <span className="site-foot-tag">
          A college-basketball prediction model — designed, backtested and run
          solo. Every figure here is out-of-sample.
        </span>
      </div>
      <div className="site-foot-r">
        <span className="site-foot-stack">
          Python · XGBoost · SQLite · Next.js · TypeScript
        </span>
        <a
          className="site-foot-link"
          href="https://github.com/Kaczor594/cbb-prediction-model"
          target="_blank"
          rel="noreferrer"
        >
          Source ↗
        </a>
      </div>
    </footer>
  );
}
