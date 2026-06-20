"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { toast } from "sonner";
import {
  Check,
  Clock3,
  Search,
  Users,
  UserPlus,
  MessageCircle,
  ShieldCheck,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";

// --- Types (aligned with the actual API response) ---
interface ConnectionRequest {
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

interface CommunityRequest {
  // _id : string
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

type RequestTab = "connections" | "communities";


// --- Helper: time ago ---
const formatTimeAgo = (dateString: string) => {
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

// --- Helper: flatten skills object to array ---
const flattenSkills = (skills: ConnectionRequest["skills"]): string[] => {
  if (!skills) return [];
  return Object.values(skills).flat();
};

// --- Components ---
const SkillChip = ({ skill }: { skill: string }) => (
  <span className="px-2.5 py-1 rounded-full bg-[#EDF7F3] text-[#0EA472] text-[11px] font-medium">
    {skill}
  </span>
);

const SectionHeader = ({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) => (
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

// --- Main Component ---
export default function InboxRequestsPage() {
  const currentUser = useAppSelector((state: any) => state.User.userData);
  const [tab, setTab] = useState<RequestTab>("connections");
  const [search, setSearch] = useState("");

  const [connectionReqs, setConnectionReqs] = useState<ConnectionRequest[]>([]);
  const [communityReqs, setCommunityReqs] = useState<CommunityRequest[]>([]);

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [fetching, setFetching] = useState(true);

  // --- API: fetch pending requests ---
  const getPendingRequests = async () => {
    if (!currentUser?._id) {
      setFetching(false);
      return;
    }
    try {
      setFetching(true);
      const { data } = await axios.get(
        `/api/user/${currentUser._id}/pending-requests`
      );
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

  // --- API handlers ---
  const approveRequest = async (requesterId: string) => {
    if (!currentUser?._id) {
      toast.error("You must be logged in");
      return;
    }
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
    if (!currentUser?._id) {
      toast.error("You must be logged in");
      return;
    }
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

  // --- Community request handlers (mock) ---
  const approveCommunity = async (
    userId : string,
    communityId : string
  ) => {
    console.log(userId , communityId);
    
    try {
      setLoading(prev => ({
        ...prev,
        [`${communityId}-${userId}`]: true,
      }));
  
      const { data } = await axios.post(
        `/api/community/${communityId}/approve`,
        { userId }
      );
  
      toast.success(data.message);
  
      setCommunityReqs(prev =>
        prev.filter(
          req =>
            !(
              req.userId === userId &&
              req.communityId === communityId
            )
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to approve request"
      );
    } finally {
      setLoading(prev => ({
        ...prev,
        [`${communityId}-${userId}`]: false,
      }));
    }
  };

  const declineCommunity = async (
    userId : string,
    communityId : string
  ) => {
    try {
      setLoading(prev => ({
        ...prev,
        [`${communityId}-${userId}`]: true,
      }));
  
      const { data } = await axios.post(
        `/api/community/${communityId}/reject`,
        { userId }
      );
  
      toast.success(data.message);
  
      setCommunityReqs(prev =>
        prev.filter(
          req =>
            !(
              req.userId === userId &&
              req.communityId === communityId
            )
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to reject request"
      );
    } finally {
      setLoading(prev => ({
        ...prev,
        [`${communityId}-${userId}`]: false,
      }));
    }
  };
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
          const {data} = await axios.get(`api/community/pending-requests`)
          console.log(data);  
          setCommunityReqs(data.requests)
      } catch (error) {
        console.error(error);
        
      }
    }
    fetchCommunities()
  },[])
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

  // --- Render ---
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
        {/* Top bar */}
        <div className="bg-white border border-[#E8EDF2] rounded-3xl p-5 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="m-0 mb-2 text-xs font-semibold text-[#0EA472] tracking-[0.08em] uppercase">
                Inbox
              </p>
              <h1 className="m-0 text-[28px] sm:text-[34px] font-extrabold tracking-[-0.8px] leading-tight">
                Requests waiting for your action
              </h1>
              <p className="m-0 mt-2 text-[14px] text-[#64748B] max-w-2xl leading-relaxed">
                Manage connection requests and community join requests from one place.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
              <div className="rounded-2xl border border-[#E8EDF2] bg-[#F8FAFB] p-4">
                <div className="text-[11px] text-[#94A3B8] mb-1">Total</div>
                <div className="text-[22px] font-bold">{totalRequests}</div>
              </div>
              <div className="rounded-2xl border border-[#E8EDF2] bg-[#F8FAFB] p-4">
                <div className="text-[11px] text-[#94A3B8] mb-1">Connections</div>
                <div className="text-[22px] font-bold">{connectionReqs.length}</div>
              </div>
              <div className="rounded-2xl border border-[#E8EDF2] bg-[#F8FAFB] p-4">
                <div className="text-[11px] text-[#94A3B8] mb-1">Communities</div>
                <div className="text-[22px] font-bold">{communityReqs.length}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests, skills, communities..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-[#E8EDF2] bg-white text-[14px] outline-none focus:ring-2 focus:ring-[#0EA472]/25"
              />
            </div>

            <div className="inline-flex items-center bg-[#F8FAFB] border border-[#E8EDF2] rounded-2xl p-1">
              <button
                onClick={() => setTab("connections")}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition ${
                  tab === "connections" ? "bg-[#0D1B2A] text-white" : "text-[#64748B] hover:text-[#0D1B2A]"
                }`}
              >
                Connections
              </button>
              <button
                onClick={() => setTab("communities")}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition ${
                  tab === "communities" ? "bg-[#0D1B2A] text-white" : "text-[#64748B] hover:text-[#0D1B2A]"
                }`}
              >
                Communities
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
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
                  filteredConnections.map((req) => {
                    const isPending = loading[req._id];
                    const sentAt = req.createdAt || new Date().toISOString();
                    const allSkills = flattenSkills(req.skills);
                    return (
                      <div
                        key={req._id}
                        className="bg-white border border-[#E8EDF2] rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-[#EDF7F3] flex items-center justify-center text-[#0EA472] font-bold border border-[#A7F3D0] shrink-0">
                              {req.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="m-0 text-[15px] font-semibold text-[#0D1B2A]">{req.username}</h3>
                                {req.position && (
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F8FAFB] text-[#64748B] border border-[#E8EDF2]">
                                    {req.position}
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 mb-0 text-[13px] text-[#64748B] leading-relaxed">
                                {req.about}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] shrink-0">
                            <Clock3 className="w-3.5 h-3.5" />
                            {formatTimeAgo(sentAt)}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {allSkills.slice(0, 6).map((skill) => (
                            <SkillChip key={skill} skill={skill} />
                          ))}
                          {allSkills.length > 6 && (
                            <span className="text-[11px] text-[#64748B]">+{allSkills.length - 6} more</span>
                          )}
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#E8EDF2]">
                          <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                            <ShieldCheck className="w-4 h-4 text-[#0EA472]" />
                            Wants to connect
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => declineRequest(req._id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-[13px] font-medium text-[#0D1B2A] hover:bg-[#F8FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                              {isPending ? "Processing..." : "Decline"}
                            </button>
                            <button
                              onClick={() => approveRequest(req._id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1B2A] text-white text-[13px] font-semibold hover:bg-[#1E3A5F] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-4 h-4" />
                              {isPending ? "Processing..." : "Accept"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState title="No connection requests" description="Try a different search term or switch to communities." />
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
                    const key = `community-${req.userId}-${req.communityId}`;
                    const isPending = loading[key];
                    return (
                      <div
                        key={req.userId}
                        className="bg-white border border-[#E8EDF2] rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-[#EDF7F3] flex items-center justify-center text-[#0EA472] font-bold border border-[#A7F3D0] shrink-0">
                              <img
                              className="w-full h-full rounded-xl"
                               src={req.communityIcon} alt="" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="m-0 text-[15px] font-semibold text-[#0D1B2A]">
                                  {req.username}
                                </h3>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F8FAFB] text-[#64748B] border border-[#E8EDF2]">
                                  Wants to join
                                </span>
                              </div>
                              <p className="mt-2 mb-0 text-[13px] text-[#64748B] leading-relaxed">
                                {req.about}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] shrink-0">
                            <Clock3 className="w-3.5 h-3.5" />
                            {formatTimeAgo(req.sentAt)}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {req.skills.map((skill) => (
                            <SkillChip key={skill} skill={skill} />
                          ))}
                        </div>

                        <div className="mt-5 rounded-2xl bg-[#F8FAFB] border border-[#E8EDF2] p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="m-0 text-[13px] font-semibold text-[#0D1B2A]">
                                {req.communityName}
                              </p>
                              <p className="m-0 mt-1 text-[12px] text-[#64748B]">
                                {req.members.toLocaleString()} members • Community ID: {req.communityId}
                              </p>
                            </div>
                            <Link
                              href={`/community/${req.communityId}`}
                              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0EA472] hover:opacity-80 transition"
                            >
                              View community
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#E8EDF2]">
                          <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                            <ShieldCheck className="w-4 h-4 text-[#0EA472]" />
                            Community member request
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => declineCommunity(req.userId, req.communityId)}
                              disabled={isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-[13px] font-medium text-[#0D1B2A] hover:bg-[#F8FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                              {isPending ? "Processing..." : "Decline"}
                            </button>
                            <button
                              onClick={() => approveCommunity(req.userId, req.communityId)}
                              disabled={isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1B2A] text-white text-[13px] font-semibold hover:bg-[#1E3A5F] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-4 h-4" />
                              {isPending ? "Processing..." : "Approve"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState title="No community requests" description="Try another search term or switch back to connections." />
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}