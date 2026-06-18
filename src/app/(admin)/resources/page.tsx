"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Loader2,
  LibraryBig,
  Layout,
  Mail,
  Newspaper,
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Globe,
  Trash2,
  ExternalLink,
  Calendar,
  BookOpen,
  User as UserIcon,
  Layers,
  Star,
  FileBadge,
  CheckCircle,
  Pencil,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  toggleResourceVisibility
} from "@/services/admin.service";
import ResourceCard from "@/components/cards/ResourceCard";
import Pagination from "@/components/ui/Pagination";
import dynamic from "next/dynamic";
const TipTapEditor = dynamic(() => import("@/components/ui/TipTapEditor").then(mod => mod.TipTapEditor), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
});
import type { TeachingResource, PaginatedResponse } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;
  return `https://teachnowbackend.jobsvedika.in/${path}`;
};

export default function ManageResourcesPage() {
  const [resources, setResources] = useState<TeachingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [currentResource, setCurrentResource] = useState<TeachingResource | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    author_name: "",
    total_pages: "",
    answer_include: "not_included",
    read_time: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    is_visible: 1,
    is_featured: 0,
  });

  const [files, setFiles] = useState<{
    pdf: File | null;
    resource_photo: File | null;
    author_photo: File | null;
  }>({
    pdf: null,
    resource_photo: null,
    author_photo: null,
  });

  const [previews, setPreviews] = useState<{
    resource: string | null;
    author: string | null;
  }>({
    resource: null,
    author: null,
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
    fetchResources();
  }, [currentPage, search]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await getResources({
        page: currentPage,
        search
      });

      const responseData = (res as any).data;

      if (responseData && 'current_page' in responseData) {
        const paginated = responseData as PaginatedResponse<TeachingResource>;
        setResources(paginated.data || []);
        setTotalPages(paginated.last_page || 1);
        setTotalItems(paginated.total || 0);
      } else {
        const data = Array.isArray(responseData) ? responseData : [];
        setResources(data);
        setTotalPages(1);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      toast.error("Unable to load teaching resources");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentResource(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      author_name: "",
      total_pages: "",
      answer_include: "not_included",
      read_time: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      is_visible: 1,
      is_featured: 0,
    });
    setFiles({ pdf: null, resource_photo: null, author_photo: null });
    setPreviews({ resource: null, author: null });
    setFaqSectionHeading("");
    setFaqs([]);
    setIsEditing(true);
  };

  const handleEdit = (resource: TeachingResource) => {
    setCurrentResource(resource);
    setFormData({
      title: resource.title || "",
      slug: resource.slug || "",
      description: resource.description || "",
      author_name: resource.author_name || "",
      total_pages: resource.total_pages ? resource.total_pages.toString() : "",
      answer_include: resource.answer_include || "not_included",
      read_time: resource.read_time ? resource.read_time.toString() : "",
      meta_title: resource.meta_title || "",
      meta_description: resource.meta_description || "",
      meta_keywords: resource.meta_keywords || "",
      is_visible: resource.is_visible ?? 1,
      is_featured: resource.is_featured ?? 0,
    });
    setFiles({ pdf: null, resource_photo: null, author_photo: null });
    setPreviews({
      resource: resource.resource_photo || null,
      author: resource.author_photo || null
    });
    setFaqSectionHeading((resource as any).faq_heading || "");
    setFaqs((resource as any).faqs || []);
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [field]: file }));

      if (field === 'resource_photo') {
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => ({ ...prev, resource: reader.result as string }));
        reader.readAsDataURL(file);
      } else if (field === 'author_photo') {
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => ({ ...prev, author: reader.result as string }));
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    setSaveLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });

      if (files.pdf) data.append("pdf", files.pdf);
      if (files.resource_photo) data.append("resource_photo", files.resource_photo);
      if (files.author_photo) data.append("author_photo", files.author_photo);

      if (currentResource) {
        // Use POST with _method PUT for Laravel compatibility with file uploads
        data.append("_method", "PUT");
        const res = await updateResource(currentResource.id, data);
        if ((res as any).status === false) {
          throw new Error((res as any).message || "Update failed");
        }
        toast.success("Resource updated");
      } else {
        for (const [key, value] of data.entries()) {
          console.log(key, value);
        }
        const res = await createResource(data);
        console.log("data",data);
        
        if ((res as any).status === false) {
          throw new Error((res as any).message || "Creation failed");
        }
        toast.success("New resource published");
      }

      setIsEditing(false);
      fetchResources();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save resource");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleStatus = async (resource: TeachingResource) => {
    try {
      await toggleResourceVisibility(resource.id);
      fetchResources();
      toast.success("Visibility updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (resource: TeachingResource) => {
    if (!confirm(`Permanently remove "${resource.title}"?`)) return;
    try {
      await deleteResource(resource.id);
      setResources(prev => prev.filter(r => r.id !== resource.id));
      toast.success("Resource deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-[1600px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Editor Header */}
        <div className="sticky top-0 z-[45] flex items-center justify-between bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                {currentResource ? "Edit Resource" : "Create Resource"}
              </h1>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">Teaching & Materials Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-[12px] font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {currentResource ? "Save" : "Publish"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-8 space-y-6">
            {/* Metadata & Author Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2">
                        <Layers size={16} className="text-indigo-600" />
                        <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest">Resource Config</h3>
                    </div>
 
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">Resource Title</label>
                            <input
                                required
                                maxLength={255}
                                type="text"
                                placeholder="e.g. Physics Class 10 Notes"
                                value={formData.title}
                                onChange={e => {
                                  const title = e.target.value;
                                  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                  setFormData({ ...formData, title, slug: currentResource ? formData.slug : slug });
                                }}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-[14px] font-bold text-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
 
                        <div>
                            <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">URL Slug</label>
                            <input
                                maxLength={255}
                                type="text"
                                placeholder="physics-class-10-notes"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[13px] font-medium text-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
 
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">Total Pages</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={formData.total_pages}
                                    onChange={e => setFormData({ ...formData, total_pages: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[13px] font-medium text-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">Read Time (min)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={formData.read_time}
                                    onChange={e => setFormData({ ...formData, read_time: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[13px] font-medium text-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
 
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">Answer Key</label>
                                <select
                                    value={formData.answer_include}
                                    onChange={e => setFormData({ ...formData, answer_include: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[13px] font-medium text-black focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none"
                                >
                                    <option value="included">Included</option>
                                    <option value="not_included">Not Included</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Featured</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_featured: formData.is_featured ? 0 : 1 })}
                                    className={clsx(
                                        "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all font-bold text-[11px] uppercase tracking-tight",
                                        formData.is_featured
                                            ? "bg-amber-50 border-amber-200 text-amber-600 shadow-sm"
                                            : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                                    )}
                                >
                                    <Star size={14} className={formData.is_featured ? "fill-amber-500" : ""} />
                                    {formData.is_featured ? "Featured" : "Regular"}
                                </button>
                            </div>
                        </div>
 
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Visibility Status</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { val: 1, label: "Visible", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
                                    { val: 0, label: "Hidden", icon: AlertCircle, color: "text-slate-400", bg: "bg-slate-50" }
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_visible: opt.val })}
                                        className={clsx(
                                            "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-bold text-[11px] uppercase tracking-tight",
                                            formData.is_visible === opt.val
                                                ? `${opt.bg} border-indigo-600 text-slate-900 shadow-sm`
                                                : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <opt.icon size={14} className={formData.is_visible === opt.val ? opt.color : ""} />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
 
                {/* Author Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2">
                        <UserIcon size={16} className="text-indigo-600" />
                        <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest">Author Details</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">Author Name</label>
                            <input
                                maxLength={255}
                                type="text"
                                placeholder="eg John Doe"
                                value={formData.author_name}
                                onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[13px] font-medium text-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
 
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Author Photo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex-shrink-0 overflow-hidden shadow-sm">
                                    {previews.author ? (
                                        <img src={getImageUrl(previews.author)} alt="Author" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50/50">
                                            <UserIcon size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleFileChange(e, 'author_photo')}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full px-4 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 group-hover:border-indigo-400 group-hover:bg-indigo-50/30 transition-all">
                                        <Upload size={14} className="text-slate-400 group-hover:text-indigo-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {files.author_photo ? "Photo Selected" : "Upload Photo"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Media Files Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-600" />
                    <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest">Resource Assets</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">PDF File (Uploaded)</label>
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={e => handleFileChange(e, 'pdf')}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className={clsx(
                                "w-full px-4 py-5 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 transition-all",
                                files.pdf ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-500 group-hover:border-indigo-400 group-hover:bg-indigo-50"
                            )}>
                                <FileText size={20} />
                                <span className="text-[11px] font-bold uppercase">
                                    {files.pdf ? files.pdf.name : (currentResource?.pdf ? "PDF LOADED" : "Upload Document")}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Cover Image (Uploaded)</label>
                        <div className="relative aspect-[16/9] w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden bg-slate-50 border-slate-200 group hover:border-indigo-300">
                            {previews.resource ? (
                                <img src={getImageUrl(previews.resource)} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 text-center p-4">
                                    <ImageIcon size={32} className="mb-2 text-slate-200" />
                                    <p className="text-[10px] font-bold uppercase">Click to Upload Cover</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleFileChange(e, 'resource_photo')}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers size={16} className="text-indigo-600" />
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Educational Content</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Interactive Editor
                    </span>
                </div>
                <TipTapEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    stickyOffset={82}
                />
            </div>

            {/* SEO Settings Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                      <Globe size={16} className="text-indigo-600" />
                      <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest">SEO Optimization</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm">
                      Rewrite with AI
                    </button>
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm">
                      <Save size={14} />
                      Save Meta Data
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">SEO Title</label>
                            <input
                                maxLength={255}
                                type="text"
                                placeholder="Search engine title..."
                                value={formData.meta_title}
                                onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[13px] font-medium text-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">SEO Keywords</label>
                            <input
                                maxLength={255}
                                type="text"
                                placeholder="keywords separated by commas..."
                                value={formData.meta_keywords}
                                onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-[13px] font-medium text-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2 ml-1">SEO Description</label>
                        <textarea
                            maxLength={1000}
                            placeholder="Briefly describe this resource for search results..."
                            value={formData.meta_description}
                            onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                            className="w-full h-[115px] px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-[13px] font-medium text-black focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                        />
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

  return (
    <div className="space-y-5 pb-12 antialiased animate-fade-in-up">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Teaching Resources</h1>
          <p className="page-subtitle">Manage PDFs, class notes, and learning materials</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-all shadow-sm shadow-blue-600/20 active:scale-95"
          suppressHydrationWarning
        >
          <Plus size={14} /> Add Resource
        </button>
      </div>

      {/* Search */}
      <div className="relative group max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm"
          suppressHydrationWarning
        />
      </div>

      {/* ─── Resources Grid ──────────────────────────────────────────────── */}
      {loading && resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm border-dashed">
          <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading resources catalog...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm border-dashed">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
            <LibraryBig size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No resources found</h3>
          <p className="text-sm text-slate-500 mt-1">Get started by creating a new teaching resource.</p>
          <button
            onClick={handleCreateNew}
            className="mt-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Plus size={18} /> Add First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
