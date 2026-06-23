// components/inbox/RequestCard.tsx
import Link from "next/link";
import { Check, Clock3, ShieldCheck, X, ChevronRight } from "lucide-react";
import { formatTimeAgo, flattenSkills } from "@/app/(main)/inbox/page";
import { ConnectionRequest, CommunityRequest } from "@/app/(main)/inbox/page";

// small inline skill chip
const SkillChip = ({ skill }: { skill: string }) => (
  <span className="px-2.5 py-1 rounded-full bg-[#EDF7F3] text-[#0EA472] text-[11px] font-medium">
    {skill}
  </span>
);

export const RequestCard = ({
  type,
  data,
  isPending,
  onApprove,
  onDecline,
}: {
  type: "connection" | "community";
  data: ConnectionRequest | CommunityRequest;
  isPending: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) => {
  if (type === "connection") {
    const req = data as ConnectionRequest;
    const sentAt = req.createdAt || new Date().toISOString();
    const allSkills = flattenSkills(req.skills);
    return (
      <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow">
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
              <p className="mt-2 mb-0 text-[13px] text-[#64748B] leading-relaxed">{req.about}</p>
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
              onClick={onDecline}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-[13px] font-medium text-[#0D1B2A] hover:bg-[#F8FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              {isPending ? "Processing..." : "Decline"}
            </button>
            <button
              onClick={onApprove}
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
  } else {
    const req = data as CommunityRequest;
    return (
      <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 md:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF7F3] flex items-center justify-center text-[#0EA472] font-bold border border-[#A7F3D0] shrink-0">
              <img className="w-full h-full rounded-xl" src={req.communityIcon} alt="" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="m-0 text-[15px] font-semibold text-[#0D1B2A]">{req.username}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F8FAFB] text-[#64748B] border border-[#E8EDF2]">
                  Wants to join
                </span>
              </div>
              <p className="mt-2 mb-0 text-[13px] text-[#64748B] leading-relaxed">{req.about}</p>
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
              <p className="m-0 text-[13px] font-semibold text-[#0D1B2A]">{req.communityName}</p>
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
              onClick={onDecline}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-[13px] font-medium text-[#0D1B2A] hover:bg-[#F8FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              {isPending ? "Processing..." : "Decline"}
            </button>
            <button
              onClick={onApprove}
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
  }
};