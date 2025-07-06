import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden bg-[#181b2e]">
      {/* Left: Headline, subheadline, CTA */}
      <div className="flex-1 flex flex-col justify-center items-start px-8 md:px-20 py-16 z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
          Manage Your Finances Effortlessly with <span className="bg-gradient-to-r from-[#4de3c1] via-[#6c63ff] to-[#b3baff] bg-clip-text text-transparent">echo-spend-easy</span>
        </h1>
        <p className="text-lg md:text-2xl text-[#b3baff] mb-8 max-w-xl">
          AI-powered, real-time dashboard for smarter spending, budgeting, CSV import, and cloud sync. Visualize, analyze, and optimize your financial life.
        </p>
        <motion.a
          href="#"
          whileHover={{ scale: 1.05, boxShadow: '0 0 16px #4de3c1' }}
          whileTap={{ scale: 0.97 }}
          className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e] font-bold text-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#4de3c1] animate-pulse cursor-pointer"
        >
          Get Started
        </motion.a>
      </div>
      {/* Right: Visual grid with real features */}
      <div className="flex-1 flex flex-col justify-center items-center w-full h-full px-4 md:px-0 py-12 md:py-0 z-10">
        <div className="grid grid-cols-2 grid-rows-2 gap-6 w-full max-w-lg">
          {/* AI Insights Widget */}
          <div className="bg-[#20223a] border border-[#23243a] rounded-2xl p-6 flex flex-col items-center justify-center shadow-md">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-2">
              <circle cx="24" cy="24" r="22" stroke="#4de3c1" strokeWidth="2" opacity="0.5" />
              <path d="M24 10v8M24 30v8M10 24h8M30 24h8" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="24" r="6" fill="#b3baff" opacity="0.7" />
            </svg>
            <span className="text-lg font-semibold text-white mb-1">AI Insights</span>
            <span className="text-sm text-[#b3baff] text-center">Get smart suggestions and analysis powered by AI.</span>
          </div>
          {/* Budget Tracking Widget */}
          <div className="bg-[#20223a] border border-[#23243a] rounded-2xl p-6 flex flex-col items-center justify-center shadow-md">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-2">
              <rect x="8" y="20" width="8" height="20" rx="3" fill="#4de3c1" opacity="0.7" />
              <rect x="20" y="12" width="8" height="28" rx="3" fill="#6c63ff" opacity="0.7" />
              <rect x="32" y="28" width="8" height="12" rx="3" fill="#b3baff" opacity="0.7" />
            </svg>
            <span className="text-lg font-semibold text-white mb-1">Budget Tracking</span>
            <span className="text-sm text-[#b3baff] text-center">Set, track, and optimize your budgets easily.</span>
          </div>
          {/* CSV Import Widget */}
          <div className="bg-[#20223a] border border-[#23243a] rounded-2xl p-6 flex flex-col items-center justify-center shadow-md">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-2">
              <rect x="10" y="10" width="28" height="28" rx="6" fill="#6c63ff" opacity="0.7" />
              <path d="M16 24h16M16 28h16" stroke="#4de3c1" strokeWidth="2" strokeLinecap="round" />
              <rect x="16" y="16" width="16" height="4" rx="2" fill="#b3baff" opacity="0.7" />
            </svg>
            <span className="text-lg font-semibold text-white mb-1">CSV Import</span>
            <span className="text-sm text-[#b3baff] text-center">Easily import your transactions from CSV files.</span>
          </div>
          {/* Cloud Sync Widget */}
          <div className="bg-[#20223a] border border-[#23243a] rounded-2xl p-6 flex flex-col items-center justify-center shadow-md">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mb-2">
              <ellipse cx="24" cy="32" rx="14" ry="8" fill="#b3baff" opacity="0.3" />
              <ellipse cx="24" cy="24" rx="18" ry="10" fill="#6c63ff" opacity="0.2" />
              <ellipse cx="24" cy="18" rx="10" ry="5" fill="#4de3c1" opacity="0.4" />
              <path d="M16 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#4de3c1" strokeWidth="2" />
            </svg>
            <span className="text-lg font-semibold text-white mb-1">Cloud Sync</span>
            <span className="text-sm text-[#b3baff] text-center">Access your data anywhere with secure cloud sync.</span>
          </div>
        </div>
      </div>
      {/* Subtle grid lines overlay for sci-fi effect */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <linearGradient id="gridLines" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4de3c1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6c63ff" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i / 23) * 100}%`} y1="0%"
              x2={`${(i / 23) * 100}%`} y2="100%"
              stroke="url(#gridLines)"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0%" y1={`${(i / 15) * 100}%`}
              x2="100%" y2={`${(i / 15) * 100}%`}
              stroke="url(#gridLines)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
    </section>
  );
};
