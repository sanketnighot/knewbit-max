"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export const UserProfile = () => {
  const { knewbitUser, signOut, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!knewbitUser) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
          {knewbitUser.name
            ? knewbitUser.name.charAt(0).toUpperCase()
            : knewbitUser.email.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <p className="text-white text-sm font-medium">
            {knewbitUser.name || knewbitUser.email.split("@")[0]}
          </p>
          <p className="text-gray-400 text-xs">{knewbitUser.email}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
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
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-700">
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
                <p className="text-gray-400 text-sm">{knewbitUser.email}</p>
              </div>
            </div>
            {knewbitUser.streak > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-orange-400">🔥</span>
                <span className="text-gray-300">
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
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};
