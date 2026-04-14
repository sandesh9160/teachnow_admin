"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { Star, Search, Filter, MessageSquare, CheckCircle2, XCircle, Trash2, Loader2, Clock } from "lucide-react";
import { getReviews, updateReview } from "@/services/admin.service";
import { Review } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getReviews();
      const list = (res as any).data || (res as any) || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error("Failed to fetch reviews dossier");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: "approved" | "rejected") => {
    try {
      setProcessingId(id);
      await updateReview(id, { status });
      toast.success(`Review ${status} successfully`);
      fetchReviews();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = reviews.filter((r) => 
    r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
        key: "user_name", 
        title: "REVIEWER", 
        render: (_: any, r: Review) => (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg shadow-indigo-100">
                    {r.user_name?.charAt(0) || "U"}
                </div>
                <div>
                   <span className="font-bold text-slate-900 block leading-tight text-[12px]">{r.user_name}</span>
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5 inline-block">User</span>
                </div>
            </div>
        ) 
    },
    {
      key: "rating", 
      title: "RATING",
      render: (v: any) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={clsx(i < v ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-slate-100")} />
          ))}
          <span className="ml-2 text-[11px] font-black text-slate-900">{v}.0</span>
        </div>
      ),
    },
    { 
        key: "comment", 
        title: "COMMENT", 
        render: (v: any) => (
            <div className="max-w-xs group">
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic line-clamp-2">"{v}"</p>
            </div>
        ) 
    },
    { 
        key: "status", 
        title: "STATUS", 
        render: (v: any) => (
            <Badge 
                variant={v === "approved" ? "success" : v === "pending" ? "warning" : "danger"} 
                dot 
                className="text-[9px] font-black tracking-[0.1em] uppercase"
            >
                {v}
            </Badge>
        ) 
    },
    { 
        key: "created_at", 
        title: "DATE",
        render: (v: any) => (
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-tighter" suppressHydrationWarning>
                <Clock size={12} /> {new Date(v).toLocaleDateString()}
            </div>
        )
    },
    { 
        key: "actions", 
        title: "APPROVE", 
        render: (_: any, r: Review) => (
            <div className="flex items-center justify-end gap-1">
                {r.status !== "approved" && (
                    <button 
                        onClick={() => handleStatusChange(r.id, "approved")}
                        disabled={processingId === r.id}
                        suppressHydrationWarning
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
                        title="Approve Review"
                    >
                        <CheckCircle2 size={16} />
                    </button>
                )}
                {r.status !== "rejected" && (
                    <button 
                        onClick={() => handleStatusChange(r.id, "rejected")}
                        disabled={processingId === r.id}
                        suppressHydrationWarning
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                        title="Reject Review"
                    >
                        <XCircle size={16} />
                    </button>
                )}
            </div>
        ) 
    },
  ];

  return (
    <div className="space-y-4 pb-12 antialiased animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">User Reviews</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage and moderate site reviews</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
              suppressHydrationWarning
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
            >
                <Filter size={12} /> Refine Sort
            </button>
        </div>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            suppressHydrationWarning
            placeholder="Search by name or keyword..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-xl text-[12px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-semibold" 
          />
        </div>
        {loading && <Loader2 size={16} className="animate-spin text-indigo-600 mr-1" />}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-100/50">
        <DataTable columns={columns} data={filtered} loading={loading} compact emptyMessage="No reviews found." />
      </div>
    </div>
  );
}
