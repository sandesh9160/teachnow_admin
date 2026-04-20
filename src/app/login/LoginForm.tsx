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
        router.replace("/");
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
    <div className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[340px] space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-[14px] text-slate-600 font-medium">Please sign in to your accounts</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-card relative overflow-hidden group">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-900 ml-0.5">Admin Email</label>
              <div className="relative group/input">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-medium"
                    disabled={loading}
                    suppressHydrationWarning={true}
                  />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[13px] font-bold text-slate-900 ml-0.5">Password</label>
                <Link href="/forgot-password" className="text-[12px] font-bold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group/input">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-medium"
                  disabled={loading}
                  suppressHydrationWarning={true}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  suppressHydrationWarning={true}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full py-2.5 rounded-xl bg-primary text-white text-[14px] font-bold hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] mt-2",
                loading && "opacity-70 pointer-events-none"
              )}
              suppressHydrationWarning={true}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In <span className="text-base">→</span>
                </>
              )}
            </button>
          </form>

          {/* Security Box */}
          <div className="mt-5 p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <ShieldCheck size={12} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-slate-900">Secure Admin Access</p>
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                Only authorized administrators may enter. 
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
