"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase, Building2, Calendar, ChevronLeft, Loader2, Mail,
  Pencil, Phone, ShieldCheck, UserCheck, Activity, MapPin, Hash, Trash2,
  XCircle, CheckCircle2
} from "lucide-react";
import { getRecruiter, deleteRecruiter, disableRecruiter } from "@/services/admin.service";
import { Recruiter } from "@/types";
import { toast } from "sonner";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import RecruiterEditModal from "@/components/modals/RecruiterEditModal";
import { clsx } from "clsx";

const API_URL = "https://teachnowbackend.jobsvedika.in";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        if (!confirm("Permanently delete this recruiter? This cannot be undone.")) return;
        const res = await deleteRecruiter(recruiter.id);
        console.log(`[handleAction] Delete Result:`, res);
        toast.success("Recruiter deleted successfully");
        router.push("/recruiters");
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
      <p className="text-[11px] font-bold text-surface-400 tracking-widest uppercase">Loading...</p>
    </div>
  );

  if (!recruiter) return <div className="p-20 text-center text-surface-400 font-bold uppercase tracking-widest">Recruiter not found</div>;

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString() : "—";
  const initials = recruiter.name?.split(" ").filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "RC";
  const jobs = recruiter.jobs ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 antialiased animate-fade-in-up">
      {/* ─── Header Card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold shrink-0">
                      {initials}
                  </div>
                  <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                          <h1 className="text-xl font-bold text-slate-900 ">{recruiter.name}</h1>
                          <div className={clsx(
                              "px-2 py-0.5 rounded-lg text-[10px] font-bold border lowercase",
                              recruiter.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                          )}>
                              {recruiter.is_active ? "active" : "inactive"}
                          </div>
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><Building2 size={13} className="text-slate-400" /> {recruiter.employer?.company_name || "Independent"}</span>
                          <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" /> {recruiter.email}</span>
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 h-9 px-4 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[12px] font-semibold rounded-xl hover:bg-indigo-100 transition-all shadow-sm active:scale-95"
                 >
                    <Pencil size={14} /> Edit Profile
                 </button>
                 <button 
                    onClick={() => handleAction("toggle-status")}
                    disabled={processing}
                    className={clsx(
                        "flex items-center gap-2 h-9 px-4 text-[12px] font-semibold rounded-xl transition-all shadow-sm active:scale-95 border",
                        recruiter.is_active ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                    )}
                 >
                    <UserCheck size={14} /> 
                    {recruiter.is_active ? "Disable Account" : "Enable Account"}
                 </button>
                 <button 
                    onClick={() => handleAction("delete")}
                    disabled={processing}
                    className="w-9 h-9 flex items-center justify-center bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 rounded-xl transition-all shadow-sm active:scale-95"
                 >
                    <Trash2 size={15} />
                 </button>
              </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl w-fit">
              {(["Overview", "Jobs"] as const).map((t) => (
                  <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={clsx(
                          "px-5 py-1 rounded-lg text-[12px] font-semibold transition-all",
                          activeTab === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                  >
                      {t}
                  </button>
              ))}
          </div>
      </div>

      {/* ─── Metrics Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
              { label: "Jobs Posted", value: jobs.length, icon: Briefcase, color: "text-indigo-600" },
              { label: "Account ID", value: `#${recruiter.id}`, icon: Hash, color: "text-blue-600" },
              { label: "Status", value: recruiter.is_active ? "Active" : "Disabled", icon: ShieldCheck, color: recruiter.is_active ? "text-emerald-600" : "text-slate-600" },
              { label: "Member Since", value: fmt(recruiter.created_at), icon: Calendar, color: "text-cyan-600" }
          ].map((m, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">{m.label}</p>
                  <p className={clsx("text-[14px] font-bold text-slate-900", m.color)}>{m.value}</p>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {activeTab === "Overview" && (
              <>
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
                        <h3 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                            <UserCheck size={15} className="text-indigo-500" /> Recruiter Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            <Field label="Full Name" value={recruiter.name} />
                            <Field label="Designation" value={(recruiter as any).designation || "Recruitment Agent"} />
                            <Field label="Institution" value={recruiter.employer?.company_name || "Independent"} icon={Building2} />
                            <Field label="Member ID" value={recruiter.id} icon={Hash} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
                       <h3 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                           <Mail size={15} className="text-indigo-500" /> Contact Details
                       </h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                  <Mail size={13} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-slate-500">Email Address</p>
                                  <p className="text-[12px] font-semibold text-slate-900 truncate">{recruiter.email}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <Phone size={13} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-slate-500">Phone Number</p>
                                  <p className="text-[12px] font-semibold text-slate-900">{(recruiter as any).phone || "—"}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                                  <Calendar size={13} />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[10px] font-semibold text-slate-500">Registered Date</p>
                                  <p className="text-[12px] font-semibold text-slate-900">{fmt(recruiter.created_at)}</p>
                              </div>
                          </div>
                       </div>
                    </div>
                </div>
              </>
          )}

          {activeTab === "Jobs" && (
             <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                        <Briefcase size={15} className="text-indigo-500" /> Published Vacancies
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Live Inventory</span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/30">
                                <th className="px-5 py-3 text-[11px] font-bold text-slate-900 uppercase tracking-tight">Opportunity</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-slate-900 text-center uppercase tracking-tight">Engagement</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-slate-900 text-center uppercase tracking-tight">Status</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-slate-900 text-right uppercase tracking-tight">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {jobs.map((job: any) => (
                                <tr key={job.id} onClick={() => router.push(`/jobs/${job.id}`)} className="group hover:bg-slate-50/50 cursor-pointer transition-all">
                                    <td className="px-5 py-3">
                                        <p className="text-[13px] font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">{job.title}</p>
                                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5"><MapPin size={10} className="inline mr-1" />{job.location}</p>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <div className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                                            {job.job_type?.replace("_", " ")}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <div className={clsx(
                                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                            job.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {job.status}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                                        {fmt(job.created_at)}
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-5 py-10 text-center text-slate-400 italic text-[13px]">No job records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
             </div>
          )}
      </div>

      <RecruiterEditModal
        recruiter={recruiter}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={fetchDetails}
      />
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: React.ReactNode | string | number | null; icon?: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold text-slate-500">{label}</p>
      <div className="flex items-center gap-2 min-h-[18px]">
        {Icon && <Icon size={12} className="text-slate-400 shrink-0" />}
        <div className="text-[13px] text-slate-900 font-semibold truncate leading-tight flex items-center">
          {value || <span className="text-slate-400 font-medium">—</span>}
        </div>
      </div>
    </div>
  );
}
