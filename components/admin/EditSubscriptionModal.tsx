"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  HelpCircle,
  IndianRupee,
  Loader2,
  Palette,
  RefreshCw,
  Save,
  Settings2,
  Tag,
  User,
  WalletCards,
  X,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Subscription = {
  _id: string;
  userId?: string;
  name?: string;
  category?: string;
  amount?: number;
  currency?: string;
  billingCycle?: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate?: string;
  nextRenewalDate?: string;
  reminderDaysBefore?: number;
  autoRenew?: boolean;
  paymentMethod?: string;
  notes?: string;
  status?: "active" | "cancelled";
  icon?: string;
  color?: string;
};

type EditSubscriptionModalProps = {
  subscription: Subscription | null;
  onClose: () => void;
  onSaved: () => void;
};

type ChangedField = {
  label: string;
  oldValue: string;
  newValue: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const toDateInput = (date?: string) => {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const formatDateForReview = (date: string) => {
  if (!date) {
    return "Not set";
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCycle = (cycle?: string) => {
  if (!cycle) {
    return "Not set";
  }

  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};

const formatCategory = (category?: string) => {
  if (!category) {
    return "Other";
  }

  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatBoolean = (value: boolean) => {
  return value ? "Enabled" : "Disabled";
};

const formatReviewValue = (label: string, value: string) => {
  if (!value) {
    return "Not set";
  }

  if (label === "Billing Cycle") {
    return formatCycle(value);
  }

  if (label === "Start Date" || label === "Next Renewal Date") {
    return formatDateForReview(value);
  }

  if (label === "Status") {
    return value === "active" ? "Active" : "Cancelled";
  }

  if (label === "Category") {
    return formatCategory(value);
  }

  return value;
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function EditSubscriptionModal({
  subscription,
  onClose,
  onSaved,
}: EditSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");

  const [billingCycle, setBillingCycle] = useState<
    "weekly" | "monthly" | "quarterly" | "yearly"
  >("monthly");

  const [startDate, setStartDate] = useState("");
  const [nextRenewalDate, setNextRenewalDate] = useState("");

  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");

  const [autoRenew, setAutoRenew] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("");

  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState<"active" | "cancelled">("active");

  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#6366F1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Populate Form                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!subscription) {
      return;
    }

    setName(subscription.name || "");
    setCategory(subscription.category || "");

    setAmount(
      typeof subscription.amount === "number"
        ? String(subscription.amount)
        : "",
    );

    setCurrency(subscription.currency || "INR");

    setBillingCycle(subscription.billingCycle || "monthly");

    setStartDate(toDateInput(subscription.startDate));

    setNextRenewalDate(toDateInput(subscription.nextRenewalDate));

    setReminderDaysBefore(
      typeof subscription.reminderDaysBefore === "number"
        ? String(subscription.reminderDaysBefore)
        : "3",
    );

    setAutoRenew(subscription.autoRenew !== false);

    setPaymentMethod(subscription.paymentMethod || "");

    setNotes(subscription.notes || "");

    setStatus(subscription.status || "active");

    setIcon(subscription.icon || "");

    setColor(subscription.color || "#6366F1");

    setError("");
    setShowConfirm(false);
  }, [subscription]);

  /* ------------------------------------------------------------------------ */
  /* Changed Fields                                                           */
  /* ------------------------------------------------------------------------ */

  const changedFields = useMemo<ChangedField[]>(() => {
    if (!subscription) {
      return [];
    }

    const changes: ChangedField[] = [];

    const originalName = subscription.name || "";
    const originalCategory = subscription.category || "";
    const originalAmount =
      typeof subscription.amount === "number"
        ? String(subscription.amount)
        : "";
    const originalCurrency = subscription.currency || "INR";

    const originalBillingCycle = subscription.billingCycle || "monthly";

    const originalStartDate = toDateInput(subscription.startDate);

    const originalNextRenewalDate = toDateInput(subscription.nextRenewalDate);

    const originalReminder =
      typeof subscription.reminderDaysBefore === "number"
        ? String(subscription.reminderDaysBefore)
        : "3";

    const originalAutoRenew = subscription.autoRenew !== false;

    const originalPaymentMethod = subscription.paymentMethod || "";

    const originalNotes = subscription.notes || "";

    const originalStatus = subscription.status || "active";

    const originalIcon = subscription.icon || "";

    const originalColor = subscription.color || "#6366F1";

    if (name.trim() !== originalName) {
      changes.push({
        label: "Subscription Name",
        oldValue: originalName || "Not set",
        newValue: name.trim() || "Not set",
      });
    }

    if (category.trim() !== originalCategory) {
      changes.push({
        label: "Category",
        oldValue: formatCategory(originalCategory),
        newValue: formatCategory(category.trim()),
      });
    }

    if (amount !== originalAmount) {
      changes.push({
        label: "Amount",
        oldValue: originalAmount
          ? `${originalCurrency} ${Number(originalAmount).toLocaleString(
              "en-IN",
            )}`
          : "Not set",
        newValue: amount
          ? `${currency || "INR"} ${Number(amount).toLocaleString("en-IN")}`
          : "Not set",
      });
    }

    if (currency.trim() !== originalCurrency) {
      changes.push({
        label: "Currency",
        oldValue: originalCurrency,
        newValue: currency.trim() || "INR",
      });
    }

    if (billingCycle !== originalBillingCycle) {
      changes.push({
        label: "Billing Cycle",
        oldValue: formatCycle(originalBillingCycle),
        newValue: formatCycle(billingCycle),
      });
    }

    if (startDate !== originalStartDate) {
      changes.push({
        label: "Start Date",
        oldValue: formatDateForReview(originalStartDate),
        newValue: formatDateForReview(startDate),
      });
    }

    if (nextRenewalDate !== originalNextRenewalDate) {
      changes.push({
        label: "Next Renewal Date",
        oldValue: formatDateForReview(originalNextRenewalDate),
        newValue: formatDateForReview(nextRenewalDate),
      });
    }

    if (reminderDaysBefore !== originalReminder) {
      changes.push({
        label: "Reminder Days",
        oldValue: `${originalReminder} day${
          originalReminder === "1" ? "" : "s"
        }`,
        newValue: `${reminderDaysBefore} day${
          reminderDaysBefore === "1" ? "" : "s"
        }`,
      });
    }

    if (autoRenew !== originalAutoRenew) {
      changes.push({
        label: "Auto Renew",
        oldValue: formatBoolean(originalAutoRenew),
        newValue: formatBoolean(autoRenew),
      });
    }

    if (paymentMethod.trim() !== originalPaymentMethod) {
      changes.push({
        label: "Payment Method",
        oldValue: originalPaymentMethod || "Not set",
        newValue: paymentMethod.trim() || "Not set",
      });
    }

    if (notes.trim() !== originalNotes) {
      changes.push({
        label: "Notes",
        oldValue: originalNotes || "Not set",
        newValue: notes.trim() || "Not set",
      });
    }

    if (status !== originalStatus) {
      changes.push({
        label: "Status",
        oldValue: formatReviewValue("Status", originalStatus),
        newValue: formatReviewValue("Status", status),
      });
    }

    if (icon.trim() !== originalIcon) {
      changes.push({
        label: "Icon Reference",
        oldValue: originalIcon || "Not set",
        newValue: icon.trim() || "Not set",
      });
    }

    if (color !== originalColor) {
      changes.push({
        label: "Theme Color",
        oldValue: originalColor,
        newValue: color,
      });
    }

    return changes;
  }, [
    subscription,
    name,
    category,
    amount,
    currency,
    billingCycle,
    startDate,
    nextRenewalDate,
    reminderDaysBefore,
    autoRenew,
    paymentMethod,
    notes,
    status,
    icon,
    color,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Validation / Review                                                     */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Subscription name is required.");
      return;
    }

    const numericAmount = Number(amount);

    if (amount === "" || Number.isNaN(numericAmount) || numericAmount < 0) {
      setError("Amount must be 0 or greater.");
      return;
    }

    const numericReminder = Number(reminderDaysBefore);

    if (Number.isNaN(numericReminder) || numericReminder < 0) {
      setError("Reminder days must be 0 or greater.");
      return;
    }

    if (!startDate) {
      setError("Start date is required.");
      return;
    }

    if (!nextRenewalDate) {
      setError("Next renewal date is required.");
      return;
    }

    if (new Date(nextRenewalDate) < new Date(startDate)) {
      setError("Next renewal date cannot be before the start date.");
      return;
    }

    if (changedFields.length === 0) {
      setError(
        "No changes detected. Please update at least one field before saving.",
      );
      return;
    }

    setShowConfirm(true);
  };

  /* ------------------------------------------------------------------------ */
  /* Confirm Save                                                             */
  /* ------------------------------------------------------------------------ */

  const handleConfirmSave = async () => {
    if (!subscription) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const numericAmount = Number(amount);
      const numericReminder = Number(reminderDaysBefore);

      await adminApi(`/admin/subscriptions/${subscription._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim() || "Other",
          amount: numericAmount,
          currency: currency.trim() || "INR",
          billingCycle,
          startDate,
          nextRenewalDate,
          reminderDaysBefore: numericReminder,
          autoRenew,
          paymentMethod: paymentMethod.trim(),
          notes: notes.trim(),
          status,
          icon: icon.trim(),
          color,
        }),
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update subscription.",
      );

      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-2 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-subscription-title"
    >
      <div className="relative flex max-h-[calc(100dvh-16px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-32px)]">
        {/* ================================================================ */}
        {/* TOP ACCENT                                                       */}
        {/* ================================================================ */}

        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />

        {/* ================================================================ */}
        {/* HEADER                                                            */}
        {/* ================================================================ */}

        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm">
              <CreditCard size={21} strokeWidth={2} />

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white">
                <Settings2 size={9} />
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-500">
                Subscription Management
              </p>

              <h2
                id="edit-subscription-title"
                className="mt-1 truncate text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl"
              >
                Edit Subscription
              </h2>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Update billing details, renewal schedules, and properties.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (!loading) {
                if (showConfirm) {
                  setShowConfirm(false);
                  setError("");
                } else {
                  onClose();
                }
              }
            }}
            aria-label={
              showConfirm
                ? "Back to edit subscription"
                : "Close edit subscription"
            }
            className="group ml-3 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* ================================================================ */}
        {/* REVIEW CHANGES                                                   */}
        {/* ================================================================ */}

        {showConfirm ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-7 sm:py-9">
            <div className="mx-auto max-w-xl">
              {/* Review Icon */}
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
                  <HelpCircle size={30} strokeWidth={1.8} />
                </div>

                <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-600">
                  Review Changes
                </p>

                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-zinc-950">
                  Confirm Subscription Update
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-zinc-500">
                  Review the changes below before updating this subscription.
                </p>
              </div>

              {/* Subscription Summary */}
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                    <CreditCard size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                      Subscription
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-zinc-950">
                      {name.trim() || "Unnamed Subscription"}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatCategory(category)}
                    </p>
                  </div>

                  <div className="hidden shrink-0 sm:block">
                    <p className="text-right text-lg font-extrabold text-zinc-950">
                      {currency || "INR"}{" "}
                      {Number(amount || 0).toLocaleString("en-IN")}
                    </p>

                    <p className="text-right text-[10px] font-medium text-zinc-400">
                      / {billingCycle}
                    </p>
                  </div>
                </div>

                {/* Current Status */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-200 pt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                      status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        status === "active" ? "bg-emerald-500" : "bg-zinc-400"
                      }`}
                    />

                    {status === "active" ? "Active" : "Cancelled"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                      autoRenew
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-zinc-200 bg-white text-zinc-600"
                    }`}
                  >
                    <RefreshCw size={10} />
                    Auto Renew: {autoRenew ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              {/* Changed Fields */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                    Changes
                  </p>

                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[9px] font-bold text-zinc-500">
                    {changedFields.length}{" "}
                    {changedFields.length === 1 ? "change" : "changes"}
                  </span>
                </div>

                <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  {changedFields.map((change, index) => (
                    <div
                      key={change.label}
                      className={`p-4 ${
                        index !== changedFields.length - 1
                          ? "border-b border-zinc-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Check size={15} strokeWidth={2.5} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-zinc-400">
                            {change.label}
                          </p>

                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                            <div className="min-w-0 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                                Before
                              </p>

                              <p className="mt-0.5 break-words text-xs font-semibold text-red-700">
                                {formatReviewValue(
                                  change.label,
                                  change.oldValue,
                                )}
                              </p>
                            </div>

                            <div className="hidden text-zinc-300 sm:block">
                              →
                            </div>

                            <div className="min-w-0 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                                After
                              </p>

                              <p className="mt-0.5 break-words text-xs font-semibold text-emerald-700">
                                {formatReviewValue(
                                  change.label,
                                  change.newValue,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation Error */}
              {error && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-xs font-medium text-red-700"
                >
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <span className="leading-5">{error}</span>
                </div>
              )}

              {/* Review Actions */}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center sm:gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setShowConfirm(false);
                    setError("");
                  }}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmSave}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-xs font-bold text-white shadow-lg shadow-zinc-950/10 transition-all hover:bg-zinc-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-950/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />

                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />

                      <span>Yes, Update</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================
             FORM
          ================================================================= */

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Scrollable Form */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-zinc-50/40 px-4 py-5 sm:px-6 sm:py-6">
              <div className="space-y-6">
                {/* Error */}
                {error && <ErrorMessage message={error} />}

                {/* -------------------------------------------------------- */}
                {/* Basic Information                                        */}
                {/* -------------------------------------------------------- */}

                <FormSection
                  icon={<CreditCard size={15} />}
                  title="Basic Information"
                  description="Core details for this recurring subscription."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Subscription Name"
                      icon={<CreditCard size={16} />}
                      value={name}
                      onChange={setName}
                      disabled={loading}
                      placeholder="e.g. Netflix, Spotify"
                    />

                    <Field
                      label="Category"
                      icon={<Tag size={16} />}
                      value={category}
                      onChange={setCategory}
                      disabled={loading}
                      placeholder="Entertainment"
                    />

                    <Field
                      label="Amount"
                      type="number"
                      icon={<IndianRupee size={16} />}
                      value={amount}
                      onChange={setAmount}
                      disabled={loading}
                      placeholder="649"
                    />

                    <Field
                      label="Currency"
                      value={currency}
                      onChange={setCurrency}
                      disabled={loading}
                      placeholder="INR"
                    />

                    <SelectField
                      label="Billing Cycle"
                      value={billingCycle}
                      disabled={loading}
                      onChange={(value) =>
                        setBillingCycle(value as typeof billingCycle)
                      }
                      options={[
                        {
                          value: "weekly",
                          label: "Weekly",
                        },
                        {
                          value: "monthly",
                          label: "Monthly",
                        },
                        {
                          value: "quarterly",
                          label: "Quarterly",
                        },
                        {
                          value: "yearly",
                          label: "Yearly",
                        },
                      ]}
                    />

                    <Field
                      label="Payment Method"
                      icon={<WalletCards size={16} />}
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      disabled={loading}
                      placeholder="UPI / Card / NetBanking"
                    />
                  </div>
                </FormSection>

                {/* -------------------------------------------------------- */}
                {/* Billing & Renewal                                        */}
                {/* -------------------------------------------------------- */}

                <FormSection
                  icon={<RefreshCw size={15} />}
                  title="Billing & Renewal"
                  description="Control renewal dates and reminder preferences."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DateField
                      label="Start Date"
                      value={startDate}
                      onChange={setStartDate}
                      disabled={loading}
                    />

                    <DateField
                      label="Next Renewal Date"
                      value={nextRenewalDate}
                      onChange={setNextRenewalDate}
                      disabled={loading}
                    />

                    <Field
                      label="Reminder Days Before"
                      type="number"
                      value={reminderDaysBefore}
                      onChange={setReminderDaysBefore}
                      disabled={loading}
                      placeholder="3"
                    />

                    <SelectField
                      label="Status"
                      value={status}
                      disabled={loading}
                      onChange={(value) => setStatus(value as typeof status)}
                      options={[
                        {
                          value: "active",
                          label: "Active",
                        },
                        {
                          value: "cancelled",
                          label: "Cancelled",
                        },
                      ]}
                    />
                  </div>
                </FormSection>

                {/* -------------------------------------------------------- */}
                {/* Appearance                                               */}
                {/* -------------------------------------------------------- */}

                <FormSection
                  icon={<Palette size={15} />}
                  title="Appearance"
                  description="Customize how the subscription is represented."
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Icon Reference"
                      icon={<FileText size={16} />}
                      value={icon}
                      onChange={setIcon}
                      disabled={loading}
                      placeholder="netflix-icon"
                    />

                    <ColorField
                      label="Theme Color"
                      value={color}
                      disabled={loading}
                      onChange={setColor}
                    />
                  </div>
                </FormSection>

                {/* -------------------------------------------------------- */}
                {/* Notes                                                     */}
                {/* -------------------------------------------------------- */}

                <FormSection
                  icon={<FileText size={15} />}
                  title="Notes"
                  description="Optional notes about this subscription."
                >
                  <div>
                    <textarea
                      value={notes}
                      disabled={loading}
                      onChange={(event) => setNotes(event.target.value)}
                      maxLength={1000}
                      rows={4}
                      placeholder="Additional subscription notes or details..."
                      className="w-full resize-y rounded-2xl border border-zinc-200/80 bg-white px-3.5 py-3.5 text-xs font-medium leading-5 text-zinc-900 shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                    />

                    <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-zinc-400">
                      <span>Optional</span>

                      <span>{notes.length}/1000</span>
                    </div>
                  </div>
                </FormSection>

                {/* -------------------------------------------------------- */}
                {/* Settings                                                  */}
                {/* -------------------------------------------------------- */}

                <FormSection
                  icon={<Settings2 size={15} />}
                  title="Subscription Settings"
                  description="Manage recurring behavior and status."
                >
                  <div className="space-y-3">
                    {/* Auto Renew */}
                    <div
                      className={`flex flex-col gap-4 rounded-2xl border p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between ${
                        autoRenew
                          ? "border-indigo-200 bg-indigo-50/40"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            autoRenew
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          <RefreshCw size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900">
                            Auto Renew
                          </p>

                          <p className="mt-0.5 text-[11px] leading-4 text-zinc-400">
                            Automatically renew this recurring subscription
                          </p>

                          <p
                            className={`mt-1 text-[10px] font-bold ${
                              autoRenew ? "text-indigo-600" : "text-zinc-500"
                            }`}
                          >
                            {autoRenew
                              ? "Currently enabled"
                              : "Currently disabled"}
                          </p>
                        </div>
                      </div>

                      {/* Proper Controlled Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={autoRenew}
                        aria-label="Toggle auto renew"
                        disabled={loading}
                        onClick={() => setAutoRenew((current) => !current)}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 outline-none transition-all duration-200 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-50 ${
                          autoRenew
                            ? "bg-indigo-600 shadow-md shadow-indigo-600/20"
                            : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ${
                            autoRenew ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Status Preview */}
                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {status === "active" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <X size={18} />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-zinc-900">
                          Subscription Status
                        </p>

                        <p className="mt-0.5 text-[11px] text-zinc-400">
                          This subscription is currently{" "}
                          <span
                            className={
                              status === "active"
                                ? "font-bold text-emerald-600"
                                : "font-bold text-zinc-600"
                            }
                          >
                            {status === "active" ? "active" : "cancelled"}
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/* -------------------------------------------------------- */}
                {/* Owner                                                     */}
                {/* -------------------------------------------------------- */}

                <FormSection
                  icon={<User size={15} />}
                  title="Subscription Owner"
                  description="The associated user cannot be changed here."
                >
                  <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                        <User size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-zinc-400">
                          User ID
                        </p>

                        <p className="mt-1 break-all font-mono text-xs font-medium leading-5 text-zinc-700">
                          {subscription.userId || "—"}
                        </p>

                        <p className="mt-1.5 text-[10px] font-medium text-zinc-400">
                          Read-only
                        </p>
                      </div>
                    </div>
                  </div>
                </FormSection>
              </div>
            </div>

            {/* ============================================================ */}
            {/* FORM FOOTER                                                   */}
            {/* ============================================================ */}

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-200/70 bg-white px-4 py-3.5 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-sm font-bold text-white shadow-lg shadow-zinc-950/10 transition-all hover:bg-zinc-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-950/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Check size={16} />

                <span>Review Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form Section                                                               */
/* -------------------------------------------------------------------------- */

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
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
            {title}
          </h3>

          <p className="mt-0.5 text-[10px] font-medium leading-4 text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-3">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Error Message                                                              */
/* -------------------------------------------------------------------------- */

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <AlertCircle size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-red-800">Unable to continue</p>

        <p className="mt-1 text-xs leading-5 text-red-700">{message}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </label>

      <div className="relative mt-1.5">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "0.01" : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full rounded-2xl border border-zinc-200/80 bg-white text-xs font-medium text-zinc-900 shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 ${
            icon ? "pl-10 pr-3.5" : "px-3.5"
          }`}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Select Field                                                               */
/* -------------------------------------------------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  disabled,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="min-w-0">
      <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full cursor-pointer rounded-2xl border border-zinc-200/80 bg-white px-3.5 text-xs font-medium text-zinc-900 shadow-sm outline-none transition-all duration-200 hover:border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Date Field                                                                 */
/* -------------------------------------------------------------------------- */

function DateField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </label>

      <div className="relative mt-1.5">
        <Calendar
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          type="date"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full cursor-pointer rounded-2xl border border-zinc-200/80 bg-white pl-10 pr-3.5 text-xs font-medium text-zinc-900 shadow-sm outline-none transition-all duration-200 hover:border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Color Field                                                                */
/* -------------------------------------------------------------------------- */

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </label>

      <div className="mt-1.5 flex h-11 items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-3.5 shadow-sm transition-all hover:border-zinc-300">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0 disabled:cursor-not-allowed"
        />

        <div className="h-5 border-l border-zinc-200" />

        <span className="font-mono text-xs font-semibold text-zinc-600">
          {value}
        </span>

        <span
          className="ml-auto h-5 w-5 rounded-full border border-black/10 shadow-sm"
          style={{
            backgroundColor: value,
          }}
        />
      </div>
    </div>
  );
}
