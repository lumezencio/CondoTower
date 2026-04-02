"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastKind = "success" | "error" | "info" | "warning";
type ToastItem = { id: string; title: string; message?: string; kind?: ToastKind; };

const ToastCtx = createContext<{ push: (t: Omit<ToastItem,"id">) => void; } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem,"id">) => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    setItems((old) => [...old, { id, kind: "info", ...t }]);
    setTimeout(() => setItems((old) => old.filter(i => i.id !== id)), 4200);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 z-[9999] space-y-3 w-[92vw] max-w-sm">
        <AnimatePresence>
          {items.map(({ id, title, message, kind }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: -8, scale: .98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: .98 }}
              className={[
                "rounded-2xl border shadow-lg px-4 py-3 backdrop-blur bg-white/90",
                kind === "success" && "border-emerald-200",
                kind === "error" && "border-red-200",
                kind === "warning" && "border-amber-200",
                kind === "info" && "border-blue-200",
              ].filter(Boolean).join(" ")}
            >
              <div className="text-sm font-semibold text-slate-800">{title}</div>
              {message && <div className="text-xs text-slate-600 mt-0.5">{message}</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider/>");
  return ctx;
}
