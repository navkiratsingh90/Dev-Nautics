// components/community/DiscussionCard.tsx
import Link from "next/link";
// import { timeAgo } from "@/lib/community-helpers"; // we'll keep helpers inline, so we'll just copy the function

// Helper copy (or import if you move to a shared file)
function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface Discussion {
  _id: string;
  communityName: string;
  slug: string;
  totalMembers: number;
  createdBy: string | { _id: string; username: string; email?: string };
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

export function DiscussionCard({
  discussion,
  userId,
  onJoin,
}: {
  discussion: Discussion;
  userId: string;
  onJoin: (id: string) => void;
}) {
  const createdByName =
    typeof discussion.createdBy === "object"
      ? discussion.createdBy.username
      : "Unknown";

  const hasImage =
    typeof discussion.file === "string" &&
    discussion.file.trim().startsWith("http");

  const isJoined = discussion.joinedMembers.some(
    (m) => String(m) === userId
  );
  const isPending = discussion.pendingRequests.some(
    (m) => String(m) === userId
  );

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

            {isJoined ? (
              <Link href={`/community/${discussion._id}`}>
                <span className="rounded-lg bg-[#0D1B2A] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1E3A5F]">
                  Enter →
                </span>
              </Link>
            ) : isPending ? (
              <button
                disabled
                className="rounded-lg border border-[#E8EDF2] px-4 py-1.5 text-sm font-medium text-gray-400"
              >
                sent
              </button>
            ) : (
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