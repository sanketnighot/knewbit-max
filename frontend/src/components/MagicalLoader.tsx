"use client";

import { aiThoughts, loadingStages } from "@/data/loadingStages";
import { useEffect, useState } from "react";

interface MagicalLoaderProps {
  prompt: string;
}

export default function MagicalLoader({ prompt }: MagicalLoaderProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentAiThoughts, setCurrentAiThoughts] = useState<string[]>([]);
  const [bytesProcessed, setBytesProcessed] = useState(0);
  const [nodesAnalyzed, setNodesAnalyzed] = useState(0);

  useEffect(() => {
    // Simulate AI thoughts
    let thoughtIndex = 0;
    const thoughtInterval = setInterval(() => {
      setCurrentAiThoughts((prev) => {
        const newThoughts = [
          ...prev,
          aiThoughts[thoughtIndex % aiThoughts.length],
        ];
        return newThoughts.slice(-5); // Keep only last 5 thoughts
      });
      thoughtIndex++;
    }, 2000);

    // Simulate bytes processed
    const bytesInterval = setInterval(() => {
      setBytesProcessed(
        (prev) => prev + Math.floor(Math.random() * 150000) + 50000
      );
    }, 100);

    // Simulate nodes analyzed
    const nodesInterval = setInterval(() => {
      setNodesAnalyzed((prev) => prev + Math.floor(Math.random() * 50) + 10);
    }, 300);

    return () => {
      clearInterval(thoughtInterval);
      clearInterval(bytesInterval);
      clearInterval(nodesInterval);
    };
  }, []);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let stageTimeout: NodeJS.Timeout;

    const currentStage = loadingStages[currentStageIndex];
    if (currentStage) {
      // Smooth progress animation
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const increment =
            (currentStage.progress -
              (loadingStages[currentStageIndex - 1]?.progress || 0)) /
            (currentStage.duration / 200);
          const newProgress = prev + increment;
          return Math.min(newProgress, currentStage.progress);
        });
      }, 200);

      // Move to next stage
      stageTimeout = setTimeout(() => {
        if (currentStageIndex < loadingStages.length - 1) {
          setCurrentStageIndex((prev) => prev + 1);
        }
      }, currentStage.duration);
    }

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimeout);
    };
  }, [currentStageIndex]);

  const currentStage = loadingStages[currentStageIndex];

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-start justify-center pt-8 overflow-y-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Flowing data streams */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-pulse"
              style={{
                left: `${i * 5 + 5}%`,
                height: "100%",
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Floating data particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Neural network pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 600">
            {[...Array(15)].map((_, i) => (
              <g key={i}>
                <circle
                  cx={50 + (i % 5) * 150}
                  cy={100 + Math.floor(i / 5) * 200}
                  r="3"
                  fill="currentColor"
                  className="text-cyan-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
                {i < 10 && (
                  <line
                    x1={50 + (i % 5) * 150}
                    y1={100 + Math.floor(i / 5) * 200}
                    x2={50 + ((i + 1) % 5) * 150}
                    y2={100 + Math.floor((i + 1) / 5) * 200}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-cyan-400/20"
                  />
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400/40 rounded-full animate-spin animate-reverse"
                style={{ animationDuration: "1.5s" }}
              ></div>
              <div
                className="absolute inset-2 w-16 h-16 border-2 border-transparent border-b-purple-400/60 rounded-full animate-spin"
                style={{ animationDuration: "2s" }}
              ></div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            <span className="text-cyan-400">Knewbit Max</span> AI at Work
          </h1>

          <p className="text-xl text-slate-300 mb-8">
            Crafting your personalized learning experience...
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-12">
          {/* Main Progress Bar */}
          <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-6">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>

          <div className="flex justify-between text-sm text-slate-400 mb-8">
            <span>{Math.round(progress)}% Complete</span>
            <span>ETA: {Math.max(0, Math.round((100 - progress) * 1.8))}s</span>
          </div>

          {/* Current Stage */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mr-3"></div>
              <h2 className="text-2xl font-bold text-white">
                {currentStage?.stage}
              </h2>
            </div>

            <p className="text-lg text-slate-300 mb-2">
              {currentStage?.message}
            </p>

            <p className="text-sm text-slate-400">{currentStage?.submessage}</p>
          </div>
        </div>

        {/* AI Processing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
            <div className="text-2xl font-bold text-cyan-400 mb-2">
              {(bytesProcessed / 1000000).toFixed(1)}MB
            </div>
            <div className="text-sm text-slate-400">Data Processed</div>
          </div>

          <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {nodesAnalyzed.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Concepts Analyzed</div>
          </div>

          <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {Math.round(progress * 2.4)}
            </div>
            <div className="text-sm text-slate-400">AI Models Active</div>
          </div>
        </div>

        {/* AI Thoughts Stream */}
        <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></span>
            AI Neural Activity
          </h3>

          <div className="space-y-2 max-h-32 overflow-hidden">
            {currentAiThoughts.map((thought, index) => (
              <div
                key={index}
                className="text-sm text-slate-400 animate-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 1 - index * 0.2,
                }}
              >
                {thought}
              </div>
            ))}
          </div>
        </div>

        {/* User Prompt Display */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-cyan-400/20">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">
            Your Learning Goal:
          </h3>
          <p className="text-slate-300 italic">"{prompt}"</p>
        </div>
      </div>
    </div>
  );
}
