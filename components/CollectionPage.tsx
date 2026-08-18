"use client";

import { ReactNode } from "react";
import DataTable, { DataColumn } from "./DataTable";
import AdminShell from "./AdminShell";

type CollectionPageProps<T extends Record<string, unknown>> = {
  title: string;
  description: string;

  columns: DataColumn<T>[];
  data: T[];

  loading: boolean;
  error: string;

  search: string;
  onSearchChange: (value: string) => void;

  onRefresh: () => void;

  page: number;
  totalPages: number;
  total: number;
  limit?: number;

  onPageChange: (page: number) => void;

  emptyMessage?: string;
  showSerialNumber?: boolean;

  children?: ReactNode;
};

export default function CollectionPage<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  data,
  loading,
  error,
  search,
  onSearchChange,
  onRefresh,
  page,
  totalPages,
  total,
  limit = 10,
  onPageChange,
  emptyMessage,
  showSerialNumber = true,
  children,
}: CollectionPageProps<T>) {
  return (
    <AdminShell>
      <div className="space-y-8 pb-10">
        {/* Heading & Top Actions */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-zinc-400">
              Database Management
            </span>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              {title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500">
              {description}
            </p>
          </div>

          {/* Action Slot (e.g., Add New Record, Export, Filters) */}
          {children && (
            <div className="flex shrink-0 items-center gap-3">{children}</div>
          )}
        </div>

        {/* Data Table Container */}
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          error={error}
          search={search}
          onSearchChange={onSearchChange}
          onRefresh={onRefresh}
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
          emptyMessage={emptyMessage}
          showSerialNumber={showSerialNumber}
        />
      </div>
    </AdminShell>
  );
}
