"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, MessageSquare, Upload, Star, UserCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { createTestimonial, updateTestimonial } from "@/services/admin.service";
import type { Testimonial } from "@/types";
import { resolveMediaUrl } from "@/lib/media";

interface CMSTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: Testimonial | null;
}

export default function CMSTestimonialModal({ isOpen, onClose, onSuccess, item }: CMSTestimonialModalProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    company: "",
    message: "",
    rating: 5,
    display_order: 0,
    is_active: 1,
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          name: item.name || "",
          designation: item.designation || "",
          company: item.company || "",
          message: item.message || "",
          rating: item.rating || 5,
          display_order: item.display_order || 0,
          is_active: item.is_active !== undefined ? (Boolean(Number(item.is_active)) ? 1 : 0) : 1,
        });
        setPreviewUrl(item.photo ? resolveMediaUrl(item.photo) : null);
      } else {
        setFormData({
          name: "",
          designation: "",
          company: "",
          message: "",
          rating: 5,
          display_order: 0,
          is_active: 1,
        });
        setPreviewUrl(null);
      }
      setSelectedFile(null);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("designation", formData.designation);
      data.append("company", formData.company || "");
      data.append("message", formData.message);
      data.append("rating", formData.rating.toString());
      data.append("display_order", formData.display_order.toString());
      data.append("is_active", formData.is_active ? "1" : "0");
      
      if (selectedFile) {
        data.append("photo", selectedFile);
      }

      if (item?.id) {
        await updateTestimonial(item.id, data);
        toast.success("Testimonial updated successfully");
      } else {
        await createTestimonial(data);
        toast.success("Testimonial created successfully");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save testimonial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-100 animate-slide-up max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <MessageSquare size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">
                {item ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                Share what others say about the platform.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-90"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          <div className="p-5 space-y-4">
            
            {/* Reviewer Info & Photo Row */}
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Reviewer Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Designation</label>
                  <input 
                    type="text"
                    required
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="e.g. CEO or Employer"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Company</label>
                  <input 
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Tech Solutions"
                  />
                </div>
              </div>

              {/* Compact Photo Upload */}
              <div className="shrink-0 flex flex-col items-center">
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider w-full">Reviewer Photo</label>
                <div className="relative w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden group hover:border-indigo-300 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <Upload size={20} className="text-slate-300 group-hover:text-indigo-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Upload</span>
                        </div>
                    )}
                    {previewUrl && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload size={20} className="text-white" />
                        </div>
                    )}
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Testimonial Message</label>
              <textarea 
                required
                rows={3}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none leading-snug"
                placeholder="Share the feedback here..."
              />
            </div>

            {/* Rating & Order Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Rating</label>
                  <div className="flex items-center gap-1 h-[38px] px-3 bg-white border border-slate-200 rounded-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-transform active:scale-125"
                      >
                        <Star 
                          size={14} 
                          className={clsx(
                            "transition-colors",
                            formData.rating >= star ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wider">Display Order</label>
                  <input 
                    type="number"
                    required
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 h-[38px] bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  {/* Status removed from modal as per request */}
                </div>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/30 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-7 py-2 bg-indigo-600 text-[12px] font-bold text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {item ? "Save Changes" : "Create Testimonial"}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
