"use client";

import { ReactNode, useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { useRouter } from "next/navigation";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  /* =========================================================
     AUTH CHECK
  ========================================================== */
  useEffect(() => {
    const token = localStorage.getItem("fintrack_admin_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  /* =========================================================
     ESCAPE + BODY SCROLL LOCK
  ========================================================== */
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* =========================================================
     LOADING
  ========================================================== */
  if (checkingAuth) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f7f6]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-[#f7f7f6]">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <AdminSidebar />

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-default bg-black/35 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <div className="relative h-dvh w-[min(272px,88vw)] max-w-full shadow-2xl">
            <AdminSidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN APPLICATION
      ====================================================== */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
