"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

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
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update saving.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Edit Saving
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Update saving information
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5 sm:p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-600">Goal</label>

              <input
                type="text"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                disabled={loading}
                placeholder="e.g. Emergency"
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600">
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={loading}
                placeholder="0"
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-xs font-medium text-zinc-400">User ID</p>

              <p className="mt-1 break-all font-mono text-xs text-zinc-600">
                {saving.userId || "—"}
              </p>

              <p className="mt-1.5 text-xs text-zinc-400">
                The saving owner cannot be changed from the admin panel.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="h-10 rounded-xl border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}

              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
