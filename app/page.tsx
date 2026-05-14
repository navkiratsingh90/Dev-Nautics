"use client";

import Footer from "@/components/Footer";
import Navbar5 from "@/components/Navbar";
import { useAppSelector } from "@/redux/hooks";
import { useState, useEffect, useRef } from "react";

interface Feature {
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

const features: Feature[] = [
  { title: "Code & Decode", description: "Participate in coding contests, solve daily puzzles, and challenge yourself with coding questions.", icon: "🧩", benefits: ["Daily coding challenges", "Compete with developers worldwide", "Improve problem-solving skills", "Win prizes and recognition"] },
  { title: "Smart Project Matching", description: "Find the perfect collaborators for your projects based on skills, experience, and availability.", icon: "🔍", benefits: ["AI-powered matching algorithm", "Filter by tech stack and experience", "Time commitment matching", "Portfolio-based selection"] },
  { title: "Active Posting", description: "Share your projects, ideas, and knowledge with the developer community.", icon: "💬", benefits: ["Reach a targeted audience", "Get feedback on your work", "Build your reputation"] },
  { title: "Real-time Chatrooms", description: "Connect with developers instantly through topic-based chatrooms.", icon: "💻", benefits: ["Discuss specific technologies", "Get help with coding problems", "Network in real-time"] },
  { title: "Event Promotion", description: "Discover and promote tech events, hackathons, and meetups.", icon: "📅", benefits: ["Find local developer events", "Promote your own events", "Connect with attendees"] },
  { title: "Find Similar People", description: "Connect with developers who share your interests and tech stack.", icon: "👥", benefits: ["Match based on skills", "Find collaboration partners", "Build your professional network"] },
  { title: "Project Collaboration", description: "Find team members for your projects or join exciting new initiatives.", icon: "🤝", benefits: ["Showcase your projects", "Find skilled collaborators", "Manage tasks together"] },
  { title: "Learning Resources", description: "Access curated learning materials and share knowledge with peers.", icon: "📚", benefits: ["Share tutorials and guides", "Discover new technologies", "Learn from experts"] },
];

const stats = [
  { value: "50K+", label: "Developers" },
  { value: "12K+", label: "Projects" },
  { value: "200+", label: "Daily Challenges" },
  { value: "98%", label: "Match Rate" },
];

const steps = [
  { number: "01", title: "Create your profile", description: "Showcase your skills, tech stack, and portfolio. Let the community know what you're building and what you're looking for.", icon: "👤" },
  { number: "02", title: "Discover your match", description: "Our AI engine scans thousands of profiles and projects to surface the most relevant collaborators, challenges, and events for you.", icon: "🤖" },
  { number: "03", title: "Collaborate & compete", description: "Join live chatrooms, accept project invites, tackle daily coding puzzles, and build real things with real people.", icon: "⚡" },
  { number: "04", title: "Grow your reputation", description: "Earn badges, climb leaderboards, and build a portfolio of shipped projects that speaks louder than any resume.", icon: "🏆" },
];

const testimonials = [
  { name: "Arjun Mehta", role: "Full-Stack Developer", avatar: "AM", avatarColor: "violet", text: "DevConnect helped me find my co-founder in 3 days. The matching algorithm actually understood my tech stack — it didn't just throw random profiles at me.", stars: 5, tag: "Project Matching" },
  { name: "Sarah Chen", role: "ML Engineer @ Stripe", avatar: "SC", avatarColor: "cyan", text: "The daily coding challenges are genuinely hard in the right way. I've improved more in 2 months here than in a year on other platforms.", stars: 5, tag: "Code & Decode" },
  { name: "Marcus Johnson", role: "Open Source Contributor", avatar: "MJ", avatarColor: "fuchsia", text: "I found three collaborators for my open-source CLI tool within a week. The chatrooms are super focused — no noise, just devs who care.", stars: 5, tag: "Collaboration" },
  { name: "Priya Sharma", role: "Frontend Engineer", avatar: "PS", avatarColor: "amber", text: "Promoted my local React meetup and got 40+ RSVPs from the platform. The event tools are genuinely useful, not just a checkbox feature.", stars: 5, tag: "Events" },
];

const techStack = [
  { name: "TypeScript", color: "#3178C6", icon: "TS" },
  { name: "Python", color: "#3776AB", icon: "PY" },
  { name: "Rust", color: "#CE422B", icon: "RS" },
  { name: "Go", color: "#00ADD8", icon: "GO" },
  { name: "React", color: "#61DAFB", icon: "⚛" },
  { name: "Next.js", color: "#888888", icon: "N" },
  { name: "Node.js", color: "#339933", icon: "N>" },
  { name: "Solidity", color: "#A67FFB", icon: "◈" },
  { name: "Swift", color: "#F05138", icon: "S" },
  { name: "Kotlin", color: "#7F52FF", icon: "K" },
  { name: "C++", color: "#00599C", icon: "C+" },
  { name: "Java", color: "#ED8B00", icon: "J" },
];

const liveActivity = [
  { user: "devkar_92", action: "solved", item: "Binary Tree Zigzag Traversal", time: "2m ago", type: "challenge", avatar: "DK" },
  { user: "sophiebuilds", action: "posted", item: "Looking for React dev — AI startup", time: "5m ago", type: "post", avatar: "SB" },
  { user: "rustacean_x", action: "joined", item: "Systems Programming chatroom", time: "8m ago", type: "chat", avatar: "RX" },
  { user: "miradev", action: "launched", item: "Collaborative Code Review App", time: "12m ago", type: "project", avatar: "MD" },
  { user: "ankitml", action: "solved", item: "LRU Cache — Hard", time: "15m ago", type: "challenge", avatar: "AK" },
  { user: "zoey_codes", action: "RSVP'd", item: "Bangalore DevFest 2025", time: "18m ago", type: "event", avatar: "ZC" },
];

const pricingPlans = [
  { name: "Starter", price: "Free", period: "", description: "For developers just getting started", features: ["5 project postings/month", "Join up to 3 chatrooms", "Daily challenges", "Community feed access", "Basic profile"], cta: "Get Started", highlight: false },
  { name: "Pro", price: "₹499", period: "/month", description: "For serious builders & collaborators", features: ["Unlimited project postings", "All chatrooms + create your own", "Priority AI matching", "Event promotion tools", "Badge & leaderboard access", "Analytics dashboard"], cta: "Start Pro Trial", highlight: true },
  { name: "Team", price: "₹1,999", period: "/month", description: "For dev teams & organizations", features: ["Everything in Pro", "Up to 15 team members", "Private team chatrooms", "Custom hackathon hosting", "Dedicated support", "API access"], cta: "Contact Sales", highlight: false },
];

const faqs = [
  { q: "Is DevConnect free to use?", a: "Yes! The Starter plan is completely free and includes access to daily challenges, community feed, and basic project matching. Pro features are on paid plans." },
  { q: "How does the AI matching work?", a: "Our matching engine analyzes your profile's skills, tech stack, past projects, and availability — then surfaces the most compatible collaborators and projects. It improves as you engage." },
  { q: "Can I host my own hackathon or event?", a: "Absolutely. Pro and Team plan members can create and promote their own events. We provide RSVP tracking, attendee messaging, and post-event recap tools." },
  { q: "Is the code editor in-browser?", a: "Yes. Our challenge runner is fully browser-based, supports 20+ languages, and provides real-time test case feedback. No local setup needed." },
];

const upcomingEvents = [
  { title: "Global Hackathon 2025", date: "Dec 14–16", location: "Online", attendees: 3200, tag: "Hackathon", color: "violet" },
  { title: "Bangalore DevFest", date: "Dec 20", location: "Bangalore, IN", attendees: 850, tag: "Meetup", color: "cyan" },
  { title: "TypeScript Deep Dive", date: "Jan 5", location: "Online", attendees: 1100, tag: "Workshop", color: "fuchsia" },
];

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const avatarColors: Record<string, string> = {
  violet: "bg-violet-500/20 text-violet-400",
  cyan: "bg-cyan-500/20 text-cyan-400",
  fuchsia: "bg-fuchsia-500/20 text-fuchsia-400",
  amber: "bg-amber-500/20 text-amber-400",
};

const activityColors: Record<string, string> = {
  challenge: "bg-violet-500/15 text-violet-400",
  post: "bg-cyan-500/15 text-cyan-400",
  chat: "bg-fuchsia-500/15 text-fuchsia-400",
  project: "bg-green-500/15 text-green-400",
  event: "bg-amber-500/15 text-amber-400",
};

const eventTagColors: Record<string, string> = {
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  fuchsia: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
};

export default function HomePage() {
  // const [darkMode, setDarkMode] = useState(true);
  const darkMode = useAppSelector((state => state.Theme.darkMode))
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const userId = useAppSelector((state) => state.Auth.userId)
  const user = useAppSelector((state) => state.Auth.userId)
 
  const featuresSection = useInView();
  const statsSection = useInView();
  const stepsSection = useInView();
  const testimonialsSection = useInView();
  const techSection = useInView();
  const activitySection = useInView();
  const pricingSection = useInView();
  const faqSection = useInView();
  const eventsSection = useInView();
  const ctaSection = useInView();

  useEffect(() => { setMounted(true); }, []);

  const bg = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
  const cardBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";
  const surfaceBg = darkMode ? "bg-gray-800/30" : "bg-gray-50";
  const navBg = darkMode ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-200";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";
  const divider = darkMode ? "border-gray-800" : "border-gray-200";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans`}>

      {/* ── NAVBAR ── */}
      {/* <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b ${navBg} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white font-bold text-sm`}>D</div>
            <span className={`text-xl font-bold tracking-tight ${accentText}`}>DevConnect</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Community", "Pricing", "Events"].map((item) => (
              <a key={item} href="#" className={`text-sm font-medium transition-colors ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-all ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-yellow-400" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`} aria-label="Toggle theme">
              {darkMode
                ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
                : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
              }
            </button>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${darkMode ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>Sign in</button>
            <button className={`px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-105 active:scale-95`}>Get Started</button>
          </div>
        </div>
      </nav> */}
      {/* <Navbar5/>
       */}
       <Navbar5
        // userId={/* your actual user ID or null */}
        // user={/* your user object if available */}
        accentGradient={accentGradient}
        accentText={accentText}
      />
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(${darkMode ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className={`inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border text-xs font-medium ${darkMode ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}
            style={{ animation: mounted ? "fadeDown 0.6s ease both" : "none" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block animate-pulse" />
            Trusted by 50,000+ developers worldwide
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6" style={{ animation: mounted ? "fadeUp 0.7s ease 0.1s both" : "none" }}>
            <span className={headingText}>Where Developers</span><br />
            <span className={accentText}>Build, Connect &amp; Grow</span>
          </h1>
          <p className={`text-lg md:text-xl ${mutedText} max-w-2xl mx-auto mb-10 leading-relaxed`} style={{ animation: mounted ? "fadeUp 0.7s ease 0.2s both" : "none" }}>
            The all-in-one platform for developers to collaborate on projects, compete in coding challenges, discover events, and build meaningful professional connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ animation: mounted ? "fadeUp 0.7s ease 0.3s both" : "none" }}>
            <button className={`px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/45 transition-all hover:scale-105 active:scale-95`}>Join for Free →</button>
            <button className={`px-8 py-4 rounded-xl text-base font-medium border transition-all hover:scale-105 ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>Explore Features</button>
          </div>
          <div className={`mt-16 mx-auto max-w-2xl rounded-2xl border ${darkMode ? "bg-gray-800/60 border-gray-700/60" : "bg-gray-50 border-gray-200"} backdrop-blur-sm p-5 text-left`}
            style={{ animation: mounted ? "fadeUp 0.8s ease 0.45s both" : "none" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-red-500/70" /><span className="w-3 h-3 rounded-full bg-yellow-500/70" /><span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className={`ml-2 text-xs ${mutedText}`}>devconnect.io — challenge #247</span>
            </div>
            <pre className={`text-sm font-mono ${darkMode ? "text-gray-300" : "text-gray-700"} leading-relaxed overflow-x-auto`}>{`function twoSum(nums: number[], target: number) {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement)!, i];
    map.set(nums[i], i);
  }
}`}</pre>
            <div className="mt-3 flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"}`}>✓ Accepted — O(n)</span>
              <span className={`text-xs ${mutedText}`}>🔥 1,247 devs solved today</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div ref={statsSection.ref} className={`py-16 border-y ${divider} ${surfaceBg}`}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center"
              style={{ opacity: statsSection.inView ? 1 : 0, transform: statsSection.inView ? "none" : "translateY(20px)", transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s` }}>
              <div className={`text-4xl font-extrabold tracking-tight ${accentText}`}>{stat.value}</div>
              <div className={`text-sm mt-1 ${mutedText}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section ref={stepsSection.ref} className="py-28 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-violet-400" : "text-violet-600"}`}>How it works</span>
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mt-3 mb-4 ${headingText}`}>From signup to <span className={accentText}>shipping</span></h2>
          <p className={`text-lg ${mutedText} max-w-xl mx-auto`}>Four steps to go from zero to collaborating with the best developers on the planet.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className={`hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px ${darkMode ? "bg-gray-700" : "bg-gray-200"}`} />
          {steps.map((step, i) => (
            <div key={step.number} className="relative z-10"
              style={{ opacity: stepsSection.inView ? 1 : 0, transform: stepsSection.inView ? "none" : "translateY(30px)", transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s` }}>
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-5 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm relative`}>
                {step.icon}
                <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white text-[10px] font-bold`}>{i + 1}</span>
              </div>
              <div className="text-center">
                <div className={`text-xs font-mono font-bold ${darkMode ? "text-gray-600" : "text-gray-400"} mb-1`}>{step.number}</div>
                <h3 className={`font-bold text-base mb-2 ${headingText}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${mutedText}`}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section ref={featuresSection.ref} className={`py-28 ${surfaceBg} border-y ${divider}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-fuchsia-400" : "text-fuchsia-600"}`}>Platform features</span>
            <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mt-3 mb-4 ${headingText}`}>Everything you need to <span className={accentText}>level up</span></h2>
            <p className={`text-lg ${mutedText} max-w-xl mx-auto`}>A complete ecosystem built for developers who want to ship, learn, and collaborate faster.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <div key={feature.title}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative rounded-2xl border p-6 cursor-default transition-all duration-300 ${cardBg} ${hoveredCard === i ? "scale-[1.025] shadow-2xl " + (darkMode ? "border-violet-500/50 shadow-violet-500/10" : "border-violet-300 shadow-violet-200/60") : ""}`}
                style={{ opacity: featuresSection.inView ? 1 : 0, transform: featuresSection.inView ? "none" : "translateY(30px)", transition: `opacity 0.6s ease ${i * 0.07}s, transform 0.3s ease` }}>
                <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${accentGradient} transition-opacity duration-300 ${hoveredCard === i ? "opacity-100" : "opacity-0"}`} />
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className={`font-bold text-base mb-2 ${headingText}`}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${mutedText} mb-4`}>{feature.description}</p>
                <ul className="space-y-1.5">
                  {feature.benefits.map((b) => (
                    <li key={b} className={`text-xs flex items-start gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <span className="mt-0.5 text-violet-400 shrink-0">✦</span>{b}
                    </li>
                  ))}
                </ul>
                <div className={`mt-5 transition-all duration-200 ${hoveredCard === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
                  <button className={`text-xs font-semibold ${accentText} flex items-center gap-1`}>Explore feature →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ── TECH STACK ── */}
      <section ref={techSection.ref} className={`py-24 border-y ${divider} ${surfaceBg}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-amber-400" : "text-amber-600"}`}>Languages & frameworks</span>
            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight mt-3 mb-3 ${headingText}`}>Code in what you <span className={accentText}>love</span></h2>
            <p className={`text-base ${mutedText}`}>Challenges, projects, and chatrooms organized around every major tech stack.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3"
            style={{ opacity: techSection.inView ? 1 : 0, transform: techSection.inView ? "none" : "translateY(20px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            {techStack.map((tech) => (
              <div key={tech.name}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all hover:scale-105 cursor-default ${darkMode ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500" : "bg-white border-gray-200 text-gray-700 hover:shadow-sm"}`}>
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: tech.color + "CC" }}>{tech.icon}</span>
                {tech.name}
              </div>
            ))}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium ${darkMode ? "border-gray-700 text-gray-500 bg-gray-800/50" : "border-gray-200 text-gray-400 bg-gray-50"}`}>+40 more →</div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section ref={testimonialsSection.ref} className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-green-400" : "text-green-600"}`}>Community love</span>
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mt-3 mb-4 ${headingText}`}>Loved by <span className={accentText}>real developers</span></h2>
          <p className={`text-lg ${mutedText} max-w-xl mx-auto`}>Don&apos;t take our word for it. Here&apos;s what the community is saying.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <div key={t.name}
              className={`rounded-2xl border p-6 flex flex-col gap-4 transition-all hover:scale-[1.02] ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"}`}
              style={{ opacity: testimonialsSection.inView ? 1 : 0, transform: testimonialsSection.inView ? "none" : "translateY(30px)", transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${darkMode ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"}`}>{t.tag}</span>
                <div className="flex gap-0.5">{Array.from({ length: t.stars }).map((_, j) => <span key={j} className="text-amber-400 text-xs">★</span>)}</div>
              </div>
              <p className={`text-sm leading-relaxed flex-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>&ldquo;{t.text}&rdquo;</p>
              <div className={`flex items-center gap-3 pt-2 border-t ${divider}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors[t.avatarColor]}`}>{t.avatar}</div>
                <div>
                  <p className={`text-sm font-semibold ${headingText}`}>{t.name}</p>
                  <p className={`text-xs ${mutedText}`}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingSection.ref} className="py-28 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-fuchsia-400" : "text-fuchsia-600"}`}>Pricing</span>
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mt-3 mb-4 ${headingText}`}>Simple, transparent <span className={accentText}>pricing</span></h2>
          <p className={`text-lg ${mutedText} max-w-xl mx-auto`}>Start free. Scale as you grow. No hidden fees, ever.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <div key={plan.name}
              className={`relative rounded-2xl border p-7 flex flex-col transition-all hover:scale-[1.02] ${plan.highlight
                ? `${darkMode ? "bg-gradient-to-b from-violet-900/50 to-gray-800" : "bg-gradient-to-b from-violet-50 to-white"} border-violet-500/60 shadow-xl shadow-violet-500/10`
                : cardBg}`}
              style={{ opacity: pricingSection.inView ? 1 : 0, transform: pricingSection.inView ? "none" : "translateY(30px)", transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s` }}>
              {plan.highlight && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-md whitespace-nowrap`}>Most Popular</div>
              )}
              <div className="mb-6">
                <h3 className={`font-bold text-lg mb-1 ${headingText}`}>{plan.name}</h3>
                <p className={`text-xs ${mutedText} mb-4`}>{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? accentText : headingText}`}>{plan.price}</span>
                  {plan.period && <span className={`text-sm ${mutedText}`}>{plan.period}</span>}
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex items-start gap-2.5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    <span className="text-green-400 shrink-0 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${plan.highlight
                ? `bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40`
                : `border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqSection.ref} className={`py-24 border-y ${divider} ${surfaceBg}`}>
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}>FAQ</span>
            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight mt-3 ${headingText}`}>Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i}
                className={`rounded-xl border overflow-hidden transition-all ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                style={{ opacity: faqSection.inView ? 1 : 0, transform: faqSection.inView ? "none" : "translateY(15px)", transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s` }}>
                <button
                  className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-medium text-sm transition-colors ${darkMode ? "text-white hover:bg-gray-700/50" : "text-gray-900 hover:bg-gray-50"}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <span className={`text-lg transition-transform shrink-0 ${openFaq === i ? "rotate-45" : ""} ${mutedText}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className={`px-5 pb-4 text-sm leading-relaxed ${mutedText} border-t ${divider}`}>
                    <div className="pt-3">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-20 max-w-2xl mx-auto px-6 text-center">
        <div className={`inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border text-xs font-medium ${darkMode ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-600"}`}>
          📬 Weekly dev digest
        </div>
        <h2 className={`text-3xl font-extrabold tracking-tight mb-3 ${headingText}`}>Stay in the loop</h2>
        <p className={`text-base ${mutedText} mb-8`}>Get weekly challenge picks, trending projects, and dev community highlights — straight to your inbox.</p>
        {subscribed ? (
          <div className={`py-4 px-8 rounded-xl text-sm font-medium ${darkMode ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-green-50 text-green-600 border border-green-200"}`}>
            🎉 You&apos;re subscribed! Welcome to the community.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/40 ${darkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
            />
            <button onClick={() => { if (email) setSubscribed(true); }}
              className={`px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentGradient} text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap`}>
              Subscribe →
            </button>
          </div>
        )}
      </section>

      {/* ── FINAL CTA ── */}
      <section ref={ctaSection.ref} className={`py-28 border-t ${divider} ${surfaceBg}`}>
        <div className="max-w-3xl mx-auto px-6 text-center"
          style={{ opacity: ctaSection.inView ? 1 : 0, transform: ctaSection.inView ? "none" : "translateY(30px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
          <div className={`inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border text-xs font-medium ${darkMode ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300" : "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600"}`}>
            🚀 Start building today — it&apos;s free
          </div>
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-5 ${headingText}`}>
            Ready to join the best<br /><span className={accentText}>developer community?</span>
          </h2>
          <p className={`text-lg ${mutedText} mb-10 max-w-xl mx-auto`}>Connect with thousands of developers, tackle real-world challenges, and ship projects that matter.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={`px-10 py-4 rounded-xl text-base font-semibold bg-gradient-to-r ${accentGradient} text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 active:scale-95`}>Create Free Account →</button>
            <button className={`px-10 py-4 rounded-xl text-base font-medium border transition-all hover:scale-105 ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-600 hover:bg-white"}`}>View Demo</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      {/* <footer className={`py-12 border-t ${divider}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white font-bold text-xs`}>D</div>
                <span className={`font-bold ${accentText}`}>DevConnect</span>
              </div>
              <p className={`text-sm leading-relaxed ${mutedText} max-w-xs`}>The platform where developers build, connect, and grow together. Join 50,000+ developers today.</p>
            </div>
            {[
              { heading: "Platform", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { heading: "Community", links: ["Challenges", "Projects", "Events", "Leaderboard"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${mutedText}`}>{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className={`text-sm transition-colors ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"}`}>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={`pt-6 border-t ${divider} flex flex-col md:flex-row items-center justify-between gap-4`}>
            <p className={`text-sm ${mutedText}`}>© 2025 DevConnect. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "Cookies"].map((link) => (
                <a key={link} href="#" className={`text-sm transition-colors ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"}`}>{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer> */}
      <Footer/>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}