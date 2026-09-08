"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Send, Trash2, Plus } from "lucide-react";

import CollectionPage from "@/components/CollectionPage";
import type { DataColumn } from "@/components/DataTable";
import { adminApi } from "@/lib/api";

import ViewEmailCampaignModal from "@/components/admin/ViewEmailCampaignModal";
import EditEmailCampaignModal from "@/components/admin/EditEmailCampaignModal";
import DeleteEmailCampaignModal from "@/components/admin/DeleteEmailCampaignModal";
import SendEmailCampaignModal from "@/components/admin/SendEmailCampaignModal";

type CampaignStatus = "draft" | "active" | "completed";

type EmailCampaign = {
  _id: string;
  campaignId: string;
  name: string;
  subject?: string;

  htmlContent?: string;
  textContent?: string;
  buttonText?: string;
  buttonUrl?: string;

  status?: CampaignStatus;

  sentCount?: number;
  failedCount?: number;
  pendingCount?: number;

  dailyLimit?: number;
  sentToday?: number;
  remainingToday?: number;

  createdAt?: string;
  updatedAt?: string;
};

/*
 * Full campaign details returned by:
 *
 * GET /admin/email-campaigns/:id
 */
type EmailCampaignDetails = {
  campaign: {
    _id: string;
    campaignId: string;
    name: string;
    subject: string;

    htmlContent: string;
    textContent: string;
    buttonText: string;
    buttonUrl: string;

    status: CampaignStatus;

    sentCount: number;
    failedCount: number;
    pendingCount: number;

    dailyLimit: number;
    sentToday: number;
    remainingToday: number;

    createdAt?: string;
    updatedAt?: string;
  };

  statistics: {
    sentCount: number;
    failedCount: number;
    pendingCount: number;
    dailyLimit: number;
    sentToday: number;
    remainingToday: number;
  };

  recipients: Array<{
    _id: string;
    campaign: string;
    user: string | null;
    email: string;

    status: "pending" | "sent" | "failed";

    resendEmailId?: string | null;
    sentAt?: string | null;
    error?: string | null;

    createdAt?: string;
    updatedAt?: string;

    userName?: string | null;
    userEmail?: string | null;
  }>;
};

