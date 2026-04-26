"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, FileText, Image as ImageIcon, Loader2, Save, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

interface BlogEditorProps {
  onBack: () => void;
  onSave: (formData: FormData) => Promise<void>;
  blog?: any;
}

const getFullFileUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

export default function BlogEditor({ onBack, onSave, blog }: BlogEditorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    alt_image_text: "",
    content: "",
    is_active: 1,
  });

  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        meta_title: blog.meta_title || "",
        meta_keywords: blog.meta_keywords || "",
        meta_description: blog.meta_description || "",
        alt_image_text: blog.alt_image_text || "",
        content: blog.content || "",
        is_active: (blog.is_active === "1" || blog.is_active === 1 || blog.is_active === true) ? 1 : 0,
      });
      setImagePreview(getFullFileUrl(blog.image || blog.featured_image));
    } else {
      setFormData({
        title: "",
        slug: "",
        meta_title: "",
        meta_keywords: "",
        meta_description: "",
        alt_image_text: "",
        content: "",
        is_active: 1,
      });
      setImagePreview(null);
    }
    setFeaturedImage(null);
  }, [blog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked ? 1 : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === "title" && !blog) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      if (featuredImage) {
        submitData.append("featured_image", featuredImage);
      }

      if (blog) {
        submitData.append("_method", "PUT");
      }

      await onSave(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Editor Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {blog ? "Edit Blog" : "Create Blog"}
            </h1>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {blog ? `Updating: ${blog.title}` : "Publish fresh content to the blog"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            form="blogForm"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {blog ? "Update Blog" : "Publish Blog"}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Blog Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a compelling title..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-lg font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-50">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Blog Content</label>
                <span className="text-[10px] font-bold text-indigo-500 px-2 py-0.5 bg-indigo-50 rounded tracking-tight">Rich Text Enabled</span>
              </div>
              <TipTapEditor
                value={formData.content}
                onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                placeholder="Start writing your masterpiece here..."
                blogId={blog?.id}
              />
            </div>
          </div>
        </div>

        {/* Sidebar / Settings Area */}
        <div className="space-y-4">
          {/* Publication Settings */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              Blog Settings
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">URL Slug</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                placeholder="url-friendly-slug"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Meta Title</label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                placeholder="SEO title tag..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Meta Keywords</label>
              <input
                type="text"
                name="meta_keywords"
                value={formData.meta_keywords}
                onChange={handleChange}
                placeholder="comma, separated, keywords..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Meta Description</label>
              <textarea
                name="meta_description"
                rows={3}
                value={formData.meta_description}
                onChange={handleChange}
                placeholder="Brief summary for search engines..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-slate-50">
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex-1">
                  <p className="text-xs font-bold text-indigo-900 uppercase">Visibility</p>
                  <p className="text-[10px] text-indigo-600/70 font-medium">Draft vs Public</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: prev.is_active === 1 ? 0 : 1 }))}
                  className={clsx(
                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                    formData.is_active === 1 ? "bg-indigo-600" : "bg-slate-300"
                  )}
                >
                  <div className={clsx(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                    formData.is_active === 1 ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
             <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 px-1">
              <ImageIcon size={16} className="text-indigo-600" />
              Featured Image
            </h3>
            <div className="relative group aspect-video rounded-xl overflow-hidden border-2 border-dashed border-slate-100 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => { setFeaturedImage(null); setImagePreview(null); }}
                      className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold border border-white/30 hover:bg-white/40"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 mb-1 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                    <Upload size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Banner</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Alt Image Text</label>
              <input
                type="text"
                name="alt_image_text"
                value={formData.alt_image_text}
                onChange={handleChange}
                placeholder="Describe image for accessibility..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center italic">Recommended size: 1200 x 630px</p>
          </div>
        </div>
      </div>

      <form id="blogForm" onSubmit={handleSubmit} className="hidden" />
    </div>
  );
}
