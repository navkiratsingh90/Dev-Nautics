"use client";

import { Pencil, Loader2, Globe } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { User } from "../../types/User";

interface ProfileCardProps {
  user: User;
  totalActivities: number;
  isOwnProfile: boolean;
  isConnected: boolean;
  isRequestSent: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  isEditOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  darkMode: boolean;
}

export const ProfileCard = ({
  user,
  totalActivities,
  isOwnProfile,
  isConnected,
  isRequestSent,
  isConnecting,
  onConnect,
  isEditOpen,
  onEditOpenChange,
  darkMode,
}: ProfileCardProps) => {
  return (
    <Card
      className={`overflow-hidden rounded-3xl ${
        darkMode ? "bg-[var(--color-darkBlue)]" : "bg-[var(--color-white)]"
      } shadow-lg`}
    >
      <div className="h-24 sm:h-32 rounded-t-3xl bg-gradient-to-r from-blue-500 to-blue-700" />
      <CardContent className="px-4 sm:px-8 pb-8 relative">
        {/* Avatar */}
        <div className="flex justify-center -mt-12 sm:-mt-16 mb-4">
          <div className="relative">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl sm:text-5xl">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 border-2 border-white" />
          </div>
        </div>

        {/* Edit Button (own profile only) */}
        {isOwnProfile && (
          <div className="absolute top-16 sm:top-20 right-4">
            <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Edit Profile</TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-[425px]">
                <div className="p-4">Edit form would go here (demo)</div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Name and Title */}
        <div className="text-center mb-6">
          <h2
            className={`text-2xl sm:text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {user.username}
          </h2>
          <p className="text-blue-600 text-base sm:text-lg">{user.title}</p>
        </div>

        {/* Connection Button (not own profile) */}
        {!isOwnProfile && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={onConnect}
              disabled={isConnected || isRequestSent || isConnecting}
              variant={isConnected ? "secondary" : "default"}
              className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full transition-all ${
                isConnected || isRequestSent
                  ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isConnected
                ? "Connected"
                : isRequestSent
                ? "Request Sent"
                : "Connect +"}
            </Button>
          </div>
        )}

        {/* Skills */}
        <div className="mb-8">
          <h3
            className={`text-base sm:text-lg font-semibold mb-3 text-center ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Skills & Expertise
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {user.skills?.map((skill) => (
              <span
                key={skill}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                  darkMode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          <Card className={darkMode ? "bg-gray-700" : "bg-blue-50"}>
            <CardContent className="text-center p-3 sm:p-4">
              <div
                className={`text-lg sm:text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {user.connectedUsers.length}
              </div>
              <div
                className={`text-xs sm:text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Connections
              </div>
            </CardContent>
          </Card>
          <Card className={darkMode ? "bg-gray-700" : "bg-blue-50"}>
            <CardContent className="text-center p-3 sm:p-4">
              <div
                className={`text-lg sm:text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {totalActivities}
              </div>
              <div
                className={`text-xs sm:text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Posts
              </div>
            </CardContent>
          </Card>
          <Card className={darkMode ? "bg-gray-700" : "bg-blue-50"}>
            <CardContent className="text-center p-3 sm:p-4">
              <div
                className={`text-lg sm:text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {user.projects.length}
              </div>
              <div
                className={`text-xs sm:text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Projects
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio & About */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className={darkMode ? "bg-gray-700" : "bg-blue-50"}>
            <CardHeader>
              <CardTitle
                className={`${
                  darkMode ? "text-white" : "text-gray-800"
                } text-base sm:text-lg`}
              >
                Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`https://${user.portfolio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {user.portfolio}
              </a>
            </CardContent>
          </Card>
          <Card className={darkMode ? "bg-gray-700" : "bg-blue-50"}>
            <CardHeader>
              <CardTitle
                className={`${
                  darkMode ? "text-white" : "text-gray-800"
                } text-base sm:text-lg`}
              >
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {user.about}
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};