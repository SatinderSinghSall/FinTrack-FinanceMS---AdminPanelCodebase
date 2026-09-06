"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewMaintenanceModal from "@/components/admin/ViewMaintenanceModal";
import EditMaintenanceModal from "@/components/admin/EditMaintenanceModal";

type Maintenance = {
  _id: string;
  enabled: boolean;
  title: string;
  message: string;
  allowUserAccess: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type MaintenanceResponse = {
  success: boolean;
  data: Maintenance | Maintenance[];
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

const getMaintenanceStatus = (item: Maintenance) => {
  if (!item.enabled) {
    return "Disabled";
  }

  const now = new Date();

  const start = item.startDate ? new Date(item.startDate) : null;
  const end = item.endDate ? new Date(item.endDate) : null;

  if (start && !Number.isNaN(start.getTime()) && now < start) {
    return "Scheduled";
  }

  if (end && !Number.isNaN(end.getTime()) && now > end) {
    return "Expired";
  }

  return "Active";
};

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMaintenance, setViewMaintenance] = useState<Maintenance | null>(
    null,
  );

  const [editMaintenance, setEditMaintenance] = useState<Maintenance | null>(
    null,
  );

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      setError("");

      const response: MaintenanceResponse =
        await adminApi("/admin/maintenance");

      const data = response.data;

      /*
       * Maintenance is a global/single configuration.
       *
       * The backend may return either:
       * - one object
       * - an array containing the configuration
       *
       * Normalize both into the table format.
       */
      if (Array.isArray(data)) {
        setMaintenance(data);
      } else if (data) {
        setMaintenance([data]);
      } else {
        setMaintenance([]);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load maintenance settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  /*
   * Prevent background scrolling when a modal is open.
   */
  const isModalOpen = Boolean(viewMaintenance || editMaintenance);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  /*
   * View maintenance details.
   *
   * The backend currently exposes the maintenance configuration
   * from /admin/maintenance, so we use the selected table record
   * directly for the view modal.
   */
  const handleView = (item: Maintenance) => {
    setError("");
    setViewMaintenance(item);
  };

  const filteredMaintenance = maintenance.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    const status = getMaintenanceStatus(item);

    const userAccess = item.allowUserAccess ? "allowed" : "restricted";

    return (
      item.title?.toLowerCase().includes(query) ||
      item.message?.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query) ||
      userAccess.includes(query) ||
      item._id.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<Maintenance>[] = [
    {
      key: "title",
      label: "Title",
      render: (item) => (
        <div className="min-w-0">
          <p className="line-clamp-1 font-medium text-zinc-900">
            {item.title || "Untitled Maintenance"}
          </p>

          <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-zinc-400">
            {item.message || "No maintenance message"}
          </p>
        </div>
      ),
    },

    {
      key: "enabled",
      label: "Status",
      render: (item) => {
        const status = getMaintenanceStatus(item);

        const statusStyles: Record<string, string> = {
          Active: "border-amber-200 bg-amber-50 text-amber-700",
          Scheduled: "border-blue-200 bg-blue-50 text-blue-700",
          Expired: "border-zinc-200 bg-zinc-100 text-zinc-600",
          Disabled: "border-zinc-200 bg-zinc-100 text-zinc-600",
        };

        const dotStyles: Record<string, string> = {
          Active: "bg-amber-500",
          Scheduled: "bg-blue-500",
          Expired: "bg-zinc-400",
          Disabled: "bg-zinc-400",
        };

        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              statusStyles[status] || statusStyles.Disabled
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                dotStyles[status] || dotStyles.Disabled
              }`}
            />

            {status}
          </span>
        );
      },
    },

    {
      key: "allowUserAccess",
      label: "User Access",
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            item.allowUserAccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              item.allowUserAccess ? "bg-emerald-500" : "bg-red-500"
            }`}
          />

          {item.allowUserAccess ? "Allowed" : "Restricted"}
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
            title="View maintenance"
            onClick={() => handleView(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>

          {/* Edit */}
          <button
            type="button"
            title="Edit maintenance"
            onClick={() => setEditMaintenance(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CollectionPage
        title="Maintenance"
        description="Configure and manage maintenance mode for FinTrack users."
        columns={columns}
        data={filteredMaintenance}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        onRefresh={loadMaintenance}
        page={1}
        totalPages={1}
        total={filteredMaintenance.length}
        onPageChange={() => {}}
      />

      {/* View Modal */}
      <ViewMaintenanceModal
        maintenance={viewMaintenance}
        onClose={() => setViewMaintenance(null)}
      />

      {/* Edit Modal */}
      <EditMaintenanceModal
        maintenance={editMaintenance}
        onClose={() => setEditMaintenance(null)}
        onSaved={loadMaintenance}
      />
    </>
  );
}
