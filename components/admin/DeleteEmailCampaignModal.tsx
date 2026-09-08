"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Hash,
  Loader2,
  Mail,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminApi } from "@/lib/api";

type EmailCampaign = {
  _id: string;
  campaignId: string;
  name: string;
  status: "active" | "completed";
  sentCount?: number;
  failedCount?: number;
  pendingCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type DeleteEmailCampaignModalProps = {
  campaign: EmailCampaign | null;
  onClose: () => void;
  onDeleted: (campaignId: string) => void | Promise<void>;
};

export default function DeleteEmailCampaignModal({
  campaign,
  onClose,
  onDeleted,
}: DeleteEmailCampaignModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  /*
   * Prevent background page scrolling while the modal is open.
   */
  useEffect(() => {
    if (!campaign) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [campaign]);

  /*
   * Escape closes the modal.
   *
   * It is intentionally disabled while the delete request
   * is running so the operation cannot be interrupted visually.
   */
  useEffect(() => {
    if (!campaign) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (deleting) return;

      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [campaign, deleting, onClose]);

  if (!campaign) {
    return null;
  }

  const handleDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      setError("");

      await adminApi(`/admin/email-campaigns/${campaign._id}`, {
        method: "DELETE",
      });

      await onDeleted(campaign._id);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete email campaign.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-2 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-email-campaign-title"
    >
      <div className="relative flex max-h-[calc(100dvh-16px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-32px)]">
        {/* Top destructive accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-red-600 to-rose-600" />

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 shadow-sm">
              <Trash2 size={20} strokeWidth={2} />

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white">
                <AlertTriangle size={9} />
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-500">
                Email Campaign Management
              </p>

              <h2
                id="delete-email-campaign-title"
                className="mt-1 text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl"
              >
                Delete Email Campaign
              </h2>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Review the campaign before permanently removing it.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            aria-label="Close delete email campaign"
            className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <X
              size={18}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <div className="space-y-5">
            {error && <ErrorMessage message={error} />}

            {/* Main warning */}
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                  <AlertTriangle size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-red-900">
                    This action cannot be undone
                  </p>

                  <p className="mt-1 text-[11px] font-medium leading-5 text-red-700">
                    Deleting this campaign permanently removes the campaign
                    record. Make sure you no longer need this campaign before
                    continuing.
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign information */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
              <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Mail size={15} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-zinc-900">
                    Campaign to Delete
                  </p>

                  <p className="mt-0.5 text-[11px] font-medium leading-5 text-zinc-500">
                    Confirm that this is the campaign you want to remove.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                      <Mail size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                        Campaign Name
                      </p>

                      <p className="mt-1 break-words text-sm font-bold text-zinc-900">
                        {campaign.name || "Untitled Campaign"}
                      </p>

                      <div className="mt-2 flex items-start gap-2">
                        <Hash
                          size={11}
                          className="mt-0.5 shrink-0 text-zinc-400"
                        />

                        <p className="break-all font-mono text-[10px] font-medium text-zinc-400">
                          {campaign.campaignId || "No campaign ID"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Campaign statistics */}
            <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
              <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                  <CheckCircle2 size={15} />
                </div>

                <div>
                  <p className="text-xs font-extrabold text-zinc-900">
                    Campaign Statistics
                  </p>

                  <p className="mt-0.5 text-[11px] font-medium leading-5 text-zinc-500">
                    Current delivery records associated with this campaign.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
                {/* Sent */}
                <StatCard
                  icon={<CheckCircle2 size={14} />}
                  label="Sent"
                  value={campaign.sentCount ?? 0}
                />

                {/* Pending */}
                <StatCard
                  icon={<Clock3 size={14} />}
                  label="Pending"
                  value={campaign.pendingCount ?? 0}
                />

                {/* Failed */}
                <StatCard
                  icon={<XCircle size={14} />}
                  label="Failed"
                  value={campaign.failedCount ?? 0}
                  danger={(campaign.failedCount ?? 0) > 0}
                />

                {/* Status */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-zinc-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize ${
                      campaign.status === "completed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        campaign.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                      }`}
                    />

                    {campaign.status}
                  </span>
                </div>
              </div>
            </section>

            {/* Important deletion warning */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-100">
                  <AlertTriangle size={15} />
                </div>

                <div>
                  <p className="text-[11px] font-extrabold text-amber-900">
                    Recipient records
                  </p>

                  <p className="mt-0.5 text-[11px] font-medium leading-5 text-amber-800/80">
                    Any recipient records associated with this campaign should
                    be handled by the backend deletion logic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/70 px-5 py-4 sm:px-7">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-bold text-white shadow-lg shadow-red-600/15 transition-all hover:bg-red-700 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {deleting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Deleting Campaign...
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Delete Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3">
      <div
        className={`flex items-center gap-1.5 ${
          danger ? "text-red-500" : "text-zinc-400"
        }`}
      >
        {icon}

        <span className="text-[9px] font-extrabold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 text-xl font-extrabold ${
          danger ? "text-red-600" : "text-zinc-900"
        }`}
      >
        {value}
      </p>
    </div>
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
          Unable to delete email campaign
        </p>

        <p className="mt-0.5 text-[11px] font-medium leading-5 text-red-700">
          {message}
        </p>
      </div>
    </div>
  );
}
