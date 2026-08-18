"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewIncomeModal from "@/components/admin/ViewIncomeModal";
import EditIncomeModal from "@/components/admin/EditIncomeModal";
import DeleteIncomeModal from "@/components/admin/DeleteIncomeModal";

type Income = {
  _id: string;
  user?: string;
  source?: string;
  amount?: number;
  date?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

type IncomesResponse = {
  success: boolean;
  data: Income[];
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

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [viewIncome, setViewIncome] = useState<Income | null>(null);

  const [editIncome, setEditIncome] = useState<Income | null>(null);

  const [deleteIncome, setDeleteIncome] = useState<Income | null>(null);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      setError("");

      const response: IncomesResponse = await adminApi(
        `/admin/incomes?page=${page}&limit=20`,
      );

      setIncomes(response.data || []);

      setTotal(response.pagination?.total || 0);

      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load income records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, [page]);

  // Prevent background scrolling when any modal is open
  const isModalOpen = Boolean(viewIncome || editIncome || deleteIncome);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const handleView = async (income: Income) => {
    try {
      setError("");

      const response = await adminApi(`/admin/incomes/${income._id}`);

      setViewIncome(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load income details.",
      );
    }
  };

  const filteredIncomes = incomes.filter((income) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      income.source?.toLowerCase().includes(query) ||
      income.note?.toLowerCase().includes(query) ||
      income.user?.toLowerCase().includes(query) ||
      income._id.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<Income>[] = [
    {
      key: "source",
      label: "Source",

      render: (income) => (
        <span className="font-medium text-zinc-900">
          {income.source || "Unknown source"}
        </span>
      ),
    },

    {
      key: "amount",
      label: "Amount",

      render: (income) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(income.amount)}
        </span>
      ),
    },

    {
      key: "date",
      label: "Date",

      render: (income) => (
        <span className="text-zinc-600">{formatDate(income.date)}</span>
      ),
    },

    {
      key: "user",
      label: "User",

      render: (income) =>
        income.user ? (
          <span title={income.user} className="font-mono text-xs text-zinc-400">
            ...{income.user.slice(-8)}
          </span>
        ) : (
          "—"
        ),
    },

    {
      key: "note",
      label: "Note",

      render: (income) => (
        <span
          title={income.note || undefined}
          className="block max-w-[180px] truncate text-zinc-500"
        >
          {income.note?.trim() || "—"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (income) => (
        <div className="flex items-center gap-1">
          {/* View */}

          <button
            type="button"
            onClick={() => handleView(income)}
            title="View income"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>

          {/* Edit */}

          <button
            type="button"
            onClick={() => setEditIncome(income)}
            title="Edit income"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>

          {/* Delete */}

          <button
            type="button"
            onClick={() => setDeleteIncome(income)}
            title="Delete income"
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
        title="Income"
        description="View and manage income recorded by FinTrack users."
        columns={columns}
        data={filteredIncomes}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadIncomes}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      {/* View */}

      <ViewIncomeModal
        income={viewIncome}
        onClose={() => setViewIncome(null)}
      />

      {/* Edit */}

      <EditIncomeModal
        income={editIncome}
        onClose={() => setEditIncome(null)}
        onSaved={loadIncomes}
      />

      {/* Delete */}

      <DeleteIncomeModal
        income={deleteIncome}
        onClose={() => setDeleteIncome(null)}
        onDeleted={loadIncomes}
      />
    </>
  );
}
