"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewFeedbackModal from "@/components/admin/ViewFeedbackModal";
import EditFeedbackModal from "@/components/admin/EditFeedbackModal";
import DeleteFeedbackModal from "@/components/admin/DeleteFeedbackModal";

type Feedback = {
  _id: string;
  user?:
    | {
        _id?: string;
        name?: string;
        email?: string;
      }
    | string;
  subject?: string;
  message?: string;
  category?: string;
  rating?: number;
  status?: "Pending" | "In Progress" | "Resolved";
  priority?: "Low" | "Medium" | "High";
  createdAt?: string;
  updatedAt?: string;
};

type FeedbacksResponse = {
  success: boolean;
  data: Feedback[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewFeedback, setViewFeedback] = useState<Feedback | null>(null);
  const [editFeedback, setEditFeedback] = useState<Feedback | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<Feedback | null>(null);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");

      const response: FeedbacksResponse = await adminApi(
        `/admin/feedbacks?page=${page}&limit=20`,
      );

      setFeedbacks(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load feedback records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [page]);

  // Prevent background scrolling when any modal is open
  const isModalOpen = Boolean(viewFeedback || editFeedback || deleteFeedback);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const handleView = async (feedback: Feedback) => {
    try {
      setError("");
      const response = await adminApi(`/admin/feedbacks/${feedback._id}`);
      setViewFeedback(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load feedback details.",
      );
    }
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    const userName =
      typeof item.user === "object" && item.user !== null ? item.user.name : "";
    const userEmail =
      typeof item.user === "object" && item.user !== null
        ? item.user.email
        : "";

    return (
      item.subject?.toLowerCase().includes(query) ||
      item.message?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query) ||
      userName?.toLowerCase().includes(query) ||
      userEmail?.toLowerCase().includes(query) ||
      item._id.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<Feedback>[] = [
    {
      key: "subject",
      label: "Subject",
      render: (item) => (
        <span className="font-medium text-zinc-900">
          {item.subject || "No subject"}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (item) => (
        <span className="text-zinc-600 capitalize">
          {item.category || "General"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const statusColors: Record<string, string> = {
          Pending: "bg-amber-50 text-amber-700 border-amber-200",
          "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
          Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
        const badgeStyle =
          statusColors[item.status || "Pending"] ||
          "bg-zinc-100 text-zinc-700 border-zinc-200";

        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
          >
            {item.status || "Pending"}
          </span>
        );
      },
    },
    {
      key: "user",
      label: "User",
      render: (item) => {
        if (typeof item.user === "object" && item.user !== null) {
          return (
            <span title={item.user.email} className="text-xs text-zinc-600">
              {item.user.name || item.user.email || "Unknown user"}
            </span>
          );
        }
        return item.user ? (
          <span className="font-mono text-xs text-zinc-400">
            ...{String(item.user).slice(-8)}
          </span>
        ) : (
          "—"
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (item) => (
        <span className="text-zinc-600">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleView(item)}
            title="View feedback"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={() => setEditFeedback(item)}
            title="Edit feedback status"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteFeedback(item)}
            title="Delete feedback"
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
        title="Feedback"
        description="View and manage feedback and bug reports submitted by FinTrack users."
        columns={columns}
        data={filteredFeedbacks}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadFeedbacks}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      {/* View Modal */}
      <ViewFeedbackModal
        feedback={viewFeedback}
        onClose={() => setViewFeedback(null)}
      />

      {/* Edit Modal */}
      <EditFeedbackModal
        feedback={editFeedback}
        onClose={() => setEditFeedback(null)}
        onSaved={loadFeedbacks}
      />

      {/* Delete Modal */}
      <DeleteFeedbackModal
        feedback={deleteFeedback}
        onClose={() => setDeleteFeedback(null)}
        onDeleted={loadFeedbacks}
      />
    </>
  );
}
