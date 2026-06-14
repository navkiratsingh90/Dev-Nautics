"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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

// --- Types ---
interface ConnectionRequest {
  id: string;
  username: string;
  about: string;
  skills: string[];
  mutual: number;
  sentAt: string;
}

interface CommunityRequest {
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

const connectionRequests: ConnectionRequest[] = [
  {
    id: "1",
    username: "Arjun Mehta",
    about: "Full-stack developer building scalable products with React and Node.js.",
    skills: ["React", "Node.js", "TypeScript"],
    mutual: 12,
    sentAt: "2026-06-14T18:20:00Z",
  },
  {
    id: "2",
    username: "Sarah Chen",
    about: "Machine learning engineer interested in AI tools, product design, and collaboration.",
    skills: ["Python", "ML", "FastAPI"],
    mutual: 8,
    sentAt: "2026-06-14T10:05:00Z",
  },
  {
    id: "3",
    username: "Priya Sharma",
    about: "Frontend developer who loves clean UI, design systems, and hackathons.",
    skills: ["Next.js", "Tailwind CSS", "UI/UX"],
    mutual: 5,
    sentAt: "2026-06-13T14:45:00Z",
  },
];

const communityRequests: CommunityRequest[] = [
  {
    userId: "u1",
    username: "Marcus Johnson",
    about: "Open-source contributor wanting to join an active build community.",
    skills: ["Go", "CLI Tools", "Open Source"],
    communityId: "c1",
    communityName: "Dev Builders Hub",
    communityIcon: "DB",
    members: 1240,
    sentAt: "2026-06-14T16:10:00Z",
  },
  {
    userId: "u2",
    username: "Aanya Singh",
    about: "Student developer learning web development and looking for guidance.",
    skills: ["HTML", "CSS", "JavaScript"],
    communityId: "c2",
    communityName: "Frontend Circle",
    communityIcon: "FC",
    members: 860,
    sentAt: "2026-06-13T08:30:00Z",
  },
];

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

const RequestCard = ({
  title,
  subtitle,
  about,
  skills,
  metaLeft,
  metaRight,
  badge,
}: {
  title: string;
  subtitle: string;
  about: string;
  skills: string[];
  metaLeft: string;
  metaRight: string;
  badge: React.ReactNode;
}) => (
  <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-[#EDF7F3] flex items-center justify-center text-[#0EA472] font-bold border border-[#A7F3D0] shrink-0">
          {badge}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="m-0 text-[15px] font-semibold text-[#0D1B2A]">{title}</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F8FAFB] text-[#64748B] border border-[#E8EDF2]">
              {subtitle}
            </span>
          </div>
          <p className="mt-2 mb-0 text-[13px] text-[#64748B] leading-relaxed">
            {about}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] shrink-0">
        <Clock3 className="w-3.5 h-3.5" />
        {metaLeft}
      </div>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      {skills.map((skill) => (
        <SkillChip key={skill} skill={skill} />
      ))}
    </div>

    <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#E8EDF2]">
      <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
        <ShieldCheck className="w-4 h-4 text-[#0EA472]" />
        {metaRight}
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-[13px] font-medium text-[#0D1B2A] hover:bg-[#F8FAFB] transition">
          <X className="w-4 h-4" />
          Decline
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1B2A] text-white text-[13px] font-semibold hover:bg-[#1E3A5F] transition">
          <Check className="w-4 h-4" />
          Accept
        </button>
      </div>
    </div>
  </div>
);

export default function InboxRequestsPage() {
  const [tab, setTab] = useState<RequestTab>("connections");
  const [search, setSearch] = useState("");

  const filteredConnections = useMemo(() => {
    return connectionRequests.filter((req) => {
      const haystack = `${req.username} ${req.about} ${req.skills.join(" ")}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [search]);

  const filteredCommunities = useMemo(() => {
    return communityRequests.filter((req) => {
      const haystack = `${req.username} ${req.about} ${req.skills.join(" ")} ${req.communityName}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [search]);

  const totalRequests = connectionRequests.length + communityRequests.length;

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
                <div className="text-[22px] font-bold">{connectionRequests.length}</div>
              </div>
              <div className="rounded-2xl border border-[#E8EDF2] bg-[#F8FAFB] p-4">
                <div className="text-[11px] text-[#94A3B8] mb-1">Communities</div>
                <div className="text-[22px] font-bold">{communityRequests.length}</div>
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
                  filteredConnections.map((req) => (
                    <RequestCard
                      key={req.id}
                      title={req.username}
                      subtitle={`@${req.username.toLowerCase().replace(/\s+/g, "")}`}
                      about={req.about}
                      skills={req.skills}
                      metaLeft={formatTimeAgo(req.sentAt)}
                      metaRight={`${req.mutual} mutual connection${req.mutual !== 1 ? "s" : ""}`}
                      badge={req.username.slice(0, 2).toUpperCase()}
                    />
                  ))
                ) : (
                  <EmptyState title="No matching connection requests" description="Try a different search term or switch to communities." />
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
                  filteredCommunities.map((req) => (
                    <div
                      key={req.userId}
                      className="bg-white border border-[#E8EDF2] rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-[#EDF7F3] flex items-center justify-center text-[#0EA472] font-bold border border-[#A7F3D0] shrink-0">
                            {req.communityIcon}
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
                            href={`/communities/${req.communityId}`}
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
                          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-[13px] font-medium text-[#0D1B2A] hover:bg-[#F8FAFB] transition">
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </button>
                          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1B2A] text-white text-[13px] font-semibold hover:bg-[#1E3A5F] transition">
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No matching community requests" description="Try another search term or switch back to connections." />
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-[#E8EDF2] rounded-2xl p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EDF7F3] border border-[#A7F3D0] text-[#0EA472] flex items-center justify-center mb-4">
        <Search className="w-6 h-6" />
      </div>
      <h3 className="m-0 text-[18px] font-bold text-[#0D1B2A]">{title}</h3>
      <p className="m-0 mt-2 text-[13px] text-[#64748B]">{description}</p>
    </div>
  );
}
