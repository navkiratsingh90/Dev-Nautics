"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import {
  Calendar, Clock, MapPin, Users, Tag, DollarSign, Filter, X,
  Plus, Search, ArrowLeft, Sparkles, ChevronDown, Trash2, Edit3,
  Globe, MapPinned, Link as LinkIcon, Mail, ExternalLink
} from "lucide-react";
import EventCard from "@/components/event-card"; // adjust path as needed

// ─── Types ──────────────────────────────────────────────────────────────
interface Location {
  type: "online" | "offline";
  venue?: string;
  address?: string;
  mapLink?: string;
  platform?: string;
  link?: string;
}

interface Organizer {
  name: string;
  email: string;
  website: string;
  linkedin?: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: Location;
  organizer: Organizer;
  tags: string[];
  registrationLink: string;
  imageUrl: string;
  capacity: number;
  price: number;
  attendees: number;
  createdAt: string;
}

interface Filters {
  eventType: string;
  locationType: string;
  priceType: string;
  searchQuery: string;
}

interface NewEventForm {
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  locationType: "online" | "offline";
  venue: string;
  address: string;
  mapLink: string;
  onlinePlatform: string;
  onlineLink: string;
  organizerName: string;
  organizerEmail: string;
  organizerWebsite: string;
  organizerLinkedin: string;
  tags: string;
  registrationLink: string;
  imageUrl: string;
  capacity: string;
  price: string;
}

// ─── Mock Data (same as original) ──────────────────────────────────────
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: "AI Hackathon 2025",
    description: "Join us for a 48-hour hackathon focused on artificial intelligence and machine learning. Build innovative solutions, network with industry experts, and win amazing prizes!",
    type: "Hackathon",
    startDate: "2025-03-15",
    endDate: "2025-03-17",
    startTime: "09:00",
    endTime: "18:00",
    location: {
      type: "offline",
      venue: "Tech Innovation Center",
      address: "123 AI Street, San Francisco, CA 94105",
      mapLink: "https://maps.google.com/?q=Tech+Innovation+Center+San+Francisco"
    },
    organizer: {
      name: "AI Developers Community",
      email: "events@aidevcommunity.com",
      website: "https://aidevcommunity.com",
      linkedin: "https://linkedin.com/company/aidevcommunity"
    },
    tags: ["AI", "Machine Learning", "Python", "Data Science"],
    registrationLink: "https://aidevcommunity.com/hackathon2025",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    capacity: 200,
    price: 0,
    attendees: 147,
    createdAt: "2024-12-01"
  },
  {
    id: 2,
    title: "React Advanced Workshop",
    description: "Deep dive into advanced React patterns, performance optimization, and state management. Hands-on coding sessions with expert instructors.",
    type: "Workshop",
    startDate: "2025-02-20",
    endDate: "2025-02-20",
    startTime: "10:00",
    endTime: "17:00",
    location: {
      type: "online",
      platform: "Zoom",
      link: "https://zoom.us/j/123456789"
    },
    organizer: {
      name: "React Masters",
      email: "workshops@reactmasters.com",
      website: "https://reactmasters.com",
      linkedin: "https://linkedin.com/company/reactmasters"
    },
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    registrationLink: "https://reactmasters.com/advanced-workshop",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    capacity: 50,
    price: 49,
    attendees: 38,
    createdAt: "2024-11-15"
  },
  {
    id: 3,
    title: "Cloud Computing Conference",
    description: "Annual conference featuring talks from cloud experts, hands-on labs, and networking opportunities. Covering AWS, Azure, and Google Cloud platforms.",
    type: "Conference",
    startDate: "2025-04-10",
    endDate: "2025-04-12",
    startTime: "08:30",
    endTime: "19:00",
    location: {
      type: "offline",
      venue: "Convention Center",
      address: "456 Cloud Avenue, Seattle, WA 98101",
      mapLink: "https://maps.google.com/?q=Seattle+Convention+Center"
    },
    organizer: {
      name: "Cloud Professionals Association",
      email: "info@cloudpros.org",
      website: "https://cloudpros.org",
      linkedin: "https://linkedin.com/company/cloudpros"
    },
    tags: ["Cloud", "AWS", "Azure", "DevOps", "Kubernetes"],
    registrationLink: "https://cloudpros.org/conference2025",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    capacity: 500,
    price: 299,
    attendees: 423,
    createdAt: "2024-12-10"
  }
];

