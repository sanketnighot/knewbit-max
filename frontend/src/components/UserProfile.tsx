"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface UserProfileProps {
  onSignInClick: () => void;
}

export const UserProfile = ({ onSignInClick }: UserProfileProps) => {
  const { knewbitUser, signOut, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  // Show sign-in button when user is not authenticated
  if (!knewbitUser) {
    return (
      <button
        onClick={onSignInClick}
        className="group relative flex items-center gap-2 px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-400/50 rounded-lg transition-all duration-300 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-cyan-400/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="relative text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-200">
          Sign In
        </span>
      </button>
    );
  }

  // Show user profile when authenticated
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
          {knewbitUser.name
            ? knewbitUser.name.charAt(0).toUpperCase()
            : knewbitUser.email.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-white text-sm font-medium">
            {knewbitUser.name || knewbitUser.email.split("@")[0]}
          </p>
          <p className="text-slate-400 text-xs">{knewbitUser.email}</p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          {/* Click outside to close dropdown */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl z-[70]">
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {knewbitUser.name
                    ? knewbitUser.name.charAt(0).toUpperCase()
                    : knewbitUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {knewbitUser.name || knewbitUser.email.split("@")[0]}
                  </p>
                  <p className="text-slate-400 text-sm">{knewbitUser.email}</p>
                </div>
              </div>
              {knewbitUser.streak > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-orange-400">🔥</span>
                  <span className="text-slate-300">
                    {knewbitUser.streak} day streak
                  </span>
                </div>
              )}
            </div>

            <div className="p-2">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {loading ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
