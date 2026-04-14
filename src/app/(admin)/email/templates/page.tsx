"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail,
  Search, 
  Loader2,
  RefreshCcw,
  AlertCircle
} from "lucide-react";
import { 
  getEmailTemplates, 
  updateEmailTemplate,
  createEmailTemplate,
  deleteEmailTemplate,
  toggleEmailTemplateStatus
} from "@/services/admin.service";
import { Plus } from "lucide-react";
import EmailTemplateCard from "@/components/cards/EmailTemplateCard";
import EmailTemplateModal from "@/components/modals/EmailTemplateModal";
import type { EmailTemplate } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  
  // View states
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getEmailTemplates();
      // Adjust based on common API response structure
      const data = (res as any).data || res;
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch email templates:", error);
      toast.error("Unable to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setEditingTemplate(undefined);
    setIsEditing(true);
  };

  const handleSave = async (data: Partial<EmailTemplate>) => {
    try {
      if (editingTemplate) {
        const res = await updateEmailTemplate(editingTemplate.id, data);
        const updated = (res as any).data || res;
        setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
        toast.success("Email template updated successfully");
      } else {
        const res = await createEmailTemplate(data);
        const created = (res as any).data || res;
        setTemplates(prev => [created, ...prev]);
        toast.success("New email template created successfully");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(editingTemplate ? "Failed to update template" : "Failed to create template");
    }
  };

  const handleToggle = async (template: EmailTemplate) => {
    try {
      const res = await toggleEmailTemplateStatus(template.id);
      const updated = (res as any).data || res;
      setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success(`${template.name} is now ${updated.is_active ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.body || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = showOnlyActive ? t.is_active === 1 : true;
    
    return matchesSearch && matchesFilter;
  });

  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto py-4">
        <EmailTemplateModal 
          isOpen={true}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
          template={editingTemplate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm shrink-0">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Email Templates</h1>
            <p className="text-sm text-slate-500 font-medium">Manage and refine automated communication flows</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTemplates}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-all border border-indigo-100 group active:scale-95"
          >
            <RefreshCcw size={18} className={clsx("group-hover:rotate-180 transition-transform duration-700", loading && "animate-spin")} />
            Refresh
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus size={18} />
            New Template
          </button>
        </div>
      </div>

      {/* ─── Controls ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Quick search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all font-semibold"
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Only</span>
          <button
            onClick={() => setShowOnlyActive(!showOnlyActive)}
            className={clsx(
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors outline-none",
              showOnlyActive ? "bg-emerald-500" : "bg-slate-300"
            )}
          >
            <span
              className={clsx(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                showOnlyActive ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {/* ─── Grid ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500 font-bold text-sm">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
            <Mail size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No templates found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTemplates.map((template) => (
            <EmailTemplateCard 
              key={template.id} 
              template={template} 
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* ─── Helper Notice ───────────────────────────────────────────────── */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex gap-4">
        <AlertCircle className="text-indigo-600 shrink-0" size={24} />
        <div className="text-xs text-indigo-900 font-medium leading-relaxed">
          <p className="font-bold mb-1 text-sm">Automated Variable Guide</p>
          <p className="mb-3 text-indigo-700/80 font-bold uppercase tracking-tight text-[10px]">Do NOT modify the text inside the curly brackets. These are dynamic system variables:</p>
          <div className="flex flex-wrap gap-2">
            {["{name}", "{job_title}", "{user_name}", "{reset_link}", "{company_name}", "{id}"].map(v => (
              <code key={v} className="bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-700 font-bold shrink-0">
                {v}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
