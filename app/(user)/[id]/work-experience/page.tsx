"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Briefcase, Calendar, MapPin, Plus, X, Award } from "lucide-react";

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
    if (!formData.company.trim() || !formData.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    const newExperience: WorkExperience = {
      id: workExperiences.length + 1,
      company: formData.company.trim(),
      role: formData.role.trim(),
      duration: formData.duration.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
      certifications: formData.certifications
        .split(",")
        .map((cert) => {
          const [name, issuer] = cert.split("|");
          if (!name) return null;
          return { name: name.trim(), issuer: issuer?.trim() || "Issuer" };
        })
        .filter((c): c is Certification => c !== null),
      logo: formData.company.charAt(0).toUpperCase(),
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

  // Simple modal component (inline)
  const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <Briefcase className="w-3.5 h-3.5" /> Professional journey
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Work Experience</h1>
          <p className="text-sm text-gray-500 mt-1">My career path, roles, and achievements</p>
        </div>

        {/* Timeline with simple vertical line */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

          {/* Experience items */}
          <div className="space-y-8">
            {workExperiences.map((exp, idx) => {
              const dotColors = ["bg-purple-500", "bg-cyan-500", "bg-pink-500"];
              const color = dotColors[idx % dotColors.length];

              return (
                <div key={exp.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <div
                      className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-bold shadow-sm`}
                    >
                      {exp.logo || exp.company.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Experience card */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{exp.company}</h3>
                        <p className="text-sm text-green-600 font-medium">{exp.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{exp.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{exp.location}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{exp.description}</p>

                    {exp.certifications && exp.certifications.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mb-2">
                          <Award className="w-3.5 h-3.5" /> Certifications
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {exp.certifications.map((cert, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {cert.name} · {cert.issuer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Experience Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="border-2 border-dashed border-gray-300 rounded-2xl px-8 py-6 flex flex-col items-center gap-3 hover:border-gray-400 hover:bg-gray-100 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Add Work Experience</h3>
              <p className="text-xs text-gray-500">Share your professional journey</p>
            </div>
          </button>
        </div>
      </div>

      {/* Add Experience Modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add Work Experience</h2>
              <p className="text-xs text-gray-500 mt-0.5">Fill in your professional details</p>
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="e.g., Google, Microsoft"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title *</label>
              <input
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Jan 2023 - Present"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Remote, Bangalore"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (optional)</label>
              <input
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Format: name|issuer, name|issuer (e.g., React|Coursera)"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple certifications with commas. Use <code className="px-1 bg-gray-100 rounded">name|issuer</code> format.</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
              >
                Add Experience
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}