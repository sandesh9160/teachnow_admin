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
    <div className="group relative bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100/80 transition-all duration-500 flex flex-col overflow-hidden">
      {/* ─── Preview Section ─────────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-50 border-b border-slate-100/50">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={template.name}
            className="w-full h-full object-cover object-top transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <Layout size={32} strokeWidth={1} className="opacity-20 mb-2" />
            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40">No Visualization</span>
          </div>
        )}

        {/* Status Chip - Floating */}
        <div className="absolute top-3 left-3 z-10">
          <div className={clsx(
            "px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-widest border backdrop-blur-md shadow-sm",
            template.is_active 
              ? "bg-emerald-500/90 text-white border-emerald-400" 
              : "bg-white/80 text-slate-500 border-slate-200"
          )}>
            {template.is_active ? "Live" : "Draft"}
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
           <button 
             onClick={() => onEdit?.(template)}
             className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-xl hover:scale-110 active:scale-95 transition-all"
           >
             <Pencil size={18} />
           </button>
           <span className="text-white text-[11px] font-semibold uppercase tracking-widest drop-shadow-md">Edit Template</span>
        </div>
      </div>

      {/* ─── Content Section ─────────────────────────────────── */}
      <div className="p-3.5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
              {template.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter shrink-0 ring-1 ring-indigo-100">
                {template.key_values || "Modern"}
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-[10px] font-medium text-slate-400 truncate">
                Updated {new Date(template.updated_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          <button 
            className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-all shrink-0 shadow-sm"
            title="Preview Details"
          >
            <Eye size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-0.5 pt-2.5 border-t border-slate-50">
           <button 
              onClick={() => onToggleStatus?.(template)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-semibold transition-all border",
                template.is_active 
                  ? "bg-amber-50/50 text-amber-600 border-amber-100 hover:bg-amber-100" 
                  : "bg-emerald-50/50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
              )}
           >
              {template.is_active ? "Take Offline" : "Publish Live"}
           </button>
           <button 
              onClick={() => onDelete?.(template)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all shadow-sm select-none"
           >
              <Trash2 size={14} />
           </button>
        </div>
      </div>
    </div>
  );
}
