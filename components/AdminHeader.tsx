"use client";

import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, ChevronRight, Circle } from "lucide-react";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/budgets": "Budgets",
  "/expenses": "Expenses",
  "/incomes": "Income",
  "/savings": "Savings",
  "/subscriptions": "Subscriptions",
};

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();

  const currentPage =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(path),
    )?.[1] ||
    "Administration";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* =========================
          MOBILE MENU
      ========================== */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-950 lg:hidden"
      >
        <Menu size={19} />
      </button>

      {/* =========================
          DESKTOP BREADCRUMB
      ========================== */}
      <div className="hidden min-w-0 items-center gap-2 lg:flex">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
            Administration
          </p>

          <div className="mt-0.5 flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-zinc-950">
              {currentPage}
            </h1>

            <ChevronRight size={13} className="text-zinc-300" />

            <span className="text-xs text-zinc-400">FinTrack platform</span>
          </div>
        </div>
      </div>

      {/* =========================
          MOBILE BRAND
      ========================== */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
            <span className="text-xs font-semibold">F</span>
          </div>

          <div className="text-left">
            <p className="text-[13px] font-semibold leading-none tracking-tight text-zinc-950">
              FinTrack
            </p>

            <p className="mt-1 text-[9px] leading-none text-zinc-400">Admin</p>
          </div>
        </div>
      </div>

      {/* =========================
          RIGHT SIDE
      ========================== */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Status */}
        <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 sm:flex">
          <Circle size={7} fill="currentColor" className="text-emerald-500" />

          <span className="text-[10px] font-medium text-zinc-500">
            System operational
          </span>
        </div>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-zinc-200 sm:block" />

        {/* Admin profile */}
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold leading-tight text-zinc-900">
              Admin
            </p>

            <p className="mt-0.5 text-[10px] text-zinc-400">Super Admin</p>
          </div>

          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm">
            <ShieldCheck
              size={18}
              strokeWidth={1.9}
              className="text-zinc-700"
            />

            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
