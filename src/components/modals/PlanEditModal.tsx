"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Save, CreditCard, Tag, Calendar, 
  Briefcase, Zap, Star, List, Settings2,
  Loader2, BadgePercent
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 antialiased">
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
        
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden animate-in zoom-in-95 duration-300 border border-blue-50">
            {/* ─── Header ────────────────────────────────────────────── */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-blue-50/50 bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                        <Settings2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold text-slate-800">Edit Plan Settings</h3>
                        <p className="text-[11px] text-slate-400 font-medium tracking-tight">Updating: {form.name}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-blue-50 rounded-lg text-slate-300 hover:text-blue-600 transition-all">
                    <X size={20} />
                </button>
            </div>

            {/* ─── Body ─────────────────────────────────────────────── */}
            <div className="p-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                    
                    {/* Basic Group */}
                    <div className="col-span-2">
                        <SmartField label="Plan Name" icon={Tag}>
                            <input
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                                placeholder="Basic Silver"
                            />
                        </SmartField>
                    </div>

                    <SmartField label="Actual Price" icon={CreditCard}>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400">₹</span>
                            <input
                                type="number"
                                value={form.actual_price || form.price || 0}
                                onChange={(e) => handleChange("actual_price", e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-8 pr-4 py-2 text-[13px] font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                            />
                        </div>
                    </SmartField>

                    <SmartField label="Offer Price" icon={BadgePercent}>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-sky-500">₹</span>
                            <input
                                type="number"
                                value={form.offer_price || 0}
                                onChange={(e) => handleChange("offer_price", e.target.value)}
                                className="w-full bg-sky-50/20 border border-sky-100/50 rounded-xl pl-8 pr-4 py-2 text-[13px] font-bold text-sky-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                            />
                        </div>
                    </SmartField>

                    <SmartField label="Job Posts Limit" icon={Briefcase}>
                        <input
                            type="number"
                            value={form.job_posts_limit || 0}
                            onChange={(e) => handleChange("job_posts_limit", Number(e.target.value))}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                        />
                    </SmartField>

                    <SmartField label="Featured Jobs" icon={Star}>
                        <input
                            type="number"
                            value={form.featured_jobs_limit || 0}
                            onChange={(e) => handleChange("featured_jobs_limit", Number(e.target.value))}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                        />
                    </SmartField>

                    <SmartField label="Validity (Days)" icon={Calendar}>
                        <input
                            type="number"
                            value={form.validity_days || 0}
                            onChange={(e) => handleChange("validity_days", Number(e.target.value))}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                        />
                    </SmartField>

                    <SmartField label="Live Duration" icon={Zap}>
                        <input
                            type="number"
                            value={form.job_live_days || 0}
                            onChange={(e) => handleChange("job_live_days", Number(e.target.value))}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none"
                        />
                    </SmartField>

                    <div className="col-span-2 mt-2">
                        <SmartField label="Plan Features" icon={List}>
                            <textarea
                                rows={4}
                                value={(form.features || []).join("\n")}
                                onChange={(e) =>
                                    handleChange("features", e.target.value.split("\n").filter(Boolean))
                                }
                                className="w-full bg-slate-100/30 border border-slate-100 rounded-xl px-4 py-3 text-[12px] font-medium text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none resize-none leading-relaxed"
                                placeholder="Benefit 1&#10;Benefit 2..."
                            />
                        </SmartField>
                    </div>
                </div>
            </div>

            {/* ─── Footer ─────────────────────────────────────────────── */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                    onClick={onClose}
                    className="h-9 px-4 text-[12px] font-bold text-slate-400 hover:text-blue-600 transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(form)}
                    disabled={saving}
                    className="h-10 px-8 bg-blue-600 text-white rounded-xl text-[12px] font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 group disabled:opacity-50"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    </div>
  );
}

function SmartField({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2 px-1">
        <Icon size={12} className="text-blue-500" /> {label}
      </label>
      {children}
    </div>
  );
}


