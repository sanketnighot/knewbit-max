"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signInWithGoogle, signInWithOTP, verifyOTP, loading, error } =
    useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [otpSendingStep, setOtpSendingStep] = useState<
    "initial" | "sending" | "sent" | "error"
  >("initial");
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus OTP input when it appears
  useEffect(() => {
    if (showOtpInput && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [showOtpInput]);

  // Resend timer countdown
  useEffect(() => {
    if (showOtpInput && !canResend && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [showOtpInput, canResend, resendTimer]);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && showOtpInput) {
      handleOTPVerify(undefined);
    }
  }, [otp, showOtpInput]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.error) {
        // Google OAuth will redirect, so we don't need to close modal here
      }
    } catch (error) {
      // Error will be handled by global error state
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLocalLoading(true);
    setOtpSendingStep("sending");

    try {
      const result = await signInWithOTP(email);

      // Show OTP input after sending (Supabase returns null user/session on successful OTP send)
      // This is expected behavior according to the docs
      if (!result.error) {
        setOtpSendingStep("sent");
        setShowOtpInput(true);
        setCanResend(false);
        setResendTimer(60);
      } else {
        setOtpSendingStep("error");
        // Still show OTP input for debugging
        setShowOtpInput(true);
        setCanResend(false);
        setResendTimer(60);
      }
    } catch (error) {
      setOtpSendingStep("error");
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleOTPVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setIsVerifyLoading(true);

    try {
      const result = await verifyOTP(email, otp);

      if (!result.error) {
        onClose();
        resetForm();
      }
    } catch (error) {
      // Error will be handled by the global error state
    } finally {
      setIsVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLocalLoading(true);

    try {
      const result = await signInWithOTP(email);

      if (!result.error) {
        // Reset resend timer and clear OTP input
        setCanResend(false);
        setResendTimer(60);
        setOtp("");
      }
    } catch (error) {
      // Error will be handled by the global error state
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    setOtp(value);
  };

  const resetForm = () => {
    setEmail("");
    setOtp("");
    setEmailError("");
    setShowOtpInput(false);
    setCanResend(false);
    setResendTimer(60);
    setOtpSendingStep("initial");
    setIsLocalLoading(false);
    setIsVerifyLoading(false);
    setIsGoogleLoading(false);
  };

  const handleBackToEmail = () => {
    setShowOtpInput(false);
    setOtp("");
    setCanResend(false);
    setResendTimer(60);
    setOtpSendingStep("initial");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative group max-w-md w-full mx-4">
        {/* Enhanced border glow */}
        <div className="absolute -inset-0.5 bg-cyan-400/20 rounded-2xl blur-sm opacity-75"></div>
        <div className="absolute -inset-1 bg-cyan-400/10 rounded-2xl blur-md opacity-50"></div>

        <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Sign In to <span className="text-cyan-400">Knewbit Max</span>
                </h2>
                <div className="w-16 h-0.5 bg-cyan-400 rounded-full"></div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-300 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={
                  isGoogleLoading ||
                  isLocalLoading ||
                  otpSendingStep === "sending"
                }
                className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-slate-900 font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-5 h-5 relative" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="relative">
                  {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
                </span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900 text-slate-400 font-medium">
                    Or
                  </span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-300 mb-3"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm group-hover:bg-slate-800/70"
                      placeholder="Enter your email address"
                      disabled={showOtpInput}
                      required
                    />
                    {showOtpInput && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">
                          Sent
                        </span>
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {emailError}
                    </p>
                  )}
                </div>

                {!(
                  showOtpInput ||
                  otpSendingStep === "sent" ||
                  otpSendingStep === "error"
                ) && (
                  <button
                    type="submit"
                    disabled={
                      isGoogleLoading ||
                      isLocalLoading ||
                      otpSendingStep === "sending"
                    }
                    className="group relative w-full px-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-cyan-500/25 hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <span>
                        {isLocalLoading || otpSendingStep === "sending"
                          ? "Sending..."
                          : "Send Verification Code"}
                      </span>
                      {!(isLocalLoading || otpSendingStep === "sending") && (
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                )}
              </form>

              {/* OTP Input Section */}
              {(showOtpInput ||
                otpSendingStep === "sent" ||
                otpSendingStep === "error") && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center p-4 bg-cyan-900/20 border border-cyan-800/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-cyan-300 font-semibold">
                        Check your email
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      We sent a 6-digit code to{" "}
                      <strong className="text-white">{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleOTPVerify} className="space-y-4">
                    <div>
                      <label
                        htmlFor="otp"
                        className="block text-sm font-semibold text-slate-300 mb-3"
                      >
                        Verification Code
                      </label>
                      <div className="relative">
                        <input
                          ref={otpInputRef}
                          type="text"
                          id="otp"
                          value={otp}
                          onChange={handleOTPChange}
                          className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-center text-xl tracking-[0.5em] font-mono backdrop-blur-sm"
                          placeholder="000000"
                          maxLength={6}
                          autoComplete="one-time-code"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div
                            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                              otp.length === 6
                                ? "bg-green-400 animate-pulse"
                                : otp.length > 0
                                ? "bg-cyan-400"
                                : "bg-slate-600"
                            }`}
                          ></div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 text-center font-mono">
                        {otp.length === 6
                          ? "🔍 Verifying..."
                          : `${otp.length}/6 digits entered`}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        isGoogleLoading || isVerifyLoading || otp.length !== 6
                      }
                      className="group relative w-full px-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-cyan-500/25 hover:shadow-xl"
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <span>
                          {isVerifyLoading
                            ? "Verifying..."
                            : "Verify & Sign In"}
                        </span>
                        {!isVerifyLoading && (
                          <svg
                            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  </form>

                  {/* Resend and Back buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleBackToEmail}
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Change email
                    </button>

                    <button
                      onClick={handleResendCode}
                      disabled={
                        !canResend ||
                        isGoogleLoading ||
                        isLocalLoading ||
                        isVerifyLoading
                      }
                      className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {canResend ? "Resend code" : `Resend in ${resendTimer}s`}
                    </button>
                  </div>
                </div>
              )}

              {!(
                showOtpInput ||
                otpSendingStep === "sent" ||
                otpSendingStep === "error"
              ) && (
                <p className="text-sm text-slate-400 text-center">
                  We'll send you a secure 6-digit code to verify your identity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
