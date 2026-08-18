"use client";

import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Inbox,
  AlertCircle,
} from "lucide-react";

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
  limit?: number; // Added to accurately calculate pagination S.No

  onPageChange?: (page: number) => void;

  emptyMessage?: string;
  showSerialNumber?: boolean; // Enable/disable S.No column
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
  limit = 10,
  onPageChange,
  emptyMessage = "No records found.",
  showSerialNumber = true,
}: DataTableProps<T>) {
  const totalColumnsCount = showSerialNumber
    ? columns.length + 1
    : columns.length;

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-xl shadow-zinc-950/[0.02]">
      {/* --------------------------------------------------
          TOOLBAR
      -------------------------------------------------- */}
      <div className="flex flex-col gap-3.5 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search records..."
            className="h-11 w-full rounded-2xl border border-zinc-200/90 bg-zinc-50/70 pl-10 pr-4 text-sm font-semibold text-zinc-950 outline-none transition-all placeholder:font-medium placeholder:text-zinc-400 focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-950/5"
          />
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-zinc-200/90 bg-white px-5 text-sm font-bold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              strokeWidth={2.2}
              className={
                loading ? "animate-spin text-zinc-950" : "text-zinc-500"
              }
            />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* --------------------------------------------------
          ERROR STATE
      -------------------------------------------------- */}
      {error && (
        <div className="flex items-center gap-3 border-b border-red-200 bg-red-50/80 px-5 py-3.5 text-sm font-bold text-red-600">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* --------------------------------------------------
          DESKTOP TABLE
      -------------------------------------------------- */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px] border-collapse text-left">
          {/* Header */}
          <thead className="border-b border-zinc-100 bg-zinc-50/80">
            <tr>
              {/* Serial No. Header */}
              {showSerialNumber && (
                <th className="w-16 whitespace-nowrap px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.15em] text-zinc-400">
                  #
                </th>
              )}

              {columns.map((column) => {
                const isActions = column.key === "actions";

                return (
                  <th
                    key={String(column.key)}
                    className={`whitespace-nowrap px-6 py-4 text-[11px] font-extrabold uppercase tracking-[0.15em] text-zinc-400 ${
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
              /* Loading Skeleton */
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {showSerialNumber && (
                    <td className="w-16 px-6 py-4.5">
                      <div className="h-4.5 w-6 animate-pulse rounded-lg bg-zinc-100" />
                    </td>
                  )}
                  {columns.map((column) => {
                    const isActions = column.key === "actions";

                    return (
                      <td
                        key={String(column.key)}
                        className={`px-6 py-4.5 ${
                          isActions ? "w-[150px] min-w-[150px]" : ""
                        }`}
                      >
                        <div
                          className={`h-4.5 animate-pulse rounded-lg bg-zinc-100 ${
                            isActions ? "ml-auto w-24" : "w-28"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : data.length > 0 ? (
              /* Data Rows */
              data.map((row, rowIndex) => {
                const serialNumber = (page - 1) * limit + rowIndex + 1;

                return (
                  <tr
                    key={String(row._id ?? rowIndex)}
                    className="group transition-colors hover:bg-zinc-50/80"
                  >
                    {/* Serial Number Cell */}
                    {showSerialNumber && (
                      <td className="w-16 whitespace-nowrap px-6 py-4.5 text-xs font-bold text-zinc-400 group-hover:text-zinc-600">
                        {String(serialNumber).padStart(2, "0")}
                      </td>
                    )}

                    {columns.map((column) => {
                      const isActions = column.key === "actions";

                      return (
                        <td
                          key={String(column.key)}
                          className={`whitespace-nowrap px-6 py-4.5 text-sm font-semibold text-zinc-800 transition-colors group-hover:text-zinc-950 ${
                            isActions
                              ? "w-[150px] min-w-[150px] text-right"
                              : ""
                          }`}
                        >
                          {column.render
                            ? column.render(row)
                            : String(row[column.key as keyof T] ?? "—")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              /* Empty State */
              <tr>
                <td
                  colSpan={totalColumnsCount}
                  className="px-6 py-16 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                    <Inbox size={28} strokeWidth={1.8} />
                  </div>
                  <p className="mt-3.5 text-base font-extrabold text-zinc-950">
                    {emptyMessage}
                  </p>
                  <p className="mt-1 text-xs font-medium text-zinc-400">
                    There are no records to display at this moment.
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
            <div key={index} className="space-y-3 p-5">
              <div className="h-4 w-32 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-3.5 w-48 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-3.5 w-24 animate-pulse rounded-lg bg-zinc-100" />
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((row, rowIndex) => {
            const serialNumber = (page - 1) * limit + rowIndex + 1;

            return (
              <div
                key={String(row._id ?? rowIndex)}
                className="space-y-3.5 p-5 transition-colors active:bg-zinc-50"
              >
                {/* Mobile Serial No. Badge */}
                {showSerialNumber && (
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                      Record #
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-600">
                      #{serialNumber}
                    </span>
                  </div>
                )}

                {columns.map((column) => {
                  const isActions = column.key === "actions";

                  return (
                    <div
                      key={String(column.key)}
                      className={`flex items-center gap-4 ${
                        isActions
                          ? "flex-col items-start gap-2 pt-1"
                          : "justify-between"
                      }`}
                    >
                      <span className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                        {column.label}
                      </span>

                      <span
                        className={`min-w-0 text-sm font-semibold text-zinc-900 ${
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
            );
          })
        ) : (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <Inbox size={28} strokeWidth={1.8} />
            </div>
            <p className="mt-3.5 text-base font-extrabold text-zinc-950">
              {emptyMessage}
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              There are no records to display.
            </p>
          </div>
        )}
      </div>

      {/* --------------------------------------------------
          PAGINATION
      -------------------------------------------------- */}
      <div className="flex flex-col gap-3.5 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Pagination Details */}
        <p className="text-xs font-bold text-zinc-500">
          {total === 0 ? (
            "No records available"
          ) : (
            <>
              Page <span className="font-extrabold text-zinc-950">{page}</span>{" "}
              of{" "}
              <span className="font-extrabold text-zinc-950">{totalPages}</span>
              <span className="mx-2 text-zinc-300">·</span>
              <span className="font-extrabold text-zinc-950">{total}</span>{" "}
              total entries
            </>
          )}
        </p>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Previous Button */}
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange?.(page - 1)}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-4 text-xs font-extrabold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
            <span>Previous</span>
          </button>

          {/* Next Button */}
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange?.(page + 1)}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-4 text-xs font-extrabold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
