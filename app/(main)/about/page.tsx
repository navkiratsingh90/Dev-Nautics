"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Send, Sparkles, Users, Globe, FolderGit2, Calendar } from "lucide-react";

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
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs text-green-700">
            <Sparkles className="w-3.5 h-3.5" /> About DevNetwork
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Connecting Developers Worldwide</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
            Founded in 2020, we're on a mission to create the most inclusive and supportive developer community.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-gray-500" />
              <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h2>
            <p className="text-sm text-gray-600">
              Create the world's most inclusive developer community, where developers of all skill levels connect,
              learn, and collaborate on meaningful projects.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Our Values</h2>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">✓ Inclusivity & diversity</li>
              <li className="flex items-center gap-2">✓ Open knowledge sharing</li>
              <li className="flex items-center gap-2">✓ Community-driven development</li>
              <li className="flex items-center gap-2">✓ Innovation through collaboration</li>
            </ul>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xl">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-xs text-green-600 mb-2">{member.role}</p>
                <p className="text-xs text-gray-500 mb-3">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a href={member.social.twitter} className="text-gray-400 hover:text-gray-600"><Twitter className="w-4 h-4" /></a>
                  <a href={member.social.linkedin} className="text-gray-400 hover:text-gray-600"><Linkedin className="w-4 h-4" /></a>
                  <a href={member.social.github} className="text-gray-400 hover:text-gray-600"><Github className="w-4 h-4" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form + Office Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-500" /> Send us a message
            </h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              />
              <textarea
                rows={3}
                placeholder="Your message..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : <><Send className="w-4 h-4 inline mr-2" /> Send Message</>}
              </button>
            </form>
          </div>

          {/* Office & Contact Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" /> Visit Us
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>123 Developer Street, Tech City, TC 12345, United States</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <a href="mailto:contact@devnetwork.com" className="text-blue-600 hover:underline">contact@devnetwork.com</a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>+1 (555) 123-4567</span>
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

        {/* CTA */}
        <div className="bg-gray-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
          <p className="text-sm opacity-90 mb-4">Become part of our growing developer community today.</p>
          <Link href="/signup">
            <button className="px-5 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}