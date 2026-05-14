"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import {
  GraduationCap,
  Calendar,
  MapPin,
  Plus,
  X,
  Award,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Types
interface Education {
  id: number;
  schoolName: string;
  degree: string;
  duration: string;
  description: string;
}

interface User {
  _id: string;
  username: string;
  education: Education[];
}

export default function EducationPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [educations, setEducations] = useState<Education[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    degree: "",
    duration: "",
    description: "",
  });

  // Dummy data (replace with API call)
  useEffect(() => {
    const dummyUser: User = {
      _id: "1",
      username: "navkirat",
      education: [
        {
          id: 1,
          schoolName: "Guru Nanak Dev University",
          degree: "B.Tech in Computer Science",
          duration: "2023 - 2027",
          description:
            "Currently pursuing Bachelor's degree. Active in coding, hackathons, and web development projects. CGPA: 9.2/10",
        },
        {
          id: 2,
          schoolName: "Spring Dale Senior School",
          degree: "Class 12 (Non-Medical)",
          duration: "2021 - 2023",
          description:
            "Studied Physics, Chemistry, and Mathematics. Scored 90% and participated in science exhibitions.",
        },
        {
          id: 3,
          schoolName: "Spring Dale Senior School",
          degree: "Class 10",
          duration: "2019 - 2021",
          description:
            "Completed secondary education with strong academic performance and participation in extracurricular activities.",
        },
      ],
    };
    setUser(dummyUser);
    setEducations(dummyUser.education);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEducation: Education = {
      id: educations.length + 1,
      schoolName: formData.schoolName,
      degree: formData.degree,
      duration: formData.duration,
      description: formData.description,
    };
    setEducations([...educations, newEducation]);
    setFormData({
      schoolName: "",
      degree: "",
      duration: "",
      description: "",
    });
    setShowForm(false);
    toast.success("Education added successfully!");
  };

  // Theme tokens (matching other pages)
  const bg = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const cardBg = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  if (!user) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium bg-violet-500/10 border-violet-500/30 text-violet-400">
            <GraduationCap className="w-3.5 h-3.5" />
            Academic journey
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 ${headingText}`}>
            Education
          </h1>
          <p className={`text-sm mt-1 ${mutedText}`}>
            My educational background and achievements
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

          {/* Education items */}
          <div className="space-y-8">
            {educations.map((edu, idx) => {
              const dotColors = [
                "from-violet-500 to-fuchsia-500",
                "from-cyan-500 to-blue-500",
                "from-fuchsia-500 to-pink-500",
              ];
              const colorIdx = idx % dotColors.length;

              return (
                <div key={edu.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dotColors[colorIdx]} flex items-center justify-center text-white font-bold shadow-lg`}
                    >
                      {edu.schoolName.charAt(0)}
                    </div>
                  </div>

                  {/* Education card */}
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
                            {edu.schoolName}
                          </h3>
                          <p className="text-sm text-violet-400 font-medium">
                            {edu.degree}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{edu.duration}</span>
                        </div>
                      </div>

                      <p className={`text-sm leading-relaxed ${mutedText}`}>
                        {edu.description}
                      </p>

                      {/* Optional: Add badge for ongoing education */}
                      {edu.duration.includes("Present") && (
                        <div className="mt-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-green-500/15 text-green-400 border-green-500/30`}>
                            Currently pursuing
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Education Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className={`group rounded-2xl border-2 border-dashed px-8 py-6 flex flex-col items-center gap-3 transition-all hover:scale-[1.02] ${
              darkMode
                ? "border-gray-700 hover:border-violet-500/50 hover:bg-gray-800/50"
                : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/50"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
            >
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-semibold ${headingText}`}>Add Education</h3>
              <p className={`text-xs ${mutedText}`}>Share your academic background</p>
            </div>
          </button>
        </div>
      </div>

      {/* Add Education Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={`max-w-lg rounded-2xl border shadow-2xl ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
          <DialogHeader className="border-b pb-4">
            <DialogTitle className={`text-base font-bold ${headingText}`}>Add Education</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>
                Institution Name *
              </label>
              <Input
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                required
                className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>
                Degree / Course *
              </label>
              <Input
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                required
                className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>
                Duration *
              </label>
              <Input
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                placeholder="e.g., 2018 - 2022"
                className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>
                Description
              </label>
              <Textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Achievements, GPA, clubs, etc."
                className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-700/30">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                type="button"
                className={`flex-1 ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-lg transition-all`}
              >
                Add Education
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}