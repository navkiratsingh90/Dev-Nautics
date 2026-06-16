"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { toast } from "sonner";
import {
  Plus,
  Github,
  ExternalLink,
  X,
  Sparkles,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

interface Project {
  _id?: string;
  title: string;
  description?: string;
  file?: string;
  techStack: string[];
  role?: string;
  duration?: string;
  githubLink?: string;
  liveLink?: string;
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-[#E8EDF2] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E8EDF2] px-5 sm:px-6 py-4">
          <h2 className="text-lg font-bold text-[#0D1B2A]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#0D1B2A]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const user = useAppSelector((state: any) => state.User.userData);

  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    githubLink: string;
    liveLink: string;
    role: string;
    duration: string;
    techStack: string;
    image: File | null;
  }>({
    title: "",
    description: "",
    githubLink: "",
    liveLink: "",
    role: "",
    duration: "",
    techStack: "",
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get("/api/project");
      setProjects(data?.projects || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load projects");
    }
  };

  useEffect(() => {
    if (user) {
      if (Array.isArray(user.projects)) {
        setProjects(user.projects);
      }
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const sortedProjects = useMemo(() => {
    return [...projects].reverse();
  }, [projects]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      githubLink: "",
      liveLink: "",
      role: "",
      duration: "",
      techStack: "",
      image: null,
    });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("githubLink", form.githubLink.trim());
      formData.append("liveLink", form.liveLink.trim());
      formData.append("role", form.role.trim());
      formData.append("duration", form.duration.trim());
      formData.append("techStack", form.techStack.trim());

      if (form.image) {
        formData.append("file", form.image);
      }

      const { data } = await axios.post("/api/user/project", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(data?.message || "Project added successfully!");
      setShowModal(false);
      resetForm();
      await fetchProjects();
    } catch (error: any) {
      console.error(error?.response?.data?.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      setDeleteLoadingId(projectId);
      const { data } = await axios.delete(`/api/project/${projectId}`);
      toast.success(data?.message || "Project deleted successfully");
      setProjects((prev) => prev.filter((project) => project._id !== projectId));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="text-[#64748B]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] px-4 py-8 font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#EDF7F3] px-3 py-1 text-xs text-[#047857]">
            <Sparkles className="h-3.5 w-3.5" />
            Development work
          </div>
          <h1 className="text-3xl font-extrabold tracking-[-0.8px] text-[#0D1B2A]">
            Projects Portfolio
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Showcase of your development work and collaborations
          </p>
        </div>

        <div className="space-y-6">
          {sortedProjects.length === 0 ? (
            <div className="rounded-2xl border border-[#E8EDF2] bg-white py-12 text-center">
              <p className="text-[#64748B]">
                No projects yet. Add your first project!
              </p>
            </div>
          ) : (
            sortedProjects.map((project) => (
              <div
                key={project._id}
                className="overflow-hidden rounded-2xl border border-[#E8EDF2] bg-white shadow-sm"
              >
                <div className="flex flex-col md:flex-row">
                  {project.file && (
                    <div className="relative h-52 overflow-hidden bg-[#F8FAFB] md:h-auto md:w-2/5">
                      <img
                        src={project.file}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 p-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#0D1B2A]">
                          {project.title}
                        </h3>
                        {(project.role || project.duration) && (
                          <p className="mt-1 text-sm text-[#64748B]">
                            {project.role}
                            {project.role && project.duration ? " • " : ""}
                            {project.duration}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-[#F8FAFB] p-2 text-[#64748B] transition hover:bg-[#E8EDF2]"
                            aria-label="GitHub link"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {project.liveLink && (
                          <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-[#0D1B2A] p-2 text-white transition hover:bg-[#1E3A5F]"
                            aria-label="Live link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => project._id && handleDelete(project._id)}
                          disabled={
                            !project._id || deleteLoadingId === project._id
                          }
                          className="rounded-lg border border-[#E8EDF2] p-2 text-[#64748B] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          aria-label="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {project.description && (
                      <p className="mb-4 text-sm leading-relaxed text-[#64748B]">
                        {project.description}
                      </p>
                    )}

                    {project.techStack?.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-[#E8EDF2] bg-[#F8FAFB] px-3 py-1 text-xs font-medium text-[#64748B]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="border-t border-[#E8EDF2] pt-3 text-xs text-[#64748B]">
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#0EA472] hover:underline"
                        >
                          Live Demo
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 inline-flex items-center text-[#64748B] hover:underline"
                        >
                          GitHub
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#D8E1E8] px-8 py-6 transition hover:border-[#B9C4CF] hover:bg-[#F2F5F8]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EDF2] text-[#64748B]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0D1B2A]">
                Add New Project
              </h3>
              <p className="text-xs text-[#64748B]">Showcase your work</p>
            </div>
          </button>
        </div>
      </div>

      {showModal && (
        <Modal title="Add New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
                Project Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleInput}
                required
                className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleInput}
                className="w-full resize-none rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
                Role
              </label>
              <input
                name="role"
                value={form.role}
                onChange={handleInput}
                placeholder="Frontend Developer"
                className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
                Duration
              </label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleInput}
                placeholder="Jan 2025 - Apr 2025"
                className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
                Tech Stack (comma separated)
              </label>
              <input
                name="techStack"
                value={form.techStack}
                onChange={handleInput}
                placeholder="React, Node.js, MongoDB"
                className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
                GitHub Link
              </label>
              <input
                name="githubLink"
                value={form.githubLink}
                onChange={handleInput}
                type="url"
                className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
                Live Project Link
              </label>
              <input
                name="liveLink"
                value={form.liveLink}
                onChange={handleInput}
                type="url"
                className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none focus:ring-1 focus:ring-[#0EA472]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[#0D1B2A]">
                Project Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-[#E8EDF2] px-3 py-2 outline-none"
              />
              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-xl border border-[#E8EDF2]">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-52 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex gap-3 border-t border-[#E8EDF2] pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 rounded-lg border border-[#E8EDF2] py-2 text-[#64748B] transition hover:bg-[#F8FAFB]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-[#0D1B2A] py-2 text-white transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Adding..." : "Add Project"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}