"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Save, 
  Image as ImageIcon, 
  Sparkles,
  Type,
  Link as LinkIcon,
  PlayCircle,
  Eye,
  Settings,
  ArrowUpRight,
  Zap,
  Layout,
  Clock,
  Palette,
  Monitor
} from "lucide-react";
import Link from "next/link";
import { getCMSSections, updateCMSSection } from "@/services/admin.service";
import { toast } from "sonner";
import Badge from "@/components/ui/Badge";
import { clsx } from "clsx";

export default function CMSHeroPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      setLoading(true);
      const payload = await getCMSSections();
      const sections = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      const hero = sections.find((s: any) => s.slug === "hero");
      setData(hero || {
        name: "Hero Section",
        content: {
          headline: "Find Your Dream Teaching Job",
          subheadline: "Connect with the best schools and institutions across the globe.",
          primary_cta: "Browse Jobs",
          secondary_cta: "Post a Job",
          hero_image: "",
          stats_preview: "5000+ Jobs Listed"
        }
      });
    } catch (error) {
      toast.error("Failed to load hero section data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data?.id) return;
    try {
      setSaving(true);
      await updateCMSSection(data.id, data);
      toast.success("Hero architecture updated successfully");
    } catch (error) {
      toast.error("Failed to update hero section");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <RotateCcw size={32} className="text-indigo-600 animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Content Payload...</p>
      </div>
  );

  return (
    <div className="space-y-8 pb-16 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/cms" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">Primary Gateway</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Hero configuration</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <Sparkles size={12} className="text-amber-500" /> Manage the global landing experience & conversions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 group"
          >
            {saving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
            {saving ? "Deploying Architecture..." : "Publish Logic"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Editor Landscape ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                    <Type size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">Messaging Matrix</h3>
            </div>
            <div className="p-8 space-y-8">
               <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Headline Identifier <Zap size={10} className="text-amber-500" />
                    </label>
                    <input 
                       type="text" 
                       value={data?.content?.headline || ""} 
                       onChange={(e) => setData({ ...data, content: { ...data.content, headline: e.target.value } })}
                       className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[16px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all shadow-inner placeholder:text-slate-200"
                       placeholder="Enter high-impact headline..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Introductory Narrative <Clock size={10} />
                    </label>
                    <textarea 
                       rows={4}
                       value={data?.content?.subheadline || ""} 
                       onChange={(e) => setData({ ...data, content: { ...data.content, subheadline: e.target.value } })}
                       className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all leading-relaxed shadow-inner placeholder:text-slate-200"
                       placeholder="Enter platform introduction and mission statement..."
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                    <LinkIcon size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">Conversion Triggers</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary CTA Label</label>
                  <input 
                     type="text" 
                     value={data?.content?.primary_cta || ""} 
                     onChange={(e) => setData({ ...data, content: { ...data.content, primary_cta: e.target.value } })}
                     className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-400 transition-all shadow-inner" 
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secondary CTA Label</label>
                  <input 
                     type="text" 
                     value={data?.content?.secondary_cta || ""} 
                     onChange={(e) => setData({ ...data, content: { ...data.content, secondary_cta: e.target.value } })}
                     className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition-all shadow-inner" 
                  />
               </div>
            </div>
          </div>
        </div>

        {/* ─── Preview & Assets ───────────────────────────────────────────── */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
             <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                       <Palette size={16} />
                   </div>
                   <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">Asset Canvas</h3>
                </div>
                <button className="text-[9px] font-black text-indigo-600 uppercase border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Replace</button>
             </div>
             <div className="p-8">
                <div className="aspect-[4/3] rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <ImageIcon size={40} className="mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform text-slate-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">1920x1080 Optimal</span>
                </div>
                <p className="mt-5 text-[11px] text-slate-400 text-center font-bold uppercase tracking-tight italic">Supported: JPG, PNG, WebP (2MB Index)</p>
             </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
             
             <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Snapshot</span>
                </div>
                <div className="flex gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-slate-700" />
                   <div className="w-2 h-2 rounded-full bg-slate-700" />
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
             </div>
             
             <div className="space-y-5 relative z-10">
                <h4 className="text-2xl font-black leading-[1.1] tracking-tight group-hover:text-indigo-400 transition-colors line-clamp-2">{data?.content?.headline || "Primary Platform Narrative"}</h4>
                <p className="text-[12px] text-slate-400 font-medium leading-relaxed line-clamp-3">{data?.content?.subheadline || "Specify your platform intro logic here."}</p>
                
                <div className="pt-6 flex flex-col gap-3">
                   <div className="w-full py-3.5 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center shadow-xl shadow-indigo-600/20">{data?.content?.primary_cta || "Inbound Action"}</div>
                   <div className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center">{data?.content?.secondary_cta || "Alternative"}</div>
                </div>
             </div>
          </div>

          <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[2rem] flex items-start gap-4 shadow-sm">
              <Sparkles size={20} className="text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-900/60 font-bold leading-relaxed uppercase tracking-tight">
                 Optimize: Hero headlines yield <span className="text-amber-600">42% higher retention</span> when utilizing imperative verbs (Find, Join, Discover).
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
