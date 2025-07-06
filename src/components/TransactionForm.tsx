import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, CATEGORIES as DEFAULT_CATEGORIES } from '@/types/Transaction';
import { CategoryManager } from './CategoryManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSmartSuggestions } from '@/hooks/useSmartSuggestions';
import { parseNaturalInput } from '@/utils/parseNaturalInput';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit: () => void;
  categories?: { value: string; label: string; emoji: string; color: string }[];
  setCategories?: (cats: { value: string; label: string; emoji: string; color: string }[]) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  editingTransaction,
  onCancelEdit,
  categories: categoriesProp,
  setCategories: setCategoriesProp,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [naturalInput, setNaturalInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = React.useState(categoriesProp || DEFAULT_CATEGORIES);
  React.useEffect(() => {
    if (categoriesProp) setCategories(categoriesProp);
  }, [categoriesProp]);
  React.useEffect(() => {
    if (setCategoriesProp) setCategoriesProp(categories);
    // eslint-disable-next-line
  }, [categories]);
  const { toast } = useToast();

  const { suggestions, saveSuggestion } = useSmartSuggestions(description);

  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || '');
      setNaturalInput('');
    }
  }, [editingTransaction]);

  const handleNaturalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setNaturalInput(input);

    const parsed = parseNaturalInput(input, categories);
    if (parsed) {
      if (parsed.amount) setAmount(parsed.amount.toString());
      if (parsed.description) setDescription(parsed.description);
      if (parsed.date) setDate(parsed.date);
      if (parsed.time) setTime(parsed.time);
      if (parsed.category) setCategory(parsed.category);
      toast({
        title: "Smart parsing detected!",
        description: "Form fields have been auto-filled",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const transaction = {
      amount: parseFloat(amount),
      description,
      category,
      date,
      time,
      createdAt: new Date().toISOString(),
    };

    onSubmit(transaction);
    
    // Save suggestion for future use
    saveSuggestion(description);
    
    if (!editingTransaction) {
      // Reset form for new transactions
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setNaturalInput('');
      
      toast({
        title: "Transaction added",
        description: "Your transaction has been recorded successfully",
      });
    } else {
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully",
      });
    }
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setNaturalInput('');
    onCancelEdit();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDescription(suggestion);
    setShowSuggestions(false);
  };

  return (
    <Card className="backdrop-blur-sm bg-[#23243a] border border-[#35365a] text-white shadow-xl rounded-xl p-6" id="transaction-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-[#b3baff]">
          {editingTransaction ? '✏️ Edit Transaction' : '➕ Add Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Natural Language Input */}
          <div>
            <Label htmlFor="natural-input" className="text-[#b3baff]">Quick Add (natural language for any field)</Label>
            <Input
              id="natural-input"
              type="text"
              placeholder="e.g. spent 50 on groceries yesterday at 18:30 for food"
              value={naturalInput}
              onChange={handleNaturalInputChange}
              className="mt-1 bg-[#181b2e] border-[#35365a] text-white placeholder:text-[#b3baff]"
            />
            <div className="text-xs mt-1 text-[#b3baff]">Try: "spent 50 on groceries yesterday at 18:30 for food" or "add 100 for shopping today at 14:00"</div>
          </div>
          <div>
            <Label htmlFor="amount" className="text-[#b3baff]">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`mt-1 bg-[#181b2e] border-[#35365a] text-white placeholder:text-[#b3baff] ${amount && parseFloat(amount) > 0 ? 'border-green-300' : ''}`}
            />
          </div>
          <div className="relative">
            <Label htmlFor="description" className="text-[#b3baff]">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setShowSuggestions(e.target.value.length >= 2);
              }}
              onFocus={() => setShowSuggestions(description.length >= 2)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={`mt-1 bg-[#181b2e] border-[#35365a] text-white placeholder:text-[#b3baff] ${description.trim() ? 'border-green-300' : ''}`}
            />
            {/* Smart Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#23243a] border-[#35365a] text-white rounded-md shadow-lg max-h-32 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-[#2d2e4a]"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-2 flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="px-2 py-1 rounded-md font-semibold bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e] shadow focus:outline-none focus:ring-2 focus:ring-[#4de3c1] text-sm"
                  style={{ minWidth: 90 }}
                  aria-label="Manage Categories"
                >
                  🗂️
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full bg-[#23243a] border border-[#35365a] rounded-2xl shadow-2xl p-6 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#b3baff] mb-2 flex items-center gap-2">🗂️ Manage Categories</DialogTitle>
                </DialogHeader>
                <CategoryManager categories={categories} setCategories={setCategories} />
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <Label htmlFor="category" className="text-[#b3baff]">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={`mt-1 bg-[#181b2e] border-[#35365a] text-white ${category ? 'border-green-300' : ''}`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-[#23243a] border-[#35365a] text-white shadow-lg">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="date" className="text-[#b3baff]">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`mt-1 bg-[#181b2e] border-[#35365a] text-white placeholder:text-[#b3baff] ${date ? 'border-green-300' : ''}`}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="time" className="text-[#b3baff]">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`mt-1 bg-[#181b2e] border-[#35365a] text-white placeholder:text-[#b3baff] ${time ? 'border-green-300' : ''}`}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-[#4de3c1] text-[#181b2e] hover:bg-[#38bfa1]">
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </Button>
            {editingTransaction && (
              <Button type="button" variant="outline" onClick={handleCancel} className="border-[#4de3c1] text-[#4de3c1] hover:bg-[#23243a]/60">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
