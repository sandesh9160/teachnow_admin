"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Check, Loader2, Globe } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

interface SEOData {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface SEOEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SEOData) => Promise<void>;
  initialData?: SEOData;
  title: string;
  subtitle?: string;
}

export default function SEOEditModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  title,
  subtitle = "Configure SEO metadata for better search visibility",
}: SEOEditModalProps) {
  const [data, setData] = useState<SEOData>({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData({
        meta_title: initialData.meta_title || "",
        meta_description: initialData.meta_description || "",
        meta_keywords: initialData.meta_keywords || "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(data);
      onClose();
    } catch (err: any) {
      // Error handling is usually done in the parent via toast, but we can add more if needed
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900 leading-none">
                {title}
              </h3>
              <p className="text-[11px] text-surface-400 font-medium mt-1.5">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-100 rounded-lg text-surface-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1.5">
                Meta Title
              </label>
              <input
                type="text"
                placeholder="SEO Page Title"
                value={data.meta_title}
                onChange={(e) => setData({ ...data, meta_title: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl text-[13px] text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
              <p className="text-[10px] text-surface-400 mt-1 ml-1">
                Recommended length: 50-60 characters
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1.5">
                Meta Keywords
              </label>
              <input
                type="text"
                placeholder="teacher, jobs, delhi, mathematics"
                value={data.meta_keywords}
                onChange={(e) =>
                  setData({ ...data, meta_keywords: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl text-[13px] text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
              <p className="text-[10px] text-surface-400 mt-1 ml-1">
                Separate keywords with commas
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block mb-1.5">
                Meta Description
              </label>
              <textarea
                rows={4}
                placeholder="Provide a brief summary of the page for search results..."
                value={data.meta_description}
                onChange={(e) =>
                  setData({ ...data, meta_description: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl text-[13px] text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none font-medium"
              />
              <p className="text-[10px] text-surface-400 mt-1 ml-1">
                Recommended length: 150-160 characters
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-surface-500 hover:bg-surface-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-[13px] font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Check size={16} /> Update SEO
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
