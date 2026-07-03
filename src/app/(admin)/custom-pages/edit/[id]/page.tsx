"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2, Save, ChevronLeft, Globe, FileText, Settings, AlertCircle,
  Plus, Image as ImageIcon, Upload, Pencil, Trash2, ChevronDown, ChevronUp,
  X, Eye, GripVertical, ArrowUp, ArrowDown, LayoutTemplate, MessageSquare,
  CreditCard, Type, List, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("@/components/ui/TipTapEditor").then(mod => mod.TipTapEditor), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
});

// -- Types --
type BlockType = 'hero' | 'rich_text' | 'custom_section' | 'cards' | 'faqs' | 'cta';

interface Block {
  id: string;
  type: BlockType;
  mode: 'edit' | 'preview';
  data: any;
}

export default function EditCustomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const router = useRouter();
  const [saveLoading, setSaveLoading] = useState(false);

  // General Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    status: "published",
    meta_title: "",
    meta_keywords: "",
    meta_description: ""
  });

  // Blocks State
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Simulated Fetch
  useEffect(() => {
    setSaveLoading(true);
    // Simulate an API call to load existing page data
    setTimeout(() => {
      setFormData({
        title: "Sample Edited Page",
        slug: "/sample-edited-page",
        status: "published",
        meta_title: "Sample Meta Title",
        meta_keywords: "sample, page",
        meta_description: "This is a sample edit page."
      });
      // Note: You can populate `setBlocks` with existing blocks here.
      setSaveLoading(false);
    }, 800);
  }, [id]);

  // Helpers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const newSlug = "/" + newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: (prev.slug === "" || prev.slug === "/" + prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
        ? newSlug
        : prev.slug
    }));
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      mode: 'edit',
      data: getDefaultDataForBlock(type)
    };
    setBlocks([...blocks, newBlock]);
    toast.success(`Added ${getBlockName(type)} block`);
  };

  const updateBlock = (id: string, partialData: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...partialData } } : b));
  };

  const toggleMode = (id: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, mode: b.mode === 'edit' ? 'preview' : 'edit' } : b));
  };

  const removeBlock = (id: string) => {
    if (confirm("Remove this block?")) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Page Title is required");
      return;
    }
    if (!formData.slug.trim() || formData.slug === "/") {
      toast.error("URL Slug is required");
      return;
    }

    setSaveLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const payload = {
        ...formData,
        blocks
      };

      console.log("🚀 UPDATING DYNAMIC PAGE:", payload);
      toast.success("Custom page updated successfully");
      router.push("/custom-pages");
    } catch (error) {
      console.error("Failed to update page:", error);
      toast.error("Failed to update page");
      setSaveLoading(false);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-6 pb-24 antialiased max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm sticky top-[80px] lg:top-[90px] z-[60]">
        <div className="flex items-center gap-4">
          <Link href="/custom-pages" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100">
            <ChevronLeft size={20} />
          </Link>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h4 className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase mb-0.5">Dynamic Builder</h4>
              <h1 className="text-lg font-semibold text-slate-900 leading-none">Edit Page</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Blocks Manager */}
        <div className="lg:col-span-8 space-y-6">

          {/* General Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <Settings size={16} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Page Settings</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Page Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. About Our Team"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">URL Slug <span className="text-rose-500">*</span></label>
                  <div className="flex items-stretch">
                    <span className="flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500 font-mono">
                      /
                    </span>
                    <input
                      type="text"
                      value={formData.slug.replace(/^\//, '')}
                      onChange={(e) => setFormData({ ...formData, slug: "/" + e.target.value })}
                      placeholder="about-our-team"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-r-lg text-sm font-mono focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="published">Published (Visible to public)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Blocks List */}
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all">

                {/* Block Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center gap-0.5 opacity-50">
                      <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"><ArrowUp size={14} /></button>
                      <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"><ArrowDown size={14} /></button>
                    </div>
                    <span className="w-px h-6 bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-100 px-2 py-0.5 rounded">
                        Section {index + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {getBlockName(block.type)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden p-0.5 shadow-sm">
                      <button
                        onClick={() => toggleMode(block.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${block.mode === 'edit' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => toggleMode(block.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${block.mode === 'preview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        <Eye size={12} /> Preview
                      </button>
                    </div>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <button onClick={() => removeBlock(block.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Block">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Block Content Body */}
                <div className="p-5 bg-white">
                  {block.mode === 'edit' ? (
                    renderEditMode(block, (partial) => updateBlock(block.id, partial))
                  ) : (
                    renderPreviewMode(block)
                  )}
                </div>
              </div>
            ))}

            {blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                <LayoutTemplate size={48} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">No Sections Added</h3>
                <p className="text-sm text-slate-500 font-medium">Build your page by adding blocks from the menu below.</p>
              </div>
            )}
          </div>

          {/* Add Block Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Add a Section</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => addBlock('hero')} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-700 text-sm font-semibold rounded-lg transition-all">
                <Globe size={16} /> Hero
              </button>
              <button onClick={() => addBlock('rich_text')} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-700 text-sm font-semibold rounded-lg transition-all">
                <Type size={16} /> Rich Text
              </button>
              <button onClick={() => addBlock('custom_section')} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-700 text-sm font-semibold rounded-lg transition-all">
                <FileText size={16} /> Split Section
              </button>
              <button onClick={() => addBlock('cards')} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-700 text-sm font-semibold rounded-lg transition-all">
                <CreditCard size={16} /> Cards Grid
              </button>
              <button onClick={() => addBlock('faqs')} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-700 text-sm font-semibold rounded-lg transition-all">
                <MessageSquare size={16} /> FAQs
              </button>
              <button onClick={() => addBlock('cta')} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-700 text-sm font-semibold rounded-lg transition-all">
                <AlertCircle size={16} /> CTA Banner
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: SEO Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-[160px] lg:top-[180px]">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-indigo-600" />
                <h3 className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">SEO Details</h3>
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
                  placeholder="teaching, education..."
                  value={formData.meta_keywords}
                  onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-900 uppercase tracking-wider mb-1.5 ml-1">Meta Description</label>
                <textarea
                  placeholder="Brief description..."
                  value={formData.meta_description}
                  onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full h-28 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Google Search Preview</p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-0.5 truncate flex items-center gap-1">
                    <Globe size={10} />
                    https://teachnow.com{formData.slug || "/..."}
                  </div>
                  <div className="text-sm text-blue-600 font-semibold truncate hover:underline cursor-pointer mb-1">
                    {formData.meta_title || formData.title || "Page Title Here"}
                  </div>
                  <div className="text-[12px] text-slate-600 line-clamp-2 leading-snug">
                    {formData.meta_description || "Add a descriptive meta description to improve click-through rates."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ================= Helpers for Edit and Preview =================

function getBlockName(type: BlockType) {
  switch (type) {
    case 'hero': return "Hero Header";
    case 'rich_text': return "Rich Text Body";
    case 'custom_section': return "Split Section";
    case 'cards': return "Feature Cards";
    case 'faqs': return "FAQs";
    case 'cta': return "Call to Action";
  }
}

function getDefaultDataForBlock(type: BlockType) {
  switch (type) {
    case 'hero': return {
      heading: "", subheading: "", buttonText: "", buttonLink: "",
      headingSize: "text-4xl", headingColor: "#ffffff",
      subheadingSize: "text-lg", subheadingColor: "#e2e8f0",
      buttonSize: "md", buttonColor: "#0f172a", buttonBgColor: "#ffffff",
      bgColor: "#4f46e5", bgImage: "", alignment: "center"
    };
    case 'rich_text': return { content: "" };
    case 'custom_section': return { heading: "", content: "", image: "", align: "left" };
    case 'cards': return { heading: "", items: [] };
    case 'faqs': return { heading: "", items: [] };
    case 'cta': return { heading: "", subheading: "", buttonText: "", buttonLink: "", buttonUrl: "", buttonText2: "", buttonLink2: "", buttonUrl2: "", buttonBgColor: "#4f46e5", buttonColor: "#ffffff", buttonBgColor2: "#1e293b", buttonColor2: "#ffffff", buttonSize: "lg", buttonSize2: "lg", background: "bg-slate-900" };
  }
}

// ---------------- EDIT MODE RENDERER ----------------
function renderEditMode(block: Block, update: (data: any) => void) {
  const d = block.data;

  if (block.type === 'hero' || block.type === 'cta') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Headline</label>
          <input type="text" value={d.heading} onChange={e => update({ heading: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Subheading</label>
          <input type="text" value={d.subheading} onChange={e => update({ subheading: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Button Text</label>
              <input type="text" value={d.buttonText} onChange={e => update({ buttonText: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
            </div>
            {block.type === 'cta' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Button Link URL</label>
                <input type="text" value={d.buttonUrl || ""} onChange={e => update({ buttonUrl: e.target.value })} placeholder="e.g. /jobs" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">{block.type === 'cta' ? 'Upload Icon / SVG' : 'Button Link'}</label>
            {block.type === 'cta' ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-36 h-24 border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden shrink-0 p-1">
                  {d.buttonLink ? (
                    <img src={d.buttonLink} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-slate-200" size={36} strokeWidth={1.5} />
                  )}
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept=".svg, image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) update({ buttonLink: URL.createObjectURL(file) });
                  }} className="hidden" />
                  <div className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-semibold text-[#1e1e2d] bg-white hover:bg-slate-50 transition-colors shadow-sm">
                    <Upload size={16} className="text-slate-400" /> Choose File
                  </div>
                </label>
              </div>
            ) : (
              <input type="text" value={d.buttonLink} onChange={e => update({ buttonLink: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
            )}
          </div>
        </div>

        {block.type === 'cta' && (
          <>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Secondary Button Text</label>
                  <input type="text" value={d.buttonText2 || ""} onChange={e => update({ buttonText2: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Secondary Button Link URL</label>
                  <input type="text" value={d.buttonUrl2 || ""} onChange={e => update({ buttonUrl2: e.target.value })} placeholder="e.g. /about" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Upload Icon / SVG 2</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-36 h-24 border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden shrink-0 p-1">
                    {d.buttonLink2 ? (
                      <img src={d.buttonLink2} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="text-slate-200" size={36} strokeWidth={1.5} />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input type="file" accept=".svg, image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) update({ buttonLink2: URL.createObjectURL(file) });
                    }} className="hidden" />
                    <div className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-semibold text-[#1e1e2d] bg-white hover:bg-slate-50 transition-colors shadow-sm">
                      <Upload size={16} className="text-slate-400" /> Choose File
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={14} className="text-slate-400" />
                <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">CTA Button Settings</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Button 1 Size</label>
                  <select value={d.buttonSize || "lg"} onChange={e => update({ buttonSize: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500">
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Button 1 Bg</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={d.buttonBgColor || "#4f46e5"} onChange={e => update({ buttonBgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input type="text" value={d.buttonBgColor || "#4f46e5"} onChange={e => update({ buttonBgColor: e.target.value })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Button 1 Text</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={d.buttonColor || "#ffffff"} onChange={e => update({ buttonColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input type="text" value={d.buttonColor || "#ffffff"} onChange={e => update({ buttonColor: e.target.value })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Button 2 Size</label>
                  <select value={d.buttonSize2 || "lg"} onChange={e => update({ buttonSize2: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500">
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Button 2 Bg</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={d.buttonBgColor2 || "#1e293b"} onChange={e => update({ buttonBgColor2: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input type="text" value={d.buttonBgColor2 || "#1e293b"} onChange={e => update({ buttonBgColor2: e.target.value })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Button 2 Text</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={d.buttonColor2 || "#ffffff"} onChange={e => update({ buttonColor2: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input type="text" value={d.buttonColor2 || "#ffffff"} onChange={e => update({ buttonColor2: e.target.value })} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* HERO STYLING SETTINGS */}
        {block.type === 'hero' && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={14} className="text-slate-400" />
              <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Styling & Alignment</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Alignment</label>
                <select value={d.alignment} onChange={e => update({ alignment: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Heading Size</label>
                <select value={d.headingSize} onChange={e => update({ headingSize: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none">
                  <option value="text-2xl">Small (2xl)</option>
                  <option value="text-4xl">Medium (4xl)</option>
                  <option value="text-5xl">Large (5xl)</option>
                  <option value="text-7xl">Huge (7xl)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Button Size</label>
                <select value={d.buttonSize} onChange={e => update({ buttonSize: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none">
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Subheading Size</label>
                <select value={d.subheadingSize} onChange={e => update({ subheadingSize: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none">
                  <option value="text-sm">Small (sm)</option>
                  <option value="text-base">Medium (base)</option>
                  <option value="text-lg">Large (lg)</option>
                  <option value="text-xl">Huge (xl)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-2">
                  Heading Color
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={d.headingColor} onChange={e => update({ headingColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={d.headingColor} onChange={e => update({ headingColor: e.target.value })} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-2">
                  Subheading Color
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={d.subheadingColor} onChange={e => update({ subheadingColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={d.subheadingColor} onChange={e => update({ subheadingColor: e.target.value })} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-2">
                  Button Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={d.buttonColor} onChange={e => update({ buttonColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={d.buttonColor} onChange={e => update({ buttonColor: e.target.value })} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-2">
                  Button BG Color
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" value={d.buttonBgColor} onChange={e => update({ buttonBgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={d.buttonBgColor} onChange={e => update({ buttonBgColor: e.target.value })} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none" />
                </div>
              </div>


              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={d.bgColor} onChange={e => update({ bgColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={d.bgColor} onChange={e => update({ bgColor: e.target.value })} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Background Image</label>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) update({ bgImage: URL.createObjectURL(file) });
                }} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'rich_text') {
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <TipTapEditor value={d.content} onChange={(val) => update({ content: val })} stickyOffset={0} minHeight="200px" />
      </div>
    );
  }

  if (block.type === 'custom_section') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Section Heading</label>
          <input type="text" value={d.heading} onChange={e => update({ heading: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
        </div>
        <div className="flex gap-4 items-center">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Image Align:</label>
          <select value={d.align} onChange={e => update({ align: e.target.value })} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
            <option value="left">Image on Left</option>
            <option value="right">Image on Right</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Content (Rich Text)</label>
          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <TipTapEditor value={d.content} onChange={(val) => update({ content: val })} stickyOffset={0} minHeight="150px" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3 ml-1">Upload SVG / Image</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-36 h-24 border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
              {d.image ? (
                <img src={d.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-slate-200" size={36} strokeWidth={1.5} />
              )}
            </div>
            <label className="cursor-pointer">
              <input type="file" accept=".svg, image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file) update({ image: URL.createObjectURL(file) });
              }} className="hidden" />
              <div className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-semibold text-[#1e1e2d] bg-white hover:bg-slate-50 transition-colors shadow-sm">
                <Upload size={16} className="text-slate-400" /> Choose File
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === 'cards' || block.type === 'faqs') {
    const isFaq = block.type === 'faqs';
    return (
      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">{isFaq ? 'FAQ Heading' : 'Section Heading'}</label>
          <input type="text" value={d.heading} onChange={e => update({ heading: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" />
        </div>
        <div className="space-y-4">
          {d.items.map((item: any, i: number) => (
            <div key={i} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <input type="text" placeholder={isFaq ? "Question..." : "Card Title..."} value={item.title || item.question} onChange={e => {
                  const newItems = [...d.items];
                  if (isFaq) newItems[i].question = e.target.value; else newItems[i].title = e.target.value;
                  update({ items: newItems });
                }} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-indigo-500 outline-none transition-all" />
                <button onClick={() => {
                  const newItems = [...d.items];
                  newItems.splice(i, 1);
                  update({ items: newItems });
                }} className="text-rose-500 hover:text-rose-600 p-2.5 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-all shadow-sm"><Trash2 size={16} /></button>
              </div>

              {!isFaq && (
                <input type="text" placeholder="Card Description..." value={item.description || ""} onChange={e => {
                  const newItems = [...d.items];
                  newItems[i].description = e.target.value;
                  update({ items: newItems });
                }} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:border-indigo-500 outline-none transition-all" />
              )}

              {isFaq ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white mt-2">
                  <TipTapEditor
                    value={item.answer || ""}
                    onChange={val => {
                      const newItems = [...d.items];
                      newItems[i].answer = val;
                      update({ items: newItems });
                    }}
                    stickyOffset={0}
                    minHeight="120px"
                  />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-36 h-24 border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-200" size={36} strokeWidth={1.5} />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        const newItems = [...d.items];
                        newItems[i].image = url;
                        update({ items: newItems });
                      }
                    }} className="hidden" />
                    <div className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-semibold text-[#1e1e2d] bg-white hover:bg-slate-50 transition-colors shadow-sm">
                      <Upload size={16} className="text-slate-400" /> Choose File
                    </div>
                  </label>
                </div>
              )}
            </div>
          ))}
          <button onClick={() => {
            const newItem = isFaq ? { question: "", answer: "" } : { title: "", description: "", image: "" };
            update({ items: [...d.items, newItem] });
          }} className="flex items-center gap-1.5 text-indigo-600 text-[13px] font-bold uppercase tracking-wide hover:text-indigo-700 transition-colors mt-2">
            <Plus size={16} strokeWidth={2.5} /> Add {isFaq ? 'FAQ' : 'Card'}
          </button>
        </div>
      </div>
    );
  }

  return <div>Unknown Edit Type</div>;
}

// ---------------- PREVIEW MODE RENDERER ----------------
function renderPreviewMode(block: Block) {
  const d = block.data;

  if (block.type === 'cta') {
    const btnSizes: Record<string, string> = {
      'sm': 'px-6 py-2.5 text-sm',
      'md': 'px-8 py-3.5 text-base',
      'lg': 'px-10 py-4 text-xl'
    };
    const btnSizeClass = btnSizes[d.buttonSize] || btnSizes['lg'];
    const btnSizeClass2 = btnSizes[d.buttonSize2] || btnSizes['lg'];

    return (
      <div className="py-12 px-4 rounded-2xl flex flex-wrap justify-center items-center gap-6">
        <button 
          className={`${btnSizeClass} rounded-xl font-bold transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-lg shadow-black/20 flex items-center justify-center gap-4`}
          style={{ backgroundColor: d.buttonBgColor || '#4f46e5', color: d.buttonColor || '#ffffff' }}
        >
          {d.buttonLink && d.buttonLink.startsWith('blob:') && (
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded p-1 shrink-0">
              <img src={d.buttonLink} alt="Icon" className="w-full h-full object-contain" />
            </div>
          )}
          {d.buttonText || "Call to Action"}
        </button>
        
        {(d.buttonText2 || d.buttonLink2) && (
          <button 
            className={`${btnSizeClass2} rounded-xl font-bold transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-4`}
            style={{ backgroundColor: d.buttonBgColor2 || '#1e293b', color: d.buttonColor2 || '#ffffff' }}
          >
            {d.buttonLink2 && d.buttonLink2.startsWith('blob:') && (
              <div className="w-10 h-10 bg-white flex items-center justify-center rounded p-1 shrink-0">
                <img src={d.buttonLink2} alt="Icon" className="w-full h-full object-contain" />
              </div>
            )}
            {d.buttonText2 || "Secondary Action"}
          </button>
        )}
      </div>
    );
  }

  if (block.type === 'hero') {
    const isHero = true;

    // Dynamic Hero Styling
    const containerStyle = {
      backgroundColor: d.bgColor || '#4f46e5',
      backgroundImage: d.bgImage ? `url(${d.bgImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      textAlign: d.alignment || 'center'
    };

    const btnSizes: Record<string, string> = {
      'sm': 'px-4 py-2 text-sm',
      'md': 'px-6 py-3 text-base',
      'lg': 'px-8 py-4 text-lg'
    };
    const btnSizeClass = btnSizes[d.buttonSize] || btnSizes['md'];

    return (
      <div 
        className="py-20 px-8 md:py-32 md:px-12 rounded-3xl shadow-2xl text-white relative overflow-hidden transition-all duration-500"
        style={containerStyle as any}
      >
        {/* Removed overlay to show exact uploaded image */}
        
        <div className={`relative z-10 flex flex-col ${d.alignment === 'center' ? 'items-center text-center mx-auto' : d.alignment === 'right' ? 'items-end text-right ml-auto' : 'items-start text-left'} max-w-4xl`}>
          {d.heading && (
            <h2 
              className={`font-extrabold mb-6 tracking-tight leading-tight ${d.headingSize === 'text-4xl' ? 'text-5xl md:text-6xl' : d.headingSize}`}
              style={{ color: d.headingColor || '#ffffff' }}
            >
              {d.heading}
            </h2>
          )}
          
          {d.subheading && (
            <p 
              className={`mb-10 font-medium leading-relaxed max-w-2xl ${d.subheadingSize === 'text-lg' ? 'text-xl md:text-2xl' : d.subheadingSize}`}
              style={{ color: d.subheadingColor || '#e2e8f0' }}
            >
              {d.subheading}
            </p>
          )}

          {d.buttonText && (
            <span 
              className={`inline-block font-bold rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${btnSizeClass}`}
              style={{ backgroundColor: d.buttonBgColor || '#ffffff', color: d.buttonColor || '#0f172a' }}
            >
              {d.buttonText}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (block.type === 'rich_text') {
    return (
      <div className="prose max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: d.content || '<p class="text-slate-400 italic">No content yet...</p>' }} />
    );
  }

  if (block.type === 'custom_section') {
    const isLeft = d.align === 'left';
    return (
      <div className={`flex flex-col ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8`}>
        <div className="flex-1">
          {d.heading && <h3 className="text-2xl font-bold text-slate-900 mb-4">{d.heading}</h3>}
          <div className="prose prose-sm text-slate-600" dangerouslySetInnerHTML={{ __html: d.content || '<p>Content preview...</p>' }} />
        </div>
        <div className="flex-1">
          {d.image ? (
            <img src={d.image} alt="Preview" className="w-full h-auto rounded-xl shadow-md" />
          ) : (
            <div className="w-full aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
              <ImageIcon size={48} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (block.type === 'cards') {
    return (
      <div>
        {d.heading && <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">{d.heading}</h3>}
        {d.items && d.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {d.items.map((item: any, i: number) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                {item.image ? (
                  <img src={item.image} alt={item.title || "Card"} className="w-20 h-20 object-cover rounded-xl mx-auto mb-4 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg mx-auto mb-4"><List size={24} /></div>
                )}
                <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title || "Card Title"}</h4>
                {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 italic">No cards added.</div>
        )}
      </div>
    );
  }

  if (block.type === 'faqs') {
    return (
      <div className="max-w-3xl mx-auto">
        {d.heading && <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">{d.heading}</h3>}
        {d.items && d.items.length > 0 ? (
          <div className="space-y-3">
            {d.items.map((item: any, i: number) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={16} className="text-indigo-600" /> {item.question || "Question?"}</h4>
                <div className="text-sm text-slate-600 mt-2 pl-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.answer || "Answer..." }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 italic">No FAQs added.</div>
        )}
      </div>
    );
  }

  return <div>Preview not available</div>;
}
