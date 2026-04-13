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
  Settings
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
      const response = await getCMSSections();
      const sections = (response.data as any).data || response.data;
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
      toast.success("Hero section updated successfully");
    } catch (error) {
      toast.error("Failed to update hero section");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-surface-400">Loading hero configuration...</div>;

  return (
    <div className="space-y-8 pb-12 antialiased">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cms" className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded">Visual Landing</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Hero Section Configuration</h1>
            <p className="text-[13px] text-surface-400 font-medium font-sans">Headline, messaging and primary calls-to-action</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving Changes..." : "Publish Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-surface-50 bg-[#F8FAFC]/50 flex items-center gap-2">
                <Type size={18} className="text-primary-500" />
                <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-wider">Messaging & Typography</h3>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Primary Headline</label>
                    <input 
                       type="text" 
                       value={data?.content?.headline || ""} 
                       onChange={(e) => setData({ ...data, content: { ...data.content, headline: e.target.value } })}
                       className="w-full px-4 py-3 bg-surface-50 border border-surface-100 rounded-xl text-[15px] font-bold text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                       placeholder="Enter catching headline..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Sub-headline / Intro Text</label>
                    <textarea 
                       rows={3}
                       value={data?.content?.subheadline || ""} 
                       onChange={(e) => setData({ ...data, content: { ...data.content, subheadline: e.target.value } })}
                       className="w-full px-4 py-3 bg-surface-50 border border-surface-100 rounded-xl text-[14px] font-medium text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all leading-relaxed"
                       placeholder="Enter detailed description..."
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-surface-50 bg-[#F8FAFC]/50 flex items-center gap-2">
                <LinkIcon size={18} className="text-primary-500" />
                <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-wider">Call to Action Buttons</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Primary Button Label</label>
                  <input 
                     type="text" 
                     value={data?.content?.primary_cta || ""} 
                     onChange={(e) => setData({ ...data, content: { ...data.content, primary_cta: e.target.value } })}
                     className="w-full px-4 py-2.5 bg-surface-50 border border-surface-100 rounded-xl text-[13px] font-bold text-surface-700 outline-none focus:ring-2 focus:ring-primary-50" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Secondary Button Label</label>
                  <input 
                     type="text" 
                     value={data?.content?.secondary_cta || ""} 
                     onChange={(e) => setData({ ...data, content: { ...data.content, secondary_cta: e.target.value } })}
                     className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-[13px] font-bold text-surface-700 outline-none focus:ring-2 focus:ring-primary-50" 
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
             <div className="p-5 border-b border-surface-50 bg-[#F8FAFC]/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <ImageIcon size={18} className="text-primary-500" />
                   <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-wider">Hero Visuals</h3>
                </div>
                <button className="text-[10px] font-black text-primary-600 uppercase border border-primary-200 px-2 py-1 rounded-md hover:bg-primary-50 transition-all">Replace</button>
             </div>
             <div className="p-6">
                <div className="aspect-video rounded-xl bg-surface-50 border-2 border-dashed border-surface-100 flex flex-col items-center justify-center text-surface-300 group hover:border-primary-100 hover:bg-primary-50/10 transition-all cursor-pointer">
                    <ImageIcon size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">1920x1080 Recommended</span>
                </div>
                <p className="mt-4 text-[12px] text-surface-400 text-center font-medium italic">Supports JPG, PNG, WebP (Max 2MB)</p>
             </div>
          </div>

          <div className="p-6 bg-surface-900 rounded-2xl text-white shadow-xl shadow-surface-200">
             <div className="flex items-center justify-between mb-8">
                <Badge variant="default" className="bg-white/10 text-white border-white/20">LIVE PREVIEW</Badge>
                <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
             </div>
             <div className="space-y-4">
                <h4 className="text-xl font-bold leading-tight line-clamp-2">{data?.content?.headline || "Untitled Section"}</h4>
                <p className="text-[11px] text-surface-400 leading-relaxed line-clamp-3">{data?.content?.subheadline || "No subtitle provided."}</p>
                <div className="pt-4 flex items-center gap-4">
                   <div className="px-4 py-2 bg-primary-500 rounded-lg text-[10px] font-black uppercase tracking-wider">{data?.content?.primary_cta || "Primary"}</div>
                   <div className="px-4 py-2 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider">{data?.content?.secondary_cta || "Secondary"}</div>
                </div>
             </div>
          </div>

          <div className="p-5 bg-primary-50 border border-primary-100 rounded-2xl flex items-start gap-4">
              <Sparkles size={20} className="text-primary-500 flex-shrink-0" />
              <p className="text-[11px] text-primary-700 font-medium leading-relaxed">
                 Hero headlines perform 40% better when they contain action-oriented language like "Discover", "Find", or "Join".
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
