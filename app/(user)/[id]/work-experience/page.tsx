"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  MapPin,
  Plus,
  X,
  Award,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────
interface Certification {
  name: string;
  issuer: string;
}

interface WorkExperience {
  id: number;
  company: string;
  role: string;
  duration: string;
  location: string;
  description: string;
  certifications?: Certification[];
  logo?: string;
}

// ─── Main Component ────────────────────────────────────────────────────
export default function WorkExperiencePage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const params = useParams();
  const id = params?.id as string;

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    duration: "",
    location: "",
    description: "",
    certifications: "",
  });

  // Dummy data (replace with API call)
  useEffect(() => {
    const dummyExperiences: WorkExperience[] = [
      {
        id: 1,
        company: "Google",
        role: "Frontend Developer",
        duration: "Jan 2023 - Present",
        location: "Bangalore, India",
        description:
          "Built scalable UI components using React and improved performance by 30%. Led migration of legacy codebase to Next.js.",
        certifications: [{ name: "React Certification", issuer: "Coursera" }],
        logo: "G",
      },
      {
        id: 2,
        company: "Microsoft",
        role: "Software Engineer Intern",
        duration: "Jun 2022 - Dec 2022",
        location: "Hyderabad, India",
        description:
          "Developed internal tools using TypeScript and improved API response handling by 25%.",
        certifications: [{ name: "Azure Fundamentals", issuer: "Microsoft" }],
        logo: "M",
      },
      {
        id: 3,
        company: "Amazon",
        role: "Backend Developer Intern",
        duration: "Jan 2022 - May 2022",
        location: "Remote",
        description:
          "Built REST APIs using Node.js and optimized database queries, reducing latency by 40%.",
        certifications: [{ name: "AWS Cloud Practitioner", issuer: "Amazon" }],
        logo: "A",
      },
    ];
    setWorkExperiences(dummyExperiences);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExperience: WorkExperience = {
      id: workExperiences.length + 1,
      company: formData.company,
      role: formData.role,
      duration: formData.duration,
      location: formData.location,
      description: formData.description,
      certifications: formData.certifications
        .split(",")
        .map((cert) => {
          const [name, issuer] = cert.split("|");
          return { name: name.trim(), issuer: issuer?.trim() || "Issuer" };
        })
        .filter((c) => c.name),
      logo: formData.company.charAt(0),
    };
    setWorkExperiences([newExperience, ...workExperiences]);
    setFormData({
      company: "",
      role: "",
      duration: "",
      location: "",
      description: "",
      certifications: "",
    });
    setShowForm(false);
    toast.success("Work experience added!");
  };

  // Theme tokens
  const bg = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const cardBg = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium bg-violet-500/10 border-violet-500/30 text-violet-400">
            <Briefcase className="w-3.5 h-3.5" />
            Professional journey
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 ${headingText}`}>
            Work Experience
          </h1>
          <p className={`text-sm mt-1 ${mutedText}`}>
            My career path, roles, and achievements
          </p>
        </div>

        {/* Timeline with vertical line */}
        <div className="relative">
          {/* Vertical line (gradient) */}
          <div
            className="absolute left-5 top-0 bottom-0 w-0.5 rounded-full"
            style={{
              background: `linear-gradient(to bottom, #8b5cf6, #d946ef, #06b6d4)`,
              opacity: 0.5,
            }}
          />

          {/* Experience items */}
          <div className="space-y-8">
            {workExperiences.map((exp, idx) => {
              const companyColors = [
                "from-violet-500 to-fuchsia-500",
                "from-cyan-500 to-blue-500",
                "from-fuchsia-500 to-pink-500",
              ];
              const colorIdx = idx % companyColors.length;

              return (
                <div key={exp.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${companyColors[colorIdx]} flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {exp.logo || exp.company.charAt(0)}
                    </div>
                  </div>

                  {/* Experience card */}
                  <div
                    className={`group flex-1 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardBg}`}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`}
                    />
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <div>
                          <h3 className={`text-lg font-bold ${headingText}`}>
                            {exp.company}
                          </h3>
                          <p className="text-sm text-violet-400 font-medium">
                            {exp.role}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{exp.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{exp.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className={`text-sm leading-relaxed ${mutedText} mb-3`}>
                        {exp.description}
                      </p>

                      {exp.certifications && exp.certifications.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700/30">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                            <Award className="w-3.5 h-3.5" />
                            Certifications
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {exp.certifications.map((cert, i) => (
                              <span
                                key={i}
                                className={`text-[10px] px-2 py-1 rounded-full border ${
                                  darkMode
                                    ? "bg-gray-700/50 border-gray-600 text-gray-300"
                                    : "bg-gray-100 border-gray-200 text-gray-600"
                                }`}
                              >
                                {cert.name} · {cert.issuer}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Experience Button */}
        <div>
          <button
            onClick={() => setShowForm(true)}
            className={`group w-full rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.01] ${
              darkMode
                ? "border-gray-700 hover:border-violet-500/50 hover:bg-gray-800/50"
                : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/50"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
            >
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${headingText}`}>
                Add Work Experience
              </h3>
              <p className={`text-sm ${mutedText}`}>
                Share your professional journey
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Add Experience Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowForm(false)}
        >
          <div
            className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${cardBg}`}
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideUp 0.22s ease both" }}
          >
            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                darkMode ? "border-gray-800" : "border-gray-100"
              }`}
            >
              <div>
                <h2 className={`text-base font-bold ${headingText}`}>
                  Add Work Experience
                </h2>
                <p className={`text-xs mt-0.5 ${mutedText}`}>
                  Fill in your professional details
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  darkMode
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Company *
                  </label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"
                    }`}
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Role / Title *
                  </label>
                  <input
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"
                    }`}
                    placeholder="e.g., Senior Frontend Developer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Duration *
                    </label>
                    <input
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${
                        darkMode
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60"
                          : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"
                      }`}
                      placeholder="e.g., Jan 2023 - Present"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-1.5 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Location
                    </label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${
                        darkMode
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60"
                          : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"
                      }`}
                      placeholder="e.g., Remote, Bangalore"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description *
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 resize-none ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"
                    }`}
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Certifications (optional)
                  </label>
                  <input
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500/60"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-violet-400"
                    }`}
                    placeholder="Format: name|issuer, name|issuer (e.g., React|Coursera)"
                  />
                  <p className={`text-[10px] mt-1.5 ${mutedText}`}>
                    Separate multiple certifications with commas. Use
                    <code className="mx-1 px-1 py-0.5 rounded bg-gray-700">name|issuer</code> format.
                  </p>
                </div>
              </div>

              <div className={`flex gap-3 pt-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    darkMode
                      ? "border-gray-700 text-gray-400 hover:bg-gray-800"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all`}
                >
                  Add Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}