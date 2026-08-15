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

const STORAGE_KEYS = {
  CURRENT_USER: 'ambika_current_user_key',
  AUTH: 'ambika_accounting_auth',
  USERS: 'ambika_accounting_users',
  EXPENSES_PREFIX: 'ambika_expenses_',
  SETTINGS_PREFIX: 'ambika_settings_',
};

/**
 * Normalizes a user identifier (email or name) into a safe storage key.
 */
export function normalizeUserKey(identifier?: string): string {
  if (!identifier) return 'default_user';
  return identifier.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
}

/**
 * Gets the current logged in user's key.
 */
export function getCurrentUserKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Sets or clears the current logged in user's key.
 */
export function saveCurrentUserKey(userKey: string | null): void {
  if (typeof window === 'undefined') return;
  if (userKey) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, normalizeUserKey(userKey));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

/**
 * Returns expenses strictly isolated for the specified user account.
 */
export function getStoredExpenses(userKey?: string): Expense[] {
  if (typeof window === 'undefined') return [];
  const key = normalizeUserKey(userKey || getCurrentUserKey() || 'default_user');
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.EXPENSES_PREFIX}${key}`);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load expenses for user ' + key, e);
    return [];
  }
}

/**
 * Saves expenses strictly isolated for the specified user account.
 */
export function saveExpenses(expenses: Expense[], userKey?: string): void {
  if (typeof window === 'undefined') return;
  const key = normalizeUserKey(userKey || getCurrentUserKey() || 'default_user');
  try {
    localStorage.setItem(`${STORAGE_KEYS.EXPENSES_PREFIX}${key}`, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses for user ' + key, e);
  }
}

/**
 * Returns account settings strictly isolated for the specified user account.
 */
export function getStoredSettings(userKey?: string, defaultName?: string, defaultBalance?: number): AccountSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const key = normalizeUserKey(userKey || getCurrentUserKey() || 'default_user');
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${key}`);
    if (!raw) {
      const initial: AccountSettings = {
        ...DEFAULT_SETTINGS,
        userName: defaultName || (userKey ? userKey.split('@')[0] : DEFAULT_SETTINGS.userName),
        initialBalance: defaultBalance !== undefined ? defaultBalance : DEFAULT_SETTINGS.initialBalance,
        accountName: `${defaultName || 'Ambika'} Personal Account`,
      };
      localStorage.setItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load settings for user ' + key, e);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves account settings strictly isolated for the specified user account.
 */
export function saveSettings(settings: AccountSettings, userKey?: string): void {
  if (typeof window === 'undefined') return;
  const key = normalizeUserKey(userKey || getCurrentUserKey() || settings.userName || 'default_user');
  try {
    localStorage.setItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${key}`, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings for user ' + key, e);
  }
}

/**
 * List of registered users on the device.
 */
export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Saves a registered user account.
 */
export function saveUserAccount(user: UserAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const users = getStoredUsers();
    const existingIdx = users.findIndex(
      u => u.email.toLowerCase() === user.email.toLowerCase() ||
           u.name.toLowerCase() === user.name.toLowerCase()
    );
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
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true' && Boolean(getCurrentUserKey());
}

export function saveAuth(isAuthenticated: boolean, userKey?: string): void {
  if (typeof window === 'undefined') return;
  if (isAuthenticated) {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    if (userKey) {
      saveCurrentUserKey(userKey);
    }
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    saveCurrentUserKey(null);
  }
}
