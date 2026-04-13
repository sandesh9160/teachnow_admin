"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { RotateCcw, Trash2, Search, ArrowLeft, Eye, Pencil, Loader2 } from "lucide-react";
import Link from "next/link";
import { getDeletedItems, restoreItem, permanentDelete } from "@/services/admin.service";
import { toast } from "sonner";
import type { DeletedItem } from "@/types";

export default function DeletedUsersPage() {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      setLoading(true);
      const response = await getDeletedItems("users");
      // Handle both paginated and flat response formats
      const data = "data" in response.data ? (response.data as any).data : response.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch deleted users:", error);
      toast.error("Failed to load deleted users");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreItem("users", id);
      toast.success("User restored successfully");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to restore user");
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await permanentDelete("users", id);
      toast.success("User permanently deleted");
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error("Failed to delete user permanently");
    }
  };

  const filtered = items.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) || 
    item.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      key: "name", 
      title: "Admin Name", 
      render: (v: string) => <span className="font-semibold text-surface-900 text-[13px]">{v || "N/A"}</span> 
    },
    { 
      key: "email", 
      title: "Email Address", 
      render: (v: string) => <span className="text-surface-500 font-medium text-[13px]">{v || "N/A"}</span> 
    },
    { 
      key: "deleted_at", 
      title: "Deleted On", 
      render: (v: string) => <span className="text-surface-400 font-medium text-[12px] uppercase">{v ? new Date(v).toLocaleDateString() : "N/A"}</span> 
    },
    { 
      key: "deleted_by", 
      title: "Action By", 
      render: (v: string) => <Badge variant="danger" className="text-[10px] font-semibold uppercase">{v || "Admin"}</Badge> 
    },
    { 
      key: "actions", 
      title: "Actions", 
      render: (_: any, item: DeletedItem) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleRestore(item.id)}
            title="Restore" 
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase cursor-pointer"
          >
            <RotateCcw size={13} /> Restore
          </button>
          <div className="w-px h-3 bg-surface-100 mx-1" />
          <button 
            onClick={() => handlePermanentDelete(item.id)}
            title="Purge" 
            className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase cursor-pointer"
          >
            <Trash2 size={13} /> Purge
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12 antialiased">
      <div className="flex items-center gap-4">
        <Link href="/deleted-items" className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 shadow-xs transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Deleted Users</h1>
          <p className="text-[13px] text-surface-400 font-medium italic">Archived administrative accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 flex items-center justify-between">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-80 pl-9 pr-4 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all" 
            />
          </div>
          {loading && <Loader2 size={18} className="animate-spin text-primary-500" />}
        </div>
        
        <DataTable 
          columns={columns} 
          data={filtered} 
          compact={true} 
          loading={loading}
          emptyMessage="No deleted users found"
        />
      </div>
    </div>
  );
}
