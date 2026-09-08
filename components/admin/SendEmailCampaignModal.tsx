"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Hash,
  Loader2,
  Mail,
  Send,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminApi } from "@/lib/api";

type EmailCampaign = {
  _id: string;
  campaignId: string;
  name: string;
  subject?: string;
  status: "draft" | "active" | "completed";

  sentCount?: number;
  failedCount?: number;
  pendingCount?: number;

  dailyLimit?: number;
  sentToday?: number;
  remainingToday?: number;
};

type SendEmailCampaignModalProps = {
  campaign: EmailCampaign | null;
  onClose: () => void;
  onSent: () => void | Promise<void>;
};

export default function SendEmailCampaignModal({
  campaign,
  onClose,
  onSent,
}: SendEmailCampaignModalProps) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  /*
   * Reset modal state whenever a different campaign is opened.
   */
  useEffect(() => {
    if (campaign) {
      setError("");
      setSending(false);
    }
  }, [campaign]);

  /*
   * Lock background scrolling while modal is open.
   */
  useEffect(() => {
    if (!campaign) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [campaign]);

  /*
   * Escape closes the modal.
   */
  useEffect(() => {
    if (!campaign) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [campaign, sending, onClose]);

  /*
   * IMPORTANT:
   * All hooks are above this return.
   * This prevents React hook-order errors.
   */
  if (!campaign) {
    return null;
  }

  const isCompleted = campaign.status === "completed";

  const pendingCount = campaign.pendingCount ?? 0;
  const dailyLimit = campaign.dailyLimit ?? 100;
  const sentToday = campaign.sentToday ?? 0;

  const remainingToday =
    campaign.remainingToday ?? Math.max(dailyLimit - sentToday, 0);

  const availableToSend = Math.min(pendingCount, remainingToday);

  const sentCount = campaign.sentCount ?? 0;
  const failedCount = campaign.failedCount ?? 0;

  const usagePercent =
    dailyLimit > 0 ? Math.min((sentToday / dailyLimit) * 100, 100) : 0;

  const hasNoPending = pendingCount <= 0;
  const limitReached = remainingToday <= 0;

  const canSend = !sending && !isCompleted && !hasNoPending && !limitReached;

  let sendDescription = "";

  if (isCompleted) {
    sendDescription =
      "This campaign has already been completed and cannot be sent again.";
  } else if (hasNoPending) {
    sendDescription =
      "There are currently no pending recipients for this campaign.";
  } else if (limitReached) {
    sendDescription =
      "The daily sending limit has been reached. You can continue sending when daily capacity is available again.";
  } else {
    sendDescription = `Up to ${availableToSend} pending recipient${
      availableToSend === 1 ? "" : "s"
    } will be processed in this send.`;
  }

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    try {
      setSending(true);
      setError("");

      /*
       * Send THIS campaign.
       *
       * Dynamic campaign endpoint:
       * /admin/email-campaigns/:id/send
       */
      await adminApi(`/admin/email-campaigns/${campaign._id}/send`, {
        method: "POST",
      });

      await onSent();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send email campaign.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-zinc-950/70 p-3 backdrop-blur-md sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-email-campaign-title"
      onMouseDown={(event) => {
        /*
         * Do not close modal by clicking outside.
         */
        event.stopPropagation();
      }}
    >
      <div
        className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_100px_-25px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-40px)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            TOP ACCENT
        ====================================================== */}

        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-start justify-between gap-5 border-b border-zinc-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
              <Send size={21} strokeWidth={2} />

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white">
                <Mail size={9} />
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-500">
                Send Campaign
              </p>

              <h2
                id="send-email-campaign-title"
                className="mt-1 text-xl font-extrabold tracking-tight text-zinc-950 sm:text-2xl"
              >
                Send Email Campaign?
              </h2>

              <p className="mt-1.5 max-w-xl text-xs font-medium leading-5 text-zinc-500">
                Review the campaign and delivery capacity before sending.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            aria-label="Close send campaign modal"
            className="group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              size={19}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* =====================================================
            SCROLLABLE BODY
        ====================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
            {/* Error */}

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                  <AlertTriangle size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold text-red-800">
                    Unable to send campaign
                  </p>

                  <p className="mt-0.5 text-xs font-medium leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                CAMPAIGN INFORMATION
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mail size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-zinc-900">
                    Campaign Information
                  </p>

                  <p className="mt-0.5 text-[11px] font-medium leading-5 text-zinc-500">
                    Review the campaign that will be delivered.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-extrabold text-zinc-950 sm:text-lg">
                        {campaign.name || "Untitled Campaign"}
                      </p>

                      {campaign.subject && (
                        <div className="mt-3">
                          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
                            Email Subject
                          </p>

                          <p className="mt-1 text-sm font-semibold leading-5 text-zinc-700">
                            {campaign.subject}
                          </p>
                        </div>
                      )}
                    </div>

                    <StatusBadge status={campaign.status} />
                  </div>

                  <div className="mt-4 flex items-start gap-2 border-t border-zinc-200 pt-3">
                    <Hash size={13} className="mt-0.5 shrink-0 text-zinc-400" />

                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-zinc-400">
                        Campaign ID
                      </p>

                      <p className="mt-1 break-all font-mono text-[10px] font-medium text-zinc-500">
                        {campaign.campaignId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                DELIVERY OVERVIEW
            ================================================== */}

            <section>
              <div className="mb-3">
                <p className="text-xs font-extrabold text-zinc-900">
                  Delivery Overview
                </p>

                <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                  Current campaign recipient state.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  icon={<Users size={16} />}
                  label="Pending"
                  value={pendingCount}
                  description="Recipients"
                  variant="blue"
                />

                <StatCard
                  icon={<CheckCircle2 size={16} />}
                  label="Sent"
                  value={sentCount}
                  description="Total sent"
                  variant="green"
                />

                <StatCard
                  icon={<AlertTriangle size={16} />}
                  label="Failed"
                  value={failedCount}
                  description="Delivery failures"
                  variant="red"
                />

                <StatCard
                  icon={<Clock3 size={16} />}
                  label="This Send"
                  value={availableToSend}
                  description="Can process now"
                  variant="purple"
                />
              </div>
            </section>

            {/* =================================================
                DAILY CAPACITY
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold text-zinc-900">
                      Daily Sending Capacity
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium leading-5 text-zinc-500">
                      Current email sending usage for today.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-bold text-zinc-600">
                    {sentToday} / {dailyLimit}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                      Today&apos;s Usage
                    </span>

                    <span className="text-[10px] font-bold text-zinc-600">
                      {Math.round(usagePercent)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{
                        width: `${usagePercent}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <CapacityItem label="Daily Limit" value={dailyLimit} />

                  <CapacityItem label="Sent Today" value={sentToday} />

                  <CapacityItem
                    label="Available Today"
                    value={remainingToday}
                    highlight
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                SEND SUMMARY
            ================================================== */}

            <section
              className={`rounded-2xl border p-4 sm:p-5 ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50/70"
                  : hasNoPending || limitReached
                    ? "border-amber-200 bg-amber-50/70"
                    : "border-blue-200 bg-blue-50/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${
                    isCompleted
                      ? "text-emerald-600"
                      : hasNoPending || limitReached
                        ? "text-amber-600"
                        : "text-blue-600"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <AlertTriangle size={17} />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-extrabold ${
                      isCompleted
                        ? "text-emerald-900"
                        : hasNoPending || limitReached
                          ? "text-amber-900"
                          : "text-blue-900"
                    }`}
                  >
                    {isCompleted
                      ? "Campaign Completed"
                      : hasNoPending
                        ? "No Pending Recipients"
                        : limitReached
                          ? "Daily Limit Reached"
                          : `Ready to Send ${availableToSend} Email${
                              availableToSend === 1 ? "" : "s"
                            }`}
                  </p>

                  <p
                    className={`mt-1 text-[11px] font-medium leading-5 ${
                      isCompleted
                        ? "text-emerald-700"
                        : hasNoPending || limitReached
                          ? "text-amber-700"
                          : "text-blue-700"
                    }`}
                  >
                    {sendDescription}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/95 px-5 py-4 sm:px-7">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                Delivery Action
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
                Only pending recipients within today&apos;s capacity will be
                sent.
              </p>
            </div>

            <div className="flex w-full flex-col-reverse gap-2.5 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 text-xs font-bold text-white shadow-lg shadow-zinc-950/15 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {sending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Send {availableToSend > 0 ? availableToSend : ""} Email
                    {availableToSend === 1 ? "" : "s"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  variant: "blue" | "green" | "red" | "purple";
}) {
  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-blue-700",
    },

    green: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
    },

    red: {
      icon: "bg-red-50 text-red-600",
      value: "text-red-700",
    },

    purple: {
      icon: "bg-violet-50 text-violet-600",
      value: "text-violet-700",
    },
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles[variant].icon}`}
        >
          {icon}
        </div>

        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-zinc-400">
          {label}
        </p>
      </div>

      <p
        className={`mt-4 text-2xl font-extrabold tracking-tight ${styles[variant].value}`}
      >
        {value.toLocaleString()}
      </p>

      <p className="mt-0.5 text-[10px] font-medium text-zinc-400">
        {description}
      </p>
    </div>
  );
}

/* =============================================================
   CAPACITY ITEM
============================================================= */

function CapacityItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 ${
        highlight
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-zinc-200 bg-zinc-50/60"
      }`}
    >
      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </p>

      <p
        className={`mt-1.5 text-lg font-extrabold ${
          highlight ? "text-emerald-700" : "text-zinc-900"
        }`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({ status }: { status: "draft" | "active" | "completed" }) {
  const styles = {
    draft: "border-amber-200 bg-amber-50 text-amber-700",
    active: "border-blue-200 bg-blue-50 text-blue-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const dots = {
    draft: "bg-amber-500",
    active: "bg-blue-500",
    completed: "bg-emerald-500",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />

      {status}
    </span>
  );
}
