"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  Layout, 
  Menu,
  Pencil,
  Loader2,
  Compass,
  Settings2,
  Layers,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { 
  getCMSNavigations, 
  deleteCMSNavigation, 
  toggleCMSNavigationActive, 
  toggleCMSNavigationNav 
} from "@/services/admin.service";
import DataTable from "@/components/tables/DataTable";
import CMSNavigationModal from "@/components/modals/CMSNavigationModal";
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
      const payload = await getCMSNavigations();
      const data = Array.isArray(payload) ? payload : (payload as any)?.data ?? payload;
      const rawArr = Array.isArray(data) ? data : [];
      
      // Reconstruct tree from flat array (handles multi-level nesting safely)
      const itemMap = new Map();
      
      // First pass: Initialize map with empty children to avoid reference pollution
      rawArr.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] });
      });
      
      const roots: any[] = [];
      
      // Second pass: Build relationships
      itemMap.forEach(item => {
        if (item.parent_id && itemMap.has(item.parent_id)) {
          const parent = itemMap.get(item.parent_id);
          parent.children.push(item);
        } else if (!item.parent_id) {
          roots.push(item);
        }
      });
      
      const sortNodes = (nodes: any[]) => {
        return [...nodes].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      };

      const flatten = (nodes: any[], level = 0): any[] => {
        const sorted = sortNodes(nodes);
        return sorted.reduce((acc, node) => {
          acc.push({ ...node, level });
          if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            acc.push(...flatten(node.children, level + 1));
          }
          return acc;
        }, []);
      };

      setItems(flatten(roots));
    } catch (error) {
      console.error("Failed to fetch navigations:", error);
      toast.error("Failed to load navigation items");
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await deleteCMSNavigation(id);
      toast.success("Link deleted");
      fetchNavigations();
    } catch (error) {
      toast.error("Failed to delete link");
    }
  };

  const filtered = items.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.url?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "display_order", 
      title: "Order", 
      render: (v: unknown) => (
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 tabular-nums shadow-sm">
            {Number(v || 0)}
        </div>
      )
    },
    { 
      key: "title", 
      title: "Navigation Link", 
      render: (v: unknown, item: any) => (
        <div 
          style={{ paddingLeft: `${(item.level || 0) * 1.5}rem` }} 
          className="flex items-center gap-3 py-0.5"
        >
           {item.level > 0 ? (
             <div className="w-3 h-3 border-l-2 border-b-2 border-slate-200 rounded-bl-sm -mt-2 ml-1" />
           ) : (
             <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                <Layers size={12} />
             </div>
           )}
           <div className="flex flex-col">
              <span className={clsx(
                "font-bold tracking-tight", 
                (item.level || 0) === 0 ? "text-slate-900 text-[12px]" : "text-slate-600 text-[11px]"
              )}>
                {typeof v === "string" && v ? v : "New Link"}
              </span>
              <span className="text-[9px] text-slate-400 font-medium truncate max-w-[180px]">
                {item.url}
              </span>
           </div>
        </div>
      )
    },
    { 
      key: "show_in_nav", 
      title: "Menu Location", 
      render: (v: any, item: any) => {
        const isActive = v === 1 || v === true || v === "1" || v === "true";
        return (
          <div 
            className={clsx(
              "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
              isActive 
                ? "bg-slate-900 text-white shadow-sm" 
                : "bg-slate-100 text-slate-500 border border-slate-200"
            )}
          >
            {isActive ? <Layout size={10} /> : <Menu size={10} />}
            {isActive ? "Top Menu" : "Hidden"}
          </div>
        );
      }
    },
    { 
      key: "is_active", 
      title: "Status", 
      render: (v: any, item: any) => {
        const isActive = v === 1 || v === true || v === "1" || v === "true";
        return (
          <div 
            className={clsx(
              "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
              isActive 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                : "bg-slate-100 text-slate-400 border border-slate-200"
            )}
          >
            <div className={clsx(
              "w-1.5 h-1.5 rounded-full", 
              isActive ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-slate-300"
            )} />
            {isActive ? "Active" : "Inactive"}
          </div>
        );
      }
    },
    { 
        key: "actions", 
        title: "Actions", 
        render: (_: any, item: any) => (
            <div className="flex items-center justify-end gap-1.5 pr-2">
                <button 
                    title="Add Child"
                    onClick={() => {
                       setEditingItem({ parent_id: item.id });
                       setIsModalOpen(true);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-emerald-500 hover:text-white bg-white hover:bg-emerald-500 border border-emerald-100 rounded-lg transition-all shadow-sm"
                >
                    <Plus size={12} strokeWidth={3} />
                </button>
                <button 
                    title="Edit"
                    onClick={() => {
                       setEditingItem(item);
                       setIsModalOpen(true);
                    }}
                    className="w-7 h-7 flex items-center justify-center text-indigo-500 hover:text-white bg-white hover:bg-indigo-500 border border-indigo-100 rounded-lg transition-all shadow-sm"
                >
                    <Pencil size={12} strokeWidth={3} />
                </button>
                <button 
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                    className="w-7 h-7 flex items-center justify-center text-rose-500 hover:text-white bg-white hover:bg-rose-500 border border-rose-100 rounded-lg transition-all shadow-sm"
                >
                    <Trash2 size={12} strokeWidth={3} />
                </button>
            </div>
        ) 
    },
  ];

  return (
    <div className="space-y-5 pb-10 antialiased max-w-[1100px] mx-auto px-4 md:px-0">
      {/* Header — Clean & Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tight">CMS Management</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Navigation Menu</h1>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="h-10 flex items-center gap-2 px-5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Add New Link</span>
        </button>
      </div>

      {/* Control Bar — High Density */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search links..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[12px] text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-semibold placeholder:text-slate-400" 
          />
        </div>
        <div className="text-slate-400 text-[10px] font-bold uppercase pr-2">
           Total: {filtered.length} Links
        </div>
      </div>

      {/* Main Table — Compact */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable 
          compact 
          columns={columns} 
          data={filtered} 
          loading={loading} 
          emptyMessage="No links found. Click 'Add New Link' to start." 
        />
      </div>

      <CMSNavigationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchNavigations}
        item={editingItem}
        parentOptions={items}
      />

      <style jsx global>{`
        [data-table-row] {
          transition: background-color 0.15s ease;
        }
        [data-table-row]:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
