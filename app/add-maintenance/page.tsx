"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Info,
  Loader2,
  LockKeyhole,
  Power,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Settings2,
  Smartphone,
  Wrench,
  X,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Maintenance = {
  _id?: string;
  enabled: boolean;
  title: string;
  message: string;
  allowUserAccess: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type MaintenanceResponse = {
  success: boolean;
  data: Maintenance;
  message?: string;
};

const DEFAULT_TITLE = "Maintenance in Progress";

const DEFAULT_MESSAGE =
  "FinTrack is currently undergoing maintenance. We appreciate your patience.";

const toDateTimeLocal = (date?: string | null) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const offset = parsed.getTimezoneOffset();

  const localDate = new Date(parsed.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

const formatDate = (date?: string | null) => {
  if (!date) return "Not scheduled";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPreviewDate = (date: string) => {
  if (!date) return "Not scheduled";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MaintenancePage() {
  const router = useRouter();

  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [allowUserAccess, setAllowUserAccess] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  /*
   * ============================================================
   * LOAD MAINTENANCE
   * ============================================================
   */

  const loadMaintenance = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response: MaintenanceResponse =
        await adminApi("/admin/maintenance");

      const data = response.data;

      setMaintenance(data);

      setEnabled(data.enabled ?? false);
      setTitle(data.title || DEFAULT_TITLE);
      setMessage(data.message || DEFAULT_MESSAGE);
      setAllowUserAccess(data.allowUserAccess ?? true);
      setStartDate(toDateTimeLocal(data.startDate));
      setEndDate(toDateTimeLocal(data.endDate));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load maintenance settings.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  /*
   * ============================================================
   * SUCCESS MESSAGE
   * ============================================================
   */

  useEffect(() => {
    if (!success) return;

    const timer = window.setTimeout(() => {
      setSuccess("");
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [success]);

  /*
   * ============================================================
   * BODY SCROLL LOCK
   * ============================================================
   */

  useEffect(() => {
    if (showConfirm || saving) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showConfirm, saving]);

  /*
   * ============================================================
   * ESCAPE KEY
   * ============================================================
   */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (saving) return;

      if (showConfirm) {
        setShowConfirm(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showConfirm, saving]);

  /*
   * ============================================================
   * CURRENT STATE
   * ============================================================
   */

  const currentState = useMemo(() => {
    if (!enabled) {
      return {
        label: "Normal Operation",
        shortLabel: "Disabled",
        description: "Maintenance mode is currently disabled.",
        color: "emerald",
      };
    }

    const now = new Date();

    const start = startDate ? new Date(startDate) : null;

    const end = endDate ? new Date(endDate) : null;

    if (start && !Number.isNaN(start.getTime()) && now < start) {
      return {
        label: "Scheduled Maintenance",
        shortLabel: "Scheduled",
        description: "Maintenance is enabled and scheduled to begin later.",
        color: "blue",
      };
    }

    if (end && !Number.isNaN(end.getTime()) && now > end) {
      return {
        label: "Maintenance Period Ended",
        shortLabel: "Ended",
        description: "The configured maintenance period has ended.",
        color: "zinc",
      };
    }

    return {
      label: "Maintenance Active",
      shortLabel: "Active",
      description: "Maintenance mode is currently active.",
      color: "amber",
    };
  }, [enabled, startDate, endDate]);

  /*
   * ============================================================
   * VALIDATION
   * ============================================================
   */

  const validate = () => {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle) {
      setError("Maintenance title is required.");
      return false;
    }

    if (trimmedTitle.length > 120) {
      setError("Title cannot exceed 120 characters.");
      return false;
    }

    if (!trimmedMessage) {
      setError("Maintenance message is required.");
      return false;
    }

    if (trimmedMessage.length > 1000) {
      setError("Message cannot exceed 1000 characters.");
      return false;
    }

    if (startDate && Number.isNaN(new Date(startDate).getTime())) {
      setError("Please enter a valid maintenance start date.");
      return false;
    }

    if (endDate && Number.isNaN(new Date(endDate).getTime())) {
      setError("Please enter a valid maintenance end date.");
      return false;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setError("End date must be later than the start date.");
        return false;
      }
    }

    return true;
  };

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    if (!validate()) {
      return;
    }

    setShowConfirm(true);
  };

  /*
   * ============================================================
   * CONFIRM SAVE
   * ============================================================
   */

  const handleConfirmSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await adminApi("/admin/maintenance", {
        method: "PUT",
        body: JSON.stringify({
          enabled,
          title: title.trim(),
          message: message.trim(),
          allowUserAccess,
          startDate: startDate || undefined,
          endDate: endDate || null,
        }),
      });

      setShowConfirm(false);

      setSuccess(
        response.message || "Maintenance settings updated successfully.",
      );

      await loadMaintenance({
        silent: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update maintenance settings.",
      );

      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * BACK
   * ============================================================
   */

  const handleBack = () => {
    if (saving) return;

    router.back();
  };

  /*
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] min-w-0 bg-zinc-50/30 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1600px] items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <Loader2 size={23} className="animate-spin text-zinc-700" />
            </div>

            <p className="mt-4 text-sm font-bold text-zinc-800">
              Loading maintenance settings
            </p>

            <p className="mt-1 text-xs font-medium text-zinc-400">
              Preparing your maintenance control center...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        aria-busy={saving}
        className="min-w-0 bg-zinc-50/30 px-4 py-5 font-sans sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-14">
          {/* =====================================================
              TOP NAVIGATION
          ====================================================== */}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="group inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => loadMaintenance({ silent: true })}
              disabled={saving || refreshing}
              className="group inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-bold text-zinc-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : "transition-transform group-hover:rotate-45"
                }
              />

              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          {/* =====================================================
              HEADER
          ====================================================== */}

          <header className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)] sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      enabled ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />

                  <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-zinc-400">
                    System Configuration
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-[-0.04em] text-zinc-950 sm:text-4xl">
                    Maintenance Mode
                  </h1>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold ${
                      enabled
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        enabled ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />

                    {enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
                  Control when FinTrack enters maintenance mode, what users see,
                  and whether they can continue accessing the app.
                </p>
              </div>

              {/* Header status */}
              <div
                className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 ${
                  enabled
                    ? "border-amber-200 bg-amber-50/70"
                    : "border-emerald-200 bg-emerald-50/70"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ${
                    enabled ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  <Settings2 size={18} />
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Current State
                  </p>

                  <p className="mt-0.5 text-sm font-extrabold text-zinc-950">
                    {currentState.label}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* =====================================================
              ERROR
          ====================================================== */}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                <AlertCircle size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-red-800">
                  Unable to update maintenance settings
                </p>

                <p className="mt-0.5 text-xs font-medium leading-5 text-red-700">
                  {error}
                </p>
              </div>

              {!saving && (
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-400 transition hover:bg-white hover:text-red-700"
                  aria-label="Dismiss error"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}

          {/* =====================================================
              SUCCESS
          ====================================================== */}

          {success && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <CheckCircle2 size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-emerald-800">
                  Maintenance settings saved
                </p>

                <p className="mt-0.5 text-xs font-medium leading-5 text-emerald-700">
                  {success}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-emerald-500 transition hover:bg-white hover:text-emerald-700"
                aria-label="Dismiss success message"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* =====================================================
              MAIN GRID
          ====================================================== */}

          <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            {/* ===================================================
                SETTINGS
            ==================================================== */}

            <section className="min-w-0 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_16px_50px_-35px_rgba(0,0,0,0.45)]">
              {/* Card Header */}
              <div className="border-b border-zinc-100 bg-gradient-to-b from-white to-zinc-50/40 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
                    <Wrench size={21} strokeWidth={1.9} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-bold tracking-tight text-zinc-950">
                      Maintenance Configuration
                    </h2>

                    <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                      Configure the maintenance state, user access, message, and
                      schedule.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-9 px-5 py-6 sm:px-7 sm:py-8">
                  {/* =================================================
                      STATUS
                  ================================================== */}

                  <section>
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-zinc-900" />

                        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-500">
                          Status
                        </h3>
                      </div>

                      <p className="mt-1.5 text-xs font-medium text-zinc-400">
                        Turn maintenance mode on or off.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setEnabled((current) => !current);
                        setError("");
                      }}
                      className={`group flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                        enabled
                          ? "border-amber-200 bg-amber-50/70 shadow-sm shadow-amber-100 hover:border-amber-300"
                          : "border-zinc-200 bg-zinc-50/60 hover:border-zinc-300 hover:bg-zinc-50"
                      } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            enabled
                              ? "bg-amber-100 text-amber-600"
                              : "bg-white text-zinc-400 ring-1 ring-zinc-200"
                          }`}
                        >
                          <Power size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900">
                            {enabled
                              ? "Maintenance mode is enabled"
                              : "Maintenance mode is disabled"}
                          </p>

                          <p className="mt-1 text-[11px] font-medium leading-5 text-zinc-500">
                            {enabled
                              ? "The configured maintenance schedule will be applied."
                              : "FinTrack will operate normally."}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                          enabled ? "bg-amber-500" : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                            enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </span>
                    </button>
                  </section>

                  {/* =================================================
                      USER CONTENT
                  ================================================== */}

                  <section>
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-zinc-900" />

                        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-500">
                          User-Facing Content
                        </h3>
                      </div>

                      <p className="mt-1.5 text-xs font-medium text-zinc-400">
                        This information will appear to users during
                        maintenance.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Title */}
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="maintenance-title"
                            className="text-xs font-bold text-zinc-800"
                          >
                            Title
                          </label>

                          <span
                            className={`text-[10px] font-bold ${
                              title.length > 110
                                ? "text-amber-600"
                                : "text-zinc-400"
                            }`}
                          >
                            {title.length}/120
                          </span>
                        </div>

                        <input
                          id="maintenance-title"
                          type="text"
                          maxLength={120}
                          value={title}
                          disabled={saving}
                          onChange={(event) => {
                            setTitle(event.target.value);
                            setError("");
                          }}
                          placeholder="Maintenance in Progress"
                          className="h-12 w-full cursor-text rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-300 hover:border-zinc-300 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="maintenance-message"
                            className="text-xs font-bold text-zinc-800"
                          >
                            Message
                          </label>

                          <span
                            className={`text-[10px] font-bold ${
                              message.length > 930
                                ? "text-amber-600"
                                : "text-zinc-400"
                            }`}
                          >
                            {message.length}/1000
                          </span>
                        </div>

                        <textarea
                          id="maintenance-message"
                          rows={6}
                          maxLength={1000}
                          value={message}
                          disabled={saving}
                          onChange={(event) => {
                            setMessage(event.target.value);
                            setError("");
                          }}
                          placeholder="Write the maintenance message users will see..."
                          className="w-full cursor-text resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-3.5 text-sm font-medium leading-6 text-zinc-900 outline-none transition-all placeholder:text-zinc-300 hover:border-zinc-300 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                        />
                      </div>
                    </div>
                  </section>

                  {/* =================================================
                      USER ACCESS
                  ================================================== */}

                  <section>
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-zinc-900" />

                        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-500">
                          User Access
                        </h3>
                      </div>

                      <p className="mt-1.5 text-xs font-medium text-zinc-400">
                        Decide whether users can continue using FinTrack while
                        maintenance is active.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* Allow */}
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setAllowUserAccess(true);
                          setError("");
                        }}
                        className={`group cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 ${
                          allowUserAccess
                            ? "border-emerald-300 bg-emerald-50/70 shadow-sm shadow-emerald-100 ring-1 ring-emerald-200"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              allowUserAccess
                                ? "bg-white text-emerald-600 shadow-sm"
                                : "bg-zinc-100 text-zinc-400"
                            }`}
                          >
                            <ShieldCheck size={18} />
                          </div>

                          {allowUserAccess && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Check size={13} strokeWidth={3} />
                            </span>
                          )}
                        </div>

                        <p className="mt-4 text-xs font-bold text-zinc-900">
                          Yes, users can access the app
                        </p>

                        <p className="mt-1.5 text-[11px] font-medium leading-5 text-zinc-500">
                          Users can continue using FinTrack while seeing a
                          maintenance notice.
                        </p>
                      </button>

                      {/* Restrict */}
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setAllowUserAccess(false);
                          setError("");
                        }}
                        className={`group cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 ${
                          !allowUserAccess
                            ? "border-red-300 bg-red-50/70 shadow-sm shadow-red-100 ring-1 ring-red-200"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              !allowUserAccess
                                ? "bg-white text-red-600 shadow-sm"
                                : "bg-zinc-100 text-zinc-400"
                            }`}
                          >
                            <LockKeyhole size={18} />
                          </div>

                          {!allowUserAccess && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                              <Check size={13} strokeWidth={3} />
                            </span>
                          )}
                        </div>

                        <p className="mt-4 text-xs font-bold text-zinc-900">
                          No, users cannot access the app
                        </p>

                        <p className="mt-1.5 text-[11px] font-medium leading-5 text-zinc-500">
                          Users will see the restricted maintenance screen while
                          maintenance is active.
                        </p>
                      </button>
                    </div>
                  </section>

                  {/* =================================================
                      SCHEDULE
                  ================================================== */}

                  <section>
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded-full bg-zinc-900" />

                        <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-500">
                          Schedule
                        </h3>
                      </div>

                      <p className="mt-1.5 text-xs font-medium text-zinc-400">
                        Configure when maintenance starts and ends.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Start */}
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
                        <label
                          htmlFor="start-date"
                          className="mb-2.5 flex items-center gap-2 text-xs font-bold text-zinc-800"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                            <CalendarDays size={14} />
                          </span>
                          Start Date & Time
                        </label>

                        <input
                          id="start-date"
                          type="datetime-local"
                          value={startDate}
                          disabled={saving}
                          onChange={(event) => {
                            setStartDate(event.target.value);
                            setError("");
                          }}
                          className="h-11 w-full cursor-text rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition-all hover:border-zinc-300 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                        />

                        <p className="mt-2 text-[10px] font-medium leading-4 text-zinc-400">
                          Leave empty if there is no scheduled start time.
                        </p>
                      </div>

                      {/* End */}
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
                        <label
                          htmlFor="end-date"
                          className="mb-2.5 flex items-center gap-2 text-xs font-bold text-zinc-800"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                            <Clock size={14} />
                          </span>
                          End Date & Time
                        </label>

                        <input
                          id="end-date"
                          type="datetime-local"
                          value={endDate}
                          min={startDate || undefined}
                          disabled={saving}
                          onChange={(event) => {
                            setEndDate(event.target.value);
                            setError("");
                          }}
                          className="h-11 w-full cursor-text rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 outline-none transition-all hover:border-zinc-300 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                        />

                        <p className="mt-2 text-[10px] font-medium leading-4 text-zinc-400">
                          Leave empty to keep maintenance active until manually
                          disabled.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* =================================================
                      SAVE FOOTER
                  ================================================== */}

                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2.5">
                      <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-zinc-400"
                      />

                      <p className="max-w-md text-[11px] font-medium leading-5 text-zinc-400">
                        Changes are applied to the mobile app according to the
                        configured maintenance state and schedule.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-zinc-950 px-7 text-xs font-bold text-white shadow-lg shadow-zinc-950/15 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* =====================================================
                RIGHT SIDEBAR
            ====================================================== */}

            <aside className="min-w-0 space-y-5">
              {/* =================================================
                  CURRENT STATE
              ================================================== */}

              <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_12px_40px_-30px_rgba(0,0,0,0.4)]">
                <div
                  className={`h-1.5 ${
                    currentState.color === "amber"
                      ? "bg-amber-500"
                      : currentState.color === "blue"
                        ? "bg-blue-500"
                        : currentState.color === "zinc"
                          ? "bg-zinc-400"
                          : "bg-emerald-500"
                  }`}
                />

                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          currentState.color === "amber"
                            ? "bg-amber-50 text-amber-600"
                            : currentState.color === "blue"
                              ? "bg-blue-50 text-blue-600"
                              : currentState.color === "zinc"
                                ? "bg-zinc-100 text-zinc-500"
                                : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        <Settings2 size={19} />
                      </div>

                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                          Current State
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-zinc-950">
                          {currentState.label}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide ${
                        currentState.color === "amber"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : currentState.color === "blue"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : currentState.color === "zinc"
                              ? "border-zinc-200 bg-zinc-100 text-zinc-600"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {currentState.shortLabel}
                    </span>
                  </div>

                  <p className="mt-4 text-[11px] font-medium leading-5 text-zinc-500">
                    {currentState.description}
                  </p>

                  <div className="mt-5 space-y-3">
                    {/* Access */}
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-3.5">
                      <div className="flex items-center gap-2">
                        {allowUserAccess ? (
                          <ShieldCheck size={14} className="text-emerald-600" />
                        ) : (
                          <LockKeyhole size={14} className="text-red-600" />
                        )}

                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                          User Access
                        </p>
                      </div>

                      <p className="mt-1.5 text-xs font-bold text-zinc-800">
                        {allowUserAccess
                          ? "Users can access the app"
                          : "App access is restricted"}
                      </p>
                    </div>

                    {/* Start */}
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-3.5">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-zinc-400" />

                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                          Start
                        </p>
                      </div>

                      <p className="mt-1.5 text-xs font-bold text-zinc-800">
                        {formatDate(
                          startDate ? new Date(startDate).toISOString() : null,
                        )}
                      </p>
                    </div>

                    {/* End */}
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-3.5">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-zinc-400" />

                        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                          End
                        </p>
                      </div>

                      <p className="mt-1.5 text-xs font-bold text-zinc-800">
                        {formatDate(
                          endDate ? new Date(endDate).toISOString() : null,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  LIVE PREVIEW
              ================================================== */}

              <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_12px_40px_-30px_rgba(0,0,0,0.4)]">
                <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                        <Eye size={17} />
                      </div>

                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                          Live Preview
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-zinc-950">
                          User Experience
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-extrabold text-blue-700">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                      LIVE
                    </span>
                  </div>

                  <p className="mt-3 text-[11px] font-medium leading-5 text-zinc-500">
                    Preview updates instantly as you change the configuration.
                  </p>
                </div>

                <div className="p-4 sm:p-5">
                  {/* Phone frame */}
                  <div className="mx-auto max-w-[320px]">
                    <div className="rounded-[2rem] border-[6px] border-zinc-900 bg-zinc-900 p-1 shadow-2xl">
                      <div className="overflow-hidden rounded-[1.55rem] bg-white">
                        {/* Phone top */}
                        <div className="flex h-8 items-center justify-center bg-zinc-950">
                          <div className="h-1.5 w-16 rounded-full bg-zinc-700" />
                        </div>

                        {/* App preview */}
                        <div className="min-h-[390px] bg-zinc-50">
                          {/* App header */}
                          <div className="border-b border-zinc-100 bg-white px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-xs font-black text-white">
                                F
                              </div>

                              <div>
                                <p className="text-[10px] font-extrabold text-zinc-950">
                                  FinTrack
                                </p>

                                <p className="text-[8px] font-medium text-zinc-400">
                                  Expense & Budget
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Preview content */}
                          <div className="p-4">
                            {/* Warning banner */}
                            {enabled && allowUserAccess && (
                              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                                <div className="flex items-start gap-2">
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600">
                                    <Wrench size={12} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[9px] font-extrabold text-amber-900">
                                      {title || DEFAULT_TITLE}
                                    </p>

                                    <p className="mt-0.5 line-clamp-2 text-[8px] font-medium leading-4 text-amber-800/80">
                                      {message || DEFAULT_MESSAGE}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Restricted screen */}
                            {enabled && !allowUserAccess ? (
                              <div className="flex min-h-[310px] items-center justify-center">
                                <div className="w-full text-center">
                                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg">
                                    <LockKeyhole size={26} />
                                  </div>

                                  <h4 className="mt-5 px-3 text-base font-black tracking-tight text-zinc-950">
                                    {title || DEFAULT_TITLE}
                                  </h4>

                                  <p className="mx-auto mt-2 max-w-[230px] text-[9px] font-medium leading-5 text-zinc-500">
                                    {message || DEFAULT_MESSAGE}
                                  </p>

                                  <div className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[8px] font-bold text-zinc-500 shadow-sm">
                                    <Clock size={11} />
                                    Please try again later
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Dashboard mock */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                    <div className="h-2 w-12 rounded bg-zinc-100" />
                                    <div className="mt-2 h-4 w-16 rounded bg-zinc-200" />
                                  </div>

                                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                    <div className="h-2 w-12 rounded bg-zinc-100" />
                                    <div className="mt-2 h-4 w-16 rounded bg-zinc-200" />
                                  </div>
                                </div>

                                <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-3">
                                  <div className="h-2 w-20 rounded bg-zinc-100" />
                                  <div className="mt-3 h-20 rounded-lg bg-zinc-50" />
                                </div>

                                <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="h-2 w-16 rounded bg-zinc-100" />

                                    <div className="h-5 w-5 rounded-lg bg-zinc-100" />
                                  </div>

                                  <div className="mt-3 space-y-2">
                                    <div className="h-2 rounded bg-zinc-100" />
                                    <div className="h-2 w-4/5 rounded bg-zinc-100" />
                                    <div className="h-2 w-3/5 rounded bg-zinc-100" />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Phone bottom */}
                          <div className="flex h-8 items-center justify-center border-t border-zinc-100 bg-white">
                            <div className="h-1 w-20 rounded-full bg-zinc-200" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview status */}
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          enabled
                            ? allowUserAccess
                              ? "bg-amber-500"
                              : "bg-red-500"
                            : "bg-emerald-500"
                        }`}
                      />

                      <p className="text-[10px] font-bold text-zinc-500">
                        {enabled
                          ? allowUserAccess
                            ? "Maintenance warning"
                            : "Restricted access screen"
                          : "Normal app experience"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
    HOW MAINTENANCE WORKS
================================================== */}

              <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Info size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-blue-950">
                      How maintenance works
                    </p>

                    <p className="mt-1 text-[10px] font-medium leading-5 text-blue-800/70">
                      Maintenance mode controls what users experience when
                      FinTrack is undergoing maintenance.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {/* Rule 1 */}
                  <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                      1
                    </span>

                    <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                      Maintenance becomes active only when it is enabled and the
                      current time is within the configured schedule.
                    </p>
                  </div>

                  {/* Rule 2 */}
                  <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                      2
                    </span>

                    <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                      If user access is allowed, the mobile app remains usable
                      and displays a maintenance warning.
                    </p>
                  </div>

                  {/* Rule 3 */}
                  <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                      3
                    </span>

                    <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                      If user access is disabled, the mobile app shows the
                      restricted maintenance screen.
                    </p>
                  </div>

                  {/* Rule 4 */}
                  <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                      4
                    </span>

                    <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                      Leaving the end date empty keeps maintenance active until
                      you manually disable it.
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  SCHEDULE SUMMARY
              ================================================== */}

              <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                      Schedule
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-zinc-950">
                      Maintenance Window
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2.5">
                    <span className="text-[10px] font-bold text-zinc-400">
                      Start
                    </span>

                    <span className="text-right text-[10px] font-bold text-zinc-700">
                      {startDate
                        ? formatPreviewDate(startDate)
                        : "Immediately / not scheduled"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2.5">
                    <span className="text-[10px] font-bold text-zinc-400">
                      End
                    </span>

                    <span className="text-right text-[10px] font-bold text-zinc-700">
                      {endDate ? formatPreviewDate(endDate) : "No end date"}
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================================
                  WARNING
              ================================================== */}

              {enabled && !allowUserAccess && (
                <section className="rounded-3xl border border-red-200 bg-red-50/70 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                      <ShieldAlert size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-red-900">
                        App access will be restricted
                      </p>

                      <p className="mt-1.5 text-[11px] font-medium leading-5 text-red-800/80">
                        When maintenance becomes active, users will see the
                        restricted-access screen and cannot access the main
                        FinTrack app.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* =================================================
                  ACCESS ALLOWED INFO
              ================================================== */}

              {enabled && allowUserAccess && (
                <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-emerald-900">
                        Users can continue using FinTrack
                      </p>

                      <p className="mt-1.5 text-[11px] font-medium leading-5 text-emerald-800/80">
                        Users will see the maintenance warning while the app
                        remains accessible.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* ==========================================================
          CONFIRMATION MODAL
      =========================================================== */}

      {showConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-3 backdrop-blur-md sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="maintenance-confirm-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_35px_100px_-20px_rgba(0,0,0,0.55)]">
            {/* Accent */}
            <div
              className={`h-1.5 ${
                enabled
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-400"
              }`}
            />

            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    enabled
                      ? "border border-amber-200 bg-amber-50 text-amber-600"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {enabled ? (
                    <ShieldAlert size={22} />
                  ) : (
                    <CheckCircle2 size={22} />
                  )}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowConfirm(false)}
                  aria-label="Close confirmation"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>

              <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                Review Changes
              </p>

              <h2
                id="maintenance-confirm-title"
                className="mt-1.5 text-xl font-black tracking-tight text-zinc-950"
              >
                {enabled
                  ? "Enable Maintenance Mode?"
                  : "Disable Maintenance Mode?"}
              </h2>

              <p className="mt-2 text-sm font-medium leading-6 text-zinc-500">
                {enabled
                  ? allowUserAccess
                    ? "FinTrack will display the maintenance notice while allowing users to continue using the app."
                    : "FinTrack will restrict users from accessing the main app while maintenance is active."
                  : "FinTrack will return to normal operation and users will be able to access the app normally."}
              </p>

              {/* Summary */}
              <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      Title
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-900">
                      {title || DEFAULT_TITLE}
                    </p>
                  </div>

                  <div className="border-t border-zinc-200 pt-3">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      User Access
                    </p>

                    <div className="mt-1.5 flex items-center gap-1.5">
                      {allowUserAccess ? (
                        <ShieldCheck size={14} className="text-emerald-600" />
                      ) : (
                        <LockKeyhole size={14} className="text-red-600" />
                      )}

                      <p className="text-xs font-bold text-zinc-800">
                        {allowUserAccess
                          ? "Users can access the app"
                          : "Users cannot access the app"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 pt-3">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      Schedule
                    </p>

                    <p className="mt-1 text-xs font-bold leading-5 text-zinc-800">
                      {startDate
                        ? formatPreviewDate(startDate)
                        : "Immediately / not scheduled"}

                      {" → "}

                      {endDate ? formatPreviewDate(endDate) : "No end date"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowConfirm(false)}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleConfirmSave}
                  className={`inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-xs font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                    enabled
                      ? "bg-amber-600 shadow-amber-600/20 hover:bg-amber-700"
                      : "bg-zinc-950 shadow-zinc-950/15 hover:bg-zinc-800"
                  } sm:w-auto`}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Yes, Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          FULL SCREEN SAVE LOADER
      =========================================================== */}

      {saving && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white p-6 shadow-[0_35px_100px_-20px_rgba(0,0,0,0.65)] sm:p-7">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl">
                <Loader2 size={28} className="animate-spin" />

                <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
              </div>

              <h3 className="mt-5 text-base font-black text-zinc-950">
                Saving Maintenance Settings
              </h3>

              <p className="mt-2 max-w-xs text-xs font-medium leading-5 text-zinc-500">
                Please wait while we securely update the maintenance
                configuration.
              </p>

              <div className="mt-6 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-zinc-900" />
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                <ShieldCheck size={14} className="text-emerald-600" />

                <span className="text-[10px] font-bold text-zinc-500">
                  Do not close or refresh this page
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
