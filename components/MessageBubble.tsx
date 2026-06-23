// components/chat/MessageBubble.tsx
import { Check, CheckCheck, Copy, File, Download } from "lucide-react";

interface MemberRef {
  _id?: string;
  username?: string;
}

interface Message {
  _id: string;
  senderId: MemberRef;
  text: string;
  type: "text" | "media" | "file";
  file?: string | null;
  fileMeta?: {
    url: string;
    mimeType: string;
    name: string;
    size: number;
  };
  isDelivered?: boolean;
  isRead?: boolean;
  createdAt: string;
  isMe?: boolean;
}

function normalizeId(value: MemberRef | undefined | null): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
}

function getSenderName(sender: MemberRef) {
  if (typeof sender === "string") return "User";
  return sender.username || "User";
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
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

export function MessageBubble({ msg, showSender, onCopy }: { msg: Message; showSender: boolean; onCopy: (t: string) => void }) {
  const senderName = getSenderName(msg.senderId);

  return (
    <div className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!msg.isMe && <Avatar name={senderName} />}
      <div className={`max-w-[75%] ${msg.isMe ? "items-end" : "items-start"}`}>
        {!msg.isMe && showSender && (
          <div className="mb-1 ml-1 text-xs font-medium text-[#0EA472]">{senderName}</div>
        )}
        <div className="flex items-end gap-1">
          {msg.isMe && (
            <button onClick={() => onCopy(msg.text)} className="text-gray-400 hover:text-gray-600" type="button">
              <Copy className="h-3 w-3" />
            </button>
          )}
          <div
            className={`rounded-2xl px-3 py-2 ${
              msg.isMe
                ? "rounded-br-sm bg-[#0D1B2A] text-white"
                : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
            }`}
          >
            {msg.type === "file" && (msg.fileMeta?.url || msg.file) ? (
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">{msg.fileMeta?.name || "Attachment"}</div>
                  <div className={`text-xs ${msg.isMe ? "text-white/60" : "text-gray-400"}`}>
                    {msg.fileMeta?.size ? fmtSize(msg.fileMeta.size) : "File"}
                  </div>
                </div>
                <a
                  href={msg.fileMeta?.url || msg.file || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm">{msg.text}</p>
            )}
            <div className={`mt-1 flex justify-end gap-1 text-[10px] ${msg.isMe ? "text-white/50" : "text-gray-400"}`}>
              <span>{fmtTime(msg.createdAt)}</span>
              {msg.isMe && (msg.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
            </div>
          </div>
          {!msg.isMe && (
            <button onClick={() => onCopy(msg.text)} className="text-gray-400 hover:text-gray-600" type="button">
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}