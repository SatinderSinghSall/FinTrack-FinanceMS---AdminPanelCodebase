"use client";

import { useEffect, useState } from "react";

import { Eye, Pencil, Trash2 } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewSubscriptionModal from "@/components/admin/ViewSubscriptionModal";
import EditSubscriptionModal from "@/components/admin/EditSubscriptionModal";
import DeleteSubscriptionModal from "@/components/admin/DeleteSubscriptionModal";

type Subscription = {
  _id: string;
  userId?: string;
  name?: string;
  category?: string;
  amount?: number;
  currency?: string;
  billingCycle?: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate?: string;
  nextRenewalDate?: string;
  reminderDaysBefore?: number;
  autoRenew?: boolean;
  paymentMethod?: string;
  notes?: string;
  status?: "active" | "cancelled";
  icon?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
};

type SubscriptionsResponse = {
  success: boolean;
  data: Subscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const formatCurrency = (amount?: number, currency = "INR") => {
  if (typeof amount !== "number") {
    return "—";
  }

  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  return `${currency} ${amount.toLocaleString("en-IN")}`;
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

const formatBillingCycle = (cycle?: Subscription["billingCycle"]) => {
  if (!cycle) {
    return "—";
  }

  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [viewSubscription, setViewSubscription] = useState<Subscription | null>(
    null,
  );

  const [editSubscription, setEditSubscription] = useState<Subscription | null>(
    null,
  );

  const [deleteSubscription, setDeleteSubscription] =
    useState<Subscription | null>(null);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response: SubscriptionsResponse = await adminApi(
        `/admin/subscriptions?page=${page}&limit=20`,
      );

      setSubscriptions(response.data || []);

      setTotal(response.pagination?.total || 0);

      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load subscriptions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [page]);

  const handleView = async (subscription: Subscription) => {
    try {
      setError("");

      const response = await adminApi(
        `/admin/subscriptions/${subscription._id}`,
      );

      setViewSubscription(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load subscription details.",
      );
    }
  };

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      subscription.name?.toLowerCase().includes(query) ||
      subscription.category?.toLowerCase().includes(query) ||
      subscription.billingCycle?.toLowerCase().includes(query) ||
      subscription.paymentMethod?.toLowerCase().includes(query) ||
      subscription.status?.toLowerCase().includes(query) ||
      subscription.userId?.toLowerCase().includes(query) ||
      subscription._id.toLowerCase().includes(query)
    );
  });

  const columns: DataColumn<Subscription>[] = [
    {
      key: "name",
      label: "Subscription",

      render: (subscription) => (
        <div className="min-w-0">
          <p className="font-medium text-zinc-900">
            {subscription.name || "Unnamed subscription"}
          </p>

          {subscription.category && (
            <p className="mt-0.5 text-xs text-zinc-400">
              {subscription.category}
            </p>
          )}
        </div>
      ),
    },

    {
      key: "amount",
      label: "Amount",

      render: (subscription) => (
        <span className="font-semibold text-zinc-900">
          {formatCurrency(subscription.amount, subscription.currency)}
        </span>
      ),
    },

    {
      key: "billingCycle",
      label: "Billing",

      render: (subscription) => (
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
          {formatBillingCycle(subscription.billingCycle)}
        </span>
      ),
    },

    {
      key: "nextRenewalDate",
      label: "Next Renewal",

      render: (subscription) => (
        <span className="text-zinc-600">
          {formatDate(subscription.nextRenewalDate)}
        </span>
      ),
    },

    {
      key: "autoRenew",
      label: "Auto Renew",

      render: (subscription) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            subscription.autoRenew
              ? "bg-emerald-50 text-emerald-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {subscription.autoRenew ? "Enabled" : "Disabled"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",

      render: (subscription) => {
        const active = subscription.status === "active";

        return (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {active ? "Active" : "Cancelled"}
          </span>
        );
      },
    },

    {
      key: "userId",
      label: "User",

      render: (subscription) =>
        subscription.userId ? (
          <span
            title={subscription.userId}
            className="font-mono text-xs text-zinc-400"
          >
            ...
            {subscription.userId.slice(-8)}
          </span>
        ) : (
          "—"
        ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (subscription) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleView(subscription)}
            title="View subscription"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => setEditSubscription(subscription)}
            title="Edit subscription"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => setDeleteSubscription(subscription)}
            title="Delete subscription"
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
        title="Subscriptions"
        description="View and manage subscriptions created by FinTrack users."
        columns={columns}
        data={filteredSubscriptions}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRefresh={loadSubscriptions}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      <ViewSubscriptionModal
        subscription={viewSubscription}
        onClose={() => setViewSubscription(null)}
      />

      <EditSubscriptionModal
        subscription={editSubscription}
        onClose={() => setEditSubscription(null)}
        onSaved={loadSubscriptions}
      />

      <DeleteSubscriptionModal
        subscription={deleteSubscription}
        onClose={() => setDeleteSubscription(null)}
        onDeleted={loadSubscriptions}
      />
    </>
  );
}
