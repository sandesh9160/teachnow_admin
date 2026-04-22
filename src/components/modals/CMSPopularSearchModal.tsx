"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Search, BarChart3, Globe } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { createPopularSearch, updatePopularSearch } from "@/services/admin.service";
import type { PopularSearch } from "@/types";

interface CMSPopularSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: PopularSearch | null;
}

export default function CMSPopularSearchModal({ isOpen, onClose, onSuccess, item }: CMSPopularSearchModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    order: 0,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    is_featured: 1,
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          name: item.name || "",
          slug: item.slug || "",
          order: item.order || 0,
          meta_title: item.meta_title || "",
          meta_description: item.meta_description || "",
          meta_keywords: item.meta_keywords || "",
          is_featured: item.is_featured !== undefined ? (Boolean(item.is_featured) ? 1 : 0) : 1,
        });
      } else {
        setFormData({
          name: "",
          slug: "",
          order: 0,
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          is_featured: 1,
        });
      }
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const data = {
        ...formData,
        is_featured: Number(formData.is_featured),
      };

      if (item?.id) {
        await updatePopularSearch(item.id, data);
        toast.success("Popular search updated");
      } else {
        await createPopularSearch(data);
        toast.success("Popular search created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save popular search");
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
              <Search size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">
                {item ? "Edit Popular Search" : "Add Popular Search"}
              </h2>
              <p className="text-[12px] font-medium text-slate-500 mt-1">
                Configure popular search term and its SEO metadata.
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
                <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Search Term Name</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-300"
                  placeholder="e.g. Math Jobs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Display Order</label>
                    <input 
                      type="number"
                      required
                      value={formData.order}
                      onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                 </div>
                 <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all mb-[1px]">
                        <span className="text-[12px] font-bold text-slate-700">Featured</span>
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.is_featured === 1}
                            onChange={e => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                          />
                          <div className={clsx("w-8 h-4 bg-slate-200 rounded-full transition-colors", formData.is_featured === 1 && "bg-emerald-500")}></div>
                          <div className={clsx("absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm", formData.is_featured === 1 && "translate-x-4")}></div>
                        </div>
                    </label>
                 </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
               <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                 <Globe size={14} className="text-indigo-500" /> SEO Configuration
               </h3>
               
               <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Meta Title</label>
                    <input 
                      type="text"
                      value={formData.meta_title}
                      onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="SEO Title..."
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Meta Keywords</label>
                    <input 
                      type="text"
                      value={formData.meta_keywords}
                      onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="Keywords (comma separated)..."
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-slate-700 mb-1.5 block">Meta Description</label>
                    <textarea 
                      value={formData.meta_description}
                      onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                      placeholder="SEO Description..."
                    />
                  </div>
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
              {item ? "Save Changes" : "Create Search"}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
