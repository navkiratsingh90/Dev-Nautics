"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  FileChartColumnIncreasing,
  FolderClosed,
  BarChart3,
  Wrench,
  Workflow,
  LogOut,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Users,
  FolderOpen,
  Briefcase,
  Globe,
  FileText,
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  to: string;
}
const navItems : Section[]= [
  { id: "dashboard", title: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> ,to: "/admin"},
  { id: "questions", title: "Questions", icon: <BookOpen className="w-4 h-4" />,to: "/admin/questions" },
  { id: "users", title: "Users", icon: <Users className="w-4 h-4" /> ,to: "/admin/users"},
  { id: "workspaces", title: "Workspaces", icon: <FolderOpen className="w-4 h-4" /> ,to: "/admin/workspaces"},
  { id: "collaborations", title: "Collaborations", icon: <Briefcase className="w-4 h-4" /> ,to: "/admin/collaborations"},
  { id: "communities", title: "Communities", icon: <Globe className="w-4 h-4" /> ,to: "/admin/communities"},
  { id: "submissions", title: "Submissions", icon: <FileText className="w-4 h-4" />,to: "/admin/submissions" },
];


const sections: Section[] = [
  {
    id: "user",
    title: "User Details",
    icon: <UserRound className="w-4 h-4" />,
    to: "",
  },
  {
    id: "work",
    title: "Work Experience",
    icon: <BriefcaseBusiness className="w-4 h-4" />,
    to: "work-experience",
  },
  {
    id: "education",
    title: "Education",
    icon: <GraduationCap className="w-4 h-4" />,
    to: "education",
  },
  {
    id: "activity",
    title: "Activity",
    icon: <FileChartColumnIncreasing className="w-4 h-4" />,
    to: "activity",
  },
  {
    id: "projects",
    title: "Projects",
    icon: <FolderClosed className="w-4 h-4" />,
    to: "projects",
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    to: "analytics",
  },
  {
    id: "expertise",
    title: "Expertise",
    icon: <Wrench className="w-4 h-4" />,
    to: "expertise",
  },
  {
    id: "workspace",
    title: "Workspace",
    icon: <Workflow className="w-4 h-4" />,
    to: "workspace",
  },
  {
    id: "exit",
    title: "Exit",
    icon: <LogOut />,
    to: "",
  },
];
interface prop{
  role : string
}

export default function Sidebar({role} : prop) {
  const params = useParams();
  const pathname = usePathname();
  // const [date,setData] = useState(role == 'user' ? )
  const data = role == 'user' ? sections : navItems
  const id = params?.id as string;

  const [isOpen, setIsOpen] = useState(false);

  const isActive = (to: string) => {
    const fullPath = `/${id}${to ? `/${to}` : ""}`;
    return pathname === fullPath;
  };

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/sign-in",
    });
  };

  const sidebarContent = (
    <aside className="w-64 bg-white border-r border-[#E8EDF2] h-screen flex flex-col">
      
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-[#E8EDF2]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0EA472] to-[#059669] flex items-center justify-center text-white font-bold text-sm">
          D
        </div>

        <span className="text-base font-bold text-[#0D1B2A] tracking-[-0.3px]">
          Dev<span className="text-[#0EA472]">Nautics</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {data.map((section) => {
          const active = isActive(section.to);

          return (
            <Link
              key={section.id}
              href={
                `${role == 'admin' ? `${section.to}` : `${section.to}`}`
              }
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? "bg-[#EDF7F3] text-[#0EA472]"
                  : "text-[#64748B] hover:bg-[#F8FAFB] hover:text-[#0D1B2A]"
              }`}
            >
              {section.icon}

              <span>{section.title}</span>

              {active && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-[#E8EDF2]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F8FAFB] hover:text-red-500 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-[#0D1B2A] text-white shadow-md"
      >
        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <Menu className="w-4 h-4" />
        )}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen z-30">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 lg:hidden transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}