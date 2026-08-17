"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
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
     FIELD STATES
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f6]">
      {/* --------------------------------
          BACKGROUND PATTERN
      -------------------------------- */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Top glow */}

      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-zinc-300/20 blur-3xl" />

      {/* Bottom subtle glow */}

      <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-zinc-200/30 blur-3xl" />

      {/* --------------------------------
          CONTENT
      -------------------------------- */}

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          {/* --------------------------------
              BRAND
          -------------------------------- */}

          <div className="mb-7 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-zinc-900/10">
              <span className="text-lg font-semibold tracking-tight">F</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                FinTrack Admin
              </h1>
            </div>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Securely access your administration dashboard
            </p>
          </div>

          {/* --------------------------------
              LOGIN CARD
          -------------------------------- */}

          <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)] sm:p-7">
            {/* Card heading */}

            <div className="mb-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <ShieldCheck
                  size={19}
                  strokeWidth={1.8}
                  className="text-zinc-700"
                />
              </div>

              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                Welcome back
              </h2>

              <p className="mt-1 text-sm leading-5 text-zinc-500">
                Sign in with your administrator credentials.
              </p>
            </div>

            {/* --------------------------------
                MAIN ERROR
            -------------------------------- */}

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3"
              >
                <div className="mt-0.5 shrink-0">
                  <AlertCircle
                    size={18}
                    strokeWidth={2}
                    className="text-red-500"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-700">
                    Unable to sign in
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* --------------------------------
                FORM
            -------------------------------- */}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* --------------------------------
                  EMAIL
              -------------------------------- */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
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
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="admin@example.com"
                    disabled={loading}
                    aria-invalid={showEmailError}
                    aria-describedby={
                      showEmailError ? "email-error" : undefined
                    }
                    className={`h-11 w-full rounded-xl border bg-zinc-50 pl-10 pr-10 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
                      showEmailError
                        ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : emailValid
                          ? "border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
                          : "border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                    }`}
                  />

                  {/* Validation icon */}

                  {(showEmailError || emailValid) && (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      {showEmailError ? (
                        <AlertCircle size={17} className="text-red-500" />
                      ) : (
                        <CheckCircle2 size={17} className="text-emerald-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Inline validation */}

                {showEmailError && (
                  <p
                    id="email-error"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                  >
                    <AlertCircle size={13} />
                    {emailError}
                  </p>
                )}

                {!showEmailError && emailValid && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle2 size={13} />
                    Email address looks good.
                  </p>
                )}
              </div>

              {/* --------------------------------
                  PASSWORD
              -------------------------------- */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
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
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter your password"
                    disabled={loading}
                    aria-invalid={showPasswordError}
                    aria-describedby={
                      showPasswordError ? "password-error" : undefined
                    }
                    className={`h-11 w-full rounded-xl border bg-zinc-50 pl-10 pr-20 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
                      showPasswordError
                        ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : passwordValid
                          ? "border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50"
                          : "border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                    }`}
                  />

                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {/* Password validation */}

                    {passwordValid && (
                      <CheckCircle2 size={17} className="text-emerald-500" />
                    )}

                    {/* Show / hide */}

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Inline validation */}

                {showPasswordError && (
                  <p
                    id="password-error"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                  >
                    <AlertCircle size={13} />
                    {passwordError}
                  </p>
                )}

                {!showPasswordError && passwordValid && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle2 size={13} />
                    Password meets the minimum requirement.
                  </p>
                )}

                {!password && !submitted && (
                  <p className="mt-1.5 text-xs text-zinc-400">
                    Minimum 6 characters.
                  </p>
                )}
              </div>

              {/* --------------------------------
                  SUBMIT
              -------------------------------- */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* --------------------------------
                SECURITY NOTE
            -------------------------------- */}

            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50 px-3.5 py-3">
              <ShieldCheck
                size={15}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-zinc-500"
              />

              <p className="text-[11px] leading-4 text-zinc-500">
                This area is restricted to authorized FinTrack administrators.
                Keep your credentials secure.
              </p>
            </div>
          </div>

          {/* --------------------------------
              FOOTER
          -------------------------------- */}

          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-400">
              © {new Date().getFullYear()} FinTrack
            </p>

            <p className="mt-1 text-[10px] text-zinc-300">
              Administration Portal
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
