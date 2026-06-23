// components/chat/RoomInfoPanel.tsx
import { useAppSelector } from "@/redux/hooks";
import { X, LogOut, MoreVertical } from "lucide-react";
import { useState } from "react";

interface MemberRef {
  _id?: string;
  username?: string;
}

interface Community {
  _id: string;
  communityName: string;
  file?: string;
  about?: string;
  topics: string[];
  onlineMembers: number;
  totalMembers: number;
  createdBy: MemberRef;
  joinedMembers: MemberRef[];
  admins: MemberRef[];
}

function normalizeId(value: MemberRef | undefined | null): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
}

export function RoomInfoPanel({
  community,
  userId,
  onClose,
  onLeave,
  onMakeAdmin,
  onRemoveAdmin,
  leaving,
}: {
  community: Community;
  userId: string;
  onClose: () => void;
  onLeave: () => void;
  onMakeAdmin: (id: string) => void;
  onRemoveAdmin: (id: string) => void;
  leaving: boolean;
}) {
	const userData = useAppSelector((state) => state.User.userData)
  const creatorId = normalizeId(community.createdBy);
  const isCreator = creatorId === userId;
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  return (
    <div className="flex w-72 flex-col overflow-y-auto border-l border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">Room Info</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Community details */}
        <div className="text-center">
          <div className="mb-2 text-4xl">
            {community.file && community.file.startsWith("http") ? "🖼️" : community.file || "💬"}
          </div>
          <h4 className="font-bold text-gray-900">{community.communityName}</h4>
          <div className="mt-1 text-xs text-gray-500">
            {community.onlineMembers} online · {community.totalMembers} members
          </div>
        </div>

        {community.about && (
          <div>
            <div className="mb-1 text-xs font-semibold uppercase text-gray-500">About</div>
            <p className="text-sm text-gray-700">{community.about}</p>
          </div>
        )}

        <div>
          <div className="mb-1 text-xs font-semibold uppercase text-gray-500">Topics</div>
          <div className="flex flex-wrap gap-1.5">
            {community.topics.map((t) => (
              <span key={t} className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Members list with admin controls */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Members</div>
          <div className="space-y-2">
            {community.joinedMembers.map((m) => {
              const id = normalizeId(m);
              const name = typeof m === "string" ? "User" : m.username || "User";
              const isAdmin = community.admins.some((a) => normalizeId(a) === id);
              const isCreator = id === creatorId;

              return (
                <div key={id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{name}</div>
                      <div className="text-xs text-gray-500">
                        {isCreator ? "Creator" : isAdmin ? "Admin" : "Member"}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown for creator only */}
                  {community.createdBy._id?.toString() == userData?._id.toString() && m._id != userData?._id && (
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === id ? null : id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {dropdownOpen === id && (
                        <div className="absolute right-0 mt-1 w-36 rounded-md border border-gray-200 bg-white shadow-md z-10">
                          {isAdmin ? (
                            <button
                              onClick={() => {
                                onRemoveAdmin(id);
                                setDropdownOpen(null);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onMakeAdmin(id);
                                setDropdownOpen(null);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Make Admin
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave/Delete button */}
        <div className="space-y-2">
          <button
            onClick={onLeave}
            disabled={leaving}
            className="flex w-full items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {isCreator ? "Delete Community" : "Leave Room"}
          </button>
        </div>
      </div>
    </div>
  );
}