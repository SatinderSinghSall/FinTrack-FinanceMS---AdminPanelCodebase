"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  X,
  CreditCard,
  Tag,
  IndianRupee,
  Calendar,
  Bell,
  RefreshCw,
  FileText,
  Palette,
  AlertCircle,
  CheckCircle2,
  User,
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
  }, [subscription]);

  if (!subscription) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-200/60 shadow-sm">
              <CreditCard size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                Edit Subscription
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Update billing details, renewal schedules, and properties
              </p>
            </div>
          </div>

          {/* Top-Right Close Button */}
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-200/60 bg-zinc-50/50 text-zinc-400 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close"
          >
            <X
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form Scroll Body */}
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 p-4 text-xs font-medium text-red-700 shadow-sm">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
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

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Billing Cycle
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={billingCycle}
                    disabled={loading}
                    onChange={(e) =>
                      setBillingCycle(e.target.value as typeof billingCycle)
                    }
                    className="h-11 w-full cursor-pointer rounded-2xl border border-zinc-200/80 bg-white px-3.5 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <Field
                label="Payment Method"
                value={paymentMethod}
                onChange={setPaymentMethod}
                disabled={loading}
                placeholder="UPI / Card / NetBanking"
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Start Date
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="date"
                    value={startDate}
                    disabled={loading}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white px-3.5 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Next Renewal Date
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="date"
                    value={nextRenewalDate}
                    disabled={loading}
                    onChange={(e) => setNextRenewalDate(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white px-3.5 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                  />
                </div>
              </div>

              <Field
                label="Reminder Days Before"
                type="number"
                icon={<Bell size={16} />}
                value={reminderDaysBefore}
                onChange={setReminderDaysBefore}
                disabled={loading}
                placeholder="3"
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={status}
                    disabled={loading}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="h-11 w-full cursor-pointer rounded-2xl border border-zinc-200/80 bg-white px-3.5 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <Field
                label="Icon Reference"
                value={icon}
                onChange={setIcon}
                disabled={loading}
                placeholder="netflix-icon"
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Theme Color
                </label>
                <div className="mt-1.5 flex h-11 items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-3.5 shadow-sm">
                  <input
                    type="color"
                    value={color}
                    disabled={loading}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="font-mono text-xs font-medium text-zinc-600">
                    {color}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Notes
                </label>
                <textarea
                  value={notes}
                  disabled={loading}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional subscription notes or details..."
                  className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-200/80 bg-white p-3.5 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-zinc-50"
                />
              </div>
            </div>

            {/* Auto Renew Toggle Card */}
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200/60 bg-zinc-50/60 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900">
                    Auto Renew
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400">
                    Automatically bill and renew this recurring subscription
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => setAutoRenew((val) => !val)}
                className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${
                  autoRenew ? "bg-indigo-600" : "bg-zinc-300"
                }`}
                aria-label="Toggle auto renew"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    autoRenew ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Read-only User ID Box */}
            <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/40 p-4 text-xs">
              <div className="flex items-center gap-2 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <User size={14} />
                <span>Subscription Owner ID</span>
              </div>
              <p className="mt-1.5 break-all font-mono text-xs font-medium text-zinc-700">
                {subscription.userId || "—"}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-zinc-200/80 bg-white px-5 text-sm font-semibold text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-800 hover:shadow-zinc-900/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full rounded-2xl border border-zinc-200/80 bg-white text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-zinc-50 disabled:text-zinc-400 ${
            icon ? "pl-10 pr-4" : "px-3.5"
          }`}
        />
      </div>
    </div>
  );
}
