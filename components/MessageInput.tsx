// components/chat/MessageInput.tsx
import React, { useRef, useState } from "react";
import { Send, Paperclip, Smile, X, LogOut } from "lucide-react";

const EMOJIS = ["😀", "😂", "🔥", "🎉", "👍", "❤️", "🚀", "✅"];

export function MessageInput({
  isJoined,
  communityName,
  newMessage,
  setNewMessage,
  onSend,
  onJoin,
  onLeave,
  joining,
  leaving,
  sending,
  selectedFile,
  setSelectedFile,
}: {
  isJoined: boolean;
  communityName: string;
  newMessage: string;
  setNewMessage: (v: string) => void;
  onSend: (e: React.FormEvent) => void;
  onJoin: () => void;
  onLeave: () => void;
  joining: boolean;
  leaving: boolean;
  sending: boolean;
  selectedFile: File | null;
  setSelectedFile: (f: File | null) => void;
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  if (!isJoined) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
        <p className="text-sm text-yellow-800">Join this community to send messages.</p>
        <button
          onClick={onJoin}
          disabled={joining}
          className="rounded-lg bg-[#0D1B2A] px-4 py-2 text-sm text-white hover:bg-[#1E3A5F] disabled:opacity-60"
        >
          {joining ? "Joining..." : "Join"}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 p-3">
      {showEmoji && (
        <div className="mb-2 flex gap-2 rounded-lg border border-gray-200 p-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setNewMessage(newMessage + e)}
              className="rounded p-1 text-xl hover:bg-gray-100"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {selectedFile && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <span className="truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={onSend} className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFilePick}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <Smile className="h-4 w-4" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${communityName}`}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA472]"
        />
        <button
          type="submit"
          disabled={sending || (!newMessage.trim() && !selectedFile)}
          className="rounded-lg bg-[#0D1B2A] p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onLeave}
          disabled={leaving}
          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
          title="Leave room"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}