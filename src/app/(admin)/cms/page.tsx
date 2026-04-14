"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import {
  Navigation,
  Sparkles,
  BarChart3,
  MessageSquare,
  Megaphone,
  Layout,
  Link as LinkIcon,
  Type,
  HelpCircle,
  Eye,
  ArrowUpRight,
  Loader2,
  Box,
  Layers,
  Activity,
  Zap,
  Clock
} from "lucide-react";
import { getCMSSections } from "@/services/admin.service";
import { CMSSection } from "@/types";
import { toast } from "sonner";

// Icon mapping helper
const getIcon = (slug: string) => {
  const map: Record<string, any> = {
    navbar: Navigation,
    hero: Sparkles,
    stats: BarChart3,
    testimonials: MessageSquare,
    cta: Megaphone,
    footer: Layout,
    "footer-links": LinkIcon,
    branding: Type,
    faqs: HelpCircle,
  };
  return map[slug] || Box;
};

export default function CMSSectionsPage() {
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await getCMSSections();
      const list = Array.isArray(res) ? res : (res as any)?.data ?? [];
      setSections(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error("Failed to sync content architecture");
    } finally {
      setLoading(false);
    }
  };

  const filtered = sections.filter((s) => {
    if (filter === "active") return s.is_active;
    if (filter === "inactive") return !s.is_active;
    return true;
  });

  return (
    <div className="space-y-8 pb-16 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-2xl shadow-indigo-200/20">
                <Layers size={28} strokeWidth={1.5} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Content Layers</h1>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2.5 flex items-center gap-2">
                    <Activity size={12} className="text-emerald-500" /> Administrative Interface Overrides
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner shrink-0">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                filter === f
                  ? "bg-white text-slate-900 shadow-lg shadow-slate-200 ring-1 ring-slate-100"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-[3rem] border border-slate-50">
            <Loader2 size={32} className="text-indigo-600 animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Content Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((section) => {
            const Icon = getIcon(section.slug);
            return (
              <div
                key={section.id}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-7 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden"
              >
                {/* Status Dot */}
                <div className={clsx(
                    "absolute top-6 right-6 w-2 h-2 rounded-full",
                    section.is_active ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-200"
                )} />

                <div className="flex items-center gap-4 mb-6">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3",
                    section.is_active 
                      ? "bg-indigo-600 text-white shadow-indigo-200" 
                      : "bg-slate-100 text-slate-400"
                  )}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                      {section.name}
                    </h3>
                    <Badge variant={section.is_active ? "success" : "default"} dot className="text-[9px] uppercase font-black tracking-widest mt-2 px-0 bg-transparent border-none">
                      {section.is_active ? "Operational" : "Deactivated"}
                    </Badge>
                  </div>
                </div>

                <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-8 min-h-[48px] line-clamp-2">
                  {section.description || "Component configuration for specific platform interface blocks and dynamic visual elements."}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={12} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                      {new Date(section.last_updated).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/cms/${section.slug}`}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-90"
                      title="Inspect Logic"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link 
                      href={`/cms/${section.slug}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95 group/btn"
                    >
                      Configure <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                  <Box size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Outage</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">No structural blocks found in this sector</p>
          </div>
      )}
    </div>
  );
}
