export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string; // ISO Date string
  description: string;
  merchant: string;
  type: TransactionType;
}

export interface FinancialInsight {
  summary: string;
  savingsTip: string;
  spendingTrend: 'UP' | 'DOWN' | 'STABLE';
  healthScore: number; // 0-100
}

export interface ViewState {
  currentView: 'dashboard' | 'capture' | 'insights' | 'premium';
}