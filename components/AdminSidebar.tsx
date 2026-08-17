"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  WalletCards,
  Receipt,
  TrendingUp,
  PiggyBank,
  CreditCard,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Mail,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ElementType } from "react";

import { adminApi } from "@/lib/api";

type AdminSidebarProps = {
  mobile?: boolean;
  onClose?: () => void;
};

type Admin = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
};

type AdminResponse = {
  success: boolean;
  admin: Admin;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

const databaseNavigation = [
  {
    label: "Users",
    href: "/users",
    icon: Users,
  },
  {
    label: "Budgets",
    href: "/budgets",
    icon: WalletCards,
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    label: "Income",
    href: "/incomes",
    icon: TrendingUp,
  },
  {
    label: "Savings",
    href: "/savings",
    icon: PiggyBank,
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
];

export default function AdminSidebar({
  mobile = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [admin, setAdmin] = useState<Admin | null>(null);

  const [adminLoading, setAdminLoading] = useState(true);

  /*
   * -------------------------------------------------------
   * LOAD ADMIN PROFILE
   * -------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        const response: AdminResponse = await adminApi("/admin/auth/me");

        if (mounted) {
          setAdmin(response.admin);
        }
      } catch {
        /*
         * We intentionally don't show an error inside
         * the sidebar. The profile page handles errors.
         */
      } finally {
        if (mounted) {
          setAdminLoading(false);
        }
      }
    };

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * -------------------------------------------------------
   * ACTIVE ROUTE
   * -------------------------------------------------------
   */

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  /*
   * -------------------------------------------------------
   * NAVIGATION
   * -------------------------------------------------------
   */

  const handleNavigation = () => {
    onClose?.();
  };

  /*
   * -------------------------------------------------------
   * LOGOUT
   * -------------------------------------------------------
   */

  const handleLogout = () => {
    setLoggingOut(true);

    localStorage.removeItem("fintrack_admin_token");
    localStorage.removeItem("fintrack_admin");

    router.replace("/login");
  };

  /*
   * -------------------------------------------------------
   * ESCAPE KEY
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!logoutOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loggingOut) {
        setLogoutOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [logoutOpen, loggingOut]);

  /*
   * -------------------------------------------------------
   * ADMIN NAME / INITIALS
   * -------------------------------------------------------
   */

  const adminName = admin?.name?.trim() || "Administrator";

  const adminEmail = admin?.email?.trim() || "Admin account";

  const adminInitials =
    admin?.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  /*
   * -------------------------------------------------------
   * NAV ITEM
   * -------------------------------------------------------
   */

  const renderNavItem = (item: {
    label: string;
    href: string;
    icon: ElementType;
  }) => {
    const Icon = item.icon;

    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleNavigation}
        className={`group relative flex min-h-[46px] items-center gap-3 rounded-xl px-3 transition-all duration-200 ${
          active
            ? "bg-zinc-950 text-white shadow-[0_7px_20px_rgba(0,0,0,0.12)]"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
        }`}
      >
        {/* Active indicator */}
        {active && (
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
        )}

        {/* Icon */}
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            active
              ? "bg-white/10 text-white"
              : "text-zinc-500 group-hover:bg-white group-hover:text-zinc-900"
          }`}
        >
          <Icon size={17} strokeWidth={active ? 2.2 : 1.9} />
        </span>

        {/* Label */}
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
          {item.label}
        </span>

        {/* Active arrow */}
        {active && (
          <ChevronRight size={15} className="shrink-0 text-white/60" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`relative flex w-[272px] shrink-0 flex-col overflow-hidden border-r border-zinc-200/80 bg-white ${
          mobile ? "h-dvh" : "sticky top-0 hidden h-dvh lg:flex"
        }`}
      >
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-zinc-100/70 blur-3xl" />

        {/* =================================================
            BRAND
        ================================================== */}

        <div className="relative flex h-[76px] shrink-0 items-center justify-between border-b border-zinc-100 px-5">
          <Link
            href="/dashboard"
            onClick={handleNavigation}
            className="group flex min-w-0 items-center gap-3"
          >
            {/* Logo */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-900/10 transition-transform duration-200 group-hover:scale-[1.03]">
              <span className="text-base font-semibold">F</span>

              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
            </div>

            {/* Brand */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-semibold tracking-tight text-zinc-950">
                  FinTrack
                </p>

                <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">
                  Admin
                </span>
              </div>

              <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                Financial platform
              </p>
            </div>
          </Link>

          {/* Mobile close */}
          {mobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-950 active:scale-95"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}

        <nav className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 [scrollbar-width:thin]">
          {/* Main */}
          <section>
            <div className="mb-2 flex items-center gap-2 px-3">
              <span className="h-px w-3 bg-zinc-200" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Main
              </p>
            </div>

            <div className="space-y-1">{navigation.map(renderNavItem)}</div>
          </section>

          {/* Database */}
          <section className="mt-7">
            <div className="mb-2 flex items-center gap-2 px-3">
              <span className="h-px w-3 bg-zinc-200" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Database
              </p>
            </div>

            <div className="space-y-1">
              {databaseNavigation.map(renderNavItem)}
            </div>
          </section>
        </nav>

        {/* =================================================
            BOTTOM ADMIN AREA
        ================================================== */}

        <div className="relative shrink-0 border-t border-zinc-100 bg-zinc-50/70 p-3">
          {/* =================================================
              ADMIN PROFILE CARD
          ================================================== */}

          <div className="group relative mb-2">
            <Link
              href="/profile"
              onClick={handleNavigation}
              aria-label="View Admin User Detail Profile"
              className={`block rounded-2xl border bg-white p-3 shadow-sm transition-all duration-200 ${
                pathname === "/profile"
                  ? "border-zinc-300 shadow-md"
                  : "border-zinc-200/80 hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-xs font-semibold text-white shadow-sm">
                  {adminLoading ? (
                    <div className="h-4 w-4 animate-pulse rounded bg-white/20" />
                  ) : (
                    adminInitials
                  )}

                  {/* Online indicator */}
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                {/* Admin details */}
                <div className="min-w-0 flex-1">
                  {adminLoading ? (
                    <>
                      <div className="h-3.5 w-24 animate-pulse rounded bg-zinc-100" />

                      <div className="mt-1.5 h-2.5 w-32 animate-pulse rounded bg-zinc-100" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-semibold text-zinc-950">
                          {adminName}
                        </p>

                        <span className="shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">
                          Admin
                        </span>
                      </div>

                      <div className="mt-1 flex min-w-0 items-center gap-1.5">
                        <Mail size={10} className="shrink-0 text-zinc-400" />

                        <p className="truncate text-[10px] text-zinc-400">
                          {adminEmail}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={15}
                  className={`shrink-0 transition-all duration-200 ${
                    pathname === "/profile"
                      ? "translate-x-0.5 text-zinc-600"
                      : "text-zinc-300 group-hover:translate-x-0.5 group-hover:text-zinc-500"
                  }`}
                />
              </div>
            </Link>

            {/* =================================================
                PROFILE TOOLTIP
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-full
                left-1/2
                z-[80]
                mb-2
                w-[230px]
                -translate-x-1/2
                translate-y-1
                rounded-xl
                border
                border-zinc-800
                bg-zinc-950
                px-3.5
                py-3
                text-white
                opacity-0
                shadow-2xl
                transition-all
                duration-200
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <UserRound size={14} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold">
                    Admin User Detail Profile
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-zinc-400">
                    View your administrator account details, email, role and
                    account information.
                  </p>
                </div>
              </div>

              {/* Tooltip arrow */}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-zinc-950" />
            </div>
          </div>

          {/* =================================================
              LOGOUT
          ================================================== */}

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="group flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.99]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-red-100">
              <LogOut size={17} />
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          LOGOUT CONFIRMATION MODAL
      ====================================================== */}

      {logoutOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          onMouseDown={() => {
            if (!loggingOut) {
              setLogoutOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-5 sm:p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={21} strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id="logout-title"
                  className="text-base font-semibold tracking-tight text-zinc-950"
                >
                  Sign out of Admin Panel?
                </h2>

                <p className="mt-1.5 text-sm leading-5 text-zinc-500">
                  You will need to sign in again to access the FinTrack
                  administration panel.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
                aria-label="Close confirmation"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100" />

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2 bg-zinc-50/70 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
                className="min-h-[42px] rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="min-h-[42px] rounded-xl bg-red-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
