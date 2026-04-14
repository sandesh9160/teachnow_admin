"use client";

import React from "react";
import { clsx } from "clsx";
import type { BadgeVariant } from "@/types";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  warning: "bg-amber-50 text-amber-600 border border-amber-200",
  danger: "bg-rose-50 text-rose-600 border border-rose-200",
  info: "bg-blue-50 text-blue-600 border border-blue-200",
  indigo: "bg-indigo-50 text-indigo-600 border border-indigo-200",
  purple: "bg-purple-50 text-purple-600 border border-purple-200",
  rose: "bg-rose-50 text-rose-600 border border-rose-200",
  cyan: "bg-cyan-50 text-cyan-600 border border-cyan-200",
  default: "bg-surface-100 text-surface-600 border border-surface-200",
};

const dotStyles: Record<string, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-blue-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  default: "bg-surface-400",
};

export default function Badge({
  variant = "default",
  children,
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-tight transition-colors",
        variantStyles[variant as string] || variantStyles.default,
        className
      )}
    >
      {dot && (
        <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-slow", dotStyles[variant as string] || dotStyles.default)} />
      )}
      {children}
    </span>
  );
}
