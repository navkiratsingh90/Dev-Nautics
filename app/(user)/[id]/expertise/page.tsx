"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, X, ExternalLink, Award,
  Code2, Server, Wrench, Layers, ChevronDown, CheckCircle,
  Sparkles, Shield, Star,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
interface Certification {
  id: number; title: string; issuer: string; date: string;
  description: string; image: string; credentialLink: string; skills: string[];
}
interface SkillsMap { [category: string]: string[]; }

// ─── Mock data ──────────────────────────────────────────────────
const INIT_SKILLS: SkillsMap = {
  frontend:  ["React", "TypeScript", "Tailwind CSS", "Next.js", "Framer Motion", "Redux"],
  backend:   ["Node.js", "Express", "MongoDB", "PostgreSQL", "Redis", "GraphQL"],
  devops:    ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux"],
  tools:     ["Git", "Figma", "VS Code", "Jira", "Storybook", "Jest"],
};

const INIT_CERTS: Certification[] = [
  { id: 1, title: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "March 2023", description: "Expertise in designing distributed systems on AWS — VPCs, IAM, EC2, S3, Lambda, and resilient multi-tier architectures.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80", credentialLink: "https://www.credly.com/badges/example123", skills: ["Cloud Architecture", "AWS Services", "Security", "IAM"] },
  { id: 2, title: "Google Professional Cloud Developer", issuer: "Google Cloud", date: "January 2023", description: "Building and deploying scalable applications on Google Cloud Platform using Kubernetes, App Engine, and Cloud Run.", image: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=600&q=80", credentialLink: "https://www.credential.net/example456", skills: ["Google Cloud", "Kubernetes", "App Engine", "Cloud Run"] },
  { id: 3, title: "React Developer Certification", issuer: "Meta", date: "November 2022", description: "Advanced React concepts — hooks, context API, concurrent mode, performance optimization, and accessibility patterns.", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80", credentialLink: "https://www.coursera.org/account/accomplishments/example789", skills: ["React", "Redux", "Testing", "Performance"] },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  frontend: <Code2 className="w-4 h-4" />,
  backend:  <Server className="w-4 h-4" />,
  devops:   <Layers className="w-4 h-4" />,
  tools:    <Wrench className="w-4 h-4" />,
};

// ─── Simple Modal ───────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
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

// ─── Certification Card (simple) ───────────────────────────────
function CertCard({ cert, onDelete }: { cert: Certification; onDelete: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="relative h-40">
        <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-black/60 text-white">
            {cert.issuer}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <h3 className="text-sm font-bold text-white">{cert.title}</h3>
          <p className="text-xs text-white/70">{cert.date}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {cert.skills.map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{s}</span>
          ))}
        </div>
        <a href={cert.credentialLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <Award className="w-4 h-4" /> View credential <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ─── Skill Chip (with remove button) ───────────────────────────
function SkillChip({ skill, onRemove }: { skill: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm">
      {skill}
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function SkillsCertificationsPage() {
  const [skills, setSkills] = useState<SkillsMap>(INIT_SKILLS);
  const [certs, setCerts] = useState<Certification[]>(INIT_CERTS);
  const [activeTab, setActiveTab] = useState<"skills" | "certifications">("skills");
  const [activeCategory, setActiveCategory] = useState<string>("frontend");
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const [skillForm, setSkillForm] = useState({ category: "frontend", skill: "", action: "add" as "add" | "remove" });
  const [certForm, setCertForm] = useState({
    title: "", issuer: "", date: "", description: "", image: "", credentialLink: "", skills: ""
  });

  const totalSkills = Object.values(skills).flat().length;

  // Skill handlers
  const handleSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { category, skill, action } = skillForm;
    if (!category || !skill.trim()) return;
    setSkills(prev => {
      const updated = { ...prev };
      if (action === "add") {
        if (!updated[category].includes(skill.trim())) updated[category] = [...updated[category], skill.trim()];
      } else {
        updated[category] = updated[category].filter(s => s !== skill.trim());
      }
      return updated;
    });
    setSkillForm(f => ({ ...f, skill: "" }));
    setShowSkillModal(false);
    toast.success(action === "add" ? "Skill added" : "Skill removed");
  };

  // Certification handlers
  const handleCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.title.trim()) return;
    const newCert: Certification = {
      id: Date.now(),
      title: certForm.title,
      issuer: certForm.issuer,
      date: certForm.date,
      description: certForm.description,
      image: certForm.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
      credentialLink: certForm.credentialLink,
      skills: certForm.skills.split(",").map(s => s.trim()).filter(Boolean),
    };
    setCerts([...certs, newCert]);
    setCertForm({ title: "", issuer: "", date: "", description: "", image: "", credentialLink: "", skills: "" });
    setShowCertModal(false);
    toast.success("Certification added");
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Technical expertise & credentials
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Skills & Certifications</h1>
          <p className="text-sm text-gray-500 mt-1">Your complete technical profile — skills you've mastered and credentials you've earned.</p>
        </div>

        {/* Stats row (simple) */}
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalSkills}</div>
            <div className="text-xs text-gray-500">Skills</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{certs.length}</div>
            <div className="text-xs text-gray-500">Certifications</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{Object.keys(skills).length}</div>
            <div className="text-xs text-gray-500">Categories</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("skills")}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === "skills" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Skills
            </button>
            <button
              onClick={() => setActiveTab("certifications")}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === "certifications" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Certifications
            </button>
          </div>
          <button
            onClick={() => activeTab === "skills" ? setShowSkillModal(true) : setShowCertModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Add {activeTab === "skills" ? "Skill" : "Certification"}
          </button>
        </div>

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            {/* Category selector */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(skills).map(([cat, list]) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                    activeCategory === cat
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {CATEGORY_ICONS[cat] ?? <Layers className="w-4 h-4" />}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  <span className="text-xs bg-gray-200 text-gray-700 px-1.5 rounded-full">{list.length}</span>
                </button>
              ))}
            </div>

            {/* Skills display area */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeCategory} skills</h2>
                <button
                  onClick={() => {
                    setSkillForm({ ...skillForm, category: activeCategory, action: "add" });
                    setShowSkillModal(true);
                  }}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Add skill
                </button>
              </div>
              {skills[activeCategory]?.length === 0 ? (
                <p className="text-gray-500 text-sm">No skills in this category yet. Add your first skill.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills[activeCategory].map(skill => (
                    <SkillChip
                      key={skill}
                      skill={skill}
                      onRemove={() => {
                        setSkills(prev => ({
                          ...prev,
                          [activeCategory]: prev[activeCategory].filter(s => s !== skill)
                        }));
                        toast.success("Skill removed");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* All categories overview */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">All categories overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(skills).map(([cat, list]) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 text-left hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-2">
                      {CATEGORY_ICONS[cat] ?? <Layers className="w-4 h-4" />}
                    </div>
                    <p className="font-medium text-gray-900 capitalize">{cat}</p>
                    <p className="text-xs text-gray-500">{list.length} skills</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {list.slice(0, 3).map(s => (
                        <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{s}</span>
                      ))}
                      {list.length > 3 && <span className="text-xs text-gray-400">+{list.length - 3}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === "certifications" && (
          <div>
            {certs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">🏅</div>
                <h3 className="text-lg font-semibold text-gray-900">No certifications yet</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Add your professional certifications to showcase your credentials.</p>
                <button onClick={() => setShowCertModal(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Add certification →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certs.map(cert => (
                  <CertCard key={cert.id} cert={cert} onDelete={() => setCerts(prev => prev.filter(c => c.id !== cert.id))} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skill Modal */}
      {showSkillModal && (
        <Modal title="Manage skills" subtitle="Add or remove skills from a category" onClose={() => setShowSkillModal(false)}>
          <form onSubmit={handleSkillSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                value={skillForm.category}
                onChange={e => setSkillForm(f => ({ ...f, category: e.target.value }))}
              >
                {Object.keys(skills).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill name *</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                placeholder="e.g. React"
                value={skillForm.skill}
                onChange={e => setSkillForm(f => ({ ...f, skill: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSkillForm(f => ({ ...f, action: "add" }))}
                  className={`py-2 rounded-lg text-sm font-medium border ${skillForm.action === "add" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                >
                  ➕ Add
                </button>
                <button
                  type="button"
                  onClick={() => setSkillForm(f => ({ ...f, action: "remove" }))}
                  className={`py-2 rounded-lg text-sm font-medium border ${skillForm.action === "remove" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                >
                  🗑 Remove
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowSkillModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Certification Modal */}
      {showCertModal && (
        <Modal title="Add certification" subtitle="Add a professional credential to your profile" onClose={() => setShowCertModal(false)}>
          <form onSubmit={handleCertSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" value={certForm.title} onChange={e => setCertForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuer *</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" value={certForm.issuer} onChange={e => setCertForm(f => ({ ...f, issuer: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g. March 2024" value={certForm.date} onChange={e => setCertForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none" value={certForm.description} onChange={e => setCertForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover image URL</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="https://..." value={certForm.image} onChange={e => setCertForm(f => ({ ...f, image: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="https://..." value={certForm.credentialLink} onChange={e => setCertForm(f => ({ ...f, credentialLink: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="React, Cloud, Testing" value={certForm.skills} onChange={e => setCertForm(f => ({ ...f, skills: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCertModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">Add certification</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}