"use client";

import React, { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import {
  Navigation,
  Sparkles,
  BarChart3,
  MessageSquare,
  Megaphone,
  Layout,
  Link as LinkIcon,
  Type,
  HelpCircle,
  Eye,
  EyeOff,
  Pencil,
  Settings,
  ArrowUpRight
} from "lucide-react";

const sections = [
  { id: 1, name: "Nav Bar Full", slug: "navbar", icon: Navigation, description: "Main navigation bar with logo, menu items, and CTA buttons", is_active: true, last_updated: "2024-04-10" },
  { id: 2, name: "Hero Section", slug: "hero", icon: Sparkles, description: "Main landing banner with headline, search, and background visuals", is_active: true, last_updated: "2024-04-08" },
  { id: 3, name: "Stats Section", slug: "stats", icon: BarChart3, description: "Platform statistics counter section showing key metrics", is_active: true, last_updated: "2024-04-05" },
  { id: 4, name: "Testimonials", slug: "testimonials", icon: MessageSquare, description: "Customer testimonials and reviews carousel", is_active: true, last_updated: "2024-04-02" },
  { id: 5, name: "CTA Section", slug: "cta", icon: Megaphone, description: "Call-to-action section for user sign-ups and conversions", is_active: true, last_updated: "2024-03-28" },
  { id: 6, name: "Footer Section", slug: "footer", icon: Layout, description: "Site footer container with primary branding and layout", is_active: true, last_updated: "2024-03-25" },
  { id: 7, name: "Footer Links", slug: "footer-links", icon: LinkIcon, description: "Manage columns and links within the site footer", is_active: true, last_updated: "2024-03-20" },
  { id: 8, name: "Company Title & Logo", slug: "branding", icon: Type, description: "Global company branding, logo assets, and site titles", is_active: true, last_updated: "2024-03-15" },
  { id: 9, name: "FAQs", slug: "faqs", icon: HelpCircle, description: "Frequently asked questions and support content", is_active: true, last_updated: "2024-03-10" },
];

export default function CMSSectionsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = sections.filter((s) => {
    if (filter === "active") return s.is_active;
    if (filter === "inactive") return !s.is_active;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">CMS Sections</h1>
          <p className="text-[13px] text-surface-400 font-medium">
            Manage website sections and content blocks
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-surface-100 rounded-lg">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider",
                filter === f
                  ? "bg-white text-surface-900 shadow-sm"
                  : "text-surface-400 hover:text-surface-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-surface-100 p-5 hover:shadow-sm hover:border-primary-100 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors border",
                      section.is_active
                        ? "bg-primary-50 text-primary-600 border-primary-100"
                        : "bg-surface-50 text-surface-400 border-surface-100"
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-surface-900">
                      {section.name}
                    </h3>
                    <Badge variant={section.is_active ? "success" : "default"} dot className="text-[9px] uppercase font-bold">
                      {section.is_active ? "Live" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-surface-400 font-medium leading-relaxed mb-4 line-clamp-2 italic">
                {section.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-surface-50">
                <span className="text-[10px] text-surface-300 font-bold uppercase">
                  {section.last_updated}
                </span>
                <div className="flex items-center gap-1">
                  <Link 
                    href={`/cms/${section.slug}`}
                    className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-50 hover:text-surface-600 transition-colors cursor-pointer"
                  >
                    <Eye size={14} />
                  </Link>
                  <Link 
                    href={`/cms/${section.slug}`}
                    className="p-1.5 rounded-lg text-surface-400 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                  </Link>
                  <Link 
                    href={`/cms/${section.slug}`}
                    className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors cursor-pointer"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
