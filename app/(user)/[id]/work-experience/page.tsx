"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { Briefcase, Calendar, MapPin, Plus, X, Award } from "lucide-react";
import axios from "axios";
// import { IWorkExperience } from "@/models/user-model";

// ─── Types ──────────────────────────────────────────────────────────────


export interface IWorkExperience {
  _id : string
  companyName: string;
  duration: string;
  role?: string;
  description?: string;
  location?: string;
}

// ─── Main Component ────────────────────────────────────────────────────
export default function WorkExperiencePage() {
  const user = useAppSelector((state: any) => state.User.userData);
  const [workExperiences, setWorkExperiences] = useState<IWorkExperience[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    duration: "",
    location: "",
    description: "",
  });

  // Initialize work experience list from Redux user data
  useEffect(() => {
    if (user?.workExperience) {
      setWorkExperiences(user.workExperience);
    }
  }, [user]);

  // Show loading while user data is not yet loaded
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(
        "/api/user/work-experience",
        {
          companyName: formData.companyName,
          duration: formData.duration,
          role: formData.role,
          description: formData.description,
          location: formData.location,
        }
      );
  
      toast.success(response.data.message);
      console.log(response.data);
      
      setFormData({
        companyName: "",
        duration: "",
        role: "",
        description: "",
        location: "",
      });
  
      setShowForm(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to add work experience"
      );
    }
  };

  // Simple modal component
  const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  const dotColors = ["bg-purple-500", "bg-cyan-500", "bg-pink-500"];

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
              const color = dotColors[idx % dotColors.length];
              return (
                <div key={exp._id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <div
                      className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-bold shadow-sm`}
                    >
                      { exp.companyName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Experience card */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{exp.companyName}</h3>
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
                name="companyName"
                value={formData.companyName}
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