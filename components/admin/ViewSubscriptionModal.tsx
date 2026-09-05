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
  CheckCircle2,
  XCircle,
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date?: string) => {
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

const formatCategory = (category?: string) => {
  if (!category) {
    return "Other";
  }

  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ViewSubscriptionModal({
  subscription,
  onClose,
}: ViewSubscriptionModalProps) {
  if (!subscription) {
    return null;
  }

  const isActive = subscription.status === "active";
  const autoRenewEnabled = subscription.autoRenew === true;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/65 p-3 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-modal-title"
    >
      {/* Modal */}
      <div className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
        {/* Top Accent */}
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-950" />

        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-zinc-900/10 sm:h-11 sm:w-11">
              <CreditCard size={21} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h2
                id="subscription-modal-title"
                className="truncate text-base font-semibold tracking-tight text-zinc-950 sm:text-[17px]"
              >
                Subscription Details
              </h2>

              <p className="mt-0.5 text-[11px] font-medium text-zinc-400 sm:text-xs">
                Complete billing and renewal details
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="group ml-3 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 active:scale-95"
            aria-label="Close subscription details"
          >
            <X
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Scrollable Body                                                    */}
        {/* ------------------------------------------------------------------ */}

        <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/40">
          <div className="space-y-5 p-4 sm:p-6">
            {/* -------------------------------------------------------------- */}
            {/* Hero                                                            */}
            {/* -------------------------------------------------------------- */}

            <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 shadow-sm">
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  {/* Service */}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                      Service Name
                    </span>

                    <h3 className="mt-1.5 break-words text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                      {subscription.name || "Unnamed Subscription"}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                      {formatCategory(subscription.category)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="shrink-0 sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                      Recurring Cost
                    </span>

                    <div className="mt-1 flex items-baseline gap-1 sm:justify-end">
                      <span className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                        {formatCurrency(
                          subscription.amount,
                          subscription.currency,
                        )}
                      </span>

                      <span className="text-xs font-medium text-zinc-400">
                        / {subscription.billingCycle || "cycle"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
                  {/* Status */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                      isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {isActive ? (
                      <CheckCircle2 size={13} strokeWidth={2} />
                    ) : (
                      <XCircle size={13} strokeWidth={2} />
                    )}

                    {isActive ? "Active Subscription" : "Cancelled"}
                  </span>

                  {/* Auto Renew */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                      autoRenewEnabled
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-zinc-200 bg-white text-zinc-600"
                    }`}
                  >
                    <RefreshCw size={12} strokeWidth={2} />
                    Auto-Renew {autoRenewEnabled ? "Enabled" : "Disabled"}
                  </span>

                  {/* Category */}
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 shadow-sm">
                    <Tag size={12} strokeWidth={2} className="text-zinc-400" />
                    {formatCategory(subscription.category)}
                  </span>
                </div>
              </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* Billing & Renewal                                              */}
            {/* -------------------------------------------------------------- */}

            <section>
              <SectionHeading
                icon={<RefreshCw size={14} />}
                title="Billing & Renewal"
              />

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Layers size={16} />}
                  label="Billing Cycle"
                  value={formatCycle(subscription.billingCycle)}
                />

                <DetailItem
                  icon={<Wallet size={16} />}
                  label="Payment Method"
                  value={subscription.paymentMethod || "—"}
                />

                <DetailItem
                  icon={<Calendar size={16} />}
                  label="Start Date"
                  value={formatDate(subscription.startDate)}
                />

                <DetailItem
                  icon={<Clock size={16} />}
                  label="Next Renewal Date"
                  value={formatDate(subscription.nextRenewalDate)}
                  highlight={isActive}
                />

                <DetailItem
                  icon={<Bell size={16} />}
                  label="Reminder Settings"
                  value={
                    typeof subscription.reminderDaysBefore === "number"
                      ? `${subscription.reminderDaysBefore} day${
                          subscription.reminderDaysBefore === 1 ? "" : "s"
                        } before renewal`
                      : "—"
                  }
                />

                <DetailItem
                  icon={<RefreshCw size={16} />}
                  label="Auto-Renew"
                  value={autoRenewEnabled ? "Enabled" : "Disabled"}
                />
              </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* Appearance & Ownership                                         */}
            {/* -------------------------------------------------------------- */}

            <section>
              <SectionHeading
                icon={<Palette size={14} />}
                title="Appearance & Ownership"
              />

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Palette size={16} />}
                  label="Theme Customization"
                  value={
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="break-all">
                        Icon: {subscription.icon || "—"}
                      </span>

                      {subscription.color && (
                        <>
                          <span className="hidden h-4 border-l border-zinc-200 sm:block" />

                          <span
                            className="h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-sm"
                            style={{
                              backgroundColor: subscription.color,
                            }}
                            title={subscription.color}
                          />

                          <span className="font-mono text-[11px] font-medium text-zinc-500">
                            {subscription.color}
                          </span>
                        </>
                      )}
                    </div>
                  }
                />

                <DetailItem
                  icon={<Tag size={16} />}
                  label="Category"
                  value={formatCategory(subscription.category)}
                />

                <DetailItem
                  icon={<User size={16} />}
                  label="Associated User ID"
                  value={subscription.userId || "—"}
                  mono
                />

                <DetailItem
                  icon={<Hash size={16} />}
                  label="Subscription ID"
                  value={subscription._id}
                  mono
                />
              </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* Notes                                                           */}
            {/* -------------------------------------------------------------- */}

            <section>
              <SectionHeading
                icon={<AlignLeft size={14} />}
                title="Notes & Description"
              />

              <div className="mt-3 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm sm:p-5">
                {subscription.notes?.trim() ? (
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700">
                    {subscription.notes.trim()}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <AlignLeft size={15} />
                    <span>
                      No additional notes specified for this subscription.
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* System Information                                              */}
            {/* -------------------------------------------------------------- */}

            <section>
              <SectionHeading
                icon={<Activity size={14} />}
                title="System Information"
              />

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Calendar size={16} />}
                  label="Created At"
                  value={formatDateTime(subscription.createdAt)}
                />

                <DetailItem
                  icon={<Activity size={16} />}
                  label="Last Updated"
                  value={formatDateTime(subscription.updatedAt)}
                />
              </div>
            </section>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Footer                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex shrink-0 items-center justify-end border-t border-zinc-200/70 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-950/10 transition-all duration-200 hover:bg-zinc-800 hover:shadow-zinc-950/20 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:ring-offset-2 active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Heading                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm">
        {icon}
      </span>

      <span>{title}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail Item                                                                */
/* -------------------------------------------------------------------------- */

function DetailItem({
  icon,
  label,
  value,
  mono = false,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group flex min-w-0 items-start gap-3 rounded-2xl border p-3.5 shadow-sm transition-all duration-200 sm:p-4 ${
        highlight
          ? "border-emerald-200/70 bg-emerald-50/30 hover:border-emerald-300"
          : "border-zinc-200/70 bg-white hover:border-zinc-300 hover:shadow-md"
      }`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
          highlight
            ? "bg-emerald-100 text-emerald-600"
            : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
        }`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
          {label}
        </p>

        {typeof value === "string" ? (
          <p
            className={`mt-1 break-words text-xs leading-5 ${
              mono
                ? "font-mono font-medium text-zinc-600"
                : "font-semibold text-zinc-900"
            }`}
            title={value}
          >
            {value}
          </p>
        ) : (
          <div className="mt-1 text-xs font-semibold leading-5 text-zinc-900">
            {value}
          </div>
        )}
      </div>
    </div>
  );
}
