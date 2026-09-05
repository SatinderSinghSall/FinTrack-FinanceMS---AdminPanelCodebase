"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewFinancialTipModal from "@/components/admin/ViewFinancialTipModal";
import EditFinancialTipModal from "@/components/admin/EditFinancialTipModal";
import DeleteFinancialTipModal from "@/components/admin/DeleteFinancialTipModal";

type FinancialTipCategory =
  | "budgeting"
  | "saving"
  | "expenses"
  | "debt"
  | "investing"
  | "financial-safety"
  | "money-habits"
  | "goals";

type FinancialTipType = "tip" | "guide" | "lesson" | "warning";

type FinancialTip = {
  _id: string;
  title: string;
  shortDescription: string;
  content: string;
  category?: FinancialTipCategory;
  type?: FinancialTipType;
  isActive?: boolean;
  featured?: boolean;
  startDate?: string;
  endDate?: string | null;
  action?: {
    enabled?: boolean;
    label?: string;
    route?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type FinancialTipsResponse = {
  success: boolean;
  data: FinancialTip[];
};

const formatDate = (date?: string | null) => {
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

const categoryStyles: Record<FinancialTipCategory, string> = {
  budgeting: "bg-blue-50 text-blue-700 border-blue-200",
  saving: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expenses: "bg-amber-50 text-amber-700 border-amber-200",
  debt: "bg-red-50 text-red-700 border-red-200",
  investing: "bg-violet-50 text-violet-700 border-violet-200",
  "financial-safety": "bg-orange-50 text-orange-700 border-orange-200",
  "money-habits": "bg-cyan-50 text-cyan-700 border-cyan-200",
  goals: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const typeStyles: Record<FinancialTipType, string> = {
  tip: "bg-blue-50 text-blue-700 border-blue-200",
  guide: "bg-violet-50 text-violet-700 border-violet-200",
  lesson: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function FinancialTipsPage() {
  const [financialTips, setFinancialTips] = useState<FinancialTip[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewFinancialTip, setViewFinancialTip] = useState<FinancialTip | null>(
    null,
  );

  const [editFinancialTip, setEditFinancialTip] = useState<FinancialTip | null>(
    null,
  );

  const [deleteFinancialTip, setDeleteFinancialTip] =
    useState<FinancialTip | null>(null);

  const loadFinancialTips = async () => {
    try {
      setLoading(true);
      setError("");

      const response: FinancialTipsResponse = await adminApi(
        "/admin/financial-tips",
      );

      setFinancialTips(response.data || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load financial tips.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialTips();
  }, []);

  // Prevent background scrolling when any modal is open
  const isModalOpen = Boolean(
    viewFinancialTip || editFinancialTip || deleteFinancialTip,
  );

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // View financial tip
  const handleView = async (financialTip: FinancialTip) => {
    try {
      setError("");

      const response = await adminApi(
        `/admin/financial-tips/${financialTip._id}`,
      );

      setViewFinancialTip(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load financial tip details.",
      );
    }
  };

  const filteredFinancialTips = financialTips.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      item.title?.toLowerCase().includes(query) ||
      item.shortDescription?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item._id.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<FinancialTip>[] = [
    {
      key: "title",
      label: "Title",
      render: (item) => (
        <div className="min-w-0">
          <p className="line-clamp-1 font-medium text-zinc-900">
            {item.title || "Untitled"}
          </p>

          <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-zinc-400">
            {item.shortDescription || "No description"}
          </p>
        </div>
      ),
    },

    {
      key: "category",
      label: "Category",
      render: (item) => {
        const category = item.category || "money-habits";

        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
              categoryStyles[category]
            }`}
          >
            {category.replace("-", " ")}
          </span>
        );
      },
    },

    {
      key: "type",
      label: "Type",
      render: (item) => {
        const type = item.type || "tip";

        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
              typeStyles[type]
            }`}
          >
            {type}
          </span>
        );
      },
    },

    {
      key: "featured",
      label: "Featured",
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            item.featured
              ? "border-violet-200 bg-violet-50 text-violet-700"
              : "border-zinc-200 bg-zinc-100 text-zinc-600"
          }`}
        >
          {item.featured ? "Featured" : "Standard"}
        </span>
      ),
    },

    {
      key: "isActive",
      label: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            item.isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-zinc-100 text-zinc-600"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      key: "startDate",
      label: "Start Date",
      render: (item) => (
        <span className="text-zinc-600">{formatDate(item.startDate)}</span>
      ),
    },

    {
      key: "endDate",
      label: "End Date",
      render: (item) => (
        <span className="text-zinc-600">{formatDate(item.endDate)}</span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          {/* View */}
          <button
            type="button"
            title="View financial tip"
            onClick={() => handleView(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>

          {/* Edit */}
          <button
            type="button"
            title="Edit financial tip"
            onClick={() => setEditFinancialTip(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>

          {/* Delete */}
          <button
            type="button"
            title="Delete financial tip"
            onClick={() => setDeleteFinancialTip(item)}
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
        title="Financial Tips"
        description="Create and manage financial tips and educational content displayed to FinTrack users."
        columns={columns}
        data={filteredFinancialTips}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        onRefresh={loadFinancialTips}
        page={1}
        totalPages={1}
        total={filteredFinancialTips.length}
        onPageChange={() => {}}
      />

      {/* View Modal */}
      <ViewFinancialTipModal
        financialTip={viewFinancialTip}
        onClose={() => setViewFinancialTip(null)}
      />

      {/* Edit Modal */}
      <EditFinancialTipModal
        financialTip={editFinancialTip}
        onClose={() => setEditFinancialTip(null)}
        onSaved={loadFinancialTips}
      />

      {/* Delete Modal */}
      <DeleteFinancialTipModal
        financialTip={deleteFinancialTip}
        onClose={() => setDeleteFinancialTip(null)}
        onDeleted={loadFinancialTips}
      />
    </>
  );
}
