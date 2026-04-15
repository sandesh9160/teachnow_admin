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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-[360px] space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-600 mb-1 border-4 border-white shadow-sm">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-[14px] text-slate-500 font-medium">Secure access for administrators</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-500 tracking-wider ml-0.5 uppercase">Admin Username</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-slate-500 tracking-wider ml-0.5 uppercase">Admin Password</label>
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full py-2.5 rounded-lg bg-primary text-white text-[15px] font-bold hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]",
                loading && "opacity-70 pointer-events-none"
              )}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In <span className="text-lg">→</span>
                </>
              )}
            </button>
          </form>

          {/* Security Box */}
          <div className="mt-5 p-3 bg-slate-50/80 rounded-lg border border-dotted border-slate-200 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-white border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <ShieldCheck size={14} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[12px] font-bold text-slate-800">Internal Security Protocol</p>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Secure administrative portal access. Unauthorized entry attempts are logged.
              </p>
            </div>
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center pt-2">
            <Link href="/forgot-password" data-auth-link className="text-[13px] font-bold text-slate-400 hover:text-primary transition-colors cursor-pointer capitalize">
              Lost password? Contact Support
            </Link>
        </div>
      </div>
    </div>
  );
}
