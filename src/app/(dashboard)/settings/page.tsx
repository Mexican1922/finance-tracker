"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  Shield,
  Wallet,
  Sun,
  Moon,
  Monitor,
  KeyRound,
  Trash2,
  Target,
  CalendarClock,
  TrendingUp,
  Smartphone,
} from "lucide-react";
import ChangeCurrencyModal from "@/components/finance/ChangeCurrencyModal";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { signOut } from "@/lib/firebase/auth";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const { currency } = useCurrency();

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notification preferences stored in localStorage
  const [notifPrefs, setNotifPrefs] = useState({
    goalMilestones: true,
    subscriptionReminders: true,
    overspendingAlerts: true,
  });

  const togglePref = (key: keyof typeof notifPrefs) =>
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-12 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-foreground/60 mt-1">
          Manage your app preferences and account settings.
        </p>
      </header>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <section className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/5 bg-foreground/[0.02]">
            <h2 className="font-semibold text-lg tracking-tight">Appearance</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">
                  Theme Preference
                </h3>
                <p className="text-sm text-foreground/60 mt-1">
                  Choose how Finance Tracker looks to you.
                </p>
              </div>

              <div className="flex bg-foreground/5 rounded-xl p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === "light"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  } cursor-pointer`}
                >
                  <Sun className="h-4 w-4" />
                  <span className="hidden sm:inline">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  } cursor-pointer`}
                >
                  <Moon className="h-4 w-4" />
                  <span className="hidden sm:inline">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === "system"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  } cursor-pointer`}
                >
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">System</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/5 bg-foreground/[0.02]">
            <h2 className="font-semibold text-lg tracking-tight">General</h2>
          </div>
          <div className="divide-y divide-foreground/5">
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-foreground/[0.01]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-foreground/5 text-foreground/60">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Base Currency</h3>
                  <p className="text-sm text-foreground/60">
                    {currency.code} ({currency.symbol})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCurrencyModalOpen(true)}
                className="text-sm font-medium text-accent hover:underline text-left cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Bank Sync Setup */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    Live Bank Sync (Free)
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Automatically track spending from your phone&apos;s notifications.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-4">
                <div>
                  <p className="text-sm text-foreground font-semibold mb-1.5">
                    📋 Step 1 — Copy Your Webhook URL
                  </p>
                  <code className="flex overflow-x-auto whitespace-nowrap rounded-lg bg-background p-2.5 text-xs text-foreground/70 border border-foreground/10 select-all">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/api/webhooks/bank-alert`
                      : ""}
                  </code>
                </div>

                <div>
                  <p className="text-sm text-foreground font-semibold mb-1.5">
                    📱 Step 2 — MacroDroid Setup (Android)
                  </p>
                  <ol className="text-sm text-foreground/80 list-decimal list-inside space-y-1.5">
                    <li>Open <strong>MacroDroid</strong> &rarr; Create a new Macro.</li>
                    <li>Add <strong>Trigger &rarr; Device Events &rarr; Notification Received</strong>.</li>
                    <li>Select your <strong>bank apps</strong> (OPay, PalmPay, Gmail, etc.).</li>
                    <li>Add <strong>Action &rarr; Connectivity &rarr; HTTP Request</strong>.</li>
                    <li>Set <strong>Method: POST</strong> and paste your URL above.</li>
                    <li>Set <strong>Content Type</strong> to <code>application/json</code>.</li>
                    <li>In <strong>Content Body</strong>, paste:
                      <pre className="mt-2 rounded-lg bg-background p-2.5 text-xs text-foreground/70 border border-foreground/10 whitespace-pre-wrap overflow-x-auto">{'{\n  "uid": "' + (user?.uid ?? 'YOUR_UID_HERE') + '",\n  "text": {notification}\n}'}</pre>
                    </li>
                    <li>Save &amp; enable the Macro. Done! 🎉</li>
                  </ol>
                </div>

                <div>
                  <p className="text-sm text-foreground font-semibold mb-1.5">
                    🍎 Step 2 — Shortcuts Setup (iPhone / iOS)
                  </p>
                  <ol className="text-sm text-foreground/80 list-decimal list-inside space-y-1.5">
                    <li>Open <strong>Shortcuts &rarr; Automation &rarr; New Automation</strong>.</li>
                    <li>Choose trigger: <strong>Notification Received</strong> from your bank app.</li>
                    <li>Add action: <strong>Get Contents of URL</strong>.</li>
                    <li>Paste your Webhook URL and set <strong>Method: POST</strong>.</li>
                    <li>Add Header: <code>Content-Type: application/json</code>.</li>
                    <li>Set Request Body (JSON) with your uid and notification text.</li>
                    <li>Save. Your expenses will sync automatically! 🎉</li>
                  </ol>
                </div>

                <p className="text-xs text-foreground/50 italic pt-1 border-t border-foreground/10">
                  ⚡ Finance Tracker auto-filters spam — only real bank alerts are logged.
                </p>
              </div>
            </div>
          </div>
        </section

        {/* Notifications */}
        <section className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/5 bg-foreground/[0.02]">
            <h2 className="font-semibold text-lg tracking-tight">
              Notifications
            </h2>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-foreground/5 text-foreground/60">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Alerts</h3>
                <p className="text-sm text-foreground/60">
                  Which alerts appear in your notification bell
                </p>
              </div>
            </div>

            {/* Toggles */}
            <div className="ml-0 space-y-3 pl-1">
              {(
                [
                  [
                    "goalMilestones",
                    "Goal Milestones",
                    "When a goal reaches 80% or 100%",
                    Target,
                  ],
                  [
                    "subscriptionReminders",
                    "Subscription Reminders",
                    "Bills due within 7 days",
                    CalendarClock,
                  ],
                  [
                    "overspendingAlerts",
                    "Overspending Alerts",
                    "When spending is 20%+ above last month",
                    TrendingUp,
                  ],
                ] as const
              ).map(([key, label, desc, Icon]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl bg-foreground/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Icon className="h-4 w-4 text-foreground/50" />
                      {label}
                    </p>
                    <p className="text-xs text-foreground/50 mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() => togglePref(key)}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer ${
                      notifPrefs[key] ? "bg-accent" : "bg-foreground/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        notifPrefs[key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security / Account */}
        <section className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/5 bg-foreground/[0.02]">
            <h2 className="font-semibold text-lg tracking-tight">Security</h2>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-foreground/5 text-foreground/60">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Account</h3>
                <p className="text-sm text-foreground/60">
                  Manage your password and data
                </p>
              </div>
            </div>

            <div className="space-y-3 pl-1">
              {/* Change Password */}
              <div className="rounded-xl bg-foreground/[0.02] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-foreground/50" />
                    <p className="text-sm font-medium text-foreground">
                      Change Password
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="text-sm font-medium text-accent hover:underline cursor-pointer"
                  >
                    {showPasswordForm ? "Cancel" : "Update"}
                  </button>
                </div>

                {showPasswordForm && (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user || !user.email) return;
                      setPasswordLoading(true);
                      setPasswordMsg("");
                      try {
                        const cred = EmailAuthProvider.credential(
                          user.email,
                          currentPassword,
                        );
                        await reauthenticateWithCredential(user, cred);
                        await updatePassword(user, newPassword);
                        setPasswordMsg("Password updated successfully!");
                        setCurrentPassword("");
                        setNewPassword("");
                        setShowPasswordForm(false);
                      } catch (err: any) {
                        setPasswordMsg(
                          err.message || "Failed to update password.",
                        );
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}
                  >
                    <input
                      type="password"
                      required
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="New password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      {passwordLoading ? "Updating..." : "Save New Password"}
                    </button>
                  </form>
                )}

                {passwordMsg && (
                  <p
                    className={`mt-2 text-xs font-medium ${passwordMsg.includes("success") ? "text-green-600" : "text-red-500"}`}
                  >
                    {passwordMsg}
                  </p>
                )}
              </div>

              {/* Delete Account */}
              <div className="rounded-xl bg-red-500/[0.03] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500/60" />
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        Delete Account
                      </p>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        Permanently remove your account and all data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    className="text-sm font-medium text-red-500 hover:underline cursor-pointer"
                  >
                    {showDeleteConfirm ? "Cancel" : "Delete"}
                  </button>
                </div>

                {showDeleteConfirm && (
                  <div className="mt-4 rounded-xl bg-red-500/10 p-4">
                    <p className="text-sm text-red-600 font-medium mb-3">
                      Are you sure? This action cannot be undone.
                    </p>
                    <button
                      disabled={deleteLoading}
                      onClick={async () => {
                        if (!user) return;
                        setDeleteLoading(true);
                        try {
                          await deleteUser(user);
                          await signOut();
                        } catch (err: any) {
                          alert(
                            err.message ||
                              "Failed to delete account. You may need to re-login first.",
                          );
                        } finally {
                          setDeleteLoading(false);
                        }
                      }}
                      className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      {deleteLoading ? "Deleting..." : "Yes, Delete My Account"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <ChangeCurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentCurrency={currency.code}
      />
    </div>
  );
}
