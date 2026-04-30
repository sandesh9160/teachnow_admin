"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Image as ImageIcon, UploadCloud, Link as LinkIcon, Building } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { updateCMSCompanyLogo } from "@/services/admin.service";

interface CMSCompanyLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: any;
}

export default function CMSCompanyLogoModal({ isOpen, onClose, onSuccess, item }: CMSCompanyLogoModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    slug: "",
    company_url: "/",
    display_order: 1,
    is_active: 1,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          company_name: item.company_name || "",
          slug: item.slug || "",
          company_url: item.company_url || "/",
          display_order: item.display_order || 1,
          is_active: item.is_active !== undefined ? Number(item.is_active) : 1,
          meta_title: item.meta_title || "",
          meta_description: item.meta_description || "",
          meta_keywords: item.meta_keywords || "",
        });
        if (item.company_logo) {
          setPreviewImage(
            item.company_logo.startsWith("http")
              ? item.company_logo
              : `https://teachnowbackend.jobsvedika.in/${item.company_logo}`
          );
        } else {
          setPreviewImage(null);
        }
      } else {
        setFormData({
            company_name: "",
            slug: "",
            company_url: "/",
            display_order: 1,
            is_active: 1,
            meta_title: "",
            meta_description: "",
            meta_keywords: "",
        });
        setPreviewImage(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("company_name", String(formData.company_name));
      payload.append("slug", String(formData.slug));
      payload.append("company_url", String(formData.company_url));
      payload.append("display_order", String(formData.display_order));
      payload.append("is_active", String(formData.is_active));
      
      payload.append("meta_title", String(formData.meta_title));
      payload.append("meta_description", String(formData.meta_description));
      payload.append("meta_keywords", String(formData.meta_keywords));

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        console.log("[CMSCompanyLogoModal] Appending new logo file:", file.name, file.size);
        payload.append("company_logo", file);
      }

      console.log("[CMSCompanyLogoModal] Preparing to submit with ID:", item?.id);
      for (const pair of payload.entries()) {
        console.log(`[FormData] ${pair[0]}: ${pair[1]}`);
      }

      if (item?.id) {
        const response = await updateCMSCompanyLogo(item.id, payload);
        console.log("[CMSCompanyLogoModal] Update API Response:", response);
        if (response?.status === false) {
          toast.error(response.message || "Failed to update branding asset");
          return;
        }
        toast.success("Branding asset updated");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("[CMSCompanyLogoModal] Error submitting form:", err);
      toast.error("Failed to save asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100 animate-slide-up">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Building size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">
                {item ? "Edit Primary Branding" : "Edit Primary Branding"}
              </h2>
              <p className="text-[12px] font-medium text-slate-500 mt-1">
                Configure primary corporate assets and global SEO attributes.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-90 shadow-sm"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-h-[80vh] overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building size={14} className="text-emerald-500" /> Identity Details
              </h3>
              
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Brand Name</label>
                <input 
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-300"
                  placeholder="e.g. TeachNow Careers"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Slug Identifier</label>
                <input 
                  type="text"
                  required
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-300"
                  placeholder="e.g. teach-now"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Root Destination URL</label>
                <input 
                  type="text"
                  required
                  value={formData.company_url}
                  onChange={e => setFormData({ ...formData, company_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-mono text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-sans"
                  placeholder="e.g. /"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Display Priority</label>
                    <input 
                      type="number"
                      required
                      value={formData.display_order}
                      onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                 </div>
                 <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all mb-[1px]">
                        <span className="text-[12px] font-bold text-slate-700">Set Active</span>
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.is_active === 1}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                          />
                          <div className={clsx("w-8 h-4 bg-slate-200 rounded-full transition-colors", formData.is_active === 1 && "bg-emerald-500")}></div>
                          <div className={clsx("absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm", formData.is_active === 1 && "translate-x-4")}></div>
                        </div>
                    </label>
                 </div>
              </div>

               <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mt-6">
                 <LinkIcon size={14} className="text-amber-500" /> SEO Parameters
               </h3>

               <div>
                 <label className="text-[11px] font-bold text-slate-500 mb-1 block">Meta Title</label>
                 <input 
                   type="text"
                   value={formData.meta_title}
                   onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                   placeholder="e.g. Careers @ Google"
                 />
               </div>
               
               <div>
                 <label className="text-[11px] font-bold text-slate-500 mb-1 block">Meta Description</label>
                 <textarea 
                   rows={2}
                   value={formData.meta_description}
                   onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                   placeholder="Short SEO description..."
                 />
               </div>

               <div>
                 <label className="text-[11px] font-bold text-slate-500 mb-1 block">Meta Keywords</label>
                 <textarea 
                   rows={2}
                   value={formData.meta_keywords}
                   onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                   placeholder="Keywords separated by commas..."
                 />
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                 <ImageIcon size={14} className="text-indigo-500" /> Core Asset Vector
               </h3>
               
               <div 
                 className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-400 transition-all cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}
               >
                 {previewImage ? (
                   <>
                     <img src={previewImage} alt="Preview" className="w-[80%] h-[80%] object-contain drop-shadow-xl" />
                     <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <UploadCloud size={24} className="text-white mb-2" />
                       <span className="text-[11px] font-bold text-white uppercase tracking-widest">Change Vector</span>
                     </div>
                   </>
                 ) : (
                   <div className="flex flex-col items-center justify-center p-6 text-center">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={20} />
                     </div>
                     <p className="text-[13px] font-bold text-slate-700">Upload primary logo</p>
                     <p className="text-[11px] font-medium text-slate-400 mt-1">Accepts transparent PNG or SVG</p>
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

          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-[12px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-[12px] font-bold text-white rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
            >
              {item ? "Save Identity" : "Save Identity"}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
