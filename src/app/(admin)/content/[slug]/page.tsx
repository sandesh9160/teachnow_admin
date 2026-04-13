"use client";

import React, { useState, useEffect } from "react";
import { 
  Save, 
  Eye, 
  Search, 
  Globe, 
  FileText, 
  Image as ImageIcon,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  Type,
  Link as LinkIcon,
  Sparkles,
  Star,
  Upload,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Minus,
  Pencil,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/tables/DataTable";
import { TipTapEditor } from "@/components/ui/TipTapEditor";

const contentMap: Record<string, string> = {
  about: "About Us",
  contact: "Contact Us",
  faqs: "FAQs",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  "teaching-resources": "Teaching Resources",
  blogs: "Blogs",
  testimonials: "Testimonials"
};

// ─── Mock Data ─────────────────────────────────────────────────────────────
const mockReviews = [
  { id: 1, name: "Rahul Sharma", email: "rahul.sharma@email.com", type: "Job Seeker", rating: 5, comment: "Excellent job platform! Found my dream teaching job within weeks.", status: "Approved", featured: true },
  { id: 2, name: "Ananya Reddy", email: "ananya.reddy@brightfuture.edu", type: "Employer", rating: 4, comment: "Good candidate pool available. Found quality teachers quickly.", status: "Approved", featured: false },
  { id: 3, name: "Priya Patel", email: "priya.p@email.com", type: "Job Seeker", rating: 5, comment: "Easy to find teaching jobs. Intuitive and smooth interface.", status: "Pending", featured: false },
  { id: 4, name: "Arjun Kumar", email: "arjun.k@email.com", type: "Job Seeker", rating: 3, comment: "Decent platform but needs more listings in smaller cities.", status: "Pending", featured: false },
  { id: 5, name: "Deepak Joshi", email: "deepak.j@khub.com", type: "Recruiter", rating: 5, comment: "Incredibly useful for recruiters. Detailed candidate profiles are a plus.", status: "Approved", featured: true },
];

export default function ContentEditPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const [mounted, setMounted] = useState(false);
  const [slug, setSlug] = useState<string>("");
  const [editItem, setEditItem] = useState<any>(null); // For editing a specific review/resource
  const [showEditor, setShowEditor] = useState(false); // For toggling the section editor

  useEffect(() => {
    setMounted(true);
    paramsPromise.then(p => {
      setSlug(p.slug);
      // Logic for URL hash #edit
      if (window.location.hash === "#edit") {
        setShowEditor(true);
      }
    });

    const handleHashChange = () => {
      setShowEditor(window.location.hash === "#edit");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [paramsPromise]);

  if (!mounted || !slug) return <div className="p-20 text-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  const pageTitle = contentMap[slug] || "Content Page";

  // ─── Shared Header ────────────────────────────────────────────────────────
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-2 text-[12px] font-bold text-surface-400 uppercase tracking-wider mb-6">
      <Link href="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
      <ChevronRight size={12} />
      <span className="text-surface-400">Content Pages</span>
      <ChevronRight size={12} />
      <span className="text-primary-600">{pageTitle}</span>
    </div>
  );

  // ─── Testimonials View ──────────────────────────────────────────────────
  if (slug === "testimonials") {
    if (editItem) {
        return (
            <div className="space-y-6 pb-20 antialiased animate-in slide-in-from-right-2 duration-300">
                {renderBreadcrumb()}
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => setEditItem(null)} className="flex items-center gap-2 text-surface-400 hover:text-primary-600 font-bold text-xs uppercase transition-colors mb-2 cursor-pointer">
                            <ArrowLeft size={14} /> Back to List
                        </button>
                        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Edit Testimony</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg text-[12px] font-bold hover:bg-primary-700 shadow-sm transition-all cursor-pointer">Save Review</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-surface-100 p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-surface-400 uppercase">Comment / Experience</label>
                                <TipTapEditor 
                                    value={editItem.comment}
                                    onChange={(v) => {}}
                                    placeholder="Edit testimony..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-surface-400 uppercase">Status</label>
                                    <select className="w-full p-2.5 bg-surface-50 border border-surface-100 rounded-lg text-xs font-bold outline-none">
                                        <option selected={editItem.status === "Approved"}>Approved</option>
                                        <option selected={editItem.status === "Pending"}>Pending</option>
                                        <option selected={editItem.status === "Rejected"}>Rejected</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-surface-400 uppercase">Rating</label>
                                    <div className="flex items-center gap-2 p-2 bg-surface-50 border border-surface-100 rounded-lg">
                                        {[1,2,3,4,5].map(s => <Star key={s} size={18} fill={s <= editItem.rating ? "#f59e0b" : "none"} stroke={s <= editItem.rating ? "#f59e0b" : "#cbd5e1"} className="cursor-pointer" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showEditor) {
        return <DefaultEditor slug={slug} title={pageTitle} onClose={() => { setShowEditor(false); window.location.hash = ""; }} />;
    }

    return (
      <div className="space-y-6 pb-20 antialiased animate-in fade-in duration-500">
         {renderBreadcrumb()}
         <div className="flex items-center justify-between">
            <Header title="Manage Testimonials" subtitle="Curation and approval of platform reviews" />
            <div className="flex items-center gap-3">
                <button onClick={() => { setShowEditor(true); window.location.hash = "edit"; }} className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-600 rounded-lg text-[12px] font-bold hover:bg-surface-50 transition-all shadow-xs cursor-pointer">
                    <Pencil size={16} /> Edit Section Content
                </button>
            </div>
         </div>
         
         {/* Summary Stats */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard label="Total" value="8" />
            <SummaryCard label="Avg Rating" value="4.1" icon="★" color="text-amber-500" />
            <SummaryCard label="Approved" value="5" color="text-emerald-500" />
            <SummaryCard label="Pending" value="3" color="text-amber-500" />
            <SummaryCard label="Featured" value="2" color="text-blue-500" />
         </div>

         <div className="bg-white rounded-xl border border-surface-100 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-surface-50 flex flex-wrap gap-3 items-center bg-surface-50/20">
               <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input type="text" placeholder="Search reviews..." className="w-full pl-9 pr-4 py-1.5 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none" />
               </div>
               <select className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-xs font-semibold text-surface-600 outline-none"><option>Status</option></select>
               <select className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-xs font-semibold text-surface-600 outline-none"><option>User Type</option></select>
               <select className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-xs font-semibold text-surface-600 outline-none"><option>Rating</option></select>
               <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-surface-400 hover:text-surface-700 transition-colors cursor-pointer"><Filter size={14} /> Filters</button>
            </div>
            <DataTable 
               compact
               columns={[
                  { key: "name", title: "REVIEWER", render: (_: any, r: any) => (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100 uppercase">{r.name.split(' ').map((n:any)=>n[0]).join('')}</div>
                        <div><p className="font-bold text-surface-900 text-[12px]">{r.name}</p><p className="text-[10px] text-surface-400 font-medium">{r.email}</p></div>
                    </div>
                  )},
                  { key: "type", title: "USER TYPE", render: (v: string) => <Badge variant={v === "Employer" ? "info" : "default"} className="text-[9px] uppercase font-bold">{v}</Badge> },
                  { key: "rating", title: "RATING", render: (v: number) => <div className="flex gap-0.5 mt-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={11} fill={i < v ? "#f59e0b" : "none"} stroke={i < v ? "#f59e0b" : "#cbd5e1"} />)}</div> },
                  { key: "comment", title: "COMMENT", render: (v: string) => <p className="text-[11px] text-surface-500 font-medium max-w-xs truncate">{v}</p> },
                  { key: "status", title: "STATUS", render: (v: string) => <Badge variant={v === "Approved" ? "success" : "warning"} className="text-[9px] uppercase font-bold">{v}</Badge> },
                  { key: "featured", title: "FEATURED", render: (v: boolean) => v ? <Star size={14} fill="#f59e0b" stroke="#f59e0b" className="mx-auto" /> : <Minus size={14} className="text-surface-200 mx-auto" /> },
                  { key: "actions", title: "ACTIONS", render: (_: any, r: any) => (
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-surface-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer rounded"><XCircle size={15} /></button>
                        <button className="p-1.5 text-surface-300 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer rounded"><Star size={15} /></button>
                        <button onClick={() => setEditItem(r)} className="p-1.5 text-surface-300 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer rounded"><Pencil size={15} /></button>
                    </div>
                  )}
               ]}
               data={mockReviews}
            />
         </div>
      </div>
    );
  }

  // ─── Teaching Resources View ──────────────────────────────────────────
  if (slug === "teaching-resources") {
    if (showEditor) {
        return <DefaultEditor slug={slug} title={pageTitle} onClose={() => { setShowEditor(false); window.location.hash = ""; }} />;
    }

    return (
      <div className="space-y-6 pb-20 antialiased animate-in fade-in duration-500">
        {renderBreadcrumb()}
        <div className="flex items-center justify-between">
            <Header title="Teaching Resources" subtitle="Upload and manage educational documents" />
            <div className="flex items-center gap-3">
                <button onClick={() => { setShowEditor(true); window.location.hash = "edit"; }} className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-600 rounded-lg text-[12px] font-bold hover:bg-surface-50 transition-all shadow-xs cursor-pointer">
                    <Pencil size={16} /> Edit Landing Content
                </button>
                <button className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 shadow-md shadow-primary-200 transition-all cursor-pointer">
                    <Plus size={16} /> New Resource
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-surface-100 shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-surface-50 flex items-center justify-between bg-surface-50/20">
                        <h3 className="text-[13px] font-bold text-surface-900 uppercase">Library List</h3>
                        <span className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">2 ITEMS</span>
                    </div>
                    <DataTable 
                        columns={[
                            { key: "title", title: "DOCUMENT NAME", render: (v: string, r: any) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600"><FileText size={18} /></div>
                                    <div><p className="font-bold text-surface-800 text-[13px]">{v}</p><p className="text-[10px] text-surface-400 font-medium uppercase tracking-tighter">{r.type} • {r.size}</p></div>
                                </div>
                            )},
                            { key: "date", title: "UPLOADED", render: (v: string) => <span className="text-[11px] font-bold text-surface-400 uppercase">{v}</span> },
                            { key: "downloads", title: "D-LOADS", render: (v: number) => <span className="text-[11px] font-bold text-surface-600">{v}</span> },
                            { key: "actions", title: "ACTIONS", render: () => (
                                <div className="flex items-center gap-2">
                                     <button className="p-1.5 text-surface-300 hover:text-primary-600 hover:bg-surface-50 rounded transition-colors cursor-pointer"><Pencil size={14} /></button>
                                     <button className="p-1.5 text-surface-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"><Trash2 size={14} /></button>
                                </div>
                            )}
                        ]}
                        data={[
                            { id: 1, title: "Classroom Management Guide", type: "PDF", size: "2.4 MB", date: "Apr 05, 2025", downloads: 124 },
                            { id: 2, title: "Modern Pedagogy Checklist", type: "DOCX", size: "1.1 MB", date: "Apr 02, 2025", downloads: 86 },
                        ]}
                    />
                </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl border border-surface-100 shadow-xs p-6 text-center">
                    <h3 className="text-[14px] font-bold text-surface-900 uppercase mb-4 tracking-tight">Upload Center</h3>
                    <div className="border-2 border-dashed border-surface-100 rounded-xl p-8 flex flex-col items-center justify-center hover:border-primary-300 hover:bg-primary-50/30 transition-all group cursor-pointer">
                        <Upload size={24} className="text-surface-300 group-hover:text-primary-600 mb-3" />
                        <p className="text-[13px] font-bold text-surface-900">Push to Library</p>
                        <p className="text-[10px] text-surface-400 font-medium mt-1 uppercase tracking-tighter">PDF, DOCX, ZIP UP TO 10MB</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // ─── Default Editor View ──────────────────────────────────────────────
  return <DefaultEditor slug={slug} title={pageTitle} />;
}

// ─── Reusable Editor Component ───────────────────────────────────────────
function DefaultEditor({ slug, title, onClose }: { slug: string, title: string, onClose?: () => void }) {
  const [content, setContent] = useState("<p>Write your " + title.toLowerCase() + " content here...</p>");
  const [seo, setSeo] = useState({ title: title + " | TeachNow", description: "Manage SEO for " + title });

  return (
    <div className="space-y-6 pb-20 antialiased animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-[12px] font-bold text-surface-400 uppercase tracking-wider mb-6">
        <Link href="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
        <ChevronRight size={12} />
        <span className="text-surface-400">Content Pages</span>
        <ChevronRight size={12} />
        <span className="text-primary-600">{title}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           {onClose && (
                <button onClick={onClose} className="flex items-center gap-2 text-surface-400 hover:text-primary-600 font-bold text-xs uppercase transition-colors mb-2 cursor-pointer">
                    <ArrowLeft size={14} /> Finish Editing Section
                </button>
           )}
           <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Edit {title} Content</h1>
           <p className="text-[13px] text-surface-400 font-medium mt-1">Manage body text and search visibility</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg text-[12px] font-bold hover:bg-primary-700 shadow-sm transition-all cursor-pointer"><Save size={16} /> Save Changes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-surface-100 shadow-xs overflow-hidden">
            <TipTapEditor 
               value={content}
               onChange={setContent}
               placeholder="Write something amazing..."
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-surface-100 p-6 space-y-5">
             <h3 className="text-[14px] font-bold text-surface-900 uppercase tracking-tight flex items-center gap-2"><Globe size={16} className="text-primary-600" /> SEO Gateway</h3>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest pl-1">Page Title</label>
                   <input type="text" value={seo.title} onChange={(e) => setSeo({...seo, title: e.target.value})} className="w-full px-4 py-2 bg-surface-50 border border-surface-100 rounded-lg text-[13px] font-semibold text-surface-900 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest pl-1">Description</label>
                   <textarea value={seo.description} onChange={(e) => setSeo({...seo, description: e.target.value})} className="w-full h-32 px-4 py-2 bg-surface-50 border border-surface-100 rounded-lg text-[13px] font-medium text-surface-500 focus:outline-none resize-none" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-surface-400 uppercase tracking-widest pl-1">Meta Keywords</label>
                   <input type="text" placeholder="education, teaching, jobs..." className="w-full px-4 py-2 bg-surface-50 border border-surface-100 rounded-lg text-[13px] font-semibold text-surface-900 focus:outline-none" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight leading-none">{title}</h1>
            <p className="text-[13px] text-surface-400 font-medium mt-1.5 line-clamp-1">{subtitle}</p>
        </div>
    );
}

function SummaryCard({ label, value, icon, color = "text-surface-900" }: { label: string, value: string, icon?: string, color?: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-surface-100 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">{label}</span>
            <span className={clsx("text-xl font-bold tracking-tight flex items-center gap-1", color)}>
                {value} {icon && <span className="text-lg">{icon}</span>}
            </span>
        </div>
    );
}

function EditorToolbarIcon({ icon }: { icon: React.ReactNode }) {
  return <button className="p-2 text-surface-400 hover:text-surface-900 hover:bg-white rounded-lg transition-all cursor-pointer">{icon}</button>;
}
