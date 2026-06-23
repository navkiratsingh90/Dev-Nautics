"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import axios from "axios";
import {
  Plus,
  Trash2,
  X,
  Code2,
  Server,
  Wrench,
  Layers,
  Sparkles,
} from "lucide-react";
import { ISkills } from "@/types/User";

// ─── Types ──────────────────────────────────────────────────────────────────
type SkillsMap = ISkills;

// ─── Helpers / Components ───────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SkillChip({ skill, onRemove }: { skill: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm">
      {skill}
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  frontend: <Code2 className="w-4 h-4" />,
  backend: <Server className="w-4 h-4" />,
  devops: <Layers className="w-4 h-4" />,
  tools: <Wrench className="w-4 h-4" />,
  frameworks: <Layers className="w-4 h-4" />,
  libraries: <Layers className="w-4 h-4" />,
  languages: <Layers className="w-4 h-4" />,
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SkillsPage() {
  const params = useParams();
  const userId = params?.id as string; // route /profile/[id]/expertise

  const currentUser = useAppSelector((state: any) => state.User.userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Skills state ----
  const [skills, setSkills] = useState<SkillsMap>({
    frontend: [],
    backend: [],
    tools: [],
    frameworks: [],
    libraries: [],
    languages: [],
  });

  // ---- UI state ----
  const [activeCategory, setActiveCategory] = useState<keyof SkillsMap>("frontend");
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [skillForm, setSkillForm] = useState({
    category: "frontend",
    skill: "",
    action: "add" as "add" | "remove",
  });

  // Determine if the viewed profile belongs to the logged‑in user
  const isOwn = currentUser && currentUser._id === userId;

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    const fetchSkills = async () => {
      try {
        const skillsRes = await axios.get(`/api/user/${userId}`);
        const skillsData = skillsRes.data.user.skills || {};
        setSkills({
          frontend: skillsData.frontend || [],
          backend: skillsData.backend || [],
          tools: skillsData.tools || [],
          frameworks: skillsData.frameworks || [],
          libraries: skillsData.libraries || [],
          languages: skillsData.languages || [],
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [userId]);

  // ── Skill API helpers ──────────────────────────────────────────────────────
  const updateSkillsState = (nextSkills: SkillsMap) => {
    setSkills({
      frontend: nextSkills.frontend || [],
      backend: nextSkills.backend || [],
      tools: nextSkills.tools || [],
      frameworks: nextSkills.frameworks || [],
      libraries: nextSkills.libraries || [],
      languages: nextSkills.languages || [],
    });
  };

  const handleSkillApi = async (
    action: "add" | "remove",
    category: keyof SkillsMap,
    skill: string
  ) => {
    const normalizedSkill = skill.trim();
    if (!normalizedSkill) return;

    try {
      const { data } =
        action === "add"
          ? await axios.post(`/api/user/skills`, {
              category,
              skill: normalizedSkill,
            })
          : await axios.delete(`/api/user/skills`, {
              data: { category, skill: normalizedSkill },
            });

      toast.success(data.message);
      if (data.skills) updateSkillsState(data.skills);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message);
      return false;
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await handleSkillApi(
      skillForm.action,
      skillForm.category as keyof SkillsMap,
      skillForm.skill
    );
    if (ok) {
      setSkillForm({ ...skillForm, skill: "" });
      setShowSkillModal(false);
    }
  };

  const handleRemoveSkill = async (category: keyof SkillsMap, skill: string) => {
    await handleSkillApi("remove", category, skill);
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const totalSkills = Object.values(skills).flat().length;

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Technical expertise
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isOwn
              ? "Your complete technical profile — skills you've mastered."
              : "Technical skills"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalSkills}</div>
            <div className="text-xs text-gray-500">Skills</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(skills).length}
            </div>
            <div className="text-xs text-gray-500">Categories</div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex gap-1">
            {/* only one tab now, so just a label */}
            <span className="px-4 py-2 text-sm font-medium text-gray-900">
              Skills
            </span>
          </div>

          {isOwn && (
            <button
              onClick={() => setShowSkillModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          )}
        </div>

        {/* Skills content */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {Object.entries(skills).map(([cat, list]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as keyof SkillsMap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {CATEGORY_ICONS[cat] ?? <Layers className="w-4 h-4" />}
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className="text-xs bg-gray-200 text-gray-700 px-1.5 rounded-full">
                  {list.length}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {activeCategory} skills
              </h2>
              {isOwn && (
                <button
                  onClick={() => {
                    setSkillForm({
                      ...skillForm,
                      category: activeCategory,
                      action: "add",
                    });
                    setShowSkillModal(true);
                  }}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Add skill
                </button>
              )}
            </div>

            {skills[activeCategory]?.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {isOwn
                  ? "No skills in this category yet. Add your first skill."
                  : "No skills listed in this category."}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills[activeCategory]?.map((skill) => (
                  <SkillChip
                    key={skill}
                    skill={skill}
                    onRemove={
                      isOwn ? () => handleRemoveSkill(activeCategory, skill) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              All categories overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(skills).map(([cat, list]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as keyof SkillsMap)}
                  className="bg-white border border-gray-200 rounded-2xl p-4 text-left hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-2">
                    {CATEGORY_ICONS[cat] ?? <Layers className="w-4 h-4" />}
                  </div>
                  <p className="font-medium text-gray-900 capitalize">{cat}</p>
                  <p className="text-xs text-gray-500">{list.length} skills</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {list.slice(0, 3).map((s: any) => (
                      <span
                        key={s}
                        className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                      >
                        {s}
                      </span>
                    ))}
                    {list.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{list.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Modal */}
      {showSkillModal && (
        <Modal
          title="Manage skills"
          subtitle="Add or remove skills from a category"
          onClose={() => setShowSkillModal(false)}
        >
          <form onSubmit={handleSkillSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                value={skillForm.category}
                onChange={(e) =>
                  setSkillForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {Object.keys(skills).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill name *
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                placeholder="e.g. React"
                value={skillForm.skill}
                onChange={(e) =>
                  setSkillForm((f) => ({ ...f, skill: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSkillForm((f) => ({ ...f, action: "add" }))}
                  className={`py-2 rounded-lg text-sm font-medium border ${
                    skillForm.action === "add"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  ➕ Add
                </button>
                <button
                  type="button"
                  onClick={() => setSkillForm((f) => ({ ...f, action: "remove" }))}
                  className={`py-2 rounded-lg text-sm font-medium border ${
                    skillForm.action === "remove"
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  🗑 Remove
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSkillModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}