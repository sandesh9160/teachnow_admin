"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  Briefcase,
  Users,
  UserCheck,
  Building2,
  CreditCard,
  Database,
  Star,
  Trash2,
  FileText,
  LogOut,
  ChevronLeft,
 
  GraduationCap,
  ChevronDown,
  Layout,
  Bell,
  Quote,
  ShieldCheck,
  Clock,
  Mail,
  Newspaper,
  Banknote
} from "lucide-react";
import { adminSignOut } from "@/lib/auth";
import { clsx } from "clsx";

import { SidebarItem } from "@/types";
import { useNotifications } from "@/hooks/useNotifications";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navGroups: { label: string; color: string; headerIcon: any; items: SidebarItem[] }[] = [
  {
    label: "Main",
    color: "text-slate-400",
    headerIcon: null,
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Document Verification", href: "/verification", icon: FileCheck },
    ]
  },
  {
    label: "Management",
    color: "text-slate-400",
    headerIcon: null,
    items: [
      { title: "Jobs", href: "/jobs", icon: Briefcase },
      { title: "Job Seekers", href: "/jobseekers", icon: Users },
      { title: "Recruiters", href: "/recruiters", icon: UserCheck },
      { title: "Employers (Institutes)", href: "/employers", icon: Building2 },
      { title: "Resumes", href: "/resumes", icon: FileText },
    ]
  },
  {
    label: "Platform",
    color: "text-slate-400",
    headerIcon: null,
    items: [
      { title: "Manage Plans", href: "/plans", icon: CreditCard },
      { title: "Payments", href: "/payments", icon: Banknote },
      { title: "Master Data", href: "/master-data", icon: Database },
      { title: "Reviews", href: "/reviews", icon: Star },
      { title: "Prompts", href: "/prompts", icon: FileText },
    ]
  },
  {
    label: "Deleted",
    color: "text-slate-400",
    headerIcon: null,
    items: [
      { 
        title: "Deleted Items", 
        href: "/deleted-items", 
        icon: Trash2,
        children: [
          { title: "Deleted Resumes", href: "/deleted-items/resumes" },
          { title: "Deleted Job Seekers", href: "/deleted-items/jobseekers" },
          { title: "Deleted Jobs", href: "/deleted-items/jobs" },
          { title: "Deleted Employers", href: "/deleted-items/employers" },
          // { title: "Deleted CV Templates", href: "/deleted-items/cv-templates" },
          { title: "Deleted Testimonials", href: "/deleted-items/testimonials" },
        ]
      },
    ]
  },
  {
    label: "CMS",
    color: "text-slate-400",
    headerIcon: null,
    items: [
      { 
        title: "CMS Sections", 
        href: "/cms", 
        icon: FileText,
        children: [
          { title: "Nav Bar Full", href: "/cms/navbar" },
          { title: "Hero Section", href: "/cms/hero" },
          { title: "Stats Section", href: "/cms/stats" },
          { title: "CTA Section", href: "/cms/cta" },
          { title: "Footer Columns", href: "/cms/footer-sections" },
          { title: "Footer Links", href: "/cms/footer-links" },
          { title: "Company Title & Logo", href: "/cms/branding" },
          { title: "Popular Searches", href: "/cms/popular-searches" },
          { title: "About Us", href: "/content/about" },
          { title: "Contact Us", href: "/content/contact" },
          { title: "FAQs", href: "/content/faqs" },
          { title: "Terms & Conditions", href: "/content/terms" },
          { title: "Privacy Policy", href: "/content/privacy" },
        ]
      },
    ]
  },
  {
    label: "Resources",
    color: "text-slate-400",
    headerIcon: null,
    items: [
      { title: "Teaching Resources", href: "/resources", icon: GraduationCap },
      { title: "Blogs", href: "/content/blogs", icon: Newspaper },
    ]
  },
  {
    label: "System & Templates",
    color: "text-slate-400",
    headerIcon: null,
    items: [
      { title: "Resume Templates", href: "/cv-templates", icon: Layout },
      { title: "Email Templates", href: "/email/templates", icon: Mail },
      { title: "Cron Jobs", href: "/cron-jobs", icon: Clock },
    ]
  },
];

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_sidebar_open");
    if (saved) {
      try {
        setOpenDropdowns(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("admin_sidebar_open", JSON.stringify(openDropdowns));
  }, [openDropdowns]);

  useEffect(() => {
    // Automatically open the dropdown containing the active route
    const currentActiveItem = navGroups
      .flatMap(g => g.items)
      .find((item: SidebarItem) => {
        const hasActiveChild = item.children?.some(child => pathname === child.href || pathname.startsWith(child.href + "/"));
        const parentMatch = item.href !== "#" && item.href !== "/" && (pathname === item.href || pathname.startsWith(item.href + "/"));
        return hasActiveChild || parentMatch;
      });

    if (currentActiveItem && (currentActiveItem.children?.length ?? 0) > 0) {
      setOpenDropdowns(prev => prev.includes(currentActiveItem.title) ? prev : [...prev, currentActiveItem.title]);
    }
  }, [pathname]);

  const toggleDropdown = (title: string, e: React.MouseEvent) => {
    setOpenDropdowns(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    try {
      await adminSignOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out",
          "bg-white border-r border-slate-100",
          collapsed ? "w-[78px]" : "w-[240px]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Logo */}
        <div className={clsx(
          "h-14 flex items-center border-b border-slate-100 shrink-0",
          collapsed ? "justify-center px-0" : "px-4 gap-2.5"
        )}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <GraduationCap size={16} className="text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[14px] font-extrabold text-slate-900 tracking-tight leading-none">TeachNow</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Admin Portal</p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <div className="lg:hidden px-3 pt-2 flex items-center justify-end">
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/5 transition-all"
          >
            <ChevronLeft size={18} className="rotate-180" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
          {/* Compact Toggle - Standardized across all dashboards */}
          <div className={clsx("mb-4 hidden lg:flex", collapsed ? "justify-center" : "justify-end")}>
            <button
              onClick={onToggle}
              suppressHydrationWarning
              className="p-1.5 rounded-lg text-slate-300 hover:text-primary hover:bg-primary/5 transition-all duration-300"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary">
                   <ChevronDown className="-rotate-90" size={16} />
                </div>
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>

          {navGroups.map((group, groupIndex) => {
            return (
            <div key={groupIndex} className="space-y-0.5 pb-2">
              {!collapsed && (
                <div className="px-3 flex items-center mb-1 pt-2">
                    <p className="text-[9.5px] font-bold text-slate-300 tracking-widest uppercase">
                        {group.label}
                    </p>
                </div>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href);
                const isOpen = openDropdowns.includes(item.title);
                const hasChildren = item.children && item.children.length > 0;
                const Icon = item.icon;

                return (
                  <div key={item.title}>
                        <div
                          className={clsx(
                            "flex items-center justify-between transition-all duration-200 group relative",
                            collapsed ? "justify-center px-0 py-2 rounded-xl mb-0.5" : "px-3 py-1.5 rounded-xl mb-0.5",
                            active && !hasChildren
                              ? "bg-blue-50/60 ring-1 ring-blue-100/50 text-blue-600 shadow-sm"
                              : "text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          {!hasChildren ? (
                            <Link href={item.href} className="flex items-center gap-3 w-full">
                               <div className="relative">
                                 <Icon size={18} className={clsx("transition-transform group-hover:scale-110", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={active ? 2 : 1.5} />
                               </div>
                               {!collapsed && (
                                 <div className="flex items-center justify-between flex-1">
                                   <span className={clsx("text-[13px] font-semibold tracking-tight", active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-900")}>{item.title}</span>
                                 </div>
                               )}
                            </Link>
                          ) : (
                            <button 
                                 type="button"
                                 suppressHydrationWarning
                                 onClick={(e) => toggleDropdown(item.title, e)}
                                 className="flex items-center justify-between w-full cursor-pointer bg-transparent border-none outline-none appearance-none"
                            >
                               <div className="flex items-center gap-3">
                                  <Icon size={18} className={clsx("transition-transform group-hover:scale-110", isOpen ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={isOpen ? 2 : 1.5} />
                                  {!collapsed && <span className={clsx("text-[13px] font-semibold tracking-tight", isOpen ? "text-blue-600" : "text-slate-500 group-hover:text-slate-900")}>{item.title}</span>}
                               </div>
                               {!collapsed && <ChevronDown size={14} className={clsx("text-slate-300 transition-transform duration-300 group-hover:text-slate-600", isOpen && "rotate-180")} />}
                            </button>
                          )}

                      {collapsed && (
                         <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-[10px] font-semibold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] tracking-wider">
                           {item.title}
                         </div>
                      )}
                    </div>

                    {!collapsed && hasChildren && isOpen && (
                        <div className="mt-0.5 relative ml-6 pl-4 border-l-[1.5px] border-slate-100">
                           <div className="space-y-0.5 pt-0.5 pb-0.5">
                               {item.children?.map((child) => {
                                   const childActive = isActive(child.href);
                                   return (
                                       <Link 
                                        key={child.href} 
                                        href={child.href}
                                        className={clsx(
                                            "flex items-center py-1 text-[12px] transition-all",
                                            childActive ? "text-blue-600 font-semibold" : "text-slate-400 hover:text-blue-600 font-medium"
                                        )}
                                       >
                                          {childActive && <div className="w-1 h-1 rounded-full bg-blue-600 mr-2" />}
                                          {child.title}
                                       </Link>
                                   );
                               })}
                           </div>
                        </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            suppressHydrationWarning
            className={clsx(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 group active:scale-95",
              "text-slate-400 hover:text-rose-500 hover:bg-rose-50/60 text-[12.5px] font-semibold",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut size={16} className="text-slate-300 group-hover:text-rose-500 transition-colors shrink-0" />
            {!collapsed && <span className="tracking-tight">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
