import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Transaction } from '@/types/Transaction';


interface CategoryChartProps {
  transactions: Transaction[];
  cardClassName?: string;
  categories?: { value: string; label: string; emoji: string; color: string }[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ transactions, cardClassName = '', categories = [] }) => {
  const categoryData = React.useMemo(() => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => {
        const categoryInfo = categories.find(cat => cat.value === category);
        return {
          name: categoryInfo?.label || category,
          value: amount,
          emoji: categoryInfo?.emoji || '📦'
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const COLORS = [
    'linear-gradient(135deg, #ffb300 0%, #ffd600 100%)', // yellow
    'linear-gradient(135deg, #ff4081 0%, #c51162 100%)', // pink
    'linear-gradient(135deg, #7c4dff 0%, #00b8d4 100%)', // purple/teal
    'linear-gradient(135deg, #00e676 0%, #64dd17 100%)', // green
    'linear-gradient(135deg, #2979ff 0%, #00b8d4 100%)', // blue
    'linear-gradient(135deg, #ff1744 0%, #ff4081 100%)', // red
    'linear-gradient(135deg, #00b8d4 0%, #2979ff 100%)', // teal/blue
    'linear-gradient(135deg, #ffd600 0%, #ffb300 100%)', // gold/yellow
    'linear-gradient(135deg, #c51162 0%, #ff4081 100%)', // magenta/pink
    'linear-gradient(135deg, #64dd17 0%, #00e676 100%)', // lime/green
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="p-4 rounded-2xl shadow-2xl border-2 border-[#4de3c1] bg-[#23243a] text-white min-w-[140px] backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 text-lg font-bold mb-1">
            <span style={{ fontSize: 24 }}>{data.emoji}</span>
            <span>{data.name}</span>
          </div>
          <div className="text-xl font-extrabold text-[#4de3c1]">${data.value.toFixed(2)}</div>
        </motion.div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <g>
        <circle cx={x} cy={y} r={22} fill="#181b2e" opacity={0.85} />
        <text
          x={x}
          y={y}
          fill="#4de3c1"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight="bold"
        >
          {(percent * 100).toFixed(0)}%
        </text>
      </g>
    );
  };

  // Use category color if available, else fallback to palette
  const getColor = (entry, index) => {
    const cat = categories.find(cat => cat.label === entry.name);
    return cat?.color || [
      '#ffb300', '#ff4081', '#7c4dff', '#00e676', '#2979ff', '#ff1744', '#00b8d4', '#ffd600', '#c51162', '#64dd17'
    ][index % 10];
  };

  return (
    <Card className={`backdrop-blur-2xl bg-gradient-to-br from-[#23243a] via-[#2d2e4a] to-[#181b2e] border border-[#35365a] shadow-2xl ${cardClassName} rounded-2xl p-2`}> 
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-[#4de3c1] drop-shadow-lg">
          <span className="text-3xl">🥧</span> Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">📊 No spending data</p>
              <p>Add transactions to see the breakdown</p>
            </div>
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center gap-6 w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="w-full flex justify-center">
              <ResponsiveContainer width={340} height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={100}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#23243a"
                    strokeWidth={3}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
                      ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#23243a]/70 border border-[#35365a] shadow text-base font-semibold" style={{ color: getColor(entry, index) }}>
                  <span className="text-xl">{entry.emoji}</span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
