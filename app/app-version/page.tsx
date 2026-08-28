"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type AppConfig = {
  _id?: string;
  platform: "android";
  latestVersion: string;
  minSupportedVersion: string;
  forceUpdate: boolean;
  playStoreUrl: string;
  updateMessage: string;
  updatedAt?: string;
};

type AppConfigResponse = {
  success: boolean;
  data: AppConfig;
  message?: string;
};

type FieldErrors = {
  latestVersion?: string;
  minSupportedVersion?: string;
  playStoreUrl?: string;
  updateMessage?: string;
};

const DEFAULT_UPDATE_MESSAGE =
  "A new version of FinTrack is available with improvements and new features.";

const EMPTY_CONFIG: AppConfig = {
  platform: "android",
  latestVersion: "",
  minSupportedVersion: "",
  forceUpdate: false,
  playStoreUrl: "",
  updateMessage: DEFAULT_UPDATE_MESSAGE,
};

export default function AppVersionPage() {
  const router = useRouter();

  const [config, setConfig] = useState<AppConfig>(EMPTY_CONFIG);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [hasChanges, setHasChanges] = useState(false);

  /* =========================================================
     VERSION HELPERS
  ========================================================== */

  const compareVersions = (a: string, b: string): number => {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      const aPart = aParts[i] ?? 0;
      const bPart = bParts[i] ?? 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  };

  const isValidVersion = (version: string) => {
    return /^\d+\.\d+\.\d+$/.test(version.trim());
  };

  /* =========================================================
     LOAD CONFIG
  ========================================================== */

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setFieldErrors({});

      const response: AppConfigResponse = await adminApi("/admin/app-config");

      if (!response.data) {
        throw new Error("App configuration not found.");
      }

      setConfig({
        platform: "android",
        latestVersion: response.data.latestVersion || "",
        minSupportedVersion: response.data.minSupportedVersion || "",
        forceUpdate: Boolean(response.data.forceUpdate),
        playStoreUrl: response.data.playStoreUrl || "",
        updateMessage: response.data.updateMessage || DEFAULT_UPDATE_MESSAGE,
        updatedAt: response.data.updatedAt,
        _id: response.data._id,
      });

      setHasChanges(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load app configuration.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  /* =========================================================
     FIELD UPDATE
  ========================================================== */

  const updateField = <K extends keyof AppConfig>(
    field: K,
    value: AppConfig[K],
  ) => {
    setConfig((current) => ({
      ...current,
      [field]: value,
    }));

    setHasChanges(true);

    setError("");
    setSuccess("");

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================== */

  const validateFields = (): FieldErrors => {
    const errors: FieldErrors = {};

    const latestVersion = config.latestVersion.trim();
    const minVersion = config.minSupportedVersion.trim();
    const playStoreUrl = config.playStoreUrl.trim();
    const updateMessage = config.updateMessage.trim();

    /* Latest version */

    if (!latestVersion) {
      errors.latestVersion = "Latest version is required.";
    } else if (!isValidVersion(latestVersion)) {
      errors.latestVersion = "Use the format X.Y.Z, for example 3.2.0.";
    }

    /* Minimum supported version */

    if (!minVersion) {
      errors.minSupportedVersion = "Minimum supported version is required.";
    } else if (!isValidVersion(minVersion)) {
      errors.minSupportedVersion = "Use the format X.Y.Z, for example 3.1.0.";
    }

    if (
      !errors.latestVersion &&
      !errors.minSupportedVersion &&
      compareVersions(minVersion, latestVersion) > 0
    ) {
      errors.minSupportedVersion =
        "Minimum version cannot be greater than the latest version.";
    }

    /* Play Store URL */

    if (!playStoreUrl) {
      errors.playStoreUrl = "Google Play Store URL is required.";
    } else {
      try {
        const url = new URL(playStoreUrl);

        if (url.protocol !== "https:" || url.hostname !== "play.google.com") {
          errors.playStoreUrl = "Enter a valid Google Play Store URL.";
        }
      } catch {
        errors.playStoreUrl = "Enter a valid Google Play Store URL.";
      }
    }

    /* Update message */

    if (!updateMessage) {
      errors.updateMessage = "Update message is required.";
    } else if (updateMessage.length > 200) {
      errors.updateMessage = "Update message cannot exceed 200 characters.";
    }

    return errors;
  };

  /* =========================================================
     SAVE
  ========================================================== */

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const errors = validateFields();

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please review the highlighted fields before saving.");
      return;
    }

    try {
      setSaving(true);

      const response = await adminApi("/admin/app-config", {
        method: "PUT",
        body: JSON.stringify({
          latestVersion: config.latestVersion.trim(),
          minSupportedVersion: config.minSupportedVersion.trim(),
          forceUpdate: config.forceUpdate,
          playStoreUrl: config.playStoreUrl.trim(),
          updateMessage: config.updateMessage.trim(),
        }),
      });

      if (response.data) {
        setConfig({
          platform: "android",
          latestVersion: response.data.latestVersion || "",
          minSupportedVersion: response.data.minSupportedVersion || "",
          forceUpdate: Boolean(response.data.forceUpdate),
          playStoreUrl: response.data.playStoreUrl || "",
          updateMessage: response.data.updateMessage || DEFAULT_UPDATE_MESSAGE,
          updatedAt: response.data.updatedAt,
          _id: response.data._id,
        });
      }

      setFieldErrors({});
      setHasChanges(false);

      setSuccess(response.message || "App configuration updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update app configuration.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DERIVED RELEASE STATE
  ========================================================== */

  const releaseState = useMemo(() => {
    const latest = config.latestVersion.trim();
    const minimum = config.minSupportedVersion.trim();

    if (!isValidVersion(latest) || !isValidVersion(minimum)) {
      return {
        label: "Configuration incomplete",
        description: "Complete the version fields to see release status.",
        tone: "neutral",
      };
    }

    const comparison = compareVersions(minimum, latest);

    if (comparison > 0) {
      return {
        label: "Configuration invalid",
        description:
          "Minimum supported version is higher than the latest version.",
        tone: "danger",
      };
    }

    return {
      label: config.forceUpdate
        ? "Forced update enabled"
        : "Optional updates enabled",
      description: config.forceUpdate
        ? "Users with an older supported version will be prompted to update."
        : "Users below the latest version can continue using FinTrack.",
      tone: config.forceUpdate ? "warning" : "success",
    };
  }, [config.latestVersion, config.minSupportedVersion, config.forceUpdate]);

  /* =========================================================
     PAGE LOADER
  ========================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center px-5 py-10 sm:px-8">
        <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-zinc-200/80 bg-white px-6 py-8 text-center shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)] sm:px-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
            <Loader2 size={24} className="animate-spin text-zinc-900" />
          </div>

          <h2 className="mt-5 text-base font-bold tracking-tight text-zinc-900">
            Loading app settings
          </h2>

          <p className="mt-1.5 text-sm font-medium leading-relaxed text-zinc-500">
            Retrieving the current FinTrack release configuration.
          </p>

          <div className="mt-5 h-1 w-32 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 px-4 py-5 font-sans sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-12">
        {/* =====================================================
            BACK BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="group inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-bold text-zinc-600 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
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

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-zinc-400">
                App Management
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-[-0.035em] text-zinc-950 sm:text-4xl">
                App Version
              </h1>

              {hasChanges && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                  Unsaved changes
                </span>
              )}
            </div>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
              Control the FinTrack Android release version, update requirements,
              and user update experience.
            </p>
          </div>

          <button
            type="button"
            onClick={loadConfig}
            disabled={loading || saving}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-zinc-200 bg-white px-4 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 lg:self-auto cursor-pointer"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}

            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {/* =====================================================
            MAIN ERROR
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
                Unable to save changes
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

            <div>
              <p className="text-xs font-extrabold text-emerald-800">
                Changes saved
              </p>

              <p className="mt-0.5 text-xs font-medium leading-5 text-emerald-700">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ===================================================
              SETTINGS
          ==================================================== */}

          <section className="min-w-0 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_10px_35px_-25px_rgba(0,0,0,0.35)]">
            {/* Card Header */}

            <div className="border-b border-zinc-100 px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                  <Smartphone size={21} strokeWidth={1.9} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold tracking-tight text-zinc-950">
                      Android App
                    </h2>

                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-600">
                      Production
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Manage the release configuration used by FinTrack mobile
                    clients.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}

            <div className="space-y-7 px-5 py-6 sm:px-7 sm:py-7">
              {/* =================================================
                  VERSION
              ================================================== */}

              <div>
                <div className="mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Version Control
                  </h3>

                  <p className="mt-1 text-xs font-medium text-zinc-500">
                    Define which release is current and which older releases are
                    still supported.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Latest */}

                  <div>
                    <label
                      htmlFor="latestVersion"
                      className="mb-2 block text-xs font-bold text-zinc-800"
                    >
                      Latest Version
                    </label>

                    <input
                      id="latestVersion"
                      type="text"
                      inputMode="decimal"
                      value={config.latestVersion}
                      disabled={saving}
                      onChange={(e) =>
                        updateField("latestVersion", e.target.value)
                      }
                      placeholder="3.2.0"
                      aria-invalid={Boolean(fieldErrors.latestVersion)}
                      aria-describedby={
                        fieldErrors.latestVersion
                          ? "latestVersion-error"
                          : "latestVersion-help"
                      }
                      className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 ${
                        fieldErrors.latestVersion
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />

                    {fieldErrors.latestVersion ? (
                      <p
                        id="latestVersion-error"
                        className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600"
                      >
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />

                        {fieldErrors.latestVersion}
                      </p>
                    ) : (
                      <p
                        id="latestVersion-help"
                        className="mt-1.5 text-[11px] font-medium text-zinc-400"
                      >
                        Version currently published on Google Play.
                      </p>
                    )}
                  </div>

                  {/* Minimum */}

                  <div>
                    <label
                      htmlFor="minSupportedVersion"
                      className="mb-2 block text-xs font-bold text-zinc-800"
                    >
                      Minimum Supported Version
                    </label>

                    <input
                      id="minSupportedVersion"
                      type="text"
                      inputMode="decimal"
                      value={config.minSupportedVersion}
                      disabled={saving}
                      onChange={(e) =>
                        updateField("minSupportedVersion", e.target.value)
                      }
                      placeholder="3.1.0"
                      aria-invalid={Boolean(fieldErrors.minSupportedVersion)}
                      aria-describedby={
                        fieldErrors.minSupportedVersion
                          ? "minVersion-error"
                          : "minVersion-help"
                      }
                      className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 ${
                        fieldErrors.minSupportedVersion
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />

                    {fieldErrors.minSupportedVersion ? (
                      <p
                        id="minVersion-error"
                        className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600"
                      >
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />

                        {fieldErrors.minSupportedVersion}
                      </p>
                    ) : (
                      <p
                        id="minVersion-help"
                        className="mt-1.5 text-[11px] font-medium text-zinc-400"
                      >
                        Versions below this value must update.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  UPDATE POLICY
              ================================================== */}

              <div>
                <div className="mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Update Policy
                  </h3>
                </div>

                <div
                  className={`rounded-2xl border p-4 transition-colors ${
                    config.forceUpdate
                      ? "border-blue-200 bg-blue-50/60"
                      : "border-zinc-200 bg-zinc-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${
                          config.forceUpdate ? "text-blue-600" : "text-zinc-500"
                        }`}
                      >
                        <ShieldCheck size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900">
                          Force Update
                        </p>

                        <p className="mt-1 max-w-xl text-xs font-medium leading-5 text-zinc-500">
                          Require users to update instead of allowing them to
                          dismiss the update prompt.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={config.forceUpdate}
                      aria-label="Toggle force update"
                      disabled={saving}
                      onClick={() =>
                        updateField("forceUpdate", !config.forceUpdate)
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${
                        config.forceUpdate
                          ? "bg-blue-600"
                          : "bg-zinc-300 cursor-pointer"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          config.forceUpdate
                            ? "translate-x-[22px]"
                            : "translate-x-[2px]"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-zinc-200/70 pt-3">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        config.forceUpdate ? "bg-blue-600" : "bg-emerald-500"
                      }`}
                    />

                    <span className="text-[11px] font-semibold text-zinc-500">
                      {config.forceUpdate
                        ? "Users cannot dismiss the update."
                        : "Users can continue without updating."}
                    </span>
                  </div>
                </div>
              </div>

              {/* =================================================
                  STORE
              ================================================== */}

              <div>
                <div className="mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                    Distribution
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="playStoreUrl"
                    className="mb-2 block text-xs font-bold text-zinc-800"
                  >
                    Google Play Store URL
                  </label>

                  <div className="relative">
                    <input
                      id="playStoreUrl"
                      type="url"
                      value={config.playStoreUrl}
                      disabled={saving}
                      onChange={(e) =>
                        updateField("playStoreUrl", e.target.value)
                      }
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      aria-invalid={Boolean(fieldErrors.playStoreUrl)}
                      aria-describedby={
                        fieldErrors.playStoreUrl
                          ? "playStore-error"
                          : "playStore-help"
                      }
                      className={`h-11 w-full rounded-xl border bg-white px-3.5 pr-11 text-sm font-medium text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 ${
                        fieldErrors.playStoreUrl
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />

                    {config.playStoreUrl && !saving && (
                      <a
                        href={config.playStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open Google Play Store"
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>

                  {fieldErrors.playStoreUrl ? (
                    <p
                      id="playStore-error"
                      className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600"
                    >
                      <AlertCircle size={13} className="mt-0.5 shrink-0" />

                      {fieldErrors.playStoreUrl}
                    </p>
                  ) : (
                    <p
                      id="playStore-help"
                      className="mt-1.5 text-[11px] font-medium text-zinc-400"
                    >
                      Users are sent here when they choose to update.
                    </p>
                  )}
                </div>
              </div>

              {/* =================================================
                  MESSAGE
              ================================================== */}

              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                      User Experience
                    </h3>

                    <p className="mt-1 text-xs font-medium text-zinc-500">
                      Customize the message displayed in the mobile update
                      prompt.
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-[10px] font-bold ${
                      config.updateMessage.length > 200
                        ? "text-red-600"
                        : "text-zinc-400"
                    }`}
                  >
                    {config.updateMessage.length}/200
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="updateMessage"
                    className="mb-2 block text-xs font-bold text-zinc-800"
                  >
                    Update Message
                  </label>

                  <textarea
                    id="updateMessage"
                    rows={4}
                    maxLength={200}
                    value={config.updateMessage}
                    disabled={saving}
                    onChange={(e) =>
                      updateField("updateMessage", e.target.value)
                    }
                    placeholder="Enter the message users will see..."
                    aria-invalid={Boolean(fieldErrors.updateMessage)}
                    aria-describedby={
                      fieldErrors.updateMessage
                        ? "updateMessage-error"
                        : "updateMessage-help"
                    }
                    className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm font-medium leading-6 text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:ring-4 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 ${
                      fieldErrors.updateMessage
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />

                  {fieldErrors.updateMessage ? (
                    <p
                      id="updateMessage-error"
                      className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-4 text-red-600"
                    >
                      <AlertCircle size={13} className="mt-0.5 shrink-0" />

                      {fieldErrors.updateMessage}
                    </p>
                  ) : (
                    <p
                      id="updateMessage-help"
                      className="mt-1.5 text-[11px] font-medium text-zinc-400"
                    >
                      This text will be shown inside the FinTrack mobile update
                      modal.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                SAVE FOOTER
            ================================================== */}

            <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
                  <Info size={14} />

                  <span>
                    Changes are applied to future mobile version checks.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-xs font-bold text-white shadow-lg shadow-zinc-950/10 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ===================================================
              SIDEBAR
          ==================================================== */}

          <aside className="space-y-6">
            {/* =================================================
                RELEASE STATUS
            ================================================== */}

            <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_10px_35px_-25px_rgba(0,0,0,0.35)]">
              <div className="border-b border-zinc-100 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                      Release Status
                    </p>

                    <h2 className="mt-1 text-base font-bold tracking-tight text-zinc-950">
                      Android
                    </h2>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500">
                    <Smartphone size={17} />
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Latest */}

                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Latest Release
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="font-mono text-2xl font-bold tracking-tight text-zinc-950">
                      {config.latestVersion || "—"}
                    </span>

                    <span className="mb-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600">
                      Production
                    </span>
                  </div>
                </div>

                {/* Versions */}

                <div className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-100">
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-xs font-medium text-zinc-500">
                      Minimum supported
                    </span>

                    <span className="font-mono text-xs font-bold text-zinc-800">
                      {config.minSupportedVersion || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-xs font-medium text-zinc-500">
                      Force update
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        config.forceUpdate
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {config.forceUpdate ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                {/* State */}

                <div
                  className={`mt-3 rounded-2xl border p-3.5 ${
                    releaseState.tone === "success"
                      ? "border-emerald-100 bg-emerald-50/60"
                      : releaseState.tone === "warning"
                        ? "border-amber-100 bg-amber-50/60"
                        : releaseState.tone === "danger"
                          ? "border-red-100 bg-red-50/60"
                          : "border-zinc-100 bg-zinc-50"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {releaseState.tone === "danger" ? (
                      <AlertCircle
                        size={15}
                        className="mt-0.5 shrink-0 text-red-600"
                      />
                    ) : releaseState.tone === "warning" ? (
                      <ShieldCheck
                        size={15}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />
                    ) : (
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                    )}

                    <div>
                      <p className="text-[11px] font-bold text-zinc-800">
                        {releaseState.label}
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium leading-4 text-zinc-500">
                        {releaseState.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                UPDATE BEHAVIOR
            ================================================== */}

            <section className="overflow-hidden rounded-3xl border border-blue-100 bg-blue-50/50">
              <div className="border-b border-blue-100/80 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Sparkles size={15} />
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-500">
                      Update Logic
                    </p>

                    <h3 className="text-sm font-bold text-blue-950">
                      How FinTrack behaves
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />

                  <div>
                    <p className="text-xs font-bold text-blue-950">
                      Below minimum
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium leading-4 text-blue-900/60">
                      The mobile app requires the user to update.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                  <div>
                    <p className="text-xs font-bold text-blue-950">
                      Below latest
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium leading-4 text-blue-900/60">
                      The user sees an optional update prompt.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                  <div>
                    <p className="text-xs font-bold text-blue-950">
                      Latest version
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium leading-4 text-blue-900/60">
                      No update prompt is displayed.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                LAST UPDATED
            ================================================== */}

            {config.updatedAt && (
              <div className="px-1">
                <p className="text-[10px] font-medium text-zinc-400">
                  Last updated
                </p>

                <p className="mt-1 text-[11px] font-semibold text-zinc-500">
                  {new Date(config.updatedAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
