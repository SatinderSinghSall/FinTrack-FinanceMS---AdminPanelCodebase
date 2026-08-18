"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { adminApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /* --------------------------------
      VALIDATION
  -------------------------------- */

  const emailError = useMemo(() => {
    const value = email.trim();

    if (!value) {
      return "Email address is required.";
    }

    if (value.length > 254) {
      return "Email address is too long.";
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!emailRegex.test(value)) {
      return "Enter a valid email address.";
    }

    return "";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) {
      return "Password is required.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    return "";
  }, [password]);

  const isFormValid =
    email.trim().length > 0 &&
    password.length > 0 &&
    !emailError &&
    !passwordError;

  /* --------------------------------
      FIELD STATES (Fixed boolean checks)
  -------------------------------- */

  const showEmailError = (submitted || email.length > 0) && !!emailError;

  const showPasswordError =
    (submitted || password.length > 0) && !!passwordError;

  const emailValid = email.trim().length > 0 && !emailError;

  const passwordValid = password.length > 0 && !passwordError;

  /* --------------------------------
      SUBMIT
  -------------------------------- */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    setSubmitted(true);
    setError("");

    if (!isFormValid) {
      setError("Please correct the highlighted fields before continuing.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminApi("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response?.token) {
        throw new Error(
          "Login succeeded but no authentication token was returned.",
        );
      }

      localStorage.setItem("fintrack_admin_token", response.token);

      if (response.admin) {
        localStorage.setItem("fintrack_admin", JSON.stringify(response.admin));
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen select-none overflow-hidden bg-[#f7f7f6]">
      {/* --------------------------------
          BACKGROUND PATTERN & GLOWS
      -------------------------------- */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-zinc-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-zinc-200/30 blur-3xl" />

      {/* --------------------------------
          CONTENT (Increased width from max-w-md to max-w-lg)
      -------------------------------- */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-lg">
          {/* Brand Header */}
          <div className="mb-7 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl shadow-zinc-950/15 ring-1 ring-white/10 transition-transform hover:scale-[1.02]">
              <span className="text-xl font-black tracking-tight">F</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                FinTrack Admin
              </h1>
            </div>

            <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-zinc-500">
              Securely access your administration dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-7 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)] sm:p-10">
            <div className="mb-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-800 shadow-inner">
                <ShieldCheck size={21} strokeWidth={2} />
              </div>

              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950">
                Welcome back
              </h2>

              <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-500">
                Sign in with your administrator credentials.
              </p>
            </div>

            {/* Global Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/80 p-4 animate-in fade-in duration-200"
              >
                <AlertCircle
                  size={19}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-red-500"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-red-900">
                    Unable to sign in
                  </p>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-zinc-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    strokeWidth={2}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      showEmailError
                        ? "text-red-400"
                        : emailValid
                          ? "text-emerald-500"
                          : "text-zinc-400"
                    }`}
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="admin@example.com"
                    disabled={loading}
                    aria-invalid={showEmailError}
                    aria-describedby={
                      showEmailError ? "email-error" : undefined
                    }
                    className={`h-12 w-full rounded-2xl border bg-zinc-50/50 pl-11 pr-11 text-sm font-medium text-zinc-950 outline-none transition-all placeholder:text-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${
                      showEmailError
                        ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : emailValid
                          ? "border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          : "border-zinc-200/90 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5"
                    }`}
                  />

                  {(showEmailError || emailValid) && (
                    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                      {showEmailError ? (
                        <AlertCircle size={18} className="text-red-500" />
                      ) : (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      )}
                    </div>
                  )}
                </div>

                {showEmailError && (
                  <p
                    id="email-error"
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600"
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}

                {!showEmailError && emailValid && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>Email address looks good.</span>
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-zinc-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    strokeWidth={2}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      showPasswordError
                        ? "text-red-400"
                        : passwordValid
                          ? "text-emerald-500"
                          : "text-zinc-400"
                    }`}
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    disabled={loading}
                    aria-invalid={showPasswordError}
                    aria-describedby={
                      showPasswordError ? "password-error" : undefined
                    }
                    className={`h-12 w-full rounded-2xl border bg-zinc-50/50 pl-11 pr-20 text-sm font-medium text-zinc-950 outline-none transition-all placeholder:text-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${
                      showPasswordError
                        ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : passwordValid
                          ? "border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          : "border-zinc-200/90 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5"
                    }`}
                  />

                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {passwordValid && (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    )}

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {showPasswordError && (
                  <p
                    id="password-error"
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600"
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}

                {!showPasswordError && passwordValid && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>Password meets minimum requirement.</span>
                  </p>
                )}

                {!password && !submitted && (
                  <p className="mt-2 text-xs font-medium text-zinc-400">
                    Minimum 6 characters.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 text-sm font-bold text-white shadow-lg shadow-zinc-950/15 transition-all hover:bg-zinc-800 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    <span>Signing in to portal...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5">
              <ShieldCheck
                size={17}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-zinc-500"
              />
              <p className="text-xs font-medium leading-relaxed text-zinc-500">
                This area is restricted to authorized FinTrack administrators.
                Keep your credentials secure.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs font-semibold text-zinc-400">
              © {new Date().getFullYear()} FinTrack Control Center
            </p>
            <p className="mt-1 text-[11px] font-medium text-zinc-400">
              Authorized Administration Portal
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
