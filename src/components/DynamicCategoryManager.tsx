import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/Transaction';

interface Category {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

interface DynamicCategoryManagerProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  transactions: Transaction[];
  darkMode?: boolean;
}

// Popular emojis for categories
const POPULAR_EMOJIS = [
  '🍔', '🚗', '🛍️', '🎬', '💊', '⚡', '📚', '✈️', '📦', '🏠', '🎮', '🏋️', 
  '🍕', '☕', '🍺', '🎵', '📱', '💻', '🎨', '🏃', '🧘', '💄', '👕', '👟',
  '🎁', '💍', '💎', '🏦', '📊', '🎯', '⭐', '🔥', '💡', '🎪', '🎭', '🎨'
];

export const DynamicCategoryManager: React.FC<DynamicCategoryManagerProps> = ({
  categories,
  setCategories,
  transactions,
  darkMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    value: '',
    label: '',
    emoji: '📦',
    color: 'bg-gray-100 text-gray-800'
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Generate color classes for categories
  const colorOptions = [
    { name: 'Red', class: 'bg-red-100 text-red-800' },
    { name: 'Blue', class: 'bg-blue-100 text-blue-800' },
    { name: 'Green', class: 'bg-green-100 text-green-800' },
    { name: 'Purple', class: 'bg-purple-100 text-purple-800' },
    { name: 'Pink', class: 'bg-pink-100 text-pink-800' },
    { name: 'Yellow', class: 'bg-yellow-100 text-yellow-800' },
    { name: 'Indigo', class: 'bg-indigo-100 text-indigo-800' },
    { name: 'Teal', class: 'bg-teal-100 text-teal-800' },
    { name: 'Orange', class: 'bg-orange-100 text-orange-800' },
    { name: 'Gray', class: 'bg-gray-100 text-gray-800' }
  ];

  const handleAddCategory = () => {
    if (!newCategory.value || !newCategory.label) return;

    // Check if category already exists
    if (categories.find(c => c.value === newCategory.value)) {
      alert('Category already exists!');
      return;
    }

    const category: Category = {
      value: newCategory.value.toLowerCase().replace(/\s+/g, '-'),
      label: newCategory.label,
      emoji: newCategory.emoji || '📦',
      color: newCategory.color || 'bg-gray-100 text-gray-800'
    };

    setCategories([...categories, category]);
    setNewCategory({ value: '', label: '', emoji: '📦', color: 'bg-gray-100 text-gray-800' });
  };

  const handleEditCategory = () => {
    if (!editingCategory || !editingCategory.value || !editingCategory.label) return;

    const updatedCategories = categories.map(cat => 
      cat.value === editingCategory.value ? editingCategory : cat
    );

    setCategories(updatedCategories);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryValue: string) => {
    // Check if category is being used
    const usageCount = transactions.filter(t => t.category === categoryValue).length;
    
    if (usageCount > 0) {
      alert(`Cannot delete category. It's being used by ${usageCount} transaction(s).`);
      return;
    }

    const updatedCategories = categories.filter(cat => cat.value !== categoryValue);
    setCategories(updatedCategories);
  };

  const getCategoryUsage = (categoryValue: string) => {
    return transactions.filter(t => t.category === categoryValue).length;
  };

  const getCategoryTotal = (categoryValue: string) => {
    return transactions
      .filter(t => t.category === categoryValue)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`flex items-center gap-2 ${darkMode ? 'border-[#35365a] text-[#e6e6fa] hover:bg-[#2d2e4a]' : 'border-gray-200 hover:bg-gray-50'}`}
        >
          <Settings className="w-4 h-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-2xl max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-[#23243a] border-[#35365a] text-[#e6e6fa]' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Category Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Category */}
          <Card className={darkMode ? 'bg-[#2d2e4a] border-[#35365a]' : 'bg-gray-50'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5" />
                Add New Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    placeholder="e.g., Coffee, Gym, Movies"
                    value={newCategory.label || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                    className={darkMode ? 'bg-[#181b2e] border-[#35365a] text-[#e6e6fa]' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-value">Slug (auto-generated)</Label>
                  <Input
                    id="category-value"
                    placeholder="e.g., coffee, gym, movies"
                    value={newCategory.value || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })}
                    className={darkMode ? 'bg-[#181b2e] border-[#35365a] text-[#e6e6fa]' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emoji</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`w-12 h-10 text-xl ${darkMode ? 'border-[#35365a] text-[#e6e6fa]' : ''}`}
                    >
                      {newCategory.emoji}
                    </Button>
                    <Input
                      placeholder="Or type emoji"
                      value={newCategory.emoji || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, emoji: e.target.value })}
                      className={darkMode ? 'bg-[#181b2e] border-[#35365a] text-[#e6e6fa]' : ''}
                    />
                  </div>
                  {showEmojiPicker && (
                    <div className="grid grid-cols-8 gap-1 p-2 border rounded-md max-h-32 overflow-y-auto">
                      {POPULAR_EMOJIS.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setNewCategory({ ...newCategory, emoji });
                            setShowEmojiPicker(false);
                          }}
                          className="w-8 h-8 text-lg hover:bg-gray-100 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setNewCategory({ ...newCategory, color: color.class })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategory.color === color.class 
                            ? 'border-blue-500' 
                            : darkMode ? 'border-[#35365a]' : 'border-gray-300'
                        } ${color.class}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAddCategory}
                disabled={!newCategory.value || !newCategory.label}
                className="w-full bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e] hover:from-[#3dd1af] hover:to-[#5b52ef]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Existing Categories</h3>
            <div className="grid gap-3">
              {categories.map((category) => (
                <Card key={category.value} className={darkMode ? 'bg-[#2d2e4a] border-[#35365a]' : 'bg-white'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.emoji}</span>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className={`text-sm ${darkMode ? 'text-[#b3baff]' : 'text-gray-500'}`}>
                            {getCategoryUsage(category.value)} transactions • ${getCategoryTotal(category.value).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={category.color}>
                          {category.value}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                          className={darkMode ? 'text-[#b3baff] hover:bg-[#35365a]' : 'text-gray-500 hover:bg-gray-50'}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={darkMode ? 'text-red-400 hover:bg-[#35365a]' : 'text-red-500 hover:bg-gray-50'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className={darkMode ? 'bg-[#23243a] border-[#35365a] text-[#e6e6fa]' : 'bg-white'}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.label}"? 
                                {getCategoryUsage(category.value) > 0 && (
                                  <span className="block mt-2 text-red-500">
                                    This category is used by {getCategoryUsage(category.value)} transaction(s).
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className={darkMode ? 'bg-[#2d2e4a] border-[#35365a] text-[#e6e6fa]' : ''}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCategory(category.value)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Category Dialog */}
        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent className={darkMode ? 'bg-[#23243a] border-[#35365a] text-[#e6e6fa]' : 'bg-white'}>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    value={editingCategory.label}
                    onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })}
                    className={darkMode ? 'bg-[#181b2e] border-[#35365a] text-[#e6e6fa]' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emoji</Label>
                  <Input
                    value={editingCategory.emoji}
                    onChange={(e) => setEditingCategory({ ...editingCategory, emoji: e.target.value })}
                    className={darkMode ? 'bg-[#181b2e] border-[#35365a] text-[#e6e6fa]' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setEditingCategory({ ...editingCategory, color: color.class })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          editingCategory.color === color.class 
                            ? 'border-blue-500' 
                            : darkMode ? 'border-[#35365a]' : 'border-gray-300'
                        } ${color.class}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleEditCategory}
                    className="flex-1 bg-gradient-to-r from-[#4de3c1] to-[#6c63ff] text-[#181b2e]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingCategory(null)}
                    className={darkMode ? 'border-[#35365a] text-[#e6e6fa]' : ''}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}; 