// components/community/DiscussionsHeader.tsx
import { Search, Plus } from "lucide-react";

export function DiscussionsHeader({
  totalOnline,
  joinedCount,
  activeTab,
  setActiveTab,
  search,
  setSearch,
  onOpenCreate,
}: {
  totalOnline: number;
  joinedCount: number;
  activeTab: "all" | "joined" | "trending";
  setActiveTab: (tab: "all" | "joined" | "trending") => void;
  search: string;
  setSearch: (v: string) => void;
  onOpenCreate: () => void;
}) {
  return (
    <>
      {/* Top header */}
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

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-30 border-b border-[#E8EDF2] bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {[
              { key: "all", label: "All" },
              { key: "joined", label: `Joined (${joinedCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "all" | "joined")}
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
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 rounded-lg bg-[#0D1B2A] px-4 py-2 text-sm text-white hover:bg-[#1E3A5F]"
          >
            <Plus className="h-4 w-4" /> Create Room
          </button>
        </div>
      </div>
    </>
  );
}