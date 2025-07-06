
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, CATEGORIES } from '@/types/Transaction';
import { Edit, Trash2 } from 'lucide-react';
import { useUndoDelete } from '@/hooks/useUndoDelete';
import './ui/custom-scrollbar.css';


interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onRestore: (transaction: Transaction) => void;
  cardClassName?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onRestore,
  cardClassName = '',
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'amount' | 'category'>('date');
  const { showUndoToast } = useUndoDelete();

  let filteredTransactions = transactions.filter(transaction => 
    filterCategory === 'all' || transaction.category === filterCategory
  );

  // Sorting logic
  filteredTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'time') {
      // If same date, sort by time string
      if (a.date === b.date) {
        return (b.time || '').localeCompare(a.time || '');
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'amount') {
      return Math.abs(b.amount) - Math.abs(a.amount);
    } else if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

  const getCategoryInfo = (categoryValue: string) => {
    return CATEGORIES.find(cat => cat.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDelete = (transaction: Transaction) => {
    onDelete(transaction.id);
    showUndoToast(transaction, () => onRestore(transaction));
  };

  const [showAll, setShowAll] = useState(false);
  const visibleTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 3);

  return (
    <>
      <Card className={`backdrop-blur-sm ${cardClassName ? cardClassName : 'bg-[#23243a] border border-[#23243a] text-white shadow-lg rounded-xl'}`}>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle className={cardClassName?.includes('text-white') ? 'text-[#4de3c1]' : 'text-blue-700'}>💸 Recent Transactions</CardTitle>
            <div className="flex gap-2 items-center">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className={`w-40 ${cardClassName?.includes('text-white') ? 'bg-[#23243a] border-[#35365a] text-white' : 'bg-white border-blue-200 text-blue-900'}`}> 
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className={cardClassName?.includes('text-white') ? 'bg-[#23243a] border-[#35365a] text-white shadow-lg' : 'bg-white border-blue-200 text-blue-900 shadow-lg'}>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Sort By Dropdown */}
              <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                <SelectTrigger className={`w-36 ${cardClassName?.includes('text-white') ? 'bg-[#23243a] border-[#35365a] text-white' : 'bg-white border-blue-200 text-blue-900'}`} aria-label="Sort by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className={cardClassName?.includes('text-white') ? 'bg-[#23243a] border-[#35365a] text-white shadow-lg' : 'bg-white border-blue-200 text-blue-900 shadow-lg'}>
                  <SelectItem value="date">Date Created</SelectItem>
                  <SelectItem value="time">Time Created</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className={`text-center py-8 ${cardClassName?.includes('text-white') ? 'text-gray-400' : 'text-blue-400'}`}>
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg mb-2 font-medium">No transactions yet</p>
              <p>Start by adding your first transaction above!</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {visibleTransactions.map((transaction) => {
                  const categoryInfo = getCategoryInfo(transaction.category);
                  return (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${cardClassName?.includes('text-white')
                        ? 'bg-[#23243a]/80 border-[#35365a] hover:bg-[#2d2e4a] text-white'
                        : 'bg-white border-blue-100 hover:bg-blue-50 text-blue-900'}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">{categoryInfo.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${cardClassName?.includes('text-white') ? 'text-white' : 'text-blue-900'}`}>{transaction.description}</h3>
                            <Badge className={categoryInfo.color}>
                              {categoryInfo.label}
                            </Badge>
                          </div>
                          <div className="flex gap-2 text-xs mt-1">
                            <p className={`${cardClassName?.includes('text-white') ? 'text-gray-400' : 'text-blue-400'}`}>{formatDate(transaction.date)}</p>
                            {transaction.time && (
                              <span className={`${cardClassName?.includes('text-white') ? 'text-gray-400' : 'text-blue-400'}`}>| {transaction.time}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${cardClassName?.includes('text-white') ? 'text-cyan-400' : 'text-blue-600'}`}>-${transaction.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(transaction)}
                          className={`h-8 w-8 p-0 transition-colors ${cardClassName?.includes('text-white') ? 'hover:bg-[#35365a]' : 'hover:bg-blue-100'}`}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(transaction)}
                          className={`h-8 w-8 p-0 transition-colors ${cardClassName?.includes('text-white') ? 'hover:bg-[#3a1a1a]' : 'hover:bg-red-100'}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredTransactions.length > 3 && !showAll && (
                <div className="flex justify-center mt-4">
                  <button
                    className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#4de3c1] font-semibold shadow-lg backdrop-blur border border-[#4de3c1] transition-all duration-200"
                    onClick={() => setShowAll(true)}
                  >
                    View All
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Pop-up Dialog for All Transactions */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAll(false)} />
          <div className="relative z-10 w-full max-w-2xl mx-auto rounded-2xl bg-[#23243a]/90 border border-[#4de3c1] shadow-2xl p-8 flex flex-col items-center animate-fade-in">
            <div className="flex w-full justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#4de3c1]">All Transactions</h2>
              <button onClick={() => setShowAll(false)} className="text-[#b3baff] hover:text-[#4de3c1] text-xl font-bold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all">✕</button>
            </div>
            <div className="space-y-3 w-full max-h-[60vh] overflow-y-auto custom-scrollbar">
              {filteredTransactions.map((transaction) => {
                const categoryInfo = getCategoryInfo(transaction.category);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-[#35365a] bg-[#23243a]/80 hover:bg-[#2d2e4a] text-white transition-all duration-200 shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">{categoryInfo.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{transaction.description}</h3>
                          <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                        </div>
                        <div className="flex gap-2 text-xs mt-1">
                          <p className="text-gray-400">{formatDate(transaction.date)}</p>
                          {transaction.time && <span className="text-gray-400">| {transaction.time}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-cyan-400">-${transaction.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(transaction)} className="h-8 w-8 p-0 hover:bg-[#35365a]">
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(transaction)} className="h-8 w-8 p-0 hover:bg-[#3a1a1a]">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TransactionList;
