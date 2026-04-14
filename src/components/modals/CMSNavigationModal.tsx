"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Link2, MapPin, Layers, Settings, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { createCMSNavigation, updateCMSNavigation } from "@/services/admin.service";
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
    show_in_nav: 1
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          title: item.title || "",
          parent_id: item.parent_id ? String(item.parent_id) : "",
          url: item.url || "",
          display_order: item.display_order || 1,
          is_active: item.is_active !== undefined ? item.is_active : 1,
          show_in_nav: item.show_in_nav !== undefined ? item.show_in_nav : 1
        });
      } else {
        setFormData({
          title: "",
          parent_id: "",
          url: "",
          display_order: 1,
          is_active: 1,
          show_in_nav: 1
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
        show_in_nav: formData.show_in_nav
      };

      if (item?.id) {
        await updateCMSNavigation(item.id, payload);
        toast.success("Navigation node updated");
      } else {
        await createCMSNavigation(payload);
        toast.success("Navigation node created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("An error occurred preserving node state.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Link2 size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-slate-900 tracking-tight leading-none">
                {item ? "Edit Link" : "Add Link"}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Navigation Settings
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                 Link Name
              </label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-400 transition-all placeholder:font-medium placeholder:text-slate-300"
                placeholder="e.g. FAQS"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                   Parent Link
                </label>
                <select
                  value={formData.parent_id}
                  onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-400 transition-all"
                >
                  <option value="">-- None (Top Level) --</option>
                  {parentOptions.filter(o => o.id !== item?.id).map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {"\u00A0".repeat((o.level || 0) * 4)}{o.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                   Order
                </label>
                <input 
                  type="number"
                  min="0"
                  required
                  value={formData.display_order}
                  onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                 URL Path
              </label>
              <input 
                type="text"
                required
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-mono text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-400 transition-all placeholder:font-sans placeholder:text-slate-300"
                placeholder="e.g. /open/home/faqs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg border border-slate-100 transition-all hover:bg-slate-50">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.is_active === 1}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                  />
                  <div className={clsx("w-8 h-4 bg-slate-200 rounded-full transition-colors", formData.is_active === 1 && "bg-emerald-500")}></div>
                  <div className={clsx("absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform", formData.is_active === 1 && "translate-x-4")}></div>
                </div>
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900">Active</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg border border-slate-100 transition-all hover:bg-slate-50">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.show_in_nav === 1}
                    onChange={e => setFormData({ ...formData, show_in_nav: e.target.checked ? 1 : 0 })}
                  />
                  <div className={clsx("w-8 h-4 bg-slate-200 rounded-full transition-colors", formData.show_in_nav === 1 && "bg-indigo-600")}></div>
                  <div className={clsx("absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform", formData.show_in_nav === 1 && "translate-x-4")}></div>
                </div>
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900">Show in Header</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-[11px] font-black uppercase tracking-widest text-white rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
              {item ? "Save Changes" : "Add Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
