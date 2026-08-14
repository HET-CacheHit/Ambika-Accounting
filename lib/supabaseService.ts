import { supabase, isSupabaseConfigured } from './supabaseClient';
export { isSupabaseConfigured };
import { Expense, AccountSettings } from './types';
import { UserAccount } from './storage';

export interface DbExpenseRow {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  payment_method: string;
  notes?: string;
  receipt_image?: string;
  receipt_file_name?: string;
  created_at: number;
}

export async function fetchSupabaseExpenses(userId: string): Promise<Expense[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch expenses error:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: DbExpenseRow) => ({
      id: row.id,
      title: row.title,
      amount: Number(row.amount),
      date: row.date,
      category: row.category as any,
      paymentMethod: row.payment_method as any,
      notes: row.notes || undefined,
      receiptImage: row.receipt_image || undefined,
      receiptFileName: row.receipt_file_name || undefined,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Error fetching expenses from Supabase:', err);
    return null;
  }
}

export async function insertSupabaseExpense(expense: Expense, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const row: DbExpenseRow = {
      id: expense.id,
      user_id: userId,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      payment_method: expense.paymentMethod,
      notes: expense.notes || undefined,
      receipt_image: expense.receiptImage || undefined,
      receipt_file_name: expense.receiptFileName || undefined,
      created_at: expense.createdAt,
    };

    const { error } = await supabase.from('expenses').upsert(row);
    if (error) {
      console.warn('Supabase insert expense error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error inserting expense into Supabase:', err);
    return false;
  }
}

export async function deleteSupabaseExpense(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.warn('Supabase delete expense error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting expense from Supabase:', err);
    return false;
  }
}

export async function fetchSupabaseSettings(userId: string): Promise<AccountSettings | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('account_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      initialBalance: Number(data.initial_balance),
      monthlyBudget: Number(data.monthly_budget),
      currencySymbol: data.currency_symbol || '₹',
      userName: data.user_name || userId,
      accountName: data.account_name || 'Ambika Personal Account',
    };
  } catch (err) {
    console.error('Error fetching settings from Supabase:', err);
    return null;
  }
}

export async function saveSupabaseSettings(settings: AccountSettings, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('account_settings').upsert({
      user_id: userId,
      user_name: settings.userName,
      account_name: settings.accountName,
      initial_balance: settings.initialBalance,
      monthly_budget: settings.monthlyBudget,
      currency_symbol: settings.currencySymbol,
    });

    if (error) {
      console.warn('Supabase save settings error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving settings to Supabase:', err);
    return false;
  }
}

export async function syncSupabaseUser(user: UserAccount): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('user_accounts').upsert({
      name: user.name,
      email: user.email,
      passcode: user.passcode,
      initial_balance: user.initialBalance,
    });

    if (error) {
      console.warn('Supabase sync user error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error syncing user to Supabase:', err);
    return false;
  }
}
