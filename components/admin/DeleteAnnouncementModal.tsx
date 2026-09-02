"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Loader2,
  X,
  Trash2,
  Megaphone,
  ShieldAlert,
  Info,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Announcement = {
  _id: string;
  title: string;
  message?: string;
  type?: string;
};

type DeleteAnnouncementModalProps = {
  announcement: Announcement | null;
  onClose: () => void;
  onDeleted: () => void;
};

const typeStyles: Record<
  string,
  {
    badge: string;
    dot: string;
  }
> = {
  info: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  success: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  warning: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  feature: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
};

export default function DeleteAnnouncementModal({
  announcement,
  onClose,
  onDeleted,
}: DeleteAnnouncementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!announcement) {
    return null;
  }

  const announcementType = announcement.type || "info";

  const typeStyle = typeStyles[announcementType] || typeStyles.info;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      await adminApi(`/admin/announcements/${announcement._id}`, {
        method: "DELETE",
      });

      onDeleted();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete announcement.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-announcement-title"
    >
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] animate-in zoom-in-95 duration-200">
        {/* =====================================================
            TOP DANGER ACCENT
        ====================================================== */}

        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="px-6 pb-5 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3.5">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 shadow-sm">
                <AlertTriangle size={22} strokeWidth={2.2} />

                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white">
                  <Trash2 size={10} strokeWidth={2.5} />
                </span>
              </div>

              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-500">
                  Destructive Action
                </p>

                <h2
                  id="delete-announcement-title"
                  className="mt-1 text-xl font-extrabold tracking-tight text-zinc-950"
                >
                  Delete Announcement?
                </h2>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              aria-label="Close delete announcement dialog"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-4 max-w-[390px] text-sm font-medium leading-6 text-zinc-500">
            This will permanently remove the announcement from FinTrack. Once
            deleted, it cannot be recovered.
          </p>

          {/* ===================================================
              ANNOUNCEMENT PREVIEW
          ==================================================== */}

          <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/60">
            {/* Preview Header */}

            <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 bg-white px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <Megaphone size={15} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                    Announcement
                  </p>

                  <p className="truncate text-xs font-bold text-zinc-800">
                    Selected item
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold capitalize ${typeStyle.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${typeStyle.dot}`} />

                {announcementType}
              </span>
            </div>

            {/* Preview Content */}

            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Title
              </p>

              <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-5 text-zinc-950">
                {announcement.title || "Untitled Announcement"}
              </p>

              {announcement.message && (
                <>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Message
                  </p>

                  <p className="mt-1.5 line-clamp-3 text-xs font-medium leading-5 text-zinc-500">
                    {announcement.message}
                  </p>
                </>
              )}

              {/* ID */}

              <div className="mt-4 flex items-center gap-2 border-t border-zinc-200/80 pt-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  ID
                </span>

                <span className="min-w-0 truncate rounded-md bg-white px-2 py-1 font-mono text-[9px] font-medium text-zinc-400 ring-1 ring-inset ring-zinc-200">
                  {announcement._id}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================
              ERROR
          ==================================================== */}

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                <ShieldAlert size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-red-800">
                  Delete failed
                </p>

                <p className="mt-0.5 text-[11px] font-medium leading-5 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* ===================================================
              WARNING
          ==================================================== */}

          {!error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-3.5 py-3">
              <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />

              <p className="text-[11px] font-semibold leading-5 text-amber-800">
                This action permanently deletes the announcement and removes it
                from future announcement results.
              </p>
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 sm:px-7">
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-red-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />

                  <span>Deleting Announcement...</span>
                </>
              ) : (
                <>
                  <Trash2 size={15} />

                  <span>Delete Announcement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
