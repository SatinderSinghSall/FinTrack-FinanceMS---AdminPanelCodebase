"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewSavingModal from "@/components/admin/ViewSavingModal";
import EditSavingModal from "@/components/admin/EditSavingModal";
import DeleteSavingModal from "@/components/admin/DeleteSavingModal";

type Saving = {
  _id: string;
  userId?: string;
  goal?: string;
  amount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type SavingsResponse = {
  success: boolean;
  data: Saving[];
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

export default function SavingsPage() {
  const [savings, setSavings] = useState<Saving[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [viewSaving, setViewSaving] = useState<Saving | null>(null);

  const [editSaving, setEditSaving] = useState<Saving | null>(null);

  const [deleteSaving, setDeleteSaving] = useState<Saving | null>(null);

  const loadSavings = async () => {
    try {
      setLoading(true);
      setError("");

      const response: SavingsResponse = await adminApi(
        `/admin/savings?page=${page}&limit=20`,
      );

      setSavings(response.data || []);

      setTotal(response.pagination?.total || 0);

      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load savings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavings();
  }, [page]);

  const handleView = async (saving: Saving) => {
    try {
      setError("");

      const response = await adminApi(`/admin/savings/${saving._id}`);

      setViewSaving(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load saving details.",
      );
    }
  };

  const filteredSavings = savings.filter((saving) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      saving.goal?.toLowerCase().includes(query) ||
      saving.userId?.toLowerCase().includes(query) ||
      saving._id.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<Saving>[] = [
    {
      key: "goal",
      label: "Goal",

      render: (saving) => (
        <span className="font-medium text-zinc-900">
          {saving.goal || "Unnamed goal"}
        </span>
      ),
    },

    {
      key: "amount",
      label: "Amount",

      render: (saving) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(saving.amount)}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created",

      render: (saving) => (
        <span className="text-zinc-600">{formatDate(saving.createdAt)}</span>
      ),
    },

    {
      key: "userId",
      label: "User",

      render: (saving) =>
        saving.userId ? (
          <span
            title={saving.userId}
            className="font-mono text-xs text-zinc-400"
          >
            ...{saving.userId.slice(-8)}
          </span>
        ) : (
          "—"
        ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (saving) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleView(saving)}
            title="View saving"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => setEditSaving(saving)}
            title="Edit saving"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => setDeleteSaving(saving)}
            title="Delete saving"
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
        title="Savings"
        description="View and manage savings goals created by FinTrack users."
        columns={columns}
        data={filteredSavings}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadSavings}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      <ViewSavingModal
        saving={viewSaving}
        onClose={() => setViewSaving(null)}
      />

      <EditSavingModal
        saving={editSaving}
        onClose={() => setEditSaving(null)}
        onSaved={loadSavings}
      />

      <DeleteSavingModal
        saving={deleteSaving}
        onClose={() => setDeleteSaving(null)}
        onDeleted={loadSavings}
      />
    </>
  );
}
