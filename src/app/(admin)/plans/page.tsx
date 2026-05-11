"use client";

import React, { useState, useEffect } from "react";
import PlanCard from "@/components/cards/PlanCard";
import type { Plan } from "@/types";
import { clsx } from "clsx";
import { getPlans, updatePlan } from "@/services/admin.service";
import { toast } from "sonner";
import { 
  Plus, 
  Loader2, 
  CreditCard, 
  Search, 
  ShieldCheck,
  CircleDollarSign,
  TrendingUp,
  LayoutGrid
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import Badge from "@/components/ui/Badge";

export default function ManagePlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getPlans();
      if (res && res.data) {
        const sortedPlans = (res.data as Plan[]).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        setPlans(sortedPlans);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Failed to load plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      const isActive = (plan.is_active === true || plan.is_active === 1);
      const nextStatus = isActive ? 0 : 1;
      await updatePlan(plan.id, { is_active: nextStatus });
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_active: nextStatus } : p));
      toast.success(nextStatus === 1 ? "Plan enabled" : "Plan disabled");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredPlans = plans.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Plans", value: plans.length, icon: LayoutGrid, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Plans", value: plans.filter(p => p.is_active).length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Premium Tiers", value: plans.filter(p => Number(p.offer_price) > 0).length, icon: CircleDollarSign, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Average Price", value: `₹${Math.round(plans.reduce((acc, p) => acc + Number(p.offer_price || 0), 0) / (plans.length || 1))}`, icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-600" />
        <p className="text-xs font-bold text-slate-500">Synchronizing Plans Database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 antialiased animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-slate-900 font-medium mt-0.5">Architect your monetization strategy and tier limits</p>
        </div>
        <Link
          href="/plans/create"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} strokeWidth={3} />
          Create New Plan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-slate-200/60 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
            <div>
              <p className="text-[10px] font-bold text-slate-900 tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="relative group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Search by plan name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-5 py-3 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900 placeholder:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all shadow-sm"
        />
      </div>

      {/* Plans Grid */}
      {filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pt-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => router.push(`/plans/${plan.id}`)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200/60 p-20 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/20">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
            <CreditCard size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900">No active plans detected</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-xs font-medium">Your monetization vault is empty. Click "Create New Plan" to initialize your offerings.</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}



