"use client";

import {
  X,
  Megaphone,
  Calendar,
  Clock,
  Hash,
  AlignLeft,
  Tag,
  Link,
  Power,
  Plus,
  Pencil,
  History,
} from "lucide-react";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "feature";
  isActive?: boolean;
  startDate?: string;
  endDate?: string | null;
  action?: {
    enabled?: boolean;
    label?: string;
    route?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type ViewAnnouncementModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
};

const formatDate = (date?: string | null) => {
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

const typeStyles: Record<
  string,
  {
    badge: string;
    dot: string;
    accent: string;
  }
> = {
  info: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    accent: "from-blue-500 via-indigo-500 to-violet-600",
  },
  success: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    accent: "from-emerald-500 via-teal-500 to-green-600",
  },
  warning: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    accent: "from-amber-500 via-orange-500 to-red-500",
  },
  feature: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
    accent: "from-violet-500 via-purple-500 to-indigo-600",
  },
};

export default function ViewAnnouncementModal({
  announcement,
  onClose,
}: ViewAnnouncementModalProps) {
  if (!announcement) {
    return null;
  }

  const type = announcement.type || "info";

  const style = typeStyles[type] || typeStyles.info;

  const actionEnabled = Boolean(announcement.action?.enabled);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-3 backdrop-blur-md sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-announcement-title"
    >
      <div className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:max-h-[calc(100dvh-40px)]">
        {/* =====================================================
            TOP ACCENT
        ====================================================== */}

        <div className={`h-1.5 w-full bg-gradient-to-r ${style.accent}`} />

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
              <Megaphone size={21} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                Announcement
              </p>

              <h2
                id="view-announcement-title"
                className="mt-1 text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl"
              >
                Announcement Details
              </h2>

              <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">
                Complete announcement information and configuration.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close announcement details"
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
          <div className="space-y-5">
            {/* =================================================
                HERO / TITLE
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50">
              <div className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                      Title
                    </p>

                    <h3 className="mt-1.5 break-words text-xl font-extrabold tracking-tight text-zinc-950 sm:text-2xl">
                      {announcement.title || "Untitled Announcement"}
                    </h3>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${style.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                      />

                      {type}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        announcement.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-zinc-200 bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          announcement.isActive
                            ? "bg-emerald-500"
                            : "bg-zinc-400"
                        }`}
                      />

                      {announcement.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                MESSAGE
            ================================================== */}

            <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3.5 sm:px-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                  <AlignLeft size={15} />
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                    Message
                  </p>

                  <p className="text-xs font-bold text-zinc-800">
                    User-facing content
                  </p>
                </div>
              </div>

              <div className="px-4 py-4 sm:px-5 sm:py-5">
                <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-zinc-700">
                  {announcement.message || "No message provided."}
                </p>
              </div>
            </section>

            {/* =================================================
                CORE DETAILS
            ================================================== */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px w-4 bg-zinc-200" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                  Configuration
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={<Tag size={16} />}
                  label="Announcement Type"
                  value={type}
                  badge
                  badgeClass={style.badge}
                />

                <DetailItem
                  icon={<Power size={16} />}
                  label="Status"
                  value={announcement.isActive ? "Active" : "Inactive"}
                  badge
                  badgeClass={
                    announcement.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-zinc-100 text-zinc-600"
                  }
                />

                <DetailItem
                  icon={<Calendar size={16} />}
                  label="Start Date"
                  value={formatDate(announcement.startDate)}
                />

                <DetailItem
                  icon={<Clock size={16} />}
                  label="End Date"
                  value={formatDate(announcement.endDate)}
                />
              </div>
            </section>

            {/* =================================================
                ACTION
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      actionEnabled
                        ? "bg-violet-50 text-violet-600"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    <Link size={15} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                      Optional Action
                    </p>

                    <p className="truncate text-xs font-bold text-zinc-800">
                      Action Button Configuration
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                    actionEnabled
                      ? "border-violet-200 bg-violet-50 text-violet-700"
                      : "border-zinc-200 bg-zinc-100 text-zinc-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      actionEnabled ? "bg-violet-500" : "bg-zinc-400"
                    }`}
                  />

                  {actionEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={<Power size={16} />}
                    label="Enabled"
                    value={actionEnabled ? "true" : "false"}
                    compact
                  />

                  <DetailItem
                    icon={<Pencil size={16} />}
                    label="Button Label"
                    value={announcement.action?.label || "—"}
                    compact
                  />

                  <div className="sm:col-span-2">
                    <DetailItem
                      icon={<Link size={16} />}
                      label="App Route"
                      value={announcement.action?.route || "—"}
                      mono
                      compact
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SYSTEM DATA
            ================================================== */}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px w-4 bg-zinc-200" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
                  System Information
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <DetailItem
                  icon={<Hash size={16} />}
                  label="Announcement ID"
                  value={announcement._id}
                  mono
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={<Plus size={16} />}
                    label="Created At"
                    value={formatDate(announcement.createdAt)}
                  />

                  <DetailItem
                    icon={<History size={16} />}
                    label="Last Updated"
                    value={formatDate(announcement.updatedAt)}
                  />
                </div>
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
              Showing complete announcement configuration.
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
