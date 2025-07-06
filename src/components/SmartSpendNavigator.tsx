import React, { useState, useMemo } from 'react';
import { TrendingDown, Target, PieChart, ArrowRight, Lightbulb, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '@/types/Transaction';

interface SmartSpendNavigatorProps {
  transactions: Transaction[];
  categories: Array<{ value: string; label: string; emoji: string; color: string }>;
}

interface SavingsSuggestion {
  category: string;
  currentSpending: number;
  suggestedReduction: number;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  reasoning: string;
}

interface CategoryAnalysis {
  category: string;
  total: number;
  percentage: number;
  avgPerMonth: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-teal-100 text-teal-800',
  hard: 'bg-red-100 text-red-800'
};

const DIFFICULTY_ICONS = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴'
};

export const SmartSpendNavigator: React.FC<SmartSpendNavigatorProps> = ({
  transactions,
  categories
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<SavingsSuggestion | null>(null);

  // Analyze spending patterns for the last 3 months
  const analysis = useMemo(() => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= threeMonthsAgo;
    });

    // Calculate category totals and monthly averages
    const categoryTotals: { [key: string]: number } = {};
    const categoryCounts: { [key: string]: number } = {};
    
    recentTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });

    const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: (total / totalSpending) * 100,
      avgPerMonth: total / 3,
      trend: 'stable' as const // Simplified for now
    })).sort((a, b) => b.total - a.total);
  }, [transactions]);

  // Generate savings suggestions
  const suggestions = useMemo(() => {
    if (analysis.length === 0) return [];

    return analysis.slice(0, 3).map(cat => {
      const currentSpending = cat.avgPerMonth;
      let suggestedReduction = 0;
      let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
      let reasoning = '';

      // Smart reduction suggestions based on spending amount
      if (currentSpending > 5000) {
        suggestedReduction = 0.20; // 20% reduction for high spending
        difficulty = 'medium';
        reasoning = 'High spending category - moderate reduction achievable';
      } else if (currentSpending > 2000) {
        suggestedReduction = 0.15; // 15% reduction for medium spending
        difficulty = 'easy';
        reasoning = 'Moderate spending - easy to optimize';
      } else {
        suggestedReduction = 0.10; // 10% reduction for low spending
        difficulty = 'easy';
        reasoning = 'Low spending category - small reduction';
      }

      const potentialSavings = currentSpending * suggestedReduction;

      return {
        category: cat.category,
        currentSpending,
        suggestedReduction: suggestedReduction * 100,
        potentialSavings,
        difficulty,
        reasoning
      };
    });
  }, [analysis]);

  // Calculate total potential savings
  const totalPotentialSavings = suggestions.reduce((sum, s) => sum + s.potentialSavings, 0);

  // Prepare data for pie chart comparison
  const chartData = useMemo(() => {
    const currentData = analysis.map(cat => ({
      name: cat.category,
      value: cat.total,
      type: 'Current'
    }));

    const optimizedData = analysis.map(cat => {
      const suggestion = suggestions.find(s => s.category === cat.category);
      const optimizedValue = suggestion 
        ? cat.total * (1 - suggestion.suggestedReduction / 100)
        : cat.total;
      
      return {
        name: cat.category,
        value: optimizedValue,
        type: 'Optimized'
      };
    });

    return [...currentData, ...optimizedData];
  }, [analysis, suggestions]);

  const COLORS = [
    '#4de3c1', '#6c63ff', '#ffb86b', '#ff79c6', '#50fa7b',
    '#8be9fd', '#f1fa8c', '#ff5555', '#bd93f9', '#ff6e6e'
  ];

  const handleSetGoal = (suggestion: SavingsSuggestion) => {
    setSelectedSuggestion(suggestion);
    // Here you could open a goal-setting modal or navigate to budget page
    console.log('Setting goal for:', suggestion);
  };

  const handleAdjustBudget = (suggestion: SavingsSuggestion) => {
    setSelectedSuggestion(suggestion);
    // Here you could open a budget adjustment modal
    console.log('Adjusting budget for:', suggestion);
  };

  if (transactions.length === 0) {
    return (
      <Card className="bg-[#23243a] border-[#35365a] text-[#e6e6fa] shadow-lg">
        <CardContent className="p-6 text-center">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-[#4de3c1]" />
          <h3 className="text-lg font-semibold mb-2">Smart Spending Navigator</h3>
          <p className="text-sm text-[#b3baff]">
            Add some transactions to get personalized savings suggestions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#23243a] border-[#35365a] text-[#e6e6fa] shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#4de3c1]" />
            Smart Spending Navigator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4de3c1]">
                ${totalPotentialSavings.toFixed(0)}
              </div>
              <div className="text-sm text-[#b3baff]">
                Potential Monthly Savings
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#6c63ff]">
                {suggestions.length}
              </div>
              <div className="text-sm text-[#b3baff]">
                Categories to Optimize
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4de3c1]">
                {suggestions.filter(s => s.difficulty === 'easy').length}
              </div>
              <div className="text-sm text-[#b3baff]">
                Easy Wins
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Suggestions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-[#4de3c1]" />
            Personalized Suggestions
          </h3>
          
          {suggestions.map((suggestion, index) => {
            const category = categories.find(c => c.value === suggestion.category);
            return (
              <Card key={suggestion.category} className="bg-[#2d2e4a] border-[#35365a] shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category?.emoji}</span>
                      <div>
                        <div className="font-medium">{category?.label}</div>
                        <div className="text-sm text-[#b3baff]">
                          Current: ${suggestion.currentSpending.toFixed(0)}/month
                        </div>
                      </div>
                    </div>
                    <Badge className={DIFFICULTY_COLORS[suggestion.difficulty]}>
                      {DIFFICULTY_ICONS[suggestion.difficulty]} {suggestion.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Suggested Reduction</span>
                        <span className="font-medium">{suggestion.suggestedReduction}%</span>
                      </div>
                      <Progress 
                        value={suggestion.suggestedReduction} 
                        className="h-2"
                      />
                    </div>

                    <div className="bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] p-3 rounded-lg text-white">
                      <div className="text-lg font-bold">
                        Save ${suggestion.potentialSavings.toFixed(0)}/month
                      </div>
                      <div className="text-sm opacity-90">
                        {suggestion.reasoning}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* Removed Set Goal and Adjust Budget buttons as requested */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};