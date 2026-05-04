"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Image as ImageIcon, UploadCloud, Type, Link as LinkIcon, Save, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { createCMSCTA, updateCMSCTA, toggleCMSCTA } from "@/services/admin.service";

interface CMSCTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: any;
}

export default function CMSCTAModal({ isOpen, onClose, onSuccess, item }: CMSCTAModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    button_text: "",
    button_link: "",
    is_active: 1,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          title: item.title || "",
          subtitle: item.subtitle || "",
          button_text: item.button_text || "",
          button_link: item.button_link || "",
          is_active: item.is_active !== undefined ? (Boolean(Number(item.is_active)) ? 1 : 0) : 1,
        });
        if (item.background_image) {
          setPreviewImage(
            item.background_image.startsWith("http")
              ? item.background_image
              : `https://teachnowbackend.jobsvedika.in/${item.background_image}`
          );
        } else {
          setPreviewImage(null);
        }
      } else {
        setFormData({
            title: "",
            subtitle: "",
            button_text: "",
            button_link: "",
            is_active: 1,
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
      payload.append("title", formData.title);
      payload.append("subtitle", formData.subtitle);
      payload.append("button_text", formData.button_text);
      payload.append("button_link", formData.button_link);
      payload.append("is_active", String(formData.is_active));

      if (item?.id) {
          payload.append("_method", "PUT");
      }

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        payload.append("background_image", file);
      }

      if (item?.id) {
        const res = await updateCMSCTA(item.id, payload);
        if (res?.status === false) {
          toast.error(res.message || "Failed to update CTA banner");
          return;
        }
        toast.success("CTA banner updated");
      } else {
        const res = await createCMSCTA(payload);
        if (res?.status === false) {
          toast.error(res.message || "Failed to create CTA banner");
          return;
        }
        toast.success("CTA banner created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save CTA banner");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100 animate-slide-up">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
              <Megaphone size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight leading-none">
                {item ? "Edit CTA Banner" : "Add CTA Banner"}
              </h2>
              <p className="text-[12px] font-medium text-slate-500 mt-1">
                Configure content and imagery for this promotional block.
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
                <Type size={14} className="text-emerald-500" /> Typography
              </h3>
              
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Main Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:font-medium placeholder:text-slate-300"
                  placeholder="e.g. Hire Now"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Subtitle</label>
                <textarea 
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:font-medium placeholder:text-slate-300 resize-none"
                  placeholder="e.g. Hire Now with ease"
                />
              </div>

              <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 pt-2">
                <LinkIcon size={14} className="text-indigo-500" /> Action Destination
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Button Label</label>
                  <input 
                    type="text"
                    required
                    value={formData.button_text}
                    onChange={e => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Hire Now"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">URL Path</label>
                  <input 
                    type="text"
                    required
                    value={formData.button_link}
                    onChange={e => setFormData({ ...formData, button_link: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-mono text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="/auth/employer-login"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <ImageIcon size={14} className="text-purple-500" /> Background Media
              </h3>
              
              <div 
                className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group hover:border-purple-400 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <UploadCloud size={24} className="text-white mb-2" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-widest">Change Media</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                       <UploadCloud size={18} />
                    </div>
                    <p className="text-[12px] font-bold text-slate-600">Click to upload banner</p>
                    <p className="text-[10px] text-slate-400 mt-1">Recommended format: JPG/PNG</p>
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

               <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider text-center md:text-left">Visibility Status</label>
                  <button 
                    type="button"
                    onClick={async () => {
                      const newState = formData.is_active === 1 ? 0 : 1;
                      setFormData({ ...formData, is_active: newState });
                      
                      if (item?.id) {
                        try {
                           // Call the toggle service for immediate update on server
                           // This matches the behavior of the status button in the list view
                           const res = await toggleCMSCTA(item.id);
                           if (res?.status === false) {
                             toast.error(res.message || "Failed to update status on server");
                             // Revert local state if server call fails
                             setFormData(prev => ({ ...prev, is_active: newState === 1 ? 0 : 1 }));
                           } else {
                             toast.success("Status updated successfully");
                             onSuccess(); // Refresh the list in the background
                           }
                        } catch (error) {
                           toast.error("An error occurred while updating status");
                           setFormData(prev => ({ ...prev, is_active: newState === 1 ? 0 : 1 }));
                        }
                      }
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-emerald-100 hover:shadow-md hover:shadow-emerald-500/5 cursor-pointer transition-all group outline-none"
                  >
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm border",
                            formData.is_active === 1 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                        )}>
                            <div className={clsx(
                              "w-2 h-2 rounded-full", 
                              formData.is_active === 1 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300"
                            )} />
                        </div>
                        <div className="text-left">
                            <p className="text-[12px] font-bold text-slate-800">Display this CTA</p>
                            <p className="text-[10px] font-medium text-slate-400">
                                {formData.is_active === 1 ? "Active on platform" : "Currently hidden"}
                            </p>
                        </div>
                    </div>
                    <div className={clsx(
                      "relative w-11 h-6 rounded-full transition-all duration-300 flex items-center px-1",
                      formData.is_active === 1 ? "bg-emerald-500 shadow-inner" : "bg-slate-200 shadow-inner"
                    )}>
                      <div className={clsx(
                        "w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md transform",
                        formData.is_active === 1 ? "translate-x-5" : "translate-x-0"
                      )} />
                    </div>
                  </button>
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
              className="group flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-[12px] font-bold text-white rounded-lg shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {item ? "Save Changes" : "Create Banner"}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
