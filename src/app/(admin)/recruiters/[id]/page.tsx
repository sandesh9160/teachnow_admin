"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase, Building2, Calendar, ChevronLeft, Loader2, Mail,
  Phone, ShieldCheck, UserCheck, Activity, MapPin, Hash, Trash2,
  XCircle, CheckCircle2
} from "lucide-react";
import { getRecruiter, deleteRecruiter, disableRecruiter } from "@/services/admin.service";
import { Recruiter } from "@/types";
import { toast } from "sonner";
// import DataTable from "@/components/tables/DataTable";
// import Badge from "@/components/ui/Badge";
import { clsx } from "clsx";

const API_URL = process.env.NEXT_PUBLIC_API_URL||"https://teachnowbackend.jobsvedika.in";

export default function RecruiterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"Overview" | "Jobs">("Overview");

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  async function fetchDetails() {
    try {
      setLoading(true);
      console.log(`[RecruiterDetails] Fetching ID: ${resolvedParams.id}`);
      const res = await getRecruiter(Number(resolvedParams.id));
      console.log(`[RecruiterDetails] Loaded:`, res);
      setRecruiter(res);
    } catch (err: any) {
      console.error(`[RecruiterDetails] Load Error:`, err);
      toast.error("Failed to load recruiter details");
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (action: "toggle-status" | "delete") => {
    if (!recruiter || processing) return;
    const now = Date.now();
    console.log(`[handleAction] [${now}] Starting action: ${action} for recruiter ID: ${recruiter.id}`);
    try {
      setProcessing(true);
      if (action === "toggle-status") {
        const res = await disableRecruiter(recruiter.id) as any;
        console.log(`[handleAction] Disable Result:`, res);
        
        // Use the status from response or toggle locally
        const nextStatus = (res && typeof res.is_active !== 'undefined') ? !!res.is_active : !recruiter.is_active;
        setRecruiter(prev => prev ? { ...prev, is_active: nextStatus } : null);
        toast.success(nextStatus ? "Recruiter account enabled" : "Recruiter account disabled");
        return;
      }
      else if (action === "delete") {
        toast("Permanently delete this recruiter?", {
          description: "This action cannot be undone and will remove all associated recruitment data.",
          action: {
            label: "Delete",
            onClick: async () => {
              try {
                setProcessing(true);
                await deleteRecruiter(recruiter.id);
                toast.success("Recruiter deleted successfully");
                router.push("/recruiters");
              } catch (err) {
                toast.error("Failed to delete recruiter");
              } finally {
                setProcessing(false);
              }
            }
          },
          cancel: {
            label: "Okay",
            onClick: () => { },
          },
        });
        return;
      }
    } catch (err: any) {
      console.error(`[handleAction] Error:`, err);
      toast.error("Action failed"); 
    }
    finally { setProcessing(false); }
  };

  if (loading) return (
    <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <p className="text-[11px] font-semibold text-slate-900 tracking-wide">Loading...</p>
    </div>
  );

  if (!recruiter) return <div className="p-20 text-center text-slate-900 font-semibold tracking-wide">Recruiter not found</div>;

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString() : "—";
  const initials = recruiter.name?.split(" ").filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "RC";
  const jobs = recruiter.jobs ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 antialiased animate-fade-in-up px-4">
      <Link
        href="/recruiters"
        className="flex items-center w-fit gap-2 text-[12px] font-semibold text-slate-600 hover:text-primary transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95"
      >
        <ChevronLeft size={14} /> Back
      </Link>

      {/* ─── Header Card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold shrink-0">
                      {initials}
                  </div>
                  <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{recruiter.name}</h1>
                          <div className={clsx(
                              "px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider",
                              recruiter.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                              {recruiter.is_active ? "Active" : "Inactive"}
                          </div>
                      </div>
                      <div className="flex items-center gap-4 text-[13px] font-medium text-slate-500">
                          <span className="flex items-center gap-1.5"><Building2 size={13} className="text-slate-400" /> {recruiter.employer?.company_name || "Independent"}</span>
                          <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" /> {recruiter.email}</span>
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[12px] font-semibold text-slate-600">{recruiter.is_active ? "Active" : "Inactive"}</span>
                  <button
                    onClick={() => handleAction("toggle-status")}
                    disabled={processing}
                    className={clsx(
                      "relative w-12 h-7 rounded-full transition-all duration-300 shadow-sm",
                      recruiter.is_active ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <div className={clsx(
                      "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
                      recruiter.is_active ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
                <button 
                   onClick={() => handleAction("delete")}
                   disabled={processing}
                   className="h-9 px-4 flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-100 active:scale-95 text-[12px] font-bold"
                >
                   <Trash2 size={15} /> Delete
                </button>
              </div>
          </div>

          <div className="flex items-center gap-8 border-b border-slate-200 px-2 overflow-x-auto scrollbar-hide">
              {(["Overview", "Jobs"] as const).map((t) => (
                  <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={clsx(
                          "pb-4 pt-1 text-[13px] font-bold border-b-2 transition-all whitespace-nowrap",
                          activeTab === t ? "text-primary border-primary" : "text-slate-700 border-transparent hover:text-slate-600"
                      )}
                  >
                      {t}
                  </button>
              ))}
          </div>
      </div>

      {/* ─── Metrics Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
              { label: "Jobs posted", value: jobs.length, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Account status", value: recruiter.is_active ? "Active" : "Disabled", icon: Activity, color: recruiter.is_active ? "text-emerald-600" : "text-rose-600", bg: recruiter.is_active ? "bg-emerald-50" : "bg-rose-50" },
              { label: "Member since", value: fmt(recruiter.created_at), icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" }
          ].map((m, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:bg-slate-50/20 transition-all group">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", m.bg, m.color)}>
                     <m.icon size={18} />
                  </div>
                  <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{m.label}</p>
                      <p className={clsx("text-base font-bold text-slate-900")}>{m.value}</p>
                  </div>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {activeTab === "Overview" && (
              <>
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                             <Building2 size={20} />
                          </div>
                          <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">Recruiter details</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <Field label="Full name" value={recruiter.name} />
                            <Field label="Designation" value={(recruiter as any).designation || "Recruitment Agent"} />
                            <Field label="Institution" value={recruiter.employer?.company_name || "Independent"} icon={Building2} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 space-y-5">
                       <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest pl-1">Communication</p>
                       <div className="space-y-3">
                          <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                                  <Mail size={16} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email address</p>
                                  <p className="text-[13px] font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{recruiter.email}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                                  <Calendar size={16} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Joined date</p>
                                  <p className="text-[13px] font-semibold text-slate-900">{fmt(recruiter.created_at)}</p>
                              </div>
                          </div>
                       </div>
                    </div>
                </div>
              </>
          )}

          {activeTab === "Jobs" && (
             <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                         <Briefcase size={16} />
                      </div>
                      <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Active vacancies</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 tracking-wide">Live Inventory</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job title</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Type</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Posted date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {jobs.map((job: any) => (
                                <tr key={job.id} onClick={() => router.push(`/jobs/${job.id}`)} className="group hover:bg-slate-50/50 cursor-pointer transition-all">
                                    <td className="px-6 py-4">
                                        <p className="text-[13px] font-semibold text-slate-900 leading-tight group-hover:text-primary transition-colors">{job.title}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1 inline-flex items-center gap-1"><MapPin size={10} className="text-slate-400" />{job.location}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0">
                                            {job.job_type?.replace("_", " ")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={clsx(
                                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                            job.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {job.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-[11px] text-slate-500 font-medium whitespace-nowrap">
                                        {fmt(job.created_at)}
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                      <Briefcase size={32} className="mx-auto text-slate-200 mb-3" />
                                      <p className="text-[13px] text-slate-400 font-medium italic">No vacancy records found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
             </div>
          )}
      </div>

    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: React.ReactNode | string | number | null; icon?: any }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none">{label}</p>
      <div className="flex items-center gap-2.5 min-h-[24px]">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
            <Icon size={14} />
          </div>
        )}
        <div className="text-[14px] text-slate-900 font-semibold leading-tight flex items-center">
          {value || <span className="text-slate-400 font-medium whitespace-nowrap italic text-[12px]">Not provided</span>}
        </div>
      </div>
    </div>
  );
}

