"use client";

import {
  X,
  Smartphone,
  Apple,
  ShieldCheck,
  Package,
  GitBranch,
  Link as LinkIcon,
  MessageSquare,
  Calendar,
  Clock,
  Hash,
} from "lucide-react";

type AppConfig = {
  _id: string;
  platform: "android" | "ios";
  latestVersion: string;
  minSupportedVersion: string;
  forceUpdate: boolean;
  playStoreUrl: string;
  updateMessage?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ViewAppConfigModalProps = {
  config: AppConfig | null;
  onClose: () => void;
};

const formatDate = (date?: string) => {
  if (!date) return "—";

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

export default function ViewAppConfigModal({
  config,
  onClose,
}: ViewAppConfigModalProps) {
  if (!config) return null;

  const isAndroid = config.platform === "android";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              {isAndroid ? (
                <Smartphone size={20} strokeWidth={2} />
              ) : (
                <Apple size={20} strokeWidth={2} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                  App Configuration
                </h2>

                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                  {config.platform}
                </span>
              </div>

              <p className="text-xs font-medium text-zinc-400">
                Complete mobile release configuration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-200/60 bg-zinc-50/50 text-zinc-400 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 active:scale-95"
            aria-label="Close"
          >
            <X
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
          {/* Release Summary */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Current Release
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <p className="font-mono text-2xl font-bold tracking-tight text-zinc-900">
                    v{config.latestVersion}
                  </p>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Production
                  </span>
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
                <Package
                  size={22}
                  strokeWidth={1.8}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Version Details */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <GitBranch size={15} className="text-zinc-400" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Version Control
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem
                icon={<Package size={16} />}
                label="Latest Version"
                value={`v${config.latestVersion}`}
                highlight
              />

              <DetailItem
                icon={<GitBranch size={16} />}
                label="Minimum Supported"
                value={`v${config.minSupportedVersion}`}
              />
            </div>
          </div>

          {/* Update Policy */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={15} className="text-zinc-400" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Update Policy
              </p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                config.forceUpdate
                  ? "border-red-200 bg-red-50/50"
                  : "border-emerald-200 bg-emerald-50/40"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Force Update
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {config.forceUpdate
                      ? "Users must update before continuing."
                      : "Users can continue without updating."}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    config.forceUpdate
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      config.forceUpdate ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  />

                  {config.forceUpdate ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <LinkIcon size={15} className="text-zinc-400" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Distribution
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                  <LinkIcon size={16} className="text-zinc-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Store URL
                  </p>

                  <p className="mt-1 break-all text-xs font-medium text-blue-600">
                    {config.playStoreUrl || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Update Message */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare size={15} className="text-zinc-400" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                User Experience
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/60 p-4">
              <p className="text-sm leading-relaxed text-zinc-700">
                {config.updateMessage || "No update message configured."}
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              icon={<Calendar size={16} />}
              label="Created"
              value={formatDate(config.createdAt)}
            />

            <DetailItem
              icon={<Clock size={16} />}
              label="Last Updated"
              value={formatDate(config.updatedAt)}
            />
          </div>

          {/* ID */}
          <DetailItem
            icon={<Hash size={16} />}
            label="Configuration ID"
            value={config._id}
            mono
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-800 hover:shadow-zinc-900/20 active:scale-95"
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
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/60 bg-white p-3.5 shadow-sm transition-all hover:border-zinc-300/80">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          highlight ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </p>

        <p
          className={`mt-0.5 break-all text-xs ${
            mono
              ? "font-mono font-medium text-zinc-700"
              : "font-semibold text-zinc-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
