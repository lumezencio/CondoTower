"use client";
import React, { useEffect, useState } from "react";

/** Fundo padrão Condotech (gradiente + pattern de "+")
 *  - prefs opcionais via localStorage (contentMax, uiScale, gridMin)
 */
export default function AppBackground({
  children,
  patternOpacity = 0.10,
}: {
  children?: React.ReactNode;
  patternOpacity?: number;
}) {
  const [prefs, setPrefs] = useState<{ contentMax: string | null; uiScale: number; gridMin: string | null; }>({
    contentMax: null, uiScale: 1, gridMin: null,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ui.prefs");
      if (raw) {
        const p = JSON.parse(raw);
        setPrefs({
          contentMax: p.contentMax || null,
          uiScale: typeof p.uiScale === "number" ? p.uiScale : 1,
          gridMin: p.gridMin || null,
        });
      }
    } catch {}
  }, []);

  const plusPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  const defaultContentMax = "clamp(320px, 100vw, 1600px)";
  const defaultGridMin = "240px";

  return (
    <div
      className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-dvh w-full overflow-y-auto overflow-x-hidden"
      style={{
        // @ts-ignore CSS vars
        "--content-max": prefs.contentMax || defaultContentMax,
        "--ui-scale": prefs.uiScale ?? 1,
        "--grid-min": prefs.gridMin || defaultGridMin,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: plusPattern, backgroundRepeat: "repeat", opacity: patternOpacity }}
      />
      <div
        className="relative origin-top mx-auto w-full min-h-dvh pb-[env(safe-area-inset-bottom)]"
        style={{
          transform: "scale(var(--ui-scale))",
          width: "calc(100% / var(--ui-scale))",
        }}
      >
        {children}
      </div>
    </div>
  );
}
