"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  FileText,
  ExternalLink,
  Calendar,
  Save,
  Pencil,
  Plus,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Globe,
  // Search,
  Layout,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { getBlogs, toggleBlogStatus, deleteBlog, updateBlog, createBlog } from "@/services/admin.service";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

export default function BlogsPage() {
  const getImageUrl = (path: any) => {
    if (!path || typeof path !== 'string') return undefined;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const baseUrl = "https://teachnowbackend.jobsvedika.in";
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    is_active: 1
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getBlogs();
      if (res && res.data) {
        setBlogs(res.data);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to fetch blog content");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: any) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      content: blog.content || "",
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || "",
      meta_keywords: blog.meta_keywords || "",
      is_active: blog.is_active === "1" || blog.is_active === 1 || blog.is_active === true ? 1 : 0
    });
    setPreview(blog.image || null);
    setFile(null);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentBlog(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      is_active: 1
    });
    setFile(null);
    setPreview(null);
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error("Content cannot be empty");
      return;
    }

    setSaveLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("slug", formData.slug.trim());
      data.append("content", formData.content);
      data.append("meta_title", formData.meta_title || formData.title);
      data.append("meta_description", formData.meta_description || "");
      data.append("meta_keywords", formData.meta_keywords || "");
      data.append("is_active", String(formData.is_active));
      data.append("alt_image_text", formData.title); // Default alt text to title

      if (file) {
        data.append("image", file);
        data.append("featured_image", file);
      }
      // Removed: appending preview string as image, as it often causes 500 errors 
      // when the backend expects a multipart file for the 'image' field.

      if (currentBlog) {
        console.log("🚀 BLOG EDIT REQUEST:", {
          id: currentBlog.id,
          payload: Object.fromEntries(data.entries())
        });
        const updateRes: any = await updateBlog(currentBlog.id, data);
        console.log("✅ BLOG EDIT RESPONSE:", JSON.stringify(updateRes, null, 2));
        
        if (updateRes?.status === false) {
          toast.error(updateRes.message || "Failed to update blog");
          return;
        }
        toast.success("Blog updated successfully");
      } else {
        console.log("🚀 BLOG CREATE REQUEST:", {
          payload: Object.fromEntries(data.entries())
        });
        const createRes: any = await createBlog(data);
        console.log("✅ BLOG CREATE RESPONSE:", JSON.stringify(createRes, null, 2));

        // If response is empty but request succeeded (Axios didn't throw)
        if (!createRes || createRes.status === false) {
          if (createRes?.message) {
            toast.error(createRes.message);
            return;
          }
          // If it's just empty but no error was thrown, it might have succeeded if status 200
          // But usually we expect a status: true
        }
        toast.success("New blog published");
      }

      setIsEditing(false);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to save blog:", error);
      toast.error("Operation failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (blog: any) => {
    if (!confirm(`Permanently remove "${blog.title}"?`)) return;
    try {
      await deleteBlog(blog.id);
      setBlogs(prev => prev.filter(b => b.id !== blog.id));
      toast.success("Blog deleted successfully");
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const handleToggleStatus = async (blog: any) => {
    const previousStatus = blog.is_active;
    const newStatus = previousStatus === 1 || previousStatus === "1" || previousStatus === true ? 0 : 1;

    // Optimistic update
    setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_active: newStatus } : b));

    try {
      const res: any = await toggleBlogStatus(blog.id, { is_active: newStatus });
      if (res?.status === false) {
        toast.error(res.message || "Failed to update status");
        setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_active: previousStatus } : b));
        return;
      }
      toast.success(`Blog ${newStatus ? 'published' : 'moved to drafts'}`);
    } catch (error) {
      toast.error("Connection failed");
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_active: previousStatus } : b));
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-[1600px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Editor Header - Sticky */}
        <div className="sticky top-0 z-[45] flex items-center justify-between bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {currentBlog ? "Edit Article" : "New Article"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">CMS & SEO Editor</p>
              </div>
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
              {currentBlog ? "Save" : "Publish"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
              {/* Featured Image */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-indigo-600" />
                  <h3 className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">Featured Image</h3>
                </div>

                <div className={clsx(
                  "relative aspect-video w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden bg-slate-50",
                  file || preview ? "border-indigo-200" : "border-slate-200 hover:bg-white hover:border-indigo-300"
                )}>
                  {preview ? (
                    <img src={getImageUrl(preview)} alt="Featured" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 text-center px-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-2 shadow-sm">
                        <Upload size={18} className="text-indigo-600" />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-900 uppercase">Upload Image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {(file || preview) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur p-1.5 rounded-lg shadow text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Featured Image URL</label>
                <input
                  type="text"
                  placeholder="https://unsplash.com/..."
                  value={typeof preview === 'string' && !preview.startsWith('data:') ? preview : ""}
                  onChange={e => {
                    setPreview(e.target.value);
                    setFile(null);
                  }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Metadata */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Layout size={14} className="text-indigo-600" />
                  <h3 className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">General</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Title</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter title..."
                      value={formData.title}
                      onChange={e => {
                        const newTitle = e.target.value;
                        const updates: any = { title: newTitle };
                        if (!currentBlog) {
                          updates.slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                          // Auto-fill meta title if empty
                          if (!formData.meta_title) {
                            updates.meta_title = newTitle;
                          }
                        }
                        setFormData({ ...formData, ...updates });
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">URL Slug</label>
                    <input
                      type="text"
                      placeholder="article-url-slug"
                      value={formData.slug}
                      onChange={e => {
                        let val = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setFormData({ ...formData, slug: val });
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 1, label: "Live", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                        { val: 0, label: "Draft", icon: AlertCircle, color: "text-slate-400", bg: "bg-slate-50" }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={async () => {
                            if (formData.is_active === opt.val) return;
                            
                            const previousVal = formData.is_active;
                            const newVal = opt.val;
                            
                            // Update local form state immediately
                            setFormData(prev => ({ ...prev, is_active: newVal }));
                            
                            if (currentBlog?.id) {
                              try {
                                const res: any = await toggleBlogStatus(currentBlog.id, { is_active: newVal });
                                if (res?.status === false) {
                                  toast.error(res.message || "Failed to update status");
                                  setFormData(prev => ({ ...prev, is_active: previousVal }));
                                  return;
                                }
                                toast.success(`Status changed to ${opt.label}`);
                                
                                // Update the blogs list locally to reflect in the header counts
                                setBlogs(prev => prev.map(b => 
                                  b.id === currentBlog.id ? { ...b, is_active: newVal } : b
                                ));
                              } catch (e) {
                                toast.error("Connection failed");
                                setFormData(prev => ({ ...prev, is_active: previousVal }));
                              }
                            }
                          }}
                          className={clsx(
                            "flex items-center justify-center gap-2 py-2 rounded-lg border transition-all font-semibold text-[11px] uppercase tracking-tight",
                            formData.is_active === opt.val
                              ? `${opt.bg} border-indigo-600 text-slate-900`
                              : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          <opt.icon size={12} className={formData.is_active === opt.val ? opt.color : ""} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Gateway */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-indigo-600" />
                  <h3 className="text-[10px] font-semibold text-slate-900 uppercase tracking-wider">CMS & SEO Editor</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Meta Title</label>
                    <input
                      type="text"
                      placeholder="SEO Title"
                      value={formData.meta_title}
                      onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Meta Keywords</label>
                    <input
                      type="text"
                      placeholder="Keywords..."
                      value={formData.meta_keywords}
                      onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Meta Description</label>
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

          {/* Editor Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
              <TipTapEditor
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                stickyOffset={82}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 antialiased max-w-7xl mx-auto">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase mb-0.5">CMS Hub</h4>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-slate-900 leading-none">Manage Blogs</h1>
              <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-slate-600">
                    {blogs.filter(b => b.is_active === "1" || b.is_active === 1 || b.is_active === true).length} Live
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {blogs.length} Total
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-95 shadow-sm"
          >
            <Plus size={16} /> New Blog
          </button>
        </div>
      </div>

      {/* ─── Blog List ────────────────────────────────────────── */}
      {(!blogs || blogs.length === 0) ? (
        <div className="bg-white border text-center border-slate-200 rounded-xl p-12 flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl text-slate-300 mb-3">
            <FileText size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No content found</h3>
          <p className="text-xs text-slate-500 mt-1">There are currently no blog articles available.</p>
          <button
            onClick={handleCreateNew}
            className="mt-4 flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all"
          >
            <Plus size={16} /> Create Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">

              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                {blog.image ? (
                  <img src={getImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={32} />
                  </div>
                )}

                {/* Quick Status Toggle */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleStatus(blog)}
                    className={clsx(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md shadow-sm border transition-all text-[9px] font-bold uppercase tracking-wider",
                      (blog.is_active === 1 || blog.is_active === "1" || blog.is_active === true)
                        ? "bg-emerald-500/90 border-emerald-400 text-white"
                        : "bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-900/80"
                    )}
                  >
                    <div className={clsx(
                      "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
                      (blog.is_active === 1 || blog.is_active === "1" || blog.is_active === true)
                        ? "bg-white shadow-white"
                        : "bg-slate-400 shadow-transparent"
                    )} />
                    {(blog.is_active === 1 || blog.is_active === "1" || blog.is_active === true) ? "Live" : "Draft"}
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-tight mb-2">
                  <Calendar size={10} />
                  {new Date(blog.created_at || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <h2 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">{blog.title}</h2>

                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mb-3 bg-slate-50 px-2 py-0.5 rounded-md self-start">
                  <ExternalLink size={10} className="text-indigo-400" />
                  <span className="truncate max-w-[150px]">{blog.slug}</span>
                </div>

                <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {blog.meta_description || "No description provided."}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all text-[11px] font-bold uppercase tracking-tight"
                    >
                      <Pencil size={14} />
                      Edit Article
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(blog)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
