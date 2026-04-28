"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail,
  Search, 
  Loader2,
  RefreshCcw,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Clock,
  LibraryBig,
  Layout,
  Newspaper
} from "lucide-react";
import { 
  getEmailTemplates, 
  updateEmailTemplate,
  createEmailTemplate,
  deleteEmailTemplate,
  toggleEmailTemplateStatus
} from "@/services/admin.service";

import DataTable from "@/components/tables/DataTable";
import EmailTemplateModal from "@/components/modals/EmailTemplateModal";
import Pagination from "@/components/ui/Pagination";
import type { EmailTemplate, PaginatedResponse } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // View states
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>();

  useEffect(() => {
    fetchTemplates();
  }, [currentPage, search, showOnlyActive]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getEmailTemplates({ 
        page: currentPage, 
        search, 
        active: showOnlyActive ? 1 : undefined 
      }) as any;
      
      let list = [];
      let totalPgs = 1;
      let totalItms = 0;

      // Handle the different response formats
      if (res && typeof res === 'object' && 'current_page' in res) {
        // Flat paginated response (like the example provided by the user)
        list = res.data || [];
        totalPgs = res.last_page || 1;
        totalItms = res.total || 0;
      } else if (res?.data && typeof res.data === 'object' && 'current_page' in res.data) {
        // Nested paginated response (ApiResponse<PaginatedResponse<T>>)
        list = res.data.data || [];
        totalPgs = res.data.last_page || 1;
        totalItms = res.data.total || 0;
      } else {
        // Simple array response or fallback
        const data = res?.data || res;
        list = Array.isArray(data) ? data : [];
        totalPgs = 1;
        totalItms = list.length;
      }

      setTemplates(list);
      setTotalPages(totalPgs);
      setTotalItems(totalItms);
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
    // Optimistic Update
    const originalStatus = template.is_active;
    const newStatus = originalStatus ? 0 : 1;
    
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, is_active: newStatus } : t
    ));

    try {
      const res = await toggleEmailTemplateStatus(template.id);
      // Backend usually returns { data: { ...updatedTemplate } }
      const updated = (res as any).data?.data || (res as any).data || res;
      
      if (updated && typeof updated === 'object' && 'id' in updated) {
        setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
        toast.success(`${template.name} is now ${updated.is_active ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      // Revert on error
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, is_active: originalStatus } : t
      ));
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteEmailTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Template deleted successfully");
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };


  const columns = [
    {
      key: "name",
      title: "Template Identity",
      render: (_: unknown, row: EmailTemplate) => (
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-7 h-7 rounded-lg flex items-center justify-center border shrink-0",
            row.is_active ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-slate-100 text-slate-400 border-slate-200"
          )}>
            <Mail size={12} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-900 truncate tracking-tight leading-tight">{row.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-bold px-1.5 py-0 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 uppercase tracking-tighter">
                {row.slug}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      title: "Subject Line",
      render: (val: any) => (
        <div className="px-2 py-0.5 bg-blue-50/50 border-l-2 border-blue-400 rounded-r-md max-w-[280px]">
          <p className="text-[10px] font-medium text-blue-700 line-clamp-1 italic">
            "{val}"
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: unknown, row: EmailTemplate) => (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggle(row); }}
            className={clsx(
              "relative inline-flex h-5 w-9 items-center rounded-full transition-all outline-none border border-slate-200 shrink-0",
              row.is_active ? "bg-emerald-500 border-emerald-600" : "bg-slate-200"
            )}
            title={row.is_active ? "Disable Template" : "Enable Template"}
          >
            <span
              className={clsx(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all shadow-sm",
                row.is_active ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
          
          <div className="w-px h-4 bg-slate-100 mx-1" />

          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-1.5 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg transition-all hover:bg-indigo-600 hover:text-white shadow-sm"
            title="Edit Template"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            className="p-1.5 text-rose-600 bg-rose-50 border border-rose-100 rounded-lg transition-all hover:bg-rose-600 hover:text-white shadow-sm"
            title="Delete Template"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

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
          <div className="flex items-center gap-2">
            <a 
                href="/resources"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-[11px] transition-all border border-slate-200 uppercase tracking-tight"
            >
                <LibraryBig size={16} /> Resources
            </a>
            <a 
                href="/cv-templates"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-[11px] transition-all border border-slate-200 uppercase tracking-tight"
            >
                <Layout size={16} /> Resumes
            </a>
            <a 
                href="/content/blogs"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-[11px] transition-all border border-slate-200 uppercase tracking-tight"
            >
                <Newspaper size={16} /> Blogs
            </a>
          </div>
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

      {/* ─── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable 
          columns={columns} 
          data={templates} 
          loading={loading}
          onRowClick={handleEdit}
          emptyMessage="No email templates found matching your criteria."
        />
        
        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/30">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
