export type ExpenseCategory = 
  | 'Food & Dining'
  | 'Bills & Utilities'
  | 'Groceries'
  | 'Housing & Rent'
  | 'Transport & Fuel'
  | 'Shopping'
  | 'Healthcare & Medical'
  | 'Entertainment'
  | 'Business Expenses'
  | 'Personal Care'
  | 'Education'
  | 'Other';

export type PaymentMethod = 
  | 'Cash'
  | 'UPI / GPay / PhonePe'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Net Banking';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  notes?: string;
  receiptImage?: string; // Base64 data URL
  receiptFileName?: string;
  createdAt: number;
}

export interface AccountSettings {
  initialBalance: number;
  monthlyBudget: number;
  currencySymbol: string;
  userName: string;
  accountName: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}
