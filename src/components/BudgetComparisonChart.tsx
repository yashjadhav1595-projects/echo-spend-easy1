import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Transaction } from '@/types/Transaction';
import { CATEGORIES } from '@/types/Transaction';

interface BudgetComparisonChartProps {
  transactions: Transaction[];
  categoryBudgets: Record<string, number>;
  month: string;
  year: string;
}

const getAISuggestion = (category: string, month: string, year: string) => {
  // Replace with real AI logic as needed
  return 2000 + Math.floor(Math.random() * 1000);
};

const BudgetComparisonChart: React.FC<BudgetComparisonChartProps> = ({
  transactions = [],
  categoryBudgets = {},
  month,
  year
}) => {
  // Calculate actual spending per category for the selected month/year
  const data = useMemo(() => {
    return CATEGORIES.map(cat => {
      const spent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          const tMonth = String(tDate.getMonth() + 1).padStart(2, '0');
          const tYear = String(tDate.getFullYear());
          return t.category === cat.value && tMonth === month && tYear === year;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const budget = categoryBudgets[cat.value] || 0;
      return {
        category: cat.label,
        spent,
        budget,
        over: spent > budget,
        percent: budget > 0 ? Math.round((spent / budget) * 100) : 0,
        ai: getAISuggestion(cat.value, month, year)
      };
    });
  }, [transactions, categoryBudgets, month, year]);

  // AI message (example)
  const aiMessage = useMemo(() => {
    const overspent = data.filter(d => d.over);
    if (overspent.length === 0) return 'Great job! All categories are within budget.';
    return `Watch out: ${overspent.map(d => d.category).join(', ')} over budget!`;
  }, [data]);

  return (
    <div className="bg-[#23243a] rounded-xl p-4 border border-[#35365a] shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-[#4de3c1] mb-2">Budget vs Actual</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
          <XAxis dataKey="category" tick={{ fill: '#b3baff', fontSize: 12 }} />
          <YAxis tick={{ fill: '#b3baff', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#23243a', border: '1px solid #35365a', color: '#e6e6fa' }}
            formatter={(value: any, name: string) => [
              `$${value}`,
              name === 'spent' ? 'Spent' : name.charAt(0).toUpperCase() + name.slice(1)
            ]}
          />
          <Legend wrapperStyle={{ color: '#b3baff' }} />
          <Bar dataKey="budget" fill="#4de3c1" radius={[4, 4, 0, 0]} name="Budget">
            <LabelList dataKey="budget" position="top" formatter={v => `$${v}`} fill="#4de3c1" fontSize={10} />
          </Bar>
          <Bar dataKey="spent" fill="#ffb86b" radius={[4, 4, 0, 0]} name="Spent">
            <LabelList dataKey="spent" position="top" formatter={v => `$${v}`} fill="#ffb86b" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-[#b3baff] italic">{aiMessage}</div>
    </div>
  );
};

export default BudgetComparisonChart;
