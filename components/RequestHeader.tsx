// components/inbox/RequestsHeader.tsx
import { Search } from "lucide-react";
import { RequestTab } from "@/app/(main)/inbox/page";  // you can inline the type if you want

export const RequestsHeader = ({
  totalRequests,
  connectionCount,
  communityCount,
  search,
  setSearch,
  tab,
  setTab,
}: {
  totalRequests: number;
  connectionCount: number;
  communityCount: number;
  search: string;
  setSearch: (v: string) => void;
  tab: RequestTab;
  setTab: (v: RequestTab) => void;
}) => (
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
          <div className="text-[22px] font-bold">{connectionCount}</div>
        </div>
        <div className="rounded-2xl border border-[#E8EDF2] bg-[#F8FAFB] p-4">
          <div className="text-[11px] text-[#94A3B8] mb-1">Communities</div>
          <div className="text-[22px] font-bold">{communityCount}</div>
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
);