"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Info,
  Lightbulb,
  Save,
  ShieldAlert,
  Sparkles,
  Star,
  Tag,
  Target,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { adminApi } from "@/lib/api";

type FinancialTipCategory =
  | "budgeting"
  | "saving"
  | "expenses"
  | "debt"
  | "investing"
  | "financial-safety"
  | "money-habits"
  | "goals";

type FinancialTipType = "tip" | "guide" | "lesson" | "warning";

type FormState = {
  title: string;
  shortDescription: string;
  content: string;
  category: FinancialTipCategory;
  type: FinancialTipType;
  isActive: boolean;
  featured: boolean;
  startDate: string;
  endDate: string;
  actionEnabled: boolean;
  actionLabel: string;
  actionRoute: string;
};

type ErrorState = {
  title?: string;
  shortDescription?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  actionLabel?: string;
  actionRoute?: string;
};

const categories: {
  value: FinancialTipCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "budgeting",
    label: "Budgeting",
    description: "Plan and manage your budget",
  },
  {
    value: "saving",
    label: "Saving",
    description: "Build better saving habits",
  },
  {
    value: "expenses",
    label: "Expenses",
    description: "Control and understand spending",
  },
  {
    value: "debt",
    label: "Debt",
    description: "Manage and reduce debt",
  },
  {
    value: "investing",
    label: "Investing",
    description: "Learn investment fundamentals",
  },
  {
    value: "financial-safety",
    label: "Financial Safety",
    description: "Protect your money and accounts",
  },
  {
    value: "money-habits",
    label: "Money Habits",
    description: "Develop healthy financial habits",
  },
  {
    value: "goals",
    label: "Goals",
    description: "Work toward financial goals",
  },
];

const types: {
  value: FinancialTipType;
  label: string;
  description: string;
}[] = [
  {
    value: "tip",
    label: "Tip",
    description: "A quick, practical financial tip",
  },
  {
    value: "guide",
    label: "Guide",
    description: "A more detailed how-to resource",
  },
  {
    value: "lesson",
    label: "Lesson",
    description: "Educational financial content",
  },
  {
    value: "warning",
    label: "Warning",
    description: "Important financial safety information",
  },
];

