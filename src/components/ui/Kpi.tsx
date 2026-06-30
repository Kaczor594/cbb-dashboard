/** KPI stat per the kit: mono tabular value, demoted unit, gray context
 *  sparkline — accent only when the KPI's color IS the message. */
export function Spark({
  data,
  accent = false,
}: {
  data: number[];
  accent?: boolean;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 100;
  const h = 30;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 2) - 1}`,
    )
    .join(" ");
  return (
    <svg width={w} height={h} className="spark" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        fill="none"
        stroke={accent ? "var(--chart-negative)" : "var(--chart-context)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

export function Kpi({
  label,
  value,
  unit,
  delta,
  tone,
  spark,
  sparkAccent,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  tone?: "pos" | "neg";
  spark?: number[];
  sparkAccent?: boolean;
}) {
  return (
    <div className="kpi">
      <div className="eyebrow">{label}</div>
      <div className="kpi-mid">
        <div className={`kpi-val ${tone ?? ""}`}>
          {value}
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>
        {spark && <Spark data={spark} accent={sparkAccent} />}
      </div>
      {delta && <div className="kpi-delta">{delta}</div>}
    </div>
  );
}
