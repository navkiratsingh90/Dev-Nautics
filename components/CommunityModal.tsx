// app/community/page.tsx
"use client";

import { useEffect, useState } from "react";
import {  X  } from "lucide-react";


// ─── Types (aligned with Community model) ──────────────────────────



// ─── Create Modal (kept inline, as it's only used here) ────────────
export function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    communityName: string;
    about: string;
    topics: string;
    file: File | null;
  }) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    communityName: "",
    about: "",
    topics: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] || null;
    setFile(picked);

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (picked) {
      setPreviewUrl(URL.createObjectURL(picked));
    } else {
      setPreviewUrl("");
    }
  };

  const handleSubmit = async () => {
    if (!form.communityName.trim()) {
      setError("Community name is required");
      return;
    }

    try {
      setSubmitting(true);
      const ok = await onCreate({
        communityName: form.communityName.trim(),
        about: form.about.trim(),
        topics: form.topics.trim(),
        file,
      });

      if (ok) {
        setForm({
          communityName: "",
          about: "",
          topics: "",
        });
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#E8EDF2] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E8EDF2] px-6 py-4">
          <h2 className="text-lg font-bold text-[#0D1B2A]">
            Create a Community
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
              Cover image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2"
            />
            {previewUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-[#E8EDF2]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-40 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
              Community Name *
            </label>
            <input
              className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              value={form.communityName}
              onChange={(e) => {
                setForm((f) => ({ ...f, communityName: e.target.value }));
                setError("");
              }}
              placeholder="React Developers"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              value={form.about}
              onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
              placeholder="What is this community about?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
              Topics (comma separated)
            </label>
            <input
              className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              placeholder="React, Next.js, TypeScript"
              value={form.topics}
              onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#E8EDF2] py-2 text-[#64748B] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#0D1B2A] py-2 text-white hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}