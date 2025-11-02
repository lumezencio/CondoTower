"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

export function Button3D({ className, children, ...props }:{ className?:string; children:React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 0 }}
      className={clsx(
        "w-full h-12 rounded-2xl font-medium text-white",
        "bg-gradient-to-b from-indigo-500 to-indigo-600",
        "shadow-[0_8px_16px_rgba(0,0,0,.25)] border border-white/10",
        "active:shadow-[0_6px_12px_rgba(0,0,0,.28)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
