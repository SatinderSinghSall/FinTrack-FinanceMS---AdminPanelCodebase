"use client";

import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";

export type DataColumn<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: DataColumn<T>[];
  data: T[];

  loading?: boolean;
  error?: string;

  search?: string;
  onSearchChange?: (value: string) => void;

  onRefresh?: () => void;

  page?: number;
  totalPages?: number;
  total?: number;

  onPageChange?: (page: number) => void;

  emptyMessage?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  error = "",
  search = "",
  onSearchChange,
  onRefresh,
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* --------------------------------------------------
          TOOLBAR
      -------------------------------------------------- */}

      <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}

        <div className="relative w-full sm:max-w-sm">
          <Search
            size={17}
            strokeWidth={1.8}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search..."
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100"
          />
        </div>

        {/* Refresh */}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              strokeWidth={1.8}
              className={loading ? "animate-spin" : ""}
            />

            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* --------------------------------------------------
          ERROR
      -------------------------------------------------- */}

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* --------------------------------------------------
          DESKTOP TABLE
      -------------------------------------------------- */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px] text-left">
          {/* Header */}

          <thead className="border-b border-zinc-100 bg-zinc-50/70">
            <tr>
              {columns.map((column) => {
                const isActions = column.key === "actions";

                return (
                  <th
                    key={String(column.key)}
                    className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 ${
                      isActions ? "w-[150px] min-w-[150px] text-right" : ""
                    }`}
                  >
                    {column.label}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}

          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              /* Loading */

              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {columns.map((column) => {
                    const isActions = column.key === "actions";

                    return (
                      <td
                        key={String(column.key)}
                        className={`px-5 py-4 ${
                          isActions ? "w-[150px] min-w-[150px]" : ""
                        }`}
                      >
                        <div
                          className={`h-4 animate-pulse rounded bg-zinc-100 ${
                            isActions ? "ml-auto w-28" : "w-24"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : data.length > 0 ? (
              /* Data */

              data.map((row, rowIndex) => (
                <tr
                  key={String(row._id ?? rowIndex)}
                  className="transition-colors hover:bg-zinc-50/70"
                >
                  {columns.map((column) => {
                    const isActions = column.key === "actions";

                    return (
                      <td
                        key={String(column.key)}
                        className={`whitespace-nowrap px-5 py-4 text-sm text-zinc-700 ${
                          isActions ? "w-[150px] min-w-[150px] text-right" : ""
                        }`}
                      >
                        {column.render
                          ? column.render(row)
                          : String(row[column.key as keyof T] ?? "—")}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              /* Empty */

              <tr>
                <td colSpan={columns.length} className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-zinc-700">
                    {emptyMessage}
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    There are no records to display.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --------------------------------------------------
          MOBILE CARDS
      -------------------------------------------------- */}

      <div className="divide-y divide-zinc-100 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />

              <div className="h-3 w-48 animate-pulse rounded bg-zinc-100" />

              <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((row, rowIndex) => (
            <div key={String(row._id ?? rowIndex)} className="space-y-3 p-4">
              {columns.map((column) => {
                const isActions = column.key === "actions";

                return (
                  <div
                    key={String(column.key)}
                    className={`flex items-start gap-4 ${
                      isActions ? "flex-col gap-2" : "justify-between"
                    }`}
                  >
                    <span
                      className={`shrink-0 text-xs font-medium text-zinc-400 ${
                        isActions ? "w-full" : ""
                      }`}
                    >
                      {column.label}
                    </span>

                    <span
                      className={`min-w-0 text-sm text-zinc-800 ${
                        isActions ? "w-full text-left" : "text-right"
                      }`}
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key as keyof T] ?? "—")}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="px-4 py-14 text-center">
            <p className="text-sm font-medium text-zinc-700">{emptyMessage}</p>

            <p className="mt-1 text-xs text-zinc-400">
              There are no records to display.
            </p>
          </div>
        )}
      </div>

      {/* --------------------------------------------------
          PAGINATION
      -------------------------------------------------- */}

      <div className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Pagination information */}

        <p className="text-xs text-zinc-400">
          {total === 0
            ? "No records"
            : `Page ${page} of ${totalPages} · ${total} total`}
        </p>

        {/* Pagination buttons */}

        <div className="flex items-center gap-2">
          {/* Previous */}

          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange?.(page - 1)}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={15} strokeWidth={1.8} />

            <span>Previous</span>
          </button>

          {/* Next */}

          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange?.(page + 1)}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Next</span>

            <ChevronRight size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
