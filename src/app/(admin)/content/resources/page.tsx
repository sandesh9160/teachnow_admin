"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Save,
  Pencil,
  Plus,
  Globe,
  Layout,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("@/components/ui/TipTapEditor").then(mod => mod.TipTapEditor), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
});

export default function ResourcesPage() {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form states (SEO + Search Title)
  const [formData, setFormData] = useState({
    title: "", // Search Title
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  // Custom Section
  const [customSection, setCustomSection] = useState({
    heading: "",
    content: "",
    image: ""
  });

  // Custom CTA
  const [customCTA, setCustomCTA] = useState({
    heading: "",
    subheading: "",
    buttonText: "",
    buttonLink: "",
    image: ""
  });

  // Custom Sub Sections
  const [subSections, setSubSections] = useState<{ id: string, title: string, content: string }[]>([]);

  const addSubSection = () => {
    setSubSections([
      ...subSections,
      { id: Date.now().toString(), title: "", content: "" }
    ]);
  };

  const updateSubSection = (id: string, field: string, value: string) => {
    setSubSections(subSections.map(sub => sub.id === id ? { ...sub, [field]: value } : sub));
  };

  const removeSubSection = (id: string) => {
    setSubSections(subSections.filter(sub => sub.id !== id));
  };

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
    // API mock logic here
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
        customSection,
        customCTA,
        subSections,
        faq_heading: faqSectionHeading,
        faqs: faqs
      };
      
      console.log("🚀 SAVE REQUEST:", payload);
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
    <div suppressHydrationWarning className="space-y-4 pb-12 antialiased max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
            <Layout size={20} />
          </div>
          <div>
            <h4 className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase mb-0.5">CMS Hub</h4>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-slate-900 leading-none">Resources Page</h1>
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
          
          {/* Search Title Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Search Title</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">Edit</button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Search Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter Search Title..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Custom Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Custom Section</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">Edit</button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Section Heading</label>
                <input
                  type="text"
                  value={customSection.heading}
                  onChange={(e) => setCustomSection({ ...customSection, heading: e.target.value })}
                  placeholder="e.g. Find Your Dream Job Today"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Section Content (Rich Text)</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
                  <TipTapEditor
                    value={customSection.content}
                    onChange={(val) => setCustomSection({ ...customSection, content: val })}
                    stickyOffset={0}
                    minHeight="150px"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3 ml-1">Section Image</label>
                <label className="flex items-center gap-6 cursor-pointer group w-fit">
                  <div className="w-36 h-24 border-2 border-slate-100 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden group-hover:border-indigo-200 transition-colors">
                    {customSection.image ? (
                      <img src={customSection.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300 group-hover:text-indigo-300 transition-colors" size={32} />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setCustomSection({ ...customSection, image: url });
                        }
                      }}
                      className="hidden"
                    />
                    <div className="px-5 py-2.5 border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white group-hover:bg-slate-50 group-hover:border-indigo-200 transition-colors shadow-sm">
                      <Upload size={16} className="text-slate-500 group-hover:text-indigo-600 transition-colors" /> Choose File
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Custom Sub Sections */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Custom Sub Sections</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">Edit</button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500 font-medium">Add dynamic sub-sections (e.g. Benefits, Features) below.</p>
                <button type="button" onClick={addSubSection} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all">
                  <Plus size={14} /> Add Sub Section
                </button>
              </div>

              {subSections.map((sub, idx) => (
                <div key={sub.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sub Section {idx + 1}</h4>
                    <button onClick={() => removeSubSection(sub.id)} className="text-rose-500 hover:text-rose-600 p-1.5 bg-rose-50 rounded-md transition-colors" title="Delete Sub Section">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                      <input
                        type="text"
                        value={sub.title}
                        onChange={(e) => updateSubSection(sub.id, "title", e.target.value)}
                        placeholder="e.g. High Salary Jobs"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Content details (Rich Text)</label>
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex-1">
                        <TipTapEditor
                          value={sub.content}
                          onChange={(val) => updateSubSection(sub.id, "content", val)}
                          stickyOffset={0}
                          minHeight="120px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {subSections.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-xl">
                  No custom sub-sections configured. Click "Add Sub Section" to begin.
                </div>
              )}
            </div>
          </div>

          {/* Custom CTA */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Custom CTA</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">Edit</button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">CTA Heading</label>
                  <input
                    type="text"
                    value={customCTA.heading}
                    onChange={(e) => setCustomCTA({ ...customCTA, heading: e.target.value })}
                    placeholder="e.g. Ready to get started?"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">CTA Subheading</label>
                  <input
                    type="text"
                    value={customCTA.subheading}
                    onChange={(e) => setCustomCTA({ ...customCTA, subheading: e.target.value })}
                    placeholder="e.g. Join thousands of users today."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Button Text</label>
                  <input
                    type="text"
                    value={customCTA.buttonText}
                    onChange={(e) => setCustomCTA({ ...customCTA, buttonText: e.target.value })}
                    placeholder="e.g. Apply Now"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Button Link</label>
                  <input
                    type="text"
                    value={customCTA.buttonLink}
                    onChange={(e) => setCustomCTA({ ...customCTA, buttonLink: e.target.value })}
                    placeholder="/apply"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3 ml-1">Upload CTA Background Image</label>
                <label className="flex items-center gap-6 cursor-pointer group w-fit">
                  <div className="w-36 h-24 border-2 border-slate-100 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden group-hover:border-indigo-200 transition-colors">
                    {customCTA.image ? (
                      <img src={customCTA.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300 group-hover:text-indigo-300 transition-colors" size={32} />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setCustomCTA({ ...customCTA, image: url });
                        }
                      }}
                      className="hidden"
                    />
                    <div className="px-5 py-2.5 border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white group-hover:bg-slate-50 group-hover:border-indigo-200 transition-colors shadow-sm">
                      <Upload size={16} className="text-slate-500 group-hover:text-indigo-600 transition-colors" /> Choose File
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">FAQs</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">Edit</button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">FAQ Section Heading</label>
              <input
                type="text"
                value={faqSectionHeading}
                onChange={(e) => setFaqSectionHeading(e.target.value)}
                placeholder="e.g. Pricing FAQs"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
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
