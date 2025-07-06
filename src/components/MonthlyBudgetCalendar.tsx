import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types/Transaction';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthlyBudgetCalendarProps {
  transactions: Transaction[];
  categoryBudgets: Record<string, number>;
  selectedCategory?: string; // Optional: filter by category
}

// Calendar heatmap, click for breakdown, overbudget dots, scroll months, real data
const MonthlyBudgetCalendar: React.FC<MonthlyBudgetCalendarProps> = ({
  transactions = [],
  categoryBudgets = {},
  selectedCategory
}) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Compute daily spending for the month, optionally by category
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailySpending = useMemo(() => {
    const arr = Array(daysInMonth).fill(0);
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (
        tDate.getFullYear() === year &&
        tDate.getMonth() === month &&
        (!selectedCategory || t.category === selectedCategory)
      ) {
        arr[tDate.getDate() - 1] += Math.abs(t.amount);
      }
    });
    return arr;
  }, [transactions, month, year, selectedCategory, daysInMonth]);

  // Overbudget: if daily spending exceeds average daily budget for the month
  const monthlyBudget = useMemo(() => {
    if (selectedCategory) {
      return categoryBudgets[selectedCategory] || 0;
    }
    // Sum all categories if not filtered
    return Object.values(categoryBudgets).reduce((a, b) => a + b, 0);
  }, [categoryBudgets, selectedCategory]);
  const avgDailyBudget = monthlyBudget / daysInMonth;

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
    setSelectedDay(null);
  };

  return (
    <div className="bg-[#23243a] rounded-xl p-4 border border-[#35365a] shadow-md w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="text-[#b3baff] hover:text-yellow-300 text-lg font-bold px-2">&#8592;</button>
        <span className="text-lg font-semibold text-[#e6e6fa]">{monthNames[month]} {year}</span>
        <button onClick={handleNextMonth} className="text-[#b3baff] hover:text-yellow-300 text-lg font-bold px-2">&#8594;</button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-[#b3baff]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center">{d}</div>)}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array(new Date(year, month, 1).getDay()).fill(null).map((_, i) => <div key={i}></div>)}
        {dailySpending.map((spent, idx) => {
          const day = idx + 1;
          const overbudget = spent > avgDailyBudget && avgDailyBudget > 0;
          return (
            <button
              key={day}
              className={`relative rounded-lg h-10 w-10 flex flex-col items-center justify-center transition border-2 ${selectedDay === day ? 'border-yellow-300' : 'border-transparent'} ${overbudget ? 'bg-red-900/60' : 'bg-[#181b2e]/80'} hover:border-yellow-300`}
              onClick={() => setSelectedDay(day)}
              title={`Spent: $${spent}`}
            >
              <span className="font-semibold text-[#e6e6fa]">{day}</span>
              {overbudget && <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-red-400 animate-pulse" title="Overbudget"></span>}
            </button>
          );
        })}
      </div>
      {/* Breakdown for selected day */}
      {selectedDay && (
        <div className="mt-4 p-3 rounded-lg bg-[#181b2e] border border-[#35365a] text-[#e6e6fa]">
          <div className="font-bold text-yellow-300 mb-1">{monthNames[month]} {selectedDay}, {year}</div>
          <div>Spent: <span className="text-[#4de3c1] font-semibold">${dailySpending[selectedDay - 1]}</span></div>
          {dailySpending[selectedDay - 1] > avgDailyBudget && avgDailyBudget > 0 && (
            <div className="text-red-400 font-semibold mt-1">Overbudget!</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyBudgetCalendar;
