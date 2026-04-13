"use client";

import React, { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { Search as SearchIcon, Save, Globe } from "lucide-react";

const mockSEO = [
  { id: 1, page: "Homepage", title: "TeachNow - #1 Teaching Job Portal in India", description: "Find the best teaching jobs across India. TeachNow connects teachers with schools.", keywords: "teaching jobs, teacher recruitment, school jobs", og_image: "/og-home.jpg" },
  { id: 2, page: "Jobs Listing", title: "Browse Teaching Jobs | TeachNow", description: "Explore thousands of teaching positions from top schools and institutions.", keywords: "teaching positions, school vacancies", og_image: "/og-jobs.jpg" },
  { id: 3, page: "About Us", title: "About TeachNow | Our Mission", description: "Learn about TeachNow's mission to connect educators with the right opportunities.", keywords: "about teachnow, education platform", og_image: "/og-about.jpg" },
  { id: 4, page: "Contact", title: "Contact Us | TeachNow", description: "Get in touch with the TeachNow team for support or partnerships.", keywords: "contact, support, partnerships", og_image: "/og-contact.jpg" },
  { id: 5, page: "Blog", title: "Teaching Blog & Resources | TeachNow", description: "Read our latest articles on education, career tips, and teaching best practices.", keywords: "education blog, teaching tips", og_image: "/og-blog.jpg" },
];

export default function SEOSettingsPage() {
  const [editing, setEditing] = useState<number | null>(null);

  const columns = [
    {
      key: "page", title: "Page",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-primary-500" />
          <span className="font-semibold text-surface-900">{row.page as string}</span>
        </div>
      ),
    },
    {
      key: "title", title: "Meta Title",
      render: (_: unknown, row: Record<string, unknown>) => (
        <p className="text-sm text-surface-700 max-w-xs truncate">{row.title as string}</p>
      ),
    },
    {
      key: "description", title: "Meta Description",
      render: (_: unknown, row: Record<string, unknown>) => (
        <p className="text-sm text-surface-500 max-w-xs truncate">{row.description as string}</p>
      ),
    },
    {
      key: "keywords", title: "Keywords",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.keywords as string).split(", ").slice(0, 2).map((kw) => (
            <Badge key={kw} variant="info">{kw}</Badge>
          ))}
          {(row.keywords as string).split(", ").length > 2 && (
            <Badge variant="default">+{(row.keywords as string).split(", ").length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions", title: "",
      render: (_: unknown, row: Record<string, unknown>) => (
        <button
          onClick={() => setEditing(editing === (row.id as number) ? null : (row.id as number))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
        >
          <Save size={13} />
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-50"><SearchIcon size={22} className="text-primary-600" /></div>
          <div><h1 className="text-2xl font-bold text-surface-900">SEO Settings</h1><p className="text-sm text-surface-500">Manage page meta tags and SEO configuration</p></div>
        </div>
      </div>
      <DataTable columns={columns} data={mockSEO} />
    </div>
  );
}
