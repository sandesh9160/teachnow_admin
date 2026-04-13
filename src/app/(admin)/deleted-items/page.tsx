"use client";

import React from "react";
import Link from "next/link";
import { Trash2, FileText, Users, Briefcase, Building2, Layout, MessageSquare, ShieldCheck, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

const categories = [
  { key: "resumes", label: "Resumes", count: 2, icon: FileText, color: "blue", desc: "Soft-deleted candidate resumes" },
  { key: "jobseekers", label: "Job Seekers", count: 1, icon: Users, color: "emerald", desc: "Disabled job seeker accounts" },
  { key: "jobs", label: "Jobs", count: 1, icon: Briefcase, color: "amber", desc: "Archived or deleted job postings" },
  { key: "employers", label: "Employers", count: 1, icon: Building2, color: "indigo", desc: "Suspended institute profiles" },
  { key: "cv-templates", label: "CV Templates", count: 1, icon: Layout, color: "purple", desc: "Removed resume templates" },
  { key: "testimonials", label: "Testimonials", count: 1, icon: MessageSquare, color: "pink", desc: "Rejected or deleted reviews" },
  { key: "users", label: "System Users", count: 1, icon: ShieldCheck, color: "cyan", desc: "Deleted administrative accounts" },
];

export default function DeletedItemsLanding() {
  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Trash Bin</h1>
          <p className="text-[13px] text-surface-400 font-medium mt-0.5">Manage and restore deleted system entities</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[12px] font-bold">
            <Trash2 size={14} /> 8 Total Items
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const colors: any = {
            blue: "bg-blue-50 text-blue-600 border-blue-100",
            emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
            amber: "bg-amber-50 text-amber-600 border-amber-100",
            indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
            purple: "bg-purple-50 text-purple-600 border-purple-100",
            pink: "bg-pink-50 text-pink-600 border-pink-100",
            cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
          };
          
          return (
            <Link 
              key={cat.key}
              href={`/deleted-items/${cat.key}`}
              className="bg-white p-5 rounded-xl border border-surface-100 shadow-sm transition-all hover:shadow-md hover:border-surface-200 group flex items-start gap-4"
            >
              <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center border", colors[cat.color])}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[15px] font-bold text-surface-900">{cat.label}</h3>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 bg-surface-50 border border-surface-100 rounded text-surface-500">{cat.count}</span>
                </div>
                <p className="text-[12px] text-surface-500 font-medium line-clamp-1">{cat.desc}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-surface-50 flex items-center justify-center text-surface-400 group-hover:text-primary-600 transition-colors">
                <ChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
