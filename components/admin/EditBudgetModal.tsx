"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import { adminApi } from "@/lib/api";

type Budget = {
  _id: string;
  userId?: string;
  category?: string;
  limit?: number;
  month?: string;
};

type EditBudgetModalProps = {
  budget: Budget | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditBudgetModal({
  budget,
  onClose,
  onSaved,
}: EditBudgetModalProps) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!budget) return;

    setCategory(budget.category || "");
    setLimit(typeof budget.limit === "number" ? String(budget.limit) : "");
    setMonth(budget.month || "");
    setError("");
  }, [budget]);

  if (!budget) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    const numericLimit = Number(limit);

    if (limit === "" || Number.isNaN(numericLimit) || numericLimit < 0) {
      setError("Budget limit must be 0 or greater.");
      return;
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      setError("Month must use YYYY-MM format.");
      return;
    }

    try {
      setLoading(true);

      await adminApi(`/admin/budgets/${budget._id}`, {
        method: "PUT",
        body: JSON.stringify({
          category: category.trim(),
          limit: numericLimit,
          month,
        }),
      });

      onSaved();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update budget.",
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Edit Budget
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Update budget information
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
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-zinc-600">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={loading}
                placeholder="e.g. Food"
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            {/* Limit */}
            <div>
              <label className="text-xs font-medium text-zinc-600">
                Budget Limit
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                disabled={loading}
                placeholder="0"
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            {/* Month */}
            <div>
              <label className="text-xs font-medium text-zinc-600">Month</label>

              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                disabled={loading}
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />

              <p className="mt-1.5 text-xs text-zinc-400">Stored as YYYY-MM.</p>
            </div>

            {/* User */}
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-xs font-medium text-zinc-400">User ID</p>

              <p className="mt-1 break-all font-mono text-xs text-zinc-600">
                {budget.userId || "—"}
              </p>

              <p className="mt-1.5 text-xs text-zinc-400">
                The budget owner cannot be changed from the admin panel.
              </p>
            </div>
          </div>

          {/* Footer */}
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
