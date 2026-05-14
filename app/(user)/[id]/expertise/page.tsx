"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  Plus, Pencil, Trash2, X, ExternalLink, Award,
  Code2, Server, Wrench, Layers, ChevronDown, CheckCircle,
  Sparkles, Shield, Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Certification {
  id: number; title: string; issuer: string; date: string;
  description: string; image: string; credentialLink: string; skills: string[];
}
interface SkillsMap { [category: string]: string[]; }

// ─── Mock data ────────────────────────────────────────────────────────────────
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

const CATEGORY_COLORS: Record<string, { gradient: string; dark: string; light: string }> = {
  frontend: { gradient: "from-violet-500 to-fuchsia-500", dark: "bg-violet-500/15 text-violet-400 border-violet-500/30",  light: "bg-violet-50 text-violet-600 border-violet-200"  },
  backend:  { gradient: "from-cyan-500 to-blue-500",      dark: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",        light: "bg-cyan-50 text-cyan-600 border-cyan-200"        },
  devops:   { gradient: "from-fuchsia-500 to-pink-500",   dark: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",light:"bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200"},
  tools:    { gradient: "from-amber-500 to-orange-500",   dark: "bg-amber-500/15 text-amber-400 border-amber-500/30",     light: "bg-amber-50 text-amber-600 border-amber-200"     },
};

const avatarGradients = [
  "from-violet-500 to-fuchsia-500","from-cyan-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",  "from-amber-500 to-orange-500",
];

function useInView(t = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: t });
    o.observe(el); return () => o.disconnect();
  }, [t]);
  return { ref, inView: v };
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ darkMode, title, subtitle, onClose, children }: {
  darkMode: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === ref.current) onClose(); }}>
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
        style={{ animation: "slideUp 0.22s ease both" }}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div>
            <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h2>
            {subtitle && <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Certification Card ───────────────────────────────────────────────────────
function CertCard({ cert, darkMode, idx, onDelete }: {
  cert: Certification; darkMode: boolean; idx: number; onDelete: () => void;
}) {
  const { ref, inView } = useInView();
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const cardBg  = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText  = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white"  : "text-gray-900";

  return (
    <div ref={ref}
      className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${cardBg} ${darkMode ? "hover:border-violet-500/40 hover:shadow-violet-500/5" : "hover:border-violet-300 hover:shadow-violet-100"}`}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(28px)", transition: `opacity .55s ease ${idx * .1}s, transform .55s ease ${idx * .1}s, box-shadow .2s, border-color .2s` }}>

      {/* Gradient accent top */}
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Image + issuer overlay */}
      <div className="relative h-44 overflow-hidden">
        <img src={cert.image} alt={cert.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Issuer badge */}
        <div className="absolute top-3 left-3">
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20`}>
            <Shield className="w-3 h-3" /> {cert.issuer}
          </span>
        </div>

        {/* Delete button */}
        <button onClick={e => { e.preventDefault(); onDelete(); }}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100">
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Title on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-sm font-bold text-white leading-tight">{cert.title}</h3>
          <p className="text-[11px] text-white/60 mt-0.5">{cert.date}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className={`text-xs leading-relaxed mb-4 ${mutedText}`}>{cert.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {cert.skills.map(s => (
            <span key={s} className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${darkMode ? "bg-violet-500/10 border-violet-500/25 text-violet-400" : "bg-violet-50 border-violet-200 text-violet-600"}`}>{s}</span>
          ))}
        </div>

        {/* Credential link */}
        <a href={cert.credentialLink} target="_blank" rel="noreferrer"
          className={`flex items-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02] px-3.5 py-2.5 rounded-xl border ${darkMode ? "border-gray-600 text-gray-400 hover:border-violet-500/50 hover:text-violet-400 hover:bg-violet-500/10" : "border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50"}`}>
          <Award className="w-3.5 h-3.5" /> View credential <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
        </a>
      </div>
    </div>
  );
}

// ─── Skill chip ───────────────────────────────────────────────────────────────
function SkillChip({ skill, category, darkMode, onRemove }: {
  skill: string; category: string; darkMode: boolean; onRemove: () => void;
}) {
  const [hover, setHover] = useState(false);
  const cc = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.tools;
  return (
    <div className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all hover:scale-[1.03] cursor-default ${darkMode ? cc.dark : cc.light}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span className="flex-1">{skill}</span>
      <button onClick={onRemove} className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${hover ? "opacity-100 scale-110" : "opacity-0 scale-75"}`}>
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SkillsCertificationsPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);

  const [skills, setSkills]       = useState<SkillsMap>(INIT_SKILLS);
  const [certs, setCerts]         = useState<Certification[]>(INIT_CERTS);
  const [activeTab, setActiveTab] = useState<"skills"|"certifications">("skills");
  const [activeCategory, setActiveCategory] = useState<string>("frontend");
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showCertModal, setShowCertModal]   = useState(false);
  const [mounted, setMounted]     = useState(false);

  const [skillForm, setSkillForm] = useState({ category: "frontend", skill: "", action: "add" as "add"|"remove" });
  const [certForm,  setCertForm]  = useState({ title:"", issuer:"", date:"", description:"", image:"", credentialLink:"", skills:"" });

  const heroSection = useInView();
  useEffect(() => { setMounted(true); }, []);

  function handleSkillSubmit(e: React.FormEvent) {
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
  }

  function handleCertSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!certForm.title.trim()) return;
    setCerts(prev => [...prev, {
      id: Date.now(), title: certForm.title, issuer: certForm.issuer, date: certForm.date,
      description: certForm.description, image: certForm.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
      credentialLink: certForm.credentialLink, skills: certForm.skills.split(",").map(s => s.trim()).filter(Boolean),
    }]);
    setCertForm({ title:"", issuer:"", date:"", description:"", image:"", credentialLink:"", skills:"" });
    setShowCertModal(false);
  }

  const totalSkills = Object.values(skills).flat().length;

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bg          = darkMode ? "bg-gray-900 text-white"         : "bg-white text-gray-800";
  const cardBg      = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText   = darkMode ? "text-gray-400"                  : "text-gray-500";
  const headingText = darkMode ? "text-white"                     : "text-gray-900";
  const divider     = darkMode ? "border-gray-800"                : "border-gray-200";
  const inputCls    = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"}`;
  const labelCls    = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── HERO ── */}
      <section className={`relative overflow-hidden border-b ${divider}`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode?"#fff":"#000"} 1px,transparent 1px),linear-gradient(90deg,${darkMode?"#fff":"#000"} 1px,transparent 1px)`, backgroundSize:"50px 50px" }} />
        <div className="absolute top-0 right-1/4 w-72 h-40 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-40 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div ref={heroSection.ref} className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
            style={{ opacity: heroSection.inView?1:0, transform: heroSection.inView?"none":"translateY(16px)", transition:"opacity .6s ease,transform .6s ease" }}>
            <div>
              <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode?"bg-violet-500/10 border-violet-500/30 text-violet-300":"bg-violet-50 border-violet-200 text-violet-600"}`}>
                <Sparkles className="w-3.5 h-3.5" /> Technical expertise & credentials
              </div>
              <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${headingText}`}>
                Skills & <span className={accentText}>Certifications</span>
              </h1>
              <p className={`text-base mt-2 ${mutedText}`}>Your complete technical profile — skills you've mastered and credentials you've earned.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { label: "Skills",         value: totalSkills,                  from:"from-violet-500",  to:"to-fuchsia-500" },
                { label: "Certifications", value: certs.length,                 from:"from-cyan-500",    to:"to-blue-500"    },
                { label: "Categories",     value: Object.keys(skills).length,   from:"from-fuchsia-500", to:"to-pink-500"    },
              ].map((s, i) => (
                <div key={s.label} className={`text-center px-4 py-3.5 rounded-2xl border ${cardBg}`}
                  style={{ opacity: heroSection.inView?1:0, transform: heroSection.inView?"none":"translateY(16px)", transition:`opacity .5s ease ${i*.1+.15}s,transform .5s ease ${i*.1+.15}s` }}>
                  <div className={`text-3xl font-extrabold tracking-tight bg-gradient-to-br ${s.from} ${s.to} bg-clip-text text-transparent`}>{s.value}</div>
                  <div className={`text-[11px] mt-0.5 ${mutedText}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <div className={`sticky top-0 z-40 border-b ${divider} ${darkMode?"bg-gray-900/90":"bg-white/90"} backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className={`flex items-center gap-0.5 p-1 rounded-xl ${darkMode?"bg-gray-800":"bg-gray-100"}`}>
            {(["skills","certifications"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? `bg-gradient-to-r ${accentGradient} text-white shadow-sm` : `${darkMode?"text-gray-400 hover:text-gray-200":"text-gray-500 hover:text-gray-700"}`}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "skills" && (
              <button onClick={() => setShowSkillModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all`}>
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            )}
            {activeTab === "certifications" && (
              <button onClick={() => setShowCertModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 transition-all`}>
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ═══════════ SKILLS TAB ═══════════ */}
        {activeTab === "skills" && (
          <div className="space-y-8">
            {/* Category selector */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(skills).map(([cat, list]) => {
                const cc = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.tools;
                const active = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:scale-[1.03] ${active ? `bg-gradient-to-r ${cc.gradient} text-white border-transparent shadow-md` : `${darkMode ? `${cc.dark}` : `${cc.light}`}`}`}>
                    {CATEGORY_ICONS[cat] ?? <Layers className="w-4 h-4" />}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    <span className={`min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${active ? "bg-white/25 text-white" : darkMode ? "bg-gray-700 text-gray-400" : "bg-white/80 text-gray-500"}`}>{list.length}</span>
                  </button>
                );
              })}
            </div>

            {/* Skills grid — image + skills side by side */}
            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2">

                {/* Left — visual / illustration */}
                <div className="relative overflow-hidden min-h-72 lg:min-h-0">
                  {/* Category-specific gradient backdrop */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_COLORS[activeCategory]?.gradient ?? accentGradient} opacity-90`} />
                  {/* Grid texture */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)`, backgroundSize:"32px 32px" }} />

                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl text-white">
                      <span className="scale-150">{CATEGORY_ICONS[activeCategory] ?? <Layers className="w-8 h-8" />}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight capitalize">{activeCategory}</h2>
                      <p className="text-white/70 text-sm mt-1">{skills[activeCategory]?.length} skills mastered</p>
                    </div>
                    {/* Mini skill preview bubbles */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                      {(skills[activeCategory] ?? []).slice(0, 6).map(s => (
                        <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/25">{s}</span>
                      ))}
                      {(skills[activeCategory]?.length ?? 0) > 6 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/25">+{(skills[activeCategory]?.length ?? 0) - 6} more</span>}
                    </div>
                  </div>
                </div>

                {/* Right — skill chips */}
                <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className={`text-sm font-bold ${headingText}`}>All {activeCategory} skills</h3>
                    <button onClick={() => { setSkillForm(f => ({ ...f, category: activeCategory, action: "add" })); setShowSkillModal(true); }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:scale-105 ${darkMode ? "border-violet-500/40 text-violet-400 hover:bg-violet-500/10" : "border-violet-200 text-violet-600 hover:bg-violet-50"}`}>
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  {(skills[activeCategory]?.length ?? 0) === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-4xl mb-3">🌱</div>
                      <p className={`text-sm ${mutedText}`}>No skills in this category yet.</p>
                      <button onClick={() => { setSkillForm(f => ({ ...f, category: activeCategory, action: "add" })); setShowSkillModal(true); }}
                        className={`mt-3 text-xs font-semibold ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"} transition-colors`}>+ Add your first skill →</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(skills[activeCategory] ?? []).map(skill => (
                        <SkillChip key={skill} skill={skill} category={activeCategory} darkMode={darkMode}
                          onRemove={() => setSkills(prev => ({ ...prev, [activeCategory]: prev[activeCategory].filter(s => s !== skill) }))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* All categories overview */}
            <div>
              <h2 className={`text-sm font-bold mb-4 ${headingText}`}>All categories overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(skills).map(([cat, list], i) => {
                  const cc = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.tools;
                  return (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`group relative rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-xl ${cardBg} ${darkMode ? "hover:border-violet-500/40 hover:shadow-violet-500/5" : "hover:border-violet-300 hover:shadow-violet-100"}`}>
                      <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${cc.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cc.gradient} flex items-center justify-center text-white mb-3`}>
                        {CATEGORY_ICONS[cat] ?? <Layers className="w-4 h-4" />}
                      </div>
                      <p className={`text-sm font-bold capitalize ${headingText}`}>{cat}</p>
                      <p className={`text-xs mt-0.5 ${mutedText}`}>{list.length} skills</p>
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {list.slice(0, 3).map(s => (
                          <span key={s} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${darkMode ? cc.dark : cc.light}`}>{s}</span>
                        ))}
                        {list.length > 3 && <span className={`text-[10px] ${mutedText}`}>+{list.length - 3}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ CERTIFICATIONS TAB ═══════════ */}
        {activeTab === "certifications" && (
          <div>
            {certs.length === 0 ? (
              <div className={`rounded-2xl border p-16 text-center ${cardBg}`}>
                <div className="text-5xl mb-4">🏅</div>
                <h3 className={`text-xl font-bold mb-2 ${headingText}`}>No certifications yet</h3>
                <p className={`text-sm ${mutedText} mb-6`}>Add your professional certifications to showcase your credentials.</p>
                <button onClick={() => setShowCertModal(true)} className={`px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white hover:scale-105 transition-all`}>
                  Add your first certification →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {certs.map((cert, i) => (
                  <CertCard key={cert.id} cert={cert} darkMode={darkMode} idx={i}
                    onDelete={() => setCerts(p => p.filter(c => c.id !== cert.id))} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── SKILL MODAL ── */}
      {showSkillModal && (
        <Modal darkMode={darkMode} title="Manage skills" subtitle="Add or remove skills from a category" onClose={() => setShowSkillModal(false)}>
          <form onSubmit={handleSkillSubmit} className="p-6 space-y-4">
            <div>
              <label className={labelCls}>Category</label>
              <div className="relative">
                <select className={`${inputCls} pr-8 appearance-none`} value={skillForm.category} onChange={e => setSkillForm(f => ({ ...f, category: e.target.value }))}>
                  {Object.keys(skills).map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Skill name <span className="text-red-400">*</span></label>
              <input className={inputCls} placeholder="e.g. React" value={skillForm.skill} onChange={e => setSkillForm(f => ({ ...f, skill: e.target.value }))} required />
            </div>
            <div>
              <label className={labelCls}>Action</label>
              <div className="grid grid-cols-2 gap-2">
                {(["add","remove"] as const).map(a => (
                  <button key={a} type="button" onClick={() => setSkillForm(f => ({ ...f, action: a }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all ${skillForm.action === a ? `bg-gradient-to-r ${accentGradient} text-white border-transparent` : `${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}`}>
                    {a === "add" ? "➕ Add" : "🗑 Remove"}
                  </button>
                ))}
              </div>
            </div>
            <div className={`flex gap-3 pt-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
              <button type="button" onClick={() => setShowSkillModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"} transition-all`}>Cancel</button>
              <button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}>Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── CERTIFICATION MODAL ── */}
      {showCertModal && (
        <Modal darkMode={darkMode} title="Add certification" subtitle="Add a professional credential to your profile" onClose={() => setShowCertModal(false)}>
          <form onSubmit={handleCertSubmit} className="p-6 space-y-4">
            <div><label className={labelCls}>Title <span className="text-red-400">*</span></label><input className={inputCls} placeholder="e.g. AWS Certified Solutions Architect" value={certForm.title} onChange={e => setCertForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Issuer <span className="text-red-400">*</span></label><input className={inputCls} placeholder="e.g. Amazon" value={certForm.issuer} onChange={e => setCertForm(f => ({ ...f, issuer: e.target.value }))} required /></div>
              <div><label className={labelCls}>Date</label><input className={inputCls} placeholder="e.g. March 2024" value={certForm.date} onChange={e => setCertForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div><label className={labelCls}>Description</label><textarea rows={3} className={`${inputCls} resize-none`} placeholder="What does this certification cover?" value={certForm.description} onChange={e => setCertForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><label className={labelCls}>Cover image URL <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(optional)</span></label><input className={inputCls} placeholder="https://..." value={certForm.image} onChange={e => setCertForm(f => ({ ...f, image: e.target.value }))} /></div>
            <div><label className={labelCls}>Credential URL <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(optional)</span></label><input className={inputCls} placeholder="https://..." value={certForm.credentialLink} onChange={e => setCertForm(f => ({ ...f, credentialLink: e.target.value }))} /></div>
            <div><label className={labelCls}>Skills <span className={`font-normal ${darkMode ? "text-gray-500" : "text-gray-400"}`}>(comma-separated)</span></label><input className={inputCls} placeholder="React, Cloud, Testing" value={certForm.skills} onChange={e => setCertForm(f => ({ ...f, skills: e.target.value }))} /></div>
            <div className={`flex gap-3 pt-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
              <button type="button" onClick={() => setShowCertModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"} transition-all`}>Cancel</button>
              <button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}>Add certification</button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}