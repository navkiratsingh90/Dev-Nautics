"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sun, Moon, ChevronDown, ArrowRight, CheckCircle } from "lucide-react";

// import Navbar from "@/components/Navbar";
// import { handleTheme } from "@/Features/ThemeSlice";

// Types
interface Feature {
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

interface Stat {
  number: string;
  label: string;
}

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
  company: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}

const page: React.FC = () => {
	console.log("here");
	
  const darkMode = true
	// useSelector((state: any) => state.Theme.darkMode);
  // const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const features: Feature[] = [
    {
      title: "Code & Decode",
      description: "Participate in coding contests, solve daily puzzles, and challenge yourself with coding questions.",
      icon: "🧩",
      benefits: ["Daily coding challenges", "Compete with developers worldwide", "Improve problem-solving skills", "Win prizes and recognition"],
    },
    {
      title: "Smart Project Matching",
      description: "Find the perfect collaborators for your projects based on skills, experience, and availability.",
      icon: "🔍",
      benefits: ["AI-powered matching algorithm", "Filter by tech stack and experience", "Time commitment matching", "Portfolio-based selection"],
    },
    {
      title: "Active Posting",
      description: "Share your projects, ideas, and knowledge with the developer community.",
      icon: "💬",
      benefits: ["Reach a targeted audience", "Get feedback on your work", "Build your reputation"],
    },
    {
      title: "Real-time Chatrooms",
      description: "Connect with developers instantly through topic-based chatrooms.",
      icon: "💻",
      benefits: ["Discuss specific technologies", "Get help with coding problems", "Network in real-time"],
    },
    {
      title: "Event Promotion",
      description: "Discover and promote tech events, hackathons, and meetups.",
      icon: "📅",
      benefits: ["Find local developer events", "Promote your own events", "Connect with attendees"],
    },
    {
      title: "Find Similar People",
      description: "Connect with developers who share your interests and tech stack.",
      icon: "👥",
      benefits: ["Match based on skills", "Find collaboration partners", "Build your professional network"],
    },
    {
      title: "Project Collaboration",
      description: "Find team members for your projects or join exciting new initiatives.",
      icon: "🤝",
      benefits: ["Showcase your projects", "Find skilled collaborators", "Manage tasks together"],
    },
    {
      title: "Learning Resources",
      description: "Access curated learning materials and share knowledge with peers.",
      icon: "📚",
      benefits: ["Share tutorials and guides", "Discover new technologies", "Learn from experts"],
    },
  ];

  const stats: Stat[] = [
    { number: "50K+", label: "Active Developers" },
    { number: "120+", label: "Countries" },
    { number: "25K+", label: "Projects Shared" },
    { number: "500+", label: "Monthly Events" },
    { number: "10K+", label: "Daily Coding Challenges" },
    { number: "5K+", label: "Successful Matches" },
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      avatar: "SJ",
      text: "Found my current job through DevNetwork! The community is incredibly supportive and the project collaboration features are amazing.",
      rating: 5,
      company: "Tech Innovations Inc.",
    },
    {
      name: "Michael Chen",
      role: "Full Stack Developer",
      avatar: "MC",
      text: "The Code & Decode challenges have significantly improved my problem-solving skills. I've landed two job offers thanks to my contest rankings!",
      rating: 5,
      company: "Digital Solutions LLC",
    },
    {
      name: "Jessica Williams",
      role: "UX Engineer",
      avatar: "JW",
      text: "As a remote worker, DevNetwork has been invaluable for staying connected with the developer community and finding new opportunities.",
      rating: 4,
      company: "WebCraft Studios",
    },
    {
      name: "David Kim",
      role: "DevOps Engineer",
      avatar: "DK",
      text: "The smart matching algorithm found me the perfect team for my startup idea. We've been working together for 6 months now and just secured funding!",
      rating: 5,
      company: "Cloud Systems Ltd.",
    },
  ];

  const faqs: FAQ[] = [
    {
      question: "How much does it cost to join DevNetwork?",
      answer: "DevNetwork offers a free basic plan with access to most features. Premium plans start at $9.99/month.",
    },
    {
      question: "Can I use DevNetwork to find job opportunities?",
      answer: "Yes! Showcase your projects and connect with potential employers directly.",
    },
    {
      question: "How does the Code & Decode contest system work?",
      answer: "We host daily coding challenges and weekly themed contests. Points are awarded based on solution efficiency and code quality, with leaderboards tracking top performers.",
    },
    {
      question: "How does the project matching algorithm work?",
      answer: "Our AI analyzes your skills, project preferences, availability, and past work to find the most compatible collaborators for your projects.",
    },
    {
      question: "Is my data secure on DevNetwork?",
      answer: "All data is encrypted, and we never share your personal information without consent.",
    },
    {
      question: "Can I promote my own events on the platform?",
      answer: "Yes! Create, manage, and promote events to the community or specific interest groups.",
    },
    {
      question: "Do coding contests have prizes?",
      answer: "Yes! Top performers win cash prizes, premium subscriptions, and exclusive job opportunities from our partner companies.",
    },
  ];

  const howItWorks: HowItWorksStep[] = [
    {
      step: 1,
      title: "Create Your Profile",
      description: "Set up your developer profile with your skills, interests, and portfolio projects.",
      icon: "👤",
    },
    {
      step: 2,
      title: "Take a Skills Assessment",
      description: "Complete our coding assessment to help us match you with appropriate challenges and collaborators.",
      icon: "📝",
    },
    {
      step: 3,
      title: "Join Challenges & Find Projects",
      description: "Participate in coding contests or browse projects looking for collaborators.",
      icon: "🧩",
    },
    {
      step: 4,
      title: "Collaborate & Grow",
      description: "Work on projects together, share knowledge, and advance your career.",
      icon: "🚀",
    },
  ];

  const toggleFAQ = (index: number) => setActiveFAQ(activeFAQ === index ? null : index);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for subscribing with ${email}! We'll keep you updated.`);
    setEmail("");
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-gray-400"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));

  return (
    <>
      <div className={`transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Connect. Collaborate. <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Code.</span>
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-gray-600 dark:text-gray-300">
                The ultimate platform for developers to share projects, find collaborators, join events, solve coding challenges, and grow their network in the tech community.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center px-8 py-3 rounded-full text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/challenges"
                  className="inline-flex items-center px-8 py-3 rounded-full text-lg font-semibold border border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                >
                  Explore Challenges
                </Link>
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-blue-400" />
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-16 ${darkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-blue-500">{stat.number}</div>
                  <div className={`text-sm md:text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-20 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Grow as a Developer</h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">Connect, learn, collaborate, and challenge yourself.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 ${
                    darkMode ? "bg-gray-800 hover:shadow-blue-900/20" : "bg-white hover:shadow-xl"
                  }`}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className={`py-20 ${darkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How DevNetwork Works</h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">Follow these simple steps to begin your journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {howItWorks.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl ${
                    darkMode ? "bg-blue-800" : "bg-blue-100"
                  }`}>{step.icon}</div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    darkMode ? "bg-blue-700 text-white" : "bg-blue-600 text-white"
                  } font-bold`}>{step.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={`py-20 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Developers Say</h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">Join thousands of developers who have found their community on our platform.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                      <span className="text-white font-bold">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-blue-500">{testimonial.role}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
                  <p className="italic text-gray-700 dark:text-gray-300">"{testimonial.text}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={`py-20 ${darkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-400">Everything you need to know about the platform.</p>
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`rounded-xl overflow-hidden ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } shadow-md transition-all duration-300`}
                >
                  <button
                    className={`flex justify-between items-center w-full p-6 text-left ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleFAQ(i)}
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeFAQ === i ? "rotate-180" : ""
                      } text-blue-500`}
                    />
                  </button>
                  {activeFAQ === i && (
                    <div className="p-6 pt-0 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Community?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-10 opacity-90">Create your free account today and start connecting with developers worldwide.</p>
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="text-2xl font-bold">
                  <span className="text-blue-500">Dev</span>
                  <span>Network</span>
                </div>
                <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">Connect. Collaborate. Code.</p>
              </div>
              <div className="flex gap-8">
                <Link href="/about" className="hover:text-blue-500 transition-colors">About</Link>
                <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms</Link>
                <Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} DevNetwork. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default page;