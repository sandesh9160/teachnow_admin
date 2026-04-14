"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
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
