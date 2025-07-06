import React, { useState } from 'react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/types/Transaction';

interface Category {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

interface CategoryManagerProps {
  categories: Category[];
  setCategories: (cats: Category[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, setCategories }) => {
  const [label, setLabel] = useState('');
  const [emoji, setEmoji] = useState('');

  const handleAdd = () => {
    if (!label.trim() || !emoji.trim()) return;
    const value = label.toLowerCase().replace(/\s+/g, '-');
    // Prevent duplicate category values
    if (categories.some(cat => cat.value === value)) return;
    setCategories([...categories, { value, label, emoji, color: '' }]);
    setLabel('');
    setEmoji('');
  };

  const handleRemove = (value: string) => {
    setCategories(categories.filter(cat => cat.value !== value));
  };

  return (
    <div className="mb-4 p-2 rounded bg-[#23243a] border border-[#35365a]">
      <div className="font-semibold mb-2 text-[#b3baff]">Manage Categories</div>
      <div className="flex gap-2 mb-2">
        <input
          className="px-2 py-1 rounded bg-[#181b2e] border border-[#35365a] text-white w-32"
          placeholder="Label"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <input
          className="px-2 py-1 rounded bg-[#181b2e] border border-[#35365a] text-white w-16"
          placeholder="Emoji"
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
        />
        <button
          className="px-3 py-1 rounded bg-[#4de3c1] text-[#181b2e] font-bold hover:bg-[#38bfa1]"
          onClick={handleAdd}
          type="button"
        >Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, idx) => (
          <span
            key={cat.value}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#35365a] text-[#b3baff] font-medium shadow-sm mb-2"
            style={{ minWidth: 150 }}
          >
            <span className="text-xl">{cat.emoji}</span>
            <span className="truncate max-w-[90px]">{cat.label}</span>
            <button
              className="ml-2 text-[#ff79c6] hover:text-white text-lg font-bold px-1 rounded transition-colors"
              onClick={() => handleRemove(cat.value)}
              type="button"
              aria-label={`Remove ${cat.label}`}
            >×</button>
          </span>
        ))}
      </div>
    </div>
  );
};
