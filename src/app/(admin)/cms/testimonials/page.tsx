"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Save, 
  Plus,
  MessageSquare,
  Trash2,
  Star,
  User,
  Quote,
  Pencil
} from "lucide-react";
import Link from "next/link";
import { getCMSSections, updateCMSSection } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";
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
      const response = await getCMSSections();
      const sections = (response.data as any).data || response.data;
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
      toast.success("Testimonials updated");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (id: number) => {
    setData({ ...data, content: { ...data.content, items: data.content.items.filter((i: any) => i.id !== id) } });
  };

  const addItem = () => {
    const newId = Math.max(0, ...data.content.items.map((i: any) => i.id)) + 1;
    const newItem = { id: newId, name: "New Reviewer", role: "Role", text: "Enter testimonial here...", rating: 5, avatar: "" };
    setData({ ...data, content: { ...data.content, items: [newItem, ...data.content.items] } });
  };

  if (loading) return <div className="p-12 text-center text-surface-400">Loading feedback...</div>;

  return (
    <div className="space-y-8 pb-12 antialiased">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cms" className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Social Proof</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Customer Testimonials</h1>
            <p className="text-[13px] text-surface-400 font-medium font-sans">Showcase success stories from teachers and employers</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={addItem}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-50 transition-all"
          >
            <Plus size={18} />
            Add Testimonial
          </button>
          <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-50"
          >
            {saving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Testimonials"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data?.content?.items?.map((item: any) => (
              <div key={item.id} className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6 flex flex-col sm:flex-row gap-6 hover:border-primary-100 transition-all group">
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center text-surface-300 relative overflow-hidden group/avatar">
                          {item.avatar ? (
                              <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                              <User size={32} />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                              <Pencil size={18} className="text-white" />
                          </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                         {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= item.rating ? "currentColor" : "none"} />)}
                      </div>
                  </div>

                  <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                         <div className="space-y-1">
                            <input 
                               type="text"
                               value={item.name}
                               onChange={(e) => {
                                  const items = data.content.items.map((i: any) => i.id === item.id ? { ...i, name: e.target.value } : i);
                                  setData({ ...data, content: { ...data.content, items } });
                               }}
                               className="text-lg font-bold text-surface-900 bg-transparent border-none p-0 outline-none focus:ring-0 w-full"
                               placeholder="Name"
                            />
                            <input 
                               type="text"
                               value={item.role}
                               onChange={(e) => {
                                  const items = data.content.items.map((i: any) => i.id === item.id ? { ...i, role: e.target.value } : i);
                                  setData({ ...data, content: { ...data.content, items } });
                               }}
                               className="text-[12px] font-bold text-primary-500 bg-transparent border-none p-0 outline-none focus:ring-0 uppercase tracking-wider w-full"
                               placeholder="Sub-title / Role"
                            />
                         </div>
                         <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-surface-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>

                      <div className="relative">
                         <Quote size={20} className="absolute -left-2 -top-2 text-surface-50 -z-0" />
                         <textarea 
                            rows={3}
                            value={item.text}
                            onChange={(e) => {
                               const items = data.content.items.map((i: any) => i.id === item.id ? { ...i, text: e.target.value } : i);
                               setData({ ...data, content: { ...data.content, items } });
                            }}
                            className="relative z-10 w-full bg-surface-50/50 border border-surface-50 rounded-xl p-3 text-[13.5px] font-medium text-surface-500 leading-relaxed italic outline-none focus:ring-2 focus:ring-primary-50 transition-all"
                            placeholder="Share their story..."
                         />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Guide Area */}
      <div className="bg-indigo-900 rounded-2xl p-8 flex items-center justify-between text-white shadow-xl">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                 <MessageSquare size={32} className="text-white" />
             </div>
             <div>
                <h3 className="text-xl font-bold mb-1">Impactful Testimonials</h3>
                <p className="text-indigo-200 text-sm font-medium">Capture trust by featuring real users with their profiles and ratings.</p>
             </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
             <Badge className="bg-emerald-500 text-white border-none">QUALITY TIP</Badge>
             <p className="text-[11px] text-right text-indigo-300 font-medium max-w-xs">Use headshots with plain backgrounds for a cohesive look. 1:1 square ratio works best.</p>
          </div>
      </div>
    </div>
  );
}
