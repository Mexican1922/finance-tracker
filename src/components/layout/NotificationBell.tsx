"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell,
  Trophy,
  Target,
  CalendarClock,
  TrendingUp,
  Lightbulb,
  CheckCheck,
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

const STORAGE_KEY = "ft_read_notifications";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

function NotificationItem({
  n,
  isRead,
  onMarkRead,
}: {
  n: AppNotification;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}) {
  const Icon = ICON_MAP[n.icon];
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-foreground/5 last:border-0 transition-colors cursor-pointer ${
        isRead
          ? "opacity-50 hover:opacity-70 hover:bg-foreground/[0.01]"
          : "hover:bg-foreground/[0.03]"
      }`}
      onClick={() => onMarkRead(n.id)}
    >
      <div
        className={`flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl ${TYPE_STYLES[n.type]} ${isRead ? "opacity-60" : ""}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-semibold text-foreground ${isRead ? "font-normal" : ""}`}
          >
            {n.title}
          </p>
          {!isRead && (
            <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
          )}
        </div>
        <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">
          {n.message}
        </p>
        {!isRead && (
          <p className="text-[10px] text-foreground/30 mt-1">
            Tap to mark as read
          </p>
        )}
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { notifications } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  // Load read IDs from localStorage on mount
  useEffect(() => {
    setReadIds(getReadIds());
  }, []);

  // Mark a single notification as read
  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  // Mark all as read
  const markAllRead = useCallback(() => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    saveReadIds(allIds);
  }, [notifications]);

  // Auto-mark all as read when panel is opened
  // (but we'll keep a brief delay so user sees the unread dots first)
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

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
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 glass-card overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/5 bg-foreground/[0.02]">
            <h4 className="font-semibold text-sm tracking-tight">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            {unreadCount === 0 && notifications.length > 0 && (
              <span className="text-xs text-foreground/40">
                All caught up ✓
              </span>
            )}
          </div>

          {/* Notification list */}
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
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  isRead={readIds.has(n.id)}
                  onMarkRead={markRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
