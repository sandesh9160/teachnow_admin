"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";

// Mock data fetcher based on ID
const getVerificationData = (id: string) => {
  return {
    id,
    institute: "EduSmart School",
    email: "admin@edusmart.edu.in",
    phone: "+91 98765 43210",
    address: "123 Education Hub, New Delhi, 110001",
    status: "Pending",
    submissionDate: "Mar 10, 2025",
    documents: [
      { id: "d1", type: "GST Certificate", file: "edusmart_gst.pdf", size: "2.4 MB" },
      { id: "d2", type: "Registration Certificate", file: "edusmart_reg.pdf", size: "1.8 MB" },
      { id: "d3", type: "PAN Card", file: "edusmart_pan.pdf", size: "850 KB" },
      { id: "d4", type: "Affiliation Letter", file: "cbse_affiliation.pdf", size: "3.1 MB" },
      { id: "d5", type: "Address Proof", file: "electricity_bill.pdf", size: "1.2 MB" },
    ],
  };
};

type DocStatus = "Pending" | "Approved" | "Rejected";

interface DocDecision {
  status: DocStatus;
  feedback: string;
}

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const data = getVerificationData(params.id as string);
  const [activeDocId, setActiveDocId] = useState(data.documents[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to hold decisions for each document
  const [decisions, setDecisions] = useState<Record<string, DocDecision>>(() => {
    const init: Record<string, DocDecision> = {};
    data.documents.forEach((doc) => {
      init[doc.id] = { status: "Pending", feedback: "" };
    });
    return init;
  });

  const activeDoc = data.documents.find((d) => d.id === activeDocId)!;
  const currentDecision = decisions[activeDocId];

  const handleUpdateDecision = (field: keyof DocDecision, value: string) => {
    setDecisions((prev) => ({
      ...prev,
      [activeDocId]: { ...prev[activeDocId], [field]: value },
    }));
  };

  const setDocStatus = (status: "Approved" | "Rejected") => {
    if (status === "Rejected" && !currentDecision.feedback.trim()) {
      toast.error("Feedback is required to reject this specific document.");
      return;
    }
    handleUpdateDecision("status", status);
    toast.success(`${activeDoc.type} marked as ${status}`);
  };

  const handleSubmitAll = async () => {
    // Check if any document is pending
    const pendingDocs = Object.values(decisions).filter(d => d.status === "Pending");
    if (pendingDocs.length > 0) {
      toast.error(`Please review all documents. ${pendingDocs.length} remaining.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("All document decisions have been successfully submitted.");
      router.push("/verification");
    } catch (error) {
      toast.error("Failed to submit verifications.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: DocStatus) => {
    if (status === "Approved") return <div className="absolute -top-2 -right-2 bg-emerald-100 text-emerald-600 rounded-full p-1"><CheckCircle2 size={12} /></div>;
    if (status === "Rejected") return <div className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"><XCircle size={12} /></div>;
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ─── Header & Back Button ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/verification"
            className="p-2 bg-white border border-surface-200 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              Review Documents
            </h1>
            <p className="text-sm text-surface-500">
              Verify {data.documents.length} submitted documents and provide feedback
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmitAll}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-sm"
        >
          {isSubmitting ? "Submitting..." : "Submit All Decisions"}
          {!isSubmitting && <SaveAll size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ─── Left Column (Info & Viewer) ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Institute Info Card */}
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
            <div className="p-3 px-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
              <h3 className="font-semibold text-surface-900 flex items-center gap-2 text-sm">
                <Building size={16} className="text-primary-600" />
                Institute Information
              </h3>
              <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-600 uppercase tracking-wide">
                {data.status}
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              <div>
                <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider mb-0.5">
                  Institute Name
                </p>
                <p className="text-sm font-semibold text-surface-900">
                  {data.institute}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Mail size={12} /> Email
                </p>
                <p className="text-sm font-medium text-surface-700">{data.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Phone size={12} /> Phone
                </p>
                <p className="text-sm font-medium text-surface-700">{data.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-surface-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <MapPin size={12} /> Address
                </p>
                <p className="text-sm font-medium text-surface-700">{data.address}</p>
              </div>
            </div>
          </div>

          {/* Documents Selection & Viewer */}
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
            {/* Document Tabs / List */}
            <div className="p-4 border-b border-surface-100 bg-surface-50">
              <h3 className="text-sm font-semibold text-surface-900 mb-3">
                Uploaded Documents ({data.documents.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.documents.map((doc) => {
                  const docStat = decisions[doc.id].status;
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
                          {doc.type}
                        </p>
                        <p className={clsx("text-[11px] truncate mt-0.5", activeDocId === doc.id ? "text-primary-600" : "text-surface-500")}>
                          {doc.size}
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
                  {activeDoc.type} Preview
                </h4>
                <p className="text-[11px] text-surface-500">
                  {activeDoc.file} • {activeDoc.size}
                </p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 bg-white border border-surface-200 hover:bg-surface-50 rounded-lg transition-colors shadow-sm">
                <Download size={14} /> Download
              </button>
            </div>

            {/* Fake PDF Viewer */}
            <div className="w-full bg-surface-100/50 h-[360px] flex flex-col items-center justify-center p-6 border-b border-surface-100">
              <FileText size={48} className="text-surface-300 mb-3 drop-shadow-sm" />
              <p className="text-surface-600 text-sm font-medium">{activeDoc.file}</p>
              <p className="text-xs text-surface-400 mt-1">
                PDF Document Preview Area
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right Column (Feedback & Actions per doc) ───────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-surface-200 shadow-sm sticky top-6">
            <div className="p-4 border-b border-surface-100 bg-surface-50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-900">Document Verdict</h3>
                <span
                  className={clsx(
                    "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md",
                    currentDecision.status === "Pending" && "bg-amber-100 text-amber-700",
                    currentDecision.status === "Approved" && "bg-emerald-100 text-emerald-700",
                    currentDecision.status === "Rejected" && "bg-red-100 text-red-700"
                  )}
                >
                  {currentDecision.status}
                </span>
              </div>
              <p className="text-xs text-surface-500 mt-1">
                Reviewing: <span className="font-medium text-surface-700">{activeDoc.type}</span>
              </p>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Feedback Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-surface-700">
                  Document Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={currentDecision.feedback}
                  onChange={(e) => handleUpdateDecision("feedback", e.target.value)}
                  placeholder="Provide precise feedback..."
                  className="w-full h-24 px-3 py-2.5 rounded-lg border border-surface-200 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none text-[13px] bg-surface-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setDocStatus("Approved")}
                  className={clsx(
                    "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm border",
                    currentDecision.status === "Approved"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-surface-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                  )}
                >
                  <CheckCircle2 size={16} />
                  Approve Document
                </button>
                <button
                  onClick={() => setDocStatus("Rejected")}
                  className={clsx(
                    "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm border",
                    currentDecision.status === "Rejected"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white border-surface-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                  )}
                >
                  <XCircle size={16} />
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
