"use client";

import React, { useState, useEffect } from "react";
import PlanCard from "@/components/cards/PlanCard";
import type { Plan } from "@/types";
import { clsx } from "clsx";
import { getPlans, updatePlan, createPlan } from "@/services/admin.service";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

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
      const { data } = await getPlans();
      setPlans(data);
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
      name: "New Plan",
      slug: "new-plan",
      price: 0,
      duration: "month",
      features: ["New Feature"],
      is_active: false,
      is_highlighted: false
    };

    try {
      const { data } = await createPlan(newPlanData);
      // Depending on API response, data might be the new plan object
      // If the API returns the updated list, we'd use that, but here we assume it returns the single item
      toast.success("New plan created. You can now edit its details.");
      fetchPlans(); // Refresh list to get the new plan with its ID
    } catch (error) {
      toast.error("Failed to create plan");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-surface-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm font-medium">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Manage Plans</h1>
          <p className="text-sm text-surface-500 mt-1">Configure subscription plans for institutes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-surface-400">
             <span className="p-1 px-3 bg-surface-100 rounded-full">{plans.filter(p => p.is_active).length} active plans</span>
          </div>
          <button 
            onClick={handleCreatePlan}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-soft transition-all"
          >
            <Plus size={18} /> Add Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem label="Total Subscribers" value={plans.reduce((acc, p) => acc + (p.subscribers || 0), 0).toLocaleString()} />
        <StatItem label="Monthly Revenue" value={`₹${plans.reduce((acc, p) => acc + (p.price * (p.subscribers || 0)), 0).toLocaleString()}`} color="text-emerald-600" />
        <StatItem label="Active Plans" value={plans.filter(p => p.is_active).length.toString()} />
      </div>

      {plans.length === 0 ? (
        <div className="bg-white border border-dashed border-surface-300 rounded-2xl p-12 text-center">
          <p className="text-surface-500 font-medium">No plans found. Create your first plan to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
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

function StatItem({ label, value, color = "text-surface-900" }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-sm">
      <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={clsx("text-2xl font-black", color)}>{value}</p>
    </div>
  );
}
