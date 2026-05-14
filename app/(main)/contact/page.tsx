"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Phone, MapPin, User, MessageSquare, CheckCircle } from "lucide-react";

// Shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Redux
// import { handleTheme } from "@/Features/ThemeSlice";

export default function ContactPage() {
  const darkMode = true
  // useSelector((state: any) => state.Theme.darkMode);
  // const dispatch = useDispatch();

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
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Contact Us</h1>
            <p className={`mt-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Get in touch with our team</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            // onClick={() => dispatch(handleTheme())}
            className={darkMode ? "bg-blue-800 text-blue-200 border-blue-700" : "bg-blue-100 text-blue-800 border-blue-200"}
          >
            {darkMode ? "☀️" : "🌙"}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info Card */}
          <Card className={darkMode ? "bg-gray-800 border-0" : "bg-white"}>
            <CardHeader>
              <CardTitle className={darkMode ? "text-white" : "text-gray-800"}>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className={`text-muted-foreground ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Have a question or want to collaborate? Reach out to us and our team will get back to you as soon as possible.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">contact@devnetwork.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-sm text-muted-foreground">123 Developer Street, Tech City, TC 12345</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {["Twitter", "GitHub", "LinkedIn", "Discord"].map((platform) => (
                    <div key={platform} className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center hover:scale-105 transition">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{platform[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form Card */}
          <Card className={darkMode ? "bg-gray-800 border-0" : "bg-white"}>
            <CardHeader>
              <CardTitle className={darkMode ? "text-white" : "text-gray-800"}>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8 space-y-2">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold">Message Sent!</h3>
                  <p className="text-muted-foreground">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="pl-9"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="pl-9"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <div className="relative mt-1">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        className="pl-9"
                        placeholder="Type your message here..."
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}