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
  Loader2,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import Pagination from "@/components/ui/Pagination";
import type { PaginatedResponse, Payment, PaymentsResponse } from "@/types";

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
        const responseData = res as PaymentsResponse;
        setPayments(responseData.data || []);
        setTotalItems(responseData.total_payments || 0);
        
        // Use backend provided last_page, or calculate it from total_payments
        const total = responseData.total_payments || 0;
        const lastPage = responseData.last_page || Math.ceil(total / 10);
        setTotalPages(lastPage || 1);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (payment: Payment) => {
    if (payment.payment_id) {
        router.push(`/payments/${payment.payment_id}`);
    } else {
        toast.error("Detailed record only available for processed payments");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments();
  };

  const columns = [
    {
      key: "order_id",
      title: "Order ID",
      render: (val: any) => (
        <span className="text-[13px] font-bold text-slate-700">#{val}</span>
      )
    },
    {
      key: "transaction_id",
      title: "Transaction ID",
      render: (val: any) => (
        <span className="font-mono text-[12px] text-indigo-900 font-bold tracking-normal">{val || "—"}</span>
      )
    },
    {
      key: "employer_name",
      title: "Institute",
      render: (val: any, row: Payment) => (
        <div className="flex items-center gap-3">
          {row.employer_logo ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
               <img src={row.employer_logo} alt={val} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
               <Building2 size={14} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-900 leading-tight">{val}</span>
            {row.payment_method && (
              <span className="text-[10px] text-indigo-600 font-medium capitalize">{row.payment_method} payment</span>
            )}
          </div>
        </div>
      )
    },
    {
        key: "plan_name",
        title: "Plan Purchased",
        render: (val: any) => (
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
      render: (val: any, row: Payment) => (
        <div className="flex flex-col">
          <span className="text-[14px] font-extrabold text-slate-900">{row.currency || "₹"}{Number(val).toLocaleString()}</span>
          <span className="text-[10px] font-bold text-emerald-600">Tax included</span>
        </div>
      )
    },
    {
      key: "created_at",
      title: "Date",
      render: (val: any) => (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-slate-700">{new Date(val).toLocaleDateString()}</span>
          <span className="text-[11px] text-indigo-500 font-medium">{new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (val: any) => {
        const s = val?.toLowerCase() || "created";
        return (
          <div className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm",
            s === "paid" || s === "success" || s === "completed"
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : s === "failed" || s === "rejected"
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-amber-50 text-amber-600 border-amber-100"
          )}>
            {s === "paid" || s === "success" || s === "completed" ? <CheckCircle2 size={12} /> : s === "failed" ? <XCircle size={12} /> : <Clock size={12} />}
            {val}
          </div>
        );
      }
    },
    {
      key: "actions",
      title: "",
      render: (_: any, row: Payment) => row.payment_id ? (
        <div className="p-2 hover:bg-slate-100 rounded-lg text-slate-900 hover:text-indigo-600 transition-all group">
          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      ) : null
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 antialiased animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employer Payments</h1>
          <p className="page-subtitle">Track and review all subscription payment transactions</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
          <Banknote size={13} /> {totalItems} records
        </span>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2">
        <form onSubmit={handleSearch} className="relative flex-1 group max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-900 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            suppressHydrationWarning
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[12.5px] font-medium text-slate-900 placeholder:text-slate-900 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
          />
        </form>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           {(["all", "success", "pending", "failed"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                suppressHydrationWarning
                className={clsx(
                  "px-4 py-1.5 text-[11px] font-bold rounded-md transition-all",
                  statusFilter === opt 
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" 
                    : "text-slate-900 hover:bg-slate-50"
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
          <div className="mt-8 flex justify-center">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
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
