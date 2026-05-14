"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Github, Chrome } from "lucide-react";
import { handleTheme } from "@/features/ThemeSlice";
// import { loginUser } from "@/services/authApis";

export default function LoginPage() {
  const darkMode = useSelector((state: any) => state.Theme.darkMode);
  const dispatch = useDispatch();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // const res = await loginUser(formData);
      toast.success("Welcome back! 🎉");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Theme tokens (identical to the rest of the app) ──────────────────────
  const bg         = darkMode ? "bg-gray-900"        : "bg-white";
  const cardBg     = darkMode ? "bg-gray-800"        : "bg-white";
  const mutedText  = darkMode ? "text-gray-400"      : "text-gray-500";
  const headingText= darkMode ? "text-white"         : "text-gray-900";
  const divider    = darkMode ? "border-gray-700"    : "border-gray-200";
  const accentGradient = "from-violet-500 via-fuchsia-500 to-cyan-400";
  const accentText     = "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent";

  const inputBase = (field: string) =>
    `w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${
      focused === field
        ? darkMode
          ? "border-violet-500/70 bg-gray-700/80 text-white ring-2 ring-violet-500/20"
          : "border-violet-400 bg-white text-gray-900 ring-2 ring-violet-400/20"
        : darkMode
          ? "border-gray-700 bg-gray-700/50 text-white placeholder-gray-500 hover:border-gray-600"
          : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 hover:border-gray-300"
    }`;

  // ── Decorative activity feed (left panel) ────────────────────────────────
  const recentActivity = [
    { avatar: "AK", name: "ankitml",     action: "solved LRU Cache — Hard",             time: "2m ago",  color: "violet" },
    { avatar: "SB", name: "sophiebuilds",action: "posted: Looking for React dev",        time: "5m ago",  color: "cyan"   },
    { avatar: "RX", name: "rustacean_x", action: "joined Systems Programming chatroom",  time: "9m ago",  color: "fuchsia"},
    { avatar: "MD", name: "miradev",     action: "launched Code Review App",             time: "14m ago", color: "amber"  },
  ];

  const avatarCls: Record<string, string> = {
    violet:  "bg-violet-500/20 text-violet-400",
    cyan:    "bg-cyan-500/20 text-cyan-400",
    fuchsia: "bg-fuchsia-500/20 text-fuchsia-400",
    amber:   "bg-amber-500/20 text-amber-400",
  };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 font-sans flex`}>

     

      {/* ── RIGHT PANEL (form) ── */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 relative ${darkMode ? "bg-gray-900" : "bg-white"}`}>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10" style={{ animation: mounted ? "fadeDown 0.5s ease both" : "none" }}>
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white font-bold text-sm`}>D</div>
          <span className={`text-lg font-bold ${accentText}`}>DevConnect</span>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-sm"
          style={{ animation: mounted ? "fadeUp 0.6s ease 0.05s both" : "none" }}
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className={`text-3xl font-extrabold tracking-tight mb-1.5 ${headingText}`}>Sign in</h2>
            <p className={`text-sm ${mutedText}`}>
              New here?{" "}
              <Link href="/auth/signup" className={`font-semibold bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}>
                Create a free account →
              </Link>
            </p>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Email address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "email" ? "text-violet-400" : mutedText}`} />
                <input
                  id="email" type="email" autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                  className={inputBase("email")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className={`text-xs font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Password
                </label>
                <Link href="/forgot-password" className={`text-xs font-medium transition-colors ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === "password" ? "text-violet-400" : mutedText}`} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  className={`${inputBase("password")} pr-11`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${rememberMe
                  ? `bg-gradient-to-br ${accentGradient} border-transparent`
                  : darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-white"}`}
              >
                {rememberMe && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <label className={`text-xs cursor-pointer select-none ${darkMode ? "text-gray-400" : "text-gray-600"}`} onClick={() => setRememberMe(!rememberMe)}>
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 mt-2
                ${isSubmitting
                  ? "opacity-70 cursor-not-allowed bg-gradient-to-r from-violet-500/70 via-fuchsia-500/70 to-cyan-400/70 text-white"
                  : `bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/45 hover:scale-[1.02] active:scale-[0.98]`
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className={`text-center text-[11px] mt-8 leading-relaxed ${mutedText}`}>
            By signing in you agree to our{" "}
            <a href="#" className={`underline underline-offset-2 hover:opacity-80 transition-opacity ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Terms of Service</a>
            {" "}and{" "}
            <a href="#" className={`underline underline-offset-2 hover:opacity-80 transition-opacity ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}