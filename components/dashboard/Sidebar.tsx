"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
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

export default function Sidebar() {
  const params = useParams();
  const pathname = usePathname();
  const id = params?.id as string;
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (to: string) => {
    const full = `/${id}${to ? `/${to}` : ""}`;
    return pathname === full;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-72 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <span className="text-xl font-bold text-gray-900">DevConnect</span>
        </div>
        <p className="text-[11px] text-gray-500">Developer community platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {sections.map((s) => {
          const active = isActive(s.to);
          return (
            <Link
              key={s.id}
              href={`/${id}${s.to ? `/${s.to}` : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <div
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {s.icon}
                  {s.title}
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sign out button */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-gray-800 text-white shadow-md"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      {/* Desktop sidebar (always visible) */}
      <div className="hidden lg:block fixed top-0 left-0 h-full z-30">
        {sidebarContent}
      </div>

      {/* Mobile drawer (slides in) */}
      <div
        className={`fixed top-0 left-0 h-full z-50 lg:hidden transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}