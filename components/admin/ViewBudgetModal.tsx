"use client";

import { X } from "lucide-react";

type Budget = {
  _id: string;
  userId?: string;
  category?: string;
  limit?: number;
  month?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ViewBudgetModalProps = {
  budget: Budget | null;
  onClose: () => void;
};

const formatCurrency = (amount?: number) => {
  if (typeof amount !== "number") {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
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

export default function ViewBudgetModal({
  budget,
  onClose,
}: ViewBudgetModalProps) {
  if (!budget) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Budget Details
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Complete budget information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">
          <div className="space-y-5">
            <Detail label="Category" value={budget.category || "—"} />

            <Detail label="Budget Limit" value={formatCurrency(budget.limit)} />

            <Detail label="Month" value={budget.month || "—"} />

            <Detail label="User ID" value={budget.userId || "—"} mono />

            <Detail label="Budget ID" value={budget._id} mono />

            <Detail label="Created" value={formatDate(budget.createdAt)} />

            <Detail label="Updated" value={formatDate(budget.updatedAt)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-zinc-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-400">{label}</p>

      <p
        className={`mt-1 break-words text-sm text-zinc-900 ${
          mono ? "font-mono text-xs" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
