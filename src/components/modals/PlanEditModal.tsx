"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Save, CreditCard, Tag, Calendar, 
  Briefcase, Zap, Star, List, Settings2,
  Loader2, BadgePercent, ShieldCheck, ListOrdered
} from "lucide-react";
import { clsx } from "clsx";
import type { Plan } from "@/types";

interface PlanEditModalProps {
  isOpen: boolean;
  plan: Plan | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (data: Plan) => void;
}

export default function PlanEditModal({
  isOpen,
  plan,
  saving = false,
  onClose,
  onSave,
}: PlanEditModalProps) {
  const [form, setForm] = useState<Plan | null>(null);

  useEffect(() => {
    if (plan) setForm({ ...plan });
  }, [plan]);

  if (!isOpen || !form) return null;

  const handleChange = (field: keyof Plan, value: any) => {
    setForm(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 antialiased">
        <div className="absolute inset-0 bg-slate-900/10 animate-in fade-in duration-300" onClick={onClose} />
        
        <div className="relative w-full max-w-[560px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            {/* ─── Header ────────────────────────────────────────────── */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-blue-200 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                        <Settings2 size={20} className="relative z-10" />
                    </div>
                    <div>
                        <h3 className="text-[17px] font-bold text-slate-900 leading-tight">
                            {form.id ? "Edit Plan Settings" : "Create New Plan"}
                        </h3>
                        <p className={clsx("text-[12px] font-semibold", form.id ? "text-blue-500" : "text-emerald-500")}>
                            {form.id ? `Updating: ${form.name}` : "Configure your new subscription tier"}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* ─── Body ─────────────────────────────────────────────── */}
            <div className="p-6 max-h-[65vh] overflow-y-auto no-scrollbar space-y-5">
                {/* Plan Identity */}
                <div className="space-y-4">
                    <SmartField label="Plan Name" icon={Tag}>
                        <input
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[14px] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                            placeholder="Basic Silver"
                        />
                    </SmartField>

                    <div className="grid grid-cols-2 gap-4">
                        <SmartField label="Actual Price" icon={CreditCard}>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-400">₹</span>
                                <input
                                    type="number"
                                    value={form.actual_price || form.price || 0}
                                    onChange={(e) => handleChange("actual_price", e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-4 py-2 text-[14px] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                                />
                            </div>
                        </SmartField>

                        <SmartField label="Offer Price" icon={BadgePercent}>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-blue-500">₹</span>
                                <input
                                    type="number"
                                    value={form.offer_price || 0}
                                    onChange={(e) => handleChange("offer_price", e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-4 py-2 text-[14px] font-bold text-blue-600 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                                />
                            </div>
                        </SmartField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SmartField label="Job Posts Limit" icon={Briefcase}>
                            <input
                                type="number"
                                value={form.job_posts_limit || 0}
                                onChange={(e) => handleChange("job_posts_limit", Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[14px] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                            />
                        </SmartField>

                        <SmartField label="Featured Jobs" icon={Star}>
                            <input
                                type="number"
                                value={form.featured_jobs_limit || 0}
                                onChange={(e) => handleChange("featured_jobs_limit", Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[14px] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                            />
                        </SmartField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SmartField label="Validity (Days)" icon={Calendar}>
                            <input
                                type="number"
                                value={form.validity_days || 0}
                                onChange={(e) => handleChange("validity_days", Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[14px] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                            />
                        </SmartField>

                        <SmartField label="Live Duration" icon={Zap}>
                            <input
                                type="number"
                                value={form.job_live_days || 0}
                                onChange={(e) => handleChange("job_live_days", Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[14px] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                            />
                        </SmartField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SmartField label="Feature Days" icon={Calendar}>
                            <input
                                type="number"
                                value={form.feature_days || 0}
                                onChange={(e) => handleChange("feature_days", Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[14px] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                                placeholder="0"
                            />
                        </SmartField>

                        <SmartField label="Display Order" icon={ListOrdered}>
                            <input
                                type="number"
                                value={form.display_order || 0}
                                onChange={(e) => handleChange("display_order", Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[14px] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
                                placeholder="0"
                            />
                        </SmartField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                                    <ShieldCheck size={16} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-slate-900">Featured</p>
                                    <p className="text-[11px] text-blue-600 font-medium">Institution list</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange("company_featured", form.company_featured ? 0 : 1)}
                                className={clsx(
                                    "w-10 h-5 rounded-full relative transition-colors duration-200 outline-none",
                                    form.company_featured ? "bg-blue-600" : "bg-slate-300"
                                )}
                            >
                                <div className={clsx(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200",
                                    form.company_featured ? "translate-x-6" : "translate-x-1"
                                )} />
                            </button>
                        </div>

                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                                    <Star size={16} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-slate-900">Highlighted</p>
                                    <p className="text-[11px] text-amber-600 font-medium">Most popular tag</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange("is_highlighted", !form.is_highlighted)}
                                className={clsx(
                                    "w-10 h-5 rounded-full relative transition-colors duration-200 outline-none",
                                    form.is_highlighted ? "bg-amber-500" : "bg-slate-300"
                                )}
                            >
                                <div className={clsx(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200",
                                    form.is_highlighted ? "translate-x-6" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                    </div>

                    <SmartField label="Plan Features" icon={List}>
                        <textarea
                            rows={3}
                            value={(form.features || []).join("\n")}
                            onChange={(e) =>
                                handleChange("features", e.target.value.split("\n"))
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-[13px] font-bold text-slate-600 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none resize-none leading-relaxed"
                            placeholder="Benefit 1&#10;Benefit 2..."
                        />
                    </SmartField>
                </div>
            </div>

            {/* ─── Footer ─────────────────────────────────────────────── */}
            <div className="px-6 py-4 bg-white border-t border-slate-50 flex items-center justify-end gap-5">
                <button
                    onClick={onClose}
                    className="text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(form)}
                    disabled={saving}
                    className="h-11 px-8 bg-[#2563EB] text-white rounded-lg text-[13px] font-bold shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center gap-2 group disabled:opacity-50"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    </div>
  );
}

function SmartField({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[13px] font-bold text-slate-400 flex items-center gap-2 px-1">
        <Icon size={16} className="text-blue-500" /> {label}
      </label>
      {children}
    </div>
  );
}


