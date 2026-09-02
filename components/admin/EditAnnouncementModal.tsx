"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Loader2,
  Megaphone,
  Link2,
  Power,
  X,
  CalendarDays,
  Sparkles,
  Save,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "feature";
  isActive?: boolean;
  startDate?: string;
  endDate?: string | null;
  action?: {
    enabled?: boolean;
    label?: string;
    route?: string;
  };
};

type EditAnnouncementModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onSaved: () => void;
};

type AnnouncementType = "info" | "success" | "warning" | "feature";

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

const typeOptions: {
  value: AnnouncementType;
  label: string;
  description: string;
  badge: string;
  dot: string;
}[] = [
  {
    value: "info",
    label: "Info",
    description: "General information",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  {
    value: "success",
    label: "Success",
    description: "Positive update",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    value: "warning",
    label: "Warning",
    description: "Important attention",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    value: "feature",
    label: "Feature",
    description: "New feature or release",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
];

export default function EditAnnouncementModal({
  announcement,
  onClose,
  onSaved,
}: EditAnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [type, setType] = useState<AnnouncementType>("info");

  const [isActive, setIsActive] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [actionEnabled, setActionEnabled] = useState(false);

  const [actionLabel, setActionLabel] = useState("");
  const [actionRoute, setActionRoute] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!announcement) return;

    setTitle(announcement.title || "");
    setMessage(announcement.message || "");
    setType(announcement.type || "info");
    setIsActive(announcement.isActive ?? true);

    setStartDate(toDateTimeLocal(announcement.startDate));

    setEndDate(toDateTimeLocal(announcement.endDate));

    setActionEnabled(announcement.action?.enabled ?? false);

    setActionLabel(announcement.action?.label || "");

    setActionRoute(announcement.action?.route || "");

    setError("");
    setShowConfirm(false);
  }, [announcement]);

  useEffect(() => {
    if (!announcement) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        if (showConfirm) {
          setShowConfirm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [announcement, loading, showConfirm, onClose]);

  if (!announcement) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!message.trim()) {
      setError("Message is required.");
      return;
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }

    if (actionEnabled && !actionLabel.trim()) {
      setError("Button label is required when the action is enabled.");
      return;
    }

    if (actionEnabled && !actionRoute.trim()) {
      setError("App route is required when the action is enabled.");
      return;
    }

    setError("");
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      setError("");

      await adminApi(`/admin/announcements/${announcement._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          isActive,
          startDate: startDate || undefined,
          endDate: endDate || null,
          action: {
            enabled: actionEnabled,
            ...(actionEnabled
              ? {
                  label: actionLabel.trim(),
                  route: actionRoute.trim(),
                }
              : {}),
          },
        }),
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update announcement.",
      );

      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedType =
    typeOptions.find((item) => item.value === type) || typeOptions[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-2 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-announcement-title"
    >
      <div className="relative flex max-h-[calc(100dvh-16px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-32px)]">
        {/* =====================================================
            TOP ACCENT
        ====================================================== */}

        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
              <Megaphone size={21} strokeWidth={2} />

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white">
                <Sparkles size={9} />
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-500">
                Announcement Management
              </p>

              <h2
                id="edit-announcement-title"
                className="mt-1 text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl"
              >
                Edit Announcement
              </h2>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Update the content, visibility, schedule, and optional action.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close edit announcement"
            className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <X
              size={18}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* =====================================================
            CONFIRMATION
        ====================================================== */}

        {showConfirm ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-7 sm:py-10">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
                <HelpCircle size={30} strokeWidth={1.8} />
              </div>

              <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-600">
                Review Changes
              </p>

              <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-zinc-950">
                Confirm Announcement Update
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-zinc-500">
                Are you sure you want to save these changes to this
                announcement?
              </p>

              {/* Summary */}

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                    <Megaphone size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                      Announcement
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-zinc-900">
                      {title || "Untitled Announcement"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-200 pt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${selectedType.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${selectedType.dot}`}
                    />
                    {selectedType.label}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                      isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-emerald-500" : "bg-zinc-400"
                      }`}
                    />

                    {isActive ? "Active" : "Inactive"}
                  </span>

                  {actionEnabled && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-bold text-violet-700">
                      <Link2 size={10} />
                      Action Enabled
                    </span>
                  )}
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setShowConfirm(false);
                    setError("");
                  }}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmSave}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-xs font-bold text-white shadow-lg shadow-zinc-950/15 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Yes, Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ===================================================
             FORM
          ==================================================== */

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
              <div className="space-y-6">
                {error && <ErrorMessage message={error} />}

                {/* =================================================
                    CONTENT
                ================================================== */}

                <FormSection
                  icon={<Megaphone size={15} />}
                  title="Announcement Content"
                  description="The information shown to FinTrack users."
                >
                  <div className="space-y-5">
                    <Field label="Title" required count={`${title.length}/120`}>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={120}
                        disabled={loading}
                        placeholder="Enter announcement title"
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Message"
                      required
                      count={`${message.length}/1000`}
                    >
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={1000}
                        rows={6}
                        disabled={loading}
                        placeholder="Write the announcement message that users will see..."
                        className={`${inputClass} min-h-[150px] resize-y py-3.5 leading-6`}
                      />
                    </Field>
                  </div>
                </FormSection>

                {/* =================================================
                    TYPE
                ================================================== */}

                <FormSection
                  icon={<Sparkles size={15} />}
                  title="Announcement Type"
                  description="Choose how this announcement should be presented."
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {typeOptions.map((option) => {
                      const selected = type === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={loading}
                          onClick={() => setType(option.value)}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 ${
                            selected
                              ? "border-zinc-300 bg-zinc-50 shadow-sm ring-2 ring-zinc-950/5"
                              : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${option.badge}`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${option.dot}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-zinc-900">
                              {option.label}
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-zinc-400">
                              {option.description}
                            </p>
                          </div>

                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-zinc-950 bg-zinc-950"
                                : "border-zinc-300 bg-white"
                            }`}
                          >
                            {selected && (
                              <CheckCircle2 size={13} className="text-white" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </FormSection>

                {/* =================================================
                    VISIBILITY & SCHEDULE
                ================================================== */}

                <FormSection
                  icon={<Power size={15} />}
                  title="Visibility & Schedule"
                  description="Control when this announcement is available."
                >
                  <div className="space-y-4">
                    <ToggleCard
                      checked={isActive}
                      onChange={setIsActive}
                      disabled={loading}
                      title="Active announcement"
                      description="Active announcements can be displayed to mobile users."
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field label="Start Date">
                        <div className="relative">
                          <CalendarDays
                            size={16}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                          />

                          <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={loading}
                            className={`${inputClass} pl-11`}
                          />
                        </div>

                        <p className="mt-1.5 text-[10px] font-medium text-zinc-400">
                          When the announcement becomes active.
                        </p>
                      </Field>

                      <Field label="End Date">
                        <div className="relative">
                          <CalendarDays
                            size={16}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                          />

                          <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={loading}
                            className={`${inputClass} pl-11`}
                          />
                        </div>

                        <p className="mt-1.5 text-[10px] font-medium text-zinc-400">
                          Leave empty for no expiration.
                        </p>
                      </Field>
                    </div>
                  </div>
                </FormSection>

                {/* =================================================
                    ACTION BUTTON
                ================================================== */}

                <FormSection
                  icon={<Link2 size={15} />}
                  title="Optional Action"
                  description="Add a button that takes users to a specific app screen."
                >
                  <div className="space-y-4">
                    <ToggleCard
                      checked={actionEnabled}
                      onChange={setActionEnabled}
                      disabled={loading}
                      title="Enable action button"
                      description="Add an interactive button to this announcement."
                      accent="violet"
                    />

                    {actionEnabled && (
                      <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                            <Link2 size={14} />
                          </div>

                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-violet-600">
                              Action Configuration
                            </p>

                            <p className="text-[10px] font-medium text-violet-700/60">
                              Configure the button shown to users.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Field
                            label="Button Label"
                            required
                            count={`${actionLabel.length}/50`}
                          >
                            <input
                              value={actionLabel}
                              onChange={(e) => setActionLabel(e.target.value)}
                              maxLength={50}
                              disabled={loading}
                              placeholder="e.g. View Budget"
                              className={inputClass}
                            />
                          </Field>

                          <Field
                            label="App Route"
                            required
                            count={`${actionRoute.length}/200`}
                          >
                            <input
                              value={actionRoute}
                              onChange={(e) => setActionRoute(e.target.value)}
                              maxLength={200}
                              disabled={loading}
                              placeholder="e.g. /budget"
                              className={`${inputClass} font-mono`}
                            />

                            <p className="mt-1.5 text-[10px] font-medium text-zinc-400">
                              Use the route supported by your mobile app.
                            </p>
                          </Field>
                        </div>
                      </div>
                    )}
                  </div>
                </FormSection>

                {/* =================================================
                    EXISTING RECORD
                ================================================== */}

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-400 shadow-sm ring-1 ring-zinc-200">
                      <CheckCircle2 size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                        Editing Existing Announcement
                      </p>

                      <p className="mt-1 break-all font-mono text-[10px] font-medium text-zinc-500">
                        {announcement._id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================
                FOOTER
            ==================================================== */}

            <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/80 px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="hidden text-[10px] font-medium text-zinc-400 sm:block">
                  Changes will be saved to the announcement record.
                </p>

                <div className="flex w-full flex-col-reverse gap-2.5 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onClose}
                    className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-xs font-bold text-white shadow-lg shadow-zinc-950/15 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* =============================================================
   FORM SECTION
============================================================= */

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3.5 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-xs font-extrabold text-zinc-900">{title}</h3>

          <p className="mt-0.5 text-[10px] font-medium leading-5 text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =============================================================
   FIELD
============================================================= */

function Field({
  label,
  required = false,
  count,
  children,
}: {
  label: string;
  required?: boolean;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {count && (
          <span className="shrink-0 text-[9px] font-semibold tabular-nums text-zinc-400">
            {count}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

/* =============================================================
   TOGGLE CARD
============================================================= */

function ToggleCard({
  checked,
  onChange,
  disabled,
  title,
  description,
  accent = "emerald",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  title: string;
  description: string;
  accent?: "emerald" | "violet";
}) {
  const isViolet = accent === "violet";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.995] disabled:pointer-events-none disabled:opacity-60 ${
        checked
          ? isViolet
            ? "border-violet-200 bg-violet-50/50"
            : "border-emerald-200 bg-emerald-50/40"
          : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            checked
              ? isViolet
                ? "bg-violet-100 text-violet-600"
                : "bg-emerald-100 text-emerald-600"
              : "bg-zinc-100 text-zinc-400"
          }`}
        >
          <Power size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-900">{title}</p>

          <p className="mt-0.5 text-[10px] font-medium leading-5 text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      {/* Switch */}

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${
          checked
            ? isViolet
              ? "bg-violet-600"
              : "bg-emerald-500"
            : "bg-zinc-300"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

/* =============================================================
   ERROR
============================================================= */

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
        <AlertCircle size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-red-700">
          Unable to continue
        </p>

        <p className="mt-0.5 break-words text-[11px] font-medium leading-5 text-red-600">
          {message}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   INPUT STYLE
============================================================= */

const inputClass =
  "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-300 hover:border-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";
