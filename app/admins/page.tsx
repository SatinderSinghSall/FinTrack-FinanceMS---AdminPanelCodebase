"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import { adminApi } from "@/lib/api";
import type { DataColumn } from "@/components/DataTable";

import ViewAdminModal from "@/components/admin/ViewAdminModal";
import EditAdminModal from "@/components/admin/EditAdminModal";
import DeleteAdminModal from "@/components/admin/DeleteAdminModal";

type Admin = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AdminsResponse = {
  success: boolean;
  data: Admin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewAdmin, setViewAdmin] = useState<Admin | null>(null);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<Admin | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* --------------------------------
     LOAD ADMINS
  -------------------------------- */

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response: AdminsResponse = await adminApi(
        `/admin/admins?page=${page}&limit=20`,
      );

      setAdmins(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load admins.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [page]);

  /* --------------------------------
     PREVENT BODY SCROLL WHEN MODAL OPEN
  -------------------------------- */
  useEffect(() => {
    const isModalOpen = Boolean(viewAdmin || editAdmin || deleteAdmin);

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [viewAdmin, editAdmin, deleteAdmin]);

  /* --------------------------------
     VIEW ADMIN
  -------------------------------- */

  const handleView = async (admin: Admin) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await adminApi(`/admin/admins/${admin._id}`);
      setViewAdmin(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load admin details.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* --------------------------------
     SEARCH
  -------------------------------- */

  const filteredAdmins = admins.filter((admin) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      admin.name?.toLowerCase().includes(query) ||
      admin.email?.toLowerCase().includes(query) ||
      admin.role?.toLowerCase().includes(query) ||
      admin._id.toLowerCase().includes(query)
    );
  });

  /* --------------------------------
     TABLE COLUMNS
  -------------------------------- */

  const columns: DataColumn<Admin>[] = [
    {
      key: "name",
      label: "Name",
      render: (admin) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-900">
            {admin.name || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (admin) => (
        <span className="text-zinc-600">{admin.email || "—"}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (admin) => (
        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800">
          {admin.role || "Admin"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (admin) =>
        admin.createdAt
          ? new Date(admin.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      key: "_id",
      label: "ID",
      render: (admin) => (
        <span title={admin._id} className="font-mono text-xs text-zinc-400">
          ...{admin._id.slice(-8)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (admin) => (
        <div className="flex w-full items-center justify-end gap-1.5">
          {/* VIEW */}
          <button
            type="button"
            onClick={() => handleView(admin)}
            disabled={actionLoading}
            title="View admin"
            aria-label={`View ${admin.name || "admin"}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-zinc-400 transition-all duration-150 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eye size={16} strokeWidth={1.8} />
          </button>

          {/* EDIT */}
          <button
            type="button"
            onClick={() => setEditAdmin(admin)}
            title="Edit admin"
            aria-label={`Edit ${admin.name || "admin"}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-zinc-400 transition-all duration-150 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>

          {/* DELETE */}
          <button
            type="button"
            onClick={() => setDeleteAdmin(admin)}
            title="Delete admin"
            aria-label={`Delete ${admin.name || "admin"}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-zinc-400 transition-all duration-150 hover:border-red-100 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CollectionPage
        title="Admins"
        description="View and manage system administrators."
        columns={columns}
        data={filteredAdmins}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadAdmins}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
      <ViewAdminModal admin={viewAdmin} onClose={() => setViewAdmin(null)} />
      <EditAdminModal
        admin={editAdmin}
        onClose={() => setEditAdmin(null)}
        onSaved={loadAdmins}
      />
      <DeleteAdminModal
        admin={deleteAdmin}
        onClose={() => setDeleteAdmin(null)}
        onDeleted={loadAdmins}
      />
    </>
  );
}
