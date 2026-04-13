"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  RotateCcw, 
  Save, 
  Megaphone,
  Layout,
  Type,
  MousePointer2,
  Image as ImageIcon,
  Sparkles
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
      const response = await getCMSSections();
      const sections = (response.data as any).data || response.data;
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
      toast.success("CTA updated");
    } catch (error) {
      toast.error("Failed to update section");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-surface-400">Locating call-to-action details...</div>;

  return (
    <div className="space-y-8 pb-12 antialiased">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cms" className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">Conversion Section</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Focus Block (CTA)</h1>
            <p className="text-[13px] text-surface-400 font-medium font-sans">Strategic banners to drive user registration and sales</p>
          </div>
        </div>
        
        <button 
           onClick={handleSave}
           disabled={saving}
           className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50"
        >
          {saving ? <RotateCcw size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Publishing..." : "Update Section"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-surface-50 bg-[#F8FAFC]/50 flex items-center gap-2">
                      <Type size={18} className="text-rose-500" />
                      <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-wider">Messaging</h3>
                  </div>
                  <div className="p-6 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Main Callout Title</label>
                        <input 
                           type="text"
                           value={data?.content?.title || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, title: e.target.value } })}
                           className="w-full bg-surface-50 border border-surface-100 rounded-xl px-4 py-3 text-[15px] font-bold text-surface-900 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 transition-all"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Supporting Description</label>
                        <textarea 
                           rows={3}
                           value={data?.content?.description || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, description: e.target.value } })}
                           className="w-full bg-surface-50 border border-surface-100 rounded-xl px-4 py-3 text-[14px] font-medium text-surface-600 outline-none focus:ring-2 focus:ring-rose-100 transition-all leading-relaxed"
                        />
                     </div>
                  </div>
              </div>

              <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-surface-50 bg-[#F8FAFC]/50 flex items-center gap-2">
                      <MousePointer2 size={18} className="text-rose-500" />
                      <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-wider">Button Configuration</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Button Text</label>
                        <input 
                           type="text"
                           value={data?.content?.button_text || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, button_text: e.target.value } })}
                           className="w-full bg-surface-50 border border-surface-100 rounded-xl px-4 py-2.5 text-[13px] font-bold text-surface-700 outline-none focus:ring-2 focus:ring-rose-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-surface-400 uppercase tracking-widest">Target Link</label>
                        <input 
                           type="text"
                           value={data?.content?.button_link || ""}
                           onChange={(e) => setData({ ...data, content: { ...data.content, button_link: e.target.value } })}
                           className="w-full bg-surface-50 border border-surface-100 rounded-xl px-4 py-2.5 text-[13px] font-bold text-surface-700 outline-none focus:ring-2 focus:ring-rose-100"
                        />
                      </div>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden p-6 space-y-6">
                  <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={18} className="text-rose-500" />
                      Visual Styling
                  </h3>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-surface-50 bg-surface-50/50">
                          <span className="text-[12px] font-bold text-surface-600">Background Preset</span>
                          <div className="flex items-center gap-2">
                             <button className="w-6 h-6 rounded-full bg-blue-600 ring-2 ring-offset-2 ring-transparent hover:ring-blue-100 transition-all cursor-pointer" />
                             <button className="w-6 h-6 rounded-full bg-rose-600 ring-2 ring-offset-2 ring-offset-white ring-rose-300 transition-all cursor-pointer" />
                             <button className="w-6 h-6 rounded-full bg-slate-900 cursor-pointer" />
                          </div>
                      </div>
                      <div className="aspect-video rounded-2xl bg-surface-50 border-2 border-dashed border-surface-100 flex flex-col items-center justify-center text-surface-300">
                          <ImageIcon size={28} className="mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Background Pattern</span>
                      </div>
                  </div>
              </div>

              {/* Real-time Preview */}
              <div 
                className={clsx(
                   "rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl transition-colors duration-500",
                   data?.content?.bg_color ? `bg-[${data.content.bg_color}]` : "bg-rose-600"
                )}
                style={{ backgroundColor: data?.content?.bg_color || "#E11D48" }}
              >
                  <Megaphone size={40} className="text-white/20 mb-2" />
                  <h2 className="text-2xl font-black text-white leading-tight max-w-sm">
                      {data?.content?.title || "Engaging Title Here"}
                  </h2>
                  <p className="text-[14px] text-white/80 font-medium max-w-sm">
                      {data?.content?.description || "Compelling description text goes in this area to convince users."}
                  </p>
                  <div className="px-8 py-3 bg-white text-rose-600 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-black/10">
                      {data?.content?.button_text || "Call to Action"}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
