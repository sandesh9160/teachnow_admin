"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  FileText,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  createdAt: string;
}

export default function CustomPagesList() {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Mock API call to fetch custom pages
    const fetchPages = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Mock data
        setPages([
          { id: "1", title: "About Our Team", slug: "/about-our-team", status: "published", createdAt: "2023-10-15" },
          { id: "2", title: "Holiday Special Offers", slug: "/offers", status: "draft", createdAt: "2023-11-02" },
        ]);
      } catch (error) {
        toast.error("Failed to load custom pages");
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      setPages(pages.filter(p => p.id !== id));
      toast.success("Page deleted successfully");
    }
  };

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Loading Pages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm border border-pink-200">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none mb-1">Custom Pages</h1>
            <p className="text-xs font-medium text-slate-500">Manage dynamically created pages</p>
          </div>
        </div>

        <Link
          href="/custom-pages/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Create New Page
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search pages by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total Pages: {filteredPages.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Page Title</th>
                <th className="px-6 py-4">URL Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                          <FileText size={16} />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono border border-slate-200 text-slate-600">
                          {page.slug}
                        </span>
                        <a href={page.slug} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-600 transition-colors" title="View live page">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {page.status === 'published' ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                            <CheckCircle2 size={12} /> Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100">
                            <XCircle size={12} /> Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {page.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/custom-pages/edit/${page.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100" title="Edit Page">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => handleDelete(page.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Delete Page">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <FileText size={24} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium text-sm">No custom pages found.</p>
                      <p className="text-slate-400 text-xs mt-1">Click "Create New Page" to add one.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
