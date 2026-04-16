"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Mail, 
  Lock, 
  KeyRound, 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck 
} from "lucide-react";
import { adminForgotPassword, adminVerifyOTP, adminResetPassword } from "@/lib/auth";
import { clsx } from "clsx";

function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      await adminForgotPassword(email);
      toast.success("Recovery code sent to your email!");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      setIsLoading(true);
      await adminVerifyOTP(email, otp);
      toast.success("Code verified successfully!");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Security requirement: Minimum 8 characters");
      return;
    }

    try {
      setIsLoading(true);
      await adminResetPassword({ 
        email, 
        otp,
        password,
        password_confirmation: confirmPassword
      });
      toast.success("Security credentials updated. Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to finalize new credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[360px] space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 mb-2">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Recovery</h1>
          <p className="text-[12px] text-slate-500 font-medium">Follow the steps to reset your security keys</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0">
          {(["Email", "Verify", "Reset"] as const).map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                    step === s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110" :
                    step > s ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                  )}>
                    {step > s ? <CheckCircle2 size={14} /> : s}
                  </div>
                  <span className={clsx("text-[9px] font-bold uppercase tracking-wider", step === s ? "text-indigo-600" : step > s ? "text-emerald-500" : "text-slate-300")}>{label}</span>
                </div>
                {s < 3 && <div className={clsx("w-12 h-[2px] mx-2 mb-4 rounded-full", step > s ? "bg-emerald-400" : "bg-slate-200")} />}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[280px] flex flex-col justify-center">
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Forgot your password?</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Enter the email address linked to your admin account. We'll send a 6-digit verification code to that inbox.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Admin Email Address</label>
                <div className="relative group">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@teachnow.in"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium"
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-0.5">Make sure this matches the email registered in the system.</p>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Sending code...</> : <>Send Verification Code <ArrowRight size={14} /></>}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100 flex-shrink-0">
                    <KeyRound size={16} />
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Check your inbox</h2>
                </div>
                <p className="text-[12px] text-slate-500">
                  A 6-digit code was sent to <span className="font-semibold text-indigo-600">{email}</span>. Enter it below within the next 10 minutes.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Verification Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000" 
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all font-black text-center text-xl tracking-[0.5em] placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-200"
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
                  disabled={isLoading}
                  required
                />
                <p className="text-[10px] text-slate-400 ml-0.5">Didn't receive it? Check your spam folder or go back to re-enter your email.</p>
              </div>
              
              <div className="space-y-2 pt-1">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isLoading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : "Verify & Continue"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 transition-colors"
                >
                  <ChevronLeft size={12} /> Use a different email address
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Create a new password</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Choose a strong password you haven't used before. It must be at least 8 characters long.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">New Password</label>
                <div className="relative group">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="password" 
                    placeholder="Min. 8 characters" 
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 ml-0.5">Confirm New Password</label>
                <div className="relative group">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="password" 
                    placeholder="Re-enter your new password" 
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium"
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-0.5">Both passwords must match exactly before you can proceed.</p>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
              >
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Saving new password...</> : "Reset Password"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <Link href="/" className="text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5">
            <ChevronLeft size={12} /> Remember your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
