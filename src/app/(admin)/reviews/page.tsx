"use client";

import React, { useState, useEffect } from "react";
// import Badge from "@/components/ui/Badge";
import { 
    Star, 
    Search, 
    Filter, 
    MessageSquare, 
    CheckCircle2, 
    XCircle, 
    Trash2, 
    Loader2, 
    Clock,
    UserCircle,
    Building2,
    RotateCcw,
    Plus,
    Edit2
} from "lucide-react";
import { getTestimonials, toggleTestimonialStatus, deleteTestimonial } from "@/services/admin.service";
import { Testimonial } from "@/types";
import { toast } from "sonner";
import { clsx } from "clsx";
import { resolveMediaUrl } from "@/lib/media";
import CMSTestimonialModal from "@/components/modals/CMSTestimonialModal";

export default function ReviewsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await getTestimonials();
      console.log("Testimonials API Response:", res);
      const list = (res as any).data || (res as any) || [];
      setTestimonials(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Testimonials Fetch Error:", err);
      toast.error("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number | string) => {
    try {
      setProcessingId(id as any);
      const res = await toggleTestimonialStatus(id as any);
      console.log(">>> TESTIMONIAL TOGGLE RESPONSE RAW:", res);
      
      const newStatus = (res as any)?.is_active ?? (res as any)?.data?.is_active ?? "NOT_FOUND";
      console.log(">>> EXTRACTED NEW STATUS:", newStatus);
      
      if ((res as any)?.status === false) {
        toast.error((res as any)?.message || "Failed to update status");
        return;
      }

      toast.success("Status updated successfully");
      
      // Short delay to ensure backend has persisted the change before we fetch again
      setTimeout(() => {
        fetchTestimonials();
      }, 500);
    } catch (err: any) {
      console.error(">>> TOGGLE FATAL ERROR:", err);
      toast.error(err?.message || "An unexpected error occurred during toggle");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    try {
      setProcessingId(id);
      await deleteTestimonial(id);
      toast.success("Testimonial deleted");
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      toast.error("Failed to delete testimonial");
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = (item: Testimonial) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const filtered = testimonials.filter((t) => 
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.message?.toLowerCase().includes(search.toLowerCase()) ||
    t.company?.toLowerCase().includes(search.toLowerCase()) ||
    t.designation?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 antialiased animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Testimonials & Reviews</h1>
          <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">
            Manage public testimonials and user feedback <span className="mx-1">·</span> Total {testimonials.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[12px] font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
          >
            <Plus size={16} strokeWidth={2.5} /> Add Testimonial
          </button>
          <button 
            suppressHydrationWarning 
            onClick={fetchTestimonials}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-primary transition-all active:scale-95 shadow-sm"
          >
            <RotateCcw size={16} className={clsx(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search by name, company, or feedback content..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full pl-11 pr-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all" 
        />
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 tracking-wider">Reviewer</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 tracking-wider">Feedback</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 tracking-wider text-center">Rating</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 tracking-wider text-right">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && filtered.map((row, i) => {
                const isActive = (row.is_active as any) == 1 || (row.is_active as any) === true || (row.is_active as any) === "1" || (row.is_active as any) === "true";
                const rating = row.rating || 0;
                
                return (
                  <tr key={row.id} className="group hover:bg-slate-50/30 transition-all duration-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                          {row.photo ? (
                            <img src={resolveMediaUrl(row.photo)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle size={20} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 leading-tight group-hover:text-primary transition-colors">{row.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-primary font-bold uppercase tracking-tight">{row.designation}</span>
                            {row.company && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{row.company}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-md">
                        <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic line-clamp-2">
                          "{row.message}"
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={clsx(
                              i < rating ? "text-amber-400 fill-amber-400" : "text-slate-100 fill-slate-100"
                            )} 
                          />
                        ))}
                        {rating > 0 && <span className="ml-1.5 text-[11px] font-bold text-slate-900">{rating}.0</span>}
                      </div>
                    </td>
                    <td 
                      className="px-4 py-3 text-center"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.alert("ATTEMPTING TOGGLE FOR ID: " + row.id);
                          console.log("MANUAL CLICK LOG - ID:", row.id);
                          handleToggleStatus(row.id);
                        }}
                        className={clsx(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all active:scale-95 cursor-pointer relative z-30",
                          isActive 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                            : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                        )}
                      >
                        {processingId === row.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          isActive ? "Enabled" : "Disabled"
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-[11px] text-slate-500 font-medium whitespace-nowrap">
                      {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            console.log("ACTIONS TOGGLE CLICKED:", row.id);
                            handleToggleStatus(row.id);
                          }}
                          disabled={processingId === row.id}
                          className={clsx(
                            "p-1.5 rounded-lg transition-all",
                            isActive 
                              ? "text-emerald-600 hover:bg-emerald-50" 
                              : "text-slate-400 hover:bg-slate-50"
                          )}
                          title={isActive ? "Disable" : "Enable"}
                        >
                          {processingId === row.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />
                          )}
                        </button>
                        <button 
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-90"
                          title="Edit Testimonial"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(row.id)}
                          disabled={processingId === row.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                          title="Delete Testimonial"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary/40 mb-3" size={40} />
              <span className="text-[13px] font-semibold text-slate-400 font-medium">Loading Testimonials...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center opacity-50">
              <MessageSquare size={48} className="text-slate-300 mb-3" />
              <span className="text-[14px] font-semibold text-slate-400 font-medium">No testimonials found</span>
            </div>
          )}
        </div>
      </div>

      <CMSTestimonialModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchTestimonials();
        }}
        item={selectedItem}
      />
    </div>
  );
}
