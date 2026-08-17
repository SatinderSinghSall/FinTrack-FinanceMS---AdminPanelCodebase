"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import { adminApi } from "@/lib/api";

type User = {
  _id: string;
  name?: string;
  email?: string;
};

type EditUserModalProps = {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditUserModal({
  user,
  onClose,
  onSaved,
}: EditUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setEmail(user.email || "");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password && password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const payload: {
        name: string;
        email: string;
        password?: string;
      } = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };

      if (password) {
        payload.password = password;
      }

      await adminApi(`/admin/users/${user._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      onSaved();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to update user.",
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
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Edit User</h2>

            <p className="mt-0.5 text-xs text-zinc-400">
              Update user information
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

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-zinc-600">Name</label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={loading}
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-zinc-600">Email</label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
            </div>

            {/* Password */}
            <div className="border-t border-zinc-100 pt-5">
              <label className="text-xs font-medium text-zinc-600">
                New Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                placeholder="Leave blank to keep current password"
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />

              <p className="mt-1.5 text-xs text-zinc-400">
                Minimum 6 characters.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-medium text-zinc-600">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={loading}
                placeholder="Confirm new password"
                className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50"
              />
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
