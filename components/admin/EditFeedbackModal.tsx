"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  X,
  MessageSquare,
  Tag,
  AlertCircle,
  CheckCircle2,
  User,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Feedback = {
  _id: string;
  user?:
    | {
        _id?: string;
        name?: string;
        email?: string;
      }
    | string;
  subject?: string;
  message?: string;
  category?: string;
  status?: "Pending" | "In Progress" | "Resolved";
  priority?: "Low" | "Medium" | "High";
};

type EditFeedbackModalProps = {
  feedback: Feedback | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditFeedbackModal({
  feedback,
  onClose,
  onSaved,
}: EditFeedbackModalProps) {
  const [status, setStatus] = useState<"Pending" | "In Progress" | "Resolved">(
    "Pending",
  );
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    setStatus(feedback.status || "Pending");
    setPriority(feedback.priority || "Medium");
    setError("");
    setShowConfirm(false);
  }, [feedback]);

  if (!feedback) {
    return null;
  }

  // Handle user info display safely
  const userName =
    typeof feedback.user === "object" && feedback.user !== null
      ? feedback.user.name || feedback.user.email || "Unknown User"
      : String(feedback.user || "—");

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Trigger confirmation view instead of saving right away
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setError("");

    try {
      setLoading(true);

      await adminApi(`/admin/feedbacks/${feedback._id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          priority,
        }),
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update feedback.",
      );
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-200/60 shadow-sm">
              <MessageSquare size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                Edit Feedback Status
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Update ticket status and priority level
              </p>
            </div>
          </div>

          {/* Top-Right Close Button */}
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

        {showConfirm ? (
          /* Confirmation State View */
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <HelpCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900">
                Confirm Status Update
              </h3>
              <p className="text-xs text-zinc-500">
                Are you sure you want to change this feedback's status to{" "}
                <span className="font-semibold text-zinc-800">{status}</span>{" "}
                and priority to{" "}
                <span className="font-semibold text-zinc-800">{priority}</span>?
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-zinc-200/85 bg-white px-5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-100 active:scale-95"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmSave}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-xs font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Yes, Update</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Standard Edit Form */
          <form onSubmit={handleFormSubmit}>
            {/* Form Scroll Body */}
            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 p-4 text-xs font-medium text-red-700 shadow-sm">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Read-Only Subject/Message Context Box */}
              <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Feedback Subject
                </span>
                <p className="text-xs font-bold text-zinc-900">
                  {feedback.subject || "No Subject"}
                </p>
                <p className="text-xs text-zinc-600 line-clamp-2">
                  {feedback.message || "No message provided."}
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as
                          | "Pending"
                          | "In Progress"
                          | "Resolved",
                      )
                    }
                    disabled={loading}
                    className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white px-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Priority
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "Low" | "Medium" | "High")
                    }
                    disabled={loading}
                    className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white px-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Read-Only Owner Box */}
              <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4">
                <div className="flex items-center gap-2 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                  <User size={14} />
                  <span>Submitted By User</span>
                </div>
                <p className="mt-1.5 font-medium text-xs text-zinc-800">
                  {userName}
                </p>
              </div>
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
                type="submit"
                disabled={loading}
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-800 hover:shadow-zinc-900/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
