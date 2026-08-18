"use client";

import {
  X,
  Receipt,
  IndianRupee,
  Calendar,
  Clock,
  User,
  Hash,
  AlignLeft,
  Tag,
  CreditCard,
} from "lucide-react";

type Expense = {
  _id: string;
  userId?: string;
  title?: string;
  amount?: number;
  category?: string;
  notes?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ViewExpenseModalProps = {
  expense: Expense | null;
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

export default function ViewExpenseModal({
  expense,
  onClose,
}: ViewExpenseModalProps) {
  if (!expense) return null;

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-700" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-200/60 shadow-sm">
              <Receipt size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                Expense Details
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Complete expense transaction record
              </p>
            </div>
          </div>

          {/* Top-Right X Icon Button - ONLY WAY TO CLOSE FROM HEADER */}
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
          <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-pink-50/40 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800/70">
                  Expense Title
                </span>
                <h3 className="text-lg font-bold text-zinc-900">
                  {expense.title || "—"}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800/70">
                  Debited Amount
                </span>
                <p className="text-2xl font-bold text-rose-600">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            </div>

            {expense.category && (
              <div className="mt-3.5 flex items-center gap-2 border-t border-rose-100/60 pt-3">
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/60 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 shadow-sm">
                  <Tag size={12} className="text-rose-500" />
                  {expense.category.trim()}
                </span>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            <DetailItem
              icon={<CreditCard size={16} className="text-zinc-500" />}
              label="Title / Particular"
              value={expense.title || "—"}
            />

            <DetailItem
              icon={<IndianRupee size={16} className="text-zinc-500" />}
              label="Amount Paid"
              value={formatCurrency(expense.amount)}
            />

            <DetailItem
              icon={<Tag size={16} className="text-zinc-500" />}
              label="Expense Category"
              value={expense.category?.trim() || "—"}
            />

            <DetailItem
              icon={<Calendar size={16} className="text-zinc-500" />}
              label="Expense Date"
              value={formatDate(expense.date)}
            />

            <DetailItem
              icon={<User size={16} className="text-zinc-500" />}
              label="User ID"
              value={expense.userId || "—"}
              mono
            />

            <DetailItem
              icon={<Hash size={16} className="text-zinc-500" />}
              label="Expense ID"
              value={expense._id}
              mono
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <DetailItem
                icon={<Calendar size={16} className="text-zinc-500" />}
                label="Created At"
                value={formatDate(expense.createdAt)}
              />

              <DetailItem
                icon={<Clock size={16} className="text-zinc-500" />}
                label="Last Updated"
                value={formatDate(expense.updatedAt)}
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <AlignLeft size={14} className="text-zinc-500" />
              <span>Notes & Remarks</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap">
              {expense.notes?.trim() ||
                "No additional notes attached to this expense record."}
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
