import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoginForm from "./login/LoginForm";

export default async function RootPage() {
  const user = await getAdminUser();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={
        <div className="min-h-screen bg-surface-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
