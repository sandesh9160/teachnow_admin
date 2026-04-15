"use client";

import React, { useState, useEffect } from "react";
import { 
  Loader2, 
  Info, 
  Save, 
  Pencil, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Layout, 
  CheckCircle2, 
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { 
  getAboutUs, 
  updateAboutUsSection, 
  createAboutUsSection, 
  deleteAboutUsSection, 
  toggleAboutUsSectionStatus 
} from "@/services/admin.service";
import { clsx } from "clsx";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

interface AboutUsSection {
  id: number;
  parent_id: number | null;
  title: string;
  content: string;
  display_order: number;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
  children?: AboutUsSection[];
}

export default function AboutUsPage() {
  const [data, setData] = useState<AboutUsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    try {
      setLoading(true);
      const res = await getAboutUs();
      if (res?.status && res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch About Us content:", error);
      toast.error("An error occurred while fetching content");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: AboutUsSection) => {
    setEditingId(section.id);
    setEditForm({ title: section.title, content: section.content });
  };

  const handleSave = async (id: number) => {
    try {
      setLoading(true);
      const res = await updateAboutUsSection(id, editForm);
      if (res?.status) {
        toast.success("Section updated successfully");
        setEditingId(null);
        fetchAboutUs();
      } else {
        toast.error(res?.message || "Failed to update section");
      }
    } catch (error) {
      console.error("Failed to save section:", error);
      toast.error("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await toggleAboutUsSectionStatus(id);
      if (res?.status) {
        toast.success("Status updated");
        fetchAboutUs();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCreate = async (parentId: number | null = null) => {
    try {
      setLoading(true);
      const res = await createAboutUsSection({
        title: "New Section",
        content: "<p>Write your content here...</p>",
        parent_id: parentId,
        display_order: 1
      });
      if (res?.status) {
        toast.success("Section created successfully");
        fetchAboutUs();
      } else {
        toast.error("Failed to create section");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this section? This cannot be undone.")) return;
    try {
      setLoading(true);
      const res = await deleteAboutUsSection(id);
      if (res?.status) {
        toast.success("Section deleted successfully");
        // Also clear editing state if we happen to delete what we're editing
        if (editingId === id) setEditingId(null);
        fetchAboutUs();
      } else {
        toast.error("Failed to delete section");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p className="text-[12px] font-bold uppercase tracking-widest animate-pulse">Synchronizing CMS Content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 antialiased">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Layout size={16} />
            </div>
            <h4 className="text-[11px] font-bold text-indigo-600 tracking-wide uppercase">CMS Portal</h4>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">About Us Management</h1>
          <p className="text-sm text-slate-500 font-medium">Configure company history, mission, and secondary feature blocks.</p>
        </div>
        
        {/* Create Button in Header */}
        {data.length > 0 && (
          <button onClick={() => handleCreate(null)} className="px-4 py-2 mt-4 md:mt-0 bg-slate-900 text-white rounded-lg font-bold text-xs shadow-sm hover:bg-slate-800 transition-all flex items-center gap-2">
            <Plus size={16} /> Add Primary Section
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6 shadow-inner">
            <Info size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No content structured</h3>
          <p className="text-slate-500 mt-2 max-w-sm font-medium leading-relaxed">The About Us section is currently empty. Initialize the structure to begin building your brand story.</p>
          <button onClick={() => handleCreate(null)} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={18} /> Add Primary Section
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {data.map((section) => (
            <div key={section.id} className="space-y-4">
              {/* Primary Section Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">{section.title}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Primary Section</span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 uppercase tracking-wider">
                          <Clock size={10} /> Updated {new Date(section.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleStatus(section.id)}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                        section.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100"
                      )}
                    >
                      {section.is_active ? "Visible" : "Hidden"}
                    </button>
                    {editingId === section.id ? (
                      <>
                        <button 
                          onClick={() => handleSave(section.id)}
                          className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                          <Save size={14} /> Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="px-5 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEdit(section)}
                          className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold shadow-sm hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(section.id)}
                          className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {editingId === section.id ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Section Heading</label>
                        <input 
                          type="text" 
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Main Narrative Content</label>
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden ring-1 ring-slate-100">
                          <TipTapEditor 
                            value={editForm.content} 
                            onChange={(val) => setEditForm({...editForm, content: val})} 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <div className="text-slate-600 text-lg leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: section.content }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Child Sections (Grid) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Detail Blocks</h3>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded">{section.children?.length || 0}</span>
                  </div>
                  <button onClick={() => handleCreate(section.id)} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 p-1.5 px-3 hover:bg-indigo-50 rounded-lg cursor-pointer">
                    <Plus size={14} /> Add Block
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.children?.map((child) => (
                    <div key={child.id} className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
                          <Info size={16} />
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleToggleStatus(child.id)}
                            className={clsx(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                              child.is_active ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(child)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(child.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {editingId === child.id ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <input 
                            type="text" 
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:border-indigo-500 outline-none"
                          />
                          <TipTapEditor 
                            value={editForm.content} 
                            onChange={(val) => setEditForm({...editForm, content: val})} 
                          />
                          <div className="flex items-center gap-2 pt-2">
                            <button 
                              onClick={() => handleSave(child.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer" 
                          onClick={() => {
                            setExpandedId(expandedId === child.id ? null : child.id);
                          }}
                        >
                          <h4 className="text-base font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{child.title}</h4>
                          <div 
                            className={clsx(
                              "text-[13px] text-slate-500 leading-relaxed font-medium transition-all duration-300",
                              expandedId === child.id ? "line-clamp-none" : "line-clamp-3"
                            )}
                            dangerouslySetInnerHTML={{ __html: child.content }}
                          />
                          <button className="mt-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1 group-hover:text-indigo-400">
                            {expandedId === child.id ? (
                              <><ChevronUp size={12} /> Collapse</>
                            ) : (
                              <><ChevronDown size={12} /> Expand Summary</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
