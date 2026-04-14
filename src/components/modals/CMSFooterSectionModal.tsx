"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, LayoutGrid, Type, Hash, Save } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { createCMSFooterSection, updateCMSFooterSection } from "@/services/admin.service";

interface CMSFooterSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: any;
}

export default function CMSFooterSectionModal({ isOpen, onClose, onSuccess, item }: CMSFooterSectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    display_order: 1,
    is_active: 1,
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          title: item.title || "",
          display_order: item.display_order || 1,
          is_active: item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
        });
      } else {
        setFormData({
            title: "",
            display_order: 1,
            is_active: 1,
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
          title: String(formData.title),
          display_order: String(formData.display_order),
          is_active: String(formData.is_active)
      };

      if (item?.id) {
        await updateCMSFooterSection(item.id, payload);
        toast.success("Footer section updated");
      } else {
        await createCMSFooterSection(payload);
        toast.success("Footer section created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save footer section");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 animate-slide-up">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
              <LayoutGrid size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">
                {item ? "Edit Footer Column" : "Add Footer Column"}
              </h2>
              <p className="text-[12px] font-medium text-slate-500 mt-1">
                Configure grouping logic for footer links.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           <div>
               <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Type size={14} className="text-emerald-500" /> Header Name
               </label>
               <input 
                 type="text"
                 required
                 value={formData.title}
                 onChange={e => setFormData({ ...formData, title: e.target.value })}
                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                 placeholder="e.g. Social Media Links"
               />
           </div>

           <div>
               <label className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Hash size={14} className="text-indigo-500" /> Placement Order
               </label>
               <input 
                 type="number"
                 required
                 min="1"
                 value={formData.display_order}
                 onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
               />
           </div>

           <div className="pt-2 border-t border-slate-100">
             <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all">
               <span className="text-[12px] font-bold text-slate-700">Display this section publicly</span>
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

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-[12px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-[12px] font-bold text-white rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {item ? "Save Changes" : "Create Column"}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
