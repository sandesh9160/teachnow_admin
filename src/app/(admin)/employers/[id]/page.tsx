"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  MapPin, 
  Building2,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Star,
  Calendar,
  Clock,
  Save,
  Trash2,
  Users,
  Briefcase,
  Layout,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Activity
} from "lucide-react";
import { clsx } from "clsx";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { getEmployer, updateEmployer, verifyEmployer, featureEmployer, deleteEmployer } from "@/services/admin.service";
import { Employer } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const API_URL = "https://teachnowbackend.jobsvedika.in";

export default function InstituteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  
  const tabs = ["Overview", "Recruiters", "Jobs", "Applications", "SEO Settings"];

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getEmployer(Number(resolvedParams.id));
      if (res && res.data) {
        setEmployer(res.data);
      }
    } catch (err) {
      toast.error("Failed to load institute details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "verify" | "feature" | "delete") => {
    if (!employer) return;
    try {
      setProcessing(true);
      if (action === "verify") await verifyEmployer(employer.id);
      else if (action === "feature") await featureEmployer(employer.id);
      else if (action === "delete") {
        if (!confirm("Permanently delete this institute? This cannot be undone.")) return;
        await deleteEmployer(employer.id);
        router.push("/employers");
        return;
      }
      toast.success(`Institute ${action}d successfully`);
      fetchDetails();
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading Institute Repository...</p>
      </div>
    );
  }

  if (!employer) return <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Institute Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 antialiased">
      {/* ─── Compact Command Bar ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link 
          href="/employers" 
          className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-all bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm hover:shadow-md active:scale-95 uppercase tracking-wider"
        >
          <ChevronLeft size={14} strokeWidth={2.5} /> Back to Registry
        </Link>
        <div className="flex items-center gap-2">
           {!employer.is_verified && (
             <button
              onClick={() => handleAction("verify")}
              disabled={processing}
              className="px-5 py-2 bg-indigo-600 hover:bg-slate-900 text-white text-[11px] font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-2 active:scale-95 uppercase tracking-wider"
             >
               <CheckCircle2 size={14} strokeWidth={2} /> Authorize Partner
             </button>
           )}
           <button
            onClick={() => handleAction("feature")}
            disabled={processing}
            className={clsx(
                "px-5 py-2 text-[11px] font-bold rounded-xl transition-all border flex items-center gap-2 active:scale-95 shadow-sm hover:shadow-md uppercase tracking-wider",
                employer.company_featured 
                  ? "bg-amber-50 border-amber-200 text-amber-600" 
                  : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
            )}
           >
             <Star size={14} className={employer.company_featured ? "fill-amber-500" : ""} />
             {employer.company_featured ? "Featured" : "Set Featured"}
           </button>
           <button
            onClick={() => handleAction("delete")}
            disabled={processing}
            className="p-2 bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-90"
            title="Purge Permanent"
           >
             <Trash2 size={18} strokeWidth={2} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">
        {/* ─── Header Section ────────────────────────────────────────── */}
        <div className="p-8 pb-6 bg-white border-b border-slate-100 relative">
           <div className="absolute top-0 right-0 p-8">
              <span className={clsx(
                  "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-2",
                  employer.is_verified ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
              )}>
                {employer.is_verified ? <ShieldCheck size={12} strokeWidth={2} /> : <ShieldAlert size={12} strokeWidth={2} />}
                {employer.is_verified ? "Verified Identity" : "Pending Verification"}
              </span>
           </div>

           <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center shrink-0 group transition-transform duration-500 hover:rotate-3">
                 {employer.company_logo ? (
                     <img src={`${API_URL}/${employer.company_logo}`} alt="" className="w-full h-full object-contain rounded-xl" />
                 ) : (
                     <Building2 size={32} strokeWidth={1.5} className="text-indigo-600" />
                 )}
              </div>
              <div className="space-y-1.5">
                 <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{employer.company_name}</h1>
                 </div>
                 <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[12px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-2 text-indigo-600"><Layout size={14} strokeWidth={2} /> {employer.institution_type || "Institution"}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} strokeWidth={2} /> {[employer.city, employer.country].filter(Boolean).join(", ") || "Location unavailable"}</span>
                    <span className="flex items-center gap-2 text-slate-400 font-medium"><Calendar size={14} strokeWidth={2} /> {new Date(employer.created_at).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* ─── Compact Tabs ─────────────────────────────────────────── */}
        <div className="flex items-center gap-8 px-8 bg-white border-b border-slate-100 overflow-x-auto no-scrollbar">
           {tabs.map(t => (
               <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={clsx(
                    "py-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all relative block",
                    activeTab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
               >
                 {t}
               </button>
           ))}
        </div>

        <div className="p-8">
           {activeTab === "Overview" && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-3 space-y-6">
                     <section className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner group transition-all hover:bg-white hover:shadow-lg hover:border-indigo-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                <Activity size={14} strokeWidth={2} />
                                Institutional Profile
                            </h3>
                        </div>
                        <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                            {employer.about_company || employer.company_description || "No institutional biography provided yet."}
                        </p>
                     </section>

                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <MetricCard label="Staff Personnel" value={employer.recruiters?.length || 0} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
                        <MetricCard label="Deployments" value={employer.jobs?.length || 0} icon={Briefcase} color="text-emerald-600" bg="bg-emerald-50" />
                        <MetricCard label="Trust Level" value="High Trust" icon={ShieldCheck} color="text-indigo-600" bg="bg-indigo-50" />
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-lg shadow-black/5 space-y-5">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-2">
                            <Mail size={12} className="text-indigo-500" /> Contact Intel
                        </h3>
                        <div className="space-y-4">
                           <ContactItem icon={Mail} label="Corporate Email" value={employer.email} />
                           <ContactItem icon={Phone} label="Primary Contact" value={employer.phone} />
                           {employer.website && (
                              <div className="pt-2">
                                 <a 
                                    href={employer.website} 
                                    target="_blank" 
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 group"
                                 >
                                    Official Hub <Globe size={12} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                                 </a>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-4">
                        <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Protocol</h3>
                        <p className="text-[12px] font-medium text-slate-500 leading-relaxed italic">
                           Always corroborate <span className="font-bold text-slate-900">Partner Identity</span> before executing structural upgrades.
                        </p>
                     </div>
                  </div>
               </div>
           )}

           {activeTab === "Recruiters" && (
             <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <DataTable 
                    columns={[
                        { key: "name", title: "PERSONNEL", render: (_: any, r: any) => (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase border border-indigo-100">
                                    {r.user?.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{r.user?.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{r.designation || "Staff Member"}</p>
                                </div>
                            </div>
                        )},
                        { key: "email", title: "EMAIL", render: (_: any, r: any) => <span className="text-[12px] font-medium text-slate-600">{r.user?.email}</span> },
                        { key: "status", title: "STATUS", render: (v: any, r: any) => <Badge variant={r.is_active ? "success" : "default"} dot className="text-[9px] font-bold uppercase tracking-wider">{r.is_active ? "Active" : "Disabled"}</Badge> },
                        { key: "created_at", title: "JOINED", render: (v: any) => <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter" suppressHydrationWarning>{new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span> }
                    ]}
                    data={employer.recruiters || []}
                    emptyMessage="No associated recruiters found."
                />
             </div>
           )}

           {activeTab === "Jobs" && (
              <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <DataTable 
                    columns={[
                        { key: "title", title: "VACANCY", render: (v: any) => <span className="font-bold text-slate-900 text-[13px]">{v}</span> },
                        { key: "location", title: "LOCATION", render: (v: any) => <span className="text-slate-500 font-medium text-[11px]">{v}</span> },
                        { key: "status", title: "MODERATION", render: (v: any) => <Badge variant={v === 'approved' ? 'success' : v === 'pending' ? 'warning' : 'danger'} dot className="text-[9px] font-bold uppercase">{v}</Badge> },
                        { key: "created_at", title: "POSTED", render: (v: any) => <span className="text-slate-400 font-bold text-[11px] uppercase" suppressHydrationWarning>{new Date(v as string).toLocaleDateString()}</span> }
                    ]}
                    data={employer.jobs || []}
                    emptyMessage="No job postings recorded."
                    onRowClick={(row) => router.push(`/jobs/${row.id}`)}
                />
              </div>
           )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, bg }: any) {
    return (
        <div className="p-5 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight">{value}</p>
            </div>
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm", bg, color)}>
                <Icon size={18} strokeWidth={2} />
            </div>
        </div>
    );
}

function ContactItem({ icon: Icon, label, value }: any) {
    return (
        <div className="group space-y-1.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-indigo-600 transition-colors uppercase">{label}</p>
            <div className="flex items-center gap-2.5">
                <Icon size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" strokeWidth={2} />
                <span className="text-[13px] font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors leading-none">{value || "Not provided"}</span>
            </div>
        </div>
    );
}
