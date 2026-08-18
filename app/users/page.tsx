"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import { adminApi } from "@/lib/api";
import type { DataColumn } from "@/components/DataTable";

import ViewUserModal from "@/components/admin/ViewUserModal";
import EditUserModal from "@/components/admin/EditUserModal";
import DeleteUserModal from "@/components/admin/DeleteUserModal";

type User = {
  _id: string;
  name?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

type UsersResponse = {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [viewUser, setViewUser] = useState<User | null>(null);

  const [editUser, setEditUser] = useState<User | null>(null);

  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  /* --------------------------------
     LOAD USERS
  -------------------------------- */

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response: UsersResponse = await adminApi(
        `/admin/users?page=${page}&limit=20`,
      );

      setUsers(response.data || []);

      setTotal(response.pagination?.total || 0);

      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  /* --------------------------------
   PREVENT BODY SCROLL WHEN MODAL OPEN
  -------------------------------- */
  useEffect(() => {
    const isModalOpen = Boolean(viewUser || editUser || deleteUser);

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Clean up on component unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [viewUser, editUser, deleteUser]);

  /* --------------------------------
     VIEW USER
  -------------------------------- */

  const handleView = async (user: User) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await adminApi(`/admin/users/${user._id}`);

      setViewUser(response.data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load user details.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* --------------------------------
     SEARCH
  -------------------------------- */

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user._id.toLowerCase().includes(query)
    );
  });

  /* --------------------------------
     TABLE COLUMNS
  -------------------------------- */

  const columns: DataColumn<User>[] = [
    {
      key: "name",
      label: "Name",

      render: (user) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-900">
            {user.name || "—"}
          </p>
        </div>
      ),
    },

    {
      key: "email",
      label: "Email",

      render: (user) => (
        <span className="text-zinc-600">{user.email || "—"}</span>
      ),
    },

    {
      key: "createdAt",
      label: "Created",

      render: (user) =>
        user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
    },

    {
      key: "_id",
      label: "ID",

      render: (user) => (
        <span title={user._id} className="font-mono text-xs text-zinc-400">
          ...{user._id.slice(-8)}
        </span>
      ),
    },

    /* --------------------------------
       ACTIONS
    -------------------------------- */

    {
      key: "actions",
      label: "Actions",

      render: (user) => (
        <div className="flex w-full items-center justify-end gap-1.5">
          {/* VIEW */}
          <button
            type="button"
            onClick={() => handleView(user)}
            disabled={actionLoading}
            title="View user"
            aria-label={`View ${user.name || "user"}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-zinc-400 transition-all duration-150 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eye size={16} strokeWidth={1.8} />
          </button>

          {/* EDIT */}
          <button
            type="button"
            onClick={() => setEditUser(user)}
            title="Edit user"
            aria-label={`Edit ${user.name || "user"}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-zinc-400 transition-all duration-150 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>

          {/* DELETE */}
          <button
            type="button"
            onClick={() => setDeleteUser(user)}
            title="Delete user"
            aria-label={`Delete ${user.name || "user"}`}
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
      {/* --------------------------------
          USERS COLLECTION
      -------------------------------- */}

      <CollectionPage
        title="Users"
        description="View and manage registered FinTrack users."
        columns={columns}
        data={filteredUsers}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadUsers}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      {/* --------------------------------
          VIEW USER MODAL
      -------------------------------- */}

      <ViewUserModal user={viewUser} onClose={() => setViewUser(null)} />

      {/* --------------------------------
          EDIT USER MODAL
      -------------------------------- */}

      <EditUserModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onSaved={loadUsers}
      />

      {/* --------------------------------
          DELETE USER MODAL
      -------------------------------- */}

      <DeleteUserModal
        user={deleteUser}
        onClose={() => setDeleteUser(null)}
        onDeleted={loadUsers}
      />
    </>
  );
}
