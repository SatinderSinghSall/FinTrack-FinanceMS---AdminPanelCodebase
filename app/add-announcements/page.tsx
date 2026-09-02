"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Info,
  Link2,
  Loader2,
  Megaphone,
  Save,
  Sparkles,
  ToggleLeft,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type AnnouncementType = "info" | "success" | "warning" | "feature";

type FieldErrors = {
  title?: string;
  message?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  actionLabel?: string;
  actionRoute?: string;
};

const TYPE_OPTIONS: {
  value: AnnouncementType;
  label: string;
  description: string;
}[] = [
  {
    value: "info",
    label: "Information",
    description: "General information or important updates.",
  },
  {
    value: "success",
    label: "Success",
    description: "Positive news, achievements, or confirmations.",
  },
  {
    value: "warning",
    label: "Warning",
    description: "Important notices that need user attention.",
  },
  {
    value: "feature",
    label: "New Feature",
    description: "Introduce a new FinTrack feature or improvement.",
  },
];

const getDefaultStartDate = () => {
  const date = new Date();

  date.setSeconds(0, 0);

  return date.toISOString().slice(0, 16);
};

const formatPreviewDate = (value: string) => {
  if (!value) return "Immediately";

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

export default function AddAnnouncementPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AnnouncementType>("info");

  const [isActive, setIsActive] = useState(true);

  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState("");

  const [actionEnabled, setActionEnabled] = useState(false);
  const [actionLabel, setActionLabel] = useState("");
  const [actionRoute, setActionRoute] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const selectedType = TYPE_OPTIONS.find((item) => item.value === type);

  const validateFields = (): FieldErrors => {
    const errors: FieldErrors = {};

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    const trimmedActionLabel = actionLabel.trim();
    const trimmedActionRoute = actionRoute.trim();

    if (!trimmedTitle) {
      errors.title = "Announcement title is required.";
    } else if (trimmedTitle.length > 120) {
      errors.title = "Title cannot exceed 120 characters.";
    }

    if (!trimmedMessage) {
      errors.message = "Announcement message is required.";
    } else if (trimmedMessage.length > 1000) {
      errors.message = "Message cannot exceed 1000 characters.";
    }

    if (!type) {
      errors.type = "Announcement type is required.";
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end <= start
      ) {
        errors.endDate = "End date must be later than the start date.";
      }
    }

    if (actionEnabled) {
      if (!trimmedActionLabel) {
        errors.actionLabel = "Action button label is required.";
      } else if (trimmedActionLabel.length > 50) {
        errors.actionLabel = "Action label cannot exceed 50 characters.";
      }

      if (!trimmedActionRoute) {
        errors.actionRoute = "Action route is required.";
      } else if (trimmedActionRoute.length > 200) {
        errors.actionRoute = "Action route cannot exceed 200 characters.";
      }
    }

    return errors;
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setError("");
    setSuccess("");
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    const errors = validateFields();

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(
        "Please review the highlighted fields before creating the announcement.",
      );
      return;
    }

    try {
      setSaving(true);

      const response = await adminApi("/admin/announcements", {
        method: "POST",
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

      setSuccess(response.message || "Announcement created successfully.");

      setFieldErrors({});

      // Give the success message a moment before returning.
      setTimeout(() => {
        router.push("/announcements");
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create announcement.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-0 px-4 py-5 font-sans sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-12">
        {/* =====================================================
            BACK BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="group inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-bold text-zinc-600 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowLeft
            size={15}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />

          <span>Back</span>
        </button>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-zinc-400">
                User Communication
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-[-0.035em] text-zinc-950 sm:text-4xl">
                Add Announcement
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
              Create an announcement that can be displayed to FinTrack users
              inside the mobile app.
            </p>
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
              <AlertCircle size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-extrabold text-red-800">
                Unable to create announcement
              </p>

              <p className="mt-0.5 text-xs font-medium leading-5 text-red-700">
                {error}
              </p>
            </div>
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 size={17} />
            </div>

            <div>
              <p className="text-xs font-extrabold text-emerald-800">
                Announcement created
              </p>

              <p className="mt-0.5 text-xs font-medium leading-5 text-emerald-700">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ===================================================
              FORM
          ==================================================== */}

          <section className="min-w-0 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_10px_35px_-25px_rgba(0,0,0,0.35)]">
            {/* Card Header */}

            <div className="border-b border-zinc-100 px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                  <Megaphone size={21} strokeWidth={1.9} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold tracking-tight text-zinc-950">
                      Announcement Details
                    </h2>

                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-600">
                      New
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Configure the message, visibility, schedule, and optional
                    action.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}

            <div className="space-y-8 px-5 py-6 sm:px-7 sm:py-7">
              {/* =================================================
                  CONTENT
              ================================================== */}

              <div>
                <div className="mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Content
                  </h3>

                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Write the announcement users will see in FinTrack.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Title */}

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="title"
                        className="text-xs font-bold text-zinc-800"
                      >
                        Title
                      </label>

                      <span
                        className={`text-[10px] font-bold ${
                          title.length > 120 ? "text-red-600" : "text-zinc-400"
                        }`}
                      >
                        {title.length}/120
                      </span>
                    </div>

                    <input
                      id="title"
                      type="text"
                      maxLength={120}
                      value={title}
                      disabled={saving}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearFieldError("title");
                      }}
                      placeholder="e.g. New budget insights are here"
                      aria-invalid={Boolean(fieldErrors.title)}
                      className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 ${
                        fieldErrors.title
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />

                    {fieldErrors.title ? (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />

                        {fieldErrors.title}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11px] font-medium text-zinc-400">
                        Keep the title short and easy to understand.
                      </p>
                    )}
                  </div>

                  {/* Message */}

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="message"
                        className="text-xs font-bold text-zinc-800"
                      >
                        Message
                      </label>

                      <span
                        className={`text-[10px] font-bold ${
                          message.length > 1000
                            ? "text-red-600"
                            : "text-zinc-400"
                        }`}
                      >
                        {message.length}/1000
                      </span>
                    </div>

                    <textarea
                      id="message"
                      rows={5}
                      maxLength={1000}
                      value={message}
                      disabled={saving}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        clearFieldError("message");
                      }}
                      placeholder="Write the announcement message users will see..."
                      aria-invalid={Boolean(fieldErrors.message)}
                      className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm font-medium leading-6 text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 ${
                        fieldErrors.message
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />

                    {fieldErrors.message ? (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />

                        {fieldErrors.message}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11px] font-medium text-zinc-400">
                        This message will be displayed to users along with the
                        announcement title.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  TYPE
              ================================================== */}

              <div>
                <div className="mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Announcement Type
                  </h3>

                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Choose how this announcement should be presented.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {TYPE_OPTIONS.map((option) => {
                    const selected = type === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setType(option.value);
                          clearFieldError("type");
                        }}
                        className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                          selected
                            ? "border-blue-300 bg-blue-50/60 shadow-sm"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        } disabled:pointer-events-none disabled:opacity-50`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              selected
                                ? "bg-white text-blue-600 shadow-sm"
                                : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            <Info size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold capitalize text-zinc-900">
                              {option.label}
                            </p>

                            <p className="mt-1 text-[11px] font-medium leading-4 text-zinc-500">
                              {option.description}
                            </p>
                          </div>

                          <span
                            className={`ml-auto mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${
                              selected
                                ? "border-blue-600 bg-blue-600"
                                : "border-zinc-300 bg-white"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =================================================
                  VISIBILITY & SCHEDULE
              ================================================== */}

              <div>
                <div className="mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Visibility & Schedule
                  </h3>

                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Control when the announcement becomes visible and when it
                    expires.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Active */}

                  <div
                    className={`rounded-2xl border p-4 transition-colors ${
                      isActive
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-zinc-200 bg-zinc-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${
                            isActive ? "text-emerald-600" : "text-zinc-500"
                          }`}
                        >
                          <ToggleLeft size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900">
                            Active Announcement
                          </p>

                          <p className="mt-1 max-w-xl text-xs font-medium leading-5 text-zinc-500">
                            Active announcements can be shown to users when
                            their schedule is valid.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        aria-label="Toggle announcement active status"
                        disabled={saving}
                        onClick={() => setIsActive((current) => !current)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${
                          isActive ? "bg-emerald-500" : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            isActive
                              ? "translate-x-[22px]"
                              : "translate-x-[2px]"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2 border-t border-zinc-200/70 pt-3">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-zinc-400"
                        }`}
                      />

                      <span className="text-[11px] font-semibold text-zinc-500">
                        {isActive
                          ? "This announcement will be active after creation."
                          : "This announcement will be created as inactive."}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="mb-2 block text-xs font-bold text-zinc-800"
                      >
                        Start Date
                      </label>

                      <div className="relative">
                        <Calendar
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        />

                        <input
                          id="startDate"
                          type="datetime-local"
                          value={startDate}
                          disabled={saving}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            clearFieldError("startDate");
                            clearFieldError("endDate");
                          }}
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3.5 text-sm font-medium text-zinc-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50"
                        />
                      </div>

                      <p className="mt-1.5 text-[11px] font-medium text-zinc-400">
                        When the announcement becomes eligible to display.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="mb-2 block text-xs font-bold text-zinc-800"
                      >
                        End Date
                      </label>

                      <div className="relative">
                        <Calendar
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        />

                        <input
                          id="endDate"
                          type="datetime-local"
                          value={endDate}
                          disabled={saving}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            clearFieldError("endDate");
                          }}
                          className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3.5 text-sm font-medium text-zinc-900 outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 ${
                            fieldErrors.endDate
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                          }`}
                        />
                      </div>

                      {fieldErrors.endDate ? (
                        <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600">
                          <AlertCircle size={13} className="mt-0.5 shrink-0" />

                          {fieldErrors.endDate}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-[11px] font-medium text-zinc-400">
                          Leave empty to keep the announcement active
                          indefinitely.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ACTION
              ================================================== */}

              <div>
                <div className="mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Optional Action
                  </h3>

                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Add a button that takes users to a specific area of the app.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-4 transition-colors ${
                    actionEnabled
                      ? "border-blue-200 bg-blue-50/40"
                      : "border-zinc-200 bg-zinc-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${
                          actionEnabled ? "text-blue-600" : "text-zinc-500"
                        }`}
                      >
                        <Link2 size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-zinc-900">
                          Add Action Button
                        </p>

                        <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                          Give users a direct way to continue from the
                          announcement.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={actionEnabled}
                      aria-label="Toggle announcement action"
                      disabled={saving}
                      onClick={() => {
                        setActionEnabled((current) => !current);

                        if (actionEnabled) {
                          setActionLabel("");
                          setActionRoute("");
                          setFieldErrors((current) => ({
                            ...current,
                            actionLabel: undefined,
                            actionRoute: undefined,
                          }));
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${
                        actionEnabled ? "bg-blue-600" : "bg-zinc-300"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          actionEnabled
                            ? "translate-x-[22px]"
                            : "translate-x-[2px]"
                        }`}
                      />
                    </button>
                  </div>

                  {actionEnabled && (
                    <div className="mt-5 grid grid-cols-1 gap-5 border-t border-blue-100 pt-5 sm:grid-cols-2">
                      {/* Label */}

                      <div>
                        <label
                          htmlFor="actionLabel"
                          className="mb-2 block text-xs font-bold text-zinc-800"
                        >
                          Button Label
                        </label>

                        <input
                          id="actionLabel"
                          type="text"
                          maxLength={50}
                          value={actionLabel}
                          disabled={saving}
                          onChange={(e) => {
                            setActionLabel(e.target.value);
                            clearFieldError("actionLabel");
                          }}
                          placeholder="e.g. View Budget"
                          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 ${
                            fieldErrors.actionLabel
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                          }`}
                        />

                        {fieldErrors.actionLabel && (
                          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600">
                            <AlertCircle
                              size={13}
                              className="mt-0.5 shrink-0"
                            />

                            {fieldErrors.actionLabel}
                          </p>
                        )}
                      </div>

                      {/* Route */}

                      <div>
                        <label
                          htmlFor="actionRoute"
                          className="mb-2 block text-xs font-bold text-zinc-800"
                        >
                          App Route
                        </label>

                        <input
                          id="actionRoute"
                          type="text"
                          maxLength={200}
                          value={actionRoute}
                          disabled={saving}
                          onChange={(e) => {
                            setActionRoute(e.target.value);
                            clearFieldError("actionRoute");
                          }}
                          placeholder="e.g. /budget"
                          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 ${
                            fieldErrors.actionRoute
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                          }`}
                        />

                        {fieldErrors.actionRoute && (
                          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600">
                            <AlertCircle
                              size={13}
                              className="mt-0.5 shrink-0"
                            />

                            {fieldErrors.actionRoute}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                SAVE FOOTER
            ================================================== */}

            <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
                  <Info size={14} />

                  <span>
                    The announcement will be available through the mobile
                    announcements endpoint.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-xs font-bold text-white shadow-lg shadow-zinc-950/10 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Create Announcement
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ===================================================
              SIDEBAR
          ==================================================== */}

          <aside className="space-y-6">
            {/* =================================================
                PREVIEW
            ================================================== */}

            <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_10px_35px_-25px_rgba(0,0,0,0.35)]">
              <div className="border-b border-zinc-100 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                      Preview
                    </p>

                    <h2 className="mt-1 text-base font-bold tracking-tight text-zinc-950">
                      User Announcement
                    </h2>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500">
                    <Megaphone size={17} />
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <div
                    className={`h-1 ${
                      type === "success"
                        ? "bg-emerald-500"
                        : type === "warning"
                          ? "bg-amber-500"
                          : type === "feature"
                            ? "bg-violet-500"
                            : "bg-blue-500"
                    }`}
                  />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400">
                          {selectedType?.label || "Information"}
                        </p>

                        <h3 className="mt-1.5 line-clamp-2 text-sm font-bold text-zinc-950">
                          {title.trim() || "Announcement title"}
                        </h3>
                      </div>

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500">
                        <Sparkles size={15} />
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-5 text-xs font-medium leading-5 text-zinc-500">
                      {message.trim() ||
                        "Your announcement message will appear here."}
                    </p>

                    {actionEnabled && (
                      <button
                        type="button"
                        disabled
                        className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-zinc-950 px-3.5 text-[11px] font-bold text-white opacity-90"
                      >
                        {actionLabel.trim() || "Action"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SCHEDULE SUMMARY
            ================================================== */}

            <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_10px_35px_-25px_rgba(0,0,0,0.35)]">
              <div className="border-b border-zinc-100 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Calendar size={15} />
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                      Schedule
                    </p>

                    <h3 className="text-sm font-bold text-zinc-950">
                      Visibility window
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Starts
                  </p>

                  <p className="mt-1 text-xs font-semibold text-zinc-700">
                    {formatPreviewDate(startDate)}
                  </p>
                </div>

                <div className="border-t border-zinc-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Ends
                  </p>

                  <p className="mt-1 text-xs font-semibold text-zinc-700">
                    {endDate ? formatPreviewDate(endDate) : "No expiration"}
                  </p>
                </div>

                <div className="border-t border-zinc-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </section>

            {/* =================================================
                HELP
            ================================================== */}

            <section className="overflow-hidden rounded-3xl border border-blue-100 bg-blue-50/50">
              <div className="border-b border-blue-100/80 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Sparkles size={15} />
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-500">
                      Announcement Logic
                    </p>

                    <h3 className="text-sm font-bold text-blue-950">
                      How visibility works
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                  <div>
                    <p className="text-xs font-bold text-blue-950">Active</p>

                    <p className="mt-0.5 text-[11px] font-medium leading-4 text-blue-900/60">
                      The announcement can be returned to the mobile app when
                      its date range is valid.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                  <div>
                    <p className="text-xs font-bold text-blue-950">Scheduled</p>

                    <p className="mt-0.5 text-[11px] font-medium leading-4 text-blue-900/60">
                      A future start date keeps the announcement hidden until
                      that time.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />

                  <div>
                    <p className="text-xs font-bold text-blue-950">
                      No expiration
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium leading-4 text-blue-900/60">
                      Leaving the end date empty keeps the announcement active
                      indefinitely.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
