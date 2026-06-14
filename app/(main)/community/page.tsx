"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, X, Users, MessageCircle, Plus } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────
interface Discussion {
  _id: string;
  groupName: string;
  totalMembers: number;
  onlineMembers: number;
  createdBy: { _id: string; name: string };
  file?: string;
  about?: string;
  topics: string[];
  createdAt: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────
const MOCK_DISCUSSIONS: Discussion[] = [
  { _id: "1", groupName: "React & Next.js Builders", totalMembers: 4821, onlineMembers: 312, createdBy: { _id: "u1", name: "Navkirat" }, file: "⚛️", about: "Deep dives into React patterns, server components, hydration quirks.", topics: ["React", "Next.js", "TypeScript"], createdAt: "2024-01-10T10:00:00Z" },
  { _id: "2", groupName: "Systems & Rust Enthusiasts", totalMembers: 2130, onlineMembers: 98, createdBy: { _id: "u2", name: "Alex Kim" }, file: "🦀", about: "Low-level programming, memory safety, Rust ownership model.", topics: ["Rust", "C++", "WASM"], createdAt: "2024-02-03T08:00:00Z" },
  { _id: "3", groupName: "ML & AI Practitioners", totalMembers: 6500, onlineMembers: 540, createdBy: { _id: "u3", name: "Sophie Zhang" }, file: "🤖", about: "Cutting-edge ML research, fine-tuning LLMs, RAG pipelines.", topics: ["Python", "PyTorch", "LLM"], createdAt: "2024-01-20T12:00:00Z" },
  { _id: "4", groupName: "Web3 & Solidity Devs", totalMembers: 1870, onlineMembers: 75, createdBy: { _id: "u4", name: "Marcus Lee" }, file: "🔗", about: "Smart contracts, DeFi protocols, NFT standards.", topics: ["Solidity", "Ethereum", "Hardhat"], createdAt: "2024-03-01T09:00:00Z" },
  { _id: "5", groupName: "DevOps & Cloud Architects", totalMembers: 3200, onlineMembers: 187, createdBy: { _id: "u5", name: "Priya Sharma" }, file: "☁️", about: "Kubernetes, Terraform, CI/CD pipelines, observability.", topics: ["Kubernetes", "AWS", "Terraform"], createdAt: "2024-01-15T11:00:00Z" },
];

const ALL_TOPICS = ["React", "Next.js", "TypeScript", "Rust", "Python", "PyTorch", "Solidity", "Kubernetes", "AWS"];

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Components ──────────────────────────────────────────────────────
function DiscussionCard({ discussion, isJoined, onJoin }: { discussion: Discussion; isJoined: boolean; onJoin: (id: string) => void }) {
  return (
    <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl shrink-0">
          {discussion.file ?? "💬"}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-[#0D1B2A]">{discussion.groupName}</h3>
              <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> {discussion.onlineMembers} online</span>
                <span>•</span>
                <span>{discussion.totalMembers} members</span>
                <span>•</span>
                <span>Created {timeAgo(discussion.createdAt)}</span>
              </div>
            </div>
          </div>
          {discussion.about && <p className="text-sm text-[#64748B] mt-2">{discussion.about}</p>}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {discussion.topics.slice(0, 3).map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8EDF2]">
            <div className="text-xs text-[#64748B]">Created by {discussion.createdBy.name}</div>
            {isJoined ? (
              <Link href={`/chatrooms/${discussion._id}`}>
                <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">Enter →</button>
              </Link>
            ) : (
              <button onClick={() => onJoin(discussion._id)} className="px-4 py-1.5 rounded-lg text-sm font-medium border border-[#E8EDF2] text-[#0D1B2A] hover:bg-gray-50">+ Join</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (g: Partial<Discussion>) => void }) {
  const [form, setForm] = useState({ groupName: "", about: "", file: "", topics: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.groupName.trim()) { setError("Group name required"); return; }
    onCreate({
      _id: Date.now().toString(),
      groupName: form.groupName,
      about: form.about,
      file: form.file || "💬",
      topics: form.topics.split(",").map(t => t.trim()).filter(Boolean),
      totalMembers: 1,
      onlineMembers: 1,
      createdBy: { _id: "me", name: "You" },
      createdAt: new Date().toISOString(),
    });
    onClose();
    toast.success("Room created!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-[#E8EDF2]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8EDF2]">
          <h2 className="text-lg font-bold text-[#0D1B2A]">Create a chatroom</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Icon (emoji or URL)</label>
            <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-lg" value={form.file} onChange={e => setForm(f => ({ ...f, file: e.target.value }))} placeholder="🚀" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Room name *</label>
            <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-lg" value={form.groupName} onChange={e => { setForm(f => ({ ...f, groupName: e.target.value })); setError(""); }} required />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 border border-[#E8EDF2] rounded-lg resize-none" value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0D1B2A] mb-1">Topics (comma separated)</label>
            <input className="w-full px-3 py-2 border border-[#E8EDF2] rounded-lg" placeholder="React, Next.js" value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#E8EDF2] text-[#64748B] hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]">Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>(MOCK_DISCUSSIONS);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"members" | "online" | "newest">("online");
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set(["1", "3"]));
  const [activeTab, setActiveTab] = useState<"all" | "joined" | "trending">("all");
  const [showModal, setShowModal] = useState(false);

  const totalOnline = discussions.reduce((s, d) => s + d.onlineMembers, 0);
  const totalMembers = discussions.reduce((s, d) => s + d.totalMembers, 0);

  const filtered = discussions
    .filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.groupName.toLowerCase().includes(q) || d.about?.toLowerCase().includes(q) || d.topics.some(t => t.toLowerCase().includes(q));
      const matchTopic = !selectedTopic || d.topics.includes(selectedTopic);
      const matchTab = activeTab === "all" ? true : activeTab === "joined" ? joinedIds.has(d._id) : d.onlineMembers > 150;
      return matchSearch && matchTopic && matchTab;
    })
    .sort((a, b) => {
      if (sortBy === "members") return b.totalMembers - a.totalMembers;
      if (sortBy === "online") return b.onlineMembers - a.onlineMembers;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleJoin = (id: string) => {
    setJoinedIds(prev => new Set(prev).add(id));
    toast.success("Joined room!");
  };

  return (
    <div className="bg-[#F8FAFB] min-h-screen font-sans">
      {/* Header */}
      <div className="border-b border-[#E8EDF2] bg-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#EDF7F3] border border-[#A7F3D0] rounded-full px-3 py-1 text-xs text-[#047857] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {totalOnline} developers online
          </div>
          <h1 className="text-3xl font-bold text-[#0D1B2A]">Join the <span className="text-[#0EA472]">Community</span></h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-xl">Topic-based chatrooms for every tech stack. Find your community, share knowledge, and build in public.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E8EDF2] px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: "all", label: "All" },
              { key: "joined", label: `Joined (${joinedIds.size})` },
              { key: "trending", label: "Trending" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === tab.key ? "bg-white text-[#0D1B2A] shadow-sm" : "text-[#64748B] hover:bg-gray-200"}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search rooms, topics..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-[#E8EDF2] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA472]" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-3 py-2 border border-[#E8EDF2] rounded-lg text-sm bg-white">
            <option value="online">By online</option>
            <option value="members">By members</option>
            <option value="newest">Newest</option>
          </select>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D1B2A] text-white text-sm hover:bg-[#1E3A5F]"><Plus className="w-4 h-4" /> Create Room</button>
        </div>

        {/* Topic pills */}
        <div className="max-w-7xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setSelectedTopic(null)} className={`shrink-0 text-xs px-3 py-1 rounded-full border ${!selectedTopic ? "bg-[#0D1B2A] text-white border-[#0D1B2A]" : "bg-white text-[#64748B] border-[#E8EDF2] hover:bg-gray-50"}`}>All topics</button>
          {ALL_TOPICS.map(t => (
            <button key={t} onClick={() => setSelectedTopic(selectedTopic === t ? null : t)} className={`shrink-0 text-xs px-3 py-1 rounded-full border ${selectedTopic === t ? "bg-[#0D1B2A] text-white border-[#0D1B2A]" : "bg-white text-[#64748B] border-[#E8EDF2] hover:bg-gray-50"}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-4 text-sm text-[#64748B]">Showing {filtered.length} rooms{selectedTopic && ` in ${selectedTopic}`}</div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E8EDF2] rounded-2xl">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-semibold text-[#0D1B2A]">No rooms found</h3>
            <p className="text-sm text-[#64748B] mt-1">Try a different search or create your own room.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2 rounded-lg bg-[#0D1B2A] text-white text-sm">Create a room →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(d => (
              <DiscussionCard key={d._id} discussion={d} isJoined={joinedIds.has(d._id)} onJoin={handleJoin} />
            ))}
          </div>
        )}
      </div>

      {/* Trending topics / Most active sidebar (simplified) */}
      <div className="border-t border-[#E8EDF2] bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-4">🔥 Trending topics</h2>
              <div className="flex flex-wrap gap-2">
                {ALL_TOPICS.map(t => {
                  const count = discussions.filter(d => d.topics.includes(t)).length;
                  return (
                    <button key={t} onClick={() => { setSelectedTopic(t); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-3 py-1.5 rounded-full border border-[#E8EDF2] text-sm text-[#0D1B2A] hover:bg-gray-50">
                      {t} {count > 0 && <span className="text-xs text-[#64748B] ml-1">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-4">⚡ Most active</h2>
              <div className="space-y-3">
                {[...discussions].sort((a, b) => b.onlineMembers - a.onlineMembers).slice(0, 5).map((d, i) => (
                  <div key={d._id} className="flex items-center gap-3 p-3 border border-[#E8EDF2] rounded-xl">
                    <span className="w-6 text-center font-medium text-gray-500">{i + 1}</span>
                    <span className="text-xl">{d.file ?? "💬"}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#0D1B2A]">{d.groupName}</p>
                      <p className="text-xs text-[#64748B]">{d.onlineMembers} online</p>
                    </div>
                    {!joinedIds.has(d._id) && (
                      <button onClick={() => handleJoin(d._id)} className="text-xs px-3 py-1 rounded-full border border-[#E8EDF2] text-[#0D1B2A] hover:bg-gray-50">Join</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && <CreateModal onClose={() => setShowModal(false)} onCreate={g => setDiscussions(prev => [{ ...g, _id: g._id!, totalMembers: 1, onlineMembers: 1, createdBy: { _id: "me", name: "You" }, createdAt: new Date().toISOString() } as Discussion, ...prev])} />}
    </div>
  );
}