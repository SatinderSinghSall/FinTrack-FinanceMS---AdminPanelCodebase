"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewAnnouncementModal from "@/components/admin/ViewAnnouncementModal";
import EditAnnouncementModal from "@/components/admin/EditAnnouncementModal";
import DeleteAnnouncementModal from "@/components/admin/DeleteAnnouncementModal";

type AnnouncementType = "info" | "success" | "warning" | "feature";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  type?: AnnouncementType;
  isActive?: boolean;
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

type AnnouncementsResponse = {
  success: boolean;
  data: Announcement[];
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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewAnnouncement, setViewAnnouncement] = useState<Announcement | null>(
    null,
  );

  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(
    null,
  );

  const [deleteAnnouncement, setDeleteAnnouncement] =
    useState<Announcement | null>(null);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response: AnnouncementsResponse = await adminApi(
        "/admin/announcements",
      );

      setAnnouncements(response.data || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load announcements.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Prevent background scrolling when any modal is open
  const isModalOpen = Boolean(
    viewAnnouncement || editAnnouncement || deleteAnnouncement,
  );

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // View announcement
  const handleView = async (announcement: Announcement) => {
    try {
      setError("");

      const response = await adminApi(
        `/admin/announcements/${announcement._id}`,
      );

      setViewAnnouncement(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load announcement details.",
      );
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      item.title?.toLowerCase().includes(query) ||
      item.message?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item._id.toLowerCase().includes(query)
    );
  });

  const typeStyles: Record<AnnouncementType, string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    feature: "bg-violet-50 text-violet-700 border-violet-200",
  };

  const columns: DataColumn<Announcement>[] = [
    {
      key: "title",
      label: "Title",
      render: (item) => (
        <div className="min-w-0">
          <p className="line-clamp-1 font-medium text-zinc-900">
            {item.title || "Untitled"}
          </p>

          <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-zinc-400">
            {item.message || "No message"}
          </p>
        </div>
      ),
    },

    {
      key: "type",
      label: "Type",
      render: (item) => {
        const type = item.type || "info";

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
            title="View announcement"
            onClick={() => handleView(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>

          {/* Edit */}
          <button
            type="button"
            title="Edit announcement"
            onClick={() => setEditAnnouncement(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>

          {/* Delete */}
          <button
            type="button"
            title="Delete announcement"
            onClick={() => setDeleteAnnouncement(item)}
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
        title="Announcements"
        description="Create and manage announcements displayed to FinTrack users."
        columns={columns}
        data={filteredAnnouncements}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        onRefresh={loadAnnouncements}
        page={1}
        totalPages={1}
        total={filteredAnnouncements.length}
        onPageChange={() => {}}
      />

      {/* View Modal */}
      <ViewAnnouncementModal
        announcement={viewAnnouncement}
        onClose={() => setViewAnnouncement(null)}
      />

      {/* Edit Modal */}
      <EditAnnouncementModal
        announcement={editAnnouncement}
        onClose={() => setEditAnnouncement(null)}
        onSaved={loadAnnouncements}
      />

      {/* Delete Modal */}
      <DeleteAnnouncementModal
        announcement={deleteAnnouncement}
        onClose={() => setDeleteAnnouncement(null)}
        onDeleted={loadAnnouncements}
      />
    </>
  );
}
