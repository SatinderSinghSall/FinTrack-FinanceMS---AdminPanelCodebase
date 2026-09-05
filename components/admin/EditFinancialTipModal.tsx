"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Loader2,
  Lightbulb,
  Link2,
  Power,
  X,
  CalendarDays,
  Sparkles,
  Save,
  Star,
  BookOpen,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type FinancialTip = {
  _id: string;
  title: string;
  shortDescription: string;
  content: string;
  category?: string;
  type?: "tip" | "guide" | "lesson" | "warning";
  isActive?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string | null;
  action?: {
    enabled?: boolean;
    label?: string;
    route?: string;
  };
};

type EditFinancialTipModalProps = {
  financialTip: FinancialTip | null;
  onClose: () => void;
  onSaved: () => void;
};

type FinancialTipType = "tip" | "guide" | "lesson" | "warning";

type FinancialTipCategory =
  | "budgeting"
  | "saving"
  | "expenses"
  | "debt"
  | "investing"
  | "financial-safety"
  | "money-habits"
  | "goals";

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
  value: FinancialTipType;
  label: string;
  description: string;
  badge: string;
  dot: string;
}[] = [
  {
    value: "tip",
    label: "Tip",
    description: "Short practical financial advice",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  {
    value: "guide",
    label: "Guide",
    description: "Step-by-step financial guidance",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  {
    value: "lesson",
    label: "Lesson",
    description: "Educational financial learning",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    value: "warning",
    label: "Warning",
    description: "Important financial safety information",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
];

const categoryOptions: {
  value: FinancialTipCategory;
  label: string;
}[] = [
  { value: "budgeting", label: "Budgeting" },
  { value: "saving", label: "Saving" },
  { value: "expenses", label: "Expenses" },
  { value: "debt", label: "Debt" },
  { value: "investing", label: "Investing" },
  { value: "financial-safety", label: "Financial Safety" },
  { value: "money-habits", label: "Money Habits" },
  { value: "goals", label: "Goals" },
];

const inputClass =
  "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

const textareaClass =
  "w-full resize-y rounded-xl border border-zinc-200 bg-white px-3.5 py-3.5 text-sm font-medium leading-6 text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

export default function EditFinancialTipModal({
  financialTip,
  onClose,
  onSaved,
}: EditFinancialTipModalProps) {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");

  const [category, setCategory] =
    useState<FinancialTipCategory>("money-habits");

  const [type, setType] = useState<FinancialTipType>("tip");

  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [actionEnabled, setActionEnabled] = useState(false);
  const [actionLabel, setActionLabel] = useState("");
  const [actionRoute, setActionRoute] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!financialTip) return;

    setTitle(financialTip.title || "");
    setShortDescription(financialTip.shortDescription || "");
    setContent(financialTip.content || "");

    setCategory(
      (financialTip.category as FinancialTipCategory) || "money-habits",
    );

    setType(financialTip.type || "tip");

    setIsActive(financialTip.isActive ?? true);
    setFeatured(financialTip.featured ?? false);

    setStartDate(toDateTimeLocal(financialTip.startDate));
    setEndDate(toDateTimeLocal(financialTip.endDate));

    setActionEnabled(financialTip.action?.enabled ?? false);
    setActionLabel(financialTip.action?.label || "");
    setActionRoute(financialTip.action?.route || "");

    setError("");
    setShowConfirm(false);
  }, [financialTip]);

  useEffect(() => {
    if (!financialTip) return;

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
  }, [financialTip, loading, showConfirm, onClose]);

  if (!financialTip) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (title.trim().length > 120) {
      setError("Title cannot exceed 120 characters.");
      return;
    }

    if (!shortDescription.trim()) {
      setError("Short description is required.");
      return;
    }

    if (shortDescription.trim().length > 300) {
      setError("Short description cannot exceed 300 characters.");
      return;
    }

    if (!content.trim()) {
      setError("Content is required.");
      return;
    }

    if (content.trim().length > 5000) {
      setError("Content cannot exceed 5000 characters.");
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

    if (actionEnabled && actionLabel.trim().length > 50) {
      setError("Action label cannot exceed 50 characters.");
      return;
    }

    if (actionEnabled && !actionRoute.trim()) {
      setError("App route is required when the action is enabled.");
      return;
    }

    if (actionEnabled && actionRoute.trim().length > 200) {
      setError("Action route cannot exceed 200 characters.");
      return;
    }

    setError("");
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      setError("");

      await adminApi(`/admin/financial-tips/${financialTip._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          shortDescription: shortDescription.trim(),
          content: content.trim(),
          category,
          type,
          isActive,
          featured,
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
        err instanceof Error ? err.message : "Unable to update financial tip.",
      );

      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedType =
    typeOptions.find((item) => item.value === type) || typeOptions[0];

  const selectedCategory =
    categoryOptions.find((item) => item.value === category) ||
    categoryOptions[6];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-2 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-financial-tip-title"
    >
      <div className="relative flex max-h-[calc(100dvh-16px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-32px)]">
        {/* TOP ACCENT */}

        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
              <Lightbulb size={21} strokeWidth={2} />

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white">
                <Sparkles size={9} />
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-500">
                Financial Education Management
              </p>

              <h2
                id="edit-financial-tip-title"
                className="mt-1 text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl"
              >
                Edit Financial Tip
              </h2>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Update the content, category, visibility, schedule, and action.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close edit financial tip"
            className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <X
              size={18}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* CONFIRMATION */}

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
                Confirm Financial Tip Update
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-zinc-500">
                Are you sure you want to save these changes to this financial
                tip?
              </p>

              {/* SUMMARY */}

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                    <Lightbulb size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                      Financial Tip
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-zinc-900">
                      {title || "Untitled Financial Tip"}
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

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-blue-700">
                    {selectedCategory.label}
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

                  {featured && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-bold text-violet-700">
                      <Star size={10} fill="currentColor" />
                      Featured
                    </span>
                  )}

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
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
              <div className="space-y-6">
                {error && <ErrorMessage message={error} />}

                {/* CONTENT */}

                <FormSection
                  icon={<Lightbulb size={15} />}
                  title="Financial Tip Content"
                  description="The educational information shown to FinTrack users."
                >
                  <div className="space-y-5">
                    <Field label="Title" required count={`${title.length}/120`}>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={120}
                        disabled={loading}
                        placeholder="Enter financial tip title"
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Short Description"
                      required
                      count={`${shortDescription.length}/300`}
                    >
                      <textarea
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        maxLength={300}
                        rows={3}
                        disabled={loading}
                        placeholder="Write a short description users will see..."
                        className={`${textareaClass} min-h-[90px]`}
                      />
                    </Field>

                    <Field
                      label="Content"
                      required
                      count={`${content.length}/5000`}
                    >
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={5000}
                        rows={8}
                        disabled={loading}
                        placeholder="Write the full financial education content..."
                        className={`${textareaClass} min-h-[180px]`}
                      />
                    </Field>
                  </div>
                </FormSection>

                {/* TYPE */}

                <FormSection
                  icon={<Sparkles size={15} />}
                  title="Content Type"
                  description="Choose how this financial education content should be presented."
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {typeOptions.map((option) => {
                      const selected = type === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={loading}
                          onClick={() => setType(option.value)}
                          className={`relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                            selected
                              ? "border-blue-300 bg-blue-50/60 ring-4 ring-blue-500/5"
                              : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                          } disabled:pointer-events-none disabled:opacity-60`}
                        >
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                              selected
                                ? option.badge.split(" ").slice(1).join(" ")
                                : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            <BookOpen size={15} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">
                                {option.label}
                              </span>

                              {selected && (
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold ${option.badge}`}
                                >
                                  Selected
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-[11px] font-medium leading-5 text-zinc-500">
                              {option.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </FormSection>

                {/* CATEGORY */}

                <FormSection
                  icon={<TagIcon />}
                  title="Category"
                  description="Organize the content by financial topic."
                >
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as FinancialTipCategory)
                      }
                      disabled={loading}
                      className={`${inputClass} cursor-pointer appearance-none pr-10`}
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                </FormSection>

                {/* VISIBILITY */}

                <FormSection
                  icon={<Power size={15} />}
                  title="Visibility & Schedule"
                  description="Control where and when this content is available."
                >
                  <div className="space-y-4">
                    <ToggleCard
                      icon={<Power size={16} />}
                      title="Active"
                      description="Allow this financial tip to be shown to users."
                      enabled={isActive}
                      onChange={setIsActive}
                      disabled={loading}
                    />

                    <ToggleCard
                      icon={<Star size={16} />}
                      title="Featured"
                      description="Highlight this financial tip as featured content."
                      enabled={featured}
                      onChange={setFeatured}
                      disabled={loading}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Start Date">
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={loading}
                            className={`${inputClass} pr-10`}
                          />

                          <CalendarDays
                            size={15}
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                          />
                        </div>
                      </Field>

                      <Field label="End Date">
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={loading}
                            className={`${inputClass} pr-10`}
                          />

                          <CalendarDays
                            size={15}
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                          />
                        </div>
                      </Field>
                    </div>
                  </div>
                </FormSection>

                {/* ACTION */}

                <FormSection
                  icon={<Link2 size={15} />}
                  title="Optional Action"
                  description="Optionally let users open a specific screen from this content."
                >
                  <div className="space-y-4">
                    <ToggleCard
                      icon={<Link2 size={16} />}
                      title="Enable Action Button"
                      description="Show an action button with this financial tip."
                      enabled={actionEnabled}
                      onChange={setActionEnabled}
                      disabled={loading}
                    />

                    {actionEnabled && (
                      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:grid-cols-2">
                        <Field label="Button Label" required>
                          <input
                            value={actionLabel}
                            onChange={(e) => setActionLabel(e.target.value)}
                            maxLength={50}
                            disabled={loading}
                            placeholder="e.g. View Budget"
                            className={inputClass}
                          />
                        </Field>

                        <Field label="App Route" required>
                          <input
                            value={actionRoute}
                            onChange={(e) => setActionRoute(e.target.value)}
                            maxLength={200}
                            disabled={loading}
                            placeholder="e.g. /budget"
                            className={`${inputClass} font-mono text-xs`}
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                </FormSection>

                {/* EXISTING RECORD */}

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                      <HashIcon />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                        Existing Record
                      </p>

                      <p className="mt-1 text-xs font-bold text-zinc-800">
                        Financial Tip ID
                      </p>

                      <p className="mt-1 break-all font-mono text-[10px] font-medium text-zinc-400">
                        {financialTip._id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/70 px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-xs font-bold text-white shadow-lg shadow-zinc-950/15 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Review Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

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
    <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-extrabold text-zinc-900">{title}</p>

          <p className="mt-0.5 text-[11px] font-medium leading-5 text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

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
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs font-bold text-zinc-800">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {count && (
          <span className="text-[10px] font-bold text-zinc-400">{count}</span>
        )}
      </div>

      {children}
    </div>
  );
}

function ToggleCard({
  icon,
  title,
  description,
  enabled,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all ${
        enabled
          ? "border-blue-200 bg-blue-50/50"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      } disabled:pointer-events-none disabled:opacity-60`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            enabled ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-900">{title}</p>

          <p className="mt-0.5 text-[11px] font-medium leading-5 text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}

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
        <p className="text-[11px] font-extrabold text-red-800">
          Unable to update financial tip
        </p>

        <p className="mt-0.5 text-[11px] font-medium leading-5 text-red-700">
          {message}
        </p>
      </div>
    </div>
  );
}

function TagIcon() {
  return <span className="text-sm">#</span>;
}

function HashIcon() {
  return <span className="font-mono text-sm font-bold">#</span>;
}
