"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import { adminApi } from "@/lib/api";

type Income = {
  _id: string;
  user?: string;
  source?: string;
  amount?: number;
  date?: string;
  note?: string;
};

type EditIncomeModalProps = {
  income: Income | null;
  onClose: () => void;
  onSaved: () => void;
};

const toDateTimeLocal = (date?: string) => {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const offset = parsed.getTimezoneOffset();

  const localDate = new Date(parsed.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

export default function EditIncomeModal({
  income,
  onClose,
  onSaved,
}: EditIncomeModalProps) {
  const [source, setSource] = useState("");

  const [amount, setAmount] = useState("");

  const [date, setDate] = useState("");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!income) {
      return;
    }

    setSource(income.source || "");

    setAmount(typeof income.amount === "number" ? String(income.amount) : "");

    setDate(toDateTimeLocal(income.date));

    setNote(income.note || "");

    setError("");
  }, [income]);

  if (!income) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!source.trim()) {
      setError("Source is required.");
      return;
    }

    const numericAmount = Number(amount);

    if (amount === "" || Number.isNaN(numericAmount) || numericAmount < 0) {
      setError("Amount must be 0 or greater.");
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    try {
      setLoading(true);

      await adminApi(`/admin/incomes/${income._id}`, {
        method: "PUT",
        body: JSON.stringify({
          source: source.trim(),
          amount: numericAmount,
          date: new Date(date).toISOString(),
          note: note.trim(),
        }),
      });

      onSaved();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update income.",
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
              Edit Income
            </h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Update income information
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

            {/* Source */}

            <div>
              <label className="text-xs font-medium text-zinc-600">
                Source
              </label>

              <input
                type="text"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                disabled={loading}
                placeholder="e.g. Salary"
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            {/* Amount */}

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

            {/* Date */}

            <div>
              <label className="text-xs font-medium text-zinc-600">Date</label>

              <input
                type="datetime-local"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={loading}
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            {/* Note */}

            <div>
              <label className="text-xs font-medium text-zinc-600">Note</label>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={loading}
                rows={4}
                placeholder="Optional note..."
                className="mt-1.5 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            {/* User */}

            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-xs font-medium text-zinc-400">User ID</p>

              <p className="mt-1 break-all font-mono text-xs text-zinc-600">
                {income.user || "—"}
              </p>

              <p className="mt-1.5 text-xs text-zinc-400">
                The income owner cannot be changed from the admin panel.
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
