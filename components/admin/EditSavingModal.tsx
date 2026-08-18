"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  X,
  PiggyBank,
  Target,
  IndianRupee,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Saving = {
  _id: string;
  userId?: string;
  goal?: string;
  amount?: number;
};

type EditSavingModalProps = {
  saving: Saving | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditSavingModal({
  saving,
  onClose,
  onSaved,
}: EditSavingModalProps) {
  const [goal, setGoal] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!saving) {
      return;
    }

    setGoal(saving.goal || "");
    setAmount(typeof saving.amount === "number" ? String(saving.amount) : "");
    setError("");
  }, [saving]);

  if (!saving) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!goal.trim()) {
      setError("Goal is required.");
      return;
    }

    const numericAmount = Number(amount);

    if (amount === "" || Number.isNaN(numericAmount) || numericAmount < 0) {
      setError("Amount must be 0 or greater.");
      return;
    }

    try {
      setLoading(true);

      await adminApi(`/admin/savings/${saving._id}`, {
        method: "PUT",
        body: JSON.stringify({
          goal: goal.trim(),
          amount: numericAmount,
        }),
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/60 shadow-sm">
              <PiggyBank size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                Edit Saving Record
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Update saving goals and allocated amounts
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

        <form onSubmit={handleSubmit}>
          {/* Form Body */}
          <div className="space-y-5 p-6">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 p-4 text-xs font-medium text-red-700 shadow-sm">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Goal Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Saving Goal
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Target size={16} />
                </div>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Emergency Fund, Vacation"
                  className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white pl-10 pr-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Target Amount
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <IndianRupee size={16} />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  placeholder="0.00"
                  className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white pl-10 pr-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>
            </div>

            {/* Read-Only Owner Box */}
            <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4">
              <div className="flex items-center gap-2 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <User size={14} />
                <span>Saving Owner ID</span>
              </div>
              <p className="mt-1.5 break-all font-mono text-xs font-medium text-zinc-700">
                {saving.userId || "—"}
              </p>
              <p className="mt-1 text-[11px] font-medium text-zinc-400">
                The saving owner cannot be reassigned from the admin panel.
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
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
