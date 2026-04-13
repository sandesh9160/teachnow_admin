"use client";

import React from "react";
import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  gradient,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="animate-fade-in-up bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-card-hover transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="text-2xl font-bold text-surface-900 tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center gap-1.5">
              {changeType === "positive" && (
                <TrendingUp size={14} className="text-accent-500" />
              )}
              {changeType === "negative" && (
                <TrendingDown size={14} className="text-danger-500" />
              )}
              {changeType === "neutral" && (
                <Minus size={14} className="text-surface-400" />
              )}
              <span
                className={clsx(
                  "text-xs font-semibold",
                  changeType === "positive" && "text-accent-500",
                  changeType === "negative" && "text-danger-500",
                  changeType === "neutral" && "text-surface-400"
                )}
              >
                {change}
              </span>
              <span className="text-xs text-surface-400">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="skeleton w-24 h-4" />
          <div className="skeleton w-16 h-7" />
          <div className="skeleton w-32 h-3" />
        </div>
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
}
