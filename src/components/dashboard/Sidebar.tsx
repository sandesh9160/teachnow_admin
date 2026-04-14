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
  Search,
  Settings,
  Mail,
  Timer,
  BookOpen,
  LogOut,
  ChevronLeft,
  X,
  History,
  Layers,
  GraduationCap,
  ChevronDown,
  Layout,
  Bell,
  Quote,
  ShieldCheck
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
    label: "MAIN",
    color: "text-blue-500",
    headerIcon: LayoutDashboard,
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Verification", href: "/verification", icon: FileCheck },
      { title: "Notifications", href: "/notifications", icon: Bell, badge: "unread" },
    ]
  },
  {
    label: "MANAGEMENT",
    color: "text-indigo-500",
    headerIcon: ShieldCheck,
    items: [
      { title: "Jobs", href: "/jobs", icon: Briefcase },
      { title: "Job Seekers", href: "/jobseekers", icon: Users },
      { title: "Recruiters", href: "/recruiters", icon: UserCheck },
      { title: "Employers", href: "/employers", icon: Building2 },
    ]
  },
  {
    label: "PLATFORM",
    color: "text-purple-500",
    headerIcon: Layers,
    items: [
      { title: "Plans", href: "/plans", icon: CreditCard },
      { title: "Master Data", href: "/master-data", icon: Database },
      { title: "Testimonials", href: "/testimonials", icon: Quote },
    ]
  },
  {
    label: "CONTENT",
    color: "text-emerald-500",
    headerIcon: FileText,
    items: [
      { 
        title: "Content Pages", 
        href: "/content", 
        icon: Layout,
        children: [
          { title: "About Us", href: "/content/about" },
          { title: "Contact Us", href: "/content/contact" },
          { title: "FAQs", href: "/content/faqs" },
          { title: "Privacy Policy", href: "/content/privacy" },
          { title: "Terms & Conditions", href: "/content/terms" },
          { title: "Teaching Resources", href: "/resources" },
          { title: "Blogs", href: "/content/blogs" },
          { title: "Email Templates", href: "/email/templates" },
        ]
      },
    ]
  },
  {
    label: "ARCHIVE",
    color: "text-rose-500",
    headerIcon: History,
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
          { title: "Deleted CV Templates", href: "/deleted-items/cv-templates" },
          { title: "Deleted Testimonials", href: "/deleted-items/testimonials" },
          { title: "Deleted Users", href: "/deleted-items/users" },
        ]
      },
    ]
  },
  {
    label: "CMS & SEO",
    color: "text-cyan-500",
    headerIcon: Layout,
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
        ]
      },
      { title: "SEO Settings", href: "/seo", icon: Search },
    ]
  },
  {
    label: "Communications & System",
    color: "text-amber-500",
    headerIcon: Mail,
    items: [
      { title: "Email Management", href: "/email", icon: Mail, children: [
        { title: "Templates", href: "/email/templates" },
        { title: "Configurations", href: "/email/config" },
      ]},
      { title: "Cron Jobs", href: "/cron-jobs", icon: Timer },
      { title: "System Settings", href: "/settings", icon: Settings },
    ]
  },
  {
    label: "Resources & Assets",
    color: "text-teal-500",
    headerIcon: BookOpen,
    items: [
      { title: "CV Templates", href: "/cv-templates", icon: FileText },
      { title: "Teaching Resources", href: "/resources", icon: BookOpen },
    ]
  }
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
          "fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm",
          "bg-white border-r border-surface-200",
          collapsed ? "w-[70px]" : "w-[240px]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-surface-100">
          {!collapsed ? (
            <div className="flex items-center justify-between w-full">
                <Link href="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <GraduationCap size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-surface-900 font-extrabold text-xl tracking-tight">
                        TeachNow
                    </span>
                </Link>
                <button 
                    onClick={onToggle}
                    className="p-2 rounded-lg text-surface-400 hover:bg-surface-50 hover:text-primary transition-all active:scale-95 hidden lg:flex"
                >
                    <ChevronLeft size={18} />
                </button>
            </div>
          ) : (
            <button 
                onClick={onToggle}
                className="mx-auto w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
            >
              <GraduationCap size={22} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 no-scrollbar">
          {navGroups.map((group, groupIndex) => {
            const GroupIcon = group.headerIcon;
            return (
            <div key={groupIndex} className="space-y-1 pb-4">
              {!collapsed && (
                <div className="px-4 flex items-center gap-2 mb-3">
                    {GroupIcon && <GroupIcon size={12} className={clsx("opacity-40", group.color)} />}
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.15em]">
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
                            collapsed ? "justify-center px-0 py-3 rounded-xl mb-1" : "px-3 py-2 rounded-xl mb-0.5",
                            active && !hasChildren
                              ? "bg-primary/[0.06] ring-1 ring-primary/10"
                              : "text-surface-500 hover:bg-surface-50"
                          )}
                        >
                          {!hasChildren ? (
                            <Link href={item.href} className="flex items-center gap-3.5 w-full">
                               <Icon size={19} className={clsx("transition-transform group-hover:scale-110", active ? "text-primary" : clsx(group.color, "opacity-60 group-hover:opacity-100"))} strokeWidth={active ? 2.5 : 2} />
                               {!collapsed && (
                                 <div className="flex items-center justify-between flex-1">
                                   <span className={clsx("text-[13px] font-semibold tracking-tight", active ? "text-primary" : "text-surface-600 group-hover:text-surface-900")}>{item.title}</span>
                                   {item.badge === "unread" && unreadCount > 0 && (
                                       <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                                           {unreadCount > 9 ? "9+" : unreadCount}
                                       </span>
                                   )}
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
                               <div className="flex items-center gap-3.5">
                                  <Icon size={19} className={clsx("transition-transform group-hover:scale-110", active ? "text-primary" : clsx(group.color, "opacity-60 group-hover:opacity-100"))} strokeWidth={active ? 2.5 : 2} />
                                  {!collapsed && <span className="text-[13px] font-semibold text-surface-600 group-hover:text-surface-900 tracking-tight">{item.title}</span>}
                               </div>
                               {!collapsed && <ChevronDown size={14} className={clsx("text-surface-300 transition-transform duration-300 group-hover:text-surface-600", isOpen && "rotate-180")} />}
                            </button>
                          )}

                      {collapsed && (
                         <div className="absolute left-full ml-3 px-3 py-2 bg-surface-900 text-white text-[11px] font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] tracking-wider">
                           {item.title}
                         </div>
                      )}
                    </div>

                    {!collapsed && hasChildren && isOpen && (
                        <div className="mt-1 relative ml-6 pl-4 border-l-2 border-surface-100">
                           <div className="space-y-1 pt-1 pb-1">
                               {item.children?.map((child) => {
                                   const childActive = isActive(child.href);
                                   return (
                                       <Link 
                                        key={child.href} 
                                        href={child.href}
                                        className={clsx(
                                            "flex items-center py-2 text-[13px] transition-all",
                                            childActive ? "text-primary font-bold" : "text-surface-500 hover:text-primary font-medium"
                                        )}
                                       >
                                          {childActive && <div className="w-1 h-1 rounded-full bg-primary mr-2" />}
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
          );})}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-100">
          <button
            onClick={handleLogout}
            suppressHydrationWarning
            className={clsx(
              "w-full flex items-center gap-3.5 rounded-xl px-4 py-3 transition-all duration-200 group active:scale-95",
              "text-surface-500 hover:text-danger hover:bg-danger/5 font-bold text-[13px]",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut size={20} className="text-surface-400 group-hover:text-danger transition-colors" />
            {!collapsed && <span className="tracking-tight">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
