"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Loader2,
  X,
  Trash2,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Feedback = {
  _id: string;
  subject?: string;
  message?: string;
  category?: string;
};

type DeleteFeedbackModalProps = {
  feedback: Feedback | null;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteFeedbackModal({
  feedback,
  onClose,
  onDeleted,
}: DeleteFeedbackModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!feedback) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      await adminApi(`/admin/feedbacks/${feedback._id}`, {
        method: "DELETE",
      });

      onDeleted();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete feedback.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop layer - Glassmorphic overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Top Danger Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />

        <div className="p-6">
          {/* Header Icon & Close Button */}
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200/60 shadow-sm">
              <AlertTriangle size={22} strokeWidth={2} />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-200/60 bg-zinc-50/50 text-zinc-400 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Close"
            >
              <X
                size={18}
                strokeWidth={2}
                className="transition-transform duration-200 group-hover:rotate-90"
              />
            </button>
          </div>

          {/* Title & Description */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              Delete Feedback Record?
            </h2>

            <p className="mt-1.5 text-xs font-medium leading-relaxed text-zinc-500">
              You are about to permanently delete this feedback submission. This
              action cannot be undone.
            </p>
          </div>

          {/* Feedback Details Target Box */}
          <div className="mt-5 space-y-3 rounded-2xl border border-red-100 bg-red-50/40 p-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold uppercase tracking-wider text-[11px]">
              <MessageSquare size={13} />
              <span>Feedback Target</span>
            </div>

            <div className="space-y-1 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Subject
              </p>
              <p className="text-sm font-semibold text-zinc-900 line-clamp-1">
                {feedback.subject || "No Subject"}
              </p>
            </div>

            <div className="pt-2 border-t border-red-100/60 flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium text-zinc-400">
                ID: {feedback._id}
              </span>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200/80 bg-red-50 p-4 text-xs font-medium text-red-700 shadow-sm">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-600" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-zinc-200/80 bg-white px-5 text-sm font-semibold text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all duration-200 hover:bg-red-700 hover:shadow-red-600/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Feedback</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
