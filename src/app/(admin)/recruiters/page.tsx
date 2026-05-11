"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import Image from "next/image";
import {
  UserCheck,
  Search,

  Eye,
  Trash2,
  StopCircle,
  CheckCircle,
  Shield,
  Briefcase,
  Users,
  RotateCcw,
  ArrowUpRight,
  Activity,
  MapPin,
  ExternalLink,
  Building2,
  XCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getRecruiters,
  disableRecruiter,
  deleteRecruiter,
} from "@/services/admin.service";
import { Recruiter } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function RecruitersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const res = await getRecruiters();
      const list = (res as any).data?.data || (res as any).data || [];
      setRecruiters(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error("Failed to fetch recruiter list");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "disable" | "delete") => {
    try {
      setProcessingId(id);
      if (action === "disable") await disableRecruiter(id);
      else if (action === "delete") {
        toast("Permanently delete this recruiter?", {
          description: "This action cannot be undone and will remove all associated recruitment data.",
          action: {
            label: "Delete",
            onClick: async () => {
              try {
                setProcessingId(id);
                await deleteRecruiter(id);
                toast.success("Recruiter permanently deleted");
                fetchRecruiters();
              } catch (err) {
                toast.error("Failed to execute delete protocol");
              } finally {
                setProcessingId(null);
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

      toast.success(
        `Recruiter ${action === "disable" ? "status updated" : "permanently deleted"}`,
      );
      fetchRecruiters();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Failed to execute ${action} protocol`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = recruiters.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.employer?.company_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "name",
      title: "Full Name",
      render: (_: any, row: Recruiter) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[9px] shrink-0 border border-slate-200/50">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900 leading-tight tracking-tight text-[13px]">
              {row.name}
            </p>
            <p className="text-[10.5px] text-slate-700 font-medium truncate max-w-[140px] lowercase tracking-tight">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "employer",
      title: "Organization",
      render: (_: any, row: Recruiter) => (
        <div className="max-w-[160px]">
          <p className="font-medium text-slate-800 text-[12px] truncate tracking-tight">
            {row.employer?.company_name || (
              <span className="text-slate-300 italic">No organization</span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: "is_active",
      title: "Status",
      render: (v: any) => (
        <Badge
          variant={v ? "success" : "default"}
          dot
          className="text-[10px] px-2 h-4.5 bg-transparent border-none tracking-tight"
        >
          {v ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      title: "Joined On",
      render: (v: any) => (
        <div
          className="text-slate-700 font-medium text-[11px] whitespace-nowrap tracking-tight"
          suppressHydrationWarning
        >
          {new Date(v).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 antialiased animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruiter Management</h1>
          <p className="page-subtitle">Manage recruitment team members and access permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRecruiters}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw size={15} className={clsx(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: recruiters.length, icon: Users, color: "text-slate-500", bg: "bg-slate-100" },
          { label: "Active", value: recruiters.filter((r) => r.is_active).length, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Inactive", value: recruiters.filter((r) => !r.is_active).length, icon: StopCircle, color: "text-rose-500", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div>
              <p className="stat-card-label">{stat.label}</p>
              <h3 className="stat-card-value">{stat.value}</h3>
            </div>
            <div className={clsx("stat-card-icon", stat.bg, stat.color)}>
              <stat.icon size={17} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name, company or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
        />
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider">Recruiter</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider">Organization</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider text-right">Joined</th>
                <th className="px-4 py-3 text-[13px] font-bold text-slate-900 tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              
              {!loading &&
                filtered.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="group hover:bg-slate-50/30 transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/recruiters/${row.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {row.employer?.company_logo ? (
                            <Image
                              // Combines the Base API URL with the image path
                              src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/${row.employer.company_logo}`}
                                                            
                              alt="Company Logo"
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                           
                          ) : (
                            <span className="text-slate-400 font-bold text-[11px]">
                              {row.employer?.company_name?.charAt(0) || "C"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                            {row.name}
                          </p>
                          <p className="text-[10px] text-slate-900 font-medium mt-0.2 tracking-tight">
                            {row.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-700 font-medium">
                        <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center text-slate-400">
                          <Building2 size={10} />
                        </div>
                        <div className="max-w-[180px]">
                          <p className="truncate">
                            {row.employer?.company_name || (
                              <span className="text-slate-300 italic font-normal">
                                Independent
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex">
                        <Badge 
                          variant={row.is_active ? "success" : "danger"} 
                          dot 
                          className="capitalize"
                        >
                          {row.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </td>

                    <td
                      className="px-4 py-3 text-right text-[11px] text-slate-900 font-medium"
                      suppressHydrationWarning
                    >
                      {new Date(row.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/recruiters/${row.id}`)}
                          title="View Profile"
                          className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all active:scale-95"
                        >
                          <Eye size={15} />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {row.is_active ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => handleAction(row.id, "disable")}
                            disabled={processingId === row.id}
                            className={clsx(
                              "relative w-11 h-6 rounded-full transition-all duration-300 shadow-sm",
                              row.is_active ? "bg-emerald-500" : "bg-slate-300",
                            )}
                          >
                            <div
                              className={clsx(
                                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
                                row.is_active ? "left-5" : "left-0.5",
                              )}
                            />
                          </button>
                        </div>
                        <button
                          onClick={() => handleAction(row.id, "delete")}
                          disabled={processingId === row.id}
                          title="Delete account"
                          className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          

          {loading && (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2
                className="animate-spin text-primary/40 mb-3"
                size={32}
              />
              <span className="text-[13px] font-semibold text-slate-400">
                Loading recruiters...
              </span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center opacity-50">
              <Users size={40} className="text-slate-300 mb-3" />
              <span className="text-[14px] font-semibold text-slate-400">
                No recruiters found
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
