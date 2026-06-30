"use client";

import { useEffect, useRef, useState } from "react";

/** Poll a /api/data/<file> JSON endpoint every `intervalMs`, pausing while
 *  the tab is hidden. Keeps the last good payload on transient failures.
 *  `initialData` seeds the first render from server-rendered SSR so the
 *  page paints real content before the first client fetch resolves. */
export function usePolledJson<T>(
  file: string,
  initialData: T | null = null,
  intervalMs = 60_000,
) {
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch(`/api/data/${file}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as T;
        if (alive) {
          setData(j);
          setError(null);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      }
    };
    load();
    timer.current = setInterval(load, intervalMs);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [file, intervalMs]);

  return { data, error };
}
