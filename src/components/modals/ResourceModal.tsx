"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";
import type { TeachingResource } from "@/types";

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  resource?: TeachingResource;
}

export default function ResourceModal({ isOpen, onClose, onSave, resource }: ResourceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    author_name: "",
    total_pages: "",
    answer_include: "included",
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

  useEffect(() => {
    if (isOpen) {
      if (resource) {
        setFormData({
          title: resource.title || "",
          slug: resource.slug || "",
          description: resource.description || "",
          author_name: resource.author_name || "",
          total_pages: resource.total_pages ? resource.total_pages.toString() : "",
          answer_include: resource.answer_include || "included",
          read_time: resource.read_time ? resource.read_time.toString() : "",
          meta_title: resource.meta_title || "",
          meta_description: resource.meta_description || "",
          meta_keywords: resource.meta_keywords || "",
          is_visible: resource.is_visible ?? 1,
          is_featured: resource.is_featured ?? 0,
        });
      } else {
        setFormData({
          title: "",
          slug: "",
          description: "",
          author_name: "",
          total_pages: "",
          answer_include: "included",
          read_time: "",
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          is_visible: 1,
          is_featured: 0,
        });
      }
      setFiles({ pdf: null, resource_photo: null, author_photo: null });
    }
  }, [isOpen, resource]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked ? 1 : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Auto-generate slug from title if creating
    if (name === "title" && !resource) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof files) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
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

      if (files.pdf) submitData.append("pdf", files.pdf);
      if (files.resource_photo) submitData.append("resource_photo", files.resource_photo);
      if (files.author_photo) submitData.append("author_photo", files.author_photo);

      // Note: Removed _method=PUT to avoid Laravel HTTP 500 error if route only supports standard POST.

      await onSave(submitData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {resource ? "Edit Teaching Resource" : "Create New Resource"}
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {resource ? "Update resource details and assets" : "Add a new educational resource to the platform"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center shadow-sm"
          >
            <X size={16} className="mr-2" /> Cancel
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-8">
          <form id="resourceForm" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Info</h3>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Physics Notes Class 10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="physics-notes-class-10"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>


              </div>

              {/* Meta & Stats */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">Resource Stats & SEO</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Total Pages</label>
                    <input
                      type="number"
                      name="total_pages"
                      value={formData.total_pages}
                      onChange={handleChange}
                      placeholder="e.g. 120"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Read Time (mins)</label>
                    <input
                      type="number"
                      name="read_time"
                      value={formData.read_time}
                      onChange={handleChange}
                      placeholder="e.g. 45"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Answers Included?</label>
                  <select
                    name="answer_include"
                    value={formData.answer_include}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  >
                    <option value="included">Included</option>
                    <option value="not_included">Not Included</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Meta Title</label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Meta Keywords</label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Full Width HTML Content Editor */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
               <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest pb-2">Document Content (Rich Text)</h3>
               <TipTapEditor
                 value={formData.description}
                 onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                 placeholder="Start writing or pasting your notes here..."
               />
            </div>

            {/* Author & Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">Author Info</h3>
                 <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Author Name</label>
                  <input
                    type="text"
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleChange}
                    placeholder="e.g. Kishore Sir"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">Author Photo {resource && !files.author_photo && <span className="text-emerald-500 font-normal">(Uploaded)</span>}</label>
                  <div className="relative group overflow-hidden rounded-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "author_photo")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 border-dashed rounded-lg group-hover:border-indigo-400 group-hover:bg-indigo-50/50 transition-colors">
                      <ImageIcon size={16} className="text-slate-400 group-hover:text-indigo-500" />
                      <span className="text-sm text-slate-500 group-hover:text-indigo-600 truncate">
                        {files.author_photo ? files.author_photo.name : "Select Author Photo"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">Media Files</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700">PDF File {resource && !files.pdf && <span className="text-emerald-500 font-normal">(Uploaded)</span>}</label>
                      <div className="relative group overflow-hidden rounded-lg">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, "pdf")}
                          required={!resource}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-2 px-3 py-6 bg-slate-50 border border-slate-200 border-dashed rounded-lg group-hover:border-rose-400 group-hover:bg-rose-50/50 transition-colors text-center">
                          <FileText size={24} className="text-slate-400 group-hover:text-rose-500" />
                          <span className="text-[11px] text-slate-500 font-semibold group-hover:text-rose-600 line-clamp-1 px-2">
                            {files.pdf ? files.pdf.name : "Upload PDF"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700">Cover Image {resource && !files.resource_photo && <span className="text-emerald-500 font-normal">(Uploaded)</span>}</label>
                      <div className="relative group overflow-hidden rounded-lg">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "resource_photo")}
                          required={!resource}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-2 px-3 py-6 bg-slate-50 border border-slate-200 border-dashed rounded-lg group-hover:border-indigo-400 group-hover:bg-indigo-50/50 transition-colors text-center">
                          <ImageIcon size={24} className="text-slate-400 group-hover:text-indigo-500" />
                          <span className="text-[11px] text-slate-500 font-semibold group-hover:text-indigo-600 line-clamp-1 px-2">
                            {files.resource_photo ? files.resource_photo.name : "Cover Photo"}
                          </span>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Toggles */}
             <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_visible"
                    checked={formData.is_visible === 1}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
                  />
                  <span className="text-sm font-semibold text-slate-700">Visible</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured === 1}
                    onChange={handleChange}
                    className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className="text-sm font-semibold text-slate-700">Mark as Featured</span>
               </label>
             </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="resourceForm"
            disabled={loading}
            className={clsx(
              "px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm",
              loading && "opacity-70 pointer-events-none"
            )}
          >
            {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : <><Upload size={16} className="mr-2" /> Save Resource</>}
          </button>
        </div>
      </div>
  );
}
