"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "@/lib/firebase/auth";
import { LogOut, User as UserIcon, Settings, ChevronRight } from "lucide-react";
import EditProfileModal from "@/components/finance/EditProfileModal";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 max-w-2xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="text-foreground/60 mt-1 text-sm sm:text-base">
          Manage your personal information.
        </p>
      </header>

      {/* Profile Card */}
      <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
        <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-foreground/10 border-4 border-background shadow-lg shrink-0">
          {user?.photoURL ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.photoURL}
              alt="Profile avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-foreground/40">
              <UserIcon className="h-12 w-12 sm:h-16 sm:w-16" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left w-full">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
            {user?.displayName || "Anonymous User"}
          </h2>
          <p className="text-foreground/60 font-medium text-sm sm:text-base mb-5 sm:mb-6">
            {user?.email || "No email provided"}
          </p>

          <div className="space-y-3 max-w-sm mx-auto sm:mx-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full rounded-2xl bg-foreground text-background py-3 font-medium transition-opacity hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              Edit Profile
            </button>
            <button
              onClick={signOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 text-red-500 py-3 font-medium transition-colors hover:bg-red-500/20 active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links — visible on mobile for settings access */}
      <div className="sm:hidden space-y-2">
        <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider px-1">
          Quick Links
        </h3>
        <Link
          href="/settings"
          className="glass-card flex items-center justify-between p-4 transition-colors hover:bg-foreground/[0.02]"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-foreground/5 text-foreground/60">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Settings</p>
              <p className="text-xs text-foreground/50">
                Theme, currency, notifications, security
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-foreground/30" />
        </Link>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          refreshUser?.();
        }}
      />
    </div>
  );
}
