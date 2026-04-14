"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Save, 
  Plus,
  BarChart3,
  Trash2,
  TrendingUp,
  Hash,
  Type,
  Zap,
  Activity,
  ArrowUpRight,
  Target,
  Clock,
  Layers
} from "lucide-react";
import Link from "next/link";
import { getCMSSections, updateCMSSection } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSStatsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const payload = await getCMSSections();
      const sections = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      const stats = sections.find((s: any) => s.slug === "stats");
      
      setData(stats || {
        name: "Stats Section",
        slug: "stats",
        content: {
          items: [
            { id: 1, label: "Active Jobs", value: "10k+", icon: "Briefcase" },
            { id: 2, label: "Teachers", value: "5k+", icon: "Users" },
            { id: 3, label: "Schools", value: "200+", icon: "Building" }
          ]
        }
      });
    } catch (error) {
      toast.error("Failed to load stats section data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data?.id) return;
    try {
      setSaving(true);
      await updateCMSSection(data.id, data);
      toast.success("Impact metrics deployed successfully");
    } catch (error) {
      toast.error("Failed to save architecture changes");
    } finally {
      setSaving(false);
    }
  };

  const updateStatItem = (id: number, field: string, value: string) => {
    const newItems = data.content.items.map((item: any) => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setData({ ...data, content: { ...data.content, items: newItems } });
  };

  const addStatItem = () => {
    const newId = Math.max(0, ...data.content.items.map((i: any) => i.id)) + 1;
    const newItem = { id: newId, label: "New Metric", value: "0", icon: "TrendingUp" };
    setData({ ...data, content: { ...data.content, items: [...data.content.items, newItem] } });
  };

  const removeStatItem = (id: number) => {
    setData({ ...data, content: { ...data.content, items: data.content.items.filter((i: any) => i.id !== id) } });
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <RotateCcw size={32} className="text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Metrics Engine...</p>
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
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">Growth Indicators</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Impact metrics</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <TrendingUp size={12} className="text-emerald-500" /> Manage platform scale markers & trust signals
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
            {saving ? "Deploying Stats..." : "Sync Metrics"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {data?.content?.items?.map((item: any) => (
             <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/30 hover:-translate-y-1 transition-all duration-500 group p-8 space-y-8 relative overflow-hidden">
                 {/* Internal Pattern */}
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                 <div className="flex items-center justify-between relative z-10">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
                        <BarChart3 size={24} strokeWidth={2.5} />
                    </div>
                    <button 
                        onClick={() => removeStatItem(item.id)}
                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                    >
                        <Trash2 size={18} />
                    </button>
                 </div>

                 <div className="space-y-6 relative z-10">
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                            <Hash size={12} className="text-indigo-500" /> Current Value
                        </label>
                        <input 
                           type="text"
                           value={item.value}
                           onChange={(e) => updateStatItem(item.id, "value", e.target.value)}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xl font-black text-slate-900 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                            <Type size={12} className="text-emerald-500" /> Sector label
                        </label>
                        <input 
                           type="text"
                           value={item.label}
                           onChange={(e) => updateStatItem(item.id, "label", e.target.value)}
                           className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-[13px] font-bold text-slate-600 focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-400 outline-none transition-all"
                        />
                    </div>
                 </div>
             </div>
         ))}

         <button 
            onClick={addStatItem}
            className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-8 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 hover:text-indigo-500 transition-all group min-h-[320px] relative overflow-hidden"
         >
             <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#6366f1 2px, transparent 2px)', backgroundSize: '16px 16px' }} />
             <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-100 transition-all duration-500">
                <Plus size={32} strokeWidth={3} />
             </div>
             <span className="text-[14px] font-black uppercase tracking-widest">Inject metric card</span>
         </button>
      </div>

      {/* ─── Preview Landscape ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 rounded-[3rem] p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 flex items-center gap-8">
             <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-700">
                 <Activity size={40} strokeWidth={1.5} />
             </div>
             <div>
                <h3 className="text-2xl font-black mb-1.5 uppercase tracking-tight">Real-time telemetry</h3>
                <p className="text-slate-400 text-[13px] font-medium max-w-sm leading-relaxed">System metrics are currently synchronized across the global edge network for immediate impact analysis.</p>
             </div>
          </div>
          
          <div className="flex gap-16 relative z-10 lg:pr-10 overflow-x-auto pb-4 lg:pb-0">
              {data?.content?.items?.map((item: any) => (
                  <div key={item.id} className="text-center shrink-0 min-w-[120px]">
                      <div className="text-3xl font-black text-emerald-400 mb-1 tracking-tighter">{item.value || "0"}</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{item.label || "Unnamed Metric"}</div>
                  </div>
              ))}
          </div>
          
          {/* Accent decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-2 h-full bg-indigo-500 opacity-50" />
      </div>

      {/* Optimization Guide */}
      <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] flex items-start gap-5 max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Zap size={24} className="fill-current" />
          </div>
          <div>
             <h5 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-1.5 flex items-center gap-2">Metric Integrity <Target size={12} className="text-emerald-500" /></h5>
             <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                Aim for 3-4 primary metrics to avoid cognitive overload. Ensure values contain character suffixes (e.g., +, k, %) to emphasize scale without utilizing absolute numeric strings.
             </p>
          </div>
      </div>
    </div>
  );
}
