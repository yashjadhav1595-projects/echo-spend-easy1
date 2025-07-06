import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '@/types/Transaction';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

// Helper: get current month/year
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year: String(now.getFullYear()),
  };
};

// Mock AI suggestion (replace with real AI logic as needed)
const getAISuggestedBudget = (category: string, month: string, year: string) => {
  // For demo: suggest 10% more than last month or 2000 if no data
  const base = 2000 + Math.floor(Math.random() * 1000);
  return base;
};

const LOCAL_KEY = 'category-budgets';

const BudgetForm = () => {
  const { toast } = useToast();
  const [{ month, year }, setMonthYear] = useState(getCurrentMonthYear());
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Load budgets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      setBudgets(JSON.parse(saved));
    }
  }, []);

  // Pre-fill input values with last saved or AI suggestion
  useEffect(() => {
    const newInputs: Record<string, string> = {};
    CATEGORIES.forEach(cat => {
      const key = `${cat.value}_${month}_${year}`;
      if (budgets[key] !== undefined) {
        newInputs[cat.value] = budgets[key].toString();
      } else {
        newInputs[cat.value] = getAISuggestedBudget(cat.value, month, year).toString();
      }
    });
    setInputValues(newInputs);
  }, [month, year, budgets]);

  // Save budgets to localStorage
  const saveBudgets = () => {
    const newBudgets = { ...budgets };
    CATEGORIES.forEach(cat => {
      const key = `${cat.value}_${month}_${year}`;
      newBudgets[key] = Number(inputValues[cat.value]) || 0;
    });
    setBudgets(newBudgets);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newBudgets));
    toast({
      title: 'Budgets Saved!',
      description: `Your budgets for ${month}/${year} have been updated.`,
    });
  };

  // Handle input change
  const handleInput = (cat: string, val: string) => {
    if (/^\d*$/.test(val)) {
      setInputValues({ ...inputValues, [cat]: val });
    }
  };

  // Render
  return (
    <div className="max-w-2xl mx-auto bg-white/10 rounded-2xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#4de3c1]">Set Monthly Budgets</h2>
      <div className="flex gap-4 mb-6">
        <label className="font-medium">Month:</label>
        <select
          value={month}
          onChange={e => setMonthYear(m => ({ ...m, month: e.target.value }))}
          className="rounded px-2 py-1 border border-[#35365a] bg-[#23243a] text-[#e6e6fa] focus:ring-2 focus:ring-[#4de3c1] text-base"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <label className="font-medium ml-2">Year:</label>
        <input
          type="number"
          value={year}
          onChange={e => setMonthYear(m => ({ ...m, year: e.target.value }))}
          className="w-24 rounded px-2 py-1 border border-[#35365a] bg-[#23243a] text-[#e6e6fa] focus:ring-2 focus:ring-[#4de3c1] text-base"
        />
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          // Validate all > 0
          for (const cat of CATEGORIES) {
            if (Number(inputValues[cat.value]) <= 0) {
              toast({
                title: 'Invalid Amount',
                description: `Budget for ${cat.label} must be greater than 0.`,
                variant: 'destructive',
              });
              return;
            }
          }
          saveBudgets();
        }}
      >
        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const aiValue = getAISuggestedBudget(cat.value, month, year);
            const key = `${cat.value}_${month}_${year}`;
            return (
              <div key={cat.value} className="flex items-center gap-4 bg-[#23243a]/60 rounded-xl px-4 py-3 border border-[#35365a]">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="w-40 font-semibold text-[#e6e6fa]">{cat.label}</span>
                <Input
                  type="number"
                  min={1}
                  value={inputValues[cat.value] || ''}
                  onChange={e => handleInput(cat.value, e.target.value)}
                  className="w-28 text-base font-bold bg-[#181b2e] border-[#35365a] text-[#4de3c1]"
                  onFocus={() => setEditing(cat.value)}
                  onBlur={() => setEditing(null)}
                  required
                />
                <span className="ml-2 text-xs text-[#b3baff] italic">
                  <span className="font-bold text-[#4de3c1]">AI suggestion:</span> ${aiValue}
                </span>
                {inputValues[cat.value] === aiValue.toString() && (
                  <span className="ml-1 text-green-400 font-bold">✓</span>
                )}
              </div>
            );
          })}
        </div>
        <Button type="submit" className="mt-8 w-full text-lg font-bold py-3 rounded-xl">Save Budgets</Button>
      </form>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-[#b3baff]">Your Budgets for {month}/{year}</h3>
        <ul className="space-y-2">
          {CATEGORIES.map(cat => {
            const key = `${cat.value}_${month}_${year}`;
            const val = budgets[key];
            return (
              <li key={cat.value} className="flex items-center gap-3 bg-[#181b2e]/60 rounded-lg px-4 py-2 border border-[#35365a]">
                <span className="text-xl">{cat.emoji}</span>
                <span className="w-40 text-[#e6e6fa]">{cat.label}</span>
                <span className="font-bold text-[#4de3c1]">${val || 0}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default BudgetForm;
