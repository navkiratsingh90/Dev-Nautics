"use client";

import React from "react";
import { Calendar, MapPin, Users, X } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: { type: "online" | "offline"; venue?: string; platform?: string; link?: string };
  tags: string[];
  registrationLink: string;
  imageUrl: string;
  capacity: number;
  price: number;
  attendees: number;
}

interface EventCardProps {
  event: Event;
  darkMode: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  getEventTypeColor: (type: string) => string;
  formatDate: (dateString: string) => string;
}

const EventCard = ({
  event,
  darkMode,
  onClick,
  onDelete,
  getEventTypeColor,
  formatDate,
}: EventCardProps) => {
  const spotsLeft = event.capacity - event.attendees;
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  return (
    <div
      onClick={onClick}
      className={`group relative w-[380px] rounded-2xl border shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
        darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Top gradient bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}
      />

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-sm transition-all hover:scale-110 z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Spots left badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white">
          {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${getEventTypeColor(
              event.type
            )}`}
          >
            {event.type}
          </span>
          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            <Users className="inline w-3 h-3 mr-1" />
            {event.attendees}/{event.capacity}
          </span>
        </div>

        <h3 className={`text-lg font-bold mb-2 line-clamp-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 mb-2 text-sm">
          <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
            {formatDate(event.startDate)} • {event.startTime}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3 text-sm">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
            {event.location.type === "online" ? "🌐 Online Event" : event.location.venue}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {event.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                darkMode
                  ? "bg-gray-700 text-gray-300 border border-gray-600"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {tag}
            </span>
          ))}
          {event.tags.length > 3 && (
            <span className={`text-[10px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              +{event.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
          <div>
            <span
              className={`text-lg font-bold ${
                event.price === 0
                  ? "text-green-500"
                  : darkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {event.price === 0 ? "FREE" : `$${event.price}`}
            </span>
            {event.price > 0 && <span className={`text-xs ml-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>USD</span>}
          </div>
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-lg`}
          >
            Register →
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventCard;