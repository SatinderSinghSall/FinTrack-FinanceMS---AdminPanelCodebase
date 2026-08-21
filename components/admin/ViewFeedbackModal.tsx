"use client";

import {
  X,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Hash,
  AlignLeft,
  Tag,
  AlertCircle,
  CheckCircle2,
  Star,
} from "lucide-react";

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
  rating?: number;
  status?: "Pending" | "In Progress" | "Resolved";
  priority?: "Low" | "Medium" | "High";
  createdAt?: string;
  updatedAt?: string;
};

type ViewFeedbackModalProps = {
  feedback: Feedback | null;
  onClose: () => void;
};

const formatDate = (date?: string) => {
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

export default function ViewFeedbackModal({
  feedback,
  onClose,
}: ViewFeedbackModalProps) {
  if (!feedback) {
    return null;
  }

  // Handle populated user object vs plain string ID
  const userName =
    typeof feedback.user === "object" && feedback.user !== null
      ? feedback.user.name || "Unknown Name"
      : "—";

  const userEmail =
    typeof feedback.user === "object" && feedback.user !== null
      ? feedback.user.email || "—"
      : String(feedback.user || "—");

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const priorityColors: Record<string, string> = {
    Low: "bg-zinc-100 text-zinc-700 border-zinc-200",
    Medium: "bg-orange-50 text-orange-700 border-orange-200",
    High: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-700" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-200/60 shadow-sm">
              <MessageSquare size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                Feedback Details
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                User submitted feedback and support ticket
              </p>
            </div>
          </div>

          {/* Top-Right X Icon Button */}
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

        {/* Body Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* Main Hero Card */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800/70">
                  Subject / Topic
                </span>
                <h3 className="text-lg font-bold text-zinc-900">
                  {feedback.subject || "No Subject"}
                </h3>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    statusColors[feedback.status || "Pending"]
                  }`}
                >
                  {feedback.status || "Pending"}
                </span>
                {feedback.priority && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${
                      priorityColors[feedback.priority]
                    }`}
                  >
                    {feedback.priority} Priority
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            <DetailItem
              icon={<Tag size={16} className="text-zinc-500" />}
              label="Category"
              value={feedback.category || "General"}
            />

            {feedback.rating !== undefined && feedback.rating !== null && (
              <DetailItem
                icon={<Star size={16} className="text-amber-500" />}
                label="Rating"
                value={`${feedback.rating} / 5 Stars`}
              />
            )}

            <DetailItem
              icon={<User size={16} className="text-zinc-500" />}
              label="Submitted By User"
              value={`${userName} (${userEmail})`}
            />

            <DetailItem
              icon={<Hash size={16} className="text-zinc-500" />}
              label="Feedback Record ID"
              value={feedback._id}
              mono
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <DetailItem
                icon={<Calendar size={16} className="text-zinc-500" />}
                label="Submitted At"
                value={formatDate(feedback.createdAt)}
              />

              <DetailItem
                icon={<Clock size={16} className="text-zinc-500" />}
                label="Last Updated"
                value={formatDate(feedback.updatedAt)}
              />
            </div>
          </div>

          {/* Message Section */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <AlignLeft size={14} className="text-zinc-500" />
              <span>Feedback Message</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap">
              {feedback.message?.trim() || "No message content provided."}
            </p>
          </div>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/60 bg-white p-3.5 shadow-sm transition-all hover:border-zinc-300/80">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        <p
          className={`mt-0.5 break-all text-xs text-zinc-900 ${
            mono ? "font-mono font-medium text-zinc-700" : "font-semibold"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
