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
  GraduationCap,
  ChevronDown,
  Layout,
  Bell
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

const navGroups: { label: string; items: SidebarItem[] }[] = [
  {
    label: "MAIN",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Verification", href: "/verification", icon: FileCheck },
      { title: "Notifications", href: "/notifications", icon: Bell, badge: "unread" },
    ]
  },
  {
    label: "MANAGEMENT",
    items: [
      { title: "Jobs", href: "/jobs", icon: Briefcase },
      { title: "Job Seekers", href: "/jobseekers", icon: Users },
      { title: "Recruiters", href: "/recruiters", icon: UserCheck },
      { title: "Employers", href: "/employers", icon: Building2 },
    ]
  },
  {
    label: "PLATFORM",
    items: [
      { title: "Manage Plans", href: "/plans", icon: CreditCard },
      { title: "Master Data", href: "/master-data", icon: Database },
      { title: "Reviews", href: "/reviews", icon: Star },
    ]
  },
  {
    label: "CONTENT",
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
          { title: "Testimonials", href: "/content/testimonials" },
          { title: "Email Templates", href: "/email/templates" },
        ]
      },
    ]
  },
  {
    label: "ARCHIVE",
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
    items: [
      { 
        title: "CMS Sections", 
        href: "/cms", 
        icon: FileText,
        children: [
          { title: "Nav Bar Full", href: "/cms/navbar" },
          { title: "Hero Section", href: "/cms/hero" },
          { title: "Stats Section", href: "/cms/stats" },
          { title: "Testimonials", href: "/cms/testimonials" },
          { title: "CTA Section", href: "/cms/cta" },
          { title: "Footer Section", href: "/cms/footer" },
          { title: "Footer Links", href: "/cms/footer-links" },
          { title: "Company Title & Logo", href: "/cms/branding" },
          { title: "FAQs", href: "/cms/faqs" },
        ]
      },
      { title: "SEO Settings", href: "/seo", icon: Search },
    ]
  },
  {
    label: "Communications & System",
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
          "fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out",
          "bg-[#F8FAFC] border-r border-[#E2E8F0]",
          collapsed ? "w-[72px]" : "w-[260px]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                <GraduationCap size={18} />
              </div>
              <span className="text-[#1E293B] font-bold text-lg tracking-tight">
                TeachNow
              </span>
            </Link>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
              <GraduationCap size={18} />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="text-[#94A3B8] hover:text-[#475569] transition-colors p-1"
            >
              <ChevronLeft size={18} className={clsx("transition-transform", collapsed && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-7 no-scrollbar">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold tracking-widest text-[#94A3B8] mb-3 uppercase">
                  {group.label}
                </p>
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
                        collapsed ? "justify-center px-0 py-2.5 rounded-lg mb-1" : "px-3 py-2.5 rounded-lg mb-0.5",
                        active && !hasChildren
                          ? "bg-white text-[#2563EB] shadow-sm border border-[#E2E8F0]"
                          : "text-[#64748B] hover:text-[#1E293B] hover:bg-white/50"
                      )}
                    >
                      {!hasChildren ? (
                        <Link href={item.href} className="flex items-center gap-3.5 w-full">
                           <Icon size={18} className={clsx(active ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-[#64748B]")} />
                           {!collapsed && (
                             <div className="flex items-center justify-between flex-1">
                               <span className={clsx("text-[14px] font-medium", active ? "text-[#2563EB]" : "text-[#475569] group-hover:text-[#1E293B]")}>{item.title}</span>
                               {item.badge === "unread" && unreadCount > 0 && (
                                   <span className="bg-[#E11D48] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                       {unreadCount > 9 ? "9+" : unreadCount}
                                   </span>
                               )}
                             </div>
                           )}
                        </Link>
                      ) : (
                        <button 
                            type="button"
                            onClick={(e) => toggleDropdown(item.title, e)}
                            className="flex items-center justify-between w-full cursor-pointer bg-transparent border-none outline-none appearance-none"
                        >
                           <div className="flex items-center gap-3.5">
                              <Icon size={18} className={clsx(active ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-[#64748B]")} />
                              {!collapsed && <span className="text-[14px] font-medium text-[#475569] group-hover:text-[#1E293B]">{item.title}</span>}
                           </div>
                           {!collapsed && <ChevronDown size={14} className={clsx("text-[#94A3B8] transition-transform duration-300", isOpen && "rotate-180")} />}
                        </button>
                      )}

                      {collapsed && (
                         <div className="absolute left-full ml-3 px-3 py-2 bg-[#1E293B] text-white text-[11px] font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] uppercase tracking-wider">
                           {item.title}
                         </div>
                      )}
                    </div>

                    {/* Dropdown Children */}
                    {!collapsed && hasChildren && isOpen && (
                        <div className="mt-1 relative">
                           <div className="absolute left-[23px] top-0 bottom-2 w-[1.5px] bg-[#E2E8F0]" />
                           <div className="ml-[24px] space-y-1 pt-1 pb-1">
                               {item.children?.map((child) => {
                                   const childActive = isActive(child.href);
                                   return (
                                       <Link 
                                        key={child.href} 
                                        href={child.href}
                                        className={clsx(
                                            "flex items-center py-2 px-6 text-[14px] transition-all",
                                            childActive ? "text-[#1E293B] font-semibold" : "text-[#64748B] hover:text-[#1E293B] font-medium"
                                        )}
                                       >
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
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0]">
          <button
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center gap-3.5 rounded-lg px-4 py-2.5 transition-all duration-200",
              "text-[#64748B] hover:text-[#E11D48] hover:bg-red-50 font-medium text-[13px]",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut size={18} className="text-[#94A3B8]" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
