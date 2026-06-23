// components/chat/ChatHeader.tsx
import { ChevronLeft, Users } from "lucide-react";

interface MemberRef {
  _id?: string;
  username?: string;
}

interface Community {
  _id: string;
  communityName: string;
  file?: string;
  onlineMembers: number;
  totalMembers: number;
}

function Avatar({ name, emoji }: { name: string; emoji?: string | null }) {
  if (emoji && typeof emoji === "string" && emoji.startsWith("http")) {
    return (
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
        <img src={emoji} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }
  if (emoji) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xl">
        {emoji}
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-200 font-medium text-gray-700">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function ChatHeader({
  community,
  onBack,
  onToggleInfo,
}: {
  community: Community;
  onBack: () => void;
  onToggleInfo: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1 text-gray-500 hover:text-gray-700">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <Avatar name={community.communityName} emoji={community.file} />
        <div>
          <h2 className="font-semibold text-gray-900">{community.communityName}</h2>
          <div className="text-xs text-gray-500">
            {community.onlineMembers} online · {community.totalMembers} members
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={onToggleInfo} className="p-2 text-gray-500 hover:text-gray-700">
          <Users className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}