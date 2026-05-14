"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import {
  Plus,
  Github,
  ExternalLink,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Types
interface Project {
  _id: string;
  name: string;
  description: string;
  githubLink: string;
  liveLink: string;
  techStack: string[];
  file?: string;
}

// Dummy data (replace with API call)
const dummyProjects: Project[] = [
  {
    _id: "1",
    name: "E‑Commerce Platform",
    description: "Full‑stack e‑commerce with React, Node.js, and MongoDB. Features include user auth, product filtering, cart, and payment integration.",
    githubLink: "https://github.com/user/ecommerce",
    liveLink: "https://ecommerce-demo.com",
    techStack: ["React", "Node.js", "MongoDB", "Tailwind"],
    file: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=300&fit=crop",
  },
  {
    _id: "2",
    name: "Portfolio Website",
    description: "Personal portfolio built with Next.js and Tailwind CSS, featuring dark mode, blog integration, and smooth animations.",
    githubLink: "https://github.com/user/portfolio",
    liveLink: "https://portfolio.com",
    techStack: ["Next.js", "Tailwind", "TypeScript"],
    file: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&h=300&fit=crop",
  },
];

export default function ProjectsPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const params = useParams();
  const id = params?.id as string;

  const [projects, setProjects] = useState<Project[]>(dummyProjects);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    githubLink: "",
    liveLink: "",
    techStack: "",
    file: "",
  });

  // Theme tokens (matching UserProfilePage & WorkExperiencePage)
  const bg = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const cardBg = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      _id: Date.now().toString(),
      name: form.name,
      description: form.description,
      githubLink: form.githubLink,
      liveLink: form.liveLink,
      techStack: form.techStack.split(",").map((t) => t.trim()),
      file: form.file || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop",
    };
    setProjects([newProject, ...projects]);
    setForm({ name: "", description: "", githubLink: "", liveLink: "", techStack: "", file: "" });
    setShowModal(false);
    toast.success("Project added successfully!");
  };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium bg-violet-500/10 border-violet-500/30 text-violet-400">
            <Sparkles className="w-3.5 h-3.5" />
            Development work
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 ${headingText}`}>
            Projects Portfolio
          </h1>
          <p className={`text-sm mt-1 ${mutedText}`}>
            Showcase of my development work and collaborations
          </p>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {projects.map((project, idx) => {
            const techColors = [
              "from-violet-500/15 to-fuchsia-500/15 text-violet-400 border-violet-500/30",
              "from-cyan-500/15 to-blue-500/15 text-cyan-400 border-cyan-500/30",
              "from-fuchsia-500/15 to-pink-500/15 text-fuchsia-400 border-fuchsia-500/30",
            ];
            return (
              <div
                key={project._id}
                className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardBg}`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`}
                />
                <div className="flex flex-col md:flex-row overflow-hidden">
                  {/* Image */}
                  {project.file && (
                    <div className="md:w-2/5 h-48 md:h-auto relative bg-gray-800">
                      <Image
                        src={project.file}
                        alt={project.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                  )}
                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <h3 className={`text-xl font-bold ${headingText}`}>{project.name}</h3>
                      <div className="flex gap-2">
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl transition-all hover:scale-105 ${
                            darkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <Github className="h-4 w-4" />
                        </a>
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl transition-all hover:scale-105 bg-gradient-to-r ${accentGradient} text-white shadow-sm`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${mutedText} mb-4`}>
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className={`text-xs font-medium px-3 py-1 rounded-full border bg-gradient-to-r ${techColors[i % techColors.length]}`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className={`pt-3 border-t text-xs ${darkMode ? "border-gray-700" : "border-gray-200"} ${mutedText}`}>
                      <span>Project ID: {project._id}</span>
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-4 inline-flex items-center hover:underline ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        Live Demo <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Project Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
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
              <h3 className={`text-base font-semibold ${headingText}`}>Add New Project</h3>
              <p className={`text-xs ${mutedText}`}>Showcase your work</p>
            </div>
          </button>
        </div>
      </div>

      {/* Add Project Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className={`max-w-lg rounded-2xl border shadow-2xl ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
          <DialogHeader className="border-b pb-4">
            <DialogTitle className={`text-base font-bold ${headingText}`}>Add New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={addProject} className="space-y-5 pt-2">
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Project Name *</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleInput}
                required
                className={`mt-1.5 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Description</Label>
              <Textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleInput}
                className={`mt-1.5 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Tech Stack (comma separated)</Label>
              <Input
                name="techStack"
                value={form.techStack}
                onChange={handleInput}
                placeholder="React, Node.js, MongoDB"
                className={`mt-1.5 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>GitHub Link</Label>
              <Input
                name="githubLink"
                value={form.githubLink}
                onChange={handleInput}
                type="url"
                className={`mt-1.5 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Live Project Link</Label>
              <Input
                name="liveLink"
                value={form.liveLink}
                onChange={handleInput}
                type="url"
                className={`mt-1.5 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div>
              <Label className={`text-xs font-semibold ${mutedText}`}>Image URL (optional)</Label>
              <Input
                name="file"
                value={form.file}
                onChange={handleInput}
                placeholder="https://..."
                className={`mt-1.5 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-700/30">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                type="button"
                className={`flex-1 ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-lg transition-all`}
              >
                Add Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}