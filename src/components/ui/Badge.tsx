"use client";

import React from "react";
import { clsx } from "clsx";
import type { BadgeVariant } from "@/types";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-accent-100 text-accent-600",
  warning: "bg-warning-50 text-warning-500",
  danger: "bg-danger-50 text-danger-500",
  info: "bg-primary-100 text-primary-600",
  default: "bg-surface-100 text-surface-600",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-accent-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  info: "bg-primary-500",
  default: "bg-surface-400",
};

export default function Badge({
  variant = "default",
  children,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold",
        variantStyles[variant]
      )}
    >
      {dot && (
        <span className={clsx("w-1.5 h-1.5 rounded-full", dotStyles[variant])} />
      )}
      {children}
    </span>
  );
}
