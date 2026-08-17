"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

import { adminApi } from "@/lib/api";

type User = {
  _id: string;
  name?: string;
  email?: string;
};

type DeleteUserModalProps = {
  user: User | null;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteUserModal({
  user,
  onClose,
  onDeleted,
}: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  if (!user) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      await adminApi(`/admin/users/${user._id}`, {
        method: "DELETE",
      });

      onDeleted();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete user.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          if (!loading) {
            onClose();
          }
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="p-5 sm:p-6">
          {/* Icon + close */}
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle size={20} className="text-red-600" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100"
            >
              <X size={17} />
            </button>
          </div>

          <h2 className="mt-5 text-lg font-semibold text-zinc-900">
            Delete User?
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            You are about to permanently delete this user. This action cannot be
            undone.
          </p>

          {/* User */}
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-900">
              {user.name || "Unnamed user"}
            </p>

            <p className="mt-1 break-all text-xs text-zinc-500">
              {user.email || "No email"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
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

            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}
