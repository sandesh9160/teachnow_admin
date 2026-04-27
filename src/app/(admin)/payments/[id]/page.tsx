"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPayment } from "@/services/admin.service";
import { 
  ArrowLeft,
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  BadgeCheck,
  Zap,
  Loader2,
  Printer,
  History,
  Calendar
} from "lucide-react";
import { clsx } from "clsx";
import type { PaymentDetails } from "@/types";
import { toast } from "sonner";

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDetails();
    }
  }, [params.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getPayment(Number(params.id));
      if (res && res.data) {
        setDetails(res.data);
      } else {
        toast.error("Transaction details not found");
        router.push("/payments");
      }
    } catch (error) {
      toast.error("Failed to load details");
      router.push("/payments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Retrieving Secure Transaction Data...</p>
      </div>
    );
  }

  if (!details) return null;

  const { employer, payment, subscription, invoice } = details;

  return (
    <div className="max-w-[1200px] mx-auto space-y-5 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ─── Compact Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push("/payments")}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all active:scale-95 shadow-sm"
              >
                  <ArrowLeft size={18} />
              </button>
              <div>
                  <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">Finance Ledger</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">#{payment.transaction_id}</span>
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Payment Overview</h1>
              </div>
          </div>

          <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm"
              >
                  <Printer size={13} />
                  Print
              </button>
              <a 
                href={invoice.pdf_url}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
              >
                  <Download size={13} />
                  Invoice
              </a>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── Left Side: Main Transaction Info ────────────────────────── */}
        <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: "Status", value: payment.status, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Net Amount", value: `₹${Number(payment.amount).toLocaleString()}`, icon: Zap, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Payment Date", value: new Date(payment.created_at).toLocaleDateString(), icon: Calendar, color: "text-slate-600", bg: "bg-slate-50" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-3">
                        <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                            <stat.icon size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className={clsx("text-[13px] font-black capitalize tracking-tight", stat.color)}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-900/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-600" />
                        Billing Profile
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[9px] font-bold text-slate-500 uppercase">
                        <BadgeCheck size={10} className="text-emerald-500" />
                        Verified
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-20 h-20 rounded-xl border border-slate-100 bg-white p-1.5 shadow-md shadow-slate-200/50 shrink-0 mx-auto sm:mx-0">
                            {employer.logo ? (
                                <img src={employer.logo} alt={employer.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <Building2 size={28} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Legal Name</p>
                                    <h4 className="text-lg font-bold text-slate-900">{employer.name}</h4>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Payment Method</p>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-amber-50 text-amber-600 rounded">
                                            <CreditCard size={12} />
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-700 capitalize">{payment.payment_method}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Contact</p>
                                    <p className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400" />
                                        {employer.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</p>
                                    <p className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                                        <Phone size={14} className="text-slate-400" />
                                        {employer.phone}
                                    </p>
                                </div>
                                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Registered Address</p>
                                    <p className="text-[13px] font-medium text-slate-500 flex items-start gap-2 leading-relaxed">
                                        <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                        {employer.address || "No official address listed in registry."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit History Placeholder */}
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                        <History size={20} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-[12px]">System Audit Log</h4>
                        <p className="text-slate-400 text-[10px] font-medium">Verified on {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Synchronized
                </div>
            </div>
        </div>

        {/* ─── Right Side: Subscription & Invoice ────────────────────────── */}
        <div className="lg:col-span-4 space-y-8">
            {/* Compact License Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col h-full">
                <div className="px-5 py-4 border-b border-slate-100 bg-indigo-600 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mt-12 -mr-12 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-indigo-200">Subscription</span>
                            <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur-md rounded text-[8px] font-bold uppercase tracking-tighter">
                                {subscription.status}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter">{subscription.plan_name}</h3>
                    </div>
                </div>

                <div className="p-5 flex-1 space-y-5">
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Job Posts</p>
                                <p className="text-[12px] font-black text-slate-900">{subscription.job_posts_used} / {subscription.job_posts_total}</p>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-600" 
                                    style={{ width: `${(subscription.job_posts_used / subscription.job_posts_total) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Featured Jobs</p>
                                <p className="text-[12px] font-black text-slate-900">{subscription.featured_jobs_used} / {subscription.featured_jobs_total}</p>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500" 
                                    style={{ width: `${(subscription.featured_jobs_used / subscription.featured_jobs_total) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid From</span>
                            <span className="text-[11px] font-bold text-slate-900">{new Date(subscription.starts_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiry</span>
                            <span className="text-[11px] font-bold text-rose-500">{new Date(subscription.expires_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm mb-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                            <FileText size={16} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-bold text-slate-900 truncate">{invoice.invoice_number}</p>
                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">{invoice.invoice_date}</p>
                        </div>
                        <a 
                            href={invoice.pdf_url}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"
                        >
                            <Download size={16} />
                        </a>
                    </div>
                    
                    <a 
                        href={invoice.pdf_url}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <ExternalLink size={12} />
                        View Invoice
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
