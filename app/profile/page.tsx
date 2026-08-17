"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  User,
  BadgeCheck,
  LockKeyhole,
  Sparkles,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Admin = {
  _id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "superadmin" | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AdminResponse = {
  success: boolean;
  admin: Admin;
};

const formatDate = (date?: string) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date?: string) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRole = (role?: string) => {
  if (!role) {
    return "Administrator";
  }

  if (role === "superadmin") {
    return "Super Admin";
  }

  if (role === "admin") {
    return "Admin";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
};

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<Admin | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadAdmin = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response: AdminResponse = await adminApi("/admin/auth/me");

      setAdmin(response.admin);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load administrator profile.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f6] px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1380px] space-y-8">
          <div className="h-10 w-32 animate-pulse rounded-xl bg-zinc-200" />

          <div className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
            <div className="h-10 w-72 animate-pulse rounded-lg bg-zinc-200" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded bg-zinc-200" />
          </div>

          <div className="h-48 animate-pulse rounded-[28px] bg-zinc-200" />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f7f6] px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1380px]">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => loadAdmin(true)}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!admin) {
    return (
      <main className="min-h-screen bg-[#f7f7f6] px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1380px]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-zinc-500">
              Administrator profile not found.
            </p>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <ArrowLeft size={15} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const initials =
    admin.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  const role = formatRole(admin.role);

  return (
    <main className="min-h-screen bg-[#f7f7f6] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-[1380px] space-y-8 lg:space-y-10">
        {/* =========================================================
            TOP NAVIGATION
        ========================================================== */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              <span>Back to Dashboard</span>
            </Link>

            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Administration
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                  Administrator Profile
                </h1>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Review your FinTrack administration account, access level, and
                security information.
              </p>
            </div>
          </div>

          {/* Top actions */}
          <div className="flex w-full items-center gap-2 sm:w-auto sm:self-start">
            <button
              type="button"
              onClick={() => loadAdmin(true)}
              disabled={refreshing}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing" : "Refresh"}
            </button>

            <div
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-medium sm:flex-none ${
                admin.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  admin.isActive ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              {admin.isActive ? "Account Active" : "Account Inactive"}
            </div>
          </div>
        </header>

        {/* =========================================================
            PROFILE HERO
        ========================================================== */}
        <section className="relative overflow-hidden rounded-[28px] border border-zinc-800 bg-[#0c0c0e] text-white shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-white/[0.045] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-white/[0.025] blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-7 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-white/10 bg-white text-xl font-semibold tracking-tight text-zinc-950 shadow-2xl sm:h-24 sm:w-24 sm:text-2xl">
                  {initials}
                </div>

                <span className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[4px] border-[#0c0c0e] bg-emerald-500 shadow-lg">
                  <CheckCircle2 size={13} className="text-white" />
                </span>
              </div>

              {/* Identity */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                    {admin.name || "Administrator"}
                  </h2>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-medium text-white/75">
                    <ShieldCheck size={11} />
                    {role}
                  </span>
                </div>

                <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-white/50">
                  <Mail size={15} className="shrink-0" />

                  <span className="min-w-0 truncate">
                    {admin.email || "No email available"}
                  </span>
                </div>
              </div>

              {/* Security */}
              <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3.5 md:w-auto md:min-w-[210px]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
                  <LockKeyhole size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">
                    Secure Account
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-white/40">
                    Administrator access protected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ACCOUNT DETAILS
        ========================================================== */}
        <section>
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-zinc-950">
                Account Details
              </h2>

              <ChevronRight size={15} className="text-zinc-300" />
            </div>

            <p className="mt-1 text-xs text-zinc-400">
              Administrator account information and access details.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-zinc-950 group-hover:text-white">
                  <User size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    Full Name
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-zinc-900">
                    {admin.name || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-zinc-950 group-hover:text-white">
                  <Mail size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    Email Address
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-zinc-900">
                    {admin.email || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition group-hover:bg-zinc-950 group-hover:text-white">
                  <BadgeCheck size={18} />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    Access Level
                  </p>

                  <p className="mt-2 text-sm font-semibold text-zinc-900">
                    {role}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    admin.isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    Account Status
                  </p>

                  <p className="mt-2 text-sm font-semibold text-zinc-900">
                    {admin.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ACCOUNT INFORMATION
        ========================================================== */}
        <section>
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-zinc-950">
                Account Information
              </h2>

              <ChevronRight size={15} className="text-zinc-300" />
            </div>

            <p className="mt-1 text-xs text-zinc-400">
              Administrative account timestamps and activity.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Created */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    Account Created
                  </p>

                  <p className="mt-2 text-sm font-semibold text-zinc-900">
                    {formatDate(admin.createdAt)}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-400">
                    {formatDateTime(admin.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Updated */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    Last Account Update
                  </p>

                  <p className="mt-2 text-sm font-semibold text-zinc-900">
                    {formatDate(admin.updatedAt)}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-400">
                    {formatDateTime(admin.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECURITY NOTICE
        ========================================================== */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <ShieldCheck size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-950">
                Administrator Access
              </h3>

              <p className="mt-1.5 max-w-3xl text-xs leading-5 text-zinc-500">
                This account has access to the FinTrack administration platform,
                including users, budgets, expenses, income, savings, and
                subscriptions.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom breathing space */}
        <div className="h-2 sm:h-4" />
      </div>
    </main>
  );
}
