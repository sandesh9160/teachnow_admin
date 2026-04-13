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
  Type
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
      const response = await getCMSSections();
      const sections = (response.data as any).data || response.data;
      const stats = sections.find((s: any) => s.slug === "stats");
      
      // Default fallback if no stats section exists
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
      toast.success("Stats section updated");
    } catch (error) {
      toast.error("Failed to save changes");
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
    const newItem = { id: newId, label: "New Stat", value: "0", icon: "TrendingUp" };
    setData({ ...data, content: { ...data.content, items: [...data.content.items, newItem] } });
  };

  const removeStatItem = (id: number) => {
    setData({ ...data, content: { ...data.content, items: data.content.items.filter((i: any) => i.id !== id) } });
  };

  if (loading) return <div className="p-12 text-center text-surface-400">Loading metrics...</div>;

  return (
    <div className="space-y-8 pb-12 antialiased">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cms" className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Trust Markers</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Platform Statistics</h1>
            <p className="text-[13px] text-surface-400 font-medium font-sans">Manage impact numbers and success metrics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Updating..." : "Publish Stats"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {data?.content?.items?.map((item: any, index: number) => (
             <div key={item.id} className="bg-white rounded-2xl border border-surface-100 shadow-sm hover:border-primary-100 transition-all group p-6 space-y-5">
                 <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                        <TrendingUp size={20} />
                    </div>
                    <button 
                        onClick={() => removeStatItem(item.id)}
                        className="p-2 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={16} />
                    </button>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Hash size={10} /> Value
                        </label>
                        <input 
                           type="text"
                           value={item.value}
                           onChange={(e) => updateStatItem(item.id, "value", e.target.value)}
                           className="w-full bg-surface-50 border border-surface-100 rounded-xl px-4 py-2 text-lg font-black text-surface-900 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Type size={10} /> Label
                        </label>
                        <input 
                           type="text"
                           value={item.label}
                           onChange={(e) => updateStatItem(item.id, "label", e.target.value)}
                           className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2 text-[13px] font-bold text-surface-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                        />
                    </div>
                 </div>
             </div>
         ))}

         <button 
            onClick={addStatItem}
            className="bg-white rounded-2xl border-2 border-dashed border-surface-100 p-6 flex flex-col items-center justify-center text-surface-300 hover:border-primary-200 hover:bg-primary-50/10 hover:text-primary-400 transition-all group min-h-[220px]"
         >
             <div className="w-12 h-12 rounded-full bg-surface-50 flex items-center justify-center mb-3 group-hover:bg-primary-50 transition-all">
                <Plus size={24} />
             </div>
             <span className="text-[13px] font-bold uppercase tracking-wider">Add Stat Card</span>
         </button>
      </div>

      {/* Info Card */}
      <div className="bg-surface-900 rounded-2xl p-8 flex items-center justify-between text-white shadow-xl shadow-surface-200 relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                 <BarChart3 size={32} className="text-primary-400" />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-1">Preview Live Stats</h3>
                <p className="text-surface-400 text-sm font-medium">These counters will animate on the homepage to showcase scale.</p>
             </div>
          </div>
          <div className="flex gap-12 relative z-10">
              {data?.content?.items?.slice(0, 2).map((item: any) => (
                  <div key={item.id} className="text-center">
                      <div className="text-2xl font-black text-primary-400">{item.value}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-surface-500">{item.label}</div>
                  </div>
              ))}
          </div>
          {/* Background pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary-500/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
