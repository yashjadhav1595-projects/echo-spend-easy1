export interface Budget {
  id?: string;
  userId?: string;
  type: 'monthly' | 'yearly';
  period: string; // YYYY_MM for monthly, YYYY for yearly
  categoryBudgets: Record<string, number>;
  income?: number;
  goals?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  balance: number;
  categoryBreakdown: Record<string, {
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
} 