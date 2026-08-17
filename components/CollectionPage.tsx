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

  onPageChange: (page: number) => void;

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
  onPageChange,
  children,
}: CollectionPageProps<T>) {
  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Database</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              {title}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </div>

          {children}
        </div>

        {/* Table */}
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
          onPageChange={onPageChange}
        />
      </div>
    </AdminShell>
  );
}
