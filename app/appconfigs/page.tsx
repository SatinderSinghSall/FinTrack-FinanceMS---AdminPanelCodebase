"use client";

import { useEffect, useState } from "react";
import { Eye, Smartphone, Apple } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import { adminApi } from "@/lib/api";
import type { DataColumn } from "@/components/DataTable";

import ViewAppConfigModal from "@/components/admin/ViewAppConfigModal";

type AppConfig = {
  _id: string;
  platform: "android" | "ios";
  latestVersion: string;
  minSupportedVersion: string;
  forceUpdate: boolean;
  playStoreUrl: string;
  updateMessage?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AppConfigsResponse = {
  success: boolean;
  data: AppConfig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export default function AppConfigsPage() {
  const [configs, setConfigs] = useState<AppConfig[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [viewConfig, setViewConfig] = useState<AppConfig | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD APP CONFIGS
  |--------------------------------------------------------------------------
  */

  const loadConfigs = async () => {
    try {
      setLoading(true);
      setError("");

      const response: AppConfigsResponse = await adminApi(
        `/admin/appconfigs?page=${page}&limit=20`,
      );

      setConfigs(response.data || []);

      setTotal(response.pagination?.total || 0);

      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load app configurations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, [page]);

  /*
  |--------------------------------------------------------------------------
  | PREVENT BODY SCROLL WHEN MODAL OPEN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (viewConfig) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [viewConfig]);

  /*
  |--------------------------------------------------------------------------
  | VIEW CONFIGURATION
  |--------------------------------------------------------------------------
  */

  const handleView = async (config: AppConfig) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await adminApi(`/admin/appconfigs/${config._id}`);

      setViewConfig(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load app configuration details.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredConfigs = configs.filter((config) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      config.platform.toLowerCase().includes(query) ||
      config.latestVersion.toLowerCase().includes(query) ||
      config.minSupportedVersion.toLowerCase().includes(query) ||
      config._id.toLowerCase().includes(query)
    );
  });

  /*
  |--------------------------------------------------------------------------
  | TABLE COLUMNS
  |--------------------------------------------------------------------------
  */

  const columns: DataColumn<AppConfig>[] = [
    {
      key: "platform",
      label: "Platform",

      render: (config) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
            {config.platform === "android" ? (
              <Smartphone
                size={17}
                strokeWidth={1.8}
                className="text-zinc-700"
              />
            ) : (
              <Apple size={17} strokeWidth={1.8} className="text-zinc-700" />
            )}
          </div>

          <div>
            <p className="font-medium capitalize text-zinc-900">
              {config.platform}
            </p>

            <p className="text-xs text-zinc-400">Mobile application</p>
          </div>
        </div>
      ),
    },

    {
      key: "latestVersion",
      label: "Latest Version",

      render: (config) => (
        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700">
          v{config.latestVersion}
        </span>
      ),
    },

    {
      key: "minSupportedVersion",
      label: "Minimum Supported",

      render: (config) => (
        <span className="font-mono text-sm text-zinc-700">
          v{config.minSupportedVersion}
        </span>
      ),
    },

    {
      key: "forceUpdate",
      label: "Force Update",

      render: (config) =>
        config.forceUpdate ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Enabled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Disabled
          </span>
        ),
    },

    {
      key: "updatedAt",
      label: "Updated",

      render: (config) =>
        config.updatedAt
          ? new Date(config.updatedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
    },

    {
      key: "_id",
      label: "ID",

      render: (config) => (
        <span title={config._id} className="font-mono text-xs text-zinc-400">
          ...{config._id.slice(-8)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (config) => (
        <div className="flex w-full items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleView(config)}
            disabled={actionLoading}
            title="View configuration"
            aria-label={`View ${config.platform} configuration`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-zinc-400 transition-all duration-150 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eye size={16} strokeWidth={1.8} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CollectionPage
        title="App Configurations"
        description="View mobile application versions, update requirements, and release configuration."
        columns={columns}
        data={filteredConfigs}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadConfigs}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      <ViewAppConfigModal
        config={viewConfig}
        onClose={() => setViewConfig(null)}
      />
    </>
  );
}
