"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewBudgetModal from "@/components/admin/ViewBudgetModal";
import EditBudgetModal from "@/components/admin/EditBudgetModal";
import DeleteBudgetModal from "@/components/admin/DeleteBudgetModal";

type Budget = {
  _id: string;
  userId?: string;
  category?: string;
  limit?: number;
  month?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BudgetsResponse = {
  success: boolean;
  data: Budget[];
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

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Modal State
  |--------------------------------------------------------------------------
  */

  const [viewBudget, setViewBudget] = useState<Budget | null>(null);

  const [editBudget, setEditBudget] = useState<Budget | null>(null);

  const [deleteBudget, setDeleteBudget] = useState<Budget | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Load Budgets
  |--------------------------------------------------------------------------
  */

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const response: BudgetsResponse = await adminApi(
        `/admin/budgets?page=${page}&limit=20`,
      );

      setBudgets(response.data || []);

      setTotal(response.pagination?.total || 0);

      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load budgets.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [page]);

  /*
  |--------------------------------------------------------------------------
  | View Budget
  |--------------------------------------------------------------------------
  */

  const handleView = async (budget: Budget) => {
    try {
      setError("");

      const response = await adminApi(`/admin/budgets/${budget._id}`);

      setViewBudget(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load budget details.",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredBudgets = budgets.filter((budget) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      budget.category?.toLowerCase().includes(query) ||
      budget.month?.toLowerCase().includes(query) ||
      budget.userId?.toLowerCase().includes(query) ||
      budget._id.toLowerCase().includes(query)
    );
  });

  /*
  |--------------------------------------------------------------------------
  | Table Columns
  |--------------------------------------------------------------------------
  */

  const columns: DataColumn<Budget>[] = [
    {
      key: "category",
      label: "Category",

      render: (budget) => (
        <span className="font-medium text-zinc-900">
          {budget.category || "—"}
        </span>
      ),
    },

    {
      key: "limit",
      label: "Limit",

      render: (budget) => (
        <span className="font-medium text-zinc-900">
          {formatCurrency(budget.limit)}
        </span>
      ),
    },

    {
      key: "month",
      label: "Month",

      render: (budget) => (
        <span className="text-zinc-700">{budget.month || "—"}</span>
      ),
    },

    {
      key: "userId",
      label: "User",

      render: (budget) =>
        budget.userId ? (
          <span
            title={budget.userId}
            className="font-mono text-xs text-zinc-400"
          >
            ...{budget.userId.slice(-8)}
          </span>
        ) : (
          "—"
        ),
    },

    {
      key: "createdAt",
      label: "Created",

      render: (budget) => formatDate(budget.createdAt),
    },

    {
      key: "actions",
      label: "Actions",

      render: (budget) => (
        <div className="flex items-center gap-1">
          {/* View */}
          <button
            type="button"
            onClick={() => handleView(budget)}
            title="View budget"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={() => setEditBudget(budget)}
            title="Edit budget"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setDeleteBudget(budget)}
            title="Delete budget"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <CollectionPage
        title="Budgets"
        description="View and manage budgets created by FinTrack users."
        columns={columns}
        data={filteredBudgets}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadBudgets}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      {/* ================================================================ */}
      {/* View Budget Modal */}
      {/* ================================================================ */}

      <ViewBudgetModal
        budget={viewBudget}
        onClose={() => setViewBudget(null)}
      />

      {/* ================================================================ */}
      {/* Edit Budget Modal */}
      {/* ================================================================ */}

      <EditBudgetModal
        budget={editBudget}
        onClose={() => setEditBudget(null)}
        onSaved={loadBudgets}
      />

      {/* ================================================================ */}
      {/* Delete Budget Modal */}
      {/* ================================================================ */}

      <DeleteBudgetModal
        budget={deleteBudget}
        onClose={() => setDeleteBudget(null)}
        onDeleted={loadBudgets}
      />
    </>
  );
}
