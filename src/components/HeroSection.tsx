import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

// Typewriter effect
const TYPING_TEXTS = [
  'Track smarter. Spend better.',
  'Visualize. Analyze. Optimize.',
  'Say goodbye to manual finance logs.'
];

function useTypewriter(texts: string[], speed = 60, pause = 1200) {
  const [index, setIndex] = React.useState(0);
  const [display, setDisplay] = React.useState('');
  const [typing, setTyping] = React.useState(true);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (typing) {
      if (display.length < texts[index].length) {
        timeout = setTimeout(() => setDisplay(texts[index].slice(0, display.length + 1)), speed);
      } else {
        setTyping(false);
        timeout = setTimeout(() => setTyping(true), pause);
      }
    } else {
      timeout = setTimeout(() => {
        setDisplay('');
        setIndex((i) => (i + 1) % texts.length);
      }, 400);
    }
    return () => clearTimeout(timeout);
  }, [display, typing, index, texts, speed, pause]);

  return display;
}

import type { Transaction } from '@/types/Transaction';

interface HeroSectionProps {
  transactions: Transaction[];
  transactionsToday: number;
  budget?: { month: string; year: string; amount: number };
  categoryBudgets?: Record<string, number>;
  onStartTracking?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  transactions = [],
  transactionsToday = 0,
  budget,
  categoryBudgets = {},
  onStartTracking
}) => {
  const typewriter = useTypewriter(TYPING_TEXTS);
  
  // Calculate monthly budget vs spending for current month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  // Get total monthly budget
  const totalMonthlyBudget = budget?.month === currentMonth.toString() && budget?.year === currentYear.toString() 
    ? budget.amount 
    : Object.values(categoryBudgets).reduce((sum, amount) => sum + amount, 0);
  
  // Calculate monthly spending (only current month transactions)
  const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM format
  const monthlySpending = transactions
    .filter(tx => tx.date && tx.date.startsWith(thisMonth))
    .reduce((sum, tx) => sum + Math.abs(tx.amount ?? 0), 0);
  
  // Live balance = monthly budget - monthly spending
  const balance = totalMonthlyBudget - monthlySpending;

  // Top category this month
  const catTotals: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.date && tx.date.startsWith(thisMonth)) {
      catTotals[tx.category] = (catTotals[tx.category] || 0) + Math.abs(tx.amount ?? 0);
    }
  });
  const topCatEntry = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCat = topCatEntry ? topCatEntry[0] : '-';
  const topCatAmt = topCatEntry ? topCatEntry[1] : 0;

  // Light/dark mode detection (using class on html)
  const resolvedTheme = typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative flex flex-col items-center justify-center text-center py-16 px-4 md:py-24 overflow-hidden"
    >
      {/* Animated background blob */}
      <motion.div
        className="absolute -z-10 left-1/2 top-1/2 w-[600px] h-[400px] md:w-[900px] md:h-[600px] -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0.9, opacity: 0.7 }}
        animate={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(ellipse at center, #4de3c1 0%, #6c63ff 60%, #b3baff 100%)',
          filter: 'blur(80px)',
          opacity: resolvedTheme === 'dark' ? 0.5 : 0.7
        }}
      />
      {/* Brand Name */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#4de3c1] via-[#6c63ff] to-[#b3baff] bg-clip-text text-transparent drop-shadow-lg"
        initial={{ letterSpacing: '-0.05em' }}
        animate={{ letterSpacing: '0.01em' }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        echo-spend-easy
      </motion.h1>
      <p className="text-2xl md:text-3xl font-semibold mb-2 text-[#b3baff] dark:text-[#b3baff]">Your AI-powered, real-time personal finance dashboard</p>
      <div className="h-8 min-h-[2rem] flex items-center justify-center mb-6">
        <span className="text-lg md:text-xl font-medium animate-pulse text-[#7ee787] dark:text-[#7ee787]">
          {typewriter}
        </span>
      </div>
      {/* Stat Cards */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full max-w-2xl mb-8">
        <Card className="flex-1 min-w-[220px] bg-gradient-to-br from-[#23243a] to-[#2d2e4a] border border-[#35365a] text-[#e6e6fa] shadow-lg rounded-xl relative overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <DollarSign className="w-6 h-6 text-[#4de3c1]" />
            <CardTitle className="text-lg font-bold">Live Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold text-[#4de3c1]">
            {typeof balance === 'number' && !isNaN(balance)
              ? `$${balance.toFixed(2)}`
              : <span className="animate-pulse text-[#b3baff]">Loading...</span>}
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[220px] bg-gradient-to-br from-[#23243a] to-[#2d2e4a] border border-[#35365a] text-[#e6e6fa] shadow-lg rounded-xl relative overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Clock className="w-6 h-6 text-[#ffb86b]" />
            <CardTitle className="text-lg font-bold">Transactions Today</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-extrabold text-[#ffb86b]">{transactionsToday}</CardContent>
        </Card>
        <Card className="flex-1 min-w-[220px] bg-gradient-to-br from-[#23243a] to-[#2d2e4a] border border-[#35365a] text-[#e6e6fa] shadow-lg rounded-xl relative overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <PieChart className="w-6 h-6 text-[#ff79c6]" />
            <CardTitle className="text-lg font-bold">Top Category</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-bold text-[#ff79c6]">
            {topCat !== '-' ? (
              <>
                {topCat} <span className="text-white">(${topCatAmt.toFixed(2)})</span>
              </>
            ) : (
              <span className="text-[#b3baff]">No data</span>
            )}
          </CardContent>
        </Card>
      </div>
      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.07, boxShadow: '0 0 16px #4de3c1' }}
        whileTap={{ scale: 0.97 }}
        className="mt-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e] font-bold text-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#4de3c1] animate-pulse cursor-pointer"
        onClick={onStartTracking}
        tabIndex={0}
        aria-label="Start Tracking"
      >
        Start Tracking
      </motion.button>
      {/* Theme toggle removed as requested */}
    </motion.section>
  );
};
