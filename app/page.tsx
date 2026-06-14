"use client";

import Navbar5 from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";

// ── Inline SVG Icons (unchanged) ──────────────────────────────
const CodeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const HandshakeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 11L12 6 7 11" />
    <path d="M12 6v8" />
    <path d="M3 22h18" />
    <path d="M5 11v8" />
    <path d="M19 11v8" />
  </svg>
);

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const RocketIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2s-6 6-6 12c0 2.5 1 5 3 6s6 1 6-6c0-6-3-12-3-12z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StatProps {
  value: string;
  label: string;
}

interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TestimonialProps {
  name: string;
  role: string;
  avatar: string;
  text: string;
  tag: string;
}

interface PricingPlanProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

// ── Sub-components (simplified) ──────────────────────────────
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white border border-[#E8EDF2] rounded-2xl p-7 flex flex-col gap-3.5">
    <div className="w-11 h-11 rounded-xl bg-[#EDF7F3] flex items-center justify-center text-[#0EA472]">
      {icon}
    </div>
    <div>
      <h3 className="m-0 mb-1.5 text-[15px] font-semibold text-[#0D1B2A]">{title}</h3>
      <p className="m-0 text-[13.5px] text-[#64748B] leading-relaxed">{description}</p>
    </div>
  </div>
);

const Stat = ({ value, label }: StatProps) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[22px] font-bold text-[#0D1B2A] tracking-[-0.5px]">{value}</span>
    <span className="text-xs text-[#64748B] font-normal">{label}</span>
  </div>
);

const Step = ({ number, title, description, icon }: StepProps) => (
  <div className="flex gap-5 items-start">
    <div className="w-10 h-10 rounded-xl bg-[#0EA472] text-white flex items-center justify-center text-[15px] font-bold flex-shrink-0">
      {icon ? icon : number}
    </div>
    <div>
      <h4 className="m-0 mb-1 text-[15px] font-semibold text-[#0D1B2A]">{title}</h4>
      <p className="m-0 text-[13.5px] text-[#64748B] leading-relaxed">{description}</p>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, avatar, text, tag }: TestimonialProps) => (
  <div className="bg-white border border-[#E8EDF2] rounded-2xl p-6 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#EDF7F3] text-[#0EA472] font-medium">{tag}</span>
      <div className="flex gap-0.5 text-[#F59E0B] text-xs">★★★★★</div>
    </div>
    <p className="text-[13.5px] text-[#64748B] leading-relaxed m-0">&ldquo;{text}&rdquo;</p>
    <div className="flex items-center gap-3 pt-2 border-t border-[#E8EDF2]">
      <div className="w-9 h-9 rounded-full bg-[#EDF7F3] flex items-center justify-center text-[#0EA472] text-xs font-bold">{avatar}</div>
      <div>
        <p className="text-[13px] font-semibold text-[#0D1B2A] m-0">{name}</p>
        <p className="text-[11px] text-[#94A3B8] m-0">{role}</p>
      </div>
    </div>
  </div>
);

const PricingCard = ({ name, price, period, description, features, cta, highlight }: PricingPlanProps) => (
  <div className={`bg-white border rounded-2xl p-7 flex flex-col ${highlight ? 'border-[#0EA472]' : 'border-[#E8EDF2]'}`}>
    {highlight && (
      <div className="mb-4 text-[11px] font-semibold text-[#0EA472] uppercase tracking-wide">Most Popular</div>
    )}
    <h3 className="text-xl font-bold text-[#0D1B2A] m-0 mb-1">{name}</h3>
    <p className="text-[13px] text-[#64748B] mb-4">{description}</p>
    <div className="flex items-baseline gap-1 mb-6">
      <span className="text-3xl font-extrabold text-[#0D1B2A]">{price}</span>
      <span className="text-[13px] text-[#64748B]">{period}</span>
    </div>
    <ul className="space-y-2.5 flex-1 mb-7">
      {features.map((feature) => (
        <li key={feature} className="text-[13px] text-[#64748B] flex items-start gap-2">
          <span className="text-[#0EA472] shrink-0 mt-0.5">✓</span> {feature}
        </li>
      ))}
    </ul>
    <button className={`w-full py-3 rounded-xl text-[13px] font-semibold ${highlight ? 'bg-[#0D1B2A] text-white' : 'bg-white text-[#0D1B2A] border border-[#E8EDF2]'}`}>
      {cta}
    </button>
  </div>
);

const techStack = [
  { name: "TypeScript", color: "#3178C6" },
  { name: "Python", color: "#3776AB" },
  { name: "Rust", color: "#CE422B" },
  { name: "Go", color: "#00ADD8" },
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#888888" },
  { name: "Node.js", color: "#339933" },
  { name: "Solidity", color: "#A67FFB" },
  { name: "Swift", color: "#F05138" },
  { name: "Kotlin", color: "#7F52FF" },
  { name: "C++", color: "#00599C" },
  { name: "Java", color: "#ED8B00" },
];

const faqs = [
  { q: "Is DevConnect free to use?", a: "Yes! The Starter plan is completely free and includes access to daily challenges, community feed, and basic project matching. Pro features are on paid plans." },
  { q: "How does the AI matching work?", a: "Our matching engine analyzes your profile's skills, tech stack, past projects, and availability — then surfaces the most compatible collaborators and projects. It improves as you engage." },
  { q: "Can I host my own hackathon or event?", a: "Absolutely. Pro and Team plan members can create and promote their own events. We provide RSVP tracking, attendee messaging, and post-event recap tools." },
  { q: "Is the code editor in-browser?", a: "Yes. Our challenge runner is fully browser-based, supports 20+ languages, and provides real-time test case feedback. No local setup needed." },
];

