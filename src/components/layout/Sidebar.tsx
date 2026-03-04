"use client";

import Link from "next/link";
import {
  Home,
  CreditCard,
  Target,
  PieChart,
  Settings,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Review", href: "/review", icon: PieChart },
];

export default function Sidebar() {
  return (
    <aside className="hidden mt-6 mb-6 ml-6 w-64 flex-col justify-between rounded-3xl p-6 glass-card sm:flex">
      <div>
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-accent/5 backdrop-blur-sm p-1.5 shadow-lg border border-foreground/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Finance Tracker Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Finance Tracker
          </h2>
        </div>
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <User className="h-5 w-5" />
          Profile
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
