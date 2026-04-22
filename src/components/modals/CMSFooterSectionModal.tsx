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
          is_active: (item.is_active === 1 || item.is_active === true || String(item.is_active) === "1") ? 1 : 0,
        });
      } else {
        setFormData({
            title: "",
            display_order: 1,
            is_active: 0,
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
        const res = await updateCMSFooterSection(item.id, payload);
        console.log("Update Footer Section Response:", res);
        toast.success("Footer section updated");
      } else {
        const res = await createCMSFooterSection(payload);
        console.log("Create Footer Section Response:", res);
        toast.success("Footer section created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save Footer Section Error:", err);
      toast.error("Failed to save footer section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 antialiased">
        <div className="absolute inset-0 bg-slate-900/10 animate-in fade-in duration-300" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            {/* ─── Header ────────────────────────────────────────────── */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                        <LayoutGrid size={18} />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold text-slate-900 leading-tight">
                            {item ? "Edit Footer Column" : "Create New Column"}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                            {item ? "Updating Header" : "Initialize Column"}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* ─── Body ─────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                    <label className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-2 px-1">
                        <Type size={14} className="text-indigo-500" /> Header Name
                    </label>
                    <input 
                        type="text"
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                        placeholder="e.g. Quick Links"
                    />
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-2 px-1">
                        <Hash size={14} className="text-indigo-500" /> Placement Order
                    </label>
                    <input 
                        type="number"
                        required
                        min="1"
                        value={formData.display_order}
                        onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                    />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">Active Visibility</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: formData.is_active ? 0 : 1 })}
                        className={clsx(
                            "w-9 h-5 rounded-full relative transition-colors duration-200 outline-none",
                            formData.is_active ? "bg-emerald-500" : "bg-slate-300"
                        )}
                    >
                        <div className={clsx(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 shadow-sm",
                            formData.is_active ? "translate-x-5" : "translate-x-1"
                        )} />
                    </button>
                </div>

                {/* ─── Footer ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-5 pt-4 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-10 px-6 bg-indigo-600 text-white rounded-xl text-[12px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span>{item ? "Save Changes" : "Create Column"}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
