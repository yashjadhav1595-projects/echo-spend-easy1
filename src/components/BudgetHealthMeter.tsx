import React, { useMemo } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Transaction } from '@/types/Transaction';

interface BudgetHealthMeterProps {
  transactions: Transaction[];
  categoryBudgets: Record<string, number>;
  month: string;
  year: string;
}

const getFinanceLevel = (percent: number) => {
  if (percent >= 95) return { level: 'Master Saver', color: '#4de3c1', emoji: '🏆' };
  if (percent >= 80) return { level: 'Budget Pro', color: '#b3baff', emoji: '💎' };
  if (percent >= 60) return { level: 'On Track', color: '#ffb86b', emoji: '🚀' };
  if (percent >= 40) return { level: 'Needs Focus', color: '#ffb86b', emoji: '🧐' };
  return { level: 'At Risk', color: '#ff4d6d', emoji: '⚠️' };
};

const getTip = (percent: number) => {
  if (percent >= 95) return 'Amazing! You are a budgeting master.';
  if (percent >= 80) return 'Great job! Keep up the smart spending.';
  if (percent >= 60) return 'You are doing well, but watch a few categories.';
  if (percent >= 40) return 'Review your spending and adjust as needed.';
  return 'Warning: You are at risk of overspending!';
};

const BudgetHealthMeter: React.FC<BudgetHealthMeterProps> = ({
  transactions = [],
  categoryBudgets = {},
  month,
  year
}) => {
  // Calculate total budget and total spent for the selected month/year
  const { totalBudget, totalSpent, percent } = useMemo(() => {
    const totalBudget = Object.values(categoryBudgets).reduce((a, b) => a + b, 0);
    const totalSpent = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        const tMonth = String(tDate.getMonth() + 1).padStart(2, '0');
        const tYear = String(tDate.getFullYear());
        return tMonth === month && tYear === year;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const percent = totalBudget > 0 ? Math.min(100, Math.round((1 - totalSpent / totalBudget) * 100)) : 0;
    return { totalBudget, totalSpent, percent };
  }, [transactions, categoryBudgets, month, year]);

  const { level, color, emoji } = getFinanceLevel(percent);
  const tip = getTip(percent);

  return (
    <div className="bg-[#23243a] rounded-xl p-4 border border-[#35365a] shadow-md w-full max-w-xs mx-auto flex flex-col items-center">
      <h2 className="text-lg font-bold text-[#4de3c1] mb-2">Budget Health Meter</h2>
      <div className="w-32 h-32 mb-2">
        <CircularProgressbar
          value={percent}
          text={`${percent}%`}
          styles={buildStyles({
            textColor: color,
            pathColor: color,
            trailColor: '#35365a',
            textSize: '1.5rem',
            backgroundColor: '#181b2e',
          })}
        />
      </div>
      <div className="text-xl font-bold mb-1" style={{ color }}>{emoji} {level}</div>
      <div className="text-sm text-[#b3baff] mb-2">{tip}</div>
      <div className="text-xs text-[#b3baff]">Budget: <span className="text-[#4de3c1] font-bold">${totalBudget}</span></div>
      <div className="text-xs text-[#ffb86b]">Spent: <span className="font-bold">${totalSpent}</span></div>
    </div>
  );
};

export default BudgetHealthMeter;
