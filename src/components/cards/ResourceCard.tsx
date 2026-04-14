"use client";

import React from "react";
import { clsx } from "clsx";
import { Pencil, Trash2, Eye, Layout, FileText, Clock, User, BookOpen } from "lucide-react";
import type { TeachingResource } from "@/types";

interface ResourceCardProps {
    resource: TeachingResource;
    onEdit?: (resource: TeachingResource) => void;
    onDelete?: (resource: TeachingResource) => void;
    onToggleStatus?: (resource: TeachingResource) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";

export default function ResourceCard({
    resource,
    onEdit,
    onDelete,
    onToggleStatus
}: ResourceCardProps) {
    const imageUrl = resource.resource_photo
        ? `${BACKEND_URL}/${resource.resource_photo.startsWith('/') ? resource.resource_photo.slice(1) : resource.resource_photo}`
        : null;

    const pdfUrl = resource.pdf
        ? `${BACKEND_URL}/${resource.pdf.startsWith('/') ? resource.pdf.slice(1) : resource.pdf}`
        : null;

    return (
        <div className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-md hover:border-indigo-100 flex flex-col h-full shrink-0">
            {/* ─── Image & PDF Section ─────────────────────────────────── */}
            <div className="flex h-32 border-b border-slate-100 bg-slate-50 relative">
                <div className="w-1/3 h-full overflow-hidden border-r border-slate-100 relative">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={resource.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100">
                            <Layout size={24} strokeWidth={1.5} />
                        </div>
                    )}
                    {/* Always visible PDF Link overlay attached to image */}
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-x-0 bottom-0 bg-slate-900/70 text-white text-[10px] font-semibold py-1.5 flex items-center justify-center gap-1 backdrop-blur-md hover:bg-slate-900 transition-colors"
                        >
                            <Eye size={12} /> View PDF
                        </a>
                    )}
                </div>

                {/* ─── Information Section ─────────────────────────────────── */}
                <div className="w-2/3 p-3 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[13px] font-bold text-slate-900 leading-tight line-clamp-2" title={resource.title}>
                            {resource.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-medium text-slate-500">
                            <User size={12} className="text-indigo-400" />
                            <span className="truncate">{resource.author_name}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mt-2 bg-slate-100/50 rounded-md p-1.5">
                        <div className="flex items-center gap-1" title="Pages"><FileText size={12} className="text-slate-400" /> {resource.total_pages}</div>
                        <div className="flex items-center gap-1" title="Read Time"><Clock size={12} className="text-slate-400" /> {resource.read_time}m</div>
                        <div className="flex items-center gap-1" title="Answers Included?"><BookOpen size={12} className={resource.answer_include === "included" ? "text-emerald-500" : "text-rose-400"} /> {resource.answer_include === "included" ? "Yes" : "No"}</div>
                    </div>
                </div>
            </div>

            {/* ─── Always Visible Action Bar ─────────────────────────────────── */}
            <div className="p-2.5 flex items-center justify-between bg-white text-[11px] font-semibold">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit?.(resource)}
                        className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-md transition-colors border border-slate-100 font-bold"
                    >
                        <Pencil size={12} /> Edit
                    </button>
                    <button
                        onClick={() => onDelete?.(resource)}
                        className="flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-md transition-colors"
                        title="Delete Resource"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>

                <button
                    onClick={() => onToggleStatus?.(resource)}
                    className={clsx(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors border",
                        resource.is_visible
                            ? "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                    )}
                >
                    <div className={clsx("w-1.5 h-1.5 rounded-full", resource.is_visible ? "bg-emerald-500" : "bg-rose-500")} />
                    {resource.is_visible ? "Unpublish" : "Publish"}
                </button>
            </div>
        </div>
    );
}
