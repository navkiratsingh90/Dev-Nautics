"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { Search, X, Plus } from "lucide-react";
import axios from "axios";

// ─── Types (aligned with Community model) ──────────────────────────
interface Community {
  _id: string;
  communityName: string;
  slug: string;
  totalMembers: number;
  createdBy:
    | string
    | {
        _id: string;
        username: string;
        email?: string;
      };
  joinedMembers: (string | { _id: string })[];
  admins: (string | { _id: string })[];
  pendingRequests: (string | { _id: string })[];
  file?: string;
  about?: string;
  onlineMembers: number;
  topics: string[];
  createdAt: string;
  updatedAt: string;
}

type Discussion = Community;

function timeAgo(dateStr: string) {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000
  );
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function DiscussionCard({
  discussion,
  isJoined,
  onJoin,
  userId
}: {
  discussion: Discussion;
  isJoined: boolean;
  userId : string,
  onJoin: (id: string) => void;
}) {
  const createdByName =
    typeof discussion.createdBy === "object"
      ? discussion.createdBy.username
      : "Unknown";

  const hasImage =
    typeof discussion.file === "string" &&
    discussion.file.trim().startsWith("http");

  return (
    <div className="rounded-2xl border border-[#E8EDF2] bg-white p-5">
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-2xl">
          {hasImage ? (
            <img
              src={discussion.file}
              alt={discussion.communityName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>💬</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-[#0D1B2A]">
                {discussion.communityName}
              </h3>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-[#64748B]">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />{" "}
                  {discussion.onlineMembers} online
                </span>
                <span>•</span>
                <span>{discussion.totalMembers} members</span>
                <span>•</span>
                <span>Created {timeAgo(discussion.createdAt)}</span>
              </div>
            </div>
          </div>

          {discussion.about && (
            <p className="mt-2 text-sm text-[#64748B]">{discussion.about}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(discussion.topics || []).slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#E8EDF2] pt-3">
            <div className="text-xs text-[#64748B]">
              Created by {createdByName}
            </div>

            {discussion.joinedMembers.includes(userId) ? (
              <Link href={`/community/${discussion._id}`}>
                <span className="rounded-lg bg-[#0D1B2A] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1E3A5F]">
                  Enter →
                </span>
              </Link>
            ) :discussion.pendingRequests.includes(userId) ?  (
              <button
                disabled={true}
                className="rounded-lg border border-[#E8EDF2] px-4 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-50"
              >
                sent
              </button>
            ) :  (
              <button
                onClick={() => onJoin(discussion._id)}
                className="rounded-lg border border-[#E8EDF2] px-4 py-1.5 text-sm font-medium text-[#0D1B2A] hover:bg-gray-50"
              >
                + Join
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    communityName: string;
    about: string;
    topics: string;
    file: File | null;
  }) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    communityName: "",
    about: "",
    topics: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] || null;
    setFile(picked);

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (picked) {
      setPreviewUrl(URL.createObjectURL(picked));
    } else {
      setPreviewUrl("");
    }
  };

  const handleSubmit = async () => {
    if (!form.communityName.trim()) {
      setError("Community name is required");
      return;
    }

    try {
      setSubmitting(true);
      const ok = await onCreate({
        communityName: form.communityName.trim(),
        about: form.about.trim(),
        topics: form.topics.trim(),
        file,
      });

      if (ok) {
        setForm({
          communityName: "",
          about: "",
          topics: "",
        });
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#E8EDF2] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E8EDF2] px-6 py-4">
          <h2 className="text-lg font-bold text-[#0D1B2A]">
            Create a Community
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
              Cover image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2"
            />
            {previewUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-[#E8EDF2]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-40 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
              Community Name *
            </label>
            <input
              className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              value={form.communityName}
              onChange={(e) => {
                setForm((f) => ({ ...f, communityName: e.target.value }));
                setError("");
              }}
              placeholder="React Developers"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              value={form.about}
              onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
              placeholder="What is this community about?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
              Topics (comma separated)
            </label>
            <input
              className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              placeholder="React, Next.js, TypeScript"
              value={form.topics}
              onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#E8EDF2] py-2 text-[#64748B] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#0D1B2A] py-2 text-white hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscussionsPage() {
  const currentUser = useAppSelector((state: any) => state.User.userData);
  const userId = String(currentUser?._id || "");

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"members" | "online" | "newest">(
    "online"
  );
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "joined" | "trending">(
    "all"
  );
  const [showModal, setShowModal] = useState(false);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/community");
      const communities: Discussion[] = data.communities || [];
      setDiscussions(communities);

      if (userId) {
        const joined = communities
          .filter((c) =>
            Array.isArray(c.joinedMembers)
              ? c.joinedMembers.some((m) => String(m) === userId)
              : false
          )
          .map((c) => c._id);

        setJoinedIds(new Set(joined));
      } else {
        setJoinedIds(new Set());
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleJoin = async (communityId: string) => {
    if (!userId) {
      toast.error("Please log in to join");
      return;
    }

    try {
      const { data } = await axios.post(`/api/community/${communityId}/request`);
      toast.success(data.message || "Joined community!");

      setJoinedIds((prev) => new Set(prev).add(communityId));
      setDiscussions((prev) =>
        prev.map((c) =>
          c._id === communityId
            ? {
                ...c,
                totalMembers: c.totalMembers + 1,
                joinedMembers: [...c.joinedMembers, userId],
              }
            : c
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join");
    }
  };

  const handleCreate = async (payload: {
    communityName: string;
    about: string;
    topics: string;
    file: File | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append("communityName", payload.communityName);
      formData.append("about", payload.about);
      formData.append("topics", payload.topics);
      if (payload.file) {
        formData.append("file", payload.file);
      }

      const { data } = await axios.post("/api/community", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(data?.message || "Community created!");

      if (data?.community?._id) {
        setDiscussions((prev) => [data.community, ...prev]);
        setJoinedIds((prev) => new Set(prev).add(data.community._id));
      } else {
        await fetchCommunities();
      }

      return true;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create community"
      );
      return false;
    }
  };

  const filtered = useMemo(() => {
    return discussions
      .filter((d) => {
        const q = search.toLowerCase();

        const matchSearch =
          !q ||
          d.communityName.toLowerCase().includes(q) ||
          (d.about || "").toLowerCase().includes(q) ||
          (d.topics || []).some((t) => t.toLowerCase().includes(q));

        const matchTopic = !selectedTopic || (d.topics || []).includes(selectedTopic);

        const matchTab =
          activeTab === "all"
            ? true
            : activeTab === "joined"
            ? joinedIds.has(d._id)
            : d.onlineMembers > 150;

        return matchSearch && matchTopic && matchTab;
      })
      .sort((a, b) => {
        if (sortBy === "members") return b.totalMembers - a.totalMembers;
        if (sortBy === "online") return b.onlineMembers - a.onlineMembers;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [discussions, search, selectedTopic, sortBy, activeTab, joinedIds]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="text-gray-500">Loading communities...</div>
      </div>
    );
  }

  const totalOnline = discussions.reduce((s, d) => s + d.onlineMembers, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans">
      <div className="border-b border-[#E8EDF2] bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#EDF7F3] px-3 py-1 text-xs text-[#047857]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            {totalOnline} developers online
          </div>
          <h1 className="text-3xl font-bold text-[#0D1B2A]">
            Join the <span className="text-[#0EA472]">Community</span>
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[#64748B]">
            Topic-based chatrooms for every tech stack. Find your community, share
            knowledge, and build in public.
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b border-[#E8EDF2] bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {[
              { key: "all", label: "All" },
              { key: "joined", label: `Joined (${joinedIds.size})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  activeTab === tab.key
                    ? "bg-white text-[#0D1B2A] shadow-sm"
                    : "text-[#64748B] hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#E8EDF2] py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA472]"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#0D1B2A] px-4 py-2 text-sm text-white hover:bg-[#1E3A5F]"
          >
            <Plus className="h-4 w-4" /> Create Room
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-4 text-sm text-[#64748B]">
          Showing {filtered.length} rooms
          {selectedTopic && ` in ${selectedTopic}`}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E8EDF2] bg-white py-16 text-center">
            <div className="mb-2 text-4xl">🔍</div>
            <h3 className="font-semibold text-[#0D1B2A]">No rooms found</h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Try a different search or create your own room.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 rounded-lg bg-[#0D1B2A] px-5 py-2 text-sm text-white"
            >
              Create a room →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <DiscussionCard
                key={d._id}
                userId={userId ?? ""}
                discussion={d}
                isJoined={joinedIds.has(d._id)}
                onJoin={handleJoin}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}