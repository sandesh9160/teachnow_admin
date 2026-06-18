"use client";

import React, { useState } from "react";
import { Search, Save, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";

export default function HomePageContent() {
  const [seoMeta, setSeoMeta] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [savingMeta, setSavingMeta] = useState(false);

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    // TODO: call API to save SEO meta for Home page
    await new Promise((r) => setTimeout(r, 600));
    toast.success("SEO meta saved successfully");
    setSavingMeta(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 antialiased pt-2">
      {/* ─── HEADER ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-2">
        <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Home Page</h2>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Manage meta tags for the main landing page</p>
        </div>
      </div>

      {/* ─── SEO Meta Section ───────────────────────────────── */}
      <div className="bg-white rounded-md border border-[#cbd5e1] overflow-hidden">
        <div className="bg-white px-5 py-4 border-b border-[#cbd5e1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md border border-[#cbd5e1] bg-white flex items-center justify-center text-[#0ea5e9]">
              <Search size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">SEO Meta Tags</h2>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">Manage search engine visibility for the Home page</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              suppressHydrationWarning
              onClick={handleSaveMeta}
              disabled={savingMeta}
              className="h-9 px-4 rounded border border-[#0284c7] bg-[#0284c7] text-white text-[13px] hover:bg-[#0369a1] transition-all font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingMeta ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {savingMeta ? "Saving..." : "Save Meta"}
            </button>
            <button
              onClick={() => {}}
              className="h-9 px-4 rounded bg-purple-600 text-white text-[13px] hover:bg-purple-700 transition-all font-medium flex items-center gap-2"
            >
              Rewrite with AI
            </button>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-[0.08em] ml-1">
              <Tag size={11} /> Meta Title
            </label>
            <input
              suppressHydrationWarning
              id="home-meta-title"
              type="text"
              placeholder="e.g. TeachNow — Your Gateway to Teaching Opportunities"
              value={seoMeta.meta_title}
              onChange={(e) => setSeoMeta({ ...seoMeta, meta_title: e.target.value })}
              maxLength={60}
              className="w-full h-10 px-4 bg-white border border-slate-300 rounded-md text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
            <p className="text-[10px] text-slate-400 ml-1 font-medium">{seoMeta.meta_title.length}/60 characters recommended</p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-[0.08em] ml-1">
              <Tag size={11} /> Meta Description
            </label>
            <textarea
              id="home-meta-description"
              rows={3}
              placeholder="e.g. Discover the best teaching opportunities worldwide. Join TeachNow to connect with schools and advance your teaching career."
              value={seoMeta.meta_description}
              onChange={(e) => setSeoMeta({ ...seoMeta, meta_description: e.target.value })}
              maxLength={160}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium resize-none"
            />
            <p className="text-[10px] text-slate-400 ml-1 font-medium">{seoMeta.meta_description.length}/160 characters recommended</p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-[0.08em] ml-1">
              <Tag size={11} /> Meta Keywords
            </label>
            <input
              suppressHydrationWarning
              id="home-meta-keywords"
              type="text"
              placeholder="e.g. teaching jobs, education careers, school hiring, teachnow"
              value={seoMeta.meta_keywords}
              onChange={(e) => setSeoMeta({ ...seoMeta, meta_keywords: e.target.value })}
              className="w-full h-10 px-4 bg-white border border-slate-300 rounded-md text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
            <p className="text-[10px] text-slate-400 ml-1 font-medium">Separate keywords with commas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
