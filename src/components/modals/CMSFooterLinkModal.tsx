"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Link2, UploadCloud, Layout, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { createCMSFooterLink, updateCMSFooterLink, getCMSFooterSections } from "@/services/admin.service";

interface CMSFooterLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: any;
}

export default function CMSFooterLinkModal({ isOpen, onClose, onSuccess, item }: CMSFooterLinkModalProps) {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    section_id: "",
    title: "",
    url: "",
    slug: "",
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
      fetchSections();
      if (item) {
        setFormData({
          section_id: item.section_id || item.section?.id || "",
          title: item.title || "",
          url: item.url || "",
          slug: item.slug || "",
          display_order: item.display_order || 1,
          is_active: item.is_active !== undefined ? Number(item.is_active) : 1,
          meta_title: item.meta_title || "",
          meta_description: item.meta_description || "",
          meta_keywords: item.meta_keywords || "",
        });
        if (item.icon) {
          setPreviewImage(
            item.icon.startsWith("http")
              ? item.icon
              : `https://teachnowbackend.jobsvedika.in/${item.icon}`
          );
        } else {
          setPreviewImage(null);
        }
      } else {
        setFormData({
            section_id: "",
            title: "",
            url: "",
            slug: "",
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

  const fetchSections = async () => {
      try {
          const payload = await getCMSFooterSections();
          let unwrappedData: any[] = [];
          if (Array.isArray(payload)) unwrappedData = payload;
          else if (Array.isArray((payload as any)?.data)) unwrappedData = (payload as any).data;
          else if (payload && typeof payload === 'object' && Array.isArray((payload as any)?.data?.data)) {
              unwrappedData = (payload as any).data.data;
          }
          setSections(unwrappedData);
      } catch (e) {
          console.error(e);
      }
  };

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
    if (!formData.section_id) {
        toast.error("Please select a Footer Column");
        return;
    }
    
    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("section_id", String(formData.section_id));
      payload.append("title", String(formData.title));
      payload.append("url", String(formData.url));
      payload.append("slug", String(formData.slug));
      payload.append("display_order", String(formData.display_order));
      payload.append("is_active", String(formData.is_active));
      payload.append("meta_title", String(formData.meta_title));
      payload.append("meta_description", String(formData.meta_description));
      payload.append("meta_keywords", String(formData.meta_keywords));

      if (item?.id) {
          payload.append("_method", "PUT");
      }

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        payload.append("icon", file);
      }

      if (item?.id) {
        await updateCMSFooterLink(item.id, payload);
        toast.success("Footer link updated");
      } else {
        await createCMSFooterLink(payload);
        toast.success("Footer link created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save footer link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-100 animate-slide-up">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Link2 size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">
                {item ? "Edit Footer Link" : "Add Footer Link"}
              </h2>
              <p className="text-[12px] font-medium text-slate-500 mt-1">
                Configure link identity, icon, and structural column.
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
          <div className="p-6 space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Assign to Column</label>
                <select 
                   value={formData.section_id}
                   onChange={e => setFormData({ ...formData, section_id: e.target.value })}
                   required
                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                    <option value="" disabled>Select a column...</option>
                    {sections.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Link Name / Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-300"
                  placeholder="e.g. Instagram"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Destination URL</label>
                <input 
                  type="text"
                  required
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-mono text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300 placeholder:font-sans"
                  placeholder="e.g. https://instagram.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Display Order</label>
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
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
               <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                 <Layout size={14} className="text-slate-400" /> Optional Icon / Graphic
               </h3>
               
               <div 
                 className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-400 transition-all cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}
               >
                 {previewImage ? (
                   <>
                     <img src={previewImage} alt="Preview" className="h-full object-contain p-2" />
                     <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <UploadCloud size={20} className="text-white mb-1" />
                       <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change Media</span>
                     </div>
                   </>
                 ) : (
                   <div className="flex flex-col items-center justify-center p-4 text-center">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                        <UploadCloud size={16} />
                     </div>
                     <p className="text-[12px] font-bold text-slate-600">Click to upload icon</p>
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

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                <Settings2 size={14} className="text-indigo-500" /> SEO Settings
              </h3>

              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-mono text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  placeholder="e.g. about-us"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  placeholder="SEO Title"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Meta Description</label>
                <textarea
                  value={formData.meta_description}
                  onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300 min-h-[80px] resize-none"
                  placeholder="Short description for SEO..."
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Meta Keywords</label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  placeholder="keywords, comma, separated"
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {item ? "Save Changes" : "Create Link"}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
