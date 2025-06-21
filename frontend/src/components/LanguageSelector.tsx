"use client";

import { Language, SUPPORTED_LANGUAGES } from "@/types/language";
import { useState } from "react";

interface LanguageSelectorProps {
  selectedLanguage: Language | null;
  onLanguageSelect: (language: Language | null) => void;
}

export const LanguageSelector = ({
  selectedLanguage,
  onLanguageSelect,
}: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Preferred Learning Language (Optional)
      </label>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-slate-800/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-slate-200 hover:bg-slate-800/70"
        >
          <div className="flex items-center justify-between">
            <span>
              {selectedLanguage
                ? selectedLanguage.name
                : "Select Language (Original Video)"}
            </span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
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
          </div>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
              {/* No Language Option */}
              <button
                onClick={() => {
                  onLanguageSelect(null);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-slate-800/70 transition-colors ${
                  !selectedLanguage
                    ? "bg-cyan-400/20 text-cyan-300"
                    : "text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                    <span className="text-xs">🎥</span>
                  </div>
                  <div>
                    <div className="font-medium">Original Video</div>
                    <div className="text-xs text-slate-400">
                      No dubbing applied
                    </div>
                  </div>
                </div>
              </button>

              {/* Language Options */}
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    onLanguageSelect(language);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-800/70 transition-colors ${
                    selectedLanguage?.code === language.code
                      ? "bg-cyan-400/20 text-cyan-300"
                      : "text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {language.code.split("-")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{language.name}</div>
                      <div className="text-xs text-slate-400">
                        AI Dubbing Available
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedLanguage && (
        <div className="mt-2 text-xs text-cyan-400 flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>Video will be dubbed in {selectedLanguage.name}</span>
        </div>
      )}
    </div>
  );
};
