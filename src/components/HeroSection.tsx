import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#181b2e]">
      {/* Animated sci-fi grid background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <svg width="100%" height="100%" className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4de3c1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6c63ff" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {/* Vertical lines */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i / 23) * 100}%`} y1="0%"
              x2={`${(i / 23) * 100}%`} y2="100%"
              stroke="url(#gridGradient)"
              strokeWidth="1"
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0%" y1={`${(i / 15) * 100}%"`
              x2="100%" y2={`${(i / 15) * 100}%"`
              stroke="url(#gridGradient)"
              strokeWidth="1"
            />
          ))}
        </svg>
        {/* Animated glowing orbs */}
        <motion.div
          className="absolute left-1/4 top-1/3 w-72 h-72 rounded-full bg-[#4de3c1] blur-3xl opacity-30"
          animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-1/5 bottom-1/4 w-96 h-96 rounded-full bg-[#6c63ff] blur-3xl opacity-25"
          animate={{ y: [0, -60, 0], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
      </div>
      {/* Futuristic AI/Finance Motif */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center z-10"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-[#4de3c1] via-[#6c63ff] to-[#b3baff] bg-clip-text text-transparent drop-shadow-[0_2px_32px_rgba(76,227,193,0.4)]"
          initial={{ letterSpacing: '-0.05em' }}
          animate={{ letterSpacing: '0.01em' }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          echo-spend-easy
        </motion.h1>
        <motion.p
          className="text-2xl md:text-3xl font-semibold mb-8 text-[#b3baff] max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          The Future of Finance. <span className="text-[#4de3c1]">AI-Powered</span>. <span className="text-[#6c63ff]">Sci-Fi Inspired</span>.
        </motion.p>
        {/* Animated AI/Finance SVG motif */}
        <motion.svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <circle cx="90" cy="90" r="80" stroke="#4de3c1" strokeWidth="2" opacity="0.5" />
          <circle cx="90" cy="90" r="60" stroke="#6c63ff" strokeWidth="2" opacity="0.4" />
          <circle cx="90" cy="90" r="40" stroke="#b3baff" strokeWidth="2" opacity="0.3" />
          <g>
            <rect x="80" y="30" width="20" height="20" rx="6" fill="#4de3c1" opacity="0.7" />
            <rect x="130" y="80" width="20" height="20" rx="6" fill="#6c63ff" opacity="0.7" />
            <rect x="80" y="130" width="20" height="20" rx="6" fill="#b3baff" opacity="0.7" />
            <rect x="30" y="80" width="20" height="20" rx="6" fill="#4de3c1" opacity="0.7" />
          </g>
          <g>
            <path d="M90 30V60" stroke="#4de3c1" strokeWidth="2" strokeDasharray="4 2" />
            <path d="M150 90H120" stroke="#6c63ff" strokeWidth="2" strokeDasharray="4 2" />
            <path d="M90 150V120" stroke="#b3baff" strokeWidth="2" strokeDasharray="4 2" />
            <path d="M30 90H60" stroke="#4de3c1" strokeWidth="2" strokeDasharray="4 2" />
          </g>
        </motion.svg>
        <motion.button
          whileHover={{ scale: 1.08, boxShadow: '0 0 24px #4de3c1' }}
          whileTap={{ scale: 0.97 }}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e] font-bold text-xl shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#4de3c1] animate-pulse cursor-pointer"
        >
          Get Started
        </motion.button>
      </motion.div>
    </section>
  );
};
