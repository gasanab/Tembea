"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BellRing,
  CalendarCheck,
  Check,
  CheckCheck,
  CheckCircle2,
  CircleAlert,
  Info,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import type { Notification, NotificationType } from "@/types/api.types";

const iconMap: Record<NotificationType, LucideIcon> = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ERROR: CircleAlert,
};

const statusColors: Record<NotificationType, string> = {
  INFO: "bg-blue-100 text-blue-700",
  SUCCESS: "bg-emerald-100 text-emerald-700",
  WARNING: "bg-amber-100 text-amber-700",
  ERROR: "bg-red-100 text-red-700",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get<Notification[]>("/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      setActionError("");
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      setActionError("The notification could not be updated.");
    }
  };

  const markAllRead = async () => {
    try {
      setActionError("");
      await apiClient.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      setActionError("Notifications could not be marked as read.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <RoleGuard>
      <main className="section-pad tourism-surface">
      <div className="tembea-container grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="dashboard-card stack-md p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <p className="section-kicker">Notifications</p>
              <h1 className="text-4xl font-black">Account updates</h1>
              <p className="mt-2 text-muted">
                Booking, payment and account notices from Tembea.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-[#145A32] text-white text-xs font-black">
                  {unreadCount} unread
                </span>
              )}
              <span className="centered h-12 w-12 rounded-tembea bg-tembea-light text-tembea-dark">
                <BellRing size={23} />
              </span>
            </div>
          </div>

          {/* Actions */}
          {isAuthenticated && unreadCount > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 text-sm font-bold text-[#145A32] hover:underline"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            </div>
          )}

          {actionError && (
            <p
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700"
              role="alert"
            >
              {actionError}
            </p>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={40} className="animate-spin text-[#145A32] mb-3" />
              <p className="text-muted font-semibold">Loading notifications...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <h2 className="text-xl font-black text-gray-900 mb-2">Failed to load</h2>
              <p className="text-muted text-sm mb-4">{error}</p>
              <button onClick={fetchNotifications} className="btn-base btn-dark inline-flex">
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {isAuthenticated && !isLoading && !error && notifications.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#D5F5E3] flex items-center justify-center mx-auto mb-4">
                <BellRing size={28} className="text-[#145A32]" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">No notifications yet</h2>
              <p className="text-muted text-sm">
                You'll see booking confirmations, trip reminders, and recommendations here.
              </p>
            </div>
          )}

          {/* Notifications List */}
          {isAuthenticated && !isLoading && notifications.length > 0 && (
            <div className="grid gap-3">
              {notifications.map((item) => {
                const Icon = iconMap[item.type] || Info;
                const colorClass = statusColors[item.type] || statusColors.INFO;
                return (
                  <article
                    key={item.id}
                    className={`grid gap-3 rounded-tembea border p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center transition-all ${
                      item.read
                        ? "bg-white border-gray-100"
                        : "bg-emerald-50 border-[#D5F5E3]"
                    }`}
                  >
                    <span className={`centered h-11 w-11 rounded-tembea ${colorClass}`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-black">{item.title}</h2>
                        {!item.read && (
                          <span className="availability-pill bg-emerald-100 text-emerald-700">New</span>
                        )}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">{item.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-bold text-muted">
                        {timeAgo(item.createdAt)}
                      </span>
                      {!item.read && (
                        <button
                          onClick={() => markRead(item.id)}
                          className="flex items-center gap-1 text-xs font-bold text-[#145A32] hover:underline"
                        >
                          <Check size={12} /> Mark read
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="dashboard-card h-fit stack-md p-5">
          <h2 className="text-2xl font-black">Notification settings</h2>
          <p className="text-sm text-muted">
            Delivery-channel controls are not available yet. This page shows
            notifications stored on your Tembea account.
          </p>
          <Link className="btn-base btn-dark" href="/settings">
            View account settings
          </Link>
          <div className="mt-4 p-4 rounded-xl bg-[#D5F5E3] border border-[#2ECC71]/30">
            <h3 className="font-black text-[#145A32] text-sm mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={user?.role === "CLIENT" ? "/client/bookings" : user?.role === "PARTNER" ? "/partner/bookings" : "/admin/bookings"}
                className="flex items-center gap-2 text-sm font-bold text-[#145A32] hover:underline"
              >
                <CalendarCheck size={14} /> View My Bookings
              </Link>
              <Link
                href={user?.role === "CLIENT" ? "/client" : user?.role === "PARTNER" ? "/partner" : "/admin"}
                className="flex items-center gap-2 text-sm font-bold text-[#145A32] hover:underline"
              >
                <BellRing size={14} /> Go to Dashboard
              </Link>
            </div>
          </div>
        </aside>
        </div>
      </main>
    </RoleGuard>
  );
}
