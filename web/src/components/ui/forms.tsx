"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

type Button3DProps = {
  className?: string;
  children: React.ReactNode;
} & Omit<HTMLMotionProps<"button">, "children">;

export function Button3D({ className, children, ...props }: Button3DProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }} whileTap={{ y: 0 }}
      className={clsx(
        "w-full h-12 rounded-2xl font-semibold text-white",
        "bg-gradient-to-r from-blue-600 to-indigo-600",
        "shadow-[0_12px_24px_rgba(27,70,162,.35)] border border-white/10",
        "active:shadow-[0_8px_16px_rgba(27,70,162,.35)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Input({ label, ...props }:{ label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="mt-2 w-full h-12 px-4 rounded-xl bg-white border-2 border-slate-200
                   text-slate-900 placeholder-slate-400 focus:outline-none
                   focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        {...props}
      />
    </label>
  );
}
