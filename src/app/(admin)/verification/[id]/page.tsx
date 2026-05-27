"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  SaveAll,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import { getEmployer, approveVerification, rejectVerification, deleteEmployer } from "@/services/admin.service";
import { Employer, EmployerDocument } from "@/types";
import { resolveMediaUrl } from "@/lib/media";

type DocStatus = "Pending" | "Approved" | "Rejected";

interface DocDecision {
  status: DocStatus;
  feedback: string;
}

export default function VerificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const feedbackRef = React.useRef<HTMLTextAreaElement>(null);

  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDocId, setActiveDocId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisions, setDecisions] = useState<Record<number, DocDecision>>({});
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState("");

  const handleDownload = (url: string, filename: string) => {
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
      window.location.href = proxyUrl;
      toast.success("Download started");
    } catch (err) {
      toast.error("Failed to start download");
    }
  };

  useEffect(() => {
    if (resolvedParams.id) {
      fetchDetails();
    }
  }, [resolvedParams.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getEmployer(Number(resolvedParams.id));
      if (res?.data) {
        setEmployer(res.data);
        const init: Record<number, DocDecision> = {};
        res.data.documents?.forEach((doc) => {
          init[doc.id] = { 
            status: (doc.status?.charAt(0).toUpperCase() + doc.status?.slice(1)) as DocStatus || "Pending", 
            feedback: "" 
          };
        });
        setDecisions(init);
        if (res.data.documents && res.data.documents.length > 0) {
          setActiveDocId(res.data.documents[0].id);
        }
      }
    } catch {
      toast.error("Failed to load verification details");
    } finally {
      setLoading(false);
    }
  };

  const activeDoc = employer?.documents?.find((d) => d.id === activeDocId);
  const currentDecision = activeDocId ? decisions[activeDocId] : null;

  const handleUpdateDecision = (field: keyof DocDecision, value: string) => {
    if (!activeDocId) return;
    setDecisions((prev) => ({
      ...prev,
      [activeDocId]: { ...prev[activeDocId], [field]: value },
    }));
  };

  const setDocStatus = async (status: "Approved" | "Rejected", feedback?: string) => {
    if (!activeDocId || !currentDecision) return;
    
    if (status === "Rejected" && (!feedback || !feedback.trim())) {
      toast.error("Please provide feedback for rejection.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (status === "Approved") {
        await approveVerification(activeDocId);
      } else {
        await rejectVerification(activeDocId, feedback || "");
      }
      
      handleUpdateDecision("status", status);
      if (feedback) {
        handleUpdateDecision("feedback", feedback);
      }
      toast.success(`${activeDoc?.document_name} marked as ${status}`);
    } catch {
      toast.error(`Failed to update ${activeDoc?.document_name} status`);
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
        router.push("/verification");
        return;
      }

      for (const doc of pendingDocs) {
        await approveVerification(doc.id);
        
        setDecisions((prev) => ({
          ...prev,
          [doc.id]: { ...prev[doc.id], status: "Approved" },
        }));
      }

      toast.success("All documents approved successfully!");
      router.push("/verification");
    } catch {
      toast.error("Failed to approve all documents");
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleDeleteInstitute = async () => {
    if (!employer || isSubmitting) return;
    toast("Delete this institute permanently?", {
      description: "This action will permanently remove the organization, all job postings, and associated recruiter accounts.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            setIsSubmitting(true);
            await deleteEmployer(employer.id);
            toast.success("Institute deleted successfully");
            router.push("/verification");
          } catch {
            toast.error("Failed to delete institute");
          } finally {
            setIsSubmitting(false);
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  const getStatusBadge = (status: DocStatus) => {
    if (status === "Approved") return <div className="absolute -top-2 -right-2 bg-emerald-100 text-emerald-600 rounded-full p-1"><CheckCircle2 size={12} /></div>;
    if (status === "Rejected") return <div className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"><XCircle size={12} /></div>;
    return null;
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-[13px] font-semibold text-slate-500">Loading details...</p>
    </div>
  );

  if (!employer) return <div className="p-20 text-center text-slate-500 font-bold">Institute not found</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ─── Header & Navigation ──────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/verification"
            className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 hover:text-primary transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm active:scale-95"
          >
            <ChevronLeft size={14} /> Back
          </Link>
          <button
            onClick={handleApproveAllDocs}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
          >
            {isSubmitting ? "Approving..." : "Approve All Docs"}
            {!isSubmitting && <CheckCircle2 size={18} />}
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            Review Documents
          </h1>
          <p className="text-sm text-surface-500 font-medium">
            Verify {employer.documents?.length || 0} submitted documents and provide feedback
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Institute Info Card */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="p-3 px-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2 text-sm">
              <Building size={16} className="text-primary-600" />
              Institute Information
            </h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider mb-0.5">
                Institute Name
              </p>
              <p className="text-sm font-semibold text-surface-900">
                {employer.company_name}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Mail size={12} /> Email
              </p>
              <p className="text-sm font-medium text-surface-700">{employer.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Phone size={12} /> Phone
              </p>
              <p className="text-sm font-medium text-surface-700">{employer.phone}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <MapPin size={12} /> Address
              </p>
              <p className="text-sm font-medium text-surface-700">{employer.address}</p>
            </div>
          </div>
        </div>

        {/* Documents Selection & Viewer */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          {/* Document Tabs / List */}
          <div className="p-4 border-b border-surface-100 bg-surface-50">
            <h3 className="text-sm font-semibold text-surface-900 mb-3">
              Uploaded Documents ({employer.documents?.length || 0})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {employer.documents?.map((doc) => {
                const docStat = decisions[doc.id]?.status || "Pending";
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={clsx(
                      "relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200",
                      activeDocId === doc.id
                        ? "border-primary-500 bg-primary-50 shadow-sm shadow-primary-500/10"
                        : "border-surface-200 bg-white hover:border-primary-300 hover:bg-surface-50"
                    )}
                  >
                    {getStatusBadge(docStat)}
                    <div className={clsx("p-1.5 rounded-lg shrink-0", activeDocId === doc.id ? "bg-primary-100 text-primary-600" : "bg-surface-100 text-surface-500")}>
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className={clsx("text-[13px] leading-tight font-semibold truncate", activeDocId === doc.id ? "text-primary-900" : "text-surface-900")}>
                        {doc.document_name}
                      </p>
                      <p className={clsx("text-[11px] truncate mt-0.5", activeDocId === doc.id ? "text-primary-600" : "text-surface-500")}>
                        Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Document Header */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-surface-100">
            <div>
              <h4 className="font-semibold text-surface-900 text-sm">
                {activeDoc?.document_name} Preview
              </h4>
              <p className="text-[11px] text-surface-500">
                 {activeDoc?.document_type}
              </p>
            </div>
            {activeDoc && (
              <button 
                onClick={() => handleDownload(resolveMediaUrl(activeDoc.document_file), activeDoc.document_name)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 bg-white border border-surface-200 hover:bg-surface-50 rounded-lg transition-colors shadow-sm"
              >
                <Download size={14} /> Download
              </button>
            )}
          </div>

          {/* Document Preview Area */}
          <div className="w-full bg-slate-50 min-h-[450px] flex flex-col items-center justify-center border-b border-surface-100 overflow-hidden relative">
            {activeDoc ? (
              activeDoc.document_file.toLowerCase().endsWith('.pdf') ? (
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
              )
            ) : (
              <div className="flex flex-col items-center opacity-40">
                <FileText size={48} className="text-surface-300 mb-3" />
                <p className="text-surface-600 text-sm font-medium italic">No document selected</p>
              </div>
            )}
          </div>

          {/* Document Verdict Section */}
          <div className="p-6 bg-slate-50 border-t border-surface-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-surface-900">Document Verdict</h3>
                <p className="text-xs text-surface-500">
                  Reviewing: <span className="font-semibold text-surface-700">{activeDoc?.document_name}</span>
                </p>
              </div>
              {currentDecision && (
                <Badge 
                  variant={
                    currentDecision.status === "Approved" ? "success" : 
                    currentDecision.status === "Rejected" ? "danger" : "warning"
                  } 
                  dot 
                  className="capitalize"
                >
                  {currentDecision.status}
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 max-w-sm pt-1">
              <button
                onClick={() => setDocStatus("Approved")}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                Approve
              </button>
              <button
                onClick={() => {
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
      </div>

      {/* Reject Reason Modal Popup */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#1E1B4B]/30 backdrop-blur-sm" 
            onClick={() => setIsRejectModalOpen(false)} 
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E1B4B]">Reject Document</h3>
              <button 
                onClick={() => setIsRejectModalOpen(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Please provide precise feedback explaining the reason for rejecting <span className="font-bold text-slate-700">{activeDoc?.document_name}</span>.
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
                onClick={() => setIsRejectModalOpen(false)}
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
                  await setDocStatus("Rejected", rejectFeedback);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
