"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap, Calendar, Plus, X } from "lucide-react";
import axios from "axios";

// Types (match the schema)
interface Education {
  id?: number;          // optional, for local UI
  schoolName: string;
  degree: string;
  duration: string;
  description: string;
}

export default function EducationPage() {
  const params = useParams();
  const userId = params?.id as string; // from route /profile/[id]/education

  const currentUser = useAppSelector((state: any) => state.User.userData);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    degree: "",
    duration: "",
    description: "",
  });

  // Fetch education data for the given userId
  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    const fetchEducation = async () => {
      try {
        const res = await axios.get(`/api/user/${userId}`);
        // Assuming API returns { data: Education[] }
        const eduData = res.data.user.education || [];
        const withIds = eduData.map((edu: Education, idx: number) => ({
          ...edu,
          id: idx + 1,
        }));
        setEducations(withIds);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load education");
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, [userId]);

  // Determine if the viewed profile belongs to the logged-in user
  const isOwn = currentUser && currentUser._id === userId;

  // Add education handler (only for own profile)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/user/${userId}/education`, // POST to the user's education endpoint
        {
          schoolName: formData.schoolName,
          degree: formData.degree,
          duration: formData.duration,
          description: formData.description,
        }
      );
      toast.success(response.data.message || "Education added");

      // Refresh the list
      const refetch = await axios.get(`/api/user/${userId}/education`);
      const eduData = refetch.data.data || [];
      const withIds = eduData.map((edu: Education, idx: number) => ({
        ...edu,
        id: idx + 1,
      }));
      setEducations(withIds);

      setFormData({
        schoolName: "",
        degree: "",
        duration: "",
        description: "",
      });
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add education");
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading education...</div>
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "User not found"}</div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const dotColors = ["bg-purple-500", "bg-cyan-500", "bg-pink-500"];

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            Academic journey
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Education</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isOwn
              ? "My educational background and achievements"
              : "Educational background"}
          </p>
        </div>

        {/* Timeline with vertical line */}
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

          {educations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No education entries yet.
              {isOwn && " Click the button below to add your first one."}
            </div>
          ) : (
            <div className="space-y-8">
              {educations.map((edu, idx) => {
                const color = dotColors[idx % dotColors.length];
                return (
                  <div key={edu.id ?? idx} className="flex gap-4">
                    <div className="relative z-10">
                      <div
                        className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-bold shadow-sm`}
                      >
                        {edu.schoolName.charAt(0)}
                      </div>
                    </div>

                    <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {edu.schoolName}
                          </h3>
                          <p className="text-sm text-green-600 font-medium">
                            {edu.degree}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{edu.duration}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed">
                        {edu.description}
                      </p>

                      {edu.duration.includes("Present") && (
                        <div className="mt-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Currently pursuing
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Education Button (only if own profile) */}
        {isOwn && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="border-2 border-dashed border-gray-300 rounded-2xl px-8 py-6 flex flex-col items-center gap-3 hover:border-green-400 hover:bg-gray-100 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Add Education</h3>
                <p className="text-xs text-gray-500">Share your academic background</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Add Education Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add Education</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution Name *
                </label>
                <input
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree / Course *
                </label>
                <input
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 2018 - 2022"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Achievements, GPA, clubs, etc."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
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
                  Add Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}