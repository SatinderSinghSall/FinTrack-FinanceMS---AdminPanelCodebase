"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  Save,
  Send,
  Link as LinkIcon,
  FileText,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type CampaignForm = {
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  buttonText: string;
  buttonUrl: string;
};

type CreateCampaignResponse = {
  success?: boolean;
  message?: string;
  data?: {
    campaign?: {
      _id?: string;
      campaignId?: string;
      name?: string;
      subject?: string;
      status?: string;
    };
  };
};

const INITIAL_FORM: CampaignForm = {
  name: "",
  subject: "",
  htmlContent: "",
  textContent: "",
  buttonText: "",
  buttonUrl: "",
};

export default function SendEmailCampaignsPage() {
  const router = useRouter();

  const [form, setForm] = useState<CampaignForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isBusy = loading;

  const updateField = (field: keyof CampaignForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const validateForm = () => {
    const name = form.name.trim();
    const subject = form.subject.trim();
    const htmlContent = form.htmlContent.trim();
    const textContent = form.textContent.trim();
    const buttonText = form.buttonText.trim();
    const buttonUrl = form.buttonUrl.trim();

    if (!name) {
      return "Please enter a campaign name.";
    }

    if (!subject) {
      return "Please enter an email subject.";
    }

    if (!htmlContent) {
      return "Please enter the email HTML content.";
    }

    if (buttonText && !buttonUrl) {
      return "Please enter a button URL when button text is provided.";
    }

    if (buttonUrl) {
      try {
        const url = new URL(buttonUrl);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
          return "Button URL must use http:// or https://.";
        }
      } catch {
        return "Please enter a valid button URL.";
      }
    }

    return null;
  };

  const handleCreateCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isBusy) return;

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response: CreateCampaignResponse = await adminApi(
        "/admin/email-campaigns",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            subject: form.subject.trim(),
            htmlContent: form.htmlContent.trim(),
            textContent: form.textContent.trim(),
            buttonText: form.buttonText.trim(),
            buttonUrl: form.buttonUrl.trim(),
          }),
        },
      );

      if (response?.success === false) {
        throw new Error(
          response.message || "Unable to create the email campaign.",
        );
      }

      const campaign = response?.data?.campaign;

      setSuccess(
        response.message ||
          `Campaign "${campaign?.name || form.name.trim()}" created successfully.`,
      );

      /*
       * Give the success message a moment to render before moving
       * back to the campaign collection page.
       */
      setTimeout(() => {
        router.push("/email-campaigns");
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the email campaign.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isBusy) return;

    router.back();
  };

  return (
    <div className="min-w-0 px-4 py-5 font-sans sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-12">
        {/* =====================================================
            BACK BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={handleBack}
          disabled={isBusy}
          className="group inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-bold text-zinc-600 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft
            size={15}
            strokeWidth={2}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />

          <span>Back</span>
        </button>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

            <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-zinc-400">
              User Communication
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-zinc-950 sm:text-4xl">
            Create Email Campaign
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
            Create a new email campaign for your FinTrack users. The campaign
            will be saved as a draft and can be sent later from the Email
            Campaigns page.
          </p>
        </header>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
              <AlertCircle size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-extrabold text-red-800">
                Unable to create campaign
              </p>

              <p className="mt-0.5 text-xs font-medium leading-5 text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 shadow-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-extrabold text-emerald-800">
                Campaign created
              </p>

              <p className="mt-0.5 text-xs font-medium leading-5 text-emerald-700">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            CREATE FORM
        ====================================================== */}

        <form onSubmit={handleCreateCampaign}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* =================================================
                LEFT — CAMPAIGN FORM
            ================================================== */}

            <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_10px_35px_-25px_rgba(0,0,0,0.35)]">
              <div className="border-b border-zinc-100 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                    <Mail size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                      New Campaign
                    </p>

                    <h2 className="mt-0.5 text-sm font-bold tracking-tight text-zinc-950">
                      Campaign Information
                    </h2>

                    <p className="mt-1 text-xs font-medium text-zinc-500">
                      Configure the email that will be sent to your users.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 px-5 py-6 sm:px-7 sm:py-7">
                {/* =================================================
                    CAMPAIGN NAME
                ================================================== */}

                <FormField
                  label="Campaign Name"
                  description="Internal name used to identify this campaign."
                  required
                >
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="e.g. FinTrack App Update"
                    disabled={isBusy}
                    maxLength={120}
                    className={inputClassName}
                  />

                  <FieldCounter value={form.name} max={120} />
                </FormField>

                {/* =================================================
                    SUBJECT
                ================================================== */}

                <FormField
                  label="Email Subject"
                  description="This is the subject users will see in their inbox."
                  required
                >
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(event) =>
                      updateField("subject", event.target.value)
                    }
                    placeholder="e.g. 🚀 Update FinTrack to the latest version"
                    disabled={isBusy}
                    maxLength={200}
                    className={inputClassName}
                  />

                  <FieldCounter value={form.subject} max={200} />
                </FormField>

                {/* =================================================
                    HTML CONTENT
                ================================================== */}

                <FormField
                  label="HTML Content"
                  description="Enter the HTML body of the email."
                  required
                >
                  <textarea
                    value={form.htmlContent}
                    onChange={(event) =>
                      updateField("htmlContent", event.target.value)
                    }
                    placeholder={`<p>Hello,</p>

<p>We have an important update for you.</p>

<p>Thank you for using FinTrack!</p>`}
                    disabled={isBusy}
                    rows={16}
                    className={`${textareaClassName} font-mono text-[12px] leading-6`}
                  />
                </FormField>

                {/* =================================================
                    TEXT CONTENT
                ================================================== */}

                <FormField
                  label="Plain Text Content"
                  description="Optional fallback content for email clients that do not support HTML."
                >
                  <textarea
                    value={form.textContent}
                    onChange={(event) =>
                      updateField("textContent", event.target.value)
                    }
                    placeholder={`Hello,

We have an important update for you.

Thank you for using FinTrack!`}
                    disabled={isBusy}
                    rows={8}
                    className={textareaClassName}
                  />
                </FormField>

                {/* =================================================
                    CTA
                ================================================== */}

                <div className="border-t border-zinc-100 pt-6">
                  <div className="mb-5">
                    <p className="text-sm font-bold text-zinc-950">
                      Optional Call-to-Action
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                      Add a button to the bottom of the email. Leave both fields
                      empty if you do not need one.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Button Text">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                          <Send size={15} />
                        </div>

                        <input
                          type="text"
                          value={form.buttonText}
                          onChange={(event) =>
                            updateField("buttonText", event.target.value)
                          }
                          placeholder="Update FinTrack"
                          disabled={isBusy}
                          maxLength={80}
                          className={`${inputClassName} pl-10`}
                        />
                      </div>
                    </FormField>

                    <FormField label="Button URL">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                          <LinkIcon size={15} />
                        </div>

                        <input
                          type="url"
                          value={form.buttonUrl}
                          onChange={(event) =>
                            updateField("buttonUrl", event.target.value)
                          }
                          placeholder="https://example.com"
                          disabled={isBusy}
                          className={`${inputClassName} pl-10`}
                        />
                      </div>
                    </FormField>
                  </div>
                </div>
              </div>

              {/* =================================================
                  FORM FOOTER
              ================================================== */}

              <div className="flex flex-col gap-2.5 border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isBusy}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-xs font-bold text-white shadow-lg shadow-zinc-950/10 transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Create Campaign
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* =================================================
                RIGHT — HELP / FLOW
            ================================================== */}

            <div className="space-y-6">
              {/* =================================================
                  HOW IT WORKS
              ================================================== */}

              <section className="overflow-hidden rounded-3xl border border-blue-100 bg-blue-50/50">
                <div className="flex items-start gap-3 px-5 py-5 sm:px-6">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Info size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-500">
                      How It Works
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-blue-950">
                      Create first, send later
                    </h3>

                    <p className="mt-1.5 text-xs font-medium leading-5 text-blue-800">
                      Creating a campaign does not send any emails. It creates a
                      draft that you can review before sending.
                    </p>
                  </div>
                </div>

                <div className="border-t border-blue-100 px-5 py-5 sm:px-6">
                  <Step
                    number="1"
                    title="Create"
                    description="Enter the campaign name, subject and email content."
                  />

                  <Step
                    number="2"
                    title="Review"
                    description="The campaign appears in Email Campaigns as a draft."
                  />

                  <Step
                    number="3"
                    title="Send"
                    description="Open the campaign and confirm when you are ready to send."
                  />

                  <Step
                    number="4"
                    title="Daily Limit"
                    description="Only the configured number of emails can be sent per day."
                    last
                  />
                </div>
              </section>

              {/* =================================================
                  CAMPAIGN ID
              ================================================== */}

              <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_10px_35px_-25px_rgba(0,0,0,0.35)]">
                <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600">
                      <FileText size={17} />
                    </div>

                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                        Campaign ID
                      </p>

                      <h3 className="mt-0.5 text-sm font-bold text-zinc-950">
                        Automatically generated
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  <p className="text-xs font-medium leading-5 text-zinc-500">
                    You do not need to enter a Campaign ID. The backend
                    automatically creates a unique ID when you create the
                    campaign.
                  </p>

                  <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <p className="font-mono text-[11px] font-semibold text-zinc-500">
                      fintrack-YYYYMMDD-random
                    </p>
                  </div>
                </div>
              </section>

              {/* =================================================
                  IMPORTANT
              ================================================== */}

              <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_10px_35px_-25px_rgba(0,0,0,0.35)] sm:p-6">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                  Important
                </p>

                <div className="mt-4 space-y-3">
                  <ImportantItem>
                    Creating the campaign does <strong>not</strong> send emails.
                  </ImportantItem>

                  <ImportantItem>
                    The campaign starts with <strong>Draft</strong> status.
                  </ImportantItem>

                  <ImportantItem>
                    Sending is done from the <strong>Email Campaigns</strong>{" "}
                    page.
                  </ImportantItem>

                  <ImportantItem>
                    The backend controls the daily email sending limit.
                  </ImportantItem>
                </div>
              </section>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form Components                                                            */
