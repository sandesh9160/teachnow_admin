"use client";

import React from "react";
import { clsx } from "clsx";
import { Pencil, Trash2, Eye, Layout, ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import type { CVTemplate } from "@/types";

interface CVTemplateCardProps {
  template: CVTemplate;
  onEdit?: (template: CVTemplate) => void;
  onDelete?: (template: CVTemplate) => void;
  onToggleStatus?: (template: CVTemplate) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";

export default function CVTemplateCard({ 
  template, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: CVTemplateCardProps) {
  const imageUrl = template.preview_image 
    ? `${BACKEND_URL}/${template.preview_image.startsWith('/') ? template.preview_image.slice(1) : template.preview_image}`
    : null;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-100 flex flex-col h-full">
      {/* ─── Image Preview Section ─────────────────────────────────── */}
      <div className="relative aspect-[3/4.2] overflow-hidden bg-slate-50 border-b border-slate-100">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={template.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
            <Layout size={40} strokeWidth={1} />
            <p className="text-[10px] font-semibold mt-2 uppercase tracking-tight">No Preview</p>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
           <div className="flex gap-2 w-full">
              <button 
                onClick={() => onEdit?.(template)}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-900 text-[11px] font-semibold py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Pencil size={13} /> Manage
              </button>
           </div>
        </div>
      </div>

      {/* ─── Information Section ─────────────────────────────────── */}
      <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
             <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-slate-900 leading-tight truncate group-hover:text-indigo-600 transition-colors">
                  {template.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                   <p className="text-[10px] font-medium text-slate-400 capitalize">{template.key_values || "Design"}</p>
                   <div className="w-0.5 h-0.5 rounded-full bg-slate-200" />
                   <div className={clsx(
                      "text-[9px] font-semibold",
                      template.is_active ? "text-emerald-500" : "text-slate-400"
                   )}>
                      {template.is_active ? "Active" : "Hidden"}
                   </div>
                </div>
             </div>
             <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                <Eye size={14} />
             </div>
          </div>

          <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
             <button 
                onClick={() => onToggleStatus?.(template)}
                className={clsx(
                  "text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all",
                  template.is_active ? "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                )}
             >
                {template.is_active ? "Disable" : "Enable"}
             </button>
             <button 
                onClick={() => onDelete?.(template)}
                className="text-slate-300 hover:text-rose-600 p-2 transition-colors"
                title="Remove Template"
             >
                <Trash2 size={15} />
             </button>
          </div>
      </div>
    </div>
  );
}
