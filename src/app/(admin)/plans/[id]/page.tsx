"use client";

import React, { useState, useEffect } from "react";
import PlanForm from "@/components/forms/PlanForm";
import { getPlans, updatePlan } from "@/services/admin.service";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import type { Plan } from "@/types";
import { Loader2 } from "lucide-react";

export default function EditPlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await getPlans();
      if (res && res.data) {
        const found = (res.data as Plan[]).find(p => p.id === Number(id));
        if (found) {
          setPlan(found);
        } else {
          toast.error("Plan not found");
          router.push("/plans");
        }
      }
    } catch (error) {
      console.error("Failed to fetch plan:", error);
      toast.error("Failed to load plan details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      setSaving(true);
      await updatePlan(Number(id), data);
      toast.success("Plan updated successfully");
      router.push("/plans");
    } catch (error) {
      console.error("Failed to update plan:", error);
      toast.error("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-600" />
        <p className="text-xs font-bold text-slate-500">Loading plan configuration...</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <PlanForm 
        plan={plan} 
        saving={saving} 
        onSave={handleSave} 
      />
    </div>
  );
}