// ─── Helper Functions ──────────────────────────────────────────────────
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const getEventTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Hackathon: "bg-purple-500",
    Workshop: "bg-blue-500",
    Conference: "bg-green-500",
    Meetup: "bg-orange-500",
    Webinar: "bg-red-500"
  };
  return colors[type] || "bg-gray-500";
};

// ─── Main Page ─────────────────────────────────────────────────────────
export default function EventsPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const [mounted, setMounted] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);

  // Filters & sorting
  const [filters, setFilters] = useState<Filters>({
    eventType: "all",
    locationType: "all",
    priceType: "all",
    searchQuery: ""
  });
  const [sortBy, setSortBy] = useState("dateNewest");
  const [showFilters, setShowFilters] = useState(false);

  // New event form state
  const [newEvent, setNewEvent] = useState<NewEventForm>({
    title: "",
    description: "",
    type: "Workshop",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    locationType: "online",
    venue: "",
    address: "",
    mapLink: "",
    onlinePlatform: "Zoom",
    onlineLink: "",
    organizerName: "",
    organizerEmail: "",
    organizerWebsite: "",
    organizerLinkedin: "",
    tags: "",
    registrationLink: "",
    imageUrl: "",
    capacity: "",
    price: "0"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter & sort logic
  const filteredAndSortedEvents = events
    .filter(event => {
      if (filters.eventType !== "all" && event.type !== filters.eventType) return false;
      if (filters.locationType !== "all" && event.location.type !== filters.locationType) return false;
      if (filters.priceType === "free" && event.price > 0) return false;
      if (filters.priceType === "paid" && event.price === 0) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return event.title.toLowerCase().includes(q) ||
               event.description.toLowerCase().includes(q) ||
               event.tags.some(tag => tag.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dateNewest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "dateOldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "priceLowHigh": return a.price - b.price;
        case "priceHighLow": return b.price - a.price;
        case "titleAZ": return a.title.localeCompare(b.title);
        case "titleZA": return b.title.localeCompare(a.title);
        default: return 0;
      }
    });

  // Handlers
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({ eventType: "all", locationType: "all", priceType: "all", searchQuery: "" });
    setSortBy("dateNewest");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: Event = {
      id: events.length + 1,
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.locationType === "online"
        ? { type: "online", platform: newEvent.onlinePlatform, link: newEvent.onlineLink }
        : { type: "offline", venue: newEvent.venue, address: newEvent.address, mapLink: newEvent.mapLink },
      organizer: {
        name: newEvent.organizerName,
        email: newEvent.organizerEmail,
        website: newEvent.organizerWebsite,
        linkedin: newEvent.organizerLinkedin
      },
      tags: newEvent.tags.split(",").map(t => t.trim()),
      registrationLink: newEvent.registrationLink,
      imageUrl: newEvent.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      capacity: parseInt(newEvent.capacity) || 0,
      price: parseFloat(newEvent.price) || 0,
      attendees: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setEvents([event, ...events]);
    setShowCreateModal(false);
    // reset form
    setNewEvent({
      title: "", description: "", type: "Workshop", startDate: "", endDate: "", startTime: "", endTime: "",
      locationType: "online", venue: "", address: "", mapLink: "", onlinePlatform: "Zoom", onlineLink: "",
      organizerName: "", organizerEmail: "", organizerWebsite: "", organizerLinkedin: "", tags: "",
      registrationLink: "", imageUrl: "", capacity: "", price: "0"
    });
  };

  const handleDeleteEvent = (eventId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(ev => ev.id !== eventId));
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
    }
  };

  // Theme tokens
  const bg = darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800";
  const cardBg = darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const divider = darkMode ? "border-gray-700/60" : "border-gray-100";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 border-b ${divider} ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/dashboard">
            <button className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105 ${darkMode ? "bg-gray-800 border border-gray-700 hover:bg-gray-700" : "bg-gray-100 border border-gray-200 hover:bg-gray-200"}`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-lg transition-all hover:scale-105`}
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-700/30">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <div>
              <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                <Sparkles className="w-3.5 h-3.5" />
                Developer events
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Tech <span className={accentText}>Events</span>
              </h1>
              <p className={`text-sm mt-2 ${mutedText}`}>
                Discover, join, and create amazing developer events.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className={`text-center px-4 py-3 rounded-xl border min-w-[80px] ${cardBg}`}>
                <div className="text-2xl font-extrabold text-purple-400">{events.length}</div>
                <div className="text-[11px]">Total Events</div>
              </div>
              <div className={`text-center px-4 py-3 rounded-xl border min-w-[80px] ${cardBg}`}>
                <div className="text-2xl font-extrabold text-cyan-400">{filteredAndSortedEvents.length}</div>
                <div className="text-[11px]">Showing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Panel (Collapsible) */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className={`rounded-2xl border shadow-lg p-6 transition-all ${cardBg}`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className={`text-lg font-bold ${headingText}`}>Filter & Sort Events</h2>
              <button onClick={clearAllFilters} className={`text-xs font-medium ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}>
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>Search</label>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={e => handleFilterChange("searchQuery", e.target.value)}
                    placeholder="Title, description, tags..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/30 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>Event Type</label>
                <select
                  value={filters.eventType}
                  onChange={e => handleFilterChange("eventType", e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <option value="all">All Types</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Conference">Conference</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Webinar">Webinar</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>Location</label>
                <select
                  value={filters.locationType}
                  onChange={e => handleFilterChange("locationType", e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <option value="all">All</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${mutedText}`}>Price</label>
                <select
                  value={filters.priceType}
                  onChange={e => handleFilterChange("priceType", e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <option value="all">All</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className={`block text-xs font-semibold mb-2 ${mutedText}`}>Sort by</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "dateNewest", label: "Newest" },
                  { value: "dateOldest", label: "Oldest" },
                  { value: "priceLowHigh", label: "Price: Low → High" },
                  { value: "priceHighLow", label: "Price: High → Low" },
                  { value: "titleAZ", label: "Title A–Z" },
                  { value: "titleZA", label: "Title Z–A" }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                      sortBy === opt.value
                        ? `bg-gradient-to-r ${accentGradient} text-white shadow-sm`
                        : darkMode ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {Object.values(filters).some(v => v !== "all" && v !== "") && (
              <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-gray-700/30">
                {filters.eventType !== "all" && <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-violet-500/20 text-violet-300" : "bg-violet-100 text-violet-700"}`}>Type: {filters.eventType}</span>}
                {filters.locationType !== "all" && <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"}`}>Location: {filters.locationType}</span>}
                {filters.priceType !== "all" && <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"}`}>Price: {filters.priceType}</span>}
                {filters.searchQuery && <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700"}`}>Search: {filters.searchQuery}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-4 flex justify-between items-center">
          <p className={`text-sm ${mutedText}`}>
            Showing <span className="font-semibold">{filteredAndSortedEvents.length}</span> of {events.length} events
          </p>
        </div>

        {filteredAndSortedEvents.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-4xl mx-auto mb-5 shadow-xl`}>
              🎯
            </div>
            <h2 className={`text-2xl font-extrabold mb-2 ${headingText}`}>No events found</h2>
            <p className={`text-sm ${mutedText} max-w-sm mx-auto mb-6`}>
              {events.length === 0
                ? "There are no events yet. Be the first to create one!"
                : "Try adjusting your filters or search query."}
            </p>
            {events.length === 0 ? (
              <button onClick={() => setShowCreateModal(true)} className={`px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white`}>
                Create your first event →
              </button>
            ) : (
              <button onClick={clearAllFilters} className={`px-6 py-2.5 rounded-xl text-sm font-semibold border ${darkMode ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"}`}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEvents.map((event, idx) => (
              <EventCard
                key={event.id}
                event={event}
                darkMode={darkMode}
                onClick={() => setSelectedEvent(event)}
                onDelete={(e) => handleDeleteEvent(event.id, e)}
                getEventTypeColor={getEventTypeColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white"}`} onClick={e => e.stopPropagation()}>
            <div className="relative h-56 overflow-hidden rounded-t-2xl">
              <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition">
                <X className="w-5 h-5" />
              </button>
              <button onClick={(e) => handleDeleteEvent(selectedEvent.id, e)} className="absolute top-4 right-16 p-2 rounded-full bg-red-600/80 text-white hover:bg-red-700 transition">
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getEventTypeColor(selectedEvent.type)}`}>
                  {selectedEvent.type}
                </span>
                <h2 className="text-2xl font-bold text-white mt-2">{selectedEvent.title}</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className={`text-sm ${mutedText}`}>
                      {formatDate(selectedEvent.startDate)}
                      {selectedEvent.startDate !== selectedEvent.endDate && ` – ${formatDate(selectedEvent.endDate)}`}
                      <br />
                      {selectedEvent.startTime} – {selectedEvent.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {selectedEvent.location.type === "online" ? (
                    <Globe className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  ) : (
                    <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className={`text-sm ${mutedText}`}>
                      {selectedEvent.location.type === "online"
                        ? `Online via ${selectedEvent.location.platform}`
                        : `${selectedEvent.location.venue}, ${selectedEvent.location.address}`}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className={`text-sm ${mutedText}`}>{selectedEvent.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Organizer</h3>
                  <p className={`text-sm ${mutedText}`}>
                    {selectedEvent.organizer.name}<br />
                    <a href={`mailto:${selectedEvent.organizer.email}`} className="text-blue-400 hover:underline">{selectedEvent.organizer.email}</a><br />
                    <a href={selectedEvent.organizer.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">Website <ExternalLink className="w-3 h-3" /></a>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Details</h3>
                  <p className={`text-sm ${mutedText}`}>
                    <Users className="inline w-4 h-4 mr-1" /> {selectedEvent.attendees} / {selectedEvent.capacity} attendees<br />
                    <Tag className="inline w-4 h-4 mr-1" /> {selectedEvent.tags.join(", ")}<br />
                    <DollarSign className="inline w-4 h-4 mr-1" /> {selectedEvent.price === 0 ? "Free" : `$${selectedEvent.price}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <a
                  href={selectedEvent.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]`}
                >
                  Register Now
                </a>
                <button
                  onClick={(e) => handleDeleteEvent(selectedEvent.id, e)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal (simplified but functional) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white"}`} onClick={e => e.stopPropagation()}>
            <div className={`sticky top-0 z-10 flex justify-between items-center p-5 border-b ${divider} ${darkMode ? "bg-gray-900" : "bg-white"}`}>
              <div>
                <h2 className={`text-xl font-bold ${headingText}`}>Create New Event</h2>
                <p className={`text-xs ${mutedText}`}>Fill in the details to list your event</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Event Title *</label>
                  <input name="title" value={newEvent.title} onChange={handleInputChange} required className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Type *</label>
                  <select name="type" value={newEvent.type} onChange={handleInputChange} required className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <option>Workshop</option><option>Hackathon</option><option>Conference</option><option>Meetup</option><option>Webinar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Description *</label>
                <textarea name="description" rows={3} value={newEvent.description} onChange={handleInputChange} required className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Start Date</label><input type="date" name="startDate" value={newEvent.startDate} onChange={handleInputChange} className={`w-full px-2 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>End Date</label><input type="date" name="endDate" value={newEvent.endDate} onChange={handleInputChange} className={`w-full px-2 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Start Time</label><input type="time" name="startTime" value={newEvent.startTime} onChange={handleInputChange} className={`w-full px-2 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>End Time</label><input type="time" name="endTime" value={newEvent.endTime} onChange={handleInputChange} className={`w-full px-2 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Location Type</label>
                <select name="locationType" value={newEvent.locationType} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  <option value="online">Online</option><option value="offline">Offline</option>
                </select>
              </div>
              {newEvent.locationType === "offline" ? (
                <div className="grid grid-cols-1 gap-3">
                  <input name="venue" placeholder="Venue" value={newEvent.venue} onChange={handleInputChange} className={`px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
                  <input name="address" placeholder="Address" value={newEvent.address} onChange={handleInputChange} className={`px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
                  <input name="mapLink" placeholder="Map Link" value={newEvent.mapLink} onChange={handleInputChange} className={`px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input name="onlinePlatform" placeholder="Platform (Zoom, Teams...)" value={newEvent.onlinePlatform} onChange={handleInputChange} className={`px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
                  <input name="onlineLink" placeholder="Join Link" value={newEvent.onlineLink} onChange={handleInputChange} className={`px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Organizer Name</label><input name="organizerName" value={newEvent.organizerName} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Organizer Email</label><input type="email" name="organizerEmail" value={newEvent.organizerEmail} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="organizerWebsite" placeholder="Organizer Website" value={newEvent.organizerWebsite} onChange={handleInputChange} className={`px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
                <input name="organizerLinkedin" placeholder="LinkedIn (optional)" value={newEvent.organizerLinkedin} onChange={handleInputChange} className={`px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Tags (comma separated)</label><input name="tags" placeholder="React, AI, Cloud" value={newEvent.tags} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Registration Link</label><input name="registrationLink" placeholder="https://..." value={newEvent.registrationLink} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Capacity</label><input type="number" name="capacity" placeholder="100" value={newEvent.capacity} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Price ($)</label><input type="number" name="price" step="0.01" placeholder="0" value={newEvent.price} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
                <div><label className={`block text-xs font-semibold mb-1 ${mutedText}`}>Image URL</label><input name="imageUrl" placeholder="https://..." value={newEvent.imageUrl} onChange={handleInputChange} className={`w-full px-3 py-2 rounded-xl border text-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`} /></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>Cancel</button>
                <button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-lg transition-all`}>Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}