import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CATEGORIES } from '@/types/Transaction';
import { Transaction } from '@/types/Transaction';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import BudgetComparisonChart from './BudgetComparisonChart';
import BudgetHealthMeter from './BudgetHealthMeter';
import MonthlyBudgetCalendar from './MonthlyBudgetCalendar';
import ProactiveBudgetAlerts from './ProactiveBudgetAlerts';
import './ui/custom-scrollbar-lightning.css';

const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year: String(now.getFullYear()),
  };
};

interface BudgetDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  transactions: Transaction[];
  categoryBudgets: Record<string, number>;
  setCategoryBudgets: (budgets: Record<string, number>) => void;
  income: number;
  setIncome: (income: number) => void;
  goalPrompt: string;
  setGoalPrompt: (prompt: string) => void;
  onSetGoal: () => void;
}

export const BudgetDialog: React.FC<BudgetDialogProps> = ({
  open,
  setOpen,
  transactions,
  categoryBudgets,
  setCategoryBudgets,
  income,
  setIncome,
  goalPrompt,
  setGoalPrompt,
  onSetGoal,
}) => {
  // Tabs: 'monthly' or 'yearly'
  const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly');
  const [{ month, year }, setMonthYear] = useState(getCurrentMonthYear());
  const [yearly, setYearly] = useState(year);
  const [editingGoalIdx, setEditingGoalIdx] = useState<number | null>(null);
  const [editingGoalValue, setEditingGoalValue] = useState('');

  // --- NEW: Budgets state for monthly/yearly, hydrated from localStorage ---
  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, Record<string, string>>>(() => {
    try {
      return JSON.parse(localStorage.getItem('monthly-budgets') || '{}');
    } catch {
      return {};
    }
  });
  const [yearlyBudgets, setYearlyBudgets] = useState<Record<string, Record<string, string>>>(() => {
    try {
      return JSON.parse(localStorage.getItem('yearly-budgets') || '{}');
    } catch {
      return {};
    }
  });

  // --- NEW: Hydrate goals from localStorage ---
  const [monthlyGoals, setMonthlyGoals] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('monthly-goals') || '{}');
    } catch {
      return {};
    }
  });
  const [yearlyGoals, setYearlyGoals] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('yearly-goals') || '{}');
    } catch {
      return {};
    }
  });

  // Save goals to localStorage when changed
  useEffect(() => {
    localStorage.setItem('monthly-goals', JSON.stringify(monthlyGoals));
  }, [monthlyGoals]);
  useEffect(() => {
    localStorage.setItem('yearly-goals', JSON.stringify(yearlyGoals));
  }, [yearlyGoals]);

  // Calculate spending per category for selected period
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of CATEGORIES) map[cat.value] = 0;
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const tMonth = String(tDate.getMonth() + 1).padStart(2, '0');
      const tYear = String(tDate.getFullYear());
      if (
        (tab === 'monthly' && tMonth === month && tYear === year) ||
        (tab === 'yearly' && tYear === yearly)
      ) {
        if (map[t.category] !== undefined) map[t.category] += Math.abs(t.amount);
      }
    });
    return map;
  }, [transactions, tab, month, year, yearly]);

  // --- Refactored: Separate state for monthly and yearly budgets ---
  // monthlyBudgets: Record<YYYY_MM, Record<category, string>>
  // yearlyBudgets: Record<YYYY, Record<category, string>>
  // All logic below will use these two states and never overlap.

  // --- Pre-fill input values with last saved or AI suggestion ---
  useEffect(() => {
    let newInputs: Record<string, string> = {};
    if (tab === 'monthly') {
      const key = `${month}_${year}`;
      const budgets = monthlyBudgets[key] || {};
      CATEGORIES.forEach(cat => {
        newInputs[cat.value] = budgets[cat.value]?.toString() || getAISSuggestedBudget(cat.value, month, year).toString();
      });
    } else {
      const budgets = yearlyBudgets[yearly] || {};
      CATEGORIES.forEach(cat => {
        newInputs[cat.value] = budgets[cat.value]?.toString() || getAISSuggestedBudget(cat.value, '', yearly).toString();
      });
    }
    setInputValues(newInputs);
  }, [tab, month, year, yearly, monthlyBudgets, yearlyBudgets]);

  // --- Save budgets for current view and update parent state ---
  const saveBudgets = () => {
    if (tab === 'monthly') {
      const key = `${month}_${year}`;
      setMonthlyBudgets(prev => {
        const updated = { ...prev, [key]: { ...inputValues } };
        localStorage.setItem('monthly-budgets', JSON.stringify(updated));
        // Update parent state for current month/year only
        if (setCategoryBudgets) {
          const numBudgets: Record<string, number> = {};
          Object.keys(inputValues).forEach(k => {
            numBudgets[k] = Number(inputValues[k]) || 0;
          });
          setCategoryBudgets(numBudgets);
        }
        return updated;
      });
    } else {
      setYearlyBudgets(prev => {
        const updated = { ...prev, [yearly]: { ...inputValues } };
        localStorage.setItem('yearly-budgets', JSON.stringify(updated));
        // Update parent state for current year only
        if (setCategoryBudgets) {
          const numBudgets: Record<string, number> = {};
          Object.keys(inputValues).forEach(k => {
            numBudgets[k] = Number(inputValues[k]) || 0;
          });
          setCategoryBudgets(numBudgets);
        }
        return updated;
      });
    }
    toast({
      title: 'Budgets Saved!',
      description: tab === 'monthly'
        ? `Your budgets for ${month}/${year} have been updated.`
        : `Your budgets for ${yearly} have been updated.`,
    });
  };

  // --- Filtered category budgets for current view, as Record<string, number> ---
  const filteredCategoryBudgets: Record<string, number> = useMemo(() => {
    let budgets: Record<string, string> = {};
    if (tab === 'monthly') {
      const key = `${month}_${year}`;
      budgets = monthlyBudgets[key] || {};
    } else {
      budgets = yearlyBudgets[yearly] || {};
    }
    // Convert to number
    const result: Record<string, number> = {};
    Object.keys(budgets).forEach(k => {
      result[k] = Number(budgets[k]) || 0;
    });
    return result;
  }, [tab, month, year, yearly, monthlyBudgets, yearlyBudgets]);

  // --- Total budget, spending, and live balance for current view only ---
  const totalBudget = useMemo(() => Object.values(filteredCategoryBudgets).reduce((a, b) => a + b, 0), [filteredCategoryBudgets]);
  const totalSpending = useMemo(() => Object.values(categorySpending).reduce((a, b) => a + b, 0), [categorySpending]);
  const liveBalance = totalBudget - totalSpending;

  // --- Helper: get goals for current view ---
  const currentGoals = useMemo(() => {
    if (tab === 'monthly') {
      const key = `${month}_${year}`;
      return monthlyGoals[key] || [];
    } else {
      return yearlyGoals[yearly] || [];
    }
  }, [tab, month, year, yearly, monthlyGoals, yearlyGoals]);

  // --- NEW: Section tab state for Budgets/Goals ---
  const [sectionTab, setSectionTab] = useState<'budgets' | 'goals'>('budgets');

  // --- NEW: Ref for goals section scroll ---
  const goalsRef = useRef<HTMLDivElement>(null);

  // --- NEW: Ref for Edit Budget section scroll ---
  const editBudgetRef = useRef<HTMLDivElement>(null);

  // Scroll to Edit Budget when Budgets tab is selected
  useEffect(() => {
    if (sectionTab === 'budgets' && editBudgetRef.current) {
      setTimeout(() => {
        editBudgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    }
  }, [sectionTab]);

  // --- NEW: Filtered transactions for current month/year ---
  const filteredTransactions = useMemo(() => {
    if (tab === 'monthly') {
      return transactions.filter(
        t => t.date &&
          new Date(t.date).getMonth() + 1 === Number(month) &&
          new Date(t.date).getFullYear() === Number(year)
      );
    } else {
      return transactions.filter(
        t => t.date && new Date(t.date).getFullYear() === Number(yearly)
      );
    }
  }, [transactions, tab, month, year, yearly]);

  // --- NEW: handleInput for budget input changes ---
  const handleInput = (cat: string, value: string) => {
    setInputValues(prev => ({ ...prev, [cat]: value }));
  };

  // Animated number helper
  const AnimatedNumber = ({ value, className }: { value: number, className?: string }) => {
    const [display, setDisplay] = useState(value);
    useEffect(() => {
      let frame: number;
      let start = display;
      let end = value;
      let startTime: number | null = null;
      const duration = 400;
      function animate(ts: number) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        setDisplay(Math.round(start + (end - start) * progress));
        if (progress < 1) frame = requestAnimationFrame(animate);
      }
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }, [value]);
    return <span className={className}>{display.toLocaleString()}</span>;
  };

  // --- Stage 3: Budgeting Deep Dive ---
  const LOCAL_KEY = 'category-budgets';
  // Helper: get AI suggestion (replace with real AI logic as needed)
  const getAISSuggestedBudget = (category: string, month: string, year: string) => {
    // For demo: suggest 10% more than last month or 2000 if no data
    const base = 2000 + Math.floor(Math.random() * 1000);
    return base;
  };
  const { toast } = useToast();
  // State for editable budget inputs
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // --- On mount, load budgets/goals from localStorage ---
  useEffect(() => {
    const m = localStorage.getItem('monthly-budgets');
    if (m) setMonthlyBudgets(JSON.parse(m));
    const y = localStorage.getItem('yearly-budgets');
    if (y) setYearlyBudgets(JSON.parse(y));
    const mg = localStorage.getItem('monthly-goals');
    if (mg) setMonthlyGoals(JSON.parse(mg));
    const yg = localStorage.getItem('yearly-goals');
    if (yg) setYearlyGoals(JSON.parse(yg));
  }, []);

  // --- Stage 2: Budgeting Basics ---
  // Focus input on row click
  const inputRefs: Record<string, React.RefObject<HTMLInputElement>> = {};
  CATEGORIES.forEach(cat => {
    inputRefs[cat.value] = React.createRef<HTMLInputElement>();
  });

  // Handle goal set for current view
  const handleSetGoal = () => {
    if (!goalPrompt.trim()) return;
    if (tab === 'monthly') {
      const key = `${month}_${year}`;
      setMonthlyGoals(prev => {
        const updated = { ...prev, [key]: [goalPrompt, ...(prev[key] || [])] };
        return updated;
      });
    } else {
      setYearlyGoals(prev => {
        const updated = { ...prev, [yearly]: [goalPrompt, ...(prev[yearly] || [])] };
        return updated;
      });
    }
    setGoalPrompt('');
    onSetGoal();
  };

  // --- FIX: Editing goals updates correct state ---
  const handleGoalEdit = (idx: number) => {
    setEditingGoalIdx(idx);
    setEditingGoalValue(currentGoals[idx]);
  };

  const saveGoalEdit = (idx: number) => {
    if (!editingGoalValue.trim()) {
      setEditingGoalIdx(null);
      setEditingGoalValue('');
      return;
    }
    if (tab === 'monthly') {
      const key = `${month}_${year}`;
      setMonthlyGoals(prev => {
        const arr = [...(prev[key] || [])];
        arr[idx] = editingGoalValue;
        return { ...prev, [key]: arr };
      });
    } else {
      setYearlyGoals(prev => {
        const arr = [...(prev[yearly] || [])];
        arr[idx] = editingGoalValue;
        return { ...prev, [yearly]: arr };
      });
    }
    setEditingGoalIdx(null);
    setEditingGoalValue('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[#23243a] border border-[#ffe066] text-[#fff] max-w-5xl w-full rounded-2xl shadow-2xl p-0 max-h-[95vh] flex flex-col">
        {/* Monthly/Yearly Toggle */}
        <div className="flex justify-center pt-6 pb-2 gap-4">
          <button
            className={`px-4 py-1.5 rounded-md font-semibold text-base border border-transparent transition shadow-sm bg-transparent hover:bg-[#23243a]/40 ${tab === 'monthly' ? 'border-yellow-400 text-yellow-300 bg-[#23243a]/30' : 'text-[#b3baff]'}`}
            onClick={() => setTab('monthly')}
            type="button"
          >
            Monthly
          </button>
          <button
            className={`px-4 py-1.5 rounded-md font-semibold text-base border border-transparent transition shadow-sm bg-transparent hover:bg-[#23243a]/40 ${tab === 'yearly' ? 'border-yellow-400 text-yellow-300 bg-[#23243a]/30' : 'text-[#b3baff]'}`}
            onClick={() => setTab('yearly')}
            type="button"
          >
            Yearly
          </button>
        </div>
        {/* Budgets/Goals Tab Toggle */}
        <div className="flex justify-center gap-2 mb-2">
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg border-b-4 transition-all duration-150 ${sectionTab === 'budgets' ? 'border-yellow-400 text-yellow-300 bg-[#23243a]/60' : 'border-transparent text-[#b3baff] bg-transparent hover:bg-[#23243a]/40 hover:text-[#ffe066]'}`}
            onClick={() => setSectionTab('budgets')}
            type="button"
          >
            Budgets
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-lg border-b-4 transition-all duration-150 ${sectionTab === 'goals' ? 'border-yellow-400 text-yellow-300 bg-[#23243a]/60' : 'border-transparent text-[#b3baff] bg-transparent hover:bg-[#23243a]/40 hover:text-[#ffe066]'}`}
            onClick={() => setSectionTab('goals')}
            type="button"
          >
            Goals
          </button>
        </div>
        {/* Floating Summary Bar */}
        <div className="sticky top-0 z-30 w-full flex justify-center">
          <div className="bg-[#23243a]/80 border border-[#35365a] rounded-xl shadow px-8 py-4 mt-2 mb-2 flex flex-wrap gap-8 items-center max-w-2xl w-full mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-base text-[#ffe066] font-semibold">Total Budget</span>
              <AnimatedNumber value={totalBudget} className="text-2xl font-extrabold text-white" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base text-[#ffe066] font-semibold">Total Spending</span>
              <AnimatedNumber value={totalSpending} className="text-2xl font-extrabold text-[#ffb86b]" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base text-[#ffe066] font-semibold">Live Balance</span>
              <AnimatedNumber value={liveBalance} className={`text-2xl font-extrabold ${liveBalance < 0 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
          </div>
        </div>
        {/* Main Section: Budgets or Goals */}
        <div className="flex-1 flex flex-col gap-4 px-6 pb-8 pt-2 overflow-y-auto min-h-0">
          {sectionTab === 'budgets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Edit/Add Budget Section with its own custom scrollbar */}
              <div ref={editBudgetRef} className="flex flex-col gap-6 overflow-y-auto custom-scrollbar-lightning pr-2">
                <section className="bg-[#23243a] rounded-xl border border-[#ffe066] shadow-lg p-0 flex flex-col overflow-hidden">
                  <div className="sticky top-0 z-20 bg-transparent pt-4 pb-2 px-4">
                    <h2 className="text-xl font-bold text-[#4de3c1] tracking-tight mb-2">Edit Budget</h2>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <div className="flex items-center gap-2 bg-[#181b2e]/60 border border-[#35365a] rounded-lg px-3 py-1.5">
                        <span className="text-[#4de3c1] text-lg mr-1">📅</span>
                        {tab === 'monthly' ? (
                          <>
                            <label className="text-xs font-medium mr-1">Month:</label>
                            <select
                              value={month}
                              onChange={e => setMonthYear(m => ({ ...m, month: e.target.value }))}
                              className="rounded px-2 py-1 border border-[#35365a] bg-[#23243a] text-[#e6e6fa] focus:ring-2 focus:ring-[#4de3c1] text-sm"
                            >
                              {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                              ))}
                            </select>
                            <label className="text-xs font-medium ml-2 mr-1">Year:</label>
                            <input
                              type="number"
                              value={year}
                              onChange={e => setMonthYear(m => ({ ...m, year: e.target.value }))}
                              className="w-16 rounded px-2 py-1 border border-[#35365a] bg-[#23243a] text-[#e6e6fa] focus:ring-2 focus:ring-[#4de3c1] text-sm"
                            />
                          </>
                        ) : (
                          <>
                            <label className="text-xs font-medium mr-1">Year:</label>
                            <input
                              type="number"
                              value={yearly}
                              onChange={e => setYearly(e.target.value)}
                              className="w-16 rounded px-2 py-1 border border-[#35365a] bg-[#23243a] text-[#e6e6fa] focus:ring-2 focus:ring-[#4de3c1] text-sm"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Add Budget Section */}
                  <div className="px-4 pb-2">
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">Add Budget</h3>
                    <div className="flex-1 overflow-y-auto pb-2 space-y-4 custom-scrollbar">
                      {CATEGORIES.map((cat, idx) => {
                        const budget = inputValues[cat.value] || '';
                        const spent = filteredTransactions
                          .filter(t => t.category === cat.value)
                          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                        const aiValue = getAISSuggestedBudget(cat.value, tab === 'monthly' ? month : '', tab === 'monthly' ? year : yearly);
                        const percent = Number(budget) > 0 ? Math.min(100, (spent / Number(budget)) * 100) : 0;
                        const under = Number(budget) - spent;
                        return (
                          <div
                            key={cat.value}
                            className={
                              `group rounded-lg shadow bg-[#23243a]/80 px-4 py-3 flex flex-col gap-2 border border-[#35365a] cursor-pointer transition-all duration-200
                              hover:shadow-xl hover:border-[#ffe066] hover:bg-[#2d2e4a] focus-within:border-[#ffe066] focus-within:bg-[#2d2e4a]`
                            }
                            onClick={() => inputRefs[cat.value].current?.focus()}
                            tabIndex={0}
                            role="button"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl md:text-2xl drop-shadow-sm">{cat.emoji}</span>
                              <span className="font-semibold text-base md:text-lg text-white">{cat.label}</span>
                              <Input
                                ref={inputRefs[cat.value]}
                                type="number"
                                min={1}
                                value={budget}
                                onChange={e => handleInput(cat.value, e.target.value)}
                                className="w-20 text-base font-bold bg-[#181b2e] border-[#35365a] text-[#4de3c1] rounded-md px-2 py-1"
                                placeholder="$ Budget"
                                onClick={e => e.stopPropagation()}
                                required
                              />
                              <span className="ml-2 text-xs text-[#b3baff] italic">
                                <span className="font-bold text-[#4de3c1]">AI:</span> ${aiValue}
                              </span>
                              {budget === aiValue.toString() && (
                                <span className="ml-1 text-green-400 font-bold">✓</span>
                              )}
                            </div>
                            <div className="flex justify-between text-xs mb-1 font-semibold">
                              <span>Budget: <span className="text-[#4de3c1]">${budget}</span></span>
                              <span>Spent: <span className="text-[#ffb86b]">${spent}</span></span>
                              <span>{percent.toFixed(0)}%</span>
                            </div>
                            <Progress value={percent} className="h-2 bg-[#35365a] rounded-full transition-all duration-300" />
                            <div className={`mt-1 text-xs font-bold flex items-center gap-1 ${under >= 0 ? 'text-green-400' : 'text-red-400'}`}>{under >= 0 ? <span>✔️</span> : <span>⚠️</span>}{under >= 0 ? `You are $${under} under your limit.` : `Over by $${-under}`}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-start mt-4">
                      <Button
                        onClick={saveBudgets}
                        variant="ghost"
                        className="text-base font-semibold px-6 py-2 rounded-md border border-[#4de3c1] bg-[#23243a] text-white hover:bg-[#ffe066] hover:text-[#23243a] focus:bg-[#ffe066] focus:text-[#23243a] transition-all"
                      >
                        Save Budgets
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
              {/* Budget Insights Section */}
              <div className="flex flex-col gap-4">
                <BudgetHealthMeter
                  transactions={filteredTransactions}
                  categoryBudgets={filteredCategoryBudgets}
                  month={tab === 'monthly' ? month : ''}
                  year={tab === 'monthly' ? year : yearly}
                />
                <BudgetComparisonChart
                  transactions={filteredTransactions}
                  categoryBudgets={filteredCategoryBudgets}
                  month={tab === 'monthly' ? month : ''}
                  year={tab === 'monthly' ? year : yearly}
                />
                {/* --- Proactive Budget Alerts --- */}
                <ProactiveBudgetAlerts
                  transactions={filteredTransactions}
                  categoryBudgets={filteredCategoryBudgets}
                  month={tab === 'monthly' ? month : ''}
                  year={tab === 'monthly' ? year : yearly}
                />
                {tab === 'monthly' && (
                  <MonthlyBudgetCalendar
                    transactions={filteredTransactions}
                    categoryBudgets={filteredCategoryBudgets}
                  />
                )}
              </div>
            </div>
          ) : (
            // Goals Section
            <section ref={goalsRef} className="min-w-[320px] max-w-2xl mx-auto bg-[#23243a] rounded-xl border border-[#ffe066] shadow-lg p-0 flex flex-col overflow-hidden max-h-[70vh] overflow-y-auto custom-scrollbar-lightning">
              <div className="sticky top-0 z-20 bg-transparent pt-6 pb-2 px-4">
                <h2 className="text-xl font-bold text-yellow-300 tracking-tight mb-2 flex items-center gap-2">🎯 Goals & Milestones</h2>
              </div>
              <div className="flex flex-col gap-3 px-4 pb-6">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={tab === 'monthly' ? `e.g., Save $5000 in Food for ${month}/${year}` : `e.g., Save $50000 in 2025`}
                    value={goalPrompt}
                    onChange={e => setGoalPrompt(e.target.value)}
                    className="w-full rounded-md px-3 py-2 border border-[#35365a] bg-[#181b2e] text-[#e6e6fa] text-base focus:ring-2 focus:ring-[#4de3c1]"
                  />
                  <Button onClick={handleSetGoal} variant="ghost" className="px-4 py-2 rounded-md border border-[#4de3c1] hover:bg-[#23243a]/40 transition-all">
                    Set Goal
                  </Button>
                </div>
                <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                  {currentGoals.length === 0 && <div className="text-base text-[#b3baff]">No goals set yet.</div>}
                  {currentGoals.map((goal, idx) => (
                    <div key={idx} className="bg-[#23243a]/80 rounded-md px-4 py-2 text-base text-[#e6e6fa] border border-[#35365a] shadow-sm cursor-pointer hover:border-[#4de3c1] hover:shadow transition-all duration-200"
                      onClick={() => handleGoalEdit(idx)}
                    >
                      {editingGoalIdx === idx ? (
                        <input
                          autoFocus
                          value={editingGoalValue}
                          onChange={e => setEditingGoalValue(e.target.value)}
                          onBlur={() => saveGoalEdit(idx)}
                          onKeyDown={e => { if (e.key === 'Enter') saveGoalEdit(idx); }}
                          className="w-full rounded px-3 py-2 border border-[#35365a] bg-[#23243a] text-[#e6e6fa] text-base focus:ring-2 focus:ring-[#4de3c1]"
                        />
                      ) : <span>{goal}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
        <DialogFooter className="px-8 pb-6 flex justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)} className="border border-[#35365a] text-[#e6e6fa] px-6 py-2 text-base font-semibold rounded-md hover:bg-[#23243a]/40 transition-all">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};