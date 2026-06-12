"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ChevronLeft, MapPin, Building, Building2, Globe, Mail, Phone,
  ShieldCheck, ShieldAlert, Star, Calendar, Clock,
  Trash2, Users, Briefcase, ExternalLink, Loader2,
  CheckCircle2, FileText, Hash, Info, Tag, CreditCard,
  Link2, Image as ImageIcon, Download, ArrowUpRight, Eye, X, XCircle
} from "lucide-react";
import { clsx } from "clsx";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { getEmployer, verifyEmployer, featureEmployer, deleteEmployer, updateEmployer, updateEmployerSEO, approveVerification, rejectVerification, RejectEmployer } from "@/services/admin.service";
import { Employer } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resolveMediaUrl } from "@/lib/media";

export default function InstituteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeDocId, setActiveDocId] = useState<number | null>(null);
  const [decisions, setDecisions] = useState<Record<number, { status: string; feedback: string }>>({});
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectingDoc, setRejectingDoc] = useState<any>(null);
  
  const [editData, setEditData] = useState<any>({
    company_name: "", company_description: "", about_company: "", industry: "",
    institution_type: "", website: "", address: "", email: "", phone: "",
    country: "", city: "", is_active: 1, is_profile_verified: 0,
    is_verified: 0, is_featured: 0, company_featured: 0,
    map_link: "", latitude: "", longitude: "", company_logo: ""
  });

  useEffect(() => {
    if (employer) {
      setEditData({
        company_name: employer.company_name || "",
        company_description: employer.company_description || "",
        about_company: employer.about_company || "",
        industry: employer.industry || "",
        institution_type: employer.institution_type || "",
        website: employer.website || "",
        address: employer.address || "",
        email: employer.email || "",
        phone: employer.phone || "",
        country: employer.country || "",
        city: employer.city || "",
        is_active: employer.is_active ?? 1,
        is_profile_verified: employer.is_profile_verified ?? 0,
        is_verified: employer.is_verified ?? 0,
        is_featured: employer.is_featured ?? 0,
        company_featured: employer.company_featured ?? 0,
        map_link: employer.map_link || "",
        latitude: employer.latitude || "",
        longitude: employer.longitude || "",
        company_logo: employer.company_logo || ""
      });
    }
  }, [employer]);

  // TODO: API INTEGRATION - Update Employer
  // Implement the API call here when ready.
  const handleUpdateEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit employer edit data:", editData);
    toast.success("Employer updated locally (API integration pending)");
  };

  const setDocStatus = async (docId: number, status: "Approved" | "Rejected", feedback?: string) => {
    if (!docId) return;

    if (status === "Rejected" && (!feedback || !feedback.trim())) {
      toast.error("Please provide feedback for rejection.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (status === "Approved") {
        await approveVerification(docId);
      } else {
        await rejectVerification(docId, feedback || "");
      }

      toast.success(`Document marked as ${status}`);
      await fetchDetails();
    } catch {
      toast.error(`Failed to update document status`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAllDocs = async () => {
    if (!employer?.documents || employer.documents.length === 0) return;
    try {
      setIsSubmitting(true);
      const pendingDocs = employer.documents.filter(doc => {
        const docStat = decisions[doc.id]?.status || "Pending";
        return docStat !== "Approved";
      });

      if (pendingDocs.length === 0) {
        toast.info("All documents are already approved.");
        return;
      }

      for (const doc of pendingDocs) {
        await approveVerification(doc.id);
      }

      toast.success("All documents approved successfully!");
      await fetchDetails();
    } catch {
      toast.error("Failed to approve all documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    try {
      // Use our internal proxy to bypass CORS and force download
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
      window.location.href = proxyUrl;
      toast.success("Download started");
    } catch (err) {
      console.error("Download trigger failed:", err);
      toast.error("Failed to start download. Please try again.");
    }
  };

  const tabs = ["Overview", "Edit Institute", "Recruiters", "Jobs", "Documents", "SEO"];

  useEffect(() => {
    if (!isNaN(Number(resolvedParams.id))) {
      fetchDetails();
    }
  }, [resolvedParams.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getEmployer(Number(resolvedParams.id));
      if (res?.data) {
        setEmployer(res.data);
        const init: Record<number, { status: string; feedback: string }> = {};
        res.data.documents?.forEach((doc: any) => {
          init[doc.id] = {
            status: (doc.status?.charAt(0).toUpperCase() + doc.status?.slice(1)) || "Pending",
            feedback: ""
          };
        });
        setDecisions(init);
        if (res.data.documents && res.data.documents.length > 0) {
          setActiveDocId(res.data.documents[0].id);
        }
      }
    } catch {
      toast.error("Failed to load employer details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "verify" | "feature" | "delete" | "toggle-status" | "rejected") => {
    if (!employer || processing) return;

    if (action === "delete") {
      toast("Permanently delete this organization?", {
        description: "This action will remove all associated records, including jobs and recruiters.",
        action: {
          label: "Delete",
          onClick: async () => {
            try {
              setProcessing(true);
              await deleteEmployer(employer.id);
              toast.success("Employer deleted successfully");
              router.push("/employers");
            } catch (err) {
              toast.error("Failed to delete employer");
            } finally {
              setProcessing(false);
            }
          }
        },
        cancel: {
          label: "Cancel",
          onClick: () => { },
        },
      });
      return;
    }

    try {
      setProcessing(true);
      if (action === "verify") {
        const res = await verifyEmployer(employer.id);
        setEmployer(prev => prev ? { ...prev, is_verified: res.data?.employer_verified ?? true, is_profile_verified: 1 } : null);
        toast.success(res.message || "Employer verified successfully");
        await fetchDetails();
      }
      else if (action === "feature") {
        const res = await featureEmployer(employer.id);
        const nextIsFeatured = res.data?.employer_featured ?? !employer.is_featured;
        setEmployer(prev => prev ? { ...prev, is_featured: nextIsFeatured, company_featured: nextIsFeatured } : null);
        toast.success(nextIsFeatured ? "Organization is now featured" : "Featured status removed");
        await fetchDetails();
      }
      else if (action === "rejected") {
        const res = await RejectEmployer(employer.id);
        console.log("reponse for the rejcted : ", res)
        setEmployer(prev => prev ? { ...prev, is_verified: res.data?.employer_verified ?? false, is_profile_verified: 2 } : null);
        toast.success(res.message || "Employer rejected successfully");
        await fetchDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <p className="text-[11px] font-bold text-surface-400 tracking-widest">Loading...</p>
    </div>
  );

  if (!employer) return <div className="p-20 text-center text-surface-400 font-bold">Employer not found</div>;

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString() : "—";

  const initials = employer.company_name?.charAt(0).toUpperCase() || "E";
  const activeDoc = employer?.documents?.find((d: any) => d.id === activeDocId);
  const currentDecision = activeDocId ? decisions[activeDocId] : null;

  return (
    <>
      <div className="w-full space-y-5 pb-10 antialiased">
        <Link
          href="/employers"
          className="flex items-center w-fit gap-2 text-[12px] font-semibold text-slate-600 hover:text-primary transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95"
        >
          <ChevronLeft size={14} /> Back
        </Link>

        {/* Institute Feature Request Alert */}
        {!employer.is_featured && (
          Number(employer.company_featured) === 1 ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Star size={16} className="text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-amber-800">Institute Requested Featured Listing</p>
                <p className="text-[11px] text-amber-600 font-medium mt-0.5">The institute has requested to be featured on the homepage. Use the toggle below to approve.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Star size={14} className="text-slate-700" />
              </div>
              <p className="text-[11px] font-semibold text-slate-700">No feature request from institute</p>
            </div>
          )
        )}

        {/* ─── Header Card ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-indigo-600 border border-slate-100 flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0 overflow-hidden">
              {employer.company_logo ? (
                <img src={resolveMediaUrl(employer.company_logo)} alt="" className="w-full h-full object-contain p-2 bg-white" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{employer.company_name}</h1>
                <div className={clsx(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold border lowercase",
                  (employer.is_verified || Number(employer.is_profile_verified) === 1) && "bg-emerald-50 text-emerald-600 border-emerald-100",
                  Number(employer.is_profile_verified) === 4 && "bg-amber-50 text-amber-600 border-amber-100",
                  Number(employer.is_profile_verified) === 2 && "bg-rose-50 text-rose-600 border-rose-100",
                  (!employer.is_verified && Number(employer.is_profile_verified) !== 1 && Number(employer.is_profile_verified) !== 4 && Number(employer.is_profile_verified) !== 2) && "bg-slate-50 text-slate-500 border-slate-100"
                )}>
                  <span className="lowercase">
                    {employer.is_verified || Number(employer.is_profile_verified) === 1
                      ? "verified"
                      : Number(employer.is_profile_verified) === 4
                        ? "pending"
                        : Number(employer.is_profile_verified) === 2
                          ? "rejected"
                          : "pending"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                <Tag size={14} className="text-slate-400" />
                <span>{employer.institution_type || "Institution"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[13px] font-bold text-slate-600">Featured</span>
              <button
                onClick={() => handleAction("feature")}
                disabled={processing}
                className={clsx(
                  "relative w-12 h-7 rounded-full transition-all duration-300 shadow-sm",
                  employer.is_featured
                    ? "bg-amber-500"
                    : "bg-slate-300"
                )}
              >
                <div className={clsx(
                  "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
                  employer.is_featured ? "left-6" : "left-1"
                )} />
              </button>
            </div>
            {employer.documents && employer.documents.length > 0 && (
              <button
                onClick={handleApproveAllDocs}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100 active:scale-95"
              >
                {isSubmitting ? "Approving..." : "Approve All Docs"}
                {!isSubmitting && <CheckCircle2 size={16} />}
              </button>
            )}
            {!(employer.is_verified || Number(employer.is_profile_verified) === 1) && (
              <button
                onClick={() => handleAction("verify")}
                disabled={processing}
                className="flex items-center gap-2 px-2 py-2 bg-emerald-600 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95"
              >
                <ShieldCheck size={16} /> Approve
              </button>
            )}
            {(Number(employer.is_profile_verified) === 4 || employer.is_verified || Number(employer.is_profile_verified) === 1) && (
              <button
                onClick={() => handleAction("rejected")}
                disabled={processing}
                className="flex items-center gap-2 px-2 py-2 bg-red-600 text-white text-[13px] font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-100 active:scale-95"
              >
                <XCircle size={16} /> Reject
              </button>
            )}
            <button
              onClick={() => handleAction("delete")}
              disabled={processing}
              className="flex items-center gap-2 px-2 py-2 bg-red-600 text-white text-[13px] font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-100 active:scale-95"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>


        {/* ─── Tabbed Navigation ─────────────────────────────────────── */}
        <div className="flex items-center gap-8 border-b border-slate-100 px-2 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={clsx(
                "pb-3 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap",
                activeTab === t ? "text-primary border-primary" : "text-slate-600 border-transparent hover:text-slate-900"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {activeTab === "Overview" && (
            <>
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                    <Info size={16} className="text-primary" /> Organization Summary
                  </h3>
                  <p className="text-[14px] text-slate-900 font-medium leading-relaxed break-words whitespace-pre-wrap">
                    {employer.company_description || employer.about_company || "No description provided."}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                  <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 size={16} className="text-indigo-500" /> Institution Detailes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <Field label="Industry Sector" value={employer.industry} />
                    <Field label="Institution Type" value={employer.institution_type} icon={Tag} />
                    {/* <Field label="Account Role" value={employer.role} icon={ShieldCheck} /> */}
                    <Field label="Official Address" value={employer.address} icon={MapPin} />
                    <Field label="City" value={employer.city} />
                    <Field label="Country" value={employer.country} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                    <Star size={16} className="text-amber-500" /> Feature Request Status
                  </h3>
                  {(() => {
                    const isFeatured = Number(employer.is_featured) === 1 || employer.is_featured === true;
                    const isExpired = employer.featured_until ? new Date(employer.featured_until) < new Date() : false;
                    const isPending = Number(employer.company_featured) === 1 && !isFeatured;

                    let statusText = "Not Requested";
                    let bgBorderTextClass = "bg-slate-50 text-slate-600 border-slate-100";

                    if (isFeatured && !isExpired) {
                      statusText = "Admin Featured";
                      bgBorderTextClass = "bg-amber-50 text-amber-700 border-amber-100";
                    } else if (isFeatured && isExpired) {
                      statusText = "Expired";
                      bgBorderTextClass = "bg-rose-50 text-rose-700 border-rose-100";
                    } else if (isPending) {
                      statusText = "Pending Request";
                      bgBorderTextClass = "bg-amber-50 text-amber-700 border-amber-100";
                    }

                    return (
                      <div className="flex flex-col gap-2">
                        <div className={clsx(
                          "px-2 py-2 rounded-xl text-[13px] font-semibold border text-center",
                          bgBorderTextClass
                        )}>
                          {statusText}
                        </div>
                        {isFeatured && employer.featured_until && (
                          <div className="text-center text-[11px] font-medium text-slate-500">
                            Active until {new Date(employer.featured_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                  <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                    <Mail size={16} className="text-indigo-500" /> Digital Contact
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Mail size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-black">Email Address</p>
                        <p className="text-[13px] font-medium text-slate-700 break-all">{employer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Phone size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-black">Official Phone</p>
                        <p className="text-[13px] font-medium text-slate-700">{employer.phone || "—"}</p>
                      </div>
                    </div>
                    {employer.website && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                          <Globe size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-black">Official Website</p>
                          <a
                            href={employer.website.startsWith("http") ? employer.website : `https://${employer.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] font-medium text-indigo-600 hover:underline break-all"
                          >
                            {employer.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                      <MapPin size={14} className="text-indigo-500" /> Verified Location
                    </h3>
                    {(employer.map_link || (employer.latitude && employer.longitude && Number(employer.latitude) !== 0 && Number(employer.longitude) !== 0)) && (
                      <a
                        href={employer.map_link && employer.map_link.startsWith("http")
                          ? employer.map_link
                          : `https://www.google.com/maps?q=${employer.latitude || 0},${employer.longitude || 0}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 text-[11.5px] font-bold rounded-xl"
                      >
                        See on Map <ExternalLink size={12} className="opacity-70" />
                      </a>
                    )}
                  </div>
                  <div className="w-full h-48 relative">
                    {(employer.latitude && employer.longitude && Number(employer.latitude) !== 0 && Number(employer.longitude) !== 0) || employer.map_link || employer.address ? (
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={(() => {
                          const lat = Number(employer.latitude);
                          const lng = Number(employer.longitude);
                          if (lat && lng && lat !== 0 && lng !== 0) {
                            return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
                          }
                          if (employer.map_link && (employer.map_link.includes("embed") || employer.map_link.includes("output="))) {
                            return employer.map_link;
                          }
                          const isUrl = employer.map_link?.startsWith("http");
                          const query = (!isUrl && employer.map_link) || employer.address || `${employer.city || ""}, ${employer.country || ""}`;
                          return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
                        })()}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-300 italic text-[12px]">No data found.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "Recruiters" && (
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <DataTable compact
                columns={[
                  {
                    key: "name", title: "Recruiter", render: (_: any, r: any) => (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                          {r.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-bold text-slate-900">{r.name}</span>
                      </div>
                    )
                  },
                  { key: "email", title: "Contact", render: (_: any, r: any) => <span className="font-semibold text-slate-500">{r.email}</span> },
                  { key: "is_active", title: "Status", render: (v: any) => <Badge variant={v ? "success" : "danger"} dot>{v ? "Active" : "Disabled"}</Badge> },
                  { key: "created_at", title: "Joined", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
                ]}
                data={employer.employer_users || []}
                emptyMessage="No recruiters listed."
              />
            </div>
          )}

          {activeTab === "Jobs" && (
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-primary" />
                  <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">Active Opportunities</h3>
                </div>
                <Link
                  href={`/jobs?employer_id=${employer.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[12px] font-bold rounded-xl hover:bg-indigo-100 transition-all shadow-sm active:scale-95"
                >
                  <ExternalLink size={14} /> Manage Registry
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <DataTable compact
                  columns={[
                    {
                      key: "title", title: "Opportunity", render: (v: any, r: any) => (
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{v}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{r.job_type?.replace("_", " ")}</p>
                        </div>
                      )
                    },
                    { key: "location", title: "Location", render: (v: any) => <span className="text-slate-500 font-semibold flex items-center gap-1"><MapPin size={11} />{v}</span> },
                    {
                      key: "salary_min", title: "Compensation", render: (_: any, r: any) => {
                        const min = Number(r.salary_min);
                        const max = Number(r.salary_max);
                        const hasSalary = min > 0 || max > 0;

                        return (
                          <span className={clsx("font-bold", hasSalary ? "text-slate-800" : "text-slate-400 italic")}>
                            {hasSalary
                              ? `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`
                              : "Not Disclosed"
                            }
                          </span>
                        );
                      }
                    },
                    { key: "status", title: "Audit", render: (v: any) => <Badge variant={v === "approved" ? "success" : v === "pending" ? "warning" : "danger"} dot>{v}</Badge> },
                    { key: "job_status", title: "Status", render: (v: any) => <Badge variant={v === "open" ? "info" : "default"} dot>{v}</Badge> },
                    { key: "created_at", title: "Posted", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
                    {
                      key: "id", title: "", render: (v: any) => (
                        <div className="flex justify-end">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold rounded-lg hover:bg-indigo-100 transition-all shadow-sm active:scale-95">
                            <ArrowUpRight size={14} /> View
                          </button>
                        </div>
                      )
                    }
                  ]}
                  data={employer.jobs || []}
                  emptyMessage="No active job records."
                  onRowClick={(row) => router.push(`/employers/${employer.id}/jobs/${row.id}`)}
                />
              </div>
            </div>
          )}

          {activeTab === "SEO" && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-indigo-500" />
                    <h3 className="text-[13px] font-bold text-slate-900">SEO Configuration</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Metadata Registry</p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData.entries());
                  try {
                    setProcessing(true);
                    await updateEmployerSEO(employer.id, data);
                    toast.success("SEO updated");
                    fetchDetails();
                  } catch (err) {
                    toast.error("Update failed");
                  } finally {
                    setProcessing(false);
                  }
                }} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">URL Slug</label>
                      <input name="slug" defaultValue={employer.slug || ""} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-sm" placeholder="e.g. narayana-delhi" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Meta Title</label>
                      <input name="meta_title" defaultValue={employer.meta_title || ""} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-sm" placeholder="Enter title..." />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Meta Keywords</label>
                    <input name="meta_keywords" defaultValue={employer.meta_keywords || ""} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-sm" placeholder="keyword1, keyword2..." />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Meta Description</label>
                    <textarea name="meta_description" defaultValue={employer.meta_description || ""} rows={3} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-300 transition-all shadow-sm resize-none" placeholder="Enter description..." />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="h-10 px-6 bg-indigo-600 text-white rounded-xl font-bold text-[12px] hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-indigo-100 flex items-center gap-2 ml-auto"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck size={14} />}
                      Save SEO Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "Documents" && (
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <DataTable
                columns={[
                  {
                    key: "document_name", title: "Reference", render: (v: any, r: any) => (
                      <button
                        onClick={() => setActiveDocId(r.id)}
                        className="flex items-center gap-3 text-left w-full hover:text-indigo-600 transition-colors focus:outline-none"
                      >
                        <FileText size={16} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">{v}</span>
                      </button>
                    )
                  },
                  { key: "document_type", title: "Classification", render: (v: any) => <span className="font-bold text-slate-500 uppercase text-[11px] tracking-tight">{v?.replace(/_/g, " ")}</span> },
                  { key: "status", title: "Status", render: (v: any) => <Badge variant={v === "approved" ? "success" : "warning"} dot>{v}</Badge> },
                  { key: "created_at", title: "Upload Date", render: (v: any) => <span className="text-[11px] font-bold text-slate-400">{fmt(v)}</span> },
                ]}
                data={employer.documents || []}
                emptyMessage="No organizational documents available."
              />

              {/* Document Preview & Verdict Section (Copied from verification details page) */}
              {activeDoc && (
                <div className="mt-6 border-t border-slate-100 bg-white">
                  {/* Active Document Header */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {activeDoc.document_name} Preview
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                        {activeDoc.document_type?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(resolveMediaUrl(activeDoc.document_file), activeDoc.document_name)}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95"
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>

                  {/* Document Preview Area */}
                  <div className="w-full bg-slate-50 min-h-[450px] flex flex-col items-center justify-center border-b border-slate-100 overflow-hidden relative">
                    {activeDoc.document_file.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={`/api/download?url=${encodeURIComponent(resolveMediaUrl(activeDoc.document_file))}&mode=inline`}
                        className="w-full h-[600px] border-none"
                        title={activeDoc.document_name}
                      />
                    ) : (
                      <div className="p-4 flex items-center justify-center w-full h-full">
                        <img
                          src={resolveMediaUrl(activeDoc.document_file)}
                          alt={activeDoc.document_name}
                          className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Document Verdict & Actions Section */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-slate-900">Document Verdict</h3>
                        <p className="text-xs text-slate-500">
                          Reviewing: <span className="font-semibold text-slate-700">{activeDoc.document_name}</span>
                        </p>
                      </div>
                      {currentDecision && (
                        <Badge
                          variant={
                            currentDecision.status === "Approved" ? "success" :
                              currentDecision.status === "Rejected" ? "danger" : "warning"
                          }
                          dot
                          className="capitalize font-bold text-xs"
                        >
                          {currentDecision.status}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 max-w-sm pt-1">
                      <button
                        onClick={() => setDocStatus(activeDoc.id, "Approved")}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectingDoc(activeDoc);
                          setRejectFeedback("");
                          setIsRejectModalOpen(true);
                        }}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm bg-red-600 hover:bg-red-700 text-white border border-red-700 active:scale-95 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Edit Institute" && (
            <form onSubmit={handleUpdateEmployer} className="lg:col-span-3 w-full space-y-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building size={20} className="text-primary" /> Edit Institute Details
                  </h3>
                  <p className="text-[13px] font-medium text-slate-500 mt-1">Update the company profile and associated configurations.</p>
                </div>
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Building2 size={14} className="text-primary" /> Company Name
                  </label>
                  <input
                    type="text"
                    value={editData.company_name}
                    onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Briefcase size={14} className="text-primary" /> Industry
                  </label>
                  <input
                    type="text"
                    value={editData.industry}
                    onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Building size={14} className="text-primary" /> Institution Type
                  </label>
                  <input
                    type="text"
                    value={editData.institution_type}
                    onChange={(e) => setEditData({ ...editData, institution_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Mail size={14} className="text-primary" /> Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Phone size={14} className="text-primary" /> Phone
                  </label>
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Globe size={14} className="text-primary" /> Website
                  </label>
                  <input
                    type="text"
                    value={editData.website}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <MapPin size={14} className="text-primary" /> City
                  </label>
                  <input
                    type="text"
                    value={editData.city}
                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <MapPin size={14} className="text-primary" /> Country
                  </label>
                  <input
                    type="text"
                    value={editData.country}
                    onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <MapPin size={14} className="text-primary" /> Address
                  </label>
                  <textarea
                    rows={3}
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <MapPin size={14} className="text-primary" /> Map Link
                  </label>
                  <input
                    type="text"
                    value={editData.map_link}
                    onChange={(e) => setEditData({ ...editData, map_link: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <MapPin size={14} className="text-primary" /> Latitude
                  </label>
                  <input
                    type="text"
                    value={editData.latitude}
                    onChange={(e) => setEditData({ ...editData, latitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <MapPin size={14} className="text-primary" /> Longitude
                  </label>
                  <input
                    type="text"
                    value={editData.longitude}
                    onChange={(e) => setEditData({ ...editData, longitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <ImageIcon size={14} className="text-primary" /> Company Logo Upload
                  </label>
                  <div className="flex items-center gap-4">
                    {editData.company_logo_preview || editData.company_logo ? (
                      <img 
                        src={editData.company_logo_preview || (editData.company_logo.startsWith('http') ? editData.company_logo : resolveMediaUrl(editData.company_logo))} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-xl object-contain border border-slate-200"
                      />
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setEditData({ 
                            ...editData, 
                            company_logo_file: file,
                            company_logo_preview: URL.createObjectURL(file)
                          });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <FileText size={14} className="text-primary" /> About Company
                  </label>
                  <textarea
                    rows={4}
                    value={editData.about_company}
                    onChange={(e) => setEditData({ ...editData, about_company: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <CheckCircle2 size={14} className="text-primary" /> Is Active
                  </label>
                  <select
                    value={editData.is_active}
                    onChange={(e) => setEditData({ ...editData, is_active: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <ShieldCheck size={14} className="text-primary" /> Is Verified
                  </label>
                  <select
                    value={editData.is_verified}
                    onChange={(e) => setEditData({ ...editData, is_verified: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Star size={14} className="text-primary" /> Is Featured
                  </label>
                  <select
                    value={editData.is_featured}
                    onChange={(e) => setEditData({ ...editData, is_featured: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-[13px] font-semibold text-slate-900 bg-white"
                  >
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2.5 px-8 py-3 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200/50 active:scale-95 disabled:opacity-50"
                  >
                    Save Institute Details
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>


      </div>



      {/* Reject Reason Modal Popup */}
      {isRejectModalOpen && rejectingDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1E1B4B]/30 backdrop-blur-sm"
            onClick={() => {
              setIsRejectModalOpen(false);
              setRejectingDoc(null);
            }}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E1B4B]">Reject Document</h3>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectingDoc(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Please provide precise feedback explaining the reason for rejecting <span className="font-bold text-slate-700">{rejectingDoc.document_name}</span>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Document Feedback *
              </label>
              <textarea
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Enter document rejection feedback..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectingDoc(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!rejectFeedback.trim()) {
                    toast.error("Feedback is required for rejection");
                    return;
                  }
                  setIsRejectModalOpen(false);
                  const docId = rejectingDoc.id;
                  setRejectingDoc(null);
                  await setDocStatus(docId, "Rejected", rejectFeedback);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: React.ReactNode | string | number | null; icon?: any }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <p className="text-[11px] font-bold text-black">{label}</p>
      <div className="flex items-start gap-2 min-h-[20px] min-w-0">
        {Icon && <Icon size={14} className="text-slate-400 shrink-0 mt-0.5" />}
        <div className="text-[14px] text-slate-900 font-medium leading-relaxed break-words whitespace-pre-wrap min-w-0">
          {value || <span className="text-slate-400 font-medium">—</span>}
        </div>
      </div>
    </div>
  );
}
