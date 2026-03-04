"use client";

import Link from "next/link";
import { Home, CreditCard, Target, PieChart, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Transact", href: "/transactions", icon: CreditCard },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Review", href: "/review", icon: PieChart },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass pb-safe pt-2 sm:hidden flex flex-col items-center">
      <div className="flex items-center justify-around px-2 pb-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center p-2 text-foreground/60 transition-colors hover:text-foreground active:scale-95"
            >
              <Icon className="h-6 w-6 mb-1" strokeWidth={2.5} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
