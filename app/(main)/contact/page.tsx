"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, User, MessageSquare, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ username: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ username: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-sm text-gray-500 mt-1">Get in touch with our team</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-sm text-gray-600 mb-6">
              Have a question or want to collaborate? Reach out to us and our team will get back to you as soon as possible.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Phone</h3>
                  <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Email</h3>
                  <p className="text-sm text-gray-500">contact@devnetwork.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Office</h3>
                  <p className="text-sm text-gray-500">123 Developer Street, Tech City, TC 12345</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3">Follow Us</h3>
              <div className="flex gap-3">
                {["Twitter", "GitHub", "LinkedIn", "Discord"].map((platform) => (
                  <div key={platform} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold hover:bg-gray-200">
                    {platform[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h2>
            {submitted ? (
              <div className="text-center py-8 space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">Message Sent!</h3>
                <p className="text-sm text-gray-500">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                      placeholder="Type your message here..."
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}