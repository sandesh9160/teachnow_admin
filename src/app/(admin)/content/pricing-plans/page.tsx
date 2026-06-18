"use client";

import React, { useState, useEffect } from "react";
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
  Upload,
  Search,
  Check,
  Phone,
  Mail,
  Video,
  Users,
  BookOpen,
  ArrowRight,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("@/components/ui/TipTapEditor").then(mod => mod.TipTapEditor), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
});

// A small dictionary of icons for the dropdown
const LUCIDE_ICONS: Record<string, React.ElementType> = {
  Search,
  Check,
  Phone,
  Mail,
  Video,
  Users,
  BookOpen,
  ArrowRight,
};

type IconRow = {
  id: string;
  lineText: string;
  iconSource: "lucide" | "upload";
  iconName: string;
  iconColor: string;
  iconSize: number;
  uploadedImage: string | null;
};

type HeroCard = {
  id: string;
  title: string;
  image: string | null;
  details: string;
};

type SideCoinCard = {
  id: string;
  line1: string;
  line2: string;
  iconSource: "lucide" | "upload";
  iconName: string;
  iconColor: string;
  uploadedImage: string | null;
};

export default function PricingPlansPage() {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // SEO Meta Details
  const [metaData, setMetaData] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  // Main Section Data
  const [mainData, setMainData] = useState({
    pricingHeading: "Pricing Plans",
    pageSubHeading: "Reach Jobseekers. TeachNow",
    mainSectionHeading: "How TeachNow Connects You with Jobseekers",
    mainButtonText: "View Plans",
    mainSectionContent: "TeachNow helps teachers and institutes get jobseekers and grow their teaching business. Different teachers have different needs, so we offer two simple ways to get jobseekers:",
    closingLine: "You can use either one or both, based on your needs.",
    mainSectionImage: null as string | null,
  });

  // Icon List Rows
  const [iconRows, setIconRows] = useState<IconRow[]>([
    {
      id: "1",
      lineText: "You can reach out to jobseekers",
      iconSource: "lucide",
      iconName: "Search",
      iconColor: "#0f172a",
      iconSize: 16,
      uploadedImage: null
    },
    {
      id: "2",
      lineText: "Jobseekers can find and contact you",
      iconSource: "lucide",
      iconName: "Phone",
      iconColor: "#0f172a",
      iconSize: 16,
      uploadedImage: null
    }
  ]);

  // Hero Highlight Cards
  const [heroCards, setHeroCards] = useState<HeroCard[]>([
    {
      id: "1",
      title: "Subscription - Jobseekers Find You",
      image: null,
      details: "<ul><li>You list your courses and details on TeachNow</li><li>Jobseekers search and find your profile</li></ul>"
    }
  ]);

  // Institute & Plans Section Data
  const [instituteData, setInstituteData] = useState({
    plansSectionHeading: "Choose Your Plan",
    plansSectionSubHeading: "Select the best subscription to post jobs and hire teachers.",
    whyInstitutesHeading: "Why Institutes Choose TeachNow",
    whyInstitutesBulletPoints: "<ul><li>Post jobs and reach thousands of qualified teachers</li><li>Advanced applicant tracking dashboard</li><li>Priority support and featured listings</li></ul>"
  });

  // FAQ States
  const [faqSectionHeading, setFaqSectionHeading] = useState("Frequently Asked Questions");
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [currentFaqDraft, setCurrentFaqDraft] = useState({ question: "", answer: "" });
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const payload = {
        metaData,
        mainData,
        iconRows,
        heroCards,
        instituteData,
        faq_heading: faqSectionHeading,
        faqs,
      };
      console.log("🚀 SAVE PRICING PLANS REQUEST:", payload);
      // await savePricingPlansData(payload);
      
      setTimeout(() => {
        toast.success("Pricing Plans updated successfully");
        setSaveLoading(false);
      }, 800);
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Operation failed");
      setSaveLoading(false);
    }
  };

  // --- Icon Row Actions ---
  const addIconRow = () => {
    setIconRows([...iconRows, {
      id: Math.random().toString(36).substr(2, 9),
      lineText: "",
      iconSource: "lucide",
      iconName: "Check",
      iconColor: "#0f172a",
      iconSize: 16,
      uploadedImage: null
    }]);
  };
  const removeIconRow = (id: string) => setIconRows(iconRows.filter(r => r.id !== id));
  const updateIconRow = (id: string, field: keyof IconRow, value: any) => {
    setIconRows(iconRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  const handleIconRowImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => updateIconRow(id, "uploadedImage", reader.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- Hero Card Actions ---
  const addHeroCard = () => {
    setHeroCards([...heroCards, {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      image: null,
      details: ""
    }]);
  };
  const removeHeroCard = (id: string) => setHeroCards(heroCards.filter(c => c.id !== id));
  const updateHeroCard = (id: string, field: keyof HeroCard, value: any) => {
    setHeroCards(heroCards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const handleHeroCardImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => updateHeroCard(id, "image", reader.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- FAQ Actions ---
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
              <h1 className="text-lg font-semibold text-slate-900 leading-none">Pricing Plans Page</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
        {/* Left Column: Main Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Section Content (Heading + Content + Image) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Main Section Content</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">Edit</button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Pricing Section Heading</label>
                  <input
                    type="text"
                    value={mainData.pricingHeading}
                    onChange={(e) => setMainData({ ...mainData, pricingHeading: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Main Button Text</label>
                  <input
                    type="text"
                    value={mainData.mainButtonText}
                    onChange={(e) => setMainData({ ...mainData, mainButtonText: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Main Section Heading</label>
                <input
                  type="text"
                  value={mainData.mainSectionHeading}
                  onChange={(e) => setMainData({ ...mainData, mainSectionHeading: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Page Sub Heading</label>
                <textarea
                  value={mainData.pageSubHeading}
                  onChange={(e) => setMainData({ ...mainData, pageSubHeading: e.target.value })}
                  className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Main Section Content (Rich Text)</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
                  <TipTapEditor
                    value={mainData.mainSectionContent}
                    onChange={(val) => setMainData({ ...mainData, mainSectionContent: val })}
                    stickyOffset={0}
                    minHeight="150px"
                  />
                </div>
              </div>

              {/* Icon List Configuration */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Main Section Icon List</label>
                  <button type="button" onClick={addIconRow} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded">
                    <Plus size={12} /> Add Row
                  </button>
                </div>

                <div className="space-y-4">
                  {iconRows.map((row) => {
                    const SelectedIcon = LUCIDE_ICONS[row.iconName] || Check;
                    return (
                      <div key={row.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative group">
                        <button onClick={() => removeIconRow(row.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 p-1 bg-white rounded-md border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                          <div className="md:col-span-12">
                            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Line text</label>
                            <input
                              type="text"
                              value={row.lineText}
                              onChange={(e) => updateIconRow(row.id, "lineText", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all"
                            />
                          </div>
                          
                          <div className="md:col-span-12 flex gap-4">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Icon source:</label>
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                                  <input type="radio" checked={row.iconSource === "lucide"} onChange={() => updateIconRow(row.id, "iconSource", "lucide")} className="text-indigo-600" />
                                  Lucide
                                </label>
                                <label className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                                  <input type="radio" checked={row.iconSource === "upload"} onChange={() => updateIconRow(row.id, "iconSource", "upload")} className="text-indigo-600" />
                                  Upload image
                                </label>
                              </div>
                            </div>
                          </div>

                          {row.iconSource === "lucide" ? (
                            <>
                              <div className="md:col-span-4">
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Icon</label>
                                <select 
                                  value={row.iconName} 
                                  onChange={(e) => updateIconRow(row.id, "iconName", e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all"
                                >
                                  {Object.keys(LUCIDE_ICONS).map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-4">
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Color</label>
                                <input 
                                  type="color" 
                                  value={row.iconColor} 
                                  onChange={(e) => updateIconRow(row.id, "iconColor", e.target.value)}
                                  className="w-full h-9 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                                />
                              </div>
                              <div className="md:col-span-4">
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Size (px)</label>
                                <input 
                                  type="number" 
                                  value={row.iconSize} 
                                  onChange={(e) => updateIconRow(row.id, "iconSize", parseInt(e.target.value) || 16)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="md:col-span-12">
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Upload Icon (PNG/SVG)</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleIconRowImageUpload(row.id, e)}
                                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
                                />
                            </div>
                          )}
                        </div>

                        {/* Live Preview */}
                        <div className="p-3 bg-white border border-slate-200 border-dashed rounded-lg">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preview</span>
                          <div className="flex items-center gap-3">
                            {row.iconSource === "lucide" ? (
                              <SelectedIcon size={row.iconSize} color={row.iconColor} />
                            ) : row.uploadedImage ? (
                              <img src={row.uploadedImage} alt="icon" style={{ width: row.iconSize, height: row.iconSize }} className="object-contain" />
                            ) : (
                              <div style={{ width: row.iconSize, height: row.iconSize }} className="bg-slate-100 rounded" />
                            )}
                            <span className="text-slate-800 font-medium">{row.lineText || "Line text..."}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Closing line under list (Rich Content)</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
                  <TipTapEditor
                    value={mainData.closingLine}
                    onChange={(val) => setMainData({ ...mainData, closingLine: val })}
                    stickyOffset={0}
                    minHeight="120px"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Main Section Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-40 aspect-video rounded-xl bg-slate-50 border border-slate-200 flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                    {mainData.mainSectionImage ? (
                      <img src={mainData.mainSectionImage} alt="Main Section" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onloadend = () => setMainData({ ...mainData, mainSectionImage: reader.result as string });
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="px-4 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg flex items-center gap-2 transition-all">
                      <Upload size={14} className="text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">Choose File</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Highlight Cards */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Hero Highlight Cards</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">Edit</button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500 font-medium">Configure core cards (like Subscription or Coins). Use card title, image, and bullet points.</p>
                <button type="button" onClick={addHeroCard} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all">
                  <Plus size={14} /> Add Card
                </button>
              </div>
              
              {heroCards.map((card, idx) => (
                <div key={card.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Card {idx + 1}</h4>
                    <button onClick={() => removeHeroCard(card.id)} className="text-rose-500 hover:text-rose-600 p-1.5 bg-rose-50 rounded-md transition-colors" title="Delete Card">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Card Title</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateHeroCard(card.id, "title", e.target.value)}
                        placeholder="e.g. Subscription - Jobseekers Find You"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Upload Image</label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleHeroCardImageUpload(card.id, e)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                          />
                          <div className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg flex items-center gap-2 transition-all">
                            <span className="text-sm font-semibold text-slate-700">{card.image ? "Change File" : "Choose File"}</span>
                          </div>
                        </div>
                        {card.image && (
                          <div className="h-8 w-auto border border-slate-200 rounded overflow-hidden">
                            <img src={card.image} alt="Preview" className="h-full w-auto object-cover" />
                          </div>
                        )}
                        {!card.image && <span className="text-xs text-slate-400 font-medium">No file chosen</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Card details rich content</label>
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex-1">
                        <TipTapEditor
                          value={card.details}
                          onChange={(val) => updateHeroCard(card.id, "details", val)}
                          stickyOffset={0}
                          minHeight="120px"
                        />
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="pt-2">
                      <div className="p-4 bg-white border border-slate-200 border-dashed rounded-lg">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3">Live Card Preview</span>
                        <div className="max-w-sm mx-auto border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                          {card.image ? (
                            <img src={card.image} alt="Hero Card" className="w-full h-40 object-cover" />
                          ) : (
                            <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400">
                              <ImageIcon size={32} />
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{card.title || "Card Title..."}</h3>
                            <div 
                              className="prose prose-sm prose-slate max-w-none text-slate-600"
                              dangerouslySetInnerHTML={{ __html: card.details || "Card details will appear here..." }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {heroCards.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-xl">
                  No highlight cards configured. Click "Add Card" to begin.
                </div>
              )}
            </div>
          </div>

          {/* Institute & Plans Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Plans & Institutes Section</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">Edit</button>
                <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Plans Section Heading</label>
                  <input
                    type="text"
                    value={instituteData.plansSectionHeading}
                    onChange={(e) => setInstituteData({ ...instituteData, plansSectionHeading: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Why Institutes Heading</label>
                  <input
                    type="text"
                    value={instituteData.whyInstitutesHeading}
                    onChange={(e) => setInstituteData({ ...instituteData, whyInstitutesHeading: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Plans Section Sub Heading</label>
                <textarea
                  value={instituteData.plansSectionSubHeading}
                  onChange={(e) => setInstituteData({ ...instituteData, plansSectionSubHeading: e.target.value })}
                  className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Why Institutes Choose TeachNow (Bullet Points)</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
                  <TipTapEditor
                    value={instituteData.whyInstitutesBulletPoints}
                    onChange={(val) => setInstituteData({ ...instituteData, whyInstitutesBulletPoints: val })}
                    stickyOffset={0}
                    minHeight="150px"
                  />
                </div>
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
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-[100px]">
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
                  value={metaData.meta_title}
                  onChange={e => setMetaData({ ...metaData, meta_title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-900 uppercase tracking-wider mb-1.5 ml-1">Meta Keywords</label>
                <input
                  type="text"
                  placeholder="Keywords..."
                  value={metaData.meta_keywords}
                  onChange={e => setMetaData({ ...metaData, meta_keywords: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-900 uppercase tracking-wider mb-1.5 ml-1">Meta Description</label>
                <textarea
                  placeholder="SEO description..."
                  value={metaData.meta_description}
                  onChange={e => setMetaData({ ...metaData, meta_description: e.target.value })}
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
