"use client";

import {
  X,
  CreditCard,
  Calendar,
  Clock,
  RefreshCw,
  Bell,
  Wallet,
  Tag,
  AlignLeft,
  Hash,
  User,
  Activity,
  Layers,
  Palette,
  Sparkles,
} from "lucide-react";

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

  const isActive = subscription.status === "active";

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md shadow-zinc-900/10">
              <CreditCard size={22} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                Subscription Details
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Complete billing and renewal details
              </p>
            </div>
          </div>

          {/* Top-Right X Icon Button - ONLY WAY TO CLOSE FROM HEADER */}
          <button
            type="button"
            onClick={onClose}
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/60 bg-zinc-50/50 text-zinc-400 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 active:scale-95"
            aria-label="Close"
          >
            <X
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* Body Content */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-5">
          {/* Main Hero Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50/80 via-white to-zinc-50/50 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Service Name
                </span>
                <h3 className="text-xl font-bold text-zinc-900">
                  {subscription.name || "—"}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Recurring Cost
                </span>
                <p className="text-xl font-bold text-zinc-900">
                  {formatCurrency(subscription.amount, subscription.currency)}
                  <span className="text-xs font-medium text-zinc-400 ml-1">
                    / {subscription.billingCycle || "cycle"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3.5">
              {/* Status Indicator Pill */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${
                  isActive
                    ? "border-emerald-200/60 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-600"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                  }`}
                />
                {isActive ? "Active Subscription" : "Cancelled"}
              </span>

              {/* Auto Renew Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/60 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                <RefreshCw size={12} className="text-zinc-500" />
                Auto-Renew: {subscription.autoRenew ? "Enabled" : "Disabled"}
              </span>

              {/* Category Pill */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/60 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                <Tag size={12} className="text-zinc-500" />
                {subscription.category || "Other"}
              </span>
            </div>
          </div>

          {/* Grid Layout for Detailed Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem
              icon={<Layers size={16} className="text-zinc-500" />}
              label="Billing Cycle"
              value={formatCycle(subscription.billingCycle)}
            />

            <DetailItem
              icon={<Wallet size={16} className="text-zinc-500" />}
              label="Payment Method"
              value={subscription.paymentMethod || "—"}
            />

            <DetailItem
              icon={<Calendar size={16} className="text-zinc-500" />}
              label="Start Date"
              value={formatDate(subscription.startDate)}
            />

            <DetailItem
              icon={<Clock size={16} className="text-zinc-500" />}
              label="Next Renewal Date"
              value={formatDate(subscription.nextRenewalDate)}
            />

            <DetailItem
              icon={<Bell size={16} className="text-zinc-500" />}
              label="Reminder Settings"
              value={
                typeof subscription.reminderDaysBefore === "number"
                  ? `${subscription.reminderDaysBefore} day(s) before renewal`
                  : "—"
              }
            />

            <DetailItem
              icon={<Palette size={16} className="text-zinc-500" />}
              label="Theme Customization"
              value={
                <div className="flex items-center gap-2 mt-0.5">
                  <span>Icon: {subscription.icon || "—"}</span>
                  {subscription.color && (
                    <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: subscription.color }}
                      />
                      <span className="font-mono text-xs text-zinc-600">
                        {subscription.color}
                      </span>
                    </div>
                  )}
                </div>
              }
            />

            <DetailItem
              icon={<User size={16} className="text-zinc-500" />}
              label="Associated User ID"
              value={subscription.userId || "—"}
              mono
            />

            <DetailItem
              icon={<Hash size={16} className="text-zinc-500" />}
              label="Subscription ID"
              value={subscription._id}
              mono
            />

            <DetailItem
              icon={<Calendar size={16} className="text-zinc-500" />}
              label="Created At"
              value={formatDate(subscription.createdAt)}
            />

            <DetailItem
              icon={<Activity size={16} className="text-zinc-500" />}
              label="Last Updated"
              value={formatDate(subscription.updatedAt)}
            />
          </div>

          {/* Notes Container */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <AlignLeft size={14} className="text-zinc-500" />
              <span>Notes & Description</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap">
              {subscription.notes?.trim() ||
                "No additional notes specified for this subscription."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-800 hover:shadow-zinc-900/20 active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/60 bg-white p-3.5 shadow-sm transition-all hover:border-zinc-300/80">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        {typeof value === "string" ? (
          <p
            className={`mt-0.5 break-all text-xs text-zinc-900 ${
              mono ? "font-mono font-medium text-zinc-700" : "font-semibold"
            }`}
          >
            {value}
          </p>
        ) : (
          <div className="text-xs font-semibold text-zinc-900">{value}</div>
        )}
      </div>
    </div>
  );
}