export default function DevConnectLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const features: FeatureCardProps[] = [
    { title: "Code & Decode", description: "Daily coding challenges, contests, and puzzles to sharpen your problem-solving skills.", icon: <CodeIcon /> },
    { title: "Smart Project Matching", description: "AI-powered algorithm to find perfect collaborators based on skills, experience, and availability.", icon: <SearchIcon /> },
    { title: "Active Posting", description: "Share your projects, ideas, and knowledge with a targeted developer community.", icon: <ChatIcon /> },
    { title: "Real-time Chatrooms", description: "Topic-based chatrooms to discuss technologies, get help, and network instantly.", icon: <ChatIcon /> },
    { title: "Event Promotion", description: "Discover and promote tech events, hackathons, and meetups in your area.", icon: <CalendarIcon /> },
    { title: "Find Similar People", description: "Connect with developers who share your interests and tech stack for collaboration.", icon: <UsersIcon /> },
    { title: "Project Collaboration", description: "Find team members for your projects or join exciting new initiatives.", icon: <HandshakeIcon /> },
    { title: "Learning Resources", description: "Access curated learning materials and share knowledge with peers.", icon: <BookIcon /> },
  ];

  const stats: StatProps[] = [
    { value: "50K+", label: "Developers" },
    { value: "12K+", label: "Projects" },
    { value: "200+", label: "Daily Challenges" },
    { value: "98%", label: "Match Rate" },
  ];

  const steps: StepProps[] = [
    { number: "01", title: "Create your profile", description: "Showcase your skills, tech stack, and portfolio. Let the community know what you're building.", icon: <UsersIcon /> },
    { number: "02", title: "Discover your match", description: "Our AI engine scans thousands of profiles to surface relevant collaborators and challenges.", icon: <SearchIcon /> },
    { number: "03", title: "Collaborate & compete", description: "Join live chatrooms, accept project invites, tackle daily coding puzzles, and build real things.", icon: <HandshakeIcon /> },
    { number: "04", title: "Grow your reputation", description: "Earn badges, climb leaderboards, and build a portfolio of shipped projects.", icon: <RocketIcon /> },
  ];

  const testimonials: TestimonialProps[] = [
    { name: "Arjun Mehta", role: "Full-Stack Developer", avatar: "AM", text: "DevConnect helped me find my co-founder in 3 days. The matching algorithm actually understood my tech stack.", tag: "Project Matching" },
    { name: "Sarah Chen", role: "ML Engineer @ Stripe", avatar: "SC", text: "The daily coding challenges are genuinely hard in the right way. I've improved more in 2 months here.", tag: "Code & Decode" },
    { name: "Marcus Johnson", role: "Open Source Contributor", avatar: "MJ", text: "I found three collaborators for my open-source CLI tool within a week. The chatrooms are super focused.", tag: "Collaboration" },
    { name: "Priya Sharma", role: "Frontend Engineer", avatar: "PS", text: "Promoted my local React meetup and got 40+ RSVPs from the platform. The event tools are genuinely useful.", tag: "Events" },
  ];

  const pricingPlans: PricingPlanProps[] = [
    { name: "Starter", price: "Free", period: "", description: "For developers just getting started", features: ["5 project postings/month", "Join up to 3 chatrooms", "Daily challenges", "Community feed access", "Basic profile"], cta: "Get Started", highlight: false },
    { name: "Pro", price: "₹499", period: "/month", description: "For serious builders & collaborators", features: ["Unlimited project postings", "All chatrooms + create your own", "Priority AI matching", "Event promotion tools", "Badge & leaderboard access", "Analytics dashboard"], cta: "Start Pro Trial", highlight: true },
    { name: "Team", price: "₹1,999", period: "/month", description: "For dev teams & organizations", features: ["Everything in Pro", "Up to 15 team members", "Private team chatrooms", "Custom hackathon hosting", "Dedicated support", "API access"], cta: "Contact Sales", highlight: false },
  ];

  return (
    <div className="font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] bg-[#F8FAFB] min-h-screen">

      <Navbar5/>

      {/* ── Hero Section ── */}
      <section className="pt-32 pb-24 px-12 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#EDF7F3] border border-[#A7F3D0] rounded-full py-1.5 px-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0EA472]" />
            <span className="text-xs font-medium text-[#047857]">TRUSTED BY 50,000+ DEVELOPERS</span>
          </div>
          <h1 className="m-0 mb-5 text-[52px] font-extrabold text-[#0D1B2A] leading-tight tracking-[-1.5px]">
            Where Developers<br />
            <span className="text-[#0EA472]">Build, Connect &amp; Grow</span>
          </h1>
          <p className="m-0 mb-9 text-base text-[#64748B] leading-relaxed max-w-[420px]">
            The all-in-one platform to collaborate on projects, compete in coding challenges, discover events, and build meaningful professional connections.
          </p>
          <div className="flex gap-3 mb-12">
            <Link href="/join" className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white no-underline py-3.5 px-6 rounded-xl text-sm font-semibold hover:bg-[#1E3A5F]">
              Join for Free
              <ArrowRight />
            </Link>
            <Link href="/features" className="inline-flex items-center gap-2 bg-white text-[#0D1B2A] no-underline py-3.5 px-6 rounded-xl text-sm font-medium border border-[#E8EDF2] hover:bg-gray-50">
              Explore Features
            </Link>
          </div>
          <div className="flex gap-8 pt-8 border-t border-[#E8EDF2]">
            <Stat value="50K+" label="Developers" />
            <div className="w-px bg-[#E8EDF2]" />
            <Stat value="12K+" label="Projects" />
            <div className="w-px bg-[#E8EDF2]" />
            <Stat value="98%" label="Match Rate" />
          </div>
        </div>
        <div className="relative h-[400px] flex items-center justify-center">
          <div className="bg-white border border-[#E8EDF2] rounded-2xl p-5 w-full max-w-md shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[11px] text-[#94A3B8] ml-2">devconnect.io — challenge #247</span>
            </div>
            <pre className="text-[12px] font-mono text-[#0D1B2A] bg-[#F8FAFB] p-3 rounded-lg overflow-x-auto">
{`function twoSum(nums: number[], target: number) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) 
      return [map.get(complement), i];
    map.set(nums[i], i);
  }
}`}
            </pre>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[11px] px-2 py-1 rounded-full bg-[#EDF7F3] text-[#0EA472]">✓ Accepted — O(n)</span>
              <span className="text-[11px] text-[#94A3B8]">🔥 1,247 devs solved today</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted by banner (Tech Stack) ── */}
      <div className="border-y border-[#E8EDF2] bg-white py-5 px-12 flex items-center justify-center gap-8 flex-wrap">
        <span className="text-xs text-[#94A3B8] font-medium">SUPPORTED TECH</span>
        {techStack.slice(0, 8).map((tech) => (
          <span key={tech.name} className="text-[13px] text-[#64748B] font-medium">{tech.name}</span>
        ))}
        <span className="text-[13px] text-[#64748B] font-medium">+12 more</span>
      </div>

      {/* ── Features Grid ── */}
      <section className="py-24 px-12 max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <p className="m-0 mb-2 text-xs font-semibold text-[#0EA472] tracking-[0.08em]">PLATFORM FEATURES</p>
          <h2 className="m-0 mb-3 text-4xl font-extrabold text-[#0D1B2A] tracking-[-0.8px]">
            Everything you need to <span className="text-[#0EA472]">level up</span>
          </h2>
          <p className="m-0 mx-auto text-[15px] text-[#64748B] max-w-[500px] leading-relaxed">
            A complete ecosystem built for developers who want to ship, learn, and collaborate faster.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white border-y border-[#E8EDF2] py-24 px-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="m-0 mb-2 text-xs font-semibold text-[#0EA472] tracking-[0.08em]">HOW IT WORKS</p>
            <h2 className="m-0 mb-10 text-3xl font-extrabold text-[#0D1B2A] tracking-[-0.6px]">
              From signup to <span className="text-[#0EA472]">shipping</span>
            </h2>
            <div className="flex flex-col gap-7">
              {steps.map((step) => (
                <Step key={step.number} {...step} />
              ))}
            </div>
          </div>
          <div className="bg-[#F8FAFB] border border-[#E8EDF2] rounded-2xl p-8">
            <p className="m-0 mb-5 text-[13px] font-semibold text-[#0D1B2A]">Sample AI Match</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8EDF2]">
                <div className="w-10 h-10 rounded-full bg-[#EDF7F3] flex items-center justify-center text-[#0EA472]">JS</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0D1B2A] m-0">Sarah Chen</p>
                  <p className="text-[11px] text-[#64748B] m-0">React · TypeScript · 92% match</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8EDF2]">
                <div className="w-10 h-10 rounded-full bg-[#EDF7F3] flex items-center justify-center text-[#0EA472]">PY</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0D1B2A] m-0">Arjun Mehta</p>
                  <p className="text-[11px] text-[#64748B] m-0">Python · FastAPI · 88% match</p>
                </div>
              </div>
              <div className="bg-[#EDF7F3] rounded-xl p-4 mt-4">
                <p className="text-[12px] text-[#064E3B] leading-relaxed m-0">
                  🤖 Based on your skills (React, Node.js) and recent projects, we found 12 potential collaborators. Start a chatroom to discuss project ideas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-12 max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <p className="m-0 mb-2 text-xs font-semibold text-[#0EA472] tracking-[0.08em]">COMMUNITY LOVE</p>
          <h2 className="m-0 mb-3 text-4xl font-extrabold text-[#0D1B2A] tracking-[-0.8px]">
            Loved by <span className="text-[#0EA472]">real developers</span>
          </h2>
          <p className="m-0 mx-auto text-[15px] text-[#64748B] max-w-[500px] leading-relaxed">
            Don't take our word for it. Here's what the community is saying.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-12 max-w-[1200px] mx-auto bg-white border-y border-[#E8EDF2]">
        <div className="text-center mb-14">
          <p className="m-0 mb-2 text-xs font-semibold text-[#0EA472] tracking-[0.08em]">PRICING</p>
          <h2 className="m-0 mb-3 text-4xl font-extrabold text-[#0D1B2A] tracking-[-0.8px]">
            Simple, transparent <span className="text-[#0EA472]">pricing</span>
          </h2>
          <p className="m-0 mx-auto text-[15px] text-[#64748B] max-w-[500px] leading-relaxed">
            Start free. Scale as you grow. No hidden fees, ever.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-12 max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <p className="m-0 mb-2 text-xs font-semibold text-[#0EA472] tracking-[0.08em]">FAQ</p>
          <h2 className="m-0 text-3xl font-extrabold text-[#0D1B2A] tracking-[-0.6px]">Common questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-[#E8EDF2] rounded-xl overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-[14px] font-medium text-[#0D1B2A] hover:bg-[#F8FAFB]"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <span className="text-[#0EA472] text-xl">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-[13px] text-[#64748B] border-t border-[#E8EDF2] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="px-12 pb-24 max-w-[600px] mx-auto text-center">
        <div className="bg-[#EDF7F3] border border-[#A7F3D0] rounded-3xl py-12 px-8">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <span className="text-2xl">📬</span>
            <span className="text-xs font-semibold text-[#047857]">WEEKLY DEV DIGEST</span>
          </div>
          <h2 className="m-0 mb-3 text-2xl font-extrabold text-[#0D1B2A]">Stay in the loop</h2>
          <p className="m-0 mx-auto mb-6 text-[14px] text-[#64748B] max-w-[350px] leading-relaxed">
            Get weekly challenge picks, trending projects, and dev community highlights — straight to your inbox.
          </p>
          {subscribed ? (
            <div className="py-3 px-4 rounded-xl text-sm font-medium bg-white text-[#0EA472] border border-[#A7F3D0]">
              🎉 You're subscribed! Welcome to the community.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl border border-[#E8EDF2] text-sm outline-none focus:ring-2 focus:ring-[#0EA472]/40"
              />
              <button
                onClick={() => { if (email) setSubscribed(true); }}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#0D1B2A] text-white hover:bg-[#1E3A5F]"
              >
                Subscribe →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-12 max-w-[800px] mx-auto text-center border-t border-[#E8EDF2] bg-white">
        <div className="inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-full bg-[#EDF7F3] border border-[#A7F3D0]">
          <span className="text-xs font-medium text-[#047857]">🚀 Start building today — it's free</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D1B2A] tracking-[-0.8px] mb-4">
          Ready to join the best<br /><span className="text-[#0EA472]">developer community?</span>
        </h2>
        <p className="text-[15px] text-[#64748B] mb-8 max-w-md mx-auto">
          Connect with thousands of developers, tackle real-world challenges, and ship projects that matter.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/join" className="inline-flex items-center gap-2 bg-[#0D1B2A] text-white no-underline py-3.5 px-7 rounded-xl text-sm font-semibold hover:bg-[#1E3A5F]">
            Create Free Account
            <ArrowRight />
          </Link>
          <Link href="/demo" className="inline-flex items-center bg-white text-[#0D1B2A] no-underline py-3.5 px-7 rounded-xl text-sm font-medium border border-[#E8EDF2] hover:bg-gray-50">
            View Demo
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E8EDF2] bg-white py-10 px-12 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0EA472] flex items-center justify-center text-white font-bold text-xs">
            D
          </div>
          <span className="text-sm font-bold text-[#0D1B2A]">
            Dev<span className="text-[#0EA472]">Connect</span>
          </span>
        </div>
        <p className="m-0 text-xs text-[#94A3B8]">
          © 2025 DevConnect. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-xs text-[#94A3B8] hover:text-[#0D1B2A]">Privacy</a>
          <a href="#" className="text-xs text-[#94A3B8] hover:text-[#0D1B2A]">Terms</a>
          <a href="#" className="text-xs text-[#94A3B8] hover:text-[#0D1B2A]">Cookies</a>
        </div>
      </footer>
    </div>
  );
}