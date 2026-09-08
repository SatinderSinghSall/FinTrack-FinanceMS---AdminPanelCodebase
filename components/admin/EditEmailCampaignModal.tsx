"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Hash,
  HelpCircle,
  Loader2,
  Mail,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { adminApi } from "@/lib/api";

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

  sentCount?: number;
  failedCount?: number;
  pendingCount?: number;

  dailyLimit?: number;
  sentToday?: number;
  remainingToday?: number;

  createdAt?: string;
  updatedAt?: string;
};

type EditEmailCampaignModalProps = {
  campaign: EmailCampaign | null;
  onClose: () => void;
  onUpdated: (campaign: EmailCampaign) => void | Promise<void>;
};

const MAX_NAME_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 200;

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

const textareaClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium leading-6 text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

export default function EditEmailCampaignModal({
  campaign,
  onClose,
  onUpdated,
}: EditEmailCampaignModalProps) {
  const [loadingCampaign, setLoadingCampaign] = useState(false);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [textContent, setTextContent] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  const [originalCampaign, setOriginalCampaign] =
    useState<EmailCampaign | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  /*
   * Fetch the complete campaign whenever the edit modal opens.
   */
  useEffect(() => {
    if (!campaign) {
      return;
    }

    let cancelled = false;

    const loadCampaign = async () => {
      try {
        setLoadingCampaign(true);
        setLoading(false);
        setError("");
        setShowConfirm(false);

        const response = await adminApi(
          `/admin/email-campaigns/${campaign._id}`,
        );

        if (cancelled) {
          return;
        }

        const fullCampaign = response?.data?.campaign;

        if (!fullCampaign) {
          throw new Error("Unable to load campaign details.");
        }

        setOriginalCampaign(fullCampaign);

        setName(fullCampaign.name || "");
        setSubject(fullCampaign.subject || "");
        setHtmlContent(fullCampaign.htmlContent || "");
        setTextContent(fullCampaign.textContent || "");
        setButtonText(fullCampaign.buttonText || "");
        setButtonUrl(fullCampaign.buttonUrl || "");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Unable to load email campaign.",
        );
      } finally {
        if (!cancelled) {
          setLoadingCampaign(false);
        }
      }
    };

    loadCampaign();

    return () => {
      cancelled = true;
    };
  }, [campaign]);

  /*
   * Lock page/body scroll while modal is open.
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
   * Escape key.
   */
  useEffect(() => {
    if (!campaign) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || loading || loadingCampaign) {
        return;
      }

      if (showConfirm) {
        setShowConfirm(false);
        setError("");
        return;
      }

      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [campaign, loading, loadingCampaign, showConfirm, onClose]);

  const trimmedName = name.trim();
  const trimmedSubject = subject.trim();
  const trimmedHtmlContent = htmlContent.trim();
  const trimmedTextContent = textContent.trim();
  const trimmedButtonText = buttonText.trim();
  const trimmedButtonUrl = buttonUrl.trim();

  const hasChanges = useMemo(() => {
    if (!originalCampaign) {
      return false;
    }

    return (
      trimmedName !== (originalCampaign.name || "").trim() ||
      trimmedSubject !== (originalCampaign.subject || "").trim() ||
      trimmedHtmlContent !== (originalCampaign.htmlContent || "").trim() ||
      trimmedTextContent !== (originalCampaign.textContent || "").trim() ||
      trimmedButtonText !== (originalCampaign.buttonText || "").trim() ||
      trimmedButtonUrl !== (originalCampaign.buttonUrl || "").trim()
    );
  }, [
    originalCampaign,
    trimmedName,
    trimmedSubject,
    trimmedHtmlContent,
    trimmedTextContent,
    trimmedButtonText,
    trimmedButtonUrl,
  ]);

  if (!campaign) {
    return null;
  }

  /*
   * Validate before showing confirmation.
   */
  const handleRequestSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!trimmedName) {
      setError("Campaign name is required.");
      return;
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(`Campaign name cannot exceed ${MAX_NAME_LENGTH} characters.`);
      return;
    }

    if (!trimmedSubject) {
      setError("Email subject is required.");
      return;
    }

    if (trimmedSubject.length > MAX_SUBJECT_LENGTH) {
      setError(`Email subject cannot exceed ${MAX_SUBJECT_LENGTH} characters.`);
      return;
    }

    if (!trimmedHtmlContent) {
      setError("HTML email content is required.");
      return;
    }

    if (trimmedButtonText && !trimmedButtonUrl) {
      setError("Button URL is required when button text is provided.");
      return;
    }

    if (trimmedButtonUrl && !trimmedButtonText) {
      setError("Button text is required when button URL is provided.");
      return;
    }

    if (trimmedButtonUrl) {
      try {
        const url = new URL(trimmedButtonUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          setError("Button URL must use HTTP or HTTPS.");
          return;
        }
      } catch {
        setError("Please enter a valid button URL.");
        return;
      }
    }

    if (!hasChanges) {
      setError("No changes were made to this campaign.");
      return;
    }

    if (originalCampaign?.status !== "draft") {
      setError("Only draft campaigns can be edited.");
      return;
    }

    setShowConfirm(true);
  };

  /*
   * Actually update the campaign.
   */
  const handleConfirmSave = async () => {
    if (loading || !originalCampaign) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await adminApi(
        `/admin/email-campaigns/${originalCampaign._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: trimmedName,
            subject: trimmedSubject,
            htmlContent: trimmedHtmlContent,
            textContent: trimmedTextContent,
            buttonText: trimmedButtonText,
            buttonUrl: trimmedButtonUrl,
          }),
        },
      );

      await onUpdated(response.data);

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update email campaign.",
      );

      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || loadingCampaign;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-zinc-950/70 p-2 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-email-campaign-title"
    >
      <div className="relative flex h-full max-h-[calc(100dvh-16px)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-32px)]">
        {/* =====================================================
            TOP ACCENT
        ====================================================== */}

        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
              <Mail size={20} strokeWidth={2} />

              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white">
                <Pencil size={9} />
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-500">
                Email Campaign Management
              </p>

              <h2
                id="edit-email-campaign-title"
                className="mt-1 text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl"
              >
                Edit Email Campaign
              </h2>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Update all editable campaign information before sending emails.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isDisabled}
            onClick={onClose}
            aria-label="Close edit email campaign"
            className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <X
              size={18}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loadingCampaign ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

              <p className="text-sm font-bold text-zinc-800">
                Loading campaign...
              </p>

              <p className="text-xs text-zinc-400">
                Fetching complete campaign information.
              </p>
            </div>
          </div>
        ) : showConfirm ? (
          /* =====================================================
             CONFIRMATION
          ====================================================== */

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-8 sm:px-7 sm:py-10">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
                  <HelpCircle size={30} strokeWidth={1.8} />
                </div>

                <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-600">
                  Review Changes
                </p>

                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-zinc-950 sm:text-2xl">
                  Confirm Campaign Update
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-zinc-500">
                  Review the updated campaign information before saving.
                </p>
              </div>

              {/* Change Summary */}

              <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ReviewItem
                  label="Campaign Name"
                  oldValue={originalCampaign?.name || "—"}
                  newValue={trimmedName}
                />

                <ReviewItem
                  label="Subject"
                  oldValue={originalCampaign?.subject || "—"}
                  newValue={trimmedSubject}
                />

                <ReviewItem
                  label="Button Text"
                  oldValue={originalCampaign?.buttonText || "—"}
                  newValue={trimmedButtonText || "—"}
                />

                <ReviewItem
                  label="Button URL"
                  oldValue={originalCampaign?.buttonUrl || "—"}
                  newValue={trimmedButtonUrl || "—"}
                />
              </div>

              <div className="mt-4 space-y-4">
                <ContentReview
                  label="HTML Content"
                  oldValue={originalCampaign?.htmlContent || "—"}
                  newValue={trimmedHtmlContent}
                />

                <ContentReview
                  label="Text Content"
                  oldValue={originalCampaign?.textContent || "—"}
                  newValue={trimmedTextContent || "—"}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge status={originalCampaign?.status || "draft"} />

                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[9px] font-bold text-zinc-600">
                  Campaign ID: {originalCampaign?.campaignId}
                </span>
              </div>

              {error && (
                <div className="mt-5">
                  <ErrorMessage message={error} />
                </div>
              )}

              <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setShowConfirm(false);
                    setError("");
                  }}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmSave}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 text-xs font-bold text-white shadow-lg shadow-zinc-950/15 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Yes, Update Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =====================================================
             EDIT FORM
          ====================================================== */

          <form
            onSubmit={handleRequestSave}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Scrollable Content */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
              <div className="space-y-5">
                {error && <ErrorMessage message={error} />}

                {/* =================================================
                    CAMPAIGN INFORMATION
                ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
                  <SectionHeader
                    icon={<Pencil size={15} />}
                    title="Campaign Information"
                    description="Edit the campaign name and email subject."
                  />

                  <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-2">
                    {/* Campaign Name */}

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                          htmlFor="edit-email-campaign-name"
                          className="text-xs font-bold text-zinc-800"
                        >
                          Campaign Name
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <span className="text-[10px] font-bold text-zinc-400">
                          {name.length}/{MAX_NAME_LENGTH}
                        </span>
                      </div>

                      <input
                        id="edit-email-campaign-name"
                        type="text"
                        value={name}
                        maxLength={MAX_NAME_LENGTH}
                        disabled={isDisabled}
                        autoComplete="off"
                        placeholder="Enter campaign name"
                        onChange={(event) => {
                          setName(event.target.value);
                          setError("");
                        }}
                        className={`${inputClass} h-11`}
                      />
                    </div>

                    {/* Subject */}

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                          htmlFor="edit-email-campaign-subject"
                          className="text-xs font-bold text-zinc-800"
                        >
                          Email Subject
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <span className="text-[10px] font-bold text-zinc-400">
                          {subject.length}/{MAX_SUBJECT_LENGTH}
                        </span>
                      </div>

                      <input
                        id="edit-email-campaign-subject"
                        type="text"
                        value={subject}
                        maxLength={MAX_SUBJECT_LENGTH}
                        disabled={isDisabled}
                        autoComplete="off"
                        placeholder="Enter email subject"
                        onChange={(event) => {
                          setSubject(event.target.value);
                          setError("");
                        }}
                        className={`${inputClass} h-11`}
                      />
                    </div>
                  </div>
                </section>

                {/* =================================================
                    EMAIL CONTENT
                ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
                  <SectionHeader
                    icon={<FileText size={15} />}
                    title="Email Content"
                    description="Edit the HTML and plain-text versions of the email."
                  />

                  <div className="space-y-5 p-4 sm:p-5">
                    {/* HTML */}

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                          htmlFor="edit-email-campaign-html"
                          className="text-xs font-bold text-zinc-800"
                        >
                          HTML Content
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <span className="text-[10px] font-bold text-zinc-400">
                          {htmlContent.length.toLocaleString()} characters
                        </span>
                      </div>

                      <textarea
                        id="edit-email-campaign-html"
                        value={htmlContent}
                        disabled={isDisabled}
                        onChange={(event) => {
                          setHtmlContent(event.target.value);
                          setError("");
                        }}
                        placeholder="<p>Write your email content...</p>"
                        rows={12}
                        className={`${textareaClass} resize-y font-mono text-xs`}
                      />

                      <p className="mt-2 text-[10px] font-medium leading-4 text-zinc-400">
                        This HTML is inserted into the FinTrack email template
                        before delivery.
                      </p>
                    </div>

                    {/* TEXT */}

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                          htmlFor="edit-email-campaign-text"
                          className="text-xs font-bold text-zinc-800"
                        >
                          Text Content
                        </label>

                        <span className="text-[10px] font-bold text-zinc-400">
                          {textContent.length.toLocaleString()} characters
                        </span>
                      </div>

                      <textarea
                        id="edit-email-campaign-text"
                        value={textContent}
                        disabled={isDisabled}
                        onChange={(event) => {
                          setTextContent(event.target.value);
                          setError("");
                        }}
                        placeholder="Plain text version of the email..."
                        rows={8}
                        className={`${textareaClass} resize-y`}
                      />

                      <p className="mt-2 text-[10px] font-medium leading-4 text-zinc-400">
                        Used as the plain-text fallback for email clients that
                        do not support HTML.
                      </p>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    BUTTON / CTA
                ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
                  <SectionHeader
                    icon={<Mail size={15} />}
                    title="Call To Action"
                    description="Optionally add a button to the email."
                  />

                  <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-2">
                    {/* Button Text */}

                    <div>
                      <label
                        htmlFor="edit-email-campaign-button-text"
                        className="mb-2 block text-xs font-bold text-zinc-800"
                      >
                        Button Text
                      </label>

                      <input
                        id="edit-email-campaign-button-text"
                        type="text"
                        value={buttonText}
                        disabled={isDisabled}
                        autoComplete="off"
                        placeholder="e.g. Update FinTrack"
                        onChange={(event) => {
                          setButtonText(event.target.value);
                          setError("");
                        }}
                        className={`${inputClass} h-11`}
                      />
                    </div>

                    {/* Button URL */}

                    <div>
                      <label
                        htmlFor="edit-email-campaign-button-url"
                        className="mb-2 block text-xs font-bold text-zinc-800"
                      >
                        Button URL
                      </label>

                      <input
                        id="edit-email-campaign-button-url"
                        type="url"
                        value={buttonUrl}
                        disabled={isDisabled}
                        autoComplete="off"
                        placeholder="https://example.com"
                        onChange={(event) => {
                          setButtonUrl(event.target.value);
                          setError("");
                        }}
                        className={`${inputClass} h-11`}
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-3.5 sm:px-5">
                    <p className="text-[10px] font-medium leading-5 text-zinc-500">
                      Button text and button URL must either both be provided or
                      both be empty.
                    </p>
                  </div>
                </section>

                {/* =================================================
                    SYSTEM INFORMATION
                ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
                  <SectionHeader
                    icon={<Hash size={15} />}
                    title="System Information"
                    description="Read-only identifiers, delivery statistics and campaign state."
                  />

                  <div className="grid grid-cols-1 gap-3 p-4 sm:p-5 lg:grid-cols-2">
                    <ReadOnlyCard
                      label="Campaign ID"
                      value={
                        originalCampaign?.campaignId || campaign.campaignId
                      }
                      mono
                    />

                    <ReadOnlyCard
                      label="Database ID"
                      value={originalCampaign?._id || campaign._id}
                      mono
                    />

                    <ReadOnlyCard
                      label="Status"
                      value={originalCampaign?.status || campaign.status}
                      badge
                      badgeClass={statusClass(
                        originalCampaign?.status || campaign.status,
                      )}
                    />

                    <ReadOnlyCard
                      label="Sent"
                      value={String(originalCampaign?.sentCount ?? 0)}
                    />

                    <ReadOnlyCard
                      label="Pending"
                      value={String(originalCampaign?.pendingCount ?? 0)}
                    />

                    <ReadOnlyCard
                      label="Failed"
                      value={String(originalCampaign?.failedCount ?? 0)}
                    />

                    <ReadOnlyCard
                      label="Daily Limit"
                      value={String(originalCampaign?.dailyLimit ?? 100)}
                    />

                    <ReadOnlyCard
                      label="Sent Today"
                      value={String(originalCampaign?.sentToday ?? 0)}
                    />

                    <ReadOnlyCard
                      label="Remaining Today"
                      value={String(originalCampaign?.remainingToday ?? 0)}
                    />

                    <ReadOnlyCard
                      label="Created At"
                      value={formatDate(originalCampaign?.createdAt)}
                    />

                    <ReadOnlyCard
                      label="Updated At"
                      value={formatDate(originalCampaign?.updatedAt)}
                    />
                  </div>
                </section>

                {/* =================================================
                    DELIVERY SAFETY
                ================================================== */}

                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                    <CheckCircle2 size={15} />
                  </div>

                  <div>
                    <p className="text-[11px] font-extrabold text-blue-900">
                      Delivery data is protected
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium leading-5 text-blue-700/80">
                      Editing changes campaign content only. Existing sent,
                      pending and failed recipient records are not modified.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/70 px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="hidden text-[10px] font-medium text-zinc-400 sm:block">
                  Only draft campaigns can be edited.
                </p>

                <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={onClose}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isDisabled || !hasChanges}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 text-xs font-bold text-white shadow-lg shadow-zinc-950/15 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  >
                    {loadingCampaign ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Review Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* =============================================================
   SECTION HEADER
============================================================= */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-extrabold text-zinc-900">{title}</p>

        <p className="mt-0.5 text-[11px] font-medium leading-5 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   READ ONLY CARD
============================================================= */

function ReadOnlyCard({
  label,
  value,
  mono = false,
  badge = false,
  badgeClass = "",
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
  badgeClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-3.5">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>

      {badge ? (
        <span
          className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${badgeClass}`}
        >
          {value}
        </span>
      ) : (
        <p
          className={`mt-1.5 break-all text-xs font-semibold text-zinc-800 ${
            mono ? "font-mono" : ""
          }`}
        >
          {value || "—"}
        </p>
      )}
    </div>
  );
}

