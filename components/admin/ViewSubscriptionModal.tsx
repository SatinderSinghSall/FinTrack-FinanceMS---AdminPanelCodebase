"use client";

import { X } from "lucide-react";

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
  createdAt?: string;
  updatedAt?: string;
};

type ViewSubscriptionModalProps = {
  subscription: Subscription | null;
  onClose: () => void;
};

const formatCurrency = (amount?: number, currency = "INR") => {
  if (typeof amount !== "number") {
    return "—";
  }

  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  return `${currency} ${amount.toLocaleString("en-IN")}`;
};

const formatDate = (date?: string) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCycle = (cycle?: Subscription["billingCycle"]) => {
  if (!cycle) {
    return "—";
  }

  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};

export default function ViewSubscriptionModal({
  subscription,
  onClose,
}: ViewSubscriptionModalProps) {
  if (!subscription) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Subscription Details
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Complete subscription information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Detail label="Name" value={subscription.name || "—"} />

            <Detail label="Category" value={subscription.category || "Other"} />

            <Detail
              label="Amount"
              value={formatCurrency(subscription.amount, subscription.currency)}
            />

            <Detail label="Currency" value={subscription.currency || "INR"} />

            <Detail
              label="Billing Cycle"
              value={formatCycle(subscription.billingCycle)}
            />

            <Detail
              label="Status"
              value={subscription.status === "active" ? "Active" : "Cancelled"}
            />

            <Detail
              label="Start Date"
              value={formatDate(subscription.startDate)}
            />

            <Detail
              label="Next Renewal"
              value={formatDate(subscription.nextRenewalDate)}
            />

            <Detail
              label="Reminder"
              value={
                typeof subscription.reminderDaysBefore === "number"
                  ? `${subscription.reminderDaysBefore} day(s) before`
                  : "—"
              }
            />

            <Detail
              label="Auto Renew"
              value={subscription.autoRenew ? "Enabled" : "Disabled"}
            />

            <Detail
              label="Payment Method"
              value={subscription.paymentMethod || "—"}
            />

            <Detail label="Color" value={subscription.color || "—"} />

            <Detail label="Icon" value={subscription.icon || "—"} />

            <Detail label="User ID" value={subscription.userId || "—"} mono />

            <Detail label="Subscription ID" value={subscription._id} mono />

            <Detail
              label="Created"
              value={formatDate(subscription.createdAt)}
            />

            <Detail
              label="Updated"
              value={formatDate(subscription.updatedAt)}
            />

            <div className="sm:col-span-2">
              <Detail label="Notes" value={subscription.notes?.trim() || "—"} />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-400">{label}</p>

      <p
        className={`mt-1 break-words text-zinc-900 ${
          mono ? "font-mono text-xs" : "text-sm font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
