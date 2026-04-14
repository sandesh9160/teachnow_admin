"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  Loader2,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { getRecruiter } from "@/services/admin.service";
import { Recruiter } from "@/types";
import { toast } from "sonner";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import RecruiterEditModal from "@/components/modals/RecruiterEditModal";

export default function RecruiterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Profile" | "Jobs Posted">("Profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  async function fetchDetails() {
    try {
      setLoading(true);
      const res = await getRecruiter(Number(resolvedParams.id));
      setRecruiter(res);
    } catch {
      toast.error("Failed to load recruiter repository");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Loading recruiter details...
        </p>
      </div>
    );
  }

  if (!recruiter) {
    return (
      <div className="p-20 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-slate-200">
          <ShieldCheck size={40} />
        </div>
        <h4 className="text-[14px] font-bold text-slate-900 uppercase tracking-widest">
          Recruiter Not Found
        </h4>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-2">
          The recruiter you requested does not exist.
        </p>
        <Link
          href="/recruiters"
          className="inline-block mt-8 text-[11px] font-bold text-indigo-600 uppercase tracking-widest border-b-2 border-indigo-100 hover:border-indigo-600 transition-all"
        >
          Return to directory
        </Link>
      </div>
    );
  }

  const jobs = recruiter.jobs ?? [];
  const initials =
    recruiter.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "RC";

  const jobColumns = [
    {
      key: "title",
      title: "Job",
      render: (value: unknown) => (
        <span className="font-bold text-slate-900">{String(value ?? "-")}</span>
      ),
    },
    {
      key: "location",
      title: "Location",
      render: (value: unknown) => (
        <span className="text-slate-600">{String(value ?? "-")}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value: unknown) => {
        const status = String(value ?? "pending");
        const variant =
          status === "approved"
            ? "success"
            : status === "rejected"
              ? "danger"
              : "warning";

        return (
          <Badge variant={variant} dot className="text-[10px] font-bold uppercase tracking-wider">
            {status}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      title: "Posted",
      render: (value: unknown) => (
        <span className="text-[11px] text-slate-500 font-semibold">
          {formatDate(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/recruiters"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[11px] font-bold text-slate-600 uppercase tracking-widest shadow-sm hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all"
        >
          <ChevronLeft size={14} />
          Back to Registry
        </Link>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
        >
          <Pencil size={14} />
          Edit Recruiter
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
            {initials}
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{recruiter.name}</div>
            <div className="flex flex-wrap items-center gap-2 text-slate-500 mt-1">
              <span className="flex items-center gap-1 text-[13px] font-medium">
                <Building2 size={15} /> {recruiter.employer?.company_name || "Independent recruiter"}
              </span>
              <Badge
                variant={recruiter.is_active ? "success" : "default"}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                {recruiter.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Recruiter ID
          </p>
          <p className="text-sm font-bold text-slate-900">#{recruiter.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="Jobs Posted" value={jobs.length} />
        <SummaryCard label="Institute" value={recruiter.employer?.company_name || "-"} />
        <SummaryCard
          label="Status"
          value={
            <span className={recruiter.is_active ? "text-emerald-600" : "text-slate-500"}>
              {recruiter.is_active ? "Active" : "Inactive"}
            </span>
          }
        />
        <SummaryCard label="Joined" value={formatDate(recruiter.created_at)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          {(["Profile", "Jobs Posted"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`px-4 py-3 text-[12px] font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "Profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="font-semibold mb-4 text-slate-900">Profile</div>
                <div className="space-y-4">
                  <InfoBlock label="Recruiter Name" value={recruiter.name} icon={ShieldCheck} />
                  <InfoBlock
                    label="Company"
                    value={recruiter.employer?.company_name || "Independent recruiter"}
                    icon={Building2}
                  />
                  <InfoBlock
                    label="Total Jobs"
                    value={jobs.length}
                    icon={Briefcase}
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="font-semibold mb-4 text-slate-900">Contact</div>
                <div className="space-y-4">
                  <ContactRow icon={Mail} label="Email" value={recruiter.email} />
                  <ContactRow icon={Phone} label="Phone" value={(recruiter as any).phone} />
                  <ContactRow
                    icon={Calendar}
                    label="Joined"
                    value={formatDate(recruiter.created_at)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Jobs Posted" && (
            <DataTable
              compact
              columns={jobColumns}
              data={jobs.map((job) => ({ ...job }))}
              emptyMessage="No jobs assigned to this recruiter."
              onRowClick={(row) => router.push(`/jobs/${row.id}`)}
            />
          )}
        </div>
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

function formatDate(value?: unknown) {
  if (!value) return "-";

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-start">
      <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm transition-all group-hover:text-indigo-600 shrink-0 group-hover:border-indigo-100">
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="pt-0.5">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-[13px] font-bold text-slate-900 tracking-tight leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="group space-y-2">
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
        <Icon size={10} /> {label}
      </p>
      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group-hover:shadow-md group-hover:border-indigo-100 transition-all">
        <span className="text-[12px] font-bold text-slate-900 truncate leading-none">
          {value || "Not provided"}
        </span>
      </div>
    </div>
  );
}
