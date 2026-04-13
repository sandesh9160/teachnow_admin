"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building,
} from "lucide-react";
import { clsx } from "clsx";

const mockVerifications = [
  {
    id: 1,
    institute: "EduSmart School",
    docType: "GST Certificate",
    file: "edusmart_gst.pdf",
    status: "Pending",
    date: "Mar 10, 2025",
  },
  {
    id: 2,
    institute: "Bright Future Academy",
    docType: "Registration Certificate",
    file: "bfa_reg_cert.pdf",
    status: "Verified",
    date: "Mar 08, 2025",
  },
  {
    id: 3,
    institute: "Global Learning Institute",
    docType: "PAN Card",
    file: "gli_pan.pdf",
    status: "Pending",
    date: "Mar 07, 2025",
  },
  {
    id: 4,
    institute: "Sunshine International School",
    docType: "GST Certificate",
    file: "sunshine_gst.pdf",
    status: "Rejected",
    date: "Mar 05, 2025",
  },
  {
    id: 5,
    institute: "Knowledge Hub International",
    docType: "Incorporation Certificate",
    file: "khub_incorp.pdf",
    status: "Verified",
    date: "Mar 03, 2025",
  },
  {
    id: 6,
    institute: "Pioneer Education Group",
    docType: "Registration Certificate",
    file: "pioneer_reg.pdf",
    status: "Pending",
    date: "Mar 01, 2025",
  },
];

export default function VerificationPage() {
  const [search, setSearch] = useState("");

  const filtered = search
    ? mockVerifications.filter(
        (v) =>
          v.institute.toLowerCase().includes(search.toLowerCase()) ||
          v.docType.toLowerCase().includes(search.toLowerCase())
      )
    : mockVerifications;

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-10">
      {/* ─── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Pending</p>
          <h4 className="text-2xl font-bold text-amber-500 mt-2">4</h4>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Verified</p>
          <h4 className="text-2xl font-bold text-emerald-500 mt-2">3</h4>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Rejected</p>
          <h4 className="text-2xl font-bold text-red-500 mt-2">1</h4>
        </div>
      </div>

      {/* ─── Search & Filters ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-2xl">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            placeholder="Search by institute or document type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all font-medium placeholder:font-normal placeholder:text-surface-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="px-4 py-2.5 border border-surface-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-surface-600 font-medium">
            <option>Status</option>
            <option>Pending</option>
            <option>Verified</option>
            <option>Rejected</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* ─── Data Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-surface-100 bg-white">
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-surface-500 uppercase">
                  Institute Name
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-surface-500 uppercase">
                  Document Type
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-surface-500 uppercase">
                  Uploaded File
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-surface-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-surface-500 uppercase">
                  Submitted Date
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-surface-500 uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-surface-50/50 transition-colors bg-white group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <Building size={16} className="text-primary-600" />
                      </div>
                      <span className="font-semibold text-surface-900">
                        {row.institute}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-surface-500">
                      {row.docType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-primary-500 hover:text-primary-600 cursor-pointer font-medium text-sm">
                      <FileText size={16} />
                      {row.file}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        "inline-flex px-2.5 py-1 text-xs font-bold rounded-md",
                        row.status === "Pending"
                          ? "bg-amber-50 text-amber-600"
                          : row.status === "Verified"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <Calendar size={14} />
                      {row.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 text-surface-400">
                      <Link
                        href={`/verification/${row.id}`}
                        className="p-1.5 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        className="p-1.5 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
