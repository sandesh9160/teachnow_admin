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
  Image as ImageIcon,
  Save,
  LibraryBig,
  Mail
} from "lucide-react";
import { 
  getCVTemplates, 
  createCVTemplate, 
  updateCVTemplate, 
  deleteCVTemplate 
} from "@/services/admin.service";
import CVTemplateCard from "@/components/cards/CVTemplateCard";
import Pagination from "@/components/ui/Pagination";
import type { CVTemplate, PaginatedResponse } from "@/types";
import { toast } from "sonner";
import clsx from "clsx";

const BACKEND_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";

export default function ManageCVTemplatesPage() {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "hidden">("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
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
  const [showPreview, setShowPreview] = useState(false);

  const COMMON_TAGS = [
    "name", "email", "phone", "location", "bio", "title", 
    "experience_years", "skills", "experience", "education",
    "portfolio_website", "dob"
  ];

  const dummyData: any = {
    name: "Sandesh Kumar",
    email: "sandesh@teachnow.com",
    phone: "+91 98765 43210",
    location: "Hyderabad, India",
    bio: "Passionate educator with over 10 years of experience in higher education and curriculum design. Specialized in STEM subjects and digital learning transformation.",
    title: "Senior Academic Consultant",
    experience_years: "12",
    skills: "Mathematics, Physics, Digital Pedagogy, Leadership, Team Management",
    experience: "12 years of professional teaching and admin experience",
    education: "Ph.D. in Education Theory, IIT Delhi",
    portfolio_website: "www.sandeshteach.in",
    dob: "15th August 1990",
  };

  const renderPreview = (html: string) => {
    if (!html) return "<div class='p-8 text-slate-400 font-medium italic'>No content to preview</div>";
    let rendered = html;
    COMMON_TAGS.forEach((tag) => {
      const regex = new RegExp(`{{${tag}}}`, "g");
      rendered = rendered.replace(regex, dummyData[tag] || "");
    });
    return rendered;
  };

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, search, filter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getCVTemplates({
        page: currentPage,
        search,
        status: filter === "all" ? undefined : (filter === "active" ? 1 : 0)
      });
      
      const responseData = (res as any).data;
      
      if (responseData && 'current_page' in responseData) {
        const paginated = responseData as PaginatedResponse<CVTemplate>;
        setTemplates(paginated.data || []);
        setTotalPages(paginated.last_page || 1);
        setTotalItems(paginated.total || 0);
      } else {
        const data = Array.isArray(responseData) ? responseData : [];
        setTemplates(data);
        setTotalPages(1);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Unable to load CV templates");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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


  const stats = {
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    designs: new Set(templates.map(t => t.key_values).filter(Boolean)).size
  };

  if (isEditing) {
    return (
      <div className="max-w-[1800px] mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                   <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                        {editingTemplate ? "Edit Template Design" : "Create New Template"}
                    </h1>
                    <p className="text-[12px] font-medium text-slate-500 italic">Configure the HTML structure and visual preview.</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-[12px] font-semibold shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingTemplate ? "Save Changes" : "Create Template"}
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
                            <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest">General Configuration</h3>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Template Display Name</label>
                            <input 
                                required
                                type="text"
                                placeholder="e.g. Modern Minimalist 2024"
                                value={editorData.name}
                                onChange={e => setEditorData({...editorData, name: e.target.value})}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[20px] text-[13px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Category / Design Tags</label>
                            <input 
                                type="text"
                                placeholder="e.g. professional, creative"
                                value={editorData.key_values}
                                onChange={e => setEditorData({...editorData, key_values: e.target.value})}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-[20px] text-[13px] font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">System Visibility</label>
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
                                            "flex items-center justify-center gap-2 py-3.5 rounded-[20px] border-2 transition-all font-semibold text-[12px]",
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

                    {/* Variable Reference */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-500" />
                            <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest">Available Tags</h3>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed mb-1">
                            Use these variables in your HTML to inject candidate data.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_TAGS.map(tag => {
                                const isUsed = editorData.html_template.includes(`{{${tag}}}`);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            if (!isUsed) {
                                                setEditorData({
                                                    ...editorData,
                                                    html_template: editorData.html_template + ` {{${tag}}}`
                                                });
                                                setShowPreview(false);
                                            }
                                        }}
                                        className={clsx(
                                            "px-2.5 py-1.5 border rounded-lg text-[10px] font-mono font-semibold transition-all active:scale-95 flex items-center gap-1.5",
                                            isUsed 
                                                ? "bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-600/20" 
                                                : "bg-slate-50 border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200"
                                        )}
                                    >
                                        {`{{${tag}}}`}
                                        {isUsed && <CheckCircle2 size={10} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Preview Image */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={16} className="text-indigo-600" />
                                <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest">Mockup Upload</h3>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-300">JPG/PNG/WEBP</span>
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
                                    <p className="text-[11px] font-semibold text-slate-900 uppercase tracking-tight mb-1">Upload Preview</p>
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
                                {showPreview ? <Eye size={14} className="text-indigo-600" /> : <Code2 size={14} />}
                                <span className={clsx("text-[11px] font-semibold uppercase tracking-widest", showPreview ? "text-indigo-600" : "text-slate-400")}>
                                    {showPreview ? "Live Design Preview" : "HTML Blueprint Editor"}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-white rounded-[14px] border border-slate-200 shadow-sm">
                             <button 
                                onClick={() => setShowPreview(false)}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase transition-all",
                                    !showPreview ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-slate-900"
                                )}
                             >
                                <Code2 size={12} /> Code
                             </button>
                             <button 
                                onClick={() => setShowPreview(true)}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase transition-all",
                                    showPreview ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-900"
                                )}
                             >
                                <Eye size={12} /> Preview
                             </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 relative bg-white">
                        {!showPreview ? (
                            <textarea 
                                required
                                suppressHydrationWarning
                                placeholder="<html>\n  <head>...</head>\n  <body>\n    <h1>{{name}}</h1>\n  </body>\n</html>"
                                value={editorData.html_template}
                                onChange={e => setEditorData({...editorData, html_template: e.target.value})}
                                className="absolute inset-0 w-full h-full p-8 bg-white text-indigo-950 font-mono text-[14px] outline-none resize-none selection:bg-indigo-100 placeholder:text-slate-300"
                                style={{ lineHeight: '1.8' }}
                            />
                        ) : (
                            <div className="absolute inset-0 overflow-auto bg-slate-100 p-8 flex justify-center">
                                <div className="w-full max-w-[800px] bg-white shadow-2xl rounded-sm overflow-hidden min-h-full">
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: renderPreview(editorData.html_template) }}
                                        className="resume-preview-root"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                                Chars: {editorData.html_template.length}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                                Lines: {editorData.html_template.split('\n').length}
                            </span>
                         </div>
                         {showPreview && (
                            <div className="flex items-center gap-2 text-emerald-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest">Real-time Rendering</span>
                            </div>
                         )}
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
      {/* ─── Compact Header & Dashboard ─── */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 -mt-32 -mr-32 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/20 shrink-0">
              <Layout size={28} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-tighter">System Assets</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300" />
                 <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{stats.active}/{stats.total} Active Templates</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight leading-tight">Resume Templates</h1>
              <p className="text-[12px] text-slate-500 font-medium mt-0.5 max-w-lg leading-relaxed">
                Manage visual layouts for the AI Resume Builder. Control HTML structures and live status.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             {/* Integrated Quick Stats */}
             <div className="hidden xl:flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                   <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Storage</span>
                   <span className="text-[14px] font-bold text-slate-900">{(stats.total * 1.2).toFixed(1)}MB</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex flex-col">
                   <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Variants</span>
                   <span className="text-[14px] font-bold text-slate-900">{stats.designs || 1} Types</span>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <a 
                    href="/resources"
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-[11px] transition-all border border-slate-200 uppercase tracking-tight"
                >
                    <LibraryBig size={16} /> Resources
                </a>
                <a 
                    href="/email/templates"
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-[11px] transition-all border border-slate-200 uppercase tracking-tight"
                >
                    <Mail size={16} /> Emails
                </a>
             </div>

             <button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                <Plus size={16} /> 
                Add Template
              </button>
          </div>
        </div>
      </div>

      {/* ─── Control Bar ──────────────────────────────────── */}
      {/* ─── Modern Search & Controls ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 group">
             <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
             <input 
               type="text" 
               suppressHydrationWarning
               placeholder="Search templates by name, category or ID..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[22px] text-[13px] font-medium text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
             />
          </div>

          <div className="flex items-center p-1.5 bg-white rounded-[22px] border border-slate-200 shadow-sm shrink-0">
             {(["all", "active", "hidden"] as const).map((opt) => (
                <button
                   key={opt}
                   onClick={() => setFilter(opt)}
                   suppressHydrationWarning
                   className={clsx(
                      "px-6 py-2.5 text-[11px] font-bold rounded-[18px] transition-all capitalize",
                      filter === opt 
                        ? opt === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : opt === "active" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                        : "text-slate-400 hover:bg-slate-50"
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
          <p className="text-sm font-medium text-slate-500 tracking-tight uppercase">Synchronizing templates...</p>
        </div>
      ) : templates.length > 0 ? (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map((template) => (
                <CVTemplateCard 
                    key={template.id} 
                    template={template} 
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                />
            ))}
            </div>

            {totalPages > 1 && (
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
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
