// app/inbox/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { toast } from "sonner";
import { UserPlus, Users, Sparkles, Search } from "lucide-react";

// Import the two extracted components
import { RequestsHeader } from "@/components/RequestHeader";
import { RequestCard } from "@/components/RequestCard";

// Types & helpers (kept inline)
export interface ConnectionRequest {
  _id: string;
  username: string;
  email: string;
  position: string;
  about: string;
  skills: {
    frontend: string[];
    backend: string[];
    tools: string[];
    frameworks: string[];
    libraries: string[];
    languages: string[];
  };
  portfolio: string;
  createdAt: string;
}

export interface CommunityRequest {
  userId: string;
  username: string;
  about: string;
  skills: string[];
  communityId: string;
  communityName: string;
  communityIcon: string;
  members: number;
  sentAt: string;
}

export type RequestTab = "connections" | "communities";

// Helpers (kept inline)
export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const flattenSkills = (skills: ConnectionRequest["skills"]): string[] => {
  if (!skills) return [];
  return Object.values(skills).flat();
};

// Small UI components (inline, not exported)
export const SkillChip = ({ skill }: { skill: string }) => (
  <span className="px-2.5 py-1 rounded-full bg-[#EDF7F3] text-[#0EA472] text-[11px] font-medium">
    {skill}
  </span>
);

const SectionHeader = ({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 mb-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#EDF7F3] text-[#0EA472] flex items-center justify-center border border-[#A7F3D0]">
        {icon}
      </div>
      <div>
        <h2 className="m-0 text-[18px] font-bold text-[#0D1B2A] tracking-[-0.4px]">{title}</h2>
        <p className="m-0 text-[12px] text-[#64748B]">{count} pending request{count !== 1 ? "s" : ""}</p>
      </div>
    </div>
    <div className="hidden sm:flex items-center gap-2 text-[12px] text-[#94A3B8]">
      <Sparkles className="w-4 h-4" />
      Sorted by recent activity
    </div>
  </div>
);

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white border border-[#E8EDF2] rounded-2xl p-10 text-center">
    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EDF7F3] border border-[#A7F3D0] text-[#0EA472] flex items-center justify-center mb-4">
      <Search className="w-6 h-6" />
    </div>
    <h3 className="m-0 text-[18px] font-bold text-[#0D1B2A]">{title}</h3>
    <p className="m-0 mt-2 text-[13px] text-[#64748B]">{description}</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────
export default function InboxRequestsPage() {
  const currentUser = useAppSelector((state: any) => state.User.userData);
  const [tab, setTab] = useState<RequestTab>("connections");
  const [search, setSearch] = useState("");

  const [connectionReqs, setConnectionReqs] = useState<ConnectionRequest[]>([]);
  const [communityReqs, setCommunityReqs] = useState<CommunityRequest[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [fetching, setFetching] = useState(true);

  // --- Fetch connections ---
  const getPendingRequests = async () => {
    if (!currentUser?._id) {
      setFetching(false);
      return;
    }
    try {
      setFetching(true);
      const { data } = await axios.get(`/api/user/${currentUser._id}/pending-requests`);
      if (data.success && data.pendingRequests) {
        setConnectionReqs(data.pendingRequests);
      } else {
        setConnectionReqs([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load requests");
      setConnectionReqs([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    getPendingRequests();
  }, [currentUser]);

  // --- Connection handlers ---
  const approveRequest = async (requesterId: string) => {
    if (!currentUser?._id) return toast.error("You must be logged in");
    setLoading((prev) => ({ ...prev, [requesterId]: true }));
    try {
      const { data } = await axios.post(
        `/api/user/${currentUser._id}/connection-request/approve`,
        { requesterId }
      );
      toast.success(data.message || "Request approved");
      setConnectionReqs((prev) => prev.filter((req) => req._id !== requesterId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setLoading((prev) => ({ ...prev, [requesterId]: false }));
    }
  };

  const declineRequest = async (requesterId: string) => {
    if (!currentUser?._id) return toast.error("You must be logged in");
    setLoading((prev) => ({ ...prev, [requesterId]: true }));
    try {
      const { data } = await axios.post(
        `/api/user/${currentUser._id}/connection-request/decline`,
        { requesterId }
      );
      toast.success(data.message || "Request declined");
      setConnectionReqs((prev) => prev.filter((req) => req._id !== requesterId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to decline request");
    } finally {
      setLoading((prev) => ({ ...prev, [requesterId]: false }));
    }
  };

  // --- Community handlers ---
  const approveCommunity = async (userId: string, communityId: string) => {
    const key = `${communityId}-${userId}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const { data } = await axios.post(`/api/community/${communityId}/approve`, { userId });
      toast.success(data.message);
      setCommunityReqs((prev) =>
        prev.filter((req) => !(req.userId === userId && req.communityId === communityId))
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const declineCommunity = async (userId: string, communityId: string) => {
    const key = `${communityId}-${userId}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const { data } = await axios.post(`/api/community/${communityId}/reject`, { userId });
      toast.success(data.message);
      setCommunityReqs((prev) =>
        prev.filter((req) => !(req.userId === userId && req.communityId === communityId))
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // --- Fetch communities ---
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const { data } = await axios.get("/api/community/pending-requests");
        setCommunityReqs(data.requests);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCommunities();
  }, []);

  // --- Search filters ---
  const filteredConnections = useMemo(() => {
    return connectionReqs.filter((req) => {
      const allSkills = flattenSkills(req.skills);
      const haystack = `${req.username} ${req.about} ${allSkills.join(" ")}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [search, connectionReqs]);

  const filteredCommunities = useMemo(() => {
    return communityReqs.filter((req) => {
      const haystack = `${req.username} ${req.about} ${req.skills.join(" ")} ${req.communityName}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [search, communityReqs]);

  const totalRequests = connectionReqs.length + communityReqs.length;

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="text-[#64748B]">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-[#0D1B2A] font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-10">
        <RequestsHeader
          totalRequests={totalRequests}
          connectionCount={connectionReqs.length}
          communityCount={communityReqs.length}
          search={search}
          setSearch={setSearch}
          tab={tab}
          setTab={setTab}
        />

        <div className="grid grid-cols-1 gap-6">
          {tab === "connections" ? (
            <section>
              <SectionHeader
                title="Connection Requests"
                count={filteredConnections.length}
                icon={<UserPlus className="w-5 h-5" />}
              />
              <div className="grid grid-cols-1 gap-4">
                {filteredConnections.length > 0 ? (
                  filteredConnections.map((req) => (
                    <RequestCard
                      key={req._id}
                      type="connection"
                      data={req}
                      isPending={!!loading[req._id]}
                      onApprove={() => approveRequest(req._id)}
                      onDecline={() => declineRequest(req._id)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="No connection requests"
                    description="Try a different search term or switch to communities."
                  />
                )}
              </div>
            </section>
          ) : (
            <section>
              <SectionHeader
                title="Community Join Requests"
                count={filteredCommunities.length}
                icon={<Users className="w-5 h-5" />}
              />
              <div className="grid grid-cols-1 gap-4">
                {filteredCommunities.length > 0 ? (
                  filteredCommunities.map((req) => {
                    const key = `${req.communityId}-${req.userId}`;
                    return (
                      <RequestCard
                        key={req.userId}
                        type="community"
                        data={req}
                        isPending={!!loading[key]}
                        onApprove={() => approveCommunity(req.userId, req.communityId)}
                        onDecline={() => declineCommunity(req.userId, req.communityId)}
                      />
                    );
                  })
                ) : (
                  <EmptyState
                    title="No community requests"
                    description="Try another search term or switch back to connections."
                  />
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}