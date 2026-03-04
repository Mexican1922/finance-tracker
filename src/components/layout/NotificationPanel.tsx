"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import {
  useNotifications,
  AppNotification,
  NotificationIcon,
} from "@/hooks/useNotifications";

const TYPE_STYLES = {
  warning: "bg-amber-500/10 text-amber-600",
  success: "bg-green-500/10 text-green-600",
  info: "bg-blue-500/10 text-blue-600",
};

const ICON_MAP: Record<NotificationIcon, React.ReactNode> = {
  trophy: <Trophy className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
  "trending-up": <TrendingUp className="h-5 w-5" />,
  lightbulb: <Lightbulb className="h-5 w-5" />,
};

function NotificationItem({ n }: { n: AppNotification }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-foreground/5 last:border-0 hover:bg-foreground/[0.02] transition-colors">
      <div
        className={`flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl text-base ${TYPE_STYLES[n.type]}`}
      >
        {ICON_MAP[n.icon]}
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

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, count } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        <span>Notifications</span>
        {count > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-full ml-2 top-0 z-50 w-80 glass-card overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-2 duration-200">
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

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <div className="text-3xl mb-3">✅</div>
                <p className="text-sm font-medium text-foreground">
                  All caught up!
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  No alerts right now. Your finances are looking good.
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
