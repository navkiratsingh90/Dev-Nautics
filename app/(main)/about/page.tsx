"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Send, Sparkles, Users, Globe, FolderGit2, Calendar } from "lucide-react";
import { toast } from "sonner";

// Shadcn components (reused as is)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Types
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: { twitter: string; linkedin: string; github: string };
}

const teamMembers: TeamMember[] = [
  {
    name: "Alex Johnson",
    role: "Founder & CEO",
    bio: "Full-stack developer with 10+ years of experience building scalable web applications.",
    avatar: "AJ",
    social: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    name: "Sarah Williams",
    role: "CTO",
    bio: "Expert in cloud infrastructure and DevOps. Loves open-source contributions.",
    avatar: "SW",
    social: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    name: "Michael Chen",
    role: "Lead Designer",
    bio: "UI/UX designer focused on developer tools and intuitive experiences.",
    avatar: "MC",
    social: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    name: "Emily Rodriguez",
    role: "Community Manager",
    bio: "Builds and nurtures developer communities, organizes tech events.",
    avatar: "ER",
    social: { twitter: "#", linkedin: "#", github: "#" }
  }
];

const stats = [
  { number: "50K+", label: "Active Users", icon: Users },
  { number: "120+", label: "Countries", icon: Globe },
  { number: "25K+", label: "Projects Shared", icon: FolderGit2 },
  { number: "500+", label: "Monthly Events", icon: Calendar }
];

export default function AboutUsPage() {
  const darkMode = useAppSelector((state: any) => state.Theme.darkMode);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theme tokens (matching all other pages)
  const bg = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const cardBg = darkMode ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Hero Section (shortened) */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium bg-violet-500/10 border-violet-500/30 text-violet-400">
            <Sparkles className="w-3.5 h-3.5" />
            About DevNetwork
          </div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 ${headingText}`}>
            Connecting Developers Worldwide
          </h1>
          <p className={`text-sm mt-2 max-w-2xl mx-auto ${mutedText}`}>
            Founded in 2020, we’re on a mission to create the most inclusive and supportive developer community.
          </p>
        </div>

        {/* Stats Cards (compact) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`group relative rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 hover:shadow-xl ${cardBg}`}>
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-violet-400" />
              <div className={`text-2xl font-bold ${headingText}`}>{stat.number}</div>
              <div className={`text-xs ${mutedText}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Values (side by side, shorter text) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`group relative rounded-2xl border p-6 transition-all hover:shadow-xl ${cardBg}`}>
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
            <h2 className={`text-xl font-bold mb-2 ${headingText}`}>Our Mission</h2>
            <p className={`text-sm ${mutedText}`}>
              Create the world’s most inclusive developer community, where developers of all skill levels connect,
              learn, and collaborate on meaningful projects.
            </p>
          </div>
          <div className={`group relative rounded-2xl border p-6 transition-all hover:shadow-xl ${cardBg}`}>
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
            <h2 className={`text-xl font-bold mb-2 ${headingText}`}>Our Values</h2>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2"><Badge className="bg-green-500/20 text-green-400 border-0">✓</Badge> Inclusivity & diversity</li>
              <li className="flex items-center gap-2"><Badge className="bg-green-500/20 text-green-400 border-0">✓</Badge> Open knowledge sharing</li>
              <li className="flex items-center gap-2"><Badge className="bg-green-500/20 text-green-400 border-0">✓</Badge> Community-driven development</li>
              <li className="flex items-center gap-2"><Badge className="bg-green-500/20 text-green-400 border-0">✓</Badge> Innovation through collaboration</li>
            </ul>
          </div>
        </div>

        {/* Team Section (grid, shorter bios) */}
        <div>
          <h2 className={`text-2xl font-bold text-center mb-6 ${headingText}`}>Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {teamMembers.map((member, idx) => (
              <div key={idx} className={`group relative rounded-2xl border p-5 text-center transition-all hover:-translate-y-1 hover:shadow-xl ${cardBg}`}>
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xl">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <h3 className={`text-lg font-semibold ${headingText}`}>{member.name}</h3>
                <p className="text-xs text-violet-400 mb-2">{member.role}</p>
                <p className={`text-xs ${mutedText} mb-3 line-clamp-2`}>{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a href={member.social.twitter} className="text-gray-500 hover:text-blue-400 transition"><Twitter className="w-4 h-4" /></a>
                  <a href={member.social.linkedin} className="text-gray-500 hover:text-blue-400 transition"><Linkedin className="w-4 h-4" /></a>
                  <a href={member.social.github} className="text-gray-500 hover:text-blue-400 transition"><Github className="w-4 h-4" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form + Office Map (two columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className={`group relative rounded-2xl border p-6 transition-all hover:shadow-xl ${cardBg}`}>
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${headingText}`}>
              <Mail className="w-5 h-5 text-violet-400" /> Send us a message
            </h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <Input
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
                className={darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}
              />
              <Input
                type="email"
                placeholder="Email address"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
                className={darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}
              />
              <Textarea
                rows={3}
                placeholder="Your message..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                className={darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r ${accentGradient} text-white shadow-md hover:shadow-lg transition-all`}
              >
                {isSubmitting ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
              </Button>
            </form>
          </div>

          {/* Office & Contact Info */}
          <div className={`group relative rounded-2xl border p-6 transition-all hover:shadow-xl ${cardBg}`}>
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${headingText}`}>
              <MapPin className="w-5 h-5 text-cyan-400" /> Visit Us
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <span className={mutedText}>123 Developer Street, Tech City, TC 12345, United States</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5" />
                <a href="mailto:contact@devnetwork.com" className="text-blue-400 hover:underline">contact@devnetwork.com</a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-blue-400 mt-0.5" />
                <span className={mutedText}>+1 (555) 123-4567</span>
              </div>
            </div>
            <div className="mt-4 h-48 rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.621465758367!2d-74.00594934867064!3d40.71278407922845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a4c6ae7b1c3%3A0x4cbe382cb6e2cc70!2sStatue%20of%20Liberty!5e0!3m2!1sen!2sus!4v1644262079993!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Office Location"
                className="rounded-xl"
              ></iframe>
            </div>
          </div>
        </div>

        {/* CTA (shorter) */}
        <div className={`rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 p-8 text-center text-white`}>
          <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
          <p className="text-sm opacity-90 mb-4">Become part of our growing developer community today.</p>
          <Link href="/signup">
            <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}