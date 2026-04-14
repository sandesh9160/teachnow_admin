"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Save, 
  Megaphone,
  Type,
  MousePointer2,
  Image as ImageIcon,
  Zap,
  Target,
  Palette,
  Monitor,
  Rocket
} from "lucide-react";
import Link from "next/link";
import { getCMSSections, updateCMSSection } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSCTAPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCTAData();
  }, []);

  const fetchCTAData = async () => {
    try {
      setLoading(true);
      const payload = await getCMSSections();
      const sections = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      const section = sections.find((s: any) => s.slug === "cta");
      
      setData(section || {
        name: "CTA Section",
        slug: "cta",
        content: {
          title: "Ready to Start Your Teaching Career?",
          description: "Join thousands of educators who have found their perfect job on TeachNow.",
          button_text: "Get Started Now",
          button_link: "/register",
          bg_color: "#2563EB"
        }
      });
    } catch (error) {
      toast.error("Failed to load CTA data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data?.id) return;
    try {
      setSaving(true);
      await updateCMSSection(data.id, data);
      toast.success("Conversion block updated successfully");
    } catch (error) {
      toast.error("Failed to update section architecture");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <RotateCcw size={32} className="text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Conversion Logic...</p>
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
               <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/50">Engagement Engine</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Focus zone (CTA)</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <Rocket size={12} className="text-indigo-500" /> Strategic banners to drive registration & acquisition
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
            {saving ? "Deploying Block..." : "Sync Conversion"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ─── Editor Landscape ────────────────────────────────────────────── */}
          <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
                  <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-100">
                          <Type size={16} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">Headline Blueprint</h3>
                  </div>
                  <div className="p-8 space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Callout Title</label>
                        <input 
                           type="text"
                           value={data?.content?.title || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, title: e.target.value } })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-[16px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-rose-600/5 focus:border-rose-400 transition-all shadow-inner placeholder:text-slate-200"
                           placeholder="Enter compelling title..."
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supporting Narrative</label>
                        <textarea 
                           rows={4}
                           value={data?.content?.description || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, description: e.target.value } })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-[14px] font-medium text-slate-600 outline-none focus:ring-4 focus:ring-rose-600/5 focus:border-rose-400 transition-all leading-relaxed shadow-inner placeholder:text-slate-200"
                           placeholder="Write a persuasive description to convert traffic..."
                        />
                     </div>
                  </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-100/50">
                  <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                          <MousePointer2 size={16} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em]">Action Triggers</h3>
                  </div>
                  <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Identity</label>
                        <input 
                           type="text"
                           value={data?.content?.button_text || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, button_text: e.target.value } })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-[13px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all shadow-inner"
                           placeholder="e.g. Join Now"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation Path</label>
                        <input 
                           type="text"
                           value={data?.content?.button_link || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, button_link: e.target.value } })}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-[13px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all shadow-inner"
                           placeholder="/onboarding"
                        />
                      </div>
                  </div>
              </div>
          </div>

          <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-8 transition-all hover:shadow-2xl hover:shadow-slate-100/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100">
                            <Palette size={16} strokeWidth={2.5} />
                        </div>
                        Atmospheric Controls
                    </h3>
                  </div>
                  <div className="space-y-6">
                      <div className="flex flex-col gap-4 p-6 rounded-[2rem] border border-slate-50 bg-slate-50/50 shadow-inner">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spectrum Presets</span>
                          <div className="flex items-center gap-4">
                             {['#E11D48', '#2563EB', '#0F172A', '#059669'].map(color => (
                                <button 
                                    key={color}
                                    onClick={() => setData({ ...data, content: { ...data.content, bg_color: color } })}
                                    className={clsx(
                                        "w-10 h-10 rounded-full border-4 transition-all duration-300",
                                        data?.content?.bg_color === color ? "border-white ring-4 ring-indigo-600/20 scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                                    )} 
                                    style={{ backgroundColor: color }} 
                                />
                             ))}
                          </div>
                      </div>
                      <div className="aspect-[21/9] rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 group hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                          <ImageIcon size={32} strokeWidth={1.5} className="mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Texture Payload</span>
                      </div>
                  </div>
              </div>

              {/* ─── Real-time Insight ─────────────────────────────────────── */}
              <div className="relative group perspective-1000">
                  <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                  <div 
                    className="relative rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-8 shadow-2xl transition-all duration-700 bg-slate-900 border border-white/5 overflow-hidden"
                    style={{ backgroundColor: data?.content?.bg_color || "#0F172A" }}
                  >
                      {/* Internal Shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                      
                      <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Megaphone size={40} strokeWidth={1.5} className="text-white opacity-80" />
                      </div>
                      
                      <div className="space-y-4 relative z-10">
                        <h2 className="text-3xl font-black text-white leading-[1.1] tracking-tight max-w-sm">
                            {data?.content?.title || "Engaging Title Sequence"}
                        </h2>
                        <p className="text-[14px] text-white/60 font-medium max-w-xs leading-relaxed">
                            {data?.content?.description || "Compelling narrative logic goes in this container to maximize user conversion density."}
                        </p>
                      </div>

                      <div className="px-10 py-4 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                          {data?.content?.button_text || "Execute Trigger"}
                      </div>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <Monitor size={10} className="text-white/20" />
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Live Frontend Shadow</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      {/* ─── Strategic Advice ─────────────────────────────────────────── */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] flex items-start gap-6 max-w-2xl transition-all hover:shadow-2xl hover:shadow-indigo-100/50 group">
          <div className="w-16 h-16 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Zap size={32} className="fill-current" />
          </div>
          <div>
              <h5 className="text-[13px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                  Conversion Optimization <Target size={14} className="text-emerald-500" />
              </h5>
              <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                  Focus zone blocks generate <span className="text-emerald-400 font-black">28% higher engagement</span> when utilizing high-contrast backgrounds like <span className="text-rose-400 font-black">Crimson</span> or <span className="text-slate-200 font-black">Onyx</span>. Keep titles under 8 words for optimal mobile impact.
              </p>
          </div>
      </div>
    </div>
  );
}
