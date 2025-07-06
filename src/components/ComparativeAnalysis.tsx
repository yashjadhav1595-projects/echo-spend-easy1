import React, { useState, useMemo } from 'react';
import { format, parseISO, startOfWeek, addDays, isSameDay, isSameWeek, subDays, subMonths, subYears } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Transaction } from '@/types/Transaction';
import { motion } from 'framer-motion';

interface Props {
  transactions: Transaction[];
  cardClassName?: string;
}


type GroupKey = 'day' | 'month' | 'year' | 'hour' | 'week';
function groupBy(transactions: Transaction[], key: GroupKey, options?: { selectedDate?: string, selectedWeekStart?: string }) {
  const groups: Record<string, number> = {};
  if (key === 'hour' && options?.selectedDate) {
    // Group by hour for a specific day
    for (let h = 0; h < 24; h++) {
      const hourStr = h.toString().padStart(2, '0');
      groups[hourStr] = 0;
    }
    transactions.forEach(t => {
      if (t.date === options.selectedDate && t.time) {
        const hour = t.time.slice(0, 2);
        groups[hour] = (groups[hour] || 0) + t.amount;
      }
    });
    return Object.entries(groups).map(([label, amount]) => ({ label, amount }));
  }
  if (key === 'week' && options?.selectedWeekStart) {
    // Group by day for a specific week (Monday-Sunday)
    for (let i = 0; i < 7; i++) {
      const day = format(addDays(parseISO(options.selectedWeekStart), i), 'yyyy-MM-dd');
      groups[day] = 0;
    }
    transactions.forEach(t => {
      // Only include transactions in the selected week
      if (isSameWeek(parseISO(t.date), parseISO(options.selectedWeekStart), { weekStartsOn: 1 })) {
        groups[t.date] = (groups[t.date] || 0) + t.amount;
      }
    });
    return Object.entries(groups).map(([label, amount]) => ({ label, amount }));
  }
  transactions.forEach(t => {
    let groupKey = '';
    if (key === 'day') groupKey = t.date;
    if (key === 'month') groupKey = t.date.slice(0, 7);
    if (key === 'year') groupKey = t.date.slice(0, 4);
    groups[groupKey] = (groups[groupKey] || 0) + t.amount;
  });
  return Object.entries(groups).map(([label, amount]) => ({ label, amount }));
}

// Custom Tooltip for all chart types
const CustomTooltip = ({ active, payload, label }: any) => {
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
          <span>{label}</span>
        </div>
        {data.amount !== undefined ? (
          <div className="text-xl font-extrabold text-[#4de3c1]">${data.amount.toFixed(2)}</div>
        ) : (
          <div className="text-xl font-extrabold text-[#4de3c1]">${data.value?.toFixed(2) ?? ''}</div>
        )}
      </motion.div>
    );
  }
  return null;
};

