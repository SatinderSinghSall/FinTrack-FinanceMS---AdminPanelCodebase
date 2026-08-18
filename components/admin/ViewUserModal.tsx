"use client";

import {
  X,
  ShieldCheck,
  Calendar,
  User as UserIcon,
  Mail,
  Hash,
  Clock,
} from "lucide-react";

type User = {
  _id: string;
  name?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ViewUserModalProps = {
  user: User | null;
  onClose: () => void;
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

export default function ViewUserModal({ user, onClose }: ViewUserModalProps) {
  if (!user) return null;

  return (
    /* Backdrop layer - Backdrop clicks do NOT trigger onClose */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Subtle Decorative Gradient Header Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-900" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md shadow-zinc-900/10">
              <UserIcon size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                User Details
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Complete system record for user account
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

        {/* Content Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* User Primary Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50/80 via-white to-zinc-50/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Full Name
                </span>
                <p className="text-base font-semibold text-zinc-900">
                  {user.name || "—"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4">
            <DetailItem
              icon={<Mail size={16} className="text-zinc-500" />}
              label="Email Address"
              value={user.email || "—"}
            />

            <DetailItem
              icon={<Hash size={16} className="text-zinc-500" />}
              label="System User ID"
              value={user._id}
              mono
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem
                icon={<Calendar size={16} className="text-zinc-500" />}
                label="Registered On"
                value={formatDate(user.createdAt)}
              />

              <DetailItem
                icon={<Clock size={16} className="text-zinc-500" />}
                label="Last Updated"
                value={formatDate(user.updatedAt)}
              />
            </div>
          </div>

          {/* Password Security Box */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/50 via-amber-50/30 to-transparent p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-zinc-800">
                    Password Data
                  </p>
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                    Encrypted
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Password credentials are hashed and securely isolated. Raw
                  values are not exposed through the dashboard interface.
                </p>
              </div>
            </div>
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
