"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/tables/DataTable";
import Badge from "@/components/ui/Badge";
import { 
    Quote, Search, Plus, Filter, 
    Star, Edit3, Trash2, Loader2, 
    CheckCircle2, XCircle, RotateCcw,
    Camera, Building2, User2, ChevronDown
} from "lucide-react";
import { 
    getTestimonials, 
    createTestimonial, 
    updateTestimonial, 
    deleteTestimonial, 
    toggleTestimonialStatus,
    getEmployers
} from "@/services/admin.service";
import { Testimonial, Employer } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";

const BACKEND_URL = "https://teachnowbackend.jobsvedika.in";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [colleges, setColleges] = useState<Employer[]>([]);
  const [fetchingColleges, setFetchingColleges] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const collegeDropdownRef = React.useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    company: "",
    message: "",
    rating: 5,
    is_active: 1,
    display_order: 0
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    fetchData();
    fetchColleges();

    // Click outside handler for college dropdown
    const handleClickOutside = (event: MouseEvent) => {
        if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target as Node)) {
            setShowCollegeDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchColleges = async () => {
    try {
        setFetchingColleges(true);
        const res: any = await getEmployers({ per_page: 500 });
        let list = [];
        if (res?.data?.data && Array.isArray(res.data.data)) {
            list = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
            list = res.data;
        } else if (Array.isArray(res)) {
            list = res;
        }
        setColleges(list);
    } catch (err) {
        console.error("Failed to fetch colleges", err);
    } finally {
        setFetchingColleges(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getTestimonials();
      setTestimonials(res.data || []);
    } catch (err) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: Testimonial) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        designation: item.designation,
        company: item.company || "",
        message: item.message,
        rating: item.rating || 5,
        is_active: Number(item.is_active),
        display_order: item.display_order || 0
      });
      setPreview(item.photo ? (item.photo.startsWith('http') ? item.photo : `${BACKEND_URL}/${item.photo}`) : "");
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        designation: "",
        company: "",
        message: "",
        rating: 5,
        is_active: 1,
        display_order: 0
      });
      setPreview("");
    }
    setFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, String(val)));
      if (file) data.append("photo", file);

      if (editingItem) {
        await updateTestimonial(editingItem.id, data);
        toast.success("Testimonial updated");
      } else {
        await createTestimonial(data);
        toast.success("Testimonial created");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save testimonial");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      setProcessingId(id);
      await deleteTestimonial(id);
      toast.success("Deleted successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setProcessingId(id);
      await toggleTestimonialStatus(id);
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = testimonials.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.company?.toLowerCase().includes(search.toLowerCase()) ||
    t.message.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name", title: "Author",
      render: (_: any, row: Testimonial) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm shadow-indigo-100/50">
            {row.photo ? (
                <img 
                    src={row.photo.startsWith('http') ? row.photo : `${BACKEND_URL}/${row.photo}`} 
                    className="w-full h-full object-cover" 
                    alt="" 
                />
            ) : <User2 size={16} className="text-indigo-400" />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-[12px] truncate leading-tight">{row.name}</p>
            <p className="text-[10px] text-indigo-500 font-bold uppercase mt-0.5 tracking-tighter truncate">{row.designation}</p>
          </div>
        </div>
      )
    },
    {
        key: "company", title: "Company",
        render: (v: any) => (
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] truncate max-w-[150px]">
                <Building2 size={12} className="text-slate-300 shrink-0" />
                {v || "N/A"}
            </div>
        )
    },
    {
        key: "rating", title: "Rating",
        render: (v: any) => (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={11} className={clsx("shrink-0", i <= (v || 0) ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-slate-100")} />
                ))}
            </div>
        )
    },
    {
        key: "message", title: "Message",
        render: (v: any) => (
            <p className="text-[11px] text-slate-600 line-clamp-2 max-w-sm italic font-medium leading-relaxed">"{v}"</p>
        )
    },
    {
        key: "is_active", title: "Status",
        render: (v: any) => (
            <Badge variant={v ? "success" : "default"} dot className="text-[9px] font-black uppercase tracking-widest">
                {v ? "Active" : "Hidden"}
            </Badge>
        )
    },
    {
      key: "actions", title: "Manage",
      render: (_: any, row: Testimonial) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggle(row.id); }}
            disabled={processingId === row.id}
            suppressHydrationWarning
            title={row.is_active ? "Hide Story" : "Publish Story"}
            className={clsx(
                "p-1.5 rounded-lg transition-all active:scale-90",
                row.is_active 
                    ? "bg-amber-50 text-amber-600 border border-amber-100/50" 
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
            )}
          >
            {row.is_active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(row); }}
            suppressHydrationWarning
            title="Edit Details"
            className="p-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100/50 rounded-lg transition-all active:scale-90"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            disabled={processingId === row.id}
            suppressHydrationWarning
            title="Delete Permanently"
            className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100/50 rounded-lg transition-all active:scale-90"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 pb-12 antialiased animate-in fade-in duration-500">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100">
            <Quote size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase leading-none">User Testimonials</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manage public testimonials & success stories</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={fetchData}
                suppressHydrationWarning
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm active:scale-95"
            >
                <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
            </button>
            <button 
                onClick={() => handleOpenModal()}
                suppressHydrationWarning
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
            >
                <Plus size={14} /> Add New
            </button>
        </div>
      </div>

      {/* ─── Search Bar ────────────────────────────────────────────────────── */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            suppressHydrationWarning
            placeholder="Search authors or companies..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-100 rounded-xl text-[12px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-400 transition-all font-semibold" 
          />
        </div>
        <button 
            suppressHydrationWarning
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest shrink-0"
        >
            <Filter size={12} /> Filter
        </button>
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto min-h-[400px]">
        <DataTable 
            columns={columns} 
            data={filtered} 
            loading={loading} 
            compact
            emptyMessage="No testimonials found."
        />
      </div>

      {/* ─── Create/Edit Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
           
           <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-slate-100">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">{editingItem ? "Edit story" : "New story"}</h2>
                    <p className="text-[10px] text-indigo-400 font-bold mt-0.5">Provide author details and message</p>
                 </div>
                 <XCircle className="text-slate-300 hover:text-rose-500 cursor-pointer transition-colors" size={20} onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 {/* Photo Upload */}
                 <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group">
                        {preview ? (
                            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                        ) : <Camera size={20} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />}
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    setFile(f);
                                    setPreview(URL.createObjectURL(f));
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-indigo-400 mb-1">Author photo</label>
                        <p className="text-[9px] text-slate-400 leading-tight font-medium">Recommended size 200x200px. JPG, PNG formats supported.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-indigo-400 ml-0.5">Full name</label>
                        <input 
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-sm"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-indigo-400 ml-0.5">Designation</label>
                        <input 
                            required
                            type="text"
                            value={formData.designation}
                            onChange={e => setFormData({...formData, designation: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-sm"
                            placeholder="e.g. Principal"
                        />
                    </div>
                 </div>

                 <div className="space-y-1 relative" ref={collegeDropdownRef}>
                    <label className="block text-[10px] font-bold text-indigo-400 ml-0.5">College / Company</label>
                    <div className="relative">
                        <input 
                            type="text"
                            value={formData.company}
                            onFocus={() => setShowCollegeDropdown(true)}
                            onChange={e => {
                                setFormData({...formData, company: e.target.value});
                                setCollegeSearch(e.target.value);
                                setShowCollegeDropdown(true);
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-100 focus:bg-white transition-all shadow-sm"
                            placeholder="Type to search or enter manually..."
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {fetchingColleges ? (
                                <Loader2 size={12} className="text-slate-300 animate-spin" />
                            ) : (
                                <ChevronDown size={14} className={clsx("text-slate-300 transition-transform", showCollegeDropdown && "rotate-180")} />
                            )}
                        </div>
                    </div>

                    {showCollegeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-[110] max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                            {colleges.filter(c => 
                                c.company_name?.toLowerCase().includes(collegeSearch.toLowerCase())
                            ).length > 0 ? (
                                colleges.filter(c => 
                                    c.company_name?.toLowerCase().includes(collegeSearch.toLowerCase())
                                ).map((college) => (
                                    <button
                                        key={college.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData({...formData, company: college.company_name});
                                            setCollegeSearch("");
                                            setShowCollegeDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-2"
                                    >
                                        <Building2 size={12} className="text-slate-300" />
                                        <span className="truncate">{college.company_name}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-[11px] text-slate-400 font-medium italic">
                                    {collegeSearch ? "No matches found. You can still use this name." : "Start typing to search colleges..."}
                                </div>
                            )}
                        </div>
                    )}
                 </div>

                 <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-indigo-400 ml-0.5">Success message</label>
                    <textarea 
                        required
                        rows={2}
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-semibold text-slate-900 focus:outline-none focus:border-indigo-100 focus:bg-white transition-all resize-none shadow-sm"
                        placeholder="Share the success story..."
                    />
                 </div>

                 <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <div>
                        <label className="block text-[9px] font-bold text-indigo-400 mb-1">Star rating</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star 
                                    key={i} 
                                    size={16} 
                                    className={clsx("cursor-pointer transition-all active:scale-90", i <= formData.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-transparent")} 
                                    onClick={() => setFormData({...formData, rating: i})}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-indigo-400 mb-1">Display Order</label>
                            <input 
                                type="number"
                                value={formData.display_order}
                                onChange={e => setFormData({...formData, display_order: Number(e.target.value)})}
                                className="w-20 px-2 py-1 bg-white border border-slate-100 rounded-lg text-[12px] font-bold text-slate-900 focus:outline-none focus:border-indigo-100 transition-all"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                             <span className="text-[10px] font-bold text-indigo-400">Active</span>
                             <button 
                                type="button"
                                onClick={() => setFormData({...formData, is_active: formData.is_active === 1 ? 0 : 1})}
                                className={clsx(
                                    "w-9 h-4.5 rounded-full relative transition-all duration-300",
                                    formData.is_active === 1 ? "bg-indigo-600" : "bg-slate-200"
                                )}>
                                <div className={clsx(
                                    "absolute w-3 h-3 bg-white rounded-full top-[3px] transition-all duration-300",
                                    formData.is_active === 1 ? "left-[20px]" : "left-[4px]"
                                )} />
                             </button>
                        </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-2xl hover:bg-slate-200 hover:text-slate-900 transition-all font-bold"
                    >
                        Discard
                    </button>
                    <button 
                        type="submit"
                        disabled={submitting}
                        className="flex-[2] py-3 bg-indigo-600 text-white text-[11px] font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        {editingItem ? "Update story" : "Publish story"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
