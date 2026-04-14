"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CreditCard, 
  Sparkles, 
  Layout, 
  Loader2,
  RefreshCcw,
  SlidersHorizontal,
  ArrowLeft,
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Settings2,
  Code2,
  Image as ImageIcon
} from "lucide-react";
import { 
  getCVTemplates, 
  createCVTemplate, 
  updateCVTemplate, 
  deleteCVTemplate 
} from "@/services/admin.service";
import CVTemplateCard from "@/components/cards/CVTemplateCard";
import type { CVTemplate } from "@/types";
import { toast } from "sonner";
import clsx from "clsx";

const BACKEND_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";

export default function ManageCVTemplatesPage() {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "hidden">("all");
  
  // View states
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CVTemplate | undefined>();

  // Editor states
  const [editorData, setEditorData] = useState({
    name: "",
    html_template: "",
    is_active: 1,
    key_values: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getCVTemplates();
      const data = (res as any).data || res;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Unable to load CV templates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: CVTemplate) => {
    setEditingTemplate(template);
    setEditorData({
      name: template.name || "",
      html_template: template.html_template || "",
      is_active: Number(template.is_active) || 0,
      key_values: template.key_values || ""
    });
    setPreview(null);
    setFile(null);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setEditorData({
      name: "",
      html_template: "",
      is_active: 1,
      key_values: ""
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
    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editorData.name);
      formData.append("html_template", editorData.html_template);
      formData.append("is_active", String(editorData.is_active));
      if (editorData.key_values) formData.append("key_values", editorData.key_values);
      if (file) formData.append("preview_image", file);

      if (editingTemplate) {
        const res = await updateCVTemplate(editingTemplate.id, formData);
        const updated = (res as any).data || res;
        setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
        toast.success("Template updated successfully");
      } else {
        const res = await createCVTemplate(formData);
        const created = (res as any).data || res;
        setTemplates(prev => [created, ...prev]);
        toast.success("New template published");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleStatus = async (template: CVTemplate) => {
    try {
      const newStatus = !template.is_active;
      await updateCVTemplate(template.id, { is_active: newStatus ? 1 : 0 });
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, is_active: newStatus } : t
      ));
      toast.success(`${template.name} is now ${newStatus ? 'live' : 'offline'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (template: CVTemplate) => {
    if (!confirm(`Permanently remove "${template.name}"?`)) return;
    try {
      await deleteCVTemplate(template.id);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      toast.success("Template removed successfully");
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = (t.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === "all" ? true :
      filter === "active" ? t.is_active :
      !t.is_active;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    designs: new Set(templates.map(t => t.key_values).filter(Boolean)).size
  };

  if (isEditing) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Editor Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                   <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {editingTemplate ? "Edit Design Layout" : "Publish New Layout"}
                    </h1>
                    <p className="text-[13px] font-medium text-slate-500">Define core structure and preview for the builder.</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                        <button 
                  onClick={() => setIsEditing(false)}
                  suppressHydrationWarning
                  className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm active:scale-95"
                >
                    Discard Changes
                </button>
                <button 
                    onClick={handleSave}
                    disabled={saveLoading}
                    suppressHydrationWarning
                    className="min-w-[180px] bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl text-[13px] font-bold shadow-xl shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {saveLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    {editingTemplate ? "Apply Changes" : "Confirm & Save"}
                </button>
            </div>
        </div>

        {/* Editor Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm space-y-8">
                    {/* General Settings */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings2 size={16} className="text-indigo-600" />
                            <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">General Configuration</h3>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Template Display Name</label>
                            <input 
                                required
                                type="text"
                                placeholder="e.g. Modern Minimalist 2024"
                                value={editorData.name}
                                onChange={e => setEditorData({...editorData, name: e.target.value})}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[20px] text-[13px] font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Category / Design Tags</label>
                            <input 
                                type="text"
                                placeholder="e.g. professional, creative"
                                value={editorData.key_values}
                                onChange={e => setEditorData({...editorData, key_values: e.target.value})}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[20px] text-[13px] font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">System Visibility</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { val: 1, label: "Live", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                                    { val: 0, label: "Hidden", icon: AlertCircle, color: "text-slate-400", bg: "bg-slate-50" }
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => setEditorData({...editorData, is_active: opt.val})}
                                        className={clsx(
                                            "flex items-center justify-center gap-2 py-3.5 rounded-[20px] border-2 transition-all font-bold text-[12px]",
                                            editorData.is_active === opt.val 
                                                ? `${opt.bg} border-indigo-600 text-slate-900` 
                                                : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <opt.icon size={16} className={editorData.is_active === opt.val ? opt.color : ""} />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview Image */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={16} className="text-indigo-600" />
                                <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Mockup Upload</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300">JPG/PNG/WEBP</span>
                        </div>
                        
                        <div className={clsx(
                            "relative min-h-[400px] max-h-[600px] w-full rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden group bg-slate-50",
                            file || preview ? "border-indigo-200" : "border-slate-200 hover:bg-white hover:border-indigo-300"
                        )}>
                            {preview ? (
                                <img src={preview} alt="Upload" className="w-full h-full object-contain drop-shadow-md" />
                            ) : editingTemplate?.preview_image && !file ? (
                                <img 
                                    src={`${BACKEND_URL}/${editingTemplate.preview_image.startsWith('/') ? editingTemplate.preview_image.slice(1) : editingTemplate.preview_image}`} 
                                    className="w-full h-full object-contain drop-shadow-md" 
                                />
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 text-center px-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-3 shadow-sm group-hover:-translate-y-1 transition-transform">
                                        <Upload size={20} strokeWidth={2} className="text-indigo-600" />
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight mb-1">Upload Preview</p>
                                    <p className="text-[10px] font-medium text-slate-400 leading-tight">Drag and drop or click to browse</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {preview && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Code Editor Main */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-[850px] space-y-4">
                <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-xl flex flex-col overflow-hidden transition-all">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <div className="w-px h-4 bg-slate-200 mx-2" />
                            <div className="flex items-center gap-2 text-slate-400">
                                <Code2 size={14} />
                                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">HTML Blueprint Editor</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                                <Sparkles size={11} className="text-indigo-600" />
                                <span className="text-[10px] font-bold text-indigo-600 whitespace-nowrap uppercase tracking-tighter">Smart Tags Enabled</span>
                             </div>
                             <button className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-all">
                                <Eye size={14} />
                                <span className="text-[10px] font-bold uppercase">View Result</span>
                             </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 relative">
                        <textarea 
                            required
                            suppressHydrationWarning
                            placeholder="<html>\n  <head>...</head>\n  <body>\n    <h1>{{name}}</h1>\n  </body>\n</html>"
                            value={editorData.html_template}
                            onChange={e => setEditorData({...editorData, html_template: e.target.value})}
                            className="absolute inset-0 w-full h-full p-8 bg-white text-indigo-950 font-mono text-[14px] outline-none resize-none selection:bg-indigo-100 placeholder:text-slate-300"
                            style={{ lineHeight: '1.8' }}
                        />
                    </div>

                    <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 text-right">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            Chars: {editorData.html_template.length} | Lines: {editorData.html_template.split('\n').length}
                         </span>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                        <b>Pro Tip:</b> Ensure your HTML includes layout classes for all dynamic sections like Experience, Education, and Skills. 
                        The generator will find and replace all instances of <b>{`{{tags}}`}</b> from the candidate's profile data.
                    </p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 antialiased max-w-[1800px] mx-auto animate-in fade-in duration-500">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
             <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/10">
                <FileText size={14} />
             </div>
             <h4 className="text-[9px] font-bold text-indigo-600 tracking-widest uppercase">Builder Assets</h4>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resume Templates</h1>
          <p className="text-[12px] text-slate-500 font-medium max-w-xl">
             Manage system layouts for the resume builder. Control visibility and HTML templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Inventory</span>
              <span className="text-[12px] font-bold text-slate-900">{stats.active}/{stats.total} Active</span>
          </div>
          <button 
            onClick={handleCreateNew}
            suppressHydrationWarning
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-95 group"
          >
            <Plus size={16} /> 
            Upload Design
          </button>
        </div>
      </div>

      {/* ─── Stats Dashboard ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatSummary 
            label="Total Layouts" 
            value={stats.total} 
            desc={`${stats.active} active`}
            icon={<Layout className="text-indigo-600" />}
        />
        <StatSummary 
            label="Variants" 
            value={stats.designs || 1} 
            desc="Categories"
            icon={<Sparkles className="text-amber-500" />}
        />
        <StatSummary 
            label="Storage" 
            value={`${(stats.total * 1.2).toFixed(1)}MB`} 
            desc="Footprint"
            icon={<CreditCard className="text-emerald-500" />}
        />
      </div>

      {/* ─── Control Bar ──────────────────────────────────── */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
             <div className="relative flex-1 sm:min-w-[260px]">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  suppressHydrationWarning
                  placeholder="Search templates..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-transparent rounded-lg text-[12px] focus:bg-white focus:border-indigo-100 outline-none transition-all font-semibold"
                />
             </div>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-50 rounded-lg border border-slate-100">
             {(["all", "active", "hidden"] as const).map((opt) => (
                <button
                   key={opt}
                   onClick={() => setFilter(opt)}
                   suppressHydrationWarning
                   className={clsx(
                      "px-3 py-1 text-[10px] font-bold rounded-md transition-all capitalize",
                      filter === opt ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                   )}
                >
                   {opt}
                </button>
             ))}
          </div>
      </div>

      {/* ─── Templates Grid ────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
          <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-slate-500 tracking-tight uppercase">Synchronizing templates...</p>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <CVTemplateCard 
                key={template.id} 
                template={template} 
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 italic font-medium text-slate-400">
           <RefreshCcw size={24} className="text-slate-300 mb-3" />
           <p className="text-sm">No matching templates found</p>
        </div>
      )}
    </div>
  );
}

function StatSummary({ label, value, desc, icon }: { label: string, value: string | number, desc: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3 hover:border-indigo-100 transition-colors group">
      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1.5">
            <p className="text-lg font-bold text-slate-900 tracking-tight">{value}</p>
            <p className="text-[9px] font-semibold text-slate-400 truncate">{desc}</p>
        </div>
      </div>
    </div>
  );
}
