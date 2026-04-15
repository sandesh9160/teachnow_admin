"use client";

import React from "react";
import { X, Save } from "lucide-react";
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
  const [form, setForm] = React.useState<Plan | null>(plan);

  React.useEffect(() => {
    setForm(plan);
  }, [plan]);

  if (!isOpen || !form) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Edit Plan</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Plan Name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            />
          </Field>
          <Field label="Slug">
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            />
          </Field>
          <Field label="Price">
            <input
              type="number"
              value={Number(form.price || 0)}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            />
          </Field>
          <Field label="Offer Price">
            <input
              type="number"
              value={Number(form.offer_price || 0)}
              onChange={(e) => setForm({ ...form, offer_price: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            />
          </Field>
          <Field label="Validity Days">
            <input
              type="number"
              value={Number(form.validity_days || 0)}
              onChange={(e) => setForm({ ...form, validity_days: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            />
          </Field>
          <Field label="Job Posts Limit">
            <input
              type="number"
              value={Number(form.job_posts_limit || 0)}
              onChange={(e) => setForm({ ...form, job_posts_limit: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            />
          </Field>
          <Field label="Job Live Days">
            <input
              type="number"
              value={Number(form.job_live_days || 0)}
              onChange={(e) => setForm({ ...form, job_live_days: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            />
          </Field>
          <Field label="Featured Jobs Limit">
            <input
              type="number"
              value={Number(form.featured_jobs_limit || 0)}
              onChange={(e) => setForm({ ...form, featured_jobs_limit: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Features (one per line)">
              <textarea
                rows={4}
                value={(form.features || []).join("\n")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    features: e.target.value
                      .split("\n")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10 resize-none"
              />
            </Field>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className={clsx(
              "h-9 px-4 rounded-lg text-[12px] font-bold text-white transition-all flex items-center gap-1.5",
              saving ? "bg-violet-300 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"
            )}
          >
            <Save size={13} />
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
        {label}
      </span>
      {children}
    </label>
  );
}

