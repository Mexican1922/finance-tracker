"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Optionally show a sleek Apple-like loader while checking auth state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-accent/5 backdrop-blur-sm p-1.5 shadow-lg border border-foreground/5 animate-pulse">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Finance Tracker Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-sm font-medium text-foreground/50">
            Loading workspace...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