/* =============================================================
   REVIEW ITEM
============================================================= */

function ReviewItem({
  label,
  oldValue,
  newValue,
}: {
  label: string;
  oldValue: string;
  newValue: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
        {label}
      </p>

      <div className="mt-3 space-y-2">
        <div>
          <span className="text-[9px] font-bold text-zinc-400">FROM</span>

          <p className="mt-0.5 break-words text-xs font-semibold text-zinc-500 line-through">
            {oldValue}
          </p>
        </div>

        <div>
          <span className="text-[9px] font-bold text-emerald-600">TO</span>

          <p className="mt-0.5 break-words text-xs font-bold text-zinc-900">
            {newValue}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   CONTENT REVIEW
============================================================= */

function ContentReview({
  label,
  oldValue,
  newValue,
}: {
  label: string;
  oldValue: string;
  newValue: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 bg-zinc-50/70 px-4 py-3">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
          {label}
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-zinc-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div className="min-w-0 p-4">
          <p className="mb-2 text-[9px] font-bold text-zinc-400">CURRENT</p>

          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-zinc-50 p-3 font-mono text-[10px] leading-5 text-zinc-500">
            {oldValue}
          </pre>
        </div>

        <div className="min-w-0 p-4">
          <p className="mb-2 text-[9px] font-bold text-emerald-600">UPDATED</p>

          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-emerald-50/50 p-3 font-mono text-[10px] leading-5 text-zinc-700">
            {newValue}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   STATUS
============================================================= */

function statusClass(status: CampaignStatus) {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "active") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize ${statusClass(
        status,
      )}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "completed"
            ? "bg-emerald-500"
            : status === "active"
              ? "bg-blue-500"
              : "bg-amber-500"
        }`}
      />

      {status}
    </span>
  );
}

/* =============================================================
   DATE
============================================================= */

function formatDate(date?: string | null) {
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
}

/* =============================================================
   ERROR
============================================================= */

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
          Unable to update email campaign
        </p>

        <p className="mt-0.5 text-[11px] font-medium leading-5 text-red-700">
          {message}
        </p>
      </div>
    </div>
  );
}