/* -------------------------------------------------------------------------- */

const inputClassName =
  "mt-2 block h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500";

const textareaClassName =
  "mt-2 block w-full resize-y rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500";

function FormField({
  label,
  description,
  required = false,
  children,
}: {
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <label className="text-xs font-extrabold text-zinc-900">{label}</label>

        {required && <span className="text-xs font-bold text-red-500">*</span>}
      </div>

      {description && (
        <p className="mt-1 text-[11px] font-medium leading-5 text-zinc-400">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}

function FieldCounter({ value, max }: { value: string; max: number }) {
  return (
    <div className="mt-1.5 flex justify-end">
      <span className="text-[10px] font-semibold text-zinc-400">
        {value.length}/{max}
      </span>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-blue-600 shadow-sm ring-1 ring-blue-100">
          {number}
        </div>

        {!last && <div className="mt-1 h-full min-h-8 w-px bg-blue-100" />}
      </div>

      <div className={last ? "pb-0" : "pb-4"}>
        <p className="text-xs font-bold text-blue-950">{title}</p>

        <p className="mt-1 text-[11px] font-medium leading-5 text-blue-800">
          {description}
        </p>
      </div>
    </div>
  );
}

function ImportantItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />

      <p className="text-xs font-medium leading-5 text-zinc-500">{children}</p>
    </div>
  );
}
