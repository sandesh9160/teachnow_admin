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
  SlidersHorizontal
} from "lucide-react";
import { 
  getCVTemplates, 
  createCVTemplate, 
  updateCVTemplate, 
  deleteCVTemplate 
} from "@/services/admin.service";
import CVTemplateCard from "@/components/cards/CVTemplateCard";
import CVTemplateModal from "@/components/modals/CVTemplateModal";
import type { CVTemplate } from "@/types";
import { toast } from "sonner";
import clsx from "clsx";

export default function ManageCVTemplatesPage() {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "hidden">("all");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CVTemplate | undefined>();

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

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (template: CVTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: FormData) => {
    try {
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
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Operation failed");
      throw error;
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

  return (
    <div className="space-y-6 pb-20 antialiased max-w-[1600px] mx-auto">
      <CVTemplateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingTemplate}
      />

      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <FileText size={16} />
             </div>
             <h4 className="text-[10px] font-semibold text-indigo-600 tracking-wide">Builder Assets</h4>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-display">Resume Templates</h1>
          <p className="text-[13px] text-slate-500 font-medium max-w-xl">
             Manage system layouts for the resume builder. Control visibility, HTML templates, and asset inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-semibold text-slate-400 tracking-wide">Design Mix</span>
              <span className="text-sm font-semibold text-slate-900">{stats.active} Live / {stats.total} Total</span>
          </div>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-xl shadow-indigo-600/10 transition-all active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> 
            Upload Design
          </button>
        </div>
      </div>

      {/* ─── Stats Dashboard ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatSummary 
            label="Total Layouts" 
            value={stats.total} 
            desc={`${stats.active} published designs`}
            icon={<Layout className="text-indigo-600" />}
        />
        <StatSummary 
            label="Design Variants" 
            value={stats.designs || 1} 
            desc="Unique design categories"
            icon={<Sparkles className="text-amber-500" />}
        />
        <StatSummary 
            label="Storage Usage" 
            value={`${(stats.total * 1.2).toFixed(1)}MB`} 
            desc="Estimated asset footprint"
            icon={<CreditCard className="text-emerald-500" />}
        />
      </div>

      {/* ─── Control Bar ──────────────────────────────────── */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:min-w-[300px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search templates..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-[13px] focus:bg-white focus:border-indigo-100 outline-none transition-all font-medium"
                />
             </div>
             <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <SlidersHorizontal size={18} />
             </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
             {(["all", "active", "hidden"] as const).map((opt) => (
                <button
                   key={opt}
                   onClick={() => setFilter(opt)}
                   className={clsx(
                      "px-4 py-1.5 text-[11px] font-semibold rounded-lg transition-all capitalize",
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
          <p className="text-sm font-semibold text-slate-500 tracking-tight">Synchronizing templates...</p>
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
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 italic">
           <RefreshCcw size={24} className="text-slate-300 mb-3" />
           <p className="text-sm font-medium text-slate-400">No matching templates found</p>
        </div>
      )}
    </div>
  );
}

function StatSummary({ label, value, desc, icon }: { label: string, value: string | number, desc: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-indigo-100 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 mb-0.5 leading-none">{label}</p>
        <div className="flex items-baseline gap-2">
            <p className="text-xl font-semibold text-slate-900 tracking-tight font-display">{value}</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">{desc}</p>
        </div>
      </div>
    </div>
  );
}
