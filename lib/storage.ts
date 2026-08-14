import { Expense, AccountSettings } from './types';

export interface UserAccount {
  name: string;
  email: string;
  passcode: string;
  initialBalance: number;
}

export const DEFAULT_SETTINGS: AccountSettings = {
  initialBalance: 150000,
  monthlyBudget: 50000,
  currencySymbol: '₹',
  userName: 'Aryan Shah',
  accountName: 'Ambika Personal Account',
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-101',
    title: 'Office Stationary & Printing Paper',
    amount: 1450,
    category: 'Business Expenses',
    paymentMethod: 'UPI / GPay / PhonePe',
    date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    notes: 'Bought A4 rim paper bundle and file binders for Ambika Accounting physical logs.',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'exp-102',
    title: 'Monthly Broadband Fiber Internet',
    amount: 999,
    category: 'Bills & Utilities',
    paymentMethod: 'Credit Card',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    notes: 'Airtel Xstream Fiber bill payment.',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'exp-103',
    title: 'Grocery Store Supermarket Bill',
    amount: 4320,
    category: 'Groceries',
    paymentMethod: 'UPI / GPay / PhonePe',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    notes: 'Monthly pulses, dry fruits, organic oil and home provisions.',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'exp-104',
    title: 'Vehicle Fuel Fill (Petrol)',
    amount: 2500,
    category: 'Transport & Fuel',
    paymentMethod: 'Debit Card',
    date: new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0],
    notes: 'Full tank at HP Petrol Pump.',
    createdAt: Date.now() - 86400000 * 8,
  },
  {
    id: 'exp-105',
    title: 'Electricity & Power Utilities',
    amount: 3850,
    category: 'Bills & Utilities',
    paymentMethod: 'Net Banking',
    date: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0],
    notes: 'Torrent Power monthly electricity statement.',
    createdAt: Date.now() - 86400000 * 12,
  }
];

const STORAGE_KEYS = {
  EXPENSES: 'ambika_accounting_expenses',
  SETTINGS: 'ambika_accounting_settings',
  AUTH: 'ambika_accounting_auth',
  USERS: 'ambika_accounting_users',
};

export function getStoredExpenses(): Expense[] {
  if (typeof window === 'undefined') return INITIAL_EXPENSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load expenses from localStorage', e);
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses to localStorage', e);
  }
}

export function getStoredSettings(): AccountSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AccountSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUserAccount(user: UserAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const users = getStoredUsers();
    const existingIdx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx >= 0) {
      users[existingIdx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save user account', e);
  }
}

export function getStoredAuth(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

export function saveAuth(isAuthenticated: boolean): void {
  if (typeof window === 'undefined') return;
  if (isAuthenticated) {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
}
