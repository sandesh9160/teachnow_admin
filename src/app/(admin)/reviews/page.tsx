"use client";

import React, { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import ActionButtons from "@/components/ui/ActionButtons";
import { Star, Search, Filter } from "lucide-react";

const mockReviews = [
  { id: 1, user_name: "Priya Sharma", rating: 5, comment: "Excellent platform! Found my dream teaching job within a week.", status: "approved", created_at: "2024-04-10" },
  { id: 2, user_name: "Rajesh Kumar", rating: 4, comment: "Good experience overall, the UI is very intuitive.", status: "approved", created_at: "2024-04-08" },
  { id: 3, user_name: "Anonymous User", rating: 2, comment: "Not enough jobs in my city, needs more coverage.", status: "pending", created_at: "2024-04-06" },
  { id: 4, user_name: "Delhi Public School", rating: 5, comment: "We've hired 15+ teachers through TeachNow. Highly recommend!", status: "approved", created_at: "2024-04-04" },
  { id: 5, user_name: "Test User", rating: 1, comment: "Spam review content here...", status: "rejected", created_at: "2024-04-02" },
];

const statusVariant: Record<string, "success" | "warning" | "danger"> = { approved: "success", pending: "warning", rejected: "danger" };

export default function ReviewsPage() {
  const [search, setSearch] = useState("");
  const filtered = search ? mockReviews.filter((r) => r.user_name.toLowerCase().includes(search.toLowerCase())) : mockReviews;

  const columns = [
    { key: "user_name", title: "User", render: (_: unknown, row: Record<string, unknown>) => <span className="font-semibold text-surface-900">{row.user_name as string}</span> },
    {
      key: "rating", title: "Rating",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < (row.rating as number) ? "text-warning-400 fill-warning-400" : "text-surface-200"} />
          ))}
        </div>
      ),
    },
    { key: "comment", title: "Comment", render: (_: unknown, row: Record<string, unknown>) => <p className="text-sm text-surface-600 max-w-xs truncate">{row.comment as string}</p> },
    { key: "status", title: "Status", render: (_: unknown, row: Record<string, unknown>) => <Badge variant={statusVariant[row.status as string]} dot>{(row.status as string).charAt(0).toUpperCase() + (row.status as string).slice(1)}</Badge> },
    { key: "created_at", title: "Date" },
    { key: "actions", title: "", render: (_: unknown, row: Record<string, unknown>) => <ActionButtons onEdit={() => console.log("Edit", row.id)} onDelete={() => console.log("Delete", row.id)} compact /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-50"><Star size={22} className="text-yellow-600" /></div>
          <div><h1 className="text-2xl font-bold text-surface-900">Reviews</h1><p className="text-sm text-surface-500">Manage user reviews and ratings</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 text-surface-600 text-sm font-medium hover:bg-surface-200 transition-colors"><Filter size={16} /> Filter</button>
      </div>
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input type="text" placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-surface-200 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
