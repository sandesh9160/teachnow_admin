"use client";

import React, { useState, useEffect } from "react";
import PlanCard from "@/components/cards/PlanCard";
import type { Plan } from "@/types";
import { clsx } from "clsx";
import { getPlans, updatePlan, createPlan } from "@/services/admin.service";
import { toast } from "sonner";
import { Plus, Loader2, Sparkles, TrendingUp, ShieldCheck, CreditCard } from "lucide-react";

export default function ManagePlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await getPlans();
      if (res && res.data) {
        setPlans(res.data);
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

  const handleUpdatePlan = async (updatedPlan: Plan) => {
    try {
      await updatePlan(updatedPlan.id, updatedPlan);
      setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      setEditingId(null);
      toast.success("Plan updated successfully");
    } catch (error) {
      console.error("Failed to update plan:", error);
      toast.error("Failed to update plan");
    }
  };

  const handleToggleHighlight = async (plan: Plan) => {
    try {
      const isHighlighted = !plan.is_highlighted;
      await updatePlan(plan.id, { is_highlighted: isHighlighted });
      setPlans(prev => prev.map(p => ({ 
        ...p, 
        is_highlighted: p.id === plan.id ? isHighlighted : (isHighlighted ? false : p.is_highlighted) 
      })));
      toast.success(isHighlighted ? "Plan highlighted" : "Highlight removed");
    } catch (error) {
      toast.error("Failed to update plan");
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      const isActive = !plan.is_active;
      await updatePlan(plan.id, { is_active: isActive });
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_active: isActive } : p));
      toast.success(isActive ? "Plan enabled" : "Plan disabled");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCreatePlan = async () => {
    const newPlanData: Partial<Plan> = {
      name: "New Premium Plan",
      slug: "new-premium-plan",
      price: 1999,
      offer_price: 1999,
      actual_price: 2999,
      job_posts_limit: 10,
      validity_days: 60,
      job_live_days: 30,
      duration: "month",
      features: ["Mail Notifications", "Recommendations"],
      is_active: true,
      is_highlighted: false
    };

    try {
      await createPlan(newPlanData);
      toast.success("New plan created. You can now edit its details.");
      fetchPlans();
    } catch (error) {
      toast.error("Failed to create plan");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
        <p className="text-[12px] font-bold uppercase tracking-widest">Synchronizing Plans...</p>
      </div>
    );
  }

  const activeCount = (plans || []).filter(p => p.is_active).length;

  return (
    <div className="space-y-4 pb-8 antialiased max-w-7xl mx-auto">
      {/* ─── Premium Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <CreditCard size={14} />
             </div>
             <h4 className="text-[10px] font-semibold text-indigo-600 tracking-wide uppercase">Monetization Hub</h4>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Premium Offerings</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-3">
              <span className="text-[10px] font-medium text-slate-400">Current Inventory</span>
              <span className="text-[13px] font-bold text-slate-900">{activeCount} / {(plans || []).length} Active</span>
          </div>
          <button 
            onClick={handleCreatePlan}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[12px] font-semibold shadow-md transition-all active:scale-95 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> 
            Create Plan
          </button>
        </div>
      </div>

      {/* ─── Flexible Statistics ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatWidget 
            label="Ecosystem Reach" 
            value={(plans || []).reduce((acc, p) => acc + (p.subscribers || 0), 0).toLocaleString()} 
            icon={<Sparkles size={18} />}
            desc="Global subscribers"
            color="indigo"
        />
        <StatWidget 
            label="Revenue Projection" 
            value={`₹${(plans || []).reduce((acc, p) => acc + (Number(p.offer_price || p.price || 0) * (p.subscribers || 0)), 0).toLocaleString()}`} 
            icon={<TrendingUp size={18} />}
            desc="Monthly yield"
            color="emerald"
        />
        <StatWidget 
            label="Platform Health" 
            value={(plans || []).filter(p => !p.is_active).length > 0 ? "Normal" : "Optimal"} 
            icon={<ShieldCheck size={18} />}
            desc="System status"
            color="amber"
        />
      </div>

      {/* ─── Plan Inventory ────────────────────────────────────────── */}
      {(!plans || plans.length === 0) ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
             <CreditCard size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No active plans detected</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">Your monetization vault is empty. Click "Propose New Plan" to initialize your offerings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(plans || []).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isEditing={editingId === plan.id}
              onEdit={() => setEditingId(plan.id)}
              onSave={handleUpdatePlan}
              onCancel={() => setEditingId(null)}
              onToggleHighlight={handleToggleHighlight}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatWidget({ label, value, icon, desc, color }: { label: string, value: string, icon: React.ReactNode, desc: string, color: "indigo" | "emerald" | "amber" }) {
  const themes = {
    indigo: "from-indigo-500/10 to-blue-500/5 text-indigo-600 border-indigo-100",
    emerald: "from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-100",
    amber: "from-amber-500/10 to-orange-500/5 text-amber-600 border-amber-100"
  };

  return (
    <div className="bg-white p-3.5 rounded-[1rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow transition-all">
      <div className="flex items-center gap-3 relative z-10">
          <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm shrink-0", themes[color])}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-400 mb-0.5">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-[16px] font-bold text-slate-900 leading-none">{value}</p>
                <p className="text-[9px] font-medium text-slate-400 truncate">{desc}</p>
            </div>
          </div>
      </div>
    </div>
  );
}
