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
  CheckCircle2,
  FileText,
  BadgeCheck,
  Zap,
  Loader2,
  Printer,
  History,
  Calendar,
  Clock,
  FileSearch
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-900">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
        <p className="text-[11px] font-bold text-indigo-900">Retrieving secure transaction data...</p>
      </div>
    );
  }

  if (!details) return null;

  const { employer, payment, subscription, invoice } = details;

  return (
    <div className="max-w-[1100px] mx-auto space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* ─── Consistent Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/payments")}
            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all active:scale-95 border border-transparent hover:border-indigo-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Order ID: #{payment.id}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400">Payment Date: {new Date(payment.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">Transaction Record</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 transition-all"
          >
            <Printer size={14} />
            Print Record
          </button>
          <a 
            href={invoice.pdf_url}
            target="_blank"
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Download size={14} />
            Download Invoice
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* ─── Card 1: Payment Summary ────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={16} className="text-indigo-600" />
              Payment Details
            </h3>
            <div className={clsx(
              "px-3 py-1 rounded-full text-[10px] font-bold border",
              payment.status === "success" || payment.status === "paid"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-rose-50 text-rose-600 border-rose-100"
            )}>
              {payment.status.toUpperCase()}
            </div>
          </div>
          
          <div className="p-6 flex-1 space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {invoice.currency || "₹"}{Number(payment.amount).toLocaleString()}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Transaction ID</p>
                <p className="text-[13px] font-mono font-bold text-slate-700 truncate" title={payment.transaction_id || ""}>
                  {payment.transaction_id || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400  mb-1.5">Payment Method</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Zap size={12} />
                  </div>
                  <p className="text-[16px] font-semibold text-slate-900">{payment.payment_method}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400  mb-1.5">Payment Time</p>
                <p className="text-[13px] font-bold text-slate-700">{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {/* <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Security Status</p>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <ShieldCheck size={14} />
                  <span className="text-[11px] font-bold">Secure Gateway</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* ─── Card 2: Subscription Details ────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
              <Zap size={16} className="text-indigo-600" />
              Subscription Plan
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase">
              {subscription.status}
            </span>
          </div>

          <div className="p-6 flex-1 space-y-5">
            <div>
              <h4 className="text-lg font-bold text-slate-900 leading-none">{subscription.plan_name} Plan</h4>
              <p className="text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Active License</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] font-bold text-slate-600">Job Posts Used</p>
                  <p className="text-[12px] font-bold text-indigo-600">{subscription.job_posts_used} / {subscription.job_posts_total}</p>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600" 
                    style={{ width: `${(subscription.job_posts_used / subscription.job_posts_total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] font-bold text-slate-600">Featured Jobs Used</p>
                  <p className="text-[12px] font-bold text-emerald-600">{subscription.featured_jobs_used} / {subscription.featured_jobs_total}</p>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(subscription.featured_jobs_used / subscription.featured_jobs_total) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Valid From</p>
                  <p className="text-[12px] font-bold text-slate-700">{new Date(subscription.starts_at || subscription.purchase_date || payment.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-rose-50 flex items-center justify-center text-rose-500">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-rose-400 uppercase mb-0.5">Expires On</p>
                  <p className="text-[12px] font-bold text-slate-700">{new Date(subscription.expires_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Card 3: Employer Details ────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={16} className="text-indigo-600" />
              Employer Info
            </h3>
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 uppercase tracking-tight">
              <BadgeCheck size={12} />
              Verified Account
            </div>
          </div>
          
          <div className="p-6 flex items-start gap-5">
            <div className="w-16 h-16 rounded-lg border border-slate-100 bg-white p-2 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
              {employer.logo ? (
                <img src={employer.logo} alt={employer.name} className="w-full h-full object-contain" />
              ) : (
                <Building2 size={28} className="text-slate-200" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 truncate leading-tight">{employer.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Employer ID: #{employer.id}</p>
              </div>
              
              <div className="space-y-2.5">
                {(employer.email || employer.phone) && (
                   <div className="flex flex-wrap gap-x-6 gap-y-2">
                     {employer.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={14} className="text-indigo-400" />
                          <span className="text-[12px] font-medium truncate">{employer.email}</span>
                        </div>
                     )}
                     {employer.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={14} className="text-indigo-400" />
                          <span className="text-[12px] font-medium">{employer.phone}</span>
                        </div>
                     )}
                   </div>
                )}
                {employer.address && (
                  <div className="flex items-start gap-2 text-slate-600 pt-2 border-t border-slate-50">
                    <MapPin size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-[12px] font-medium leading-relaxed">{employer.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Card 4: Invoice & Billing ────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-[12px] font-bold text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              Invoice & Billing
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-lg border border-slate-100/60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                  <FileSearch size={22} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 mb-0.5">{invoice.invoice_number}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dated: {invoice.invoice_date}</p>
                </div>
              </div>
              <a 
                href={invoice.pdf_url}
                target="_blank"
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-lg transition-all shadow-sm group"
                title="View PDF Invoice"
              >
                <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>

            <div className="space-y-2.5 px-1">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-medium text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-800">₹{Number(payment.amount * 0.82).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-medium text-slate-500">Tax (IGST 18%)</span>
                <span className="font-bold text-slate-800">₹{Number(payment.amount * 0.18).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[14px] font-bold text-slate-900">Total Paid</span>
                <span className="text-xl font-bold text-indigo-600">₹{Number(payment.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex items-center justify-center gap-8 pt-6 opacity-40">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[10px] font-semibold  tracking-widest text-slate-500">Secure Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <BadgeCheck size={14} className="text-slate-400" />
          <span className="text-[10px] font-semibold  tracking-widest text-slate-500">Verified Invoice</span>
        </div>
      </div>
    </div>
  );
}
