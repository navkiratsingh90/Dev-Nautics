"use client";

import React from "react";
// import { useAppSelector } from "@/hooks/hooks"; // ✅ use typed hook

const Footer: React.FC = () => {
  const darkMode = true
	// useAppSelector((state) => state.theme.darkMode);

  return (
    <footer
      className={`py-12 ${
        darkMode ? "bg-gray-800" : "bg-gray-900"
      } text-white`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <h4 className="font-bold mb-4 text-xl">DevNetwork</h4>
          <p className="text-gray-400">
            Connecting developers worldwide to share knowledge, collaborate, and grow together.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4">Features</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Coding Contests</li>
            <li>Project Matching</li>
            <li>Community Chat</li>
            <li>Event Calendar</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Resources</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Docs</li>
            <li>Community</li>
            <li>Help Center</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <span>🐦</span>
            <span>💼</span>
            <span>📸</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;