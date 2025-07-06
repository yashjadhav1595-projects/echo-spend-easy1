import React, { useMemo } from 'react';
import { Transaction } from '@/types/Transaction';

interface ProactiveBudgetAlertsProps {
  transactions: Transaction[];
  categoryBudgets: Record<string, number>;
  month: string;
  year: string;
}

// ProactiveBudgetAlerts: Inline alerts for dialog insights column
const ProactiveBudgetAlerts: React.FC<ProactiveBudgetAlertsProps> = ({
  transactions = [],
  categoryBudgets = {},
  month,
  year
}) => {
  // Calculate spending per category for the selected month/year
  const alerts = useMemo(() => {
    return Object.keys(categoryBudgets).map(cat => {
      const budget = categoryBudgets[cat] || 0;
      const spent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          const tMonth = String(tDate.getMonth() + 1).padStart(2, '0');
          const tYear = String(tDate.getFullYear());
          return t.category === cat && tMonth === month && tYear === year;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      return { cat, budget, spent, percent };
    }).filter(a => a.budget > 0 && a.percent >= 80);
  }, [transactions, categoryBudgets, month, year]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="font-bold text-yellow-300 mb-1">Budget Alerts</div>
      {alerts.map(({ cat, budget, spent, percent }) => (
        <div key={cat} className={`bg-[#23243a] border-l-4 ${percent >= 100 ? 'border-red-400' : 'border-yellow-300'} shadow-lg rounded-lg px-4 py-3 text-[#e6e6fa] animate-pulse`}>
          <div className="font-bold text-yellow-300">Alert: {cat}</div>
          <div className="text-sm">Spent <span className="text-[#ffb86b] font-bold">${spent}</span> of <span className="text-[#4de3c1] font-bold">${budget}</span> ({percent}%)</div>
          {percent >= 100 ? (
            <div className="text-red-400 font-semibold">Over budget!</div>
          ) : (
            <div className="text-yellow-300 font-semibold">Approaching limit</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProactiveBudgetAlerts;
