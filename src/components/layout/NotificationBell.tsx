"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Trophy,
  Target,
  CalendarClock,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import {
  useNotifications,
  AppNotification,
  NotificationIcon,
} from "@/hooks/useNotifications";

const ICON_MAP: Record<
  NotificationIcon,
  React.ComponentType<{ className?: string }>
> = {
  trophy: Trophy,
  target: Target,
  calendar: CalendarClock,
  "trending-up": TrendingUp,
  lightbulb: Lightbulb,
};

const TYPE_STYLES = {
  warning: "bg-amber-500/10 text-amber-600",
  success: "bg-green-500/10 text-green-600",
  info: "bg-blue-500/10 text-blue-600",
};

function NotificationItem({ n }: { n: AppNotification }) {
  const Icon = ICON_MAP[n.icon];
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.02] transition-colors">
      <div
        className={`flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl ${TYPE_STYLES[n.type]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{n.title}</p>
        <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">
          {n.message}
        </p>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, count } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-background/80 backdrop-blur-md border border-foreground/10 text-foreground/70 shadow-sm transition-all hover:bg-background hover:text-foreground hover:shadow-md cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 glass-card overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/5 bg-foreground/[0.02]">
            <h4 className="font-semibold text-sm tracking-tight">
              Notifications
            </h4>
            {count > 0 && (
              <span className="text-xs font-medium text-foreground/50">
                {count} alert{count > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <Bell className="h-8 w-8 text-foreground/20 mb-3" />
                <p className="text-sm font-medium text-foreground">
                  All caught up!
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  No alerts right now. Your finances are looking great.
                </p>
              </div>
            ) : (
              notifications.map((n) => <NotificationItem key={n.id} n={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
