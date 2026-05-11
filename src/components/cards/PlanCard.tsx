"use client";

import React from "react";
import { clsx } from "clsx";
import { Check, Pencil, Zap, Star, Crown, Gift, Briefcase, Calendar } from "lucide-react";
import type { Plan } from "@/types";

interface PlanCardProps {
  plan: Plan;
  isEditing?: boolean;
  onEdit?: (plan: Plan) => void;
  onSave?: (plan: Plan) => void;
  onCancel?: () => void;
  onToggleStatus?: (plan: Plan) => void;
}

const getPlanTheme = (slug: string) => {
  const iconClass = "transition-transform group-hover:rotate-12 duration-500";
  switch (slug) {
    case "basic": return { icon: <Zap size={10} className={iconClass} />, color: "text-blue-600", bg: "bg-white", border: "border-slate-200", accent: "blue" };
    case "professional": return { icon: <Star size={10} className={iconClass} />, color: "text-blue-600", bg: "bg-white", border: "border-slate-200", accent: "blue" };
    case "enterprise": return { icon: <Crown size={10} className={iconClass} />, color: "text-blue-600", bg: "bg-white", border: "border-slate-200", accent: "blue" };
    default: return { icon: <Gift size={10} className={iconClass} />, color: "text-slate-600", bg: "bg-white", border: "border-slate-200", accent: "slate" };
  }
};

export default function PlanCard({
  plan,
  onEdit,
  onToggleStatus
}: PlanCardProps) {
  const theme = getPlanTheme(plan.slug || 'default');

  return (
    <div
      className={clsx(
        "relative rounded-lg border border-slate-200 transition-all duration-300 bg-white overflow-hidden flex flex-col group shadow-sm hover:shadow-md",
        (plan.is_highlighted === 1 || plan.is_highlighted === true) ? "border-blue-500 ring-1 ring-blue-500" : ""
      )}
    >
      {(plan.is_highlighted === 1 || plan.is_highlighted === true) ? (
        <div className="bg-[#2563EB] py-1 text-center">
          <span className="text-[11px] font-bold text-white tracking-wide">
            Most Popular
          </span>
        </div>
      ) : (
        <div className="py-4"></div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className={clsx(
            "w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-all shadow-sm",
            theme.bg, theme.color, theme.border
          )}>
            {React.cloneElement(theme.icon as React.ReactElement<any>, { size: 16 })}
          </div>
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-slate-900 leading-none tracking-tight">{plan.name}</h3>
            <p className="text-[11px] font-medium text-slate-900 mt-1 leading-tight line-clamp-1">{(plan as any).description || `Subscription tier for ${plan.name}`}</p>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">₹{Number(plan.offer_price ?? plan.price ?? 0).toLocaleString()}</span>
            {(plan.actual_price !== null && plan.actual_price !== undefined && plan.actual_price !== "") && Number(plan.actual_price) > Number(plan.offer_price) && (
              <span className="text-[14px] font-bold text-slate-300 line-through">₹{Number(plan.actual_price).toLocaleString()}</span>
            )}
            <span className="text-[12px] font-bold text-slate-900">/ {plan.duration || 'month'}</span>
          </div>
        </div>

        {/* Plan Configuration Metrics */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 mb-8 p-4 rounded-md border border-slate-400 bg-slate-50/20">
          <div className="flex items-center gap-2">
            <Briefcase size={12} className="text-blue-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-900 leading-none">Job Posting Limit</p>
              <p className="text-[12px] font-bold text-slate-700 leading-tight mt-0.5">{plan.job_posts_limit || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star size={12} className="text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-900 leading-none">Featured Jobs</p>
              <p className="text-[12px] font-bold text-slate-700 leading-tight mt-0.5">{plan.featured_jobs_limit || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-emerald-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-900 leading-none">Validity</p>
              <p className="text-[12px] font-bold text-slate-700 leading-tight mt-0.5">{plan.validity_days || 0} Days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={12} className={clsx(plan.job_live_days ? "text-rose-500" : "text-slate-300")} />
            <div>
              <p className="text-[10px] font-bold text-slate-900 leading-none">Live For</p>
              <p className="text-[12px] font-bold text-slate-700 leading-tight mt-0.5">{plan.job_live_days || 0} Days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Crown size={12} className="text-purple-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-900 leading-none">Feature Days</p>
              <p className="text-[12px] font-bold text-slate-700 leading-tight mt-0.5">{plan.feature_days || 0} Days</p>
            </div>
          </div>
        </div>

        {/* Feature Checklist */}
        <div className="flex-1 space-y-2.5 mb-6">
          <div className="space-y-2.5">
            {(plan.features ?? []).map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 group/feat">
                <div className="w-4 h-4 rounded-full bg-white border border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={10} className="text-emerald-500" strokeWidth={3} />
                </div>
                <span className="text-[12px] font-medium text-slate-900 leading-tight group-hover/feat:text-slate-900 transition-colors tracking-tight">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        {/* <div className="mb-4">
          <button className={clsx(
            "w-full py-2.5 rounded-lg text-[13px] font-bold transition-all active:scale-[0.98]",
            plan.is_highlighted
              ? "bg-[#2563EB] text-white hover:bg-blue-700"
              : "bg-[#F3F4F6] text-slate-900 hover:bg-slate-200 border border-slate-100"
          )}>
            Get Started
          </button>
        </div> */}

        {/* Administrative Actions */}
        <div className="pt-6 border-t border-slate-200 space-y-4 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEdit?.(plan)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all active:scale-95 border border-amber-100"
              >
                <Pencil size={12} /> Edit
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={clsx("text-[10px] font-bold tracking-wider", plan.is_active ? "text-emerald-500" : "text-slate-300")}>
                {plan.is_active ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => onToggleStatus?.(plan)}
                className={clsx(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                  plan.is_active ? "bg-emerald-500" : "bg-slate-200"
                )}
              >
                <span
                  className={clsx(
                    "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                    plan.is_active ? "translate-x-5" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

