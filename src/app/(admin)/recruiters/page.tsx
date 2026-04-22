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
  Download,
  Filter,
  Calendar,
  Mail,
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
        if (
          !confirm("Are you sure you want to decommission this recruiter node?")
        )
          return;
        await deleteRecruiter(id);
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
          <div className="w-7 h-7 rounded-md bg-surface-100 flex items-center justify-center text-surface-400 font-bold text-[9px] shrink-0 border border-surface-200/50">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-surface-900 leading-tight tracking-tight text-[13px]">
              {row.name}
            </p>
            <p className="text-[10.5px] text-surface-400 font-medium truncate max-w-[140px] lowercase tracking-tight">
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
          <p className="font-medium text-surface-500 text-[12px] truncate tracking-tight">
            {row.employer?.company_name || (
              <span className="text-surface-300 italic">No organization</span>
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
          className="text-surface-400 font-medium text-[11px] whitespace-nowrap tracking-tight"
          suppressHydrationWarning
        >
          {new Date(v).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16 antialiased animate-fade-in-up">
      {/* ─── Header Section ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-1">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Recruiter Directory
          </h1>
          <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">
            Manage recruitment team members and access permissions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRecruiters}
            className="h-9 px-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-semibold text-[12px] active:scale-95 shadow-sm"
          >
            <RotateCcw size={14} className={clsx(loading && "animate-spin")} />{" "}
            Refresh
          </button>
        </div>
      </div>

      {/* ─── Statistics Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: recruiters.length,
            icon: Users,
            color: "text-slate-600",
            bg: "bg-slate-50",
          },
          {
            label: "Active",
            value: recruiters.filter((r) => r.is_active).length,
            icon: UserCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Inactive",
            value: recruiters.filter((r) => !r.is_active).length,
            icon: StopCircle,
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div
                className={clsx(
                  "w-9 h-9 rounded-xl flex items-center justify-center border",
                  stat.bg,
                  stat.color,
                )}
              >
                <stat.icon size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">
                {stat.label}
              </p>
              <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search Bar ────────────────────────────── */}
      <div className="relative group">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
        />
        <input
          type="text"
          placeholder="Search by name, company or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-semibold"
        />
      </div>

      {/* ─── Registry Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Recruiter
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                  Joined
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                          <p className="text-[10px] text-slate-500 font-medium mt-0.2 tracking-tight">
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
                        <div
                          className={clsx(
                            "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border lowercase",
                            row.is_active
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-slate-50 text-slate-500 border-slate-100",
                          )}
                        >
                          <span className="lowercase">
                            {row.is_active ? "active" : "inactive"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td
                      className="px-4 py-3 text-right text-[11px] text-slate-500 font-medium"
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
                          className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-all active:scale-95 shadow-sm"
                        >
                          <Eye size={15} />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
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
                          className="p-1.5 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 rounded-lg transition-all active:scale-95 shadow-sm"
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
