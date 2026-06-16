"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Edit2, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Loader2,
  Tag,
} from "lucide-react";
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from "@/services/admin.service";
import { FAQ } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";


export default function FAQPage() { 
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // SEO Meta State (static for now — wire to API later)
  const [seoMeta, setSeoMeta] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [savingMeta, setSavingMeta] = useState(false);

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    // TODO: call API to save SEO meta for FAQs page
    await new Promise((r) => setTimeout(r, 600));
    toast.success("SEO meta saved successfully");
    setSavingMeta(false);
  };
  
  // Form State
  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: "",
    answer: "",
    display_order: 1,
    is_active: 1,
    meta_title: "",
    meta_description: "",
    meta_keywords: ""
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await getFAQs();
      // Adjust based on the actual response structure provided by user
      if (res && res.data) {
        setFaqs(res.data);
      }
    } catch (err) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await deleteFAQ(id);
      setFaqs(faqs.filter(f => f.id !== id));
      toast.success("FAQ deleted");
    } catch (err) {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await updateFAQ(editingFaq.id, formData);
        toast.success("FAQ updated successfully");
      } else {
        await createFAQ(formData);
        toast.success("FAQ created successfully");
      }
      setIsModalOpen(false);
      setEditingFaq(null);
      resetForm();
      fetchFaqs();
    } catch (err) {
      toast.error(editingFaq ? "Update failed" : "Creation failed");
    }
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active ? 1 : 0,
      meta_title: faq.meta_title || "",
      meta_description: faq.meta_description || "",
      meta_keywords: faq.meta_keywords || ""
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      display_order: faqs.length + 1,
      is_active: 1,
      meta_title: "",
      meta_description: "",
      meta_keywords: ""
    });
  };

  const filteredFaqs = faqs.filter(faq => 
    (faq.question?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (faq.answer?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-3 pb-20 antialiased pt-2">
      {/* ─── HEADER ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-2">
        <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">FAQs</h2>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Manage support questions and answers</p>
        </div>

        <button
          onClick={() => { setEditingFaq(null); resetForm(); setIsModalOpen(true); }}
          className="bg-violet-600 text-white px-4 py-1.5 rounded-lg font-bold text-[11px] active:scale-95"
        >
          Add FAQ
        </button>
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
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">Manage search engine visibility for the FAQs page</p>
            </div>
          </div>
          <button
            onClick={handleSaveMeta}
            disabled={savingMeta}
            className="h-9 px-4 rounded border border-[#0284c7] bg-[#0284c7] text-white text-[13px] hover:bg-[#0369a1] transition-all font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingMeta ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {savingMeta ? "Saving..." : "Save Meta"}
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-[0.08em] ml-1">
              <Tag size={11} /> Meta Title
            </label>
            <input
              id="faqs-meta-title"
              type="text"
              placeholder="e.g. FAQs | TeachNow — Frequently Asked Questions"
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
              id="faqs-meta-description"
              rows={3}
              placeholder="e.g. Find answers to the most common questions about TeachNow's platform, hiring process, and teacher resources."
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
              id="faqs-meta-keywords"
              type="text"
              placeholder="e.g. faqs, teachnow, teacher questions, school hiring, education platform"
              value={seoMeta.meta_keywords}
              onChange={(e) => setSeoMeta({ ...seoMeta, meta_keywords: e.target.value })}
              className="w-full h-10 px-4 bg-white border border-slate-300 rounded-md text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
            <p className="text-[10px] text-slate-400 ml-1 font-medium">Separate keywords with commas</p>
          </div>
        </div>
      </div>

      {/* ─── FILTERS ────────────────────────────────────────────── */}
      <div className="bg-violet-600/5 p-2 rounded-xl flex items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white rounded-lg text-xs font-bold focus:outline-hidden border-none shadow-xs"
          />
        </div>
        <div className="text-[10px] font-bold text-violet-600 pr-3">
            {filteredFaqs.length} entries
        </div>
      </div>

      {/* ─── FAQ LIST ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        {loading ? (
          <div className="py-20 text-center">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div 
              key={faq.id} 
              className={clsx(
                "group rounded-xl overflow-hidden",
                expandedId === faq.id ? "bg-violet-50/50" : "bg-white"
              )}
            >
              <div className="p-3 flex items-start gap-3">
                 <div className="shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-100 text-violet-600 font-bold">
                        {faq.display_order}
                    </div>
                 </div>

                 <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                        <div 
                          className="flex items-center gap-2 min-w-0 cursor-pointer w-full"
                          onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                        >
                            <h3 className="text-[13px] font-bold truncate transition-none text-slate-900">
                                {faq.question}
                            </h3>
                            {expandedId === faq.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                           <button 
                            onClick={() => openEditModal(faq)}
                            className="p-1.5 text-slate-500 hover:text-violet-600"
                           >
                             <Edit2 size={15} />
                           </button>
                           <button 
                            onClick={() => handleDelete(faq.id)}
                            className="p-1.5 text-slate-500 hover:text-orange-600"
                           >
                             <Trash2 size={15} />
                           </button>
                        </div>
                    </div>
                    
                    {expandedId === faq.id && (
                      <div 
                        className="mt-2 text-[12px] text-slate-600 leading-normal font-medium border-t border-slate-200/50 pt-2 animate-none prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    )}

                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-violet-600/5 rounded-xl border border-dashed border-violet-100">
             <p className="text-[11px] font-bold text-violet-400">Database is empty</p>
          </div>
        )}
      </div>

      {/* ─── CREATION MODAL ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
           <div className="bg-white w-full max-w-4xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">


              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{editingFaq ? "Edit FAQ" : "New FAQ"}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                  <div>
                      <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Question</label>
                      <input 
                        required
                        type="text"
                        value={formData.question}
                        onChange={e => setFormData({...formData, question: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                  </div>

                  <div>
                      <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Answer</label>
                      <TipTapEditor 
                        value={formData.answer || ""}
                        onChange={(content) => setFormData({ ...formData, answer: content })}
                      />

                  </div>


                      <div className="col-span-2">
                          <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Order</label>
                          <input 
                            type="number"
                            value={formData.display_order}
                            onChange={e => setFormData({...formData, display_order: Number(e.target.value)})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                      </div>

                  <div className="flex items-center gap-2 pt-4">
                      <button 
                        type="submit"
                        className="flex-1 py-2.5 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg"
                      >
                        {editingFaq ? "Save" : "Create"}
                      </button>
                  </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
