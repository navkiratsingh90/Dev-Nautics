"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import {
  UserRound, BriefcaseBusiness, GraduationCap, FileChartColumnIncreasing,
  FolderClosed, BarChart3, Wrench, Workflow, LogOut, Menu, X, ChevronRight,
} from "lucide-react";

interface Section { id: string; title: string; icon: React.ReactNode; to: string; }

const sections: Section[] = [
  { id: "user",      title: "User Details",     icon: <UserRound className="w-4 h-4" />,                   to: ""               },
  { id: "work",      title: "Work Experience",  icon: <BriefcaseBusiness className="w-4 h-4" />,           to: "work-experience"},
  { id: "education", title: "Education",        icon: <GraduationCap className="w-4 h-4" />,               to: "education"      },
  { id: "activity",  title: "Activity",         icon: <FileChartColumnIncreasing className="w-4 h-4" />,   to: "activity"       },
  { id: "projects",  title: "Projects",         icon: <FolderClosed className="w-4 h-4" />,                to: "projects"       },
  { id: "analytics", title: "Analytics",        icon: <BarChart3 className="w-4 h-4" />,                   to: "analytics"      },
  { id: "expertise", title: "Expertise",        icon: <Wrench className="w-4 h-4" />,                      to: "expertise"      },
  { id: "workspace", title: "Workspace",        icon: <Workflow className="w-4 h-4" />,                    to: "workspace"      },
];

const Sidebar: React.FC = () => {
  const params   = useParams();
  const pathname = usePathname();
  const id       = params?.id as string;

  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const [isOpen, setIsOpen] = useState(false);

  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const bg      = darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const muted   = darkMode ? "text-gray-400" : "text-gray-500";
  const heading = darkMode ? "text-white"    : "text-gray-900";

  function isActive(to: string) {
    const full = `/${id}${to ? `/${to}` : ""}`;
    return pathname === full;
  }

  const sidebarContent = (
    <div className={`flex flex-col h-full w-72 border-r transition-colors duration-300 ${bg}`}>

      {/* Logo */}
      <div className={`px-6 py-6 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20`}>
            D
          </div>
          <span className={`text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent`}>
            DevConnect
          </span>
        </div>
        <p className={`text-[11px] ${muted}`}>Developer community platform</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {sections.map((s) => {
          const active = isActive(s.to);
          return (
            <Link key={s.id} href={`/${id}${s.to ? `/${s.to}` : ""}`} onClick={() => setIsOpen(false)}>
              <div className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                active
                  ? `bg-gradient-to-r ${accentGradient} text-white shadow-md shadow-violet-500/20`
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}>
                <div className="flex items-center gap-3">
                  <span className={active ? "text-white" : ""}>{s.icon}</span>
                  {s.title}
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`px-3 py-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
        <button className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] ${darkMode ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-red-400 border border-gray-700" : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200"}`}>
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 lg:hidden w-9 h-9 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${accentGradient} text-white`}>
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-full z-30">{sidebarContent}</div>

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 h-full z-50 lg:hidden transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;