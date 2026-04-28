"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Link2, Settings2, ChevronRight,  Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createCMSNavigation, updateCMSNavigation, toggleCMSNavigationActive, toggleCMSNavigationNav } from "@/services/admin.service";
import { clsx } from "clsx";

interface CMSNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: any;
  parentOptions?: any[];
}

export default function CMSNavigationModal({ isOpen, onClose, onSuccess, item, parentOptions = [] }: CMSNavigationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    parent_id: "",
    url: "",
    display_order: 1,
    is_active: 1,
    show_in_nav: 1,
    slug: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (item?.id) {
        setFormData({
          title: item.title || "",
          parent_id: item.parent_id ? String(item.parent_id) : "",
          url: item.url || "",
          display_order: item.display_order || 1,
          is_active: item.is_active !== undefined ? (item.is_active === 1 || item.is_active === true || item.is_active === "1" || item.is_active === "true" ? 1 : 0) : 1,
          show_in_nav: item.show_in_nav !== undefined ? (item.show_in_nav === 1 || item.show_in_nav === true || item.show_in_nav === "1" || item.show_in_nav === "true" ? 1 : 0) : 1,
          slug: item.slug || "",
          meta_title: item.meta_title || "",
          meta_description: item.meta_description || "",
          meta_keywords: item.meta_keywords || ""
        });
      } else if (item?.parent_id) {
        setFormData({
          title: "",
          parent_id: String(item.parent_id),
          url: "",
          display_order: 1,
          is_active: 1,
          show_in_nav: 1,
          slug: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: ""
        });
      } else {
        setFormData({
          title: "",
          parent_id: "",
          url: "",
          display_order: 1,
          is_active: 1,
          show_in_nav: 1,
          slug: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: ""
        });
      }
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        url: formData.url,
        display_order: parseInt(String(formData.display_order)),
        is_active: formData.is_active,
        show_in_nav: formData.show_in_nav,
        slug: formData.slug,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords
      };

      if (item?.id) {
        await updateCMSNavigation(item.id, payload);
        toast.success("Link updated");
      } else {
        await createCMSNavigation(payload);
        toast.success("Link created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save link");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              {item?.id ? <Pencil size={18} /> : <Plus size={18} />}
            </div>
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">
              {item?.id ? "Edit Link" : "Add New Link"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition-all active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">
                 Link Title
              </label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                placeholder="e.g. FAQ"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">
                   Parent Link
                </label>
                <select
                  value={formData.parent_id}
                  onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">None (Top Level)</option>
                  {parentOptions.filter(o => o.id !== item?.id).map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {"\u00A0".repeat((o.level || 0) * 2)} {o.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">
                   Display Order
                </label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={formData.display_order}
                  onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">
                 URL Path
              </label>
              <input 
                type="text"
                required
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-mono font-bold text-indigo-600 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                placeholder="/faqs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">
                 Slug
              </label>
              <input 
                type="text"
                required
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-mono text-slate-500 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                placeholder="faqs"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 mt-4">
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings2 size={14} className="text-indigo-500" /> SEO Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">
                     Meta Title
                  </label>
                  <input 
                    type="text"
                    value={formData.meta_title}
                    onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                    placeholder="SEO Title"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">
                     Meta Description
                  </label>
                  <textarea 
                    value={formData.meta_description}
                    onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm min-h-[80px] resize-none"
                    placeholder="Short description for SEO..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-0.5">
                     Meta Keywords
                  </label>
                  <input 
                    type="text"
                    value={formData.meta_keywords}
                    onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
                    placeholder="keywords, comma, separated"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  const newState = formData.is_active ? 0 : 1;
                  setFormData({ ...formData, is_active: newState });
                  if (item?.id) {
                    try {
                      await toggleCMSNavigationActive(item.id, { is_active: newState });
                      toast.success("Status updated");
                      onSuccess();
                    } catch (e) {
                      toast.error("Failed to update status instantly");
                    }
                  }
                }}
                className={clsx(
                    "flex-1 flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                    formData.is_active ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-200"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={clsx("text-[10px] font-bold uppercase tracking-wider", formData.is_active ? "text-emerald-600" : "text-slate-400")}>Status</span>
                  <div className={clsx(
                      "w-7 h-4 rounded-full relative transition-colors",
                      formData.is_active ? "bg-emerald-500" : "bg-slate-300"
                  )}>
                      <div className={clsx(
                          "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform",
                          formData.is_active ? "translate-x-3.5" : "translate-x-0.5"
                      )} />
                  </div>
                </div>
                <span className="text-[9px] font-medium text-slate-500">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const newState = formData.show_in_nav ? 0 : 1;
                  setFormData({ ...formData, show_in_nav: newState });
                  if (item?.id) {
                    try {
                      await toggleCMSNavigationNav(item.id, { show_in_nav: newState });
                      toast.success("Visibility updated");
                      onSuccess();
                    } catch (e) {
                      toast.error("Failed to update visibility instantly");
                    }
                  }
                }}
                className={clsx(
                    "flex-1 flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                    formData.show_in_nav ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-200"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={clsx("text-[10px] font-bold uppercase tracking-wider", formData.show_in_nav ? "text-indigo-600" : "text-slate-400")}>Menu Location</span>
                  <div className={clsx(
                      "w-7 h-4 rounded-full relative transition-colors",
                      formData.show_in_nav ? "bg-indigo-600" : "bg-slate-300"
                  )}>
                      <div className={clsx(
                          "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform",
                          formData.show_in_nav ? "translate-x-3.5" : "translate-x-0.5"
                      )} />
                  </div>
                </div>
                <span className="text-[9px] font-medium text-slate-500">
                  {formData.show_in_nav ? "Show in Top Menu" : "Hide from Top Menu"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 text-[11px] font-bold uppercase text-slate-400 hover:text-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 bg-indigo-600 text-white rounded-lg text-[11px] font-bold uppercase shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <ChevronRight size={16} />
                  <span>Save Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
