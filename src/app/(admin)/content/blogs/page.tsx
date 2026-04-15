"use client";

import React, { useState, useEffect } from "react";
import { Loader2, FileText, ExternalLink, Calendar, Eye, EyeOff, Save, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getBlogs, toggleBlogStatus, deleteBlog, updateBlog } from "@/services/admin.service";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getBlogs();
      // Adjust according to the API's actual response structure. Typically { status: boolean, data: [] }
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

  const handleToggleStatus = async (blog: any) => {
    try {
      await toggleBlogStatus(blog.id);
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blog.id ? { ...b, is_active: b.is_active === "1" || b.is_active === 1 || b.is_active === true ? 0 : 1 } : b
        )
      );
      toast.success("Blog visibility updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (blog: any) => {
    setEditingId(blog.id);
    setEditContent(blog.content || "");
    setExpandedId(null);
  };

  const handleSave = async (blog: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("content", editContent);
      formData.append("_method", "PUT");
      
      await updateBlog(blog.id, formData);
      
      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, content: editContent } : b))
      );
      setEditingId(null);
      toast.success("Blog content updated successfully");
    } catch (error) {
      console.error("Failed to update blog:", error);
      toast.error("Failed to save blog content");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
        <p className="text-[12px] font-bold uppercase tracking-widest">Synchronizing Content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 antialiased max-w-7xl mx-auto">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <FileText size={16} />
             </div>
             <h4 className="text-[11px] font-bold text-indigo-600 tracking-wide uppercase">CMS Content Hub</h4>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Articles & Blogs</h1>
        </div>
      </div>

      {/* ─── Blog List ────────────────────────────────────────── */}
      {(!blogs || blogs.length === 0) ? (
        <div className="bg-white border text-center border-slate-200 rounded-2xl p-16 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-300 mb-4">
               <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No content found</h3>
            <p className="text-sm text-slate-500 mt-1">There are currently no blog articles available in the system.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-[1.2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
               
               {/* Blog Meta Card Header */}
               <div className="p-5 flex flex-col md:flex-row gap-5 items-start">
                  
                  {/* Thumbnail / Meta */}
                  {blog.featured_image && (
                    <div className="w-full md:w-48 h-32 shrink-0 rounded-xl overflow-hidden border border-slate-100">
                      <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                     <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className={clsx(
                               "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md",
                               (blog.is_active === "1" || blog.is_active === 1 || blog.is_active === true) 
                                ? "bg-emerald-50 text-emerald-600" 
                                : "bg-slate-100 text-slate-500"
                             )}>
                                {(blog.is_active === "1" || blog.is_active === 1 || blog.is_active === true) ? "Published" : "Draft"}
                             </span>
                             <span className="text-[12px] font-medium text-slate-400 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(blog.created_at || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                             </span>
                          </div>
                          <h2 className="text-lg font-bold text-slate-900 leading-snug">{blog.title}</h2>
                          <div className="mt-1 flex items-center gap-2 text-[12px] font-medium text-slate-500">
                             <ExternalLink size={12} className="text-indigo-400" />
                             <span>{blog.slug}</span>
                          </div>
                          
                          <p className="mt-3 text-[13px] text-slate-600 leading-relaxed max-w-3xl">
                            {blog.meta_description}
                          </p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3 mt-5">
                       {editingId === blog.id ? (
                         <>
                           <button 
                             onClick={() => handleSave(blog)}
                             className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                           >
                              <Save size={14} />
                              Save Changes
                           </button>
                           <button 
                             onClick={handleCancel}
                             className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                           >
                              Cancel
                           </button>
                         </>
                       ) : (
                         <>
                           <button 
                             onClick={() => handleEdit(blog)}
                             className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-[12px] font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                           >
                              <Pencil size={14} />
                              Edit Content
                           </button>
                           <button 
                             onClick={() => {
                               setExpandedId(expandedId === blog.id ? null : blog.id);
                               setEditingId(null);
                             }}
                             className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                           >
                              {expandedId === blog.id ? <EyeOff size={14} /> : <Eye size={14} />}
                              {expandedId === blog.id ? "Hide Preview" : "Preview Content"}
                           </button>
                           <button 
                             onClick={() => handleToggleStatus(blog)}
                             className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                           >
                              Toggle Visibility
                           </button>
                         </>
                       )}
                     </div>
                  </div>
               </div>

               {/* TipTap Editor Area */}
               {editingId === blog.id && (
                  <div className="border-t border-slate-100 bg-slate-50 p-6">
                    <div className="mb-4 flex items-center justify-between">
                       <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Rich Text Editor</h3>
                       <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight bg-indigo-50 px-2 py-0.5 rounded">Tiptap v3 Enabled</span>
                    </div>
                    <TipTapEditor 
                       value={editContent} 
                       onChange={(val) => setEditContent(val)} 
                       placeholder="Write your blog content here..."
                    />
                  </div>
               )}

               {/* Dangerous HTML Render Area */}
               {expandedId === blog.id && (
                  <div className="border-t border-slate-100 bg-slate-50 p-6 relative">
                     <div className="absolute top-0 right-0 py-1 px-3 bg-rose-100 text-rose-700 text-[10px] font-bold tracking-widest rounded-bl-xl uppercase border-b border-l border-rose-200 shadow-sm">
                       Dangerous HTML Output
                     </div>
                     
                     {/* 
                        Notice: Since the API returns a structured HTML document containing global <style> tags, 
                        using dangerouslySetInnerHTML directly may leak styles into the admin dashboard (e.g., overriding body fonts/margins).
                        We scope it slightly by containing it physically, but raw dangerouslySetInnerHTML is exactly what was requested.
                     */}
                     <div 
                        className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden" 
                        dangerouslySetInnerHTML={{ __html: blog.content }} 
                     />
                  </div>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
