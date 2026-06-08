"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import { 
  RotateCcw, 
  Search, 
  ArrowLeft, 
  Loader2, 
  FileText, 
  X, 
  Eye, 
  Download,
  FileType,
  User,
  Mail,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft as BackIcon
} from "lucide-react";
import Link from "next/link";
import { getDeletedItems, restoreItem } from "@/services/admin.service";
import { toast } from "sonner";
import { clsx } from "clsx";
import { resolveMediaUrl } from "@/lib/media";

const backendUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";

interface PaginatedData {
  data: any[];
  total: number;
  current_page: number;
  last_page: number;
}

export default function DeletedResumesPage() {
  const [activeTab, setActiveTab] = useState<"uploaded" | "generated">("uploaded");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  const [uploadedData, setUploadedData] = useState<PaginatedData | null>(null);
  const [generatedData, setGeneratedData] = useState<PaginatedData | null>(null);
  const [uploadedPage, setUploadedPage] = useState(1);
  const [generatedPage, setGeneratedPage] = useState(1);

  const parsePaginatedResponse = (response: any): PaginatedData => {
    if (!response || typeof response !== "object") {
      return { data: [], total: 0, current_page: 1, last_page: 1 };
    }
    
    // Check if Laravel Pagination is nested: e.g. response.data contains the pagination object
    if (response.data && typeof response.data === "object" && "data" in response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        total: response.data.total || 0,
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1
      };
    }

    // Check if flat: response has total, current_page, and data is an array
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.total || 0,
        current_page: response.current_page || 1,
        last_page: response.last_page || 1
      };
    }

    // Fallback if data is directly an array
    const fallbackData = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : []);
    return {
      data: fallbackData,
      total: fallbackData.length,
      current_page: 1,
      last_page: 1
    };
  };

  const fetchDeletedResumes = async (page = uploadedPage) => {
    try {
      setLoading(true);
      const response = await getDeletedItems("resumes", { page });
      setUploadedData(parsePaginatedResponse(response));
      setUploadedPage(page);
    } catch (error) {
      console.error("Failed to fetch deleted resumes:", error);
      toast.error("Failed to load deleted resumes");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedCVs = async (page = generatedPage) => {
    try {
      setLoading(true);
      const response = await getDeletedItems("cvs", { page });
      setGeneratedData(parsePaginatedResponse(response));
      setGeneratedPage(page);
    } catch (error) {
      console.error("Failed to fetch deleted CVs:", error);
      toast.error("Failed to load deleted CVs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedResumes(1);
    fetchDeletedCVs(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (activeTab === "uploaded") {
      fetchDeletedResumes(newPage);
    } else {
      fetchDeletedCVs(newPage);
    }
  };

  const handleRestore = async (id: number, type: "resumes" | "cvs") => {
    try {
      await restoreItem(type, id);
      toast.success(`${type === "resumes" ? "Resume" : "CV"} restored successfully`);
      
      if (type === "resumes") {
        setUploadedData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            data: prev.data.filter(item => item.id !== id),
            total: Math.max(0, prev.total - 1)
          };
        });
      } else {
        setGeneratedData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            data: prev.data.filter(item => item.id !== id),
            total: Math.max(0, prev.total - 1)
          };
        });
      }
    } catch (error) {
      toast.error(`Failed to restore ${type === "resumes" ? "resume" : "CV"}`);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const proxyUrl = url.replace(backendUrl, "/backend-assets");
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const currentData = activeTab === "uploaded" 
    ? uploadedData?.data || [] 
    : generatedData?.data || [];

  const filtered = currentData.filter(item => {
    if (activeTab === "uploaded") {
      return (
        item.file_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.job_seeker?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.job_seeker?.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(item.job_seeker_id).includes(search)
      );
    } else {
      return (
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.job_seeker?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.job_seeker?.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(item.job_seeker_id).includes(search)
      );
    }
  });

  const uploadedColumns = [
    { 
      key: "job_seeker", 
      title: "Candidate", 
      render: (v: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-600">
            <User size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-slate-900 leading-tight">
              {v?.user?.name || "Unknown Candidate"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Mail size={10} className="text-slate-400" />
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                {v?.user?.email || "No Email"}
              </span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: "file_name", 
      title: "File Name", 
      render: (v: unknown) => (
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-blue-500" />
          <span className="font-semibold text-surface-900 text-[13px] line-clamp-1">{typeof v === "string" && v ? v : "Untitled.pdf"}</span> 
        </div>
      )
    },
    { 
      key: "file_url", 
      title: "Document", 
      render: (v: unknown, row: Record<string, unknown>) => v ? (
        <button 
          onClick={() => {
            setPreviewUrl(resolveMediaUrl(String(v)));
            setPreviewTitle(String(row.file_name || "Untitled.pdf"));
          }}
          className="text-primary-600 hover:underline text-[12px] font-bold flex items-center gap-1 cursor-pointer"
        >
          <Eye size={12} /> Preview PDF
        </button>
      ) : <span className="text-surface-300 italic text-[12px]">N/A</span>
    },
    { 
      key: "deleted_at", 
      title: "Deleted On", 
      render: (v: unknown) => <span className="text-slate-900 font-medium text-[12px] uppercase" suppressHydrationWarning>{typeof v === "string" && v ? new Date(v).toLocaleDateString() : "N/A"}</span> 
    },
    { 
      key: "actions", 
      title: "Actions", 
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleRestore(row.id as number, "resumes")}
            title="Restore" 
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase cursor-pointer"
          >
            <RotateCcw size={13} /> Restore
          </button>
        </div>
      )
    }
  ];

  const generatedColumns = [
    { 
      key: "job_seeker", 
      title: "Candidate", 
      render: (v: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100 text-purple-600">
            <User size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-slate-900 leading-tight">
              {v?.user?.name || "Unknown Candidate"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Mail size={10} className="text-slate-400" />
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                {v?.user?.email || "No Email"}
              </span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: "title", 
      title: "File Name", 
      render: (v: unknown) => (
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-purple-500" />
          <span className="font-semibold text-surface-900 text-[13px] line-clamp-1">{typeof v === "string" && v ? v : "Untitled CV"}</span> 
        </div>
      )
    },
    { 
      key: "pdf_path", 
      title: "Document", 
      render: (v: unknown, row: Record<string, unknown>) => v ? (
        <button 
          onClick={() => {
            setPreviewUrl(resolveMediaUrl(String(v)));
            setPreviewTitle(String(row.title || "Untitled CV"));
          }}
          className="text-purple-600 hover:underline text-[12px] font-bold flex items-center gap-1 cursor-pointer"
        >
          <Eye size={12} /> Preview PDF
        </button>
      ) : <span className="text-surface-300 italic text-[12px]">N/A</span>
    },
    { 
      key: "deleted_at", 
      title: "Deleted On", 
      render: (v: unknown) => <span className="text-slate-900 font-medium text-[12px] uppercase" suppressHydrationWarning>{typeof v === "string" && v ? new Date(v).toLocaleDateString() : "N/A"}</span> 
    },
    { 
      key: "actions", 
      title: "Actions", 
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleRestore(row.id as number, "cvs")}
            title="Restore" 
            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase cursor-pointer"
          >
            <RotateCcw size={13} /> Restore
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/deleted-items" className="w-8 h-8 rounded-lg bg-white border border-surface-200 flex items-center justify-center text-surface-400 hover:text-primary-600 transition-all shadow-xs">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Deleted Resumes & CVs</h1>
            <p className="text-[13px] text-surface-400 font-medium italic">Archive of removed candidate profiles and generated CVs</p>
          </div>
        </div>
      </div>

      {/* Stats & Tabs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
            onClick={() => {
              setActiveTab("uploaded");
              setSearch("");
            }}
            suppressHydrationWarning
            className={clsx(
                "p-3 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group cursor-pointer",
                activeTab === "uploaded" 
                    ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/10" 
                    : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50"
            )}
        >
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                        activeTab === "uploaded" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                    )}>
                        <FileText size={18} />
                    </div>
                    <div>
                        <p className={clsx("text-[10px] font-bold uppercase tracking-wider mb-0.5", activeTab === "uploaded" ? "text-indigo-100" : "text-slate-500")}>Deleted Uploaded Resumes</p>
                        <h3 className={clsx("text-xl font-black", activeTab === "uploaded" ? "text-white" : "text-slate-900")}>
                            {uploadedData?.total || 0}
                        </h3>
                    </div>
                </div>
                {activeTab === "uploaded" && <ArrowUpRight size={16} className="text-white/40" />}
            </div>
        </button>

        <button 
            onClick={() => {
              setActiveTab("generated");
              setSearch("");
            }}
            suppressHydrationWarning
            className={clsx(
                "p-3 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group cursor-pointer",
                activeTab === "generated" 
                    ? "bg-purple-600 border-purple-600 shadow-lg shadow-purple-600/10" 
                    : "bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/50"
            )}
        >
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                        activeTab === "generated" ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
                    )}>
                        <FileType size={18} />
                    </div>
                    <div>
                        <p className={clsx("text-[10px] font-bold uppercase tracking-wider mb-0.5", activeTab === "generated" ? "text-purple-100" : "text-slate-500")}>Deleted Generated CVs</p>
                        <h3 className={clsx("text-xl font-black", activeTab === "generated" ? "text-white" : "text-slate-900")}>
                            {generatedData?.total || 0}
                        </h3>
                    </div>
                </div>
                {activeTab === "generated" && <ArrowUpRight size={16} className="text-white/40" />}
            </div>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]/50">
            <div className="relative max-w-sm">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input 
                    type="text" 
                    placeholder={activeTab === "uploaded" ? "Search resumes..." : "Search by candidate or title..."} 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-80 pl-9 pr-4 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-surface-700 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium" 
                    suppressHydrationWarning
                />
            </div>
            {loading && <Loader2 size={18} className="animate-spin text-primary-500" />}
        </div>
        
        <DataTable 
          columns={(activeTab === "uploaded" ? uploadedColumns : generatedColumns) as any} 
          data={filtered as unknown as Record<string, unknown>[]} 
          compact={true} 
          loading={loading}
          emptyMessage={activeTab === "uploaded" ? "No deleted resumes found" : "No deleted generated CVs found"}
        />

        {/* Pagination Console */}
        {(() => {
          const pagination = activeTab === "uploaded" ? uploadedData : generatedData;
          if (!pagination || pagination.last_page <= 1) return null;

          return (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                <p className="text-[12px] font-semibold text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{filtered.length}</span> of {pagination.total} entries
                </p>

                <div className="flex items-center gap-3">
                    <button
                        disabled={pagination.current_page === 1 || loading}
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        suppressHydrationWarning
                        className="h-9 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[11px] font-bold active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <BackIcon size={14} strokeWidth={2.5} /> Previous
                    </button>

                    <div className="flex items-center gap-1.5">
                        <span className={clsx(
                          "text-[11px] font-bold w-8 h-8 flex items-center justify-center rounded-lg border",
                          activeTab === "uploaded" 
                            ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                            : "bg-purple-50 text-purple-600 border-purple-100"
                        )}>
                            {pagination.current_page}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 mx-1">/</span>
                        <span className="text-[11px] font-bold text-slate-500 w-8 h-8 flex items-center justify-center">
                            {pagination.last_page}
                        </span>
                    </div>

                    <button
                        disabled={pagination.current_page === pagination.last_page || loading}
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        suppressHydrationWarning
                        className="h-9 px-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm text-[11px] font-bold active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    >
                        Next <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
          );
        })()}
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 antialiased">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setPreviewUrl(null)} 
          />
          
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col z-10">
            {/* Modal Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs",
                  activeTab === "uploaded" 
                    ? "bg-blue-50 text-blue-600 border-blue-100" 
                    : "bg-purple-50 text-purple-600 border-purple-100"
                )}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900">{previewTitle}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Document Preview</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleDownload(previewUrl!, previewTitle)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button 
                  onClick={() => setPreviewUrl(null)} 
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-4 overflow-hidden">
              {(() => {
                const fileUrl = previewUrl || "";
                const lowercaseUrl = fileUrl.toLowerCase();
                const isPdf = lowercaseUrl.endsWith('.pdf') || lowercaseUrl.includes('.pdf?');
                const isImage = lowercaseUrl.endsWith('.jpg') || lowercaseUrl.endsWith('.jpeg') || lowercaseUrl.endsWith('.png') || lowercaseUrl.endsWith('.gif') || lowercaseUrl.endsWith('.webp');

                if (isPdf) {
                  return (
                    <iframe 
                      src={`/api/download?url=${encodeURIComponent(previewUrl)}&mode=inline`}
                      className="w-full h-full rounded-2xl border border-slate-200/60 shadow-xs bg-white"
                      title="PDF Document Preview"
                    />
                  );
                }

                if (isImage) {
                  return (
                    <div className="p-8 flex items-center justify-center w-full h-full bg-white rounded-2xl border border-slate-200/60 shadow-xs">
                      <img 
                        src={previewUrl} 
                        alt="Document Preview" 
                        className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-200 bg-white" 
                      />
                    </div>
                  );
                }

                return (
                  <iframe 
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`} 
                    className="w-full h-full rounded-2xl border border-slate-200/60 shadow-xs bg-white"
                    title="PDF Document Preview"
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

