
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, CATEGORIES } from '@/types/Transaction';


interface SummaryCardsProps {
  transactions: Transaction[];
  cardClassName?: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions, cardClassName = '' }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );

  const totalSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = currentMonthTransactions.length;
  
  const topCategory = React.useMemo(() => {
    const categoryTotals = currentMonthTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategoryKey = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    if (!topCategoryKey) return null;
    
    const categoryInfo = CATEGORIES.find(cat => cat.value === topCategoryKey);
    return {
      ...categoryInfo,
      amount: categoryTotals[topCategoryKey]
    };
  }, [currentMonthTransactions]);

  const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className={`backdrop-blur-sm ${cardClassName}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#4de3c1]">💰 Total Spent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#4de3c1]">${totalSpent.toFixed(2)}</div>
          <p className="text-xs text-[#b3baff] mt-1">This month</p>
        </CardContent>
      </Card>

      <Card className={`backdrop-blur-sm ${cardClassName}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#7ee787]">📊 Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#7ee787]">{transactionCount}</div>
          <p className="text-xs text-[#b3baff] mt-1">This month</p>
        </CardContent>
      </Card>

      <Card className={`backdrop-blur-sm ${cardClassName}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#b3baff]">📈 Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#b3baff]">${averageTransaction.toFixed(2)}</div>
          <p className="text-xs text-[#b3baff] mt-1">Per transaction</p>
        </CardContent>
      </Card>

      <Card className={`backdrop-blur-sm ${cardClassName}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#ffb86b]">🔥 Top Category</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategory ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xl">{topCategory.emoji}</span>
                <div className="text-lg font-bold text-[#ffb86b]">
                  ${topCategory.amount?.toFixed(2)}
                </div>
              </div>
              <p className="text-xs text-[#b3baff] mt-1">{topCategory.label}</p>
            </>
          ) : (
            <div className="text-lg font-bold text-[#ffb86b]">No data</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
