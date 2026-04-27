"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import { getPayments, getPayment } from "@/services/admin.service";
import { toast } from "sonner";
import { 
  Banknote, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle,
  CreditCard,
  ChevronRight,
  Building2,
  Calendar,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import Pagination from "@/components/ui/Pagination";
import type { PaginatedResponse, Payment } from "@/types";

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        search: search || undefined,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const res = await getPayments(params);
      if (res) {
        const responseData = res as any;
        setPayments(responseData.data || []);
        setTotalPages(responseData.last_page || 1);
        setTotalItems(responseData.total_payments || 0);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (payment: Payment) => {
    router.push(`/payments/${payment.id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments();
  };

  const columns = [
    {
      key: "transaction_id",
      title: "Transaction ID",
      render: (val: string) => (
        <span className="font-mono text-[12px] text-slate-500 font-bold uppercase tracking-wider">{val || "N/A"}</span>
      )
    },
    {
      key: "employer_name",
      title: "Employer / Institute",
      render: (val: string, row: Payment) => (
        <div className="flex items-center gap-3">
          {row.employer_logo ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
               <img src={row.employer_logo} alt={val} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
               <Building2 size={14} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-900 leading-tight">{val}</span>
            <span className="text-[10px] text-slate-400 font-medium capitalize">{row.payment_method} Payment</span>
          </div>
        </div>
      )
    },
    {
        key: "plan_name",
        title: "Plan Purchased",
        render: (val: string) => (
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                    <CreditCard size={14} />
                </div>
                <span className="text-[13px] font-bold text-violet-900">{val || "Standard Plan"}</span>
            </div>
        )
    },
    {
      key: "amount",
      title: "Amount",
      render: (val: number | string) => (
        <div className="flex flex-col">
          <span className="text-[14px] font-extrabold text-slate-900">₹{Number(val).toLocaleString()}</span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Tax Included</span>
        </div>
      )
    },
    {
      key: "created_at",
      title: "Date",
      render: (val: string) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-slate-700">{new Date(val).toLocaleDateString()}</span>
          <span className="text-[11px] text-slate-400 font-medium">{new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (val: string) => {
        const s = val?.toLowerCase() || "pending";
        return (
          <div className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
            s === "success" || s === "paid" || s === "completed"
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : s === "failed" || s === "rejected"
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-amber-50 text-amber-600 border-amber-100"
          )}>
            {s === "success" || s === "paid" || s === "completed" ? <CheckCircle2 size={12} /> : s === "failed" ? <XCircle size={12} /> : <Clock size={12} />}
            {val}
          </div>
        );
      }
    },
    {
      key: "actions",
      title: "",
      render: (_: any, row: any) => (
        <div className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all group">
          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      )
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ─── Compact Header ────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xl shadow-slate-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 -mt-32 -mr-32 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/20 shrink-0">
              <Banknote size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                 <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">Finance Hub</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{totalItems} Records Found</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Employer Payments</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Volume</span>
                <span className="text-lg font-black text-slate-900 leading-none">{totalItems}</span>
             </div>
             <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95 shadow-sm">
                <Download size={14} />
                Export CSV
             </button>
          </div>
        </div>
      </div>



      {/* ─── Table Controls ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 group max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[12.5px] font-medium text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
          />
        </form>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           {(["all", "success", "pending", "failed"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={clsx(
                  "px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize",
                  statusFilter === opt 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {opt}
              </button>
           ))}
        </div>
      </div>

      {/* ─── Main Table ─────────────────────────────────────── */}
      <div className="relative">
        <DataTable 
          columns={columns} 
          data={payments} 
          loading={loading}
          onRowClick={handleRowClick}
          emptyMessage="No financial transactions found for the selected criteria."
        />
        
        {!loading && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
