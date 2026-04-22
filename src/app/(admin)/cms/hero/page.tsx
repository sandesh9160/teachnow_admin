"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, UploadCloud, LayoutTemplate, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { clsx } from "clsx";
import { getCMSHero, updateCMSHero } from "@/services/admin.service";

export default function CMSHeroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    button_text: "",
    button_link: "",
    trust_text: "",
    is_active: 1,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      setLoading(true);
      const res = await getCMSHero();
      const hero = res?.data || res;
      if (hero) {
        setData({
          title: hero.title || "",
          subtitle: hero.subtitle || "",
          button_text: hero.button_text || "",
          button_link: hero.button_link || "",
          trust_text: hero.trust_text || "",
          is_active: hero.is_active !== undefined ? hero.is_active : 1,
        });
        if (hero.background_image) {
          setPreviewImage(
            hero.background_image.startsWith("http") 
              ? hero.background_image 
              : `https://teachnowbackend.jobsvedika.in/${hero.background_image}`
          );
        }
      }
    } catch (err) {
      toast.error("Failed to load hero configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle);
      formData.append("button_text", data.button_text || "");
      formData.append("button_link", data.button_link || "");
      formData.append("trust_text", data.trust_text || "");
      formData.append("is_active", "1");
      
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        formData.append("background_image", file);
      }

      await updateCMSHero(formData);
      toast.success("Hero section saved successfully");
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <p className="text-[12px] font-bold text-slate-400">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 antialiased max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" /> Hero Banner
            </h1>
            <p className="text-[12px] text-slate-500 font-medium">Manage the main landing section of your homepage.</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-[12px] font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <LayoutTemplate size={16} className="text-emerald-500" /> Content Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Main Title</label>
                <input 
                  type="text" 
                  value={data.title}
                  onChange={e => setData({...data, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Find Your Dream Job"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Subtitle</label>
                <input 
                  type="text" 
                  value={data.subtitle}
                  onChange={e => setData({...data, subtitle: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="e.g. Over 10,000 opportunities waiting"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Button Text</label>
                  <input 
                    type="text" 
                    value={data.button_text}
                    onChange={e => setData({...data, button_text: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Browse Jobs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Button Link (URL)</label>
                  <input 
                    type="text" 
                    value={data.button_link}
                    onChange={e => setData({...data, button_link: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-mono text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. /jobs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-cyan-500" /> Trust Indicator Text
                </label>
                <input 
                  type="text" 
                  value={data.trust_text}
                  onChange={e => setData({...data, trust_text: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  placeholder="e.g. 6000+ active institutes and 4000+ job seekers..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Settings Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ImageIcon size={16} className="text-purple-500" /> Background Image
            </h3>
            
            <div className="space-y-4">
              <div 
                className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group hover:border-purple-400 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <UploadCloud size={24} className="text-white mb-2" />
                      <span className="text-[11px] font-bold text-white tracking-widest uppercase">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                       <UploadCloud size={18} />
                    </div>
                    <p className="text-[12px] font-bold text-slate-600">Click to upload image</p>
                    <p className="text-[10px] text-slate-400 mt-1">Recommended: 1920x1080px (JPG/PNG)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
