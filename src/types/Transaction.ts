
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // format: YYYY-MM-DD
  time?: string; // format: HH:mm (24h)
  createdAt?: string;
}

export const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', emoji: '🍔', color: 'bg-red-100 text-red-800' },
  { value: 'transport', label: 'Transportation', emoji: '🚗', color: 'bg-blue-100 text-blue-800' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️', color: 'bg-purple-100 text-purple-800' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬', color: 'bg-green-100 text-green-800' },
  { value: 'health', label: 'Health & Fitness', emoji: '💊', color: 'bg-pink-100 text-pink-800' },
  { value: 'bills', label: 'Bills & Utilities', emoji: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'education', label: 'Education', emoji: '📚', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'travel', label: 'Travel', emoji: '✈️', color: 'bg-teal-100 text-teal-800' },
  { value: 'other', label: 'Other', emoji: '📦', color: 'bg-gray-100 text-gray-800' },
];
