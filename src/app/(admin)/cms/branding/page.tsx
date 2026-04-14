"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Image as ImageIcon,
  Building,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Eye,
  Settings2,
  Activity,
  ArrowUpRight,
  Zap,
  Globe,
  Monitor,
  Layout,
  Clock,
  Palette
} from "lucide-react";
import Link from "next/link";
import { 
  getCMSCompanyLogos, 
  createCMSCompanyLogo, 
  updateCMSCompanyLogo, 
  deleteCMSCompanyLogo 
} from "@/services/admin.service";
import { toast } from "sonner";
import Badge from "@/components/ui/Badge";
import { clsx } from "clsx";

export default function CMSBrandingPage() {
  const [logos, setLogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const payload = await getCMSCompanyLogos();
      const data = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      setLogos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch branding:", error);
      toast.error("Failed to load branding assets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this branding asset?")) return;
    try {
      await deleteCMSCompanyLogo(id);
      toast.success("Asset decommissioned successfully");
      setLogos(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to remove structural asset");
    }
  };

  if (loading && logos.length === 0) return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <RotateCcw size={32} className="text-indigo-600 animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Visual Palette...</p>
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
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">Brand Authority</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Visual Identity</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <Palette size={12} className="text-indigo-600" /> Manage institutional assets & platform themes
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
               onClick={fetchBranding}
               className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl active:scale-90"
            >
                <RotateCcw size={20} className={clsx(loading && "animate-spin")} />
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-100 hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 group">
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                Inject Asset
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Asset Landscape ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em] flex items-center gap-3 leading-none">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                        <ImageIcon size={16} strokeWidth={2.5} />
                    </div>
                    Registry variants
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100 shadow-inner">
                    {logos.length} IDENTIFIED ASSETS
                </span>
            </div>

            {logos.length === 0 ? (
                <div className="p-20 text-center bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-10 transition-opacity" style={{ backgroundImage: 'radial-gradient(#6366f1 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 group-hover:scale-110 group-hover:text-indigo-600 transition-all duration-700">
                        <ImageIcon size={40} strokeWidth={1} />
                    </div>
                    <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-widest mb-2">No Visual Nodes</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight italic">Initiate platform presence by uploading official branding vectors</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {logos.map((logo) => (
                        <div key={logo.id} className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/30 hover:-translate-y-1 transition-all duration-500">
                            <div className="h-48 bg-slate-50 flex items-center justify-center p-10 relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                                {/* Checkerboard transparency preview */}
                                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }} />
                                <img 
                                    src={logo.url} 
                                    alt={logo.title} 
                                    className="max-h-full max-w-full relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-2 drop-shadow-xl" 
                                />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-16 group-hover:translate-x-0 transition-all duration-500 delay-100">
                                     <button className="p-2.5 bg-white/90 backdrop-blur-md border border-slate-100 rounded-xl text-slate-600 hover:text-indigo-600 shadow-xl active:scale-90 transition-all"><Pencil size={14} /></button>
                                     <button onClick={() => handleDelete(logo.id)} className="p-2.5 bg-white/90 backdrop-blur-md border border-slate-100 rounded-xl text-rose-500 hover:bg-rose-50 shadow-xl active:scale-90 transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="p-6 flex items-center justify-between bg-white relative z-20">
                                <div>
                                    <h5 className="text-[14px] font-black text-slate-900 uppercase tracking-tight mb-1.5 leading-none">{logo.title || "Untitled Variant"}</h5>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-widest">{logo.type || "Vector"}</span>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{logo.dimensions || "High Res"}</span>
                                    </div>
                                </div>
                                <div>
                                    {logo.is_active ? (
                                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Node
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mr-2">Inactive Storage</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* ─── Control Sidebar ────────────────────────────────────────────── */}
        <div className="space-y-8">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.1em] flex items-center gap-3 leading-none">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                    <Settings2 size={16} strokeWidth={2.5} />
                </div>
                Meta logic
            </h3>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8 transition-all hover:shadow-2xl hover:shadow-slate-100/50">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Platform Umbrella Title <Zap size={10} className="text-amber-500" />
                    </label>
                    <input 
                        type="text" 
                        defaultValue="TeachNow — Jobs for Educators" 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 shadow-inner group/color cursor-pointer">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Primary Hex Logic</span>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3 font-black text-[14px] text-slate-900 uppercase tracking-tight">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-600 border-4 border-white shadow-lg group-hover:scale-110 transition-transform" />
                                  #6366F1
                             </div>
                             <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 shadow-inner group/color cursor-pointer">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Accent Hex Logic</span>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3 font-black text-[14px] text-slate-900 uppercase tracking-tight">
                                  <div className="w-10 h-10 rounded-xl bg-amber-400 border-4 border-white shadow-lg group-hover:scale-110 transition-transform" />
                                  #FBBF24
                             </div>
                             <ArrowUpRight size={14} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 space-y-5">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                 <Activity size={14} strokeWidth={2.5} />
                             </div>
                             <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Vantge Rendering</span>
                         </div>
                         <div className="w-12 h-6 bg-slate-100 rounded-full flex items-center px-1 border border-slate-200 cursor-pointer group/toggle">
                             <div className="w-4 h-4 bg-indigo-600 rounded-full ml-auto shadow-md group-hover:scale-110 transition-transform" />
                         </div>
                     </div>
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                 <Building size={14} strokeWidth={2.5} />
                             </div>
                             <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">White Labeling Node</span>
                         </div>
                         <Badge className="bg-indigo-600 text-white border-none py-1.5 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg">PRO PLAN</Badge>
                     </div>
                </div>

                <button className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200/50 hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 group">
                    Save Branding Logic
                    <ArrowUpRight size={16} className="inline ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>

            <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[2rem] flex items-start gap-5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <AlertCircle size={20} />
                </div>
                <p className="text-[12px] text-amber-900/60 font-black leading-relaxed uppercase tracking-tight">
                   Structural: Platform Title overrides instantly propagate to <span className="text-amber-700 underline decoration-amber-200 underline-offset-4 font-black">Global SEO registry</span>.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
