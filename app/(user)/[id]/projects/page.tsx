"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Github, ExternalLink, X, Layers, Sparkles } from "lucide-react";

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

// Dummy data
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

// Simple Modal component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    const newProject: Project = {
      _id: Date.now().toString(),
      name: form.name,
      description: form.description,
      githubLink: form.githubLink,
      liveLink: form.liveLink,
      techStack: form.techStack.split(",").map((t) => t.trim()).filter(Boolean),
      file: form.file || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop",
    };
    setProjects([newProject, ...projects]);
    setForm({ name: "", description: "", githubLink: "", liveLink: "", techStack: "", file: "" });
    setShowModal(false);
    toast.success("Project added successfully!");
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Development work
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Showcase of my development work and collaborations</p>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                {project.file && (
                  <div className="md:w-2/5 h-48 md:h-auto relative overflow-hidden bg-gray-100">
                    <img src={project.file} alt={project.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    <div className="flex gap-2">
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                      Live Demo <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Project Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="border-2 border-dashed border-gray-300 rounded-2xl px-8 py-6 flex flex-col items-center gap-3 hover:border-gray-400 hover:bg-gray-100 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Add New Project</h3>
              <p className="text-xs text-gray-500">Showcase your work</p>
            </div>
          </button>
        </div>
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <Modal title="Add New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={addProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleInput}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleInput}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack (comma separated)</label>
              <input
                name="techStack"
                value={form.techStack}
                onChange={handleInput}
                placeholder="React, Node.js, MongoDB"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Link</label>
              <input
                name="githubLink"
                value={form.githubLink}
                onChange={handleInput}
                type="url"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Live Project Link</label>
              <input
                name="liveLink"
                value={form.liveLink}
                onChange={handleInput}
                type="url"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
              <input
                name="file"
                value={form.file}
                onChange={handleInput}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
              >
                Add Project
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}