"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  Megaphone,
  Users,
  WalletCards,
  Receipt,
  TrendingUp,
  PiggyBank,
  CreditCard,
  LogOut,
  X,
  ChevronRight,
  ChevronDown,
  Mail,
  UserRound,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  Shield,
  Lightbulb,
  Wrench,
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

const mainNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

const appNavigation = [
  {
    label: "App Version",
    href: "/app-version",
    icon: Smartphone,
  },
  {
    label: "Add Announcement",
    href: "/add-announcements",
    icon: Megaphone,
  },
  {
    label: "Add Financial Tip",
    href: "/add-financial-tips",
    icon: Lightbulb,
  },
  {
    label: "Add App Maintenance",
    href: "/add-maintenance",
    icon: Wrench,
  },
];

// Database folders with specific category icons
const databaseFolders = [
  {
    key: "admins",
    folderLabel: "Admin Management",
    folderIcon: Shield,
    item: {
      label: "Admins",
      href: "/admins",
      icon: Shield,
    },
  },
  {
    key: "appconfigs",
    folderLabel: "App Management",
    folderIcon: Smartphone,
    item: {
      label: "App Configurations",
      href: "/appconfigs",
      icon: Smartphone,
    },
  },
  {
    key: "announcements",
    folderLabel: "Announcement Management",
    folderIcon: Megaphone,
    item: {
      label: "Announcements",
      href: "/announcements",
      icon: Megaphone,
    },
  },
  {
    key: "financialtips",
    folderLabel: "Financial Tips Management",
    folderIcon: Lightbulb,
    item: {
      label: "Financial Tips",
      href: "/financial-tips",
      icon: Lightbulb,
    },
  },
  {
    key: "maintenance",
    folderLabel: "App Maintenance Management",
    folderIcon: Wrench,
    item: {
      label: "Add App Management",
      href: "/maintenance",
      icon: Lightbulb,
    },
  },
  {
    key: "users",
    folderLabel: "User Management",
    folderIcon: Users,
    item: {
      label: "Users",
      href: "/users",
      icon: Users,
    },
  },
  {
    key: "expenses",
    folderLabel: "Expense Management",
    folderIcon: Receipt,
    item: {
      label: "Expenses",
      href: "/expenses",
      icon: Receipt,
    },
  },
  {
    key: "incomes",
    folderLabel: "Income Management",
    folderIcon: TrendingUp,
    item: {
      label: "Income",
      href: "/incomes",
      icon: TrendingUp,
    },
  },
  {
    key: "budgets",
    folderLabel: "Budget Management",
    folderIcon: WalletCards,
    item: {
      label: "Budgets",
      href: "/budgets",
      icon: WalletCards,
    },
  },
  {
    key: "savings",
    folderLabel: "Savings Management",
    folderIcon: PiggyBank,
    item: {
      label: "Savings",
      href: "/savings",
      icon: PiggyBank,
    },
  },
  {
    key: "subscriptions",
    folderLabel: "Subscription Management",
    folderIcon: CreditCard,
    item: {
      label: "Subscriptions",
      href: "/subscriptions",
      icon: CreditCard,
    },
  },
  {
    key: "feedbacks",
    folderLabel: "Feedback Management",
    folderIcon: MessageSquare,
    item: {
      label: "Feedbacks",
      href: "/feedbacks",
      icon: MessageSquare,
    },
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

  // Dynamic open states for folders
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    admins: false,
    users: false,
    expenses: false,
    incomes: false,
    budgets: false,
    savings: false,
    subscriptions: false,
    feedbacks: false,
  });

  // Auto-expand folder if current route matches its child route
  useEffect(() => {
    const activeFolder = databaseFolders.find((folder) =>
      pathname.startsWith(folder.item.href),
    );
    if (activeFolder) {
      setOpenFolders((prev) => ({
        ...prev,
        [activeFolder.key]: true,
      }));
    }
  }, [pathname]);

  const toggleFolder = (key: string) => {
    setOpenFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        const response: AdminResponse = await adminApi("/admin/auth/me");
        if (mounted) {
          setAdmin(response.admin);
        }
      } catch {
        /* Intentionally ignored */
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

  // Lock body scroll when logout modal is active
  useEffect(() => {
    document.body.style.overflow = logoutOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [logoutOpen]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleNavigation = () => {
    onClose?.();
  };

  const handleLogout = () => {
    setLoggingOut(true);
    localStorage.removeItem("fintrack_admin_token");
    localStorage.removeItem("fintrack_admin");
    router.replace("/login");
  };

  useEffect(() => {
    if (!logoutOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loggingOut) {
        setLogoutOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [logoutOpen, loggingOut]);

  const adminName = admin?.name?.trim() || "Administrator";
  const adminEmail = admin?.email?.trim() || "admin@fintrack.com";
  const adminInitials =
    admin?.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  const renderNavItem = (
    item: { label: string; href: string; icon: ElementType },
    isNested = false,
  ) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleNavigation}
        className={`group relative flex min-h-[52px] cursor-pointer items-center gap-4 rounded-2xl px-4 transition-all duration-200 ${
          active
            ? "bg-zinc-950 text-white shadow-lg shadow-zinc-950/10 font-bold"
            : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 font-semibold"
        } ${isNested ? "ml-4" : ""}`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-emerald-500" />
        )}

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            active
              ? "bg-white/15 text-white"
              : "text-zinc-500 group-hover:bg-white group-hover:text-zinc-900 group-hover:shadow-sm"
          }`}
        >
          <Icon size={21} strokeWidth={active ? 2.3 : 2} />
        </span>

        <span className="min-w-0 flex-1 truncate text-base tracking-tight">
          {item.label}
        </span>

        {active && (
          <ChevronRight size={18} className="shrink-0 text-white/50" />
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
        className={`relative flex w-[300px] shrink-0 flex-col overflow-hidden border-r border-zinc-200/80 bg-white ${
          mobile
            ? "h-dvh w-full max-w-[340px]"
            : "sticky top-0 hidden h-dvh lg:flex"
        }`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-zinc-100/70 blur-3xl" />

        {/* Brand Header */}
        <div className="relative flex h-[84px] shrink-0 items-center justify-between border-b border-zinc-100 px-6">
          <Link
            href="/dashboard"
            onClick={handleNavigation}
            className="group flex min-w-0 cursor-pointer items-center gap-3.5"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl shadow-zinc-950/15 transition-transform duration-200 group-hover:scale-[1.03]">
              <span className="text-xl font-black tracking-tight">F</span>
              <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-lg font-black tracking-tight text-zinc-950">
                  FinTrack
                </p>
                <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-700">
                  Admin
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs font-medium text-zinc-400">
                Control Center
              </p>
            </div>
          </Link>

          {mobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="ml-3 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-950 active:scale-95"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 [scrollbar-width:thin]">
          {/* Main Menu */}
          <section>
            <div className="mb-3.5 flex items-center gap-2 px-3">
              <span className="h-px w-3 bg-zinc-200" />
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-zinc-400">
                Main Menu
              </p>
            </div>
            <div className="space-y-1.5">
              {mainNavigation.map((item) => renderNavItem(item))}
            </div>
          </section>

          {/* App Management Section */}
          <section className="mt-8">
            <div className="mb-3.5 flex items-center gap-2 px-3">
              <span className="h-px w-3 bg-zinc-200" />

              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-zinc-400">
                App Management
              </p>
            </div>

            <div className="space-y-1.5">
              {appNavigation.map((item) => renderNavItem(item))}
            </div>
          </section>

          {/* Database Section */}
          <section className="mt-8">
            <div className="mb-3.5 flex items-center gap-2 px-3">
              <span className="h-px w-3 bg-zinc-200" />
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-zinc-400">
                Database
              </p>
            </div>

            <div className="space-y-2">
              {databaseFolders.map((folder) => {
                const folderActive = isActive(folder.item.href);
                const isOpen = Boolean(openFolders[folder.key]);
                const FolderIcon = folder.folderIcon;

                return (
                  <div key={folder.key} className="space-y-1.5">
                    {/* Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleFolder(folder.key)}
                      className={`group flex min-h-[50px] w-full cursor-pointer items-center justify-between rounded-2xl px-4 text-base font-bold transition-all duration-200 ${
                        folderActive
                          ? "bg-zinc-100/90 text-zinc-950"
                          : "text-zinc-700 hover:bg-zinc-100/60 hover:text-zinc-950"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-white group-hover:shadow-sm">
                          <FolderIcon size={20} strokeWidth={2} />
                        </span>
                        <span className="truncate text-sm font-bold tracking-tight">
                          {folder.folderLabel}
                        </span>
                      </div>
                      <span className="text-zinc-400 group-hover:text-zinc-800">
                        {isOpen ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </span>
                    </button>

                    {/* Dynamic Collapsible Item */}
                    {isOpen && (
                      <div className="relative mt-1 pl-3 transition-all">
                        <div className="absolute left-6 top-2 bottom-4 w-px bg-zinc-200/80" />
                        {renderNavItem(folder.item, true)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </nav>

        {/* Bottom Profile Card & Logout */}
        <div className="relative shrink-0 border-t border-zinc-100 bg-zinc-50/70 p-4">
          {/* Admin Profile Card */}
          <div className="group relative mb-3">
            <Link
              href="/profile"
              onClick={handleNavigation}
              aria-label="View Admin User Detail Profile"
              className={`block cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 ${
                pathname === "/profile"
                  ? "border-zinc-300 shadow-md ring-2 ring-zinc-950/5"
                  : "border-zinc-200/80 hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-sm font-black text-white shadow-md">
                  {adminLoading ? (
                    <div className="h-4 w-4 animate-pulse rounded bg-white/20" />
                  ) : (
                    adminInitials
                  )}
                  <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="min-w-0 flex-1">
                  {adminLoading ? (
                    <>
                      <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
                      <div className="mt-1.5 h-3 w-36 animate-pulse rounded bg-zinc-100" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-base font-bold text-zinc-950">
                          {adminName}
                        </p>
                        <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700">
                          Super
                        </span>
                      </div>

                      <div className="mt-1 flex min-w-0 items-center gap-1.5">
                        <Mail size={13} className="shrink-0 text-zinc-400" />
                        <p className="truncate text-xs font-medium text-zinc-500">
                          {adminEmail}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <ChevronRight
                  size={18}
                  className={`shrink-0 transition-all duration-200 ${
                    pathname === "/profile"
                      ? "translate-x-0.5 text-zinc-800"
                      : "text-zinc-300 group-hover:translate-x-0.5 group-hover:text-zinc-700"
                  }`}
                />
              </div>
            </Link>

            {/* Profile Tooltip */}
            <div
              className="
                pointer-events-none absolute bottom-full left-1/2 z-[80] mb-3 w-[260px]
                -translate-x-1/2 translate-y-1 rounded-2xl border border-zinc-800 bg-zinc-950
                p-4 text-white opacity-0 shadow-2xl transition-all duration-200
                group-hover:translate-y-0 group-hover:opacity-100
              "
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <UserRound size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold">Admin Profile Info</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                    Manage system privileges, view account metrics, and security
                    credentials.
                  </p>
                </div>
              </div>
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-zinc-950" />
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="group flex min-h-[50px] w-full cursor-pointer items-center gap-4 rounded-2xl px-4 text-base font-bold text-zinc-700 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100/80 transition-colors group-hover:bg-red-100 group-hover:text-red-600">
              <LogOut size={19} />
            </span>
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
    ENHANCED DANGER LOGOUT MODAL
====================================================== */}
      {logoutOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-red-200/80 bg-white p-7 shadow-2xl transition-all">
            {/* Pulsing Gradient Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-500" />

            <div className="flex items-start gap-4.5">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100/80 text-red-600 shadow-inner ring-4 ring-red-50">
                <ShieldAlert size={28} strokeWidth={2.2} />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
                  <AlertTriangle size={11} strokeWidth={2.5} />
                </span>
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <h3
                    id="logout-title"
                    className="text-xl font-extrabold tracking-tight text-zinc-950"
                  >
                    Confirm Sign Out
                  </h3>
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-600">
                  Are you sure you want to exit the FinTrack Control Center?
                  Your active admin session will be terminated immediately.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
                aria-label="Close modal"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-7 flex items-center justify-end gap-3 border-t border-zinc-100 pt-2">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
                className="min-h-[46px] cursor-pointer rounded-xl border border-zinc-200 bg-white px-5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="group relative flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-red-600/40 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                <LogOut
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
                <span>{loggingOut ? "Signing out..." : "Yes, Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
