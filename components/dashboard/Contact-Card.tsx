"use client";

import { Phone, MapPin, Mail, Linkedin, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "../types/User";

interface ContactCardProps {
  user: User;
  darkMode: boolean;
}

export const ContactCard = ({ user, darkMode }: ContactCardProps) => {
  return (
    <Card
      className={`mt-6 sm:mt-8 ${
        darkMode ? "bg-[var(--color-darkBlue)]" : "bg-[var(--color-white)]"
      }`}
    >
      <CardHeader>
        <CardTitle
          className={`${
            darkMode ? "text-white" : "text-gray-800"
          } text-lg sm:text-xl`}
        >
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card
            className={`p-3 flex items-center gap-3 ${
              darkMode ? "bg-gray-700" : "bg-blue-50"
            }`}
          >
            <Mail className="h-4 w-4 text-blue-500" />
            <span
              className={`text-sm sm:text-base ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {user.email}
            </span>
          </Card>
          <Card
            className={`p-3 flex items-center gap-3 ${
              darkMode ? "bg-gray-700" : "bg-blue-50"
            }`}
          >
            <Phone className="h-4 w-4 text-blue-500" />
            <span
              className={`text-sm sm:text-base ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {user.phone}
            </span>
          </Card>
          <Card
            className={`p-3 flex items-center gap-3 ${
              darkMode ? "bg-gray-700" : "bg-blue-50"
            }`}
          >
            <MapPin className="h-4 w-4 text-blue-500" />
            <span
              className={`text-sm sm:text-base ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {user.location}
            </span>
          </Card>
          <Card
            className={`p-3 flex items-center gap-3 ${
              darkMode ? "bg-gray-700" : "bg-blue-50"
            }`}
          >
            <div className="flex gap-2">
              {user.socialLinks?.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {user.socialLinks?.github && (
                <a
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
            </div>
            <span
              className={`text-sm sm:text-base ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Social Profiles
            </span>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};