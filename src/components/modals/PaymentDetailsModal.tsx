"use client";

import React from "react";
import { 
  X, 
  Building2, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck,
  Zap
} from "lucide-react";
import { clsx } from "clsx";
import type { PaymentDetails } from "@/types";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: PaymentDetails | null;
}

export default function PaymentDetailsModal({ isOpen, onClose, details }: PaymentDetailsModalProps) {
  if (!isOpen || !details) return null;

  const { employer, payment, subscription, invoice } = details;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative bg-slate-50 w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transaction Ledger</h2>
              <p className="text-[12px] font-medium text-slate-500">ID: {payment.transaction_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Employer & Payment */}
            <div className="md:col-span-7 space-y-6">
              {/* Employer Profile */}
              <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                   <Building2 size={16} />
                   <h3 className="text-[11px] font-bold uppercase tracking-widest">Institute Profile</h3>
                </div>
                
                <div className="flex gap-4">
                   {employer.logo ? (
                     <div className="w-20 h-20 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 shrink-0 shadow-sm">
                        <img src={employer.logo} alt={employer.name} className="w-full h-full object-contain" />
                     </div>
                   ) : (
                     <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Building2 size={32} />
                     </div>
                   )}
                   <div className="space-y-3 flex-1">
                      <h4 className="text-lg font-bold text-slate-900 leading-tight">{employer.name}</h4>
                      <div className="grid grid-cols-1 gap-2">
                         <div className="flex items-center gap-2 text-[12px] text-slate-500">
                            <Mail size={14} className="text-slate-400" /> {employer.email}
                         </div>
                         <div className="flex items-center gap-2 text-[12px] text-slate-500">
                            <Phone size={14} className="text-slate-400" /> {employer.phone}
                         </div>
                         {employer.address && (
                           <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
                              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" /> 
                              {employer.address}
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              </section>

              {/* Payment Summary */}
              <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                   <Zap size={16} />
                   <h3 className="text-[11px] font-bold uppercase tracking-widest">Payment Breakdown</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Amount</p>
                      <p className="text-2xl font-black text-slate-900">₹{Number(payment.amount).toLocaleString()}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                      <div className={clsx(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        payment.status === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {payment.status === "success" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {payment.status}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Method</p>
                      <p className="text-[13px] font-bold text-slate-700 capitalize">{payment.payment_method}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Initiated At</p>
                      <p className="text-[13px] font-bold text-slate-700">{new Date(payment.created_at).toLocaleString()}</p>
                   </div>
                </div>
              </section>
            </div>

            {/* Right Column: Subscription & Invoice */}
            <div className="md:col-span-5 space-y-6">
              {/* Subscription Details */}
              <section className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 -mt-16 -mr-16 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <ShieldCheck size={16} />
                            <h3 className="text-[11px] font-bold uppercase tracking-widest">License Status</h3>
                        </div>
                        <div className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-bold uppercase rounded tracking-tighter">
                            {subscription.status}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tier</p>
                            <h4 className="text-2xl font-black text-white italic tracking-tight">{subscription.plan_name}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Job Posts</p>
                                <p className="text-sm font-bold">{subscription.job_posts_used} / {subscription.job_posts_total}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Featured</p>
                                <p className="text-sm font-bold">{subscription.featured_jobs_used} / {subscription.featured_jobs_total}</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Starts At</span>
                                <span className="font-semibold">{new Date(subscription.starts_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Expires At</span>
                                <span className="font-semibold text-rose-400">{new Date(subscription.expires_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </section>

              {/* Invoice Actions */}
              <section className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                 <div className="flex items-center gap-2 text-slate-400 mb-2">
                   <FileText size={16} />
                   <h3 className="text-[11px] font-bold uppercase tracking-widest">Document Registry</h3>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                             <FileText size={20} />
                          </div>
                          <div>
                             <p className="text-[13px] font-bold text-slate-900">{invoice.invoice_number}</p>
                             <p className="text-[10px] text-slate-400 font-medium">{invoice.invoice_date}</p>
                          </div>
                       </div>
                       <a 
                        href={invoice.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-100 transition-all shadow-sm"
                       >
                          <Download size={16} />
                       </a>
                    </div>

                    <a 
                      href={invoice.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[12px] font-bold shadow-lg shadow-indigo-600/10 transition-all active:scale-95"
                    >
                       <ExternalLink size={14} />
                       View Official Invoice
                    </a>
                 </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BadgeCheck size={14} className="text-emerald-500" />
                Verified Transaction
            </p>
            <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
                Dismiss Overview
            </button>
        </div>
      </div>
    </div>
  );
}
