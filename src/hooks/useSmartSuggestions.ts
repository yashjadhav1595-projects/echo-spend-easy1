
import { useState, useEffect, useMemo } from 'react';

export const useSmartSuggestions = (input: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load suggestions from localStorage
  const savedSuggestions = useMemo(() => {
    const saved = localStorage.getItem('transaction-suggestions');
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    const filtered = savedSuggestions
      .filter((suggestion: string) => 
        suggestion.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 suggestions

    setSuggestions(filtered);
  }, [input, savedSuggestions]);

  // Function to save a new suggestion
  const saveSuggestion = (description: string) => {
    if (!description.trim()) return;
    
    const existing = savedSuggestions.includes(description);
    if (!existing) {
      const updated = [...savedSuggestions, description].slice(-50); // Keep last 50
      localStorage.setItem('transaction-suggestions', JSON.stringify(updated));
    }
  };

  return { suggestions, saveSuggestion };
};
