
"use client";

import { useState } from "react";
import { X, LogOut, MoreVertical } from "lucide-react";

import type { Community } from "@/types/community";
import { normalizeId } from "@/types/community";

interface RoomInfoPanelProps {
  community: Community;
  userId: string;
  onClose: () => void;
  onLeave: () => void;
  onMakeAdmin: (id: string) => void;
  onRemoveAdmin: (id: string) => void;
  leaving: boolean;
}

export function RoomInfoPanel({
  community,
  userId,
  onClose,
  onLeave,
  onMakeAdmin,
  onRemoveAdmin,
  leaving,
}: RoomInfoPanelProps) {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const creatorId = normalizeId(community.createdBy);
  const isCreator = creatorId === userId;

  return (
    <div className="flex w-72 flex-col overflow-y-auto border-l border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">Room Info</h3>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Community details */}
        <div className="text-center">
          <div className="mb-2 text-4xl">
            {community.file && community.file.startsWith("http")
              ? "🖼️"
              : community.file || "💬"}
          </div>

          <h4 className="font-bold text-gray-900">
            {community.communityName}
          </h4>

          <div className="mt-1 text-xs text-gray-500">
            {community.onlineMembers} online · {community.totalMembers} members
          </div>
        </div>

        {/* About */}
        {community.about && (
          <div>
            <div className="mb-1 text-xs font-semibold uppercase text-gray-500">
              About
            </div>

            <p className="text-sm text-gray-700">
              {community.about}
            </p>
          </div>
        )}

        {/* Topics */}
        <div>
          <div className="mb-1 text-xs font-semibold uppercase text-gray-500">
            Topics
          </div>

          <div className="flex flex-wrap gap-1.5">
            {community.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Members */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
            Members
          </div>

          <div className="space-y-2">
            {community.joinedMembers.map((member, index) => {
              const id = normalizeId(member);

              const name =
                typeof member === "string"
                  ? "User"
                  : member.username || "User";

              const isAdmin = community.admins.some(
                (admin) => normalizeId(admin) === id
              );

              const memberIsCreator = id === creatorId;

              const canManageMember =
                isCreator &&
                !!id &&
                id !== userId &&
                !memberIsCreator;

              return (
                <div
                  key={id || index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                      {name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {name}
                      </div>

                      <div className="text-xs text-gray-500">
                        {memberIsCreator
                          ? "Creator"
                          : isAdmin
                          ? "Admin"
                          : "Member"}
                      </div>
                    </div>
                  </div>

                  {/* Creator-only admin controls */}
                  {canManageMember && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === id ? null : id
                          )
                        }
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {dropdownOpen === id && (
                        <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-gray-200 bg-white shadow-md">
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

        {/* Leave/Delete */}
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
