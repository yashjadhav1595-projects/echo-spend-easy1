export interface User {
  id?: string;
  email: string;
  name: string;
  preferences?: {
    currency: string;
    timezone: string;
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  preferences: {
    currency: string;
    timezone: string;
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  stats: {
    totalTransactions: number;
    totalBudget: number;
    totalSpent: number;
    joinDate: string;
  };
} 