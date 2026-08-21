"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  X,
  Shield,
  User as UserIcon,
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { adminApi } from "@/lib/api";

type Admin = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
};

type EditAdminModalProps = {
  admin: Admin | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditAdminModal({
  admin,
  onClose,
  onSaved,
}: EditAdminModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!admin) return;

    setName(admin.name || "");
    setEmail(admin.email || "");
    setRole(admin.role || "Admin");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [admin]);

  if (!admin) return null;

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
        role: string;
        password?: string;
      } = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim(),
      };

      if (password) {
        payload.password = password;
      }

      await adminApi(`/admin/admins/${admin._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-900" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md shadow-zinc-900/10">
              <Shield size={22} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                Edit Admin Account
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Update administrator credentials and access role
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
          {/* Form Scroll Body */}
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 p-4 text-xs font-medium text-red-700 shadow-sm">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Admin ID Badge */}
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200/60 bg-zinc-50/60 p-3.5 px-4 text-xs">
              <span className="font-semibold uppercase tracking-wider text-zinc-400 text-[11px]">
                Target Admin ID
              </span>
              <span className="font-mono text-xs font-medium text-zinc-700">
                {admin._id}
              </span>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Full Name
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder="Enter full name"
                  className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white pl-10 pr-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="admin@example.com"
                  className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white pl-10 pr-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>
            </div>

            {/* Role Input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Admin Role
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Shield size={16} />
                </div>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. SuperAdmin, Admin"
                  className="h-11 w-full rounded-2xl border border-zinc-200/80 bg-white pl-10 pr-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>
            </div>

            {/* Security Section Divider */}
            <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/30 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-zinc-500" />
                <span className="text-xs font-semibold tracking-wide text-zinc-700">
                  Password Reset (Optional)
                </span>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  New Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Leave blank to retain current password"
                    className="h-10 w-full rounded-xl border border-zinc-200/80 bg-white pl-10 pr-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Re-enter new password"
                    className="h-10 w-full rounded-xl border border-zinc-200/80 bg-white pl-10 pr-4 text-xs font-medium text-zinc-900 shadow-sm outline-none transition duration-200 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 disabled:bg-zinc-50 disabled:text-zinc-400"
                  />
                </div>
              </div>

              <p className="text-[11px] font-medium text-zinc-400">
                * Must be at least 6 characters if you choose to update it.
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
