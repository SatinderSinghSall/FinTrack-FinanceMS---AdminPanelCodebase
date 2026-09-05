"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Loader2,
  ShieldAlert,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Subscription = {
  _id: string;
  name?: string;
  amount?: number;
  currency?: string;
  category?: string;
  billingCycle?: string;
  status?: string;
  autoRenew?: boolean;
  userId?: string;
};

type DeleteSubscriptionModalProps = {
  subscription: Subscription | null;
  onClose: () => void;
  onDeleted: () => void;
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

const formatCategory = (category?: string) => {
  if (!category) {
    return "Other";
  }

  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCycle = (cycle?: string) => {
  if (!cycle) {
    return "Not set";
  }

  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function DeleteSubscriptionModal({
  subscription,
  onClose,
  onDeleted,
}: DeleteSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Escape Key                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!subscription) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [subscription, loading, onClose]);

  /* ------------------------------------------------------------------------ */
  /* No Subscription                                                          */
  /* ------------------------------------------------------------------------ */

  if (!subscription) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      await adminApi(`/admin/subscriptions/${subscription._id}`, {
        method: "DELETE",
      });

      onDeleted();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete subscription.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Derived Values                                                           */
  /* ------------------------------------------------------------------------ */

  const subscriptionName = subscription.name || "Unnamed Subscription";

  const category = formatCategory(subscription.category);

  const amount = formatCurrency(subscription.amount, subscription.currency);

  const cycle = formatCycle(subscription.billingCycle);

  const isActive = subscription.status === "active";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-3 backdrop-blur-md animate-in fade-in duration-200 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-subscription-title"
    >
      {/* ================================================================== */}
      {/* MODAL                                                              */}
      {/* ================================================================== */}

      <div className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-[520px] flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] animate-in zoom-in-95 duration-200 sm:max-h-[calc(100dvh-40px)]">
        {/* ================================================================ */}
        {/* TOP DANGER ACCENT                                                */}
        {/* ================================================================ */}

        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        {/* ================================================================ */}
        {/* HEADER                                                            */}
        {/* ================================================================ */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            {/* Icon */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 shadow-sm">
              <Trash2 size={21} strokeWidth={1.9} />

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white">
                <AlertTriangle size={9} />
              </span>
            </div>

            {/* Heading */}
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-500">
                Subscription Management
              </p>

              <h2
                id="delete-subscription-title"
                className="mt-1 text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl"
              >
                Delete Subscription
              </h2>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Permanently remove this subscription record.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close delete subscription dialog"
            className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* ================================================================ */}
        {/* SCROLLABLE CONTENT                                               */}
        {/* ================================================================ */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-zinc-50/30">
          <div className="space-y-5 px-5 py-6 sm:px-7 sm:py-7">
            {/* ------------------------------------------------------------ */}
            {/* WARNING                                                       */}
            {/* ------------------------------------------------------------ */}

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <AlertTriangle size={18} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-amber-900">
                    Review before deleting
                  </p>

                  <p className="mt-1 text-[11px] font-medium leading-5 text-amber-800/80">
                    This subscription record will be permanently removed. This
                    action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* SUBSCRIPTION RECORD                                           */}
            {/* ------------------------------------------------------------ */}

            <section>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                Subscription Record
              </p>

              <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                {/* Main Record */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    {/* Subscription Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-500 shadow-sm">
                      <CreditCard size={20} strokeWidth={1.8} />
                    </div>

                    {/* Name */}
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-extrabold tracking-tight text-zinc-950">
                        {subscriptionName}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {/* Category */}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[9px] font-bold text-zinc-600">
                          <Tag size={10} />

                          {category}
                        </span>

                        {/* Status */}
                        {subscription.status && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                              isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-zinc-200 bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-emerald-500" : "bg-zinc-400"
                              }`}
                            />

                            {isActive ? "Active" : "Cancelled"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-zinc-400">
                        Amount
                      </p>

                      <p className="mt-1 text-base font-extrabold tracking-tight text-zinc-950 sm:text-lg">
                        {amount}
                      </p>

                      <p className="mt-0.5 text-[9px] font-medium text-zinc-400">
                        / {cycle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* Record Details                                             */}
                {/* -------------------------------------------------------- */}

                <div className="grid grid-cols-1 border-t border-zinc-200/80 sm:grid-cols-2">
                  <DetailItem
                    icon={<CreditCard size={14} />}
                    label="Billing Cycle"
                    value={cycle}
                    borderRight
                  />

                  <DetailItem
                    icon={<IndianRupee size={14} />}
                    label="Currency"
                    value={subscription.currency || "INR"}
                  />

                  <DetailItem
                    icon={<RefreshIcon />}
                    label="Auto Renew"
                    value={subscription.autoRenew ? "Enabled" : "Disabled"}
                    positive={subscription.autoRenew}
                    borderRight
                    borderTop
                  />

                  <DetailItem
                    icon={<User size={14} />}
                    label="Owner"
                    value={subscription.userId || "Not available"}
                    borderTop
                  />
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* RECORD ID                                                     */}
            {/* ------------------------------------------------------------ */}

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                Record ID
              </p>

              <p className="mt-1 break-all font-mono text-[10px] font-medium leading-5 text-zinc-500">
                {subscription._id}
              </p>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* ERROR                                                         */}
            {/* ------------------------------------------------------------ */}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-left shadow-sm"
              >
                <ShieldAlert
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-800">
                    Delete failed
                  </p>

                  <p className="mt-1 text-xs font-medium leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* FINAL WARNING                                                 */}
            {/* ------------------------------------------------------------ */}

            <div className="flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50/60 px-3.5 py-3.5">
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <p className="text-[10px] font-medium leading-5 text-red-700">
                Deleting this record cannot be reversed. Please make sure you
                have selected the correct subscription.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* FOOTER                                                           */}
        {/* ================================================================ */}

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-200/80 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-7">
          {/* Cancel */}
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          {/* Delete */}
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition-all duration-200 hover:bg-red-700 hover:shadow-red-600/30 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-red-600/15 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />

                <span>Deleting Subscription...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />

                <span>Delete Subscription</span>
              </>
            )}
          </button>
        </div>
      </div>
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
  positive,
  borderRight,
  borderTop,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive?: boolean;
  borderRight?: boolean;
  borderTop?: boolean;
}) {
  return (
    <div
      className={[
        "flex min-w-0 items-center gap-2.5 bg-white p-3.5",
        borderRight ? "sm:border-r sm:border-zinc-200/80" : "",
        borderTop ? "border-t border-zinc-200/80" : "",
      ].join(" ")}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          positive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-zinc-50 text-zinc-500"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-zinc-400">
          {label}
        </p>

        <p
          className={`mt-0.5 break-words text-[11px] font-bold ${
            positive ? "text-emerald-600" : "text-zinc-700"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Refresh Icon                                                               */
/* -------------------------------------------------------------------------- */

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}
