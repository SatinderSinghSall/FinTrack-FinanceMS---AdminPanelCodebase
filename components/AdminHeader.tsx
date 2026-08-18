"use client";

import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, ChevronRight } from "lucide-react";

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
    <header className="sticky top-0 z-30 flex h-[84px] shrink-0 items-center border-b border-zinc-200/80 bg-white/90 px-6 backdrop-blur-xl sm:px-8">
      {/* =========================
          MOBILE MENU
      ========================== */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-950 active:scale-95 lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* =========================
          DESKTOP BREADCRUMB
      ========================== */}
      <div className="hidden min-w-0 items-center gap-2 lg:flex">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-400">
            Administration
          </p>

          <div className="mt-1 flex items-center gap-2.5">
            <h1 className="text-base font-extrabold tracking-tight text-zinc-950">
              {currentPage}
            </h1>

            <ChevronRight size={15} className="text-zinc-300" />

            <span className="text-sm font-medium text-zinc-400">
              FinTrack platform
            </span>
          </div>
        </div>
      </div>

      {/* =========================
          MOBILE BRAND
      ========================== */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
            <span className="text-sm font-black">F</span>
          </div>

          <div className="text-left">
            <p className="text-base font-black leading-none tracking-tight text-zinc-950">
              FinTrack
            </p>
            <p className="mt-1 text-[10px] font-extrabold uppercase leading-none text-zinc-400">
              Admin
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          RIGHT SIDE
      ========================== */}
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        {/* Status Chip */}
        <div className="hidden items-center gap-2.5 rounded-full border border-zinc-200/80 bg-zinc-50/80 px-3.5 py-1.5 shadow-sm sm:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>

          <span className="text-xs font-bold text-zinc-600">
            System operational
          </span>
        </div>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-zinc-200 sm:block" />

        {/* Admin profile */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-extrabold leading-tight text-zinc-950">
              Admin
            </p>
            <p className="mt-0.5 text-xs font-semibold text-zinc-400">
              Super Admin
            </p>
          </div>

          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm transition-transform hover:scale-[1.02]">
            <ShieldCheck size={20} strokeWidth={2} className="text-zinc-800" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
