"use client";

import {
  X,
  TrendingUp,
  IndianRupee,
  Calendar,
  Clock,
  User,
  Hash,
  AlignLeft,
  Briefcase,
} from "lucide-react";

type Income = {
  _id: string;
  user?: string;
  source?: string;
  amount?: number;
  date?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ViewIncomeModalProps = {
  income: Income | null;
  onClose: () => void;
};

const formatCurrency = (amount?: number) => {
  if (typeof amount !== "number") {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
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

export default function ViewIncomeModal({
  income,
  onClose,
}: ViewIncomeModalProps) {
  if (!income) {
    return null;
  }

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-700" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/60 shadow-sm">
              <TrendingUp size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                Income Details
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Complete income record and transaction log
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
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800/70">
                  Income Source
                </span>
                <h3 className="text-lg font-bold text-zinc-900">
                  {income.source || "—"}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800/70">
                  Received Amount
                </span>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(income.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            <DetailItem
              icon={<Briefcase size={16} className="text-zinc-500" />}
              label="Source Category"
              value={income.source || "—"}
            />

            <DetailItem
              icon={<IndianRupee size={16} className="text-zinc-500" />}
              label="Amount Credited"
              value={formatCurrency(income.amount)}
            />

            <DetailItem
              icon={<Calendar size={16} className="text-zinc-500" />}
              label="Transaction Date"
              value={formatDate(income.date)}
            />

            <DetailItem
              icon={<User size={16} className="text-zinc-500" />}
              label="User ID"
              value={income.user || "—"}
              mono
            />

            <DetailItem
              icon={<Hash size={16} className="text-zinc-500" />}
              label="Income Record ID"
              value={income._id}
              mono
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <DetailItem
                icon={<Calendar size={16} className="text-zinc-500" />}
                label="Created At"
                value={formatDate(income.createdAt)}
              />

              <DetailItem
                icon={<Clock size={16} className="text-zinc-500" />}
                label="Last Updated"
                value={formatDate(income.updatedAt)}
              />
            </div>
          </div>

          {/* Note Section */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <AlignLeft size={14} className="text-zinc-500" />
              <span>Notes & Description</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap">
              {income.note?.trim() ||
                "No notes attached to this income record."}
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
