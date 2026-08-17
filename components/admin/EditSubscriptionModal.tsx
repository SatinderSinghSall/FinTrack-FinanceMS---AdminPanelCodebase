"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update subscription.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Edit Subscription
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Update subscription information
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Name"
                value={name}
                onChange={setName}
                disabled={loading}
                placeholder="Netflix"
              />

              <Field
                label="Category"
                value={category}
                onChange={setCategory}
                disabled={loading}
                placeholder="Entertainment"
              />

              <Field
                label="Amount"
                type="number"
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
                <label className="text-xs font-medium text-zinc-600">
                  Billing Cycle
                </label>

                <select
                  value={billingCycle}
                  disabled={loading}
                  onChange={(event) =>
                    setBillingCycle(event.target.value as typeof billingCycle)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <Field
                label="Payment Method"
                value={paymentMethod}
                onChange={setPaymentMethod}
                disabled={loading}
                placeholder="UPI / Card"
              />

              <div>
                <label className="text-xs font-medium text-zinc-600">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  disabled={loading}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600">
                  Next Renewal Date
                </label>

                <input
                  type="date"
                  value={nextRenewalDate}
                  disabled={loading}
                  onChange={(event) => setNextRenewalDate(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                />
              </div>

              <Field
                label="Reminder Days Before"
                type="number"
                value={reminderDaysBefore}
                onChange={setReminderDaysBefore}
                disabled={loading}
                placeholder="3"
              />

              <div>
                <label className="text-xs font-medium text-zinc-600">
                  Status
                </label>

                <select
                  value={status}
                  disabled={loading}
                  onChange={(event) =>
                    setStatus(event.target.value as typeof status)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                >
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <Field
                label="Icon"
                value={icon}
                onChange={setIcon}
                disabled={loading}
                placeholder="Netflix icon"
              />

              <div>
                <label className="text-xs font-medium text-zinc-600">
                  Color
                </label>

                <div className="mt-1.5 flex h-11 items-center gap-3 rounded-xl border border-zinc-200 px-3">
                  <input
                    type="color"
                    value={color}
                    disabled={loading}
                    onChange={(event) => setColor(event.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                  />

                  <span className="font-mono text-xs text-zinc-500">
                    {color}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-zinc-600">
                  Notes
                </label>

                <textarea
                  value={notes}
                  disabled={loading}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="Subscription notes..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div>
                <p className="text-sm font-medium text-zinc-800">Auto Renew</p>

                <p className="mt-0.5 text-xs text-zinc-400">
                  Automatically renew this subscription
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => setAutoRenew((value) => !value)}
                className={`relative h-6 w-11 rounded-full transition ${
                  autoRenew ? "bg-zinc-900" : "bg-zinc-300"
                }`}
                aria-label="Toggle auto renew"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    autoRenew ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-xs font-medium text-zinc-400">User ID</p>

              <p className="mt-1 break-all font-mono text-xs text-zinc-600">
                {subscription.userId || "—"}
              </p>

              <p className="mt-1.5 text-xs text-zinc-400">
                The subscription owner cannot be changed from the admin panel.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="h-10 rounded-xl border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}

              {loading ? "Saving..." : "Save Changes"}
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-600">{label}</label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
      />
    </div>
  );
}
