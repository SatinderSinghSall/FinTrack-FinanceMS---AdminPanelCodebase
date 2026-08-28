"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowUpRight,
  CreditCard,
  MessageSquare,
  PiggyBank,
  Receipt,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  Smartphone,
} from "lucide-react";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import AdminShell from "@/components/AdminShell";
import { adminApi } from "@/lib/api";

type DashboardData = {
  overview: {
    admins: number;
    users: number;
    budgets: number;
    expenses: number;
    incomes: number;
    savings: number;
    subscriptions: number;
    feedbacks: number;
    appConfigs: number;
  };

  financial: {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    balance: number;
  };

  expenseByCategory: {
    category: string;
    amount: number;
    count: number;
  }[];

  recentExpenses: Expense[];

  recentIncome: Income[];
};

type Expense = {
  _id: string;
  userId?: string;
  title?: string;
  amount?: number;
  category?: string;
  notes?: string;
  date?: string;
};

type Income = {
  _id: string;
  user?: string;
  source?: string;
  amount?: number;
  date?: string;
  note?: string;
};

type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};

const initialData: DashboardData = {
  overview: {
    admins: 0,
    users: 0,
    budgets: 0,
    expenses: 0,
    incomes: 0,
    savings: 0,
    subscriptions: 0,
    feedbacks: 0,
    appConfigs: 0,
  },

  financial: {
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    balance: 0,
  },

  expenseByCategory: [],

  recentExpenses: [],

  recentIncome: [],
};

const categoryChartData = (categories: DashboardData["expenseByCategory"]) => {
  const grouped = new Map<
    string,
    {
      category: string;
      amount: number;
      count: number;
    }
  >();

  categories.forEach((item) => {
    const category = item.category?.trim() || "Other";

    const existing = grouped.get(category);

    if (existing) {
      existing.amount += item.amount;
      existing.count += item.count;
    } else {
      grouped.set(category, {
        category,
        amount: item.amount,
        count: item.count,
      });
    }
  });

  return Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);
};

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatDate = (date?: string) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statCards = [
  {
    key: "admins",
    label: "Admins",
    icon: Shield,
    href: "/admins",
  },
  {
    key: "appConfigs",
    label: "App Configuration",
    icon: Smartphone,
    href: "/appconfigs",
  },
  {
    key: "users",
    label: "Users",
    icon: Users,
    href: "/users",
  },
  {
    key: "incomes",
    label: "Income Records",
    icon: TrendingUp,
    href: "/incomes",
  },
  {
    key: "expenses",
    label: "Expenses",
    icon: Receipt,
    href: "/expenses",
  },
  {
    key: "savings",
    label: "Savings",
    icon: PiggyBank,
    href: "/savings",
  },
  {
    key: "budgets",
    label: "Budgets",
    icon: WalletCards,
    href: "/budgets",
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    href: "/subscriptions",
  },
  {
    key: "feedbacks",
    label: "Feedbacks",
    icon: MessageSquare,
    href: "/feedbacks",
  },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(initialData);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response: DashboardResponse = await adminApi("/admin/dashboard");

      setData(response.data || initialData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const categories = categoryChartData(data.expenseByCategory);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Overview</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Monitor your FinTrack platform, users, and financial activity.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Overview */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const value = data.overview[stat.key];

              return (
                <Link
                  key={stat.key}
                  href={stat.href}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-6"
                >
                  {/* Top row: Icon & Interactive Arrow */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100/80 text-zinc-800 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-white group-hover:scale-105">
                      <Icon size={20} />
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-all duration-300 group-hover:bg-zinc-100 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>

                  {/* Bottom section: Label and Value */}
                  <div className="mt-6">
                    <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                      {loading ? "—" : value.toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Financial summary */}
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              Financial Overview
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Aggregated values across all users.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Income */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Total Income
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                    {loading ? "—" : formatCurrency(data.financial.totalIncome)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <TrendingUp size={18} className="text-emerald-600" />
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-400">
                Across all income records
              </p>
            </div>

            {/* Expenses */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Total Expenses
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
                    {loading
                      ? "—"
                      : formatCurrency(data.financial.totalExpenses)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <TrendingDown size={18} className="text-red-600" />
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-400">
                Across all expense records
              </p>
            </div>

            {/* Balance */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-900 p-5 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    Net Balance
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {loading ? "—" : formatCurrency(data.financial.balance)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <WalletCards size={18} className="text-white" />
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-400">
                Total income minus expenses
              </p>
            </div>
          </div>
        </section>

        {/* Charts + recent activity */}
        <section className="grid gap-6 xl:grid-cols-5">
          {/* Expense chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-zinc-900">
                Expenses by Category
              </h2>

              <p className="mt-1 text-xs text-zinc-400">
                Where users are spending money.
              </p>
            </div>

            {categories.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {categories.map((_, index) => (
                        <Cell key={index} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-zinc-50">
                <p className="text-sm text-zinc-400">
                  No expense data available.
                </p>
              </div>
            )}

            {/* Category list */}
            {categories.length > 0 && (
              <div className="mt-4 space-y-2">
                {categories.slice(0, 5).map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-zinc-400" />

                      <span className="truncate text-xs text-zinc-600">
                        {item.category}
                      </span>
                    </div>

                    <span className="shrink-0 text-xs font-semibold text-zinc-800">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent expenses */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  Recent Expenses
                </h2>

                <p className="mt-1 text-xs text-zinc-400">
                  Latest expense activity.
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {data.recentExpenses.length > 0 ? (
                data.recentExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                        <Receipt size={16} className="text-zinc-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {expense.title || "Untitled"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {expense.category?.trim() || "Other"} ·{" "}
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-zinc-900">
                      {formatCurrency(expense.amount || 0)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-10 text-center text-sm text-zinc-400">
                  No recent expenses.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Recent income */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              Recent Income
            </h2>

            <p className="mt-1 text-xs text-zinc-400">
              Latest income activity.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {data.recentIncome.length > 0 ? (
              data.recentIncome.map((income) => (
                <div
                  key={income._id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <TrendingUp size={16} className="text-emerald-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {income.source || "Income"}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-400">
                        {formatDate(income.date)}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-emerald-600">
                    +{formatCurrency(income.amount || 0)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-zinc-400 md:col-span-2">
                No recent income.
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
