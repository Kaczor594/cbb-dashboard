/** Two-way home/away micro-stack (the model is binary — no draw segment).
 *  Reuses the kit's `.prob-bar .ph` (moss) / `.pa` (terracotta); the `.pd`
 *  draw segment simply goes unused. The `context` variant (market) is all-gray
 *  per the context-series rule. */
export function ProbBar({
  pHome,
  context = false,
  showNums = true,
}: {
  pHome: number;
  context?: boolean;
  showNums?: boolean;
}) {
  const home = Math.max(0, Math.min(1, pHome));
  const away = 1 - home;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className={`prob-bar ${context ? "ctx" : ""}`}>
        <i className="ph" style={{ width: `${home * 100}%` }} />
        <i className="pa" style={{ width: `${away * 100}%` }} />
      </div>
      {showNums && (
        <span className="prob-nums">
          {Math.round(home * 100)}·{Math.round(away * 100)}
        </span>
      )}
    </div>
  );
}
