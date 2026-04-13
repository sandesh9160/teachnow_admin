"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  RotateCcw, 
  Trash2, 
  Eye, 
  EyeOff, 
  Layout, 
  Menu,
  MoreVertical,
  GripVertical,
  Check,
  X,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { 
  getCMSNavigations, 
  createCMSNavigation, 
  updateCMSNavigation, 
  deleteCMSNavigation, 
  toggleCMSNavigationActive, 
  toggleCMSNavigationNav 
} from "@/services/admin.service";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function CMSNavbarPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchNavigations();
  }, []);

  const fetchNavigations = async () => {
    try {
      setLoading(true);
      const response = await getCMSNavigations();
      // Handle response structure if it's wrapped
      const data = (response.data as any).data || response.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch navigations:", error);
      toast.error("Failed to load navigation items");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleCMSNavigationActive(id);
      toast.success("Visibility updated");
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_active: !item.is_active } : item
      ));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleNav = async (id: number) => {
    try {
      await toggleCMSNavigationNav(id);
      toast.success("Navigation placement updated");
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, in_nav: !item.in_nav } : item
      ));
    } catch (error) {
      toast.error("Failed to update navigation placement");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this navigation item?")) return;
    try {
      await deleteCMSNavigation(id);
      toast.success("Item deleted");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const filtered = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.url?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "order", 
      title: "#", 
      render: (v: number) => <span className="text-[11px] font-bold text-surface-400">{(v || 0).toString().padStart(2, '0')}</span> 
    },
    { 
      key: "title", 
      title: "Menu Title", 
      render: (v: string) => <span className="font-bold text-surface-900 text-[13px]">{v || "Untitled"}</span> 
    },
    { 
      key: "url", 
      title: "Navigation Path", 
      render: (v: string) => (
        <code className="bg-surface-50 px-2 py-0.5 rounded text-[11px] font-medium text-primary-600 border border-surface-100">
          {v || "/"}
        </code>
      ) 
    },
    { 
      key: "in_nav", 
      title: "Placement", 
      render: (v: boolean, item: any) => (
        <button 
          onClick={() => handleToggleNav(item.id)}
          className={clsx(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
            v ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-surface-50 text-surface-400 border border-surface-100"
          )}
        >
          {v ? <Layout size={12} /> : <Menu size={12} />}
          {v ? "Header Nav" : "Hidden"}
        </button>
      )
    },
    { 
      key: "is_active", 
      title: "Status", 
      render: (v: boolean, item: any) => (
        <button 
          onClick={() => handleToggleActive(item.id)}
          className={clsx(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
            v ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}
        >
          <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", v ? "bg-emerald-500" : "bg-red-500")} />
          {v ? "Active" : "Disabled"}
        </button>
      ) 
    },
    { 
      key: "actions", 
      title: "Actions", 
      render: (_: any, item: any) => (
        <div className="flex items-center gap-2">
          <button 
            title="Edit"
            className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => handleDelete(item.id)}
            title="Delete"
            className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cms" className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-xs">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">CMS Sections</span>
               <span className="text-surface-200">/</span>
               <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Navbar Full</span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Main Navigation</h1>
            <p className="text-[13px] text-surface-400 font-medium">Manage top header menu items and site hierarchy</p>
          </div>
        </div>
        
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95"
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-surface-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-50 bg-[#F8FAFC]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search navigation..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full sm:w-80 pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-[13px] text-surface-700 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-surface-300" 
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
               onClick={fetchNavigations}
               disabled={loading}
               className="p-2 text-surface-400 hover:text-primary-600 hover:bg-white rounded-lg border border-transparent hover:border-surface-100 transition-all disabled:opacity-50"
            >
              <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
            </button>
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={filtered} 
          loading={loading}
          emptyMessage="No navigation items found"
        />
      </div>

      {/* Tip Section */}
      <div className="bg-primary-50/30 rounded-xl p-4 border border-primary-100/50 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
          <Layout size={16} />
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-primary-900 mb-0.5">Navigation Structure Advice</h4>
          <p className="text-[12px] text-primary-700 leading-relaxed font-medium">
            Keep your main navigation to 5-7 items for better UX. Items not in "Header Nav" will still be available for internal linking but won't appear in the site header bar. Use clear, action-oriented labels.
          </p>
        </div>
      </div>
    </div>
  );
}
