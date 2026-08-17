"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

import { adminApi } from "@/lib/api";

type Saving = {
  _id: string;
  goal?: string;
  amount?: number;
};

type DeleteSavingModalProps = {
  saving: Saving | null;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteSavingModal({
  saving,
  onClose,
  onDeleted,
}: DeleteSavingModalProps) {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  if (!saving) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      await adminApi(`/admin/savings/${saving._id}`, {
        method: "DELETE",
      });

      onDeleted();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete saving.",
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
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle size={20} className="text-red-600" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
            >
              <X size={17} />
            </button>
          </div>

          <h2 className="mt-5 text-lg font-semibold text-zinc-900">
            Delete Saving?
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            You are about to permanently delete this saving record. This action
            cannot be undone.
          </p>

          <div className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div>
              <p className="text-xs text-zinc-400">Goal</p>

              <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                {saving.goal || "Unnamed goal"}
              </p>
            </div>

            <div>
              <p className="text-xs text-zinc-400">Amount</p>

              <p className="mt-0.5 text-sm font-semibold text-emerald-600">
                {typeof saving.amount === "number"
                  ? `₹${saving.amount.toLocaleString("en-IN")}`
                  : "—"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
              {error}
            </div>
          )}
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
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}

            {loading ? "Deleting..." : "Delete Saving"}
          </button>
        </div>
      </div>
    </div>
  );
}
