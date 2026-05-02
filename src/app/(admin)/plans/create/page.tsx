"use client";

import React, { useState } from "react";
import PlanForm from "@/components/forms/PlanForm";
import { createPlan } from "@/services/admin.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreatePlanPage() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const defaultNewPlan: any = {
    name: "",
    actual_price: "0.00",
    offer_price: "0.00",
    job_posts_limit: 0,
    validity_days: 0,
    job_live_days: 0,
    features: [],
    featured_jobs_limit: 0,
    company_featured: 0,
    feature_days: 0,
    display_order: 1,
    is_active: 1,
    is_highlighted: 0
  };

  const handleSave = async (data: any) => {
    try {
      setSaving(true);
      await createPlan(data);
      toast.success("New plan created successfully!");
      router.push("/plans");
    } catch (error) {
      console.error("Failed to create plan:", error);
      toast.error("Failed to create plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-6 px-4">
      <PlanForm 
        plan={defaultNewPlan} 
        saving={saving} 
        onSave={handleSave} 
      />
    </div>
  );
}
