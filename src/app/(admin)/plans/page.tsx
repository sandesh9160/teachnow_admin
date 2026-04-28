"use client";

import React, { useState, useEffect } from "react";
import PlanCard from "@/components/cards/PlanCard";
import type { Plan } from "@/types";
import { clsx } from "clsx";
import { getPlans, updatePlan, createPlan } from "@/services/admin.service";
import { toast } from "sonner";
import { Plus, Loader2, Sparkles, TrendingUp, ShieldCheck, CreditCard } from "lucide-react";
import PlanEditModal from "@/components/modals/PlanEditModal";

export default function ManagePlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);

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

  const handleSavePlan = async (planData: any) => {
    try {
      setSavingPlan(true);
      if (planData.id) {
        // Update existing
        await updatePlan(planData.id, planData);
        toast.success("Plan updated successfully");
      } else {
        // Create new
        await createPlan(planData);
        toast.success("New plan created successfully!");
      }
      fetchPlans();
      setEditingPlan(null);
    } catch (error) {
      console.error("Failed to save plan:", error);
      toast.error("Failed to save plan");
    } finally {
      setSavingPlan(false);
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

  const handleCreatePlan = () => {
    const defaultNewPlan: any = {
      name: "",
      actual_price: 0,
      offer_price: 0,
      job_posts_limit: 0,
      validity_days: 0,
      job_live_days: 0,
      features: [],
      featured_jobs_limit: 0,
      company_featured: 0,
      feature_days: 0,
      display_order: 0
    };
    setEditingPlan(defaultNewPlan);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-600" />
        <p className="text-xs font-bold text-slate-500">Synchronizing Plans Database...</p>
      </div>
    );
  }

  const activeCount = (plans || []).filter(p => p.is_active).length;

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-12 antialiased animate-fade-in-up">
      {/* Modern Administrative Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Plans</h1>
          <p className="text-[12px] text-slate-500 font-medium tracking-tight">Configure subscription plans for institutes</p>
        </div>

        <div className="flex items-center gap-5">

          <button
            onClick={handleCreatePlan}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-[12px] font-bold transition-all active:scale-95 group"
          >
            <Plus size={14} />
            Create New Plan
          </button>
        </div>
      </div>

      {/* Reference Metrics Grid */}



      {/* Plan Inventory */}
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
              onEdit={() => setEditingPlan(plan)}
              onSave={handleSavePlan}
              onCancel={() => setEditingPlan(null)}
              onToggleHighlight={handleToggleHighlight}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
      <PlanEditModal
        isOpen={Boolean(editingPlan)}
        plan={editingPlan}
        saving={savingPlan}
        onClose={() => setEditingPlan(null)}
        onSave={handleSavePlan}
      />
    </div>
  );
}


