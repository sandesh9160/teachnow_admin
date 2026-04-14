"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, FileCode, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import type { CVTemplate } from "@/types";

interface CVTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  initialData?: CVTemplate;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";

export default function CVTemplateModal({ isOpen, onClose, onSave, initialData }: CVTemplateModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    html_template: "",
    is_active: 1,
    key_values: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        html_template: initialData.html_template || "",
        is_active: Number(initialData.is_active) || 0,
        key_values: initialData.key_values || ""
      });
      setPreview(null); // Reset preview for edit
      setFile(null);
    } else {
      setFormData({
        name: "",
        html_template: "",
        is_active: 1,
        key_values: ""
      });
      setFile(null);
      setPreview(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("html_template", formData.html_template);
      data.append("is_active", String(formData.is_active));
      if (formData.key_values) data.append("key_values", formData.key_values);
      if (file) data.append("preview_image", file);
      
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {initialData ? "Edit Design Layout" : "Publish New Layout"}
            </h2>
            <p className="text-[12px] font-medium text-slate-500 mt-0.5">Define core structure and preview for the builder.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md transition-all flex items-center justify-center text-slate-400 hover:text-rose-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Col: Metadata */}
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Template Identity</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Modern Minimalist 2024"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Design Variant / Tags</label>
                <input 
                  type="text"
                  placeholder="e.g. professional, creative, academic"
                  value={formData.key_values}
                  onChange={e => setFormData({...formData, key_values: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Visibility Status</label>
                <div className="flex gap-3">
                  {[
                    { val: 1, label: "Live", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { val: 0, label: "Hidden", icon: AlertCircle, color: "text-slate-400", bg: "bg-slate-50" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFormData({...formData, is_active: opt.val})}
                      className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-semibold text-[12px]",
                        formData.is_active === opt.val 
                          ? `${opt.bg} border-indigo-500 text-slate-900 shadow-sm` 
                          : "border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      <opt.icon size={16} className={formData.is_active === opt.val ? opt.color : ""} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Upload */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preview Thumbnail</label>
                <div 
                  className={clsx(
                    "relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden group",
                    file || preview ? "border-indigo-200" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300"
                  )}
                >
                  {preview ? (
                    <img src={preview} alt="Upload" className="w-full h-full object-cover" />
                  ) : initialData?.preview_image && !file ? (
                    <img 
                       src={`${BACKEND_URL}/${initialData.preview_image.startsWith('/') ? initialData.preview_image.slice(1) : initialData.preview_image}`} 
                       className="w-full h-full object-cover opacity-60" 
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Upload size={32} strokeWidth={1.5} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                      <p className="text-[11px] font-bold uppercase tracking-tight">Drop mockup here</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {(file || preview) && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-1.5 rounded-xl shadow-lg">
                       <Upload size={14} className="text-indigo-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: HTML Editor Overlay */}
            <div className="flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileCode size={14} /> HTML Blueprint
                </label>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">Supports {"{{tags}}"}</span>
                </div>
              </div>
              <textarea 
                required
                placeholder="<html>...</html>"
                value={formData.html_template}
                onChange={e => setFormData({...formData, html_template: e.target.value})}
                className="flex-1 w-full p-4 bg-slate-900 text-indigo-100 font-mono text-[12px] rounded-2xl border-none outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-2xl resize-none"
                style={{ lineHeight: '1.6' }}
              />
              <p className="text-[10px] text-slate-400 mt-3 italic">
                Use variables like <b>{`{{name}}`}</b>, <b>{`{{experience}}`}</b>, etc., which will be dynamically populated.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
           >
             Discard
           </button>
           <button 
             onClick={handleSubmit}
             disabled={loading}
             className="min-w-[160px] bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[13px] font-bold shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
           >
             {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
             {initialData ? "Apply Changes" : "Confirm Upload"}
           </button>
        </div>
      </div>
    </div>
  );
}
