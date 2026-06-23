// app/community/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { Search, X, Plus } from "lucide-react";
import axios from "axios";

// Import the two extracted components
import { DiscussionsHeader } from "@/components/DiscussionHeader";
import { DiscussionCard } from "@/components/DiscussionCard";
import { CreateModal } from "@/components/CommunityModal";

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

// ─── Main Page ──────────────────────────────────────────────────────────
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
      <DiscussionsHeader
        totalOnline={totalOnline}
        joinedCount={joinedIds.size}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        onOpenCreate={() => setShowModal(true)}
      />

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
                userId={userId}
                discussion={d}
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