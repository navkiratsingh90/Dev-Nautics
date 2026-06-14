// app/auth/otp/page.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

const OTP_LENGTH = 6;

export default function OtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = useAppSelector((state: RootState) => state.User.email);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setOtp(updated);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = () => {
    setResendTimer(30);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    inputRefs.current[0]?.focus();

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    // API call to resend OTP
  };

  const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
  
	const code = otp.join("");
  
	if (code.length !== OTP_LENGTH) {
	  setError("Please enter all 6 digits");
	  return;
	}
  
	try {
	  const { data } = await axios.post("/api/auth/verify-email", {
		email,
		otp: code,
	  });
  
	  alert(data.message);
  
	  if (data.success) {
		window.location.href = "/login";
	  }
	} catch (error: any) {
	  setError(
		error?.response?.data?.message ||
		  "Failed to verify email"
	  );
	}
  };

  const isFilled = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fffb] to-[#f0fdf4] flex items-center justify-center px-4 py-8 font-dm">
      <div className="w-full max-w-[420px]">
        <Card className="rounded-3xl border-gray-100 shadow-xl overflow-hidden">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h2 className="font-syne text-xl font-bold text-gray-900">
                Verify Your Email
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* OTP Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`
                      h-12 w-10 rounded-lg border text-center text-lg font-bold
                      outline-none transition-all
                      ${digit
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-900"
                      }
                      focus:border-green-500 focus:ring-2 focus:ring-green-100
                    `}
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-xs text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                disabled={!isFilled}
                className="w-full bg-green-600 hover:bg-green-700 rounded-xl text-sm font-semibold h-11"
              >
                Verify & Continue
              </Button>
            </form>

            {/* Resend & Back */}
            <div className="mt-4 text-center space-y-2">
              {resendTimer > 0 ? (
                <p className="text-xs text-gray-400">
                  Resend code in <span className="font-semibold text-gray-700">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs font-semibold text-green-600 hover:text-green-700"
                >
                  Resend Code
                </button>
              )}
              <div>
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ← Back to Sign Up
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}