"use client";

import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  LockKeyhole,
  Save,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminApi } from "@/lib/api";

/* ============================================================
   TYPES
============================================================ */

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

type EditMaintenanceModalProps = {
  maintenance: Maintenance | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

/* ============================================================
   DATE HELPERS
============================================================ */

const toDateTimeLocal = (date?: string | null) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toISOStringOrNull = (value: string) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
};

const formatDateTime = (value: string) => {
  if (!value) {
    return "Immediately / not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function EditMaintenanceModal({
  maintenance,
  onClose,
  onSaved,
}: EditMaintenanceModalProps) {
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [allowUserAccess, setAllowUserAccess] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  /* ==========================================================
     LOAD MAINTENANCE
  ========================================================== */

  useEffect(() => {
    if (!maintenance) {
      return;
    }

    setEnabled(Boolean(maintenance.enabled));

    setTitle(maintenance.title || "");

    setMessage(maintenance.message || "");

    setAllowUserAccess(
      maintenance.allowUserAccess === undefined
        ? true
        : Boolean(maintenance.allowUserAccess),
    );

    setStartDate(toDateTimeLocal(maintenance.startDate));

    setEndDate(toDateTimeLocal(maintenance.endDate));

    setError("");
    setSaving(false);
    setShowConfirmation(false);
  }, [maintenance]);

  /* ==========================================================
     LOCK ESCAPE WHILE SAVING
  ========================================================== */

  useEffect(() => {
    if (!maintenance) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [maintenance, saving, onClose]);

  /* ==========================================================
     LOCK BACKGROUND SCROLL
  ========================================================== */

  useEffect(() => {
    if (!maintenance) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;

      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [maintenance]);

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate = () => {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle) {
      return "Maintenance title is required.";
    }

    if (trimmedTitle.length > 120) {
      return "Maintenance title cannot exceed 120 characters.";
    }

    if (!trimmedMessage) {
      return "Maintenance message is required.";
    }

    if (trimmedMessage.length > 1000) {
      return "Maintenance message cannot exceed 1000 characters.";
    }

    if (startDate && Number.isNaN(new Date(startDate).getTime())) {
      return "Please provide a valid start date.";
    }

    if (endDate && Number.isNaN(new Date(endDate).getTime())) {
      return "Please provide a valid end date.";
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return "End date must be later than the start date.";
      }
    }

    return "";
  };

  /* ==========================================================
     OPEN CONFIRMATION
  ========================================================== */

  const handleSubmit = () => {
    if (saving) {
      return;
    }

    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setShowConfirmation(true);
  };

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await adminApi("/admin/maintenance", {
        method: "PUT",
        body: JSON.stringify({
          enabled,
          title: title.trim(),
          message: message.trim(),
          allowUserAccess,
          startDate: toISOStringOrNull(startDate),
          endDate: toISOStringOrNull(endDate),
        }),
      });

      setShowConfirmation(false);

      await onSaved();

      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save maintenance settings.",
      );

      setShowConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     NULL
  ========================================================== */

  if (!maintenance) {
    return null;
  }

  /* ==========================================================
     PREVIEW STATE
  ========================================================== */

  const previewTitle = title.trim() || "Maintenance in Progress";

  const previewMessage =
    message.trim() ||
    "FinTrack is currently undergoing maintenance. We appreciate your patience.";

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-zinc-950/70
        p-2
        backdrop-blur-md
        sm:p-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-maintenance-title"
    >
      {/* ======================================================
          MODAL
          
          IMPORTANT:
          There is intentionally NO backdrop click handler.
          Clicking outside never closes this modal.
      ======================================================= */}

      <div
        className="
          relative
          flex
          max-h-[95vh]
          w-full
          max-w-5xl
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
            SAVING OVERLAY
        ===================================================== */}

        {saving && (
          <div
            className="
              absolute
              inset-0
              z-[120]
              flex
              items-center
              justify-center
              bg-white/80
              backdrop-blur-md
            "
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-zinc-950
                  text-white
                  shadow-xl
                  shadow-zinc-950/20
                "
              >
                <span
                  className="
                    h-6
                    w-6
                    animate-spin
                    rounded-full
                    border-[3px]
                    border-white/30
                    border-t-white
                  "
                />
              </div>

              <p className="mt-4 text-sm font-black text-zinc-950">
                Saving maintenance settings
              </p>

              <p className="mt-1 text-xs font-medium text-zinc-500">
                Please wait while your changes are applied.
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            TOP ACCENT
        ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-1.5
            bg-gradient-to-r
            from-zinc-950
            via-zinc-600
            to-zinc-300
          "
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
            <div className="flex min-w-0 items-center gap-3.5">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-zinc-950
                  text-white
                  shadow-lg
                  shadow-zinc-950/15
                  sm:h-12
                  sm:w-12
                "
              >
                <Wrench size={20} strokeWidth={1.9} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="edit-maintenance-title"
                    className="
                      text-base
                      font-black
                      tracking-tight
                      text-zinc-950
                      sm:text-lg
                    "
                  >
                    Edit Maintenance
                  </h2>

                  <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" />

                  <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400 sm:block">
                    System Configuration
                  </span>
                </div>

                <p className="mt-1 text-xs font-medium leading-5 text-zinc-500 sm:text-sm">
                  Configure maintenance mode, user access, messaging, and
                  schedule.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
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
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              aria-label="Close edit maintenance"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* ====================================================
            CONFIRMATION SCREEN
        ===================================================== */}

        {showConfirmation ? (
          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              px-4
              py-6
              [scrollbar-color:#d4d4d8_transparent]
              [scrollbar-width:thin]
              sm:px-7
              sm:py-7
            "
          >
            <div className="mx-auto max-w-2xl">
              {/* Confirmation icon */}

              <div className="flex justify-center">
                <div
                  className={`
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-3xl
                    shadow-sm
                    ${
                      enabled
                        ? "border border-amber-200 bg-amber-50 text-amber-600"
                        : "border border-zinc-200 bg-zinc-100 text-zinc-600"
                    }
                  `}
                >
                  {enabled ? (
                    <AlertTriangle size={28} />
                  ) : (
                    <CheckCircle2 size={28} />
                  )}
                </div>
              </div>

              {/* Confirmation heading */}

              <div className="mt-5 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
                  <Sparkles size={11} />
                  Final confirmation
                </div>

                <h3 className="mt-4 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
                  {enabled
                    ? "Enable maintenance mode?"
                    : "Disable maintenance mode?"}
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-xs font-medium leading-6 text-zinc-500 sm:text-sm">
                  {enabled
                    ? allowUserAccess
                      ? "Maintenance mode will be enabled. Users will still be able to access the app, but they will see your maintenance warning."
                      : "Maintenance mode will be enabled and users will be restricted from accessing the app while maintenance is active."
                    : "Maintenance mode will be disabled and FinTrack will return to normal operation."}
                </p>
              </div>

              {/* Confirmation summary */}

              <div
                className="
                  mt-7
                  overflow-hidden
                  rounded-3xl
                  border
                  border-zinc-200
                  bg-zinc-50/70
                "
              >
                <div className="border-b border-zinc-200/80 bg-white px-5 py-4">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Changes to be applied
                  </p>
                </div>

                <div className="grid gap-px bg-zinc-200 sm:grid-cols-2">
                  {/* Title */}

                  <div className="bg-white p-4">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      Title
                    </p>

                    <p className="mt-1.5 break-words text-sm font-bold text-zinc-900">
                      {previewTitle}
                    </p>
                  </div>

                  {/* Status */}

                  <div className="bg-white p-4">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      Maintenance Status
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          enabled ? "bg-amber-500" : "bg-zinc-400"
                        }`}
                      />

                      <p className="text-sm font-bold text-zinc-900">
                        {enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>

                  {/* Access */}

                  <div className="bg-white p-4">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      User Access
                    </p>

                    <div className="mt-1.5 flex items-center gap-1.5">
                      {allowUserAccess ? (
                        <>
                          <ShieldCheck size={15} className="text-emerald-600" />

                          <p className="text-sm font-bold text-zinc-900">
                            Users can access
                          </p>
                        </>
                      ) : (
                        <>
                          <LockKeyhole size={15} className="text-red-600" />

                          <p className="text-sm font-bold text-zinc-900">
                            Access restricted
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Start */}

                  <div className="bg-white p-4">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      Start
                    </p>

                    <p className="mt-1.5 text-sm font-medium text-zinc-700">
                      {formatDateTime(startDate)}
                    </p>
                  </div>

                  {/* End */}

                  <div className="bg-white p-4 sm:col-span-2">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      End
                    </p>

                    <p className="mt-1.5 text-sm font-medium text-zinc-700">
                      {endDate
                        ? formatDateTime(endDate)
                        : "No end date — remains active until manually disabled"}
                    </p>
                  </div>

                  {/* Message */}

                  <div className="bg-white p-4 sm:col-span-2">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                      User Message
                    </p>

                    <p className="mt-1.5 break-words text-sm font-medium leading-6 text-zinc-700">
                      {previewMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Restriction warning */}

              {enabled && !allowUserAccess && (
                <div className="mt-4 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                    <AlertTriangle size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-red-900">
                      Users will be blocked
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-red-800/80">
                      Once the maintenance period becomes active, users will see
                      the restricted maintenance screen instead of the main
                      application.
                    </p>
                  </div>
                </div>
              )}

              {/* Access allowed */}

              {enabled && allowUserAccess && (
                <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Users can continue using FinTrack
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-emerald-800/80">
                      Users will see the maintenance warning while continuing to
                      access the app.
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}

              {/* Confirmation buttons */}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (saving) return;

                    setShowConfirmation(false);
                    setError("");
                  }}
                  disabled={saving}
                  className="
                    inline-flex
                    min-h-[44px]
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    px-5
                    text-sm
                    font-bold
                    text-zinc-700
                    transition-all
                    hover:border-zinc-300
                    hover:bg-zinc-50
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Go Back
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="
                    inline-flex
                    min-h-[44px]
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-zinc-950
                    px-5
                    text-sm
                    font-extrabold
                    text-white
                    shadow-lg
                    shadow-zinc-950/15
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-zinc-800
                    active:translate-y-0
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Confirm & Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                FORM SCROLL AREA
            =================================================== */}

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
              <div className="space-y-7">
                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                  <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                      <AlertTriangle size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-red-900">
                        Unable to continue
                      </p>

                      <p className="mt-1 text-xs font-medium leading-5 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    STATUS
                ================================================== */}

                <section>
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-zinc-950" />

                      <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-600">
                        Maintenance Status
                      </h3>
                    </div>

                    <p className="mt-1.5 text-xs font-medium text-zinc-400">
                      Turn maintenance mode on or off for the application.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEnabled((current) => !current)}
                    disabled={saving}
                    className={`
                      flex
                      w-full
                      cursor-pointer
                      items-center
                      justify-between
                      gap-4
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition-all
                      active:scale-[0.995]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      ${
                        enabled
                          ? "border-amber-200 bg-amber-50/80 shadow-sm shadow-amber-100"
                          : "border-zinc-200 bg-zinc-50/70 hover:border-zinc-300 hover:bg-white"
                      }
                    `}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-white
                          shadow-sm
                          ${
                            enabled
                              ? "text-amber-600 ring-1 ring-amber-100"
                              : "text-zinc-500 ring-1 ring-zinc-200"
                          }
                        `}
                      >
                        <Wrench size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900">
                          Maintenance Mode
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-zinc-500">
                          {enabled
                            ? "Maintenance mode is enabled."
                            : "FinTrack is operating normally."}
                        </p>
                      </div>
                    </div>

                    {/* Toggle */}

                    <div
                      className={`
                        relative
                        h-7
                        w-12
                        shrink-0
                        rounded-full
                        transition-colors
                        ${enabled ? "bg-zinc-950" : "bg-zinc-300"}
                      `}
                    >
                      <span
                        className={`
                          absolute
                          top-1
                          h-5
                          w-5
                          rounded-full
                          bg-white
                          shadow-md
                          transition-all
                          ${enabled ? "left-6" : "left-1"}
                        `}
                      />
                    </div>
                  </button>
                </section>

                {/* =================================================
                    INFORMATION
                ================================================== */}

                <section>
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-zinc-950" />

                      <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-600">
                        Maintenance Information
                      </h3>
                    </div>

                    <p className="mt-1.5 text-xs font-medium text-zinc-400">
                      Configure the title and message users will see during
                      maintenance.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}

                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <label
                          htmlFor="maintenance-title"
                          className="text-sm font-bold text-zinc-700"
                        >
                          Title
                        </label>

                        <span
                          className={`text-[10px] font-bold ${
                            title.length >= 110
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
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={120}
                        disabled={saving}
                        placeholder="Maintenance in Progress"
                        className="
                          w-full
                          rounded-xl
                          border
                          border-zinc-200
                          bg-white
                          px-4
                          py-3
                          text-sm
                          font-medium
                          text-zinc-900
                          outline-none
                          transition-all
                          placeholder:text-zinc-400
                          hover:border-zinc-300
                          focus:border-zinc-400
                          focus:ring-4
                          focus:ring-zinc-100
                          disabled:cursor-not-allowed
                          disabled:bg-zinc-100
                          disabled:text-zinc-500
                        "
                      />
                    </div>

                    {/* Message */}

                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <label
                          htmlFor="maintenance-message"
                          className="text-sm font-bold text-zinc-700"
                        >
                          Message
                        </label>

                        <span
                          className={`text-[10px] font-bold ${
                            message.length >= 950
                              ? "text-amber-600"
                              : "text-zinc-400"
                          }`}
                        >
                          {message.length}/1000
                        </span>
                      </div>

                      <textarea
                        id="maintenance-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        maxLength={1000}
                        rows={5}
                        disabled={saving}
                        placeholder="We are currently performing maintenance. Please try again later."
                        className="
                          w-full
                          resize-none
                          rounded-xl
                          border
                          border-zinc-200
                          bg-white
                          px-4
                          py-3
                          text-sm
                          font-medium
                          leading-6
                          text-zinc-900
                          outline-none
                          transition-all
                          placeholder:text-zinc-400
                          hover:border-zinc-300
                          focus:border-zinc-400
                          focus:ring-4
                          focus:ring-zinc-100
                          disabled:cursor-not-allowed
                          disabled:bg-zinc-100
                          disabled:text-zinc-500
                        "
                      />
                    </div>
                  </div>
                </section>

                {/* =================================================
                    USER ACCESS
                ================================================== */}

                <section>
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-zinc-950" />

                      <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-600">
                        User Access
                      </h3>
                    </div>

                    <p className="mt-1.5 text-xs font-medium text-zinc-400">
                      Decide whether users can continue using FinTrack while
                      maintenance is active.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Allow */}

                    <button
                      type="button"
                      onClick={() => setAllowUserAccess(true)}
                      disabled={saving}
                      className={`
                        group
                        cursor-pointer
                        rounded-2xl
                        border
                        p-4
                        text-left
                        transition-all
                        active:scale-[0.99]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        ${
                          allowUserAccess
                            ? "border-emerald-300 bg-emerald-50/80 shadow-sm shadow-emerald-100"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            ${
                              allowUserAccess
                                ? "bg-white text-emerald-600 shadow-sm"
                                : "bg-zinc-100 text-zinc-500"
                            }
                          `}
                        >
                          <ShieldCheck size={18} />
                        </div>

                        {allowUserAccess && (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-600"
                          />
                        )}
                      </div>

                      <p className="mt-3 text-sm font-bold text-zinc-900">
                        Yes, users can access the app
                      </p>

                      <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                        Users will see a maintenance warning but can continue
                        using FinTrack.
                      </p>
                    </button>

                    {/* Restrict */}

                    <button
                      type="button"
                      onClick={() => setAllowUserAccess(false)}
                      disabled={saving}
                      className={`
                        group
                        cursor-pointer
                        rounded-2xl
                        border
                        p-4
                        text-left
                        transition-all
                        active:scale-[0.99]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        ${
                          !allowUserAccess
                            ? "border-red-300 bg-red-50/80 shadow-sm shadow-red-100"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            ${
                              !allowUserAccess
                                ? "bg-white text-red-600 shadow-sm"
                                : "bg-zinc-100 text-zinc-500"
                            }
                          `}
                        >
                          <LockKeyhole size={18} />
                        </div>

                        {!allowUserAccess && (
                          <CheckCircle2 size={18} className="text-red-600" />
                        )}
                      </div>

                      <p className="mt-3 text-sm font-bold text-zinc-900">
                        No, users cannot access the app
                      </p>

                      <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
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
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-zinc-950" />

                      <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-600">
                        Maintenance Schedule
                      </h3>
                    </div>

                    <p className="mt-1.5 text-xs font-medium text-zinc-400">
                      Configure when maintenance becomes active and when it
                      ends.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Start */}

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                      <label
                        htmlFor="maintenance-start"
                        className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-700"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                          <CalendarDays size={14} />
                        </span>
                        Start Date
                      </label>

                      <input
                        id="maintenance-start"
                        type="datetime-local"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        disabled={saving}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-zinc-200
                          bg-white
                          px-3.5
                          py-2.5
                          text-sm
                          font-medium
                          text-zinc-900
                          outline-none
                          transition-all
                          hover:border-zinc-300
                          focus:border-zinc-400
                          focus:ring-4
                          focus:ring-zinc-100
                          disabled:cursor-not-allowed
                          disabled:bg-zinc-100
                        "
                      />

                      <p className="mt-2 text-[10px] font-medium leading-5 text-zinc-400">
                        Leave empty to start maintenance immediately when
                        enabled.
                      </p>
                    </div>

                    {/* End */}

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                      <label
                        htmlFor="maintenance-end"
                        className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-700"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                          <Clock3 size={14} />
                        </span>
                        End Date
                      </label>

                      <input
                        id="maintenance-end"
                        type="datetime-local"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        min={startDate || undefined}
                        disabled={saving}
                        className="
                          w-full
                          rounded-xl
                          border
                          border-zinc-200
                          bg-white
                          px-3.5
                          py-2.5
                          text-sm
                          font-medium
                          text-zinc-900
                          outline-none
                          transition-all
                          hover:border-zinc-300
                          focus:border-zinc-400
                          focus:ring-4
                          focus:ring-zinc-100
                          disabled:cursor-not-allowed
                          disabled:bg-zinc-100
                        "
                      />

                      <p className="mt-2 text-[10px] font-medium leading-5 text-zinc-400">
                        Leave empty to keep maintenance active until manually
                        disabled.
                      </p>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    LIVE PREVIEW
                ================================================== */}

                <section>
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-zinc-950" />

                      <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-600">
                        Live Preview
                      </h3>
                    </div>

                    <p className="mt-1.5 text-xs font-medium text-zinc-400">
                      This preview updates instantly as you change the
                      configuration.
                    </p>
                  </div>

                  {/* Preview card */}

                  <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100/70 p-3 sm:p-4">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                      {/* Preview header */}

                      <div className="border-b border-zinc-100 px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              ${
                                enabled
                                  ? allowUserAccess
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-red-50 text-red-600"
                                  : "bg-zinc-100 text-zinc-500"
                              }
                            `}
                          >
                            <Wrench size={18} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-full
                                  border
                                  px-2.5
                                  py-1
                                  text-[9px]
                                  font-extrabold
                                  ${
                                    !enabled
                                      ? "border-zinc-200 bg-zinc-100 text-zinc-600"
                                      : allowUserAccess
                                        ? "border-amber-200 bg-amber-50 text-amber-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                  }
                                `}
                              >
                                <span
                                  className={`
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    ${
                                      !enabled
                                        ? "bg-zinc-400"
                                        : allowUserAccess
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                    }
                                  `}
                                />

                                {!enabled ? "Disabled" : "Maintenance Active"}
                              </span>
                            </div>

                            <p className="mt-1.5 truncate text-sm font-black text-zinc-950">
                              {previewTitle}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Preview body */}

                      <div className="px-4 py-5 sm:px-5">
                        <div
                          className={`
                            rounded-2xl
                            border
                            p-4
                            ${
                              !enabled
                                ? "border-zinc-200 bg-zinc-50"
                                : allowUserAccess
                                  ? "border-amber-200 bg-amber-50/70"
                                  : "border-red-200 bg-red-50/70"
                            }
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-white
                                text-zinc-500
                                shadow-sm
                              "
                            >
                              <Info size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900">
                                {enabled
                                  ? previewTitle
                                  : "Maintenance mode is disabled"}
                              </p>

                              <p className="mt-1.5 break-words text-[11px] font-medium leading-5 text-zinc-600">
                                {enabled
                                  ? previewMessage
                                  : "Users will continue using FinTrack normally."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Access preview */}

                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                          {enabled && !allowUserAccess ? (
                            <>
                              <LockKeyhole size={14} className="text-red-600" />

                              <p className="text-[10px] font-bold text-red-800">
                                Restricted access screen will be shown to users.
                              </p>
                            </>
                          ) : enabled && allowUserAccess ? (
                            <>
                              <ShieldCheck
                                size={14}
                                className="text-emerald-600"
                              />

                              <p className="text-[10px] font-bold text-emerald-800">
                                Users can continue using the app.
                              </p>
                            </>
                          ) : (
                            <>
                              <CheckCircle2
                                size={14}
                                className="text-zinc-500"
                              />

                              <p className="text-[10px] font-bold text-zinc-600">
                                Normal app operation.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    HOW IT WORKS
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
                    <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                        1
                      </span>

                      <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                        Maintenance becomes active only when it is enabled and
                        the current time is within the configured schedule.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                        2
                      </span>

                      <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                        If user access is allowed, the mobile app remains usable
                        and displays a maintenance warning.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                        3
                      </span>

                      <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                        If user access is disabled, the mobile app displays the
                        restricted maintenance screen.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-blue-100/80 bg-white/70 p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-extrabold text-blue-700">
                        4
                      </span>

                      <p className="text-[10px] font-medium leading-5 text-blue-900/75">
                        Leaving the end date empty keeps maintenance active
                        until it is manually disabled.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* ==================================================
                FOOTER
            =================================================== */}

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
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />

                  <span className="truncate">
                    Review your changes before saving.
                  </span>
                </div>

                <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="
                      inline-flex
                      min-h-[43px]
                      cursor-pointer
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-zinc-200
                      bg-white
                      px-5
                      text-xs
                      font-extrabold
                      text-zinc-700
                      transition-all
                      hover:border-zinc-300
                      hover:bg-zinc-50
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="
                      inline-flex
                      min-h-[43px]
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
                      shadow-zinc-950/15
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-zinc-800
                      active:translate-y-0
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    <Save size={15} />
                    Save Changes
                  </button>
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
