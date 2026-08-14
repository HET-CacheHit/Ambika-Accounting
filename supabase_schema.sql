-- ==============================================================================
-- AMBIKA ACCOUNTING - SUPABASE DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    category TEXT DEFAULT 'Other',
    payment_method TEXT DEFAULT 'Cash',
    notes TEXT,
    receipt_image TEXT,
    receipt_file_name TEXT,
    created_at BIGINT NOT NULL
);

-- Index for fast querying by user and date
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (date);

-- 2. Create account_settings table
CREATE TABLE IF NOT EXISTS public.account_settings (
    user_id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    account_name TEXT DEFAULT 'Ambika Personal Account',
    initial_balance NUMERIC DEFAULT 150000,
    monthly_budget NUMERIC DEFAULT 50000,
    currency_symbol TEXT DEFAULT '₹',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create user_accounts table
CREATE TABLE IF NOT EXISTS public.user_accounts (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    passcode TEXT NOT NULL,
    initial_balance NUMERIC DEFAULT 150000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

-- 5. Open access policies for simple client integration
CREATE POLICY "Allow public read-write for expenses" ON public.expenses
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read-write for account_settings" ON public.account_settings
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read-write for user_accounts" ON public.user_accounts
    FOR ALL USING (true) WITH CHECK (true);
