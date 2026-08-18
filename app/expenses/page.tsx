"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewExpenseModal from "@/components/admin/ViewExpenseModal";
import EditExpenseModal from "@/components/admin/EditExpenseModal";
import DeleteExpenseModal from "@/components/admin/DeleteExpenseModal";

type Expense = {
  _id: string;
  userId?: string;
  title?: string;
  amount?: number;
  category?: string;
  notes?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ExpensesResponse = {
  success: boolean;
  data: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const formatCurrency = (amount?: number) => {
  if (typeof amount !== "number") {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [viewExpense, setViewExpense] = useState<Expense | null>(null);

  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response: ExpensesResponse = await adminApi(
        `/admin/expenses?page=${page}&limit=20`,
      );

      setExpenses(response.data || []);

      setTotal(response.pagination?.total || 0);

      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load expenses.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [page]);

  // Prevent background scrolling when any modal is open
  const isModalOpen = Boolean(viewExpense || editExpense || deleteExpense);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const handleView = async (expense: Expense) => {
    try {
      setError("");

      const response = await adminApi(`/admin/expenses/${expense._id}`);

      setViewExpense(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load expense details.",
      );
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      expense.title?.toLowerCase().includes(query) ||
      expense.category?.toLowerCase().includes(query) ||
      expense.notes?.toLowerCase().includes(query) ||
      expense.userId?.toLowerCase().includes(query) ||
      expense._id.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<Expense>[] = [
    {
      key: "title",
      label: "Title",

      render: (expense) => (
        <span className="font-medium text-zinc-900">
          {expense.title || "Untitled expense"}
        </span>
      ),
    },

    {
      key: "category",
      label: "Category",

      render: (expense) => (
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
          {expense.category?.trim() || "Uncategorized"}
        </span>
      ),
    },

    {
      key: "amount",
      label: "Amount",

      render: (expense) => (
        <span className="font-semibold text-zinc-900">
          {formatCurrency(expense.amount)}
        </span>
      ),
    },

    {
      key: "date",
      label: "Date",

      render: (expense) => (
        <span className="text-zinc-600">{formatDate(expense.date)}</span>
      ),
    },

    {
      key: "userId",
      label: "User",

      render: (expense) =>
        expense.userId ? (
          <span
            title={expense.userId}
            className="font-mono text-xs text-zinc-400"
          >
            ...{expense.userId.slice(-8)}
          </span>
        ) : (
          "—"
        ),
    },

    {
      key: "notes",
      label: "Notes",

      render: (expense) => (
        <span
          title={expense.notes || undefined}
          className="block max-w-[180px] truncate text-zinc-500"
        >
          {expense.notes?.trim() || "—"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (expense) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleView(expense)}
            title="View expense"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => setEditExpense(expense)}
            title="Edit expense"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => setDeleteExpense(expense)}
            title="Delete expense"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CollectionPage
        title="Expenses"
        description="View and manage expenses recorded by FinTrack users."
        columns={columns}
        data={filteredExpenses}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadExpenses}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      <ViewExpenseModal
        expense={viewExpense}
        onClose={() => setViewExpense(null)}
      />

      <EditExpenseModal
        expense={editExpense}
        onClose={() => setEditExpense(null)}
        onSaved={loadExpenses}
      />

      <DeleteExpenseModal
        expense={deleteExpense}
        onClose={() => setDeleteExpense(null)}
        onDeleted={loadExpenses}
      />
    </>
  );
}