const getDefaultStartDate = () => {
  const date = new Date();

  date.setSeconds(0, 0);

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

const initialForm = (): FormState => ({
  title: "",
  shortDescription: "",
  content: "",
  category: "money-habits",
  type: "tip",
  isActive: true,
  featured: false,
  startDate: getDefaultStartDate(),
  endDate: "",
  actionEnabled: false,
  actionLabel: "",
  actionRoute: "",
});

const formatDateForPreview = (value: string) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCategoryLabel = (value: FinancialTipCategory) => {
  return categories.find((item) => item.value === value)?.label ?? value;
};

const getTypeLabel = (value: FinancialTipType) => {
  return types.find((item) => item.value === value)?.label ?? value;
};

export default function AddFinancialTipPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => item.value === form.category),
    [form.category],
  );

  const selectedType = useMemo(
    () => types.find((item) => item.value === form.type),
    [form.type],
  );

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setSubmitError("");
    setSuccessMessage("");
  };

  const validate = () => {
    const nextErrors: ErrorState = {};

    const title = form.title.trim();
    const shortDescription = form.shortDescription.trim();
    const content = form.content.trim();

    if (!title) {
      nextErrors.title = "Title is required.";
    } else if (title.length > 120) {
      nextErrors.title = "Title must be 120 characters or less.";
    }

    if (!shortDescription) {
      nextErrors.shortDescription = "Short description is required.";
    } else if (shortDescription.length > 300) {
      nextErrors.shortDescription =
        "Short description must be 300 characters or less.";
    }

    if (!content) {
      nextErrors.content = "Content is required.";
    } else if (content.length > 5000) {
      nextErrors.content = "Content must be 5000 characters or less.";
    }

    if (!form.startDate) {
      nextErrors.startDate = "Start date is required.";
    }

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);

      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end <= start
      ) {
        nextErrors.endDate = "End date must be after the start date.";
      }
    }

    if (form.actionEnabled) {
      const actionLabel = form.actionLabel.trim();
      const actionRoute = form.actionRoute.trim();

      if (!actionLabel) {
        nextErrors.actionLabel =
          "Button label is required when the action is enabled.";
      } else if (actionLabel.length > 50) {
        nextErrors.actionLabel = "Button label must be 50 characters or less.";
      }

      if (!actionRoute) {
        nextErrors.actionRoute =
          "App route is required when the action is enabled.";
      } else if (actionRoute.length > 200) {
        nextErrors.actionRoute = "App route must be 200 characters or less.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    if (!validate()) {
      setSubmitError("Please fix the highlighted fields and try again.");
      setToastMessage("Please check the form for errors.");

      window.setTimeout(() => {
        setToastMessage("");
      }, 10000);

      return;
    }

    try {
      setSaving(true);

      await adminApi("/admin/financial-tips", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          shortDescription: form.shortDescription.trim(),
          content: form.content.trim(),
          category: form.category,
          type: form.type,
          isActive: form.isActive,
          featured: form.featured,
          startDate: form.startDate,
          endDate: form.endDate || null,
          action: {
            enabled: form.actionEnabled,
            label: form.actionEnabled ? form.actionLabel.trim() : "",
            route: form.actionEnabled ? form.actionRoute.trim() : "",
          },
        }),
      });

      setSuccessMessage("Financial tip created successfully.");

      window.setTimeout(() => {
        router.push("/financial-tips");
      }, 700);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create financial tip.";

      setSubmitError(message);
      setToastMessage("Something went wrong. Please try again.");

      window.setTimeout(() => {
        setToastMessage("");
      }, 4000);
    } finally {
      setSaving(false);
    }
  };

  const typeIcon = {
    tip: Lightbulb,
    guide: BookOpen,
    lesson: FileText,
    warning: ShieldAlert,
  }[form.type];

  const TypeIcon = typeIcon;

  return (
    <div
      className="relative min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8"
      aria-busy={saving}
    >
      {saving && (
        <div
          className="fixed inset-0 z-[200] flex cursor-wait items-center justify-center bg-white/60 px-4 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
          aria-label="Creating financial tip"
        >
          <div className="flex min-w-[220px] flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-7 py-6 text-center shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Creating financial tip
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Please wait while we save your content...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1500px]">
        <button
          type="button"
          disabled={saving}
          onClick={() => router.push("/financial-tips")}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Financial Tips
        </button>

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">
            <Sparkles className="h-4 w-4" />
            Financial Education
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Add Financial Tip
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
            Create educational financial content that can be displayed to
            FinTrack users.
          </p>
        </div>

        {submitError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                Unable to create financial tip
              </h3>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {submitError}
              </p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => setSubmitError("")}
              className="cursor-pointer rounded-lg p-1.5 text-red-500 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Dismiss error"
              title="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {toastMessage && (
          <div
            className="fixed top-6 right-6 z-[250] flex max-w-sm items-start gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3.5 shadow-xl"
            role="alert"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ShieldAlert className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">Error</p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                {toastMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToastMessage("")}
              className="cursor-pointer rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
              aria-label="Dismiss notification"
              title="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <Check className="mt-0.5 h-5 w-5 shrink-0" />
            <div>{successMessage}</div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
        >
          <fieldset
            disabled={saving}
            className="contents disabled:cursor-not-allowed"
          >
            <div className="space-y-6">
              {/* Content */}
              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-zinc-900">
                        Financial Tip Content
                      </h2>
                      <p className="text-sm text-zinc-500">
                        Add the educational information users will see.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {/* Title */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="title"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Title
                      </label>

                      <span className="text-xs text-zinc-400">
                        {form.title.length}/120
                      </span>
                    </div>

                    <input
                      id="title"
                      disabled={saving}
                      type="text"
                      value={form.title}
                      maxLength={120}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      placeholder="e.g. Track Your Small Expenses"
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 disabled:placeholder:text-zinc-300 ${
                        errors.title
                          ? "border-red-300 focus:border-red-400"
                          : "border-zinc-200 focus:border-blue-500"
                      }`}
                    />

                    {errors.title && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="shortDescription"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Short Description
                      </label>

                      <span className="text-xs text-zinc-400">
                        {form.shortDescription.length}/300
                      </span>
                    </div>

                    <textarea
                      id="shortDescription"
                      disabled={saving}
                      value={form.shortDescription}
                      maxLength={300}
                      rows={3}
                      onChange={(event) =>
                        updateField("shortDescription", event.target.value)
                      }
                      placeholder="Briefly explain what users will learn from this content."
                      className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 disabled:placeholder:text-zinc-300 ${
                        errors.shortDescription
                          ? "border-red-300 focus:border-red-400"
                          : "border-zinc-200 focus:border-blue-500"
                      }`}
                    />

                    {errors.shortDescription && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="content"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Content
                      </label>

                      <span className="text-xs text-zinc-400">
                        {form.content.length}/5000
                      </span>
                    </div>

                    <textarea
                      id="content"
                      disabled={saving}
                      value={form.content}
                      maxLength={5000}
                      rows={10}
                      onChange={(event) =>
                        updateField("content", event.target.value)
                      }
                      placeholder="Write the complete financial tip, guide, lesson, or warning here..."
                      className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-7 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 disabled:placeholder:text-zinc-300 ${
                        errors.content
                          ? "border-red-300 focus:border-red-400"
                          : "border-zinc-200 focus:border-blue-500"
                      }`}
                    />

                    {errors.content && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.content}
                      </p>
                    )}

                    <div className="mt-2 flex items-start gap-2 text-xs text-zinc-400">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        Keep the content clear, practical, and easy to
                        understand on a mobile screen.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Category */}
              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Tag className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-zinc-900">Category</h2>
                      <p className="text-sm text-zinc-500">
                        Help users discover relevant financial content.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-6 sm:grid-cols-2">
                  {categories.map((category) => {
                    const selected = form.category === category.value;

                    return (
                      <button
                        key={category.value}
                        type="button"
                        disabled={saving}
                        onClick={() => updateField("category", category.value)}
                        className={`group cursor-pointer rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          selected
                            ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div
                              className={`text-sm font-semibold ${
                                selected ? "text-blue-700" : "text-zinc-800"
                              }`}
                            >
                              {category.label}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              {category.description}
                            </p>
                          </div>

                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-zinc-300"
                            }`}
                          >
                            {selected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Type */}
              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-zinc-900">
                        Content Type
                      </h2>
                      <p className="text-sm text-zinc-500">
                        Choose how this content should be presented.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-6 sm:grid-cols-2">
                  {types.map((type) => {
                    const selected = form.type === type.value;

                    const Icon =
                      type.value === "tip"
                        ? Lightbulb
                        : type.value === "guide"
                          ? BookOpen
                          : type.value === "lesson"
                            ? FileText
                            : ShieldAlert;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        disabled={saving}
                        onClick={() => updateField("type", type.value)}
                        className={`cursor-pointer rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          selected
                            ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={`text-sm font-semibold ${
                                  selected ? "text-blue-700" : "text-zinc-800"
                                }`}
                              >
                                {type.label}
                              </span>

                              {selected && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Visibility & Schedule */}
              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-zinc-900">
                        Visibility & Schedule
                      </h2>
                      <p className="text-sm text-zinc-500">
                        Control when this financial content is available.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  {/* Active */}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateField("isActive", !form.isActive)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      form.isActive
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          form.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-200 text-zinc-500"
                        }`}
                      >
                        <Target className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-zinc-900">
                          Active
                        </div>
                        <div className="mt-0.5 text-xs text-zinc-500">
                          Allow this content to be shown to users.
                        </div>
                      </div>
                    </div>

                    <div
                      className={`relative h-6 w-11 rounded-full transition ${
                        form.isActive ? "bg-emerald-500" : "bg-zinc-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          form.isActive ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </button>

                  {/* Featured */}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateField("featured", !form.featured)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      form.featured
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          form.featured
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-200 text-zinc-500"
                        }`}
                      >
                        <Star className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-zinc-900">
                          Featured
                        </div>
                        <div className="mt-0.5 text-xs text-zinc-500">
                          Highlight this content as featured educational
                          material.
                        </div>
                      </div>
                    </div>

                    <div
                      className={`relative h-6 w-11 rounded-full transition ${
                        form.featured ? "bg-amber-500" : "bg-zinc-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          form.featured ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </button>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="mb-2 block text-sm font-semibold text-zinc-800"
                      >
                        Start Date
                      </label>

                      <input
                        id="startDate"
                        disabled={saving}
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(event) =>
                          updateField("startDate", event.target.value)
                        }
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 disabled:placeholder:text-zinc-300 ${
                          errors.startDate
                            ? "border-red-300"
                            : "border-zinc-200 focus:border-blue-500"
                        }`}
                      />

                      {errors.startDate && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="mb-2 block text-sm font-semibold text-zinc-800"
                      >
                        End Date{" "}
                        <span className="font-normal text-zinc-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        id="endDate"
                        disabled={saving}
                        type="datetime-local"
                        value={form.endDate}
                        min={form.startDate || undefined}
                        onChange={(event) =>
                          updateField("endDate", event.target.value)
                        }
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 disabled:placeholder:text-zinc-300 ${
                          errors.endDate
                            ? "border-red-300"
                            : "border-zinc-200 focus:border-blue-500"
                        }`}
                      />

                      {errors.endDate && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {errors.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Optional Action */}
              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <ExternalLink className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-zinc-900">
                        Optional Action
                      </h2>
                      <p className="text-sm text-zinc-500">
                        Add an optional button that navigates users inside the
                        app.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      updateField("actionEnabled", !form.actionEnabled)
                    }
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      form.actionEnabled
                        ? "border-indigo-200 bg-indigo-50/60"
                        : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        Enable Action Button
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        Give users a direct next step after reading.
                      </div>
                    </div>

                    <div
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        form.actionEnabled ? "bg-indigo-600" : "bg-zinc-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          form.actionEnabled ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </button>

                  {form.actionEnabled && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="actionLabel"
                            className="text-sm font-semibold text-zinc-800"
                          >
                            Button Label
                          </label>

                          <span className="text-xs text-zinc-400">
                            {form.actionLabel.length}/50
                          </span>
                        </div>

                        <input
                          id="actionLabel"
                          disabled={saving}
                          type="text"
                          value={form.actionLabel}
                          maxLength={50}
                          onChange={(event) =>
                            updateField("actionLabel", event.target.value)
                          }
                          placeholder="e.g. View Budget"
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 disabled:placeholder:text-zinc-300 ${
                            errors.actionLabel
                              ? "border-red-300"
                              : "border-zinc-200 focus:border-blue-500"
                          }`}
                        />

                        {errors.actionLabel && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {errors.actionLabel}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="actionRoute"
                            className="text-sm font-semibold text-zinc-800"
                          >
                            App Route
                          </label>

                          <span className="text-xs text-zinc-400">
                            {form.actionRoute.length}/200
                          </span>
                        </div>

                        <input
                          id="actionRoute"
                          disabled={saving}
                          type="text"
                          value={form.actionRoute}
                          maxLength={200}
                          onChange={(event) =>
                            updateField("actionRoute", event.target.value)
                          }
                          placeholder="e.g. /budget"
                          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 disabled:placeholder:text-zinc-300 ${
                            errors.actionRoute
                              ? "border-red-300"
                              : "border-zinc-200 focus:border-blue-500"
                          }`}
                        />

                        {errors.actionRoute && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {errors.actionRoute}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Save footer */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => router.push("/financial-tips")}
                    disabled={saving}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Financial Tip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Sidebar */}
            <aside className="xl:sticky xl:top-6 xl:h-fit">
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-5 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
                        Live Preview
                      </p>
                      <h2 className="mt-1 font-semibold text-zinc-900">
                        User Content
                      </h2>
                    </div>

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        form.type === "warning"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <TypeIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                        {getCategoryLabel(form.category)}
                      </span>

                      <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                        {getTypeLabel(form.type)}
                      </span>

                      {form.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="break-words text-lg font-bold leading-7 text-zinc-900">
                      {form.title.trim() || "Your financial tip title"}
                    </h3>

                    <p className="mt-2 break-words text-sm leading-6 text-zinc-600">
                      {form.shortDescription.trim() ||
                        "Your short description will appear here."}
                    </p>

                    <div className="my-4 h-px bg-zinc-200" />

                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700">
                      {form.content.trim() ||
                        "Your complete financial tip content will appear here as users read the educational material."}
                    </p>

                    {form.actionEnabled && (
                      <button
                        type="button"
                        disabled
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                      >
                        {form.actionLabel.trim() || "Action Button"}
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-zinc-500">Status</span>

                      <span
                        className={`rounded-full px-2.5 py-1 font-semibold ${
                          form.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {form.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-zinc-500">Starts</span>
                      <span className="text-right font-medium text-zinc-700">
                        {formatDateForPreview(form.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-zinc-500">Ends</span>
                      <span className="text-right font-medium text-zinc-700">
                        {form.endDate
                          ? formatDateForPreview(form.endDate)
                          : "No end date"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helpful information */}
              <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Info className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">
                      Content guidelines
                    </h3>

                    <ul className="mt-2 space-y-1.5 text-xs leading-5 text-blue-800/80">
                      <li>• Keep financial advice clear and practical.</li>
                      <li>• Avoid overly technical language.</li>
                      <li>• Use short paragraphs for mobile readability.</li>
                      <li>• Use Featured for especially useful content.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Selected configuration */}
              <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Configuration
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-500">Category</span>
                    <span className="font-medium text-zinc-700">
                      {selectedCategory?.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-500">Type</span>
                    <span className="font-medium text-zinc-700">
                      {selectedType?.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-500">Featured</span>
                    <span className="font-medium text-zinc-700">
                      {form.featured ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-500">Action</span>
                    <span className="font-medium text-zinc-700">
                      {form.actionEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
