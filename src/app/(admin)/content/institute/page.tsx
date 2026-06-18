"use client";


import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  FileText,
  Save,
  Pencil,
  Plus,
  Globe,
  Layout,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

// You may need to replace these with actual API calls for the Institute page
// import { getInstituteData, updateInstituteData } from "@/services/admin.service";

export default function InstitutePage() {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "", // Search Title
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  // FAQ States
  const [faqSectionHeading, setFaqSectionHeading] = useState("");
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);
  
  // FAQ Modal States
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [currentFaqDraft, setCurrentFaqDraft] = useState({ question: "", answer: "" });
  
  // FAQ Expand State
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  const toggleFaqExpand = (index: number) => {
    if (expandedFaqs.includes(index)) {
      setExpandedFaqs(expandedFaqs.filter(i => i !== index));
    } else {
      setExpandedFaqs([...expandedFaqs, index]);
    }
  };

  const openAddFaqModal = () => {
    setEditingFaqIndex(null);
    setCurrentFaqDraft({ question: "", answer: "" });
    setFaqModalOpen(true);
  };

  const openEditFaqModal = (index: number) => {
    setEditingFaqIndex(index);
    setCurrentFaqDraft({ ...faqs[index] });
    setFaqModalOpen(true);
  };

  const saveFaqDraft = () => {
    if (!currentFaqDraft.question.trim()) {
      toast.error("Question is required");
      return;
    }
    if (editingFaqIndex !== null) {
      const newFaqs = [...faqs];
      newFaqs[editingFaqIndex] = currentFaqDraft;
      setFaqs(newFaqs);
    } else {
      setFaqs([...faqs, currentFaqDraft]);
    }
    setFaqModalOpen(false);
  };

  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // try {
    //   setLoading(true);
    //   const res = await getInstituteData();
    //   if (res && res.data) {
    //     setFormData({
    //       title: res.data.title || "",
    //       meta_title: res.data.meta_title || "",
    //       meta_description: res.data.meta_description || "",
    //       meta_keywords: res.data.meta_keywords || "",
    //     });
    //     setFaqSectionHeading(res.data.faq_heading || "");
    //     setFaqs(res.data.faqs || []);
    //   }
    // } catch (error) {
    //   console.error("Failed to fetch data:", error);
    //   toast.error("Failed to fetch content");
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        ...formData,
        faq_heading: faqSectionHeading,
        faqs: faqs
      };
      
      console.log("🚀 SAVE REQUEST:", payload);
      // const res = await updateInstituteData(payload);
      // if (res?.status === false) {
      //   toast.error(res.message || "Failed to update");
      //   return;
      // }
      
      toast.success("Page content updated successfully");
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Operation failed");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 antialiased max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
            <Layout size={20} />
          </div>
          <div>
            <h4 className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase mb-0.5">CMS Hub</h4>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-slate-900 leading-none">Institute Page</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-6">Page Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Search Title</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter Search Title..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => titleInputRef.current?.focus()}
                    className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                  >
                    Edit
                  </button>
                  <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-6">FAQs</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">FAQ Section Heading</label>
              <input
                type="text"
                value={faqSectionHeading}
                onChange={(e) => setFaqSectionHeading(e.target.value)}
                placeholder="e.g. Pricing FAQs"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isExpanded = expandedFaqs.includes(index);
                return (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                          <span className="text-rose-500 font-bold">❓</span> {faq.question || "Untitled Question"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-md border border-slate-200 px-1 py-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => openEditFaqModal(index)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit FAQ"
                        >
                          <Pencil size={13} />
                        </button>
                        <div className="w-px h-4 bg-slate-200" />
                        <button
                          onClick={() => removeFaq(index)}
                          className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          type="button"
                          title="Delete FAQ"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="w-px h-4 bg-slate-200" />
                        <button
                          onClick={() => toggleFaqExpand(index)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          type="button"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white">
                        <div 
                          className="prose prose-sm max-w-none text-slate-700 mt-3" 
                          dangerouslySetInnerHTML={{ __html: faq.answer }} 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={openAddFaqModal}
              className="mt-4 flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors"
            >
              <Plus size={16} /> Add FAQ
            </button>
          </div>
        </div>

        {/* Right Column: SEO details */}
        <div className="lg:col-span-4 space-y-6">
          {/* SEO Gateway */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-indigo-600" />
                <h3 className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">SEO Details</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                >
                  Rewrite with AI
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
                >
                  <Save size={14} />
                  Save SEO
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-semibold text-slate-900 uppercase tracking-wider mb-1.5 ml-1">Meta Title</label>
                <input
                  type="text"
                  placeholder="SEO Title"
                  value={formData.meta_title}
                  onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-900 uppercase tracking-wider mb-1.5 ml-1">Meta Keywords</label>
                <input
                  type="text"
                  placeholder="Keywords..."
                  value={formData.meta_keywords}
                  onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-900 uppercase tracking-wider mb-1.5 ml-1">Meta Description</label>
                <textarea
                  placeholder="SEO description..."
                  value={formData.meta_description}
                  onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full h-24 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FAQ Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editingFaqIndex !== null ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button type="button" onClick={() => setFaqModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question</label>
                <input
                  type="text"
                  value={currentFaqDraft.question}
                  onChange={(e) => setCurrentFaqDraft({ ...currentFaqDraft, question: e.target.value })}
                  placeholder="Enter FAQ question"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Answer</label>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <TipTapEditor
                    value={currentFaqDraft.answer}
                    onChange={(val) => setCurrentFaqDraft({ ...currentFaqDraft, answer: val })}
                    stickyOffset={0}
                    minHeight="250px"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveFaqDraft}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
              >
                Save FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
