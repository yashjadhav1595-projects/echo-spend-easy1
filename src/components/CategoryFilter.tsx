import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, TrendingUp, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Transaction } from '@/types/Transaction';

interface CategoryFilterProps {
  transactions: Transaction[];
  categories: Array<{ value: string; label: string; emoji: string; color: string }>;
  onFilterChange: (filteredTransactions: Transaction[]) => void;
  darkMode?: boolean;
}

type FilterType = 'all' | 'top-spending' | 'recently-added' | string;

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  transactions,
  categories,
  onFilterChange,
  darkMode = false
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [isSticky, setIsSticky] = useState(false);

  // Calculate category spending for top spending filter
  const categorySpending = categories.map(category => {
    const total = transactions
      .filter(t => t.category === category.value)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { ...category, total };
  }).sort((a, b) => b.total - a.total);

  // Get recently added transactions (last 7 days)
  const recentlyAdded = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactionDate >= weekAgo;
  });

  // Apply filter
  useEffect(() => {
    let filteredTransactions: Transaction[] = [];

    switch (selectedFilter) {
      case 'all':
        filteredTransactions = transactions;
        break;
      case 'top-spending':
        const topCategory = categorySpending[0]?.value;
        filteredTransactions = transactions.filter(t => t.category === topCategory);
        break;
      case 'recently-added':
        filteredTransactions = recentlyAdded;
        break;
      default:
        // Category filter
        filteredTransactions = transactions.filter(t => t.category === selectedFilter);
        break;
    }

    onFilterChange(filteredTransactions);
  }, [selectedFilter, transactions, onFilterChange, categorySpending, recentlyAdded]);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'all':
        return { label: 'All Transactions', icon: <Filter className="w-4 h-4" />, count: transactions.length };
      case 'top-spending':
        const topCat = categorySpending[0];
        return { 
          label: `Top: ${topCat?.emoji} ${topCat?.label}`, 
          icon: <TrendingUp className="w-4 h-4" />, 
          count: transactions.filter(t => t.category === topCat?.value).length 
        };
      case 'recently-added':
        return { label: 'Recently Added', icon: <Clock className="w-4 h-4" />, count: recentlyAdded.length };
      default:
        const category = categories.find(c => c.value === filter);
        return { 
          label: `${category?.emoji} ${category?.label}`, 
          icon: null, 
          count: transactions.filter(t => t.category === filter).length 
        };
    }
  };

  const currentFilter = getFilterLabel(selectedFilter);

  return (
    <div className={`transition-all duration-300 ${isSticky ? 'sticky top-0 z-30' : ''}`}>
      <Card className={`${darkMode ? 'bg-[#23243a] border-[#35365a] text-[#e6e6fa]' : 'bg-white'} shadow-lg transition-all duration-300 ${isSticky ? 'rounded-none border-t-0 border-l-0 border-r-0' : 'rounded-xl'}`}>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Main Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`flex items-center gap-2 ${darkMode ? 'border-[#35365a] text-[#e6e6fa] hover:bg-[#2d2e4a]' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  {currentFilter.icon}
                  <span className="font-medium">{currentFilter.label}</span>
                  <Badge variant="secondary" className={`ml-2 ${darkMode ? 'bg-[#35365a] text-[#e6e6fa]' : 'bg-gray-100 text-gray-700'}`}>
                    {currentFilter.count}
                  </Badge>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`w-56 ${darkMode ? 'bg-[#23243a] border-[#35365a]' : 'bg-white'}`}>
                {/* Special Filters */}
                <DropdownMenuItem 
                  onClick={() => setSelectedFilter('all')}
                  className={`flex items-center gap-2 ${darkMode ? 'hover:bg-[#2d2e4a] text-[#e6e6fa]' : 'hover:bg-gray-50'}`}
                >
                  <Filter className="w-4 h-4" />
                  <span>All Transactions</span>
                  <Badge variant="secondary" className="ml-auto">{transactions.length}</Badge>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setSelectedFilter('top-spending')}
                  className={`flex items-center gap-2 ${darkMode ? 'hover:bg-[#2d2e4a] text-[#e6e6fa]' : 'hover:bg-gray-50'}`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Top Spending Category</span>
                  <Badge variant="secondary" className="ml-auto">
                    {categorySpending[0] ? transactions.filter(t => t.category === categorySpending[0].value).length : 0}
                  </Badge>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setSelectedFilter('recently-added')}
                  className={`flex items-center gap-2 ${darkMode ? 'hover:bg-[#2d2e4a] text-[#e6e6fa]' : 'hover:bg-gray-50'}`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Recently Added (7 days)</span>
                  <Badge variant="secondary" className="ml-auto">{recentlyAdded.length}</Badge>
                </DropdownMenuItem>

                {/* Category Separator */}
                <div className={`h-px my-2 ${darkMode ? 'bg-[#35365a]' : 'bg-gray-200'}`} />

                {/* Category Filters */}
                {categories.map((category) => {
                  const count = transactions.filter(t => t.category === category.value).length;
                  const total = transactions
                    .filter(t => t.category === category.value)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                  
                  return (
                    <DropdownMenuItem 
                      key={category.value}
                      onClick={() => setSelectedFilter(category.value)}
                      className={`flex items-center gap-2 ${darkMode ? 'hover:bg-[#2d2e4a] text-[#e6e6fa]' : 'hover:bg-gray-50'}`}
                    >
                      <span className="text-lg">{category.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{category.label}</div>
                        <div className={`text-xs ${darkMode ? 'text-[#b3baff]' : 'text-gray-500'}`}>
                          ${total.toFixed(2)}
                        </div>
                      </div>
                      <Badge variant="secondary" className={`ml-auto ${darkMode ? 'bg-[#35365a] text-[#e6e6fa]' : 'bg-gray-100 text-gray-700'}`}>
                        {count}
                      </Badge>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {['all', 'top-spending', 'recently-added'].map((filter) => (
                <Badge
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedFilter === filter 
                      ? 'bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e]' 
                      : darkMode 
                        ? 'border-[#35365a] text-[#e6e6fa] hover:bg-[#2d2e4a]' 
                        : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFilter(filter as FilterType)}
                >
                  {filter === 'all' && <Filter className="w-3 h-3 mr-1" />}
                  {filter === 'top-spending' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {filter === 'recently-added' && <Clock className="w-3 h-3 mr-1" />}
                  {filter === 'all' && 'All'}
                  {filter === 'top-spending' && 'Top'}
                  {filter === 'recently-added' && 'Recent'}
                </Badge>
              ))}
            </div>

            {/* Clear Filter Button */}
            {selectedFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFilter('all')}
                className={`${darkMode ? 'text-[#b3baff] hover:bg-[#2d2e4a]' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter Summary */}
          {selectedFilter !== 'all' && (
            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-[#35365a]' : 'border-gray-200'}`}>
              <div className={`text-sm ${darkMode ? 'text-[#b3baff]' : 'text-gray-600'}`}>
                Showing {currentFilter.count} of {transactions.length} transactions
                {selectedFilter !== 'all' && selectedFilter !== 'top-spending' && selectedFilter !== 'recently-added' && (
                  <span className="ml-2">
                    • Total: ${transactions
                      .filter(t => t.category === selectedFilter)
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                      .toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 