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
    <div className="space-y-5 pb-16 antialiased max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all active:scale-95 shadow-sm">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="page-title">Hero Banner</h1>
            <p className="page-subtitle">Manage the main landing section of your homepage</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[12.5px] font-semibold rounded-lg shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
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
