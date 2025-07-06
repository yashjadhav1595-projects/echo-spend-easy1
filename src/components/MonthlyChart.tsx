
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/Transaction';


interface MonthlyChartProps {
  transactions: Transaction[];
  cardClassName?: string;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions, cardClassName = '' }) => {
  const monthlyData = React.useMemo(() => {
    const monthlyTotals = transactions.reduce((acc, transaction) => {
      const month = transaction.date.slice(0, 7); // Get YYYY-MM format
      acc[month] = (acc[month] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    // Get last 6 months
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({
        month: monthName,
        amount: monthlyTotals[monthKey] || 0
      });
    }

    return months;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-600">
            {`Amount: $${payload[0].value.toFixed(2)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`backdrop-blur-sm ${cardClassName} bg-gradient-to-br from-[#181b2e] to-[#23243a] border border-[#35365a] shadow-xl rounded-xl`}> 
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-xl md:text-2xl">
          <span role="img" aria-label="chart">�</span> Monthly Spending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barCategoryGap={"20%"}>
              <CartesianGrid strokeDasharray="4 4" stroke="#35365a" />
              <XAxis 
                dataKey="month" 
                stroke="#b3baff"
                fontSize={13}
                tick={{ fill: '#b3baff', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#b3baff"
                fontSize={13}
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: '#b3baff', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(76, 227, 193, 0.08)' }} />
              <Bar 
                dataKey="amount" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4de3c1" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
