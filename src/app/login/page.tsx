"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithGoogle, signInWithEmail } from "@/lib/firebase/auth";
import { Lock, Mail, ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error signing in", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign-in popup was closed before completion.");
      } else {
        setErrorMsg("An error occurred during sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch {
      setErrorMsg("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel — decorative hero (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Hero Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login-hero.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10 backdrop-blur-md p-1.5 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Finance Tracker
              </h2>
            </div>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold tracking-tight leading-tight">
              Take control
              <br />
              of your money.
            </h1>
            <p className="text-white/70 text-lg max-w-md leading-relaxed">
              Track expenses, set savings goals, and get AI-powered insights all
              in one beautiful dashboard.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                Smart Analytics
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Secure & Private
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Zap className="h-4 w-4" />
                Real-time Sync
              </div>
            </div>
          </div>

          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Finance Tracker
          </p>
        </div>
      </div>

      {/* Right Panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile-only branding */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white/5 backdrop-blur-sm p-2 shadow-lg border border-foreground/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Finance Tracker
            </h2>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl text-center sm:text-left sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-foreground/60 text-center sm:text-left mt-2 text-sm sm:text-base">
              Sign in to your personal finance workspace.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-2xl bg-red-500/10 p-3.5 text-center text-sm font-medium text-red-500">
              {errorMsg}
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-foreground/10 bg-transparent py-3.5 px-4 font-medium text-foreground transition-all hover:bg-foreground/5 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21528 6.86 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-foreground/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-4 text-foreground/40 font-medium uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Email form */}
          <form className="space-y-4" onSubmit={handleEmailSignIn}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-foreground/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-2xl border border-foreground/10 bg-transparent py-3.5 pl-12 pr-4 text-sm outline-none ring-accent transition-all focus:border-accent focus:ring-1"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-foreground/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-2xl border border-foreground/10 bg-transparent py-3.5 pl-12 pr-4 text-sm outline-none ring-accent transition-all focus:border-accent focus:ring-1"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-foreground/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-500 font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
