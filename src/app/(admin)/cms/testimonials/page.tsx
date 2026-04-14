"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Save, 
  Plus,
  // MessageSquare,
  Trash2,
  Star,
  User,
  Quote,
  Pencil,
  // Sparkles,
  // Zap,
  // Activity,
  // ArrowUpRight,
  // Target,
  // Clock,
  // Layers,
  Heart
} from "lucide-react";
import Link from "next/link";
import { getCMSSections, updateCMSSection } from "@/services/admin.service";
import { toast } from "sonner";
// import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";

export default function CMSTestimonialsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const payload = await getCMSSections();
      const sections = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      const section = sections.find((s: any) => s.slug === "testimonials");
      
      setData(section || {
        name: "Testimonials",
        slug: "testimonials",
        content: {
          items: [
            { id: 1, name: "Sarah Jenkins", role: "Primary Teacher", text: "TeachNow helped me find a position that perfectly matches my skills and location preferences.", rating: 5, avatar: "" },
            { id: 2, name: "David Miller", role: "Hiring Manager", text: "Finding qualified educators has never been easier. The platform is intuitive and effective.", rating: 5, avatar: "" }
          ]
        }
      });
    } catch (error) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data?.id) return;
    try {
      setSaving(true);
      await updateCMSSection(data.id, data);
      toast.success("Social proof architecture updated successfully");
    } catch (error) {
      toast.error("Failed to save architecture changes");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (id: number) => {
    setData({ ...data, content: { ...data.content, items: data.content.items.filter((i: any) => i.id !== id) } });
  };

  const addItem = () => {
    const newId = Math.max(0, ...data.content.items.map((i: any) => i.id)) + 1;
    const newItem = { id: newId, name: "New Advocate", role: "Contributor Role", text: "Specify the platform success narrative here...", rating: 5, avatar: "" };
    setData({ ...data, content: { ...data.content, items: [newItem, ...data.content.items] } });
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <RotateCcw size={32} className="text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Reputation Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-16 antialiased">
      {/* ─── Header Section ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/dashboard" className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">Human Network</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Social validation</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-2.5 flex items-center gap-2">
               <Heart size={12} className="text-rose-500 fill-current" /> Manage institutional success stories & peer reviews
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shadow-2xl shadow-indigo-100/20 rounded-2xl p-1 bg-white border border-slate-50">
          <button 
             onClick={addItem}
             className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            Inject review
          </button>
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 group"
          >
            {saving ? <RotateCcw size={16} className="animate-spin" /> : <Save size={16} className="group-hover:scale-110 transition-transform" />}
            {saving ? "Deploying..." : "Sync Proof"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {data?.content?.items?.map((item: any) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col sm:flex-row gap-8 hover:shadow-2xl hover:shadow-indigo-100/30 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  {/* Decorative Anchor */}
                  <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <Quote size={80} className="fill-current text-indigo-600" />
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-center gap-4 relative z-10">
                      <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-300 relative overflow-hidden group/avatar shadow-inner">
                          {item.avatar ? (
                              <img src={item.avatar} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                          ) : (
                              <User size={40} strokeWidth={1.5} />
                          )}
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer">
                              <Pencil size={20} className="text-white transform -rotate-12 group-hover/avatar:rotate-0 transition-transform" />
                          </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full shadow-sm ring-1 ring-amber-100/50">
                         {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= item.rating ? "currentColor" : "none"} strokeWidth={i <= item.rating ? 0 : 2} />)}
                      </div>
                  </div>

                  <div className="flex-1 space-y-6 relative z-10">
                      <div className="flex items-start justify-between">
                         <div className="space-y-1.5 w-full">
                            <input 
                               type="text"
                               value={item.name}
                               onChange={(e) => {
                                  const items = data.content.items.map((i: any) => i.id === item.id ? { ...i, name: e.target.value } : i);
                                  setData({ ...data, content: { ...data.content, items } });
                               }}
                               className="text-xl font-black text-slate-900 bg-transparent border-none p-0 outline-none focus:ring-0 w-full placeholder:text-slate-200"
                               placeholder="Identified Advocate"
                            />
                            <input 
                               type="text"
                               value={item.role}
                               onChange={(e) => {
                                  const items = data.content.items.map((i: any) => i.id === item.id ? { ...i, role: e.target.value } : i);
                                  setData({ ...data, content: { ...data.content, items } });
                               }}
                               className="text-[11px] font-black text-indigo-500 bg-transparent border-none p-0 outline-none focus:ring-0 uppercase tracking-[0.2em] w-full placeholder:text-slate-300"
                               placeholder="Institutional Title"
                            />
                         </div>
                         <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2.5 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all translate-x-4 group-hover:translate-x-0"
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>

                      <div className="relative">
                         <textarea 
                            rows={4}
                            value={item.text}
                            onChange={(e) => {
                               const items = data.content.items.map((i: any) => i.id === item.id ? { ...i, text: e.target.value } : i);
                               setData({ ...data, content: { ...data.content, items } });
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 text-[14px] font-medium text-slate-500 leading-relaxed italic outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all shadow-inner placeholder:text-slate-300"
                            placeholder="Document the specific platform impact mission and results here..."
                         />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* ─── Strategy Guide ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between text-white shadow-2xl shadow-indigo-200 transition-all hover:bg-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity" />
          
          <div className="flex items-center gap-8 relative z-10">
             <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                 <Quote size={40} className="fill-current" />
             </div>
             <div>
                <h3 className="text-2xl font-black mb-1.5 uppercase tracking-tight">Proof strategy</h3>
                <p className="text-slate-400 text-[13px] font-medium max-w-sm leading-relaxed">Capture platform trust by showcasing authentic success narratives from verified institutional educators.</p>
             </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-3 relative z-10 lg:pr-6">
             <Badge className="bg-indigo-500 text-white border-none text-[9px] font-black tracking-widest px-4 py-1.5 rounded-full">OPTIMIZATION INTEL</Badge>
             <p className="text-[12px] text-right text-slate-400 font-bold uppercase tracking-widest max-w-xs leading-loose">
                Utilize high-contrast headshots with 1:1 aspect ratios. Profiles with <span className="text-emerald-400 font-black">5-star logic</span> generate 3.4x higher conversion density.
             </p>
          </div>
      </div>
    </div>
  );
}
