"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, Mail, Lock } from "lucide-react";
import { adminSignIn } from "@/lib/auth";
import { clsx } from "clsx";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastShown = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("auth") === "required" && !toastShown.current) {
        toast.error("Authentication required. Please sign in.");
        toastShown.current = true;
        router.replace("/login");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Credentials required");
      return;
    }

    setLoading(true);
    try {
      await adminSignIn({ email, password });
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[360px] space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 mb-2">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">TeachNow Admin</h1>
          <p className="text-[12px] text-slate-500 font-medium">Please enter your credentials to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 ml-0.5">Email</label>
              <div className="relative group">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@teachnow.in"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 ml-0.5">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-2",
                loading && "opacity-70 pointer-events-none"
              )}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in to Dashboard"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-slate-700">
            <span className="hover:text-slate-900 cursor-pointer">Security Protocol</span>
            <div className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="hover:text-slate-900 cursor-pointer">V4.2.0</span>
        </div>
      </div>
    </div>
  );
}
