"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Mail, Loader2, Type, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";
import type { EmailTemplate } from "@/types";
import { useMemo } from "react";

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EmailTemplate>) => Promise<void>;
  template?: EmailTemplate;
}

export default function EmailTemplateModal({ isOpen, onClose, onSave, template }: EmailTemplateModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    name: "",
    slug: "",
    subject: "",
    body: "",
    is_active: 1,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        slug: template.slug,
        subject: template.subject,
        body: template.body,
        is_active: template.is_active,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        subject: "",
        body: "",
        is_active: 1,
      });
    }
  }, [template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {template ? "Edit Email Template" : "Create New Template"}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {template 
                ? `Customize the message and subject for "${template.name}"`
                : "Configure a new automated system email workflow"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Status Toggle in Modal */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className={clsx(
              "text-[10px] font-bold uppercase tracking-wider",
              formData.is_active ? "text-emerald-600" : "text-slate-400"
            )}>
              {formData.is_active ? "Active" : "Disabled"}
            </span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: prev.is_active ? 0 : 1 }))}
              className={clsx(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors outline-none",
                formData.is_active ? "bg-emerald-500" : "bg-slate-300"
              )}
            >
              <span
                className={clsx(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                  formData.is_active ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center shadow-sm"
          >
            <X size={16} className="mr-2" /> Cancel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8">
        <form id="templateForm" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Template Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Welcome Email"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Unique Slug <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                disabled={!!template}
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                placeholder="e.g. welcome_email"
                className={clsx(
                  "w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold outline-none transition-all font-semibold",
                  template ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                )}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Email Subject Line <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Subject seen by recipient"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Email Body (Rich Text) <span className="text-rose-500">*</span></label>
            </div>
            {/* ─── Variables Reference ─────────────────────────────────────── */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-slate-800">
                <AlertCircle size={16} className="text-indigo-600" />
                <span className="text-[11px] font-semibold uppercase tracking-tight">Available System Variables</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mb-3 uppercase tracking-wider">You can use these dynamic placeholders in your email content:</p>
              <div className="flex flex-wrap gap-2">
                {["{name}", "{job_title}", "{user_name}", "{reset_link}", "{company_name}", "{id}"].map(v => (
                  <span key={v} className="px-2 py-1 bg-white border border-slate-200 text-indigo-600 font-semibold text-[11px] rounded transition-all select-all hover:border-indigo-300 shadow-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <TipTapEditor
              value={formData.body || ""}
              onChange={(body) => setFormData(prev => ({ ...prev, body }))}
              placeholder="Start writing the email body content..."
            />

          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/80">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
        >
          Discard Changes
        </button>
        <button
          type="submit"
          form="templateForm"
          disabled={loading}
          className={clsx(
            "px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-200 group",
            loading && "opacity-70 pointer-events-none"
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2 group-hover:scale-110 transition-transform" />
              {template ? "Update Template" : "Create Template"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