export const ComparativeAnalysis: React.FC<Props> = ({ transactions, cardClassName = '' }) => {
  const [tab, setTab] = useState<GroupKey>('month');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today if there are transactions today, else most recent transaction date
    if (transactions.length > 0) {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (transactions.some(t => t.date === today)) return today;
      return transactions[0].date;
    }
    return format(new Date(), 'yyyy-MM-dd');
  });
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    // Default to start of week for today or most recent transaction
    const baseDate = transactions.length > 0 ? parseISO(transactions[0].date) : new Date();
    return format(startOfWeek(baseDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  });
  const [comparePrev, setComparePrev] = useState(false);

  // Data for each tab
  const hourData = useMemo(() => groupBy(transactions, 'hour', { selectedDate }), [transactions, selectedDate]);
  const dayData = useMemo(() => groupBy(transactions, 'day'), [transactions]);
  const weekData = useMemo(() => groupBy(transactions, 'week', { selectedWeekStart }), [transactions, selectedWeekStart]);
  const monthData = useMemo(() => {
    const grouped = groupBy(transactions, 'month');
    return grouped.sort((a, b) => a.label.localeCompare(b.label)); // Ascending order
  }, [transactions]);
  const yearData = useMemo(() => groupBy(transactions, 'year'), [transactions]);

  // Previous period data for comparison
  const prevHourData = useMemo(() => {
    if (!comparePrev) return null;
    const prevDate = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    return groupBy(transactions, 'hour', { selectedDate: prevDate });
  }, [transactions, selectedDate, comparePrev]);
  const prevWeekData = useMemo(() => {
    if (!comparePrev) return null;
    const prevWeekStart = format(subDays(parseISO(selectedWeekStart), 7), 'yyyy-MM-dd');
    return groupBy(transactions, 'week', { selectedWeekStart: prevWeekStart });
  }, [transactions, selectedWeekStart, comparePrev]);
  const prevMonthData = useMemo(() => {
    if (!comparePrev) return null;
    const prevMonth = format(subMonths(parseISO(monthData[0]?.label + '-01' || format(new Date(), 'yyyy-MM-01')), 1), 'yyyy-MM');
    return groupBy(transactions, 'month').filter(d => d.label === prevMonth);
  }, [transactions, monthData, comparePrev]);
  const prevYearData = useMemo(() => {
    if (!comparePrev) return null;
    const prevYear = (parseInt(yearData[0]?.label || format(new Date(), 'yyyy')) - 1).toString();
    return groupBy(transactions, 'year').filter(d => d.label === prevYear);
  }, [transactions, yearData, comparePrev]);

  // UI for date/week pickers
  const renderDatePicker = () => (
    <input
      type="date"
      value={selectedDate}
      max={format(new Date(), 'yyyy-MM-dd')}
      onChange={e => setSelectedDate(e.target.value)}
      className="ml-4 px-2 py-1 rounded border border-gray-300 dark:border-[#35365a] bg-transparent text-sm"
    />
  );
  const renderWeekPicker = () => (
    <input
      type="date"
      value={selectedWeekStart}
      max={format(new Date(), 'yyyy-MM-dd')}
      onChange={e => setSelectedWeekStart(format(startOfWeek(parseISO(e.target.value), { weekStartsOn: 1 }), 'yyyy-MM-dd'))}
      className="ml-4 px-2 py-1 rounded border border-gray-300 dark:border-[#35365a] bg-transparent text-sm"
      title="Pick any date in the week"
    />
  );

  return (
    <Card className={`mt-8 ${cardClassName}`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-[#4de3c1] flex items-center gap-4">
          Comparative Analysis
          <span className="ml-auto flex items-center gap-2 text-base font-normal">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input type="checkbox" checked={comparePrev} onChange={e => setComparePrev(e.target.checked)} className="accent-[#4de3c1]" />
              <span className="text-xs text-[#b3baff]">Compare previous</span>
            </label>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={v => setTab(v as any)} className="mb-4">
          <TabsList>
            <TabsTrigger value="hour">Hour</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center mb-2">
          {tab === 'hour' && renderDatePicker()}
          {tab === 'week' && renderWeekPicker()}
        </div>
        <div className="h-56 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {tab === 'hour' ? (
              <LineChart data={hourData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#35365a" />
                <XAxis dataKey="label" stroke="#4de3c1" fontSize={13} tick={{ fill: '#4de3c1', fontWeight: 500 }} axisLine={false} tickLine={false} label={{ value: 'Hour', position: 'insideBottom', offset: -5, fill: '#4de3c1' }} />
                <YAxis stroke="#4de3c1" fontSize={13} tickFormatter={v => `$${v}`} tick={{ fill: '#4de3c1', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#4de3c1" strokeWidth={3} dot={{ r: 4, fill: '#4de3c1' }} activeDot={{ r: 6 }} />
                {comparePrev && prevHourData && (
                  <Line type="monotone" dataKey="amount" data={prevHourData} stroke="#b3baff" strokeDasharray="4 2" strokeWidth={2} dot={false} name="Previous Day" />
                )}
              </LineChart>
            ) : tab === 'week' ? (
              <BarChart data={weekData.map((d, i) => ({
                ...d,
                prev: prevWeekData ? prevWeekData[i]?.amount ?? 0 : undefined
              }))} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barCategoryGap={"20%"}>
                <CartesianGrid strokeDasharray="4 4" stroke="#35365a" />
                <XAxis dataKey="label" stroke="#7ee787" fontSize={13} tick={{ fill: '#7ee787', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#7ee787" fontSize={13} tickFormatter={v => `$${v}`} tick={{ fill: '#7ee787', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="url(#barGradientWeek)" radius={[8, 8, 0, 0]} maxBarSize={40} />
                {comparePrev && prevWeekData && (
                  <Bar dataKey="prev" fill="#b3baff" radius={[8, 8, 0, 0]} maxBarSize={20} name="Previous Week" />
                )}
                <defs>
                  <linearGradient id="barGradientWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7ee787" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#b3baff" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            ) : tab === 'month' ? (
              <BarChart data={monthData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barCategoryGap={"20%"}>
                <CartesianGrid strokeDasharray="4 4" stroke="#35365a" />
                <XAxis dataKey="label" stroke="#6c63ff" fontSize={13} tick={{ fill: '#6c63ff', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6c63ff" fontSize={13} tickFormatter={v => `$${v}`} tick={{ fill: '#6c63ff', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="url(#barGradientMonth)" radius={[8, 8, 0, 0]} maxBarSize={40} />
                {comparePrev && prevMonthData && prevMonthData.length > 0 && (
                  <Bar dataKey="prev" fill="#b3baff" radius={[8, 8, 0, 0]} maxBarSize={20} name="Previous Month" />
                )}
                <defs>
                  <linearGradient id="barGradientMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#b3baff" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            ) : tab === 'year' ? (
              <BarChart data={yearData.map((d, i) => ({
                ...d,
                prev: prevYearData ? prevYearData[i]?.amount ?? 0 : undefined
              }))} margin={{ top: 20, right: 20, left: 0, bottom: 10 }} barCategoryGap={"20%"}>
                <CartesianGrid strokeDasharray="4 4" stroke="#35365a" />
                <XAxis dataKey="label" stroke="#ffb86b" fontSize={13} tick={{ fill: '#ffb86b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffb86b" fontSize={13} tickFormatter={v => `$${v}`} tick={{ fill: '#ffb86b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="url(#barGradientYear)" radius={[8, 8, 0, 0]} maxBarSize={40} />
                {comparePrev && prevYearData && prevYearData.length > 0 && (
                  <Bar dataKey="prev" fill="#b3baff" radius={[8, 8, 0, 0]} maxBarSize={20} name="Previous Year" />
                )}
                <defs>
                  <linearGradient id="barGradientYear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffb86b" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#fff1e0" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            ) : (
              <LineChart data={dayData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#35365a" />
                <XAxis dataKey="label" stroke="#4de3c1" fontSize={13} tick={{ fill: '#4de3c1', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#4de3c1" fontSize={13} tickFormatter={v => `$${v}`} tick={{ fill: '#4de3c1', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#4de3c1" strokeWidth={3} dot={{ r: 4, fill: '#4de3c1' }} activeDot={{ r: 6 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
