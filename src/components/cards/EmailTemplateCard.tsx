"use client";

import React from "react";
import { Mail, Pencil, Clock } from "lucide-react";
import type { EmailTemplate } from "@/types";
import { clsx } from "clsx";

interface EmailTemplateCardProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
}

export default function EmailTemplateCard({ template, onEdit }: EmailTemplateCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200 flex flex-col h-full shrink-0">
      <div className="p-5 flex flex-col h-full">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0",
              template.is_active 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-slate-50 text-slate-400 border-slate-200"
            )}>
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-slate-900  group-hover:text-indigo-600 transition-colors" title={template.name}>
                {template.name}
              </h3>
              <div className="flex items-center mt-1">
                <span className={clsx(
                  "text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-normal",
                  template.is_active 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {template.slug}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex-1 space-y-2">
          <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-bold text-indigo-400 mb-1">Subject line</div>
            <p className="text-[11px] font-semibold text-slate-700 line-clamp-2 leading-relaxed italic">
              "{template.subject}"
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <Clock size={12} className="text-slate-300" />
            <span>{new Date(template.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <button
            onClick={() => onEdit(template)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-[10px] font-bold shadow-md shadow-indigo-100 active:scale-95"
          >
            <Pencil size={12} /> Edit Template
          </button>
        </div>
      </div>
    </div>
  );
}
