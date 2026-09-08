"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  History,
  Mail,
  MousePointerClick,
  Send,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";

type CampaignStatus = "draft" | "active" | "completed";

type EmailCampaign = {
  _id: string;
  campaignId: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  buttonText: string;
  buttonUrl: string;

  status: CampaignStatus;

  sentCount: number;
  failedCount: number;
  pendingCount: number;

  dailyLimit: number;
  sentToday: number;
  remainingToday: number;

  createdAt?: string;
  updatedAt?: string;
};

type EmailCampaignRecipient = {
  _id: string;
  campaign: string;
  user: string | null;
  email: string;

  status: "pending" | "sent" | "failed";

  resendEmailId?: string | null;
  sentAt?: string | null;
  error?: string | null;

  createdAt?: string;
  updatedAt?: string;

  userName?: string | null;
  userEmail?: string | null;
};

type EmailCampaignDetails = {
  campaign: EmailCampaign;

  statistics: {
    sentCount: number;
    failedCount: number;
    pendingCount: number;
    dailyLimit: number;
    sentToday: number;
    remainingToday: number;
  };

  recipients: EmailCampaignRecipient[];
};

type ViewEmailCampaignModalProps = {
  campaign: EmailCampaignDetails | null;
  onClose: () => void;
};

const formatDate = (date?: string | null) => {
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

const recipientStatusClass = (status: EmailCampaignRecipient["status"]) => {
  if (status === "sent") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "failed") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

const campaignStatusClass = (status: CampaignStatus) => {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "active") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

export default function ViewEmailCampaignModal({
  campaign: details,
  onClose,
}: ViewEmailCampaignModalProps) {
  useEffect(() => {
    if (!details) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [details]);

  if (!details) {
    return null;
  }

  const { campaign, statistics, recipients } = details;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-zinc-950/70 p-3 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-email-campaign-title"
    >
      <div className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-40px)]">
        {/* =====================================================
            TOP ACCENT
        ====================================================== */}

        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
              <Mail size={21} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                Email Campaign
              </p>

              <h2
                id="view-email-campaign-title"
                className="mt-1 text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl"
              >
                Campaign Details
              </h2>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Complete campaign, statistics, content and recipient
                information.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close email campaign details"
            className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95"
          >
            <X
              size={18}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* =====================================================
            BODY
        ====================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <div className="space-y-6">
            {/* =================================================
                CAMPAIGN HERO
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50">
              <div className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                      Campaign Name
                    </p>

                    <h3 className="mt-1.5 break-words text-xl font-extrabold tracking-tight text-zinc-950 sm:text-2xl">
                      {campaign.name || "Untitled Campaign"}
                    </h3>

                    <p className="mt-1 break-all font-mono text-xs text-zinc-400">
                      {campaign.campaignId}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${campaignStatusClass(
                      campaign.status,
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        campaign.status === "completed"
                          ? "bg-emerald-500"
                          : campaign.status === "active"
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }`}
                    />

                    {campaign.status}
                  </span>
                </div>
              </div>
            </section>

            {/* =================================================
                EMAIL CAMPAIGN MODEL
            ================================================== */}

            <section>
              <SectionTitle title="EmailCampaign Model" />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Hash size={16} />}
                  label="_id"
                  value={campaign._id}
                  mono
                />

                <DetailItem
                  icon={<Hash size={16} />}
                  label="campaignId"
                  value={campaign.campaignId}
                  mono
                />

                <DetailItem
                  icon={<User size={16} />}
                  label="name"
                  value={campaign.name}
                />

                <DetailItem
                  icon={<Mail size={16} />}
                  label="subject"
                  value={campaign.subject}
                />

                <DetailItem
                  icon={
                    campaign.status === "completed" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Clock3 size={16} />
                    )
                  }
                  label="status"
                  value={campaign.status}
                  badge
                  badgeClass={campaignStatusClass(campaign.status)}
                />

                <DetailItem
                  icon={<Send size={16} />}
                  label="sentCount"
                  value={String(campaign.sentCount)}
                />

                <DetailItem
                  icon={<Clock3 size={16} />}
                  label="pendingCount"
                  value={String(campaign.pendingCount)}
                />

                <DetailItem
                  icon={<XCircle size={16} />}
                  label="failedCount"
                  value={String(campaign.failedCount)}
                  badge={campaign.failedCount > 0}
                  badgeClass="border-red-200 bg-red-50 text-red-700"
                />

                <DetailItem
                  icon={<Send size={16} />}
                  label="dailyLimit"
                  value={String(campaign.dailyLimit)}
                />

                <DetailItem
                  icon={<Send size={16} />}
                  label="sentToday"
                  value={String(campaign.sentToday)}
                />

                <DetailItem
                  icon={<Clock3 size={16} />}
                  label="remainingToday"
                  value={String(campaign.remainingToday)}
                />

                <DetailItem
                  icon={<Calendar size={16} />}
                  label="createdAt"
                  value={formatDate(campaign.createdAt)}
                />

                <DetailItem
                  icon={<History size={16} />}
                  label="updatedAt"
                  value={formatDate(campaign.updatedAt)}
                />

                <DetailItem
                  icon={<MousePointerClick size={16} />}
                  label="buttonText"
                  value={campaign.buttonText || "—"}
                />

                <DetailItem
                  icon={<MousePointerClick size={16} />}
                  label="buttonUrl"
                  value={campaign.buttonUrl || "—"}
                  mono
                />
              </div>
            </section>

            {/* =================================================
                EMAIL CONTENT
            ================================================== */}

            <section>
              <SectionTitle title="Email Content" />

              <div className="space-y-3">
                {/* HTML CONTENT */}

                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/70 px-4 py-3.5 sm:px-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FileText size={15} />
                    </div>

                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                        htmlContent
                      </p>

                      <p className="text-xs font-semibold text-zinc-700">
                        HTML email body
                      </p>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-auto bg-zinc-950 p-4">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-200">
                      {campaign.htmlContent || "—"}
                    </pre>
                  </div>
                </div>

                {/* TEXT CONTENT */}

                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50/70 px-4 py-3.5 sm:px-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                      <FileText size={15} />
                    </div>

                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                        textContent
                      </p>

                      <p className="text-xs font-semibold text-zinc-700">
                        Plain text email body
                      </p>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-auto p-4">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-600">
                      {campaign.textContent || "—"}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SENDING STATISTICS
            ================================================== */}

            <section>
              <SectionTitle title="Sending Statistics" />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                  icon={<Send size={17} />}
                  label="Sent"
                  value={statistics.sentCount}
                />

                <StatCard
                  icon={<Clock3 size={17} />}
                  label="Pending"
                  value={statistics.pendingCount}
                />

                <StatCard
                  icon={<XCircle size={17} />}
                  label="Failed"
                  value={statistics.failedCount}
                  danger={statistics.failedCount > 0}
                />

                <StatCard
                  icon={<Send size={17} />}
                  label="Daily Limit"
                  value={statistics.dailyLimit}
                />

                <StatCard
                  icon={<Calendar size={17} />}
                  label="Sent Today"
                  value={statistics.sentToday}
                />

                <StatCard
                  icon={<Clock3 size={17} />}
                  label="Remaining Today"
                  value={statistics.remainingToday}
                />
              </div>
            </section>

            {/* =================================================
                RECIPIENTS
            ================================================== */}

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <SectionTitle title="EmailCampaignRecipient Model" />

                <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[9px] font-bold text-zinc-500">
                  {recipients.length} recipient
                  {recipients.length === 1 ? "" : "s"}
                </span>
              </div>

              {recipients.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
                  <Mail className="mx-auto h-7 w-7 text-zinc-300" />

                  <p className="mt-2 text-sm font-semibold text-zinc-600">
                    No recipient records
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    This campaign currently has no recipient documents.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recipients.map((recipient, index) => (
                    <div
                      key={recipient._id}
                      className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm"
                    >
                      {/* RECIPIENT HEADER */}

                      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/70 px-4 py-3.5 sm:px-5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <User size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                              Recipient #{index + 1}
                            </p>

                            <p className="truncate text-xs font-bold text-zinc-800">
                              {recipient.userName || recipient.email}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize ${recipientStatusClass(
                            recipient.status,
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              recipient.status === "sent"
                                ? "bg-emerald-500"
                                : recipient.status === "failed"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          />

                          {recipient.status}
                        </span>
                      </div>

                      {/* ALL RECIPIENT FIELDS */}

                      <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <DetailItem
                            icon={<Hash size={16} />}
                            label="_id"
                            value={String(recipient._id)}
                            mono
                            compact
                          />

                          <DetailItem
                            icon={<Hash size={16} />}
                            label="campaign"
                            value={String(recipient.campaign)}
                            mono
                            compact
                          />

                          <DetailItem
                            icon={<User size={16} />}
                            label="user"
                            value={recipient.user || "—"}
                            mono
                            compact
                          />

                          <DetailItem
                            icon={<Mail size={16} />}
                            label="email"
                            value={recipient.email}
                            compact
                          />

                          <DetailItem
                            icon={<User size={16} />}
                            label="User Name"
                            value={recipient.userName || "—"}
                            compact
                          />

                          <DetailItem
                            icon={<Mail size={16} />}
                            label="User Email"
                            value={recipient.userEmail || "—"}
                            compact
                          />

                          <DetailItem
                            icon={<Clock3 size={16} />}
                            label="status"
                            value={recipient.status}
                            badge
                            badgeClass={recipientStatusClass(recipient.status)}
                            compact
                          />

                          <DetailItem
                            icon={<Send size={16} />}
                            label="resendEmailId"
                            value={recipient.resendEmailId || "—"}
                            mono
                            compact
                          />

                          <DetailItem
                            icon={<Calendar size={16} />}
                            label="sentAt"
                            value={formatDate(recipient.sentAt)}
                            compact
                          />

                          <DetailItem
                            icon={<AlertCircle size={16} />}
                            label="error"
                            value={recipient.error || "—"}
                            compact
                          />

                          <DetailItem
                            icon={<Calendar size={16} />}
                            label="createdAt"
                            value={formatDate(recipient.createdAt)}
                            compact
                          />

                          <DetailItem
                            icon={<History size={16} />}
                            label="updatedAt"
                            value={formatDate(recipient.updatedAt)}
                            compact
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =================================================
                RAW DATABASE SUMMARY
            ================================================== */}

            <section>
              <SectionTitle title="Database Information" />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Hash size={16} />}
                  label="Campaign Database ID"
                  value={campaign._id}
                  mono
                />

                <DetailItem
                  icon={<Hash size={16} />}
                  label="Campaign Identifier"
                  value={campaign.campaignId}
                  mono
                />

                <DetailItem
                  icon={<User size={16} />}
                  label="Total Recipients"
                  value={String(recipients.length)}
                />

                <DetailItem
                  icon={<Send size={16} />}
                  label="Processed"
                  value={String(statistics.sentCount + statistics.failedCount)}
                />
              </div>
            </section>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/70 px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden text-[10px] font-medium text-zinc-400 sm:block">
              Showing complete campaign and recipient information.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl bg-zinc-950 px-6 text-xs font-bold text-white shadow-lg shadow-zinc-950/10 transition-all hover:bg-zinc-800 active:scale-[0.98] sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   SECTION TITLE
============================================================= */

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-px w-4 bg-zinc-200" />

      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
        {title}
      </p>
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
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        danger ? "border-red-200" : "border-zinc-200/70"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
            danger ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {icon}
        </div>

        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
          {label}
        </p>
      </div>

      <p
        className={`mt-3 text-2xl font-extrabold ${
          danger ? "text-red-600" : "text-zinc-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =============================================================
   DETAIL ITEM
============================================================= */

function DetailItem({
  icon,
  label,
  value,
  mono = false,
  badge = false,
  badgeClass = "",
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
  badgeClass?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-start gap-3 rounded-2xl border border-zinc-200/70 bg-white shadow-sm ${
        compact ? "p-3" : "p-3.5"
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
          {label}
        </p>

        {badge ? (
          <span
            className={`mt-1.5 inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${badgeClass}`}
          >
            {value}
          </span>
        ) : (
          <p
            className={`mt-1 break-words text-xs ${
              mono
                ? "font-mono font-medium text-zinc-600"
                : "font-semibold text-zinc-900"
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