type EmailCampaignsResponse = {
  success: boolean;
  data: EmailCampaign[];
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

export default function EmailCampaignsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * IMPORTANT:
   * View uses the full campaign details response,
   * not the basic collection/list type.
   */
  const [viewCampaign, setViewCampaign] = useState<EmailCampaignDetails | null>(
    null,
  );

  const [editCampaign, setEditCampaign] = useState<EmailCampaign | null>(null);

  const [sendCampaign, setSendCampaign] = useState<EmailCampaign | null>(null);

  const [deleteCampaign, setDeleteCampaign] = useState<EmailCampaign | null>(
    null,
  );

  /*
   * Load all campaigns
   */
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError("");

      const response: EmailCampaignsResponse = await adminApi(
        "/admin/email-campaigns",
      );

      setCampaigns(response?.data || []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load email campaigns.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  /*
   * Lock page scrolling while any modal is open.
   */
  const isModalOpen = Boolean(
    viewCampaign || editCampaign || sendCampaign || deleteCampaign,
  );

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  /*
   * View campaign
   *
   * This endpoint returns:
   *
   * {
   *   campaign,
   *   statistics,
   *   recipients
   * }
   */
  const handleView = async (campaign: EmailCampaign) => {
    try {
      setError("");

      const response = await adminApi(`/admin/email-campaigns/${campaign._id}`);

      setViewCampaign(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load email campaign details.",
      );
    }
  };

  /*
   * Search/filter campaigns
   */
  const filteredCampaigns = campaigns.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      item.name?.toLowerCase().includes(query) ||
      item.subject?.toLowerCase().includes(query) ||
      item.campaignId?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query) ||
      item._id?.toLowerCase().includes(query)
    );
  });

  /*
   * Status styles
   */
  const statusStyles: Record<CampaignStatus, string> = {
    draft: "bg-zinc-50 text-zinc-700 border-zinc-200",

    active: "bg-blue-50 text-blue-700 border-blue-200",

    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  /*
   * Table columns
   */
  const columns: DataColumn<EmailCampaign>[] = [
    {
      key: "name",
      label: "Campaign",

      render: (item) => (
        <div className="min-w-0">
          <p className="line-clamp-1 font-medium text-zinc-900">
            {item.name || "Untitled Campaign"}
          </p>

          <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-zinc-500">
            {item.subject || "No email subject"}
          </p>

          <p className="mt-0.5 line-clamp-1 max-w-md text-[10px] text-zinc-400">
            {item.campaignId || "No campaign ID"}
          </p>
        </div>
      ),
    },

    {
      key: "status",
      label: "Status",

      render: (item) => {
        const status: CampaignStatus = item.status || "draft";

        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
              statusStyles[status]
            }`}
          >
            {status}
          </span>
        );
      },
    },

    {
      key: "sentCount",
      label: "Sent",

      render: (item) => (
        <span className="text-zinc-600">{item.sentCount ?? 0}</span>
      ),
    },

    {
      key: "pendingCount",
      label: "Pending",

      render: (item) => (
        <span className="text-zinc-600">{item.pendingCount ?? 0}</span>
      ),
    },

    {
      key: "failedCount",
      label: "Failed",

      render: (item) => (
        <span
          className={
            (item.failedCount ?? 0) > 0
              ? "font-medium text-red-600"
              : "text-zinc-600"
          }
        >
          {item.failedCount ?? 0}
        </span>
      ),
    },

    {
      key: "sentToday",
      label: "Today",

      render: (item) => (
        <span className="text-zinc-600">
          {item.sentToday ?? 0}

          <span className="ml-1 text-xs text-zinc-400">
            / {item.dailyLimit ?? 100}
          </span>
        </span>
      ),
    },

    {
      key: "remainingToday",
      label: "Remaining",

      render: (item) => (
        <span
          className={
            (item.remainingToday ?? 0) > 0
              ? "font-medium text-emerald-600"
              : "text-zinc-500"
          }
        >
          {item.remainingToday ?? 0}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created",

      render: (item) => (
        <span className="text-zinc-600">{formatDate(item.createdAt)}</span>
      ),
    },

    {
      key: "actions",
      label: "Actions",

      render: (item) => {
        const status = item.status || "draft";
        const isCompleted = status === "completed";

        return (
          <div className="flex items-center gap-1">
            {/* View */}

            <button
              type="button"
              title="View email campaign"
              onClick={() => handleView(item)}
              disabled={loading}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye size={16} />
            </button>

            {/* Edit */}

            <button
              type="button"
              title={
                isCompleted
                  ? "Completed campaigns cannot be edited"
                  : "Edit email campaign"
              }
              onClick={() => setEditCampaign(item)}
              disabled={loading || isCompleted}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={16} />
            </button>

            {/* Send */}

            <button
              type="button"
              title={
                isCompleted
                  ? "Campaign already completed"
                  : "Send email campaign"
              }
              onClick={() => setSendCampaign(item)}
              disabled={loading || isCompleted}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
            </button>

            {/* Delete */}

            <button
              type="button"
              title="Delete email campaign"
              onClick={() => setDeleteCampaign(item)}
              disabled={loading}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* =====================================================
            COLLECTION
        ====================================================== */}

        <CollectionPage
          title="Email Campaigns"
          description="Create and manage email campaigns sent to FinTrack users."
          columns={columns}
          data={filteredCampaigns}
          loading={loading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          onRefresh={loadCampaigns}
          page={1}
          totalPages={1}
          total={filteredCampaigns.length}
          onPageChange={() => {}}
        />
      </div>

      {/* =====================================================
          VIEW
      ====================================================== */}

      <ViewEmailCampaignModal
        campaign={viewCampaign}
        onClose={() => setViewCampaign(null)}
      />

      {/* =====================================================
          EDIT
      ====================================================== */}

      <EditEmailCampaignModal
        campaign={editCampaign}
        onClose={() => setEditCampaign(null)}
        onUpdated={async () => {
          setEditCampaign(null);
          await loadCampaigns();
        }}
      />

      {/* =====================================================
          SEND
      ====================================================== */}

      <SendEmailCampaignModal
        campaign={sendCampaign}
        onClose={() => setSendCampaign(null)}
        onSent={async () => {
          setSendCampaign(null);
          await loadCampaigns();
        }}
      />

      {/* =====================================================
          DELETE
      ====================================================== */}

      <DeleteEmailCampaignModal
        campaign={deleteCampaign}
        onClose={() => setDeleteCampaign(null)}
        onDeleted={async () => {
          setDeleteCampaign(null);
          await loadCampaigns();
        }}
      />
    </>
  );
}
