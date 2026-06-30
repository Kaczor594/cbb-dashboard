import type { ReactNode } from "react";

/** Kit card: no border, shadow elevation, mono-caps eyebrow owns the top
 *  edge, title is a claim (finding-first) when `prose` is set. */
export function Card({
  eyebrow,
  title,
  prose = false,
  sub,
  right,
  source,
  className = "",
  children,
}: {
  eyebrow?: string;
  title?: string;
  prose?: boolean;
  sub?: string;
  right?: ReactNode;
  source?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`card ${className}`}>
      {(eyebrow || title || right) && (
        <div className="card-head">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            {title && (
              <div className={prose ? "card-title--prose" : "card-title"}>
                {title}
              </div>
            )}
            {sub && <div className="card-sub">{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
      {source && <div className="chart-source">{source}</div>}
    </section>
  );
}

export function Empty({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
    </div>
  );
}
