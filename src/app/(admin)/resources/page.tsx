"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Loader2,
  LibraryBig,
  Layout,
  Mail
} from "lucide-react";
import { 
  getResources, 
  createResource, 
  updateResource, 
  deleteResource,
  toggleResourceVisibility
} from "@/services/admin.service";
import ResourceCard from "@/components/cards/ResourceCard";
import ResourceModal from "@/components/modals/ResourceModal";
import Pagination from "@/components/ui/Pagination";
import type { TeachingResource, PaginatedResponse } from "@/types";
import { toast } from "sonner";

export default function ManageResourcesPage() {
  const [resources, setResources] = useState<TeachingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<TeachingResource | undefined>();

  useEffect(() => {
    fetchResources();
  }, [currentPage, search]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await getResources({
        page: currentPage,
        search
      });
      
      const responseData = (res as any).data;
      
      if (responseData && 'current_page' in responseData) {
        const paginated = responseData as PaginatedResponse<TeachingResource>;
        setResources(paginated.data || []);
        setTotalPages(paginated.last_page || 1);
        setTotalItems(paginated.total || 0);
      } else {
        const data = Array.isArray(responseData) ? responseData : [];
        setResources(data);
        setTotalPages(1);
        setTotalItems(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      toast.error("Unable to load teaching resources");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateNew = () => {
    setEditingResource(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (resource: TeachingResource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: FormData) => {
    try {
      if (editingResource) {
        const res = await updateResource(editingResource.id, formData);
        const updated = (res as any).data || res;
        setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
        toast.success("Resource updated successfully");
      } else {
        const res = await createResource(formData);
        const created = (res as any).data || res;
        setResources(prev => [created, ...prev]);
        toast.success("New resource published");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save resource");
      throw error;
    }
  };

  const handleToggleStatus = async (resource: TeachingResource) => {
    try {
      const newStatus = !resource.is_visible;
      await toggleResourceVisibility(resource.id);
      setResources(prev => prev.map(r => 
        r.id === resource.id ? { ...r, is_visible: newStatus ? 1 : 0 } : r
      ));
      toast.success(`${resource.title} is now ${newStatus ? 'visible' : 'hidden'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (resource: TeachingResource) => {
    if (!confirm(`Permanently remove "${resource.title}"?`)) return;

    try {
      await deleteResource(resource.id);
      setResources(prev => prev.filter(r => r.id !== resource.id));
      toast.success("Resource deleted successfully");
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };


  if (isModalOpen) {
    return (
      <div className="max-w-5xl mx-auto py-4">
        <ResourceModal 
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          resource={editingResource}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
            <LibraryBig size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Teaching Resources</h1>
            <p className="text-sm text-slate-500 font-medium">Manage PDFs, class notes, and learning materials</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a 
            href="/cv-templates"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-[11px] transition-all border border-slate-200 uppercase tracking-tight"
          >
            <Layout size={16} /> Resume Templates
          </a>
          <a 
            href="/email/templates"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-[11px] transition-all border border-slate-200 uppercase tracking-tight"
          >
            <Mail size={16} /> Email Templates
          </a>
          <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block" />
          <button 
            onClick={fetchResources}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all"
            title="Refresh List"
          >
            <Loader2 size={18} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-indigo-200"
          >
            <Plus size={18} /> Add Resource
          </button>
        </div>
      </div>

      {/* ─── Controls & Filters ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80 group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium"
          />
        </div>
      </div>

      {/* ─── Resources Grid ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm border-dashed">
          <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading resources catalog...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm border-dashed">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
            <LibraryBig size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No resources found</h3>
          <p className="text-sm text-slate-500 mt-1">Get started by creating a new teaching resource.</p>
          <button 
            onClick={handleCreateNew}
            className="mt-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Plus size={18} /> Add First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {resources.map((resource) => (
                    <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
      )}
    </div>
  );
}
