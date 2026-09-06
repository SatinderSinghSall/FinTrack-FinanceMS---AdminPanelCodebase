"use client";

import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Info,
  LockKeyhole,
  Settings2,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Maintenance = {
  _id: string;
  enabled: boolean;
  title: string;
  message: string;
  allowUserAccess: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ViewMaintenanceModalProps = {
  maintenance: Maintenance | null;
  onClose: () => void;
};

/* ============================================================
   DATE FORMATTER
============================================================ */

const formatDateTime = (date?: string | null) => {
  if (!date) {
    return "Not configured";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ============================================================
   STATUS
============================================================ */

const getStatus = (maintenance: Maintenance) => {
  if (!maintenance.enabled) {
    return {
      label: "Disabled",
      description: "Maintenance mode is currently disabled.",
      icon: Settings2,
      accent: "zinc" as const,
    };
  }

  const now = new Date();

  const start = maintenance.startDate ? new Date(maintenance.startDate) : null;

  const end = maintenance.endDate ? new Date(maintenance.endDate) : null;

  if (start && !Number.isNaN(start.getTime()) && now < start) {
    return {
      label: "Scheduled",
      description: "Maintenance mode is enabled and scheduled to begin later.",
      icon: Clock3,
      accent: "blue" as const,
    };
  }

  if (end && !Number.isNaN(end.getTime()) && now > end) {
    return {
      label: "Expired",
      description: "The configured maintenance period has ended.",
      icon: CalendarDays,
      accent: "zinc" as const,
    };
  }

  return {
    label: "Active",
    description: "Maintenance mode is currently active.",
    icon: Wrench,
    accent: "amber" as const,
  };
};

/* ============================================================
   DETAIL ITEM
============================================================ */

const DetailItem = ({
  icon: Icon,
  label,
  value,
  description,
  fullWidth = false,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  description?: string;
  fullWidth?: boolean;
}) => {
  return (
    <div
      className={`group rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 transition-all duration-200 hover:border-zinc-300 hover:bg-white hover:shadow-sm ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors group-hover:text-zinc-800">
          <Icon size={17} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
            {label}
          </p>

          <div className="mt-1.5 break-words text-sm font-bold leading-5 text-zinc-900">
            {value}
          </div>

          {description && (
            <p className="mt-1 text-[11px] font-medium leading-5 text-zinc-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   STATUS BADGE
============================================================ */

const StatusBadge = ({
  label,
  type,
}: {
  label: string;
  type: "status" | "access";
}) => {
  if (type === "access") {
    const allowed = label === "Users Can Access";

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold ${
          allowed
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {allowed ? (
          <ShieldCheck size={12} strokeWidth={2.3} />
        ) : (
          <LockKeyhole size={12} strokeWidth={2.3} />
        )}

        {label}
      </span>
    );
  }

  const styles: Record<string, string> = {
    Active: "border-amber-200 bg-amber-50 text-amber-700",
    Scheduled: "border-blue-200 bg-blue-50 text-blue-700",
    Expired: "border-zinc-200 bg-zinc-100 text-zinc-600",
    Disabled: "border-zinc-200 bg-zinc-100 text-zinc-600",
  };

  const dots: Record<string, string> = {
    Active: "bg-amber-500",
    Scheduled: "bg-blue-500",
    Expired: "bg-zinc-400",
    Disabled: "bg-zinc-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold ${
        styles[label] ?? "border-zinc-200 bg-zinc-100 text-zinc-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dots[label] ?? "bg-zinc-400"}`}
      />

      {label}
    </span>
  );
};

/* ============================================================
   MAIN MODAL
============================================================ */

export default function ViewMaintenanceModal({
  maintenance,
  onClose,
}: ViewMaintenanceModalProps) {
  const [copied, setCopied] = useState(false);

  /* ==========================================================
     ESCAPE KEY
  ========================================================== */

  useEffect(() => {
    if (!maintenance) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [maintenance, onClose]);

  /* ==========================================================
     LOCK BACKGROUND SCROLL
  ========================================================== */

  useEffect(() => {
    if (!maintenance) return;

    const originalOverflow = document.body.style.overflow;

    const originalPaddingRight = document.body.style.paddingRight;

    /*
     * Prevent the page behind the modal from scrolling.
     */
    document.body.style.overflow = "hidden";

    /*
     * Prevent layout jump when browser scrollbar disappears.
     */
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;

      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [maintenance]);

  /* ==========================================================
     RESET COPY STATE
  ========================================================== */

  useEffect(() => {
    setCopied(false);
  }, [maintenance]);

  if (!maintenance) {
    return null;
  }

  const status = getStatus(maintenance);
  const StatusIcon = status.icon;

  /* ==========================================================
     COPY ID
  ========================================================== */

  const handleCopyId = async () => {
    if (!maintenance._id) return;

    try {
      await navigator.clipboard.writeText(maintenance._id);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  };

  /* ==========================================================
     ACCENT
  ========================================================== */

  const accentClasses = {
    Active: {
      top: "from-amber-500 via-orange-500 to-amber-300",
      icon: "border-amber-200 bg-amber-50 text-amber-600",
    },

    Scheduled: {
      top: "from-blue-500 via-indigo-500 to-blue-300",
      icon: "border-blue-200 bg-blue-50 text-blue-600",
    },

    Expired: {
      top: "from-zinc-700 via-zinc-500 to-zinc-300",
      icon: "border-zinc-200 bg-zinc-100 text-zinc-600",
    },

    Disabled: {
      top: "from-zinc-800 via-zinc-600 to-zinc-300",
      icon: "border-zinc-200 bg-zinc-100 text-zinc-600",
    },
  };

  const accent =
    accentClasses[status.label as keyof typeof accentClasses] ??
    accentClasses.Disabled;

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-zinc-950/70
        p-2
        backdrop-blur-md
        sm:p-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="maintenance-details-title"
    >
      {/* ======================================================
          MODAL CONTAINER

          IMPORTANT:
          No onMouseDown / onClick on backdrop.
          Clicking outside DOES NOT close modal.
      ======================================================= */}

      <div
        className="
          relative
          flex
          max-h-[94vh]
          w-full
          max-w-4xl
          flex-col
          overflow-hidden
          rounded-[1.5rem]
          border
          border-white/20
          bg-white
          shadow-[0_35px_100px_-25px_rgba(0,0,0,0.65)]
          sm:max-h-[92vh]
          sm:rounded-[2rem]
        "
      >
        {/* ====================================================
            TOP ACCENT
        ===================================================== */}

        <div
          className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent.top}`}
        />

        {/* ====================================================
            HEADER
        ===================================================== */}

        <header
          className="
            shrink-0
            border-b
            border-zinc-100
            bg-white
            px-4
            pb-4
            pt-5
            sm:px-7
            sm:pb-5
            sm:pt-6
          "
        >
          <div className="flex items-start justify-between gap-4">
            {/* Header left */}

            <div className="flex min-w-0 items-center gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm sm:h-12 sm:w-12 ${accent.icon}`}
              >
                <Wrench size={20} strokeWidth={1.9} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="maintenance-details-title"
                    className="
                      text-base
                      font-black
                      tracking-tight
                      text-zinc-950
                      sm:text-lg
                    "
                  >
                    Maintenance Details
                  </h2>

                  <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" />

                  <span className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 sm:block">
                    System Configuration
                  </span>
                </div>

                <p className="mt-1 text-xs font-medium leading-5 text-zinc-500 sm:text-sm">
                  Review the current maintenance configuration and user
                  experience.
                </p>
              </div>
            </div>

            {/* Close */}

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                shrink-0
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                border
                border-transparent
                text-zinc-400
                transition-all
                hover:border-zinc-200
                hover:bg-zinc-50
                hover:text-zinc-900
                active:scale-95
              "
              aria-label="Close maintenance details"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* ====================================================
            SCROLLABLE MODAL CONTENT

            ONLY THIS AREA SCROLLS.
        ===================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-4
            py-5
            [scrollbar-color:#d4d4d8_transparent]
            [scrollbar-width:thin]
            sm:px-7
            sm:py-6
          "
        >
          <div className="space-y-6">
            {/* =================================================
                OVERVIEW
            ================================================== */}

            <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-zinc-50/60 p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-zinc-100 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    {/* Badges */}

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <StatusBadge label={status.label} type="status" />

                      <StatusBadge
                        label={
                          maintenance.allowUserAccess
                            ? "Users Can Access"
                            : "Access Restricted"
                        }
                        type="access"
                      />
                    </div>

                    {/* Title */}

                    <h3 className="break-words text-xl font-black tracking-[-0.025em] text-zinc-950 sm:text-2xl">
                      {maintenance.title || "Untitled Maintenance"}
                    </h3>

                    <p className="mt-2 max-w-2xl text-xs font-medium leading-6 text-zinc-500 sm:text-sm">
                      {status.description}
                    </p>
                  </div>

                  {/* Status Icon */}

                  <div
                    className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm sm:flex ${accent.icon}`}
                  >
                    <StatusIcon size={24} strokeWidth={1.8} />
                  </div>
                </div>

                {/* Quick Facts */}

                <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {/* Mode */}

                  <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-3.5">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                      Mode
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      {maintenance.enabled ? (
                        <CheckCircle2 size={15} className="text-amber-500" />
                      ) : (
                        <Settings2 size={15} className="text-zinc-400" />
                      )}

                      <p className="text-xs font-bold text-zinc-900">
                        {maintenance.enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>

                  {/* User Access */}

                  <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-3.5">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                      User Access
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      {maintenance.allowUserAccess ? (
                        <ShieldCheck size={15} className="text-emerald-500" />
                      ) : (
                        <LockKeyhole size={15} className="text-red-500" />
                      )}

                      <p className="text-xs font-bold text-zinc-900">
                        {maintenance.allowUserAccess ? "Allowed" : "Restricted"}
                      </p>
                    </div>
                  </div>

                  {/* End */}

                  <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-3.5">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                      End Date
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <Clock3 size={15} className="text-zinc-400" />

                      <p className="text-xs font-bold text-zinc-900">
                        {maintenance.endDate
                          ? formatDateTime(maintenance.endDate)
                          : "No end date"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                MESSAGE
            ================================================== */}

            <section>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-zinc-900" />

                  <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-500">
                    Maintenance Message
                  </h3>
                </div>

                <p className="mt-1.5 text-xs font-medium text-zinc-400">
                  This message is displayed to users when maintenance mode
                  applies.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 sm:p-5">
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-zinc-900" />

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                    <Info size={16} />
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-zinc-700">
                    {maintenance.message ||
                      "No maintenance message configured."}
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                CONFIGURATION
            ================================================== */}

            <section>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-zinc-900" />

                  <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-500">
                    Configuration
                  </h3>
                </div>

                <p className="mt-1.5 text-xs font-medium text-zinc-400">
                  Current maintenance settings and access behavior.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={maintenance.enabled ? CheckCircle2 : Settings2}
                  label="Maintenance Mode"
                  value={maintenance.enabled ? "Enabled" : "Disabled"}
                  description={
                    maintenance.enabled
                      ? "Maintenance mode is enabled."
                      : "FinTrack is operating normally."
                  }
                />

                <DetailItem
                  icon={maintenance.allowUserAccess ? ShieldCheck : LockKeyhole}
                  label="User Access"
                  value={
                    maintenance.allowUserAccess
                      ? "Users can access the app"
                      : "Users cannot access the app"
                  }
                  description={
                    maintenance.allowUserAccess
                      ? "The app remains usable while maintenance is active."
                      : "Users are blocked while maintenance is active."
                  }
                />
              </div>
            </section>

            {/* =================================================
                SCHEDULE
            ================================================== */}

            <section>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-zinc-900" />

                  <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-500">
                    Maintenance Schedule
                  </h3>
                </div>

                <p className="mt-1.5 text-xs font-medium text-zinc-400">
                  The configured window during which maintenance mode can apply.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={CalendarDays}
                  label="Start Date & Time"
                  value={formatDateTime(maintenance.startDate)}
                  description={
                    maintenance.startDate
                      ? "Configured maintenance start time."
                      : "No scheduled start time."
                  }
                />

                <DetailItem
                  icon={Clock3}
                  label="End Date & Time"
                  value={formatDateTime(maintenance.endDate)}
                  description={
                    maintenance.endDate
                      ? "Configured maintenance end time."
                      : "No end date. Maintenance continues until disabled."
                  }
                />
              </div>
            </section>

            {/* =================================================
                SYSTEM INFORMATION
            ================================================== */}

            <section>
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-zinc-900" />

                  <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-500">
                    System Information
                  </h3>
                </div>

                <p className="mt-1.5 text-xs font-medium text-zinc-400">
                  Internal configuration metadata.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* ID */}

                <DetailItem
                  icon={Settings2}
                  label="Configuration ID"
                  value={
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 truncate font-mono text-[11px] font-semibold text-zinc-700">
                        {maintenance._id || "Not available"}
                      </span>

                      {maintenance._id && (
                        <button
                          type="button"
                          onClick={handleCopyId}
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            cursor-pointer
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-zinc-200
                            bg-white
                            text-zinc-400
                            transition-all
                            hover:border-zinc-300
                            hover:bg-zinc-50
                            hover:text-zinc-800
                            active:scale-95
                          "
                          title="Copy configuration ID"
                          aria-label="Copy configuration ID"
                        >
                          {copied ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      )}
                    </div>
                  }
                  description={
                    copied
                      ? "Configuration ID copied to clipboard."
                      : "Unique database identifier for this configuration."
                  }
                />

                {/* Created */}

                <DetailItem
                  icon={Clock3}
                  label="Created At"
                  value={formatDateTime(maintenance.createdAt)}
                  description="When this configuration was created."
                />

                {/* Updated */}

                <DetailItem
                  icon={Clock3}
                  label="Last Updated"
                  value={formatDateTime(maintenance.updatedAt)}
                  description="Most recent configuration update."
                />

                {/* State */}

                <DetailItem
                  icon={Settings2}
                  label="Configuration State"
                  value={
                    maintenance.enabled
                      ? "Maintenance configuration enabled"
                      : "Normal operation configuration"
                  }
                  description="Current saved state of the maintenance configuration."
                />
              </div>
            </section>

            {/* =================================================
                ACCESS STATUS
            ================================================== */}

            {maintenance.enabled && (
              <section
                className={`overflow-hidden rounded-2xl border p-4 sm:p-5 ${
                  maintenance.allowUserAccess
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-red-200 bg-red-50/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${
                      maintenance.allowUserAccess
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {maintenance.allowUserAccess ? (
                      <ShieldCheck size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-extrabold ${
                        maintenance.allowUserAccess
                          ? "text-emerald-900"
                          : "text-red-900"
                      }`}
                    >
                      {maintenance.allowUserAccess
                        ? "Users can continue using FinTrack"
                        : "App access is restricted"}
                    </p>

                    <p
                      className={`mt-1.5 text-[11px] font-medium leading-5 ${
                        maintenance.allowUserAccess
                          ? "text-emerald-800/80"
                          : "text-red-800/80"
                      }`}
                    >
                      {maintenance.allowUserAccess
                        ? "When maintenance is active, users can continue using the app and will see the configured maintenance warning."
                        : "When maintenance is active, users will see the restricted maintenance screen and cannot access the main FinTrack experience."}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                HOW MAINTENANCE WORKS
            ================================================== */}

            <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Info size={18} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold text-blue-950">
                    How maintenance works
                  </h3>

                  <p className="mt-1 text-[10px] font-medium leading-5 text-blue-800/70">
                    Maintenance mode controls what users experience when
                    FinTrack is undergoing maintenance.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2.5">
                {/* 1 */}

                <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                    1
                  </span>

                  <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                    Maintenance becomes active only when it is enabled and the
                    current time is within the configured schedule.
                  </p>
                </div>

                {/* 2 */}

                <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                    2
                  </span>

                  <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                    If user access is allowed, the mobile app remains usable and
                    displays a maintenance warning.
                  </p>
                </div>

                {/* 3 */}

                <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                    3
                  </span>

                  <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                    If user access is disabled, the mobile app displays the
                    restricted maintenance screen.
                  </p>
                </div>

                {/* 4 */}

                <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                    4
                  </span>

                  <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                    Leaving the end date empty keeps maintenance active until it
                    is manually disabled.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ====================================================
            FOOTER
        ===================================================== */}

        <footer
          className="
            shrink-0
            border-t
            border-zinc-100
            bg-white/95
            px-4
            py-3.5
            backdrop-blur
            sm:px-7
            sm:py-4
          "
        >
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 text-[10px] font-medium text-zinc-400">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  status.label === "Active"
                    ? "bg-amber-500"
                    : status.label === "Scheduled"
                      ? "bg-blue-500"
                      : "bg-zinc-400"
                }`}
              />

              <span className="truncate">
                Configuration is read-only in this view.
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                inline-flex
                min-h-[42px]
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-zinc-950
                px-5
                text-xs
                font-extrabold
                text-white
                shadow-lg
                shadow-zinc-950/10
                transition-all
                hover:-translate-y-0.5
                hover:bg-zinc-800
                active:translate-y-0
                active:scale-[0.98]
                sm:w-auto
              "
            >
              <X size={15} />
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
