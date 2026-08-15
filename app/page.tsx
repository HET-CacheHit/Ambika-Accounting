'use client';

import React, { useState, useEffect } from 'react';
import { 
  getStoredExpenses, 
  saveExpenses, 
  getStoredSettings, 
  saveSettings, 
  getStoredAuth, 
  saveAuth,
  getCurrentUserKey,
  normalizeUserKey
} from '../lib/storage';
import { Expense, AccountSettings } from '../lib/types';
import { generateExpenseWordDocument } from '../lib/docxGenerator';
import { 
  isSupabaseConfigured,
  fetchSupabaseExpenses, 
  insertSupabaseExpense, 
  deleteSupabaseExpense,
  fetchSupabaseSettings,
  saveSupabaseSettings
} from '../lib/supabaseService';

import { LoginPage } from '../components/LoginPage';
import { Navbar } from '../components/Navbar';
import { MovingHeadlineTicker } from '../components/MovingHeadlineTicker';
import { ExpenseSummary } from '../components/ExpenseSummary';
import { ExpenseList } from '../components/ExpenseList';
import { CategoryAnalytics } from '../components/CategoryAnalytics';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { BudgetModal } from '../components/BudgetModal';
import { ReceiptViewerModal } from '../components/ReceiptViewerModal';
import { GhostWarningModal } from '../components/GhostWarningModal';

export default function AmbikaAccountingApp() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AccountSettings>(getStoredSettings());

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<Expense | null>(null);

  // Word Export state
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize data on client load & sync with Supabase if configured
  useEffect(() => {
    const isAuth = getStoredAuth();
    const activeKey = getCurrentUserKey();

    setIsAuthenticated(isAuth);
    setCurrentUserKey(activeKey);

    if (isAuth && activeKey) {
      const userExpenses = getStoredExpenses(activeKey);
      const userSettings = getStoredSettings(activeKey);
      setExpenses(userExpenses);
      setSettings(userSettings);

      // If Supabase is connected, sync remote cloud data for this specific user
      if (isSupabaseConfigured) {
        fetchSupabaseExpenses(activeKey).then((cloudExpenses) => {
          if (cloudExpenses && cloudExpenses.length > 0) {
            setExpenses(cloudExpenses);
            saveExpenses(cloudExpenses, activeKey);
          } else if (userExpenses.length > 0) {
            userExpenses.forEach((exp) => insertSupabaseExpense(exp, activeKey));
          }
        });

        fetchSupabaseSettings(activeKey).then((cloudSettings) => {
          if (cloudSettings) {
            setSettings(cloudSettings);
            saveSettings(cloudSettings, activeKey);
          } else {
            saveSupabaseSettings(userSettings, activeKey);
          }
        });
      }
    }

    setIsLoaded(true);
  }, []);

  // Sync expenses strictly for the logged-in user
  const updateExpenses = (newExpenses: Expense[]) => {
    const userKey = currentUserKey || settings.userName || 'default_user';
    setExpenses(newExpenses);
    saveExpenses(newExpenses, userKey);
  };

  // Sync settings strictly for the logged-in user
  const updateSettings = (newSettings: AccountSettings) => {
    const userKey = currentUserKey || settings.userName || 'default_user';
    setSettings(newSettings);
    saveSettings(newSettings, userKey);

    if (isSupabaseConfigured) {
      saveSupabaseSettings(newSettings, userKey);
    }

    showToast('Profile & Account Balance updated successfully!');
  };

  const handleLoginSuccess = async (userName: string, customInitialBalance?: number, userEmail?: string) => {
    const userKey = normalizeUserKey(userEmail || userName);
    saveAuth(true, userKey);
    setCurrentUserKey(userKey);
    setIsAuthenticated(true);

    const userSettings = getStoredSettings(userKey, userName, customInitialBalance);
    const userExpenses = getStoredExpenses(userKey);

    setSettings(userSettings);
    setExpenses(userExpenses);

    // Sync cloud data for logged in user
    if (isSupabaseConfigured) {
      const cloudExpenses = await fetchSupabaseExpenses(userKey);
      if (cloudExpenses && cloudExpenses.length > 0) {
        setExpenses(cloudExpenses);
        saveExpenses(cloudExpenses, userKey);
      }

      const cloudSettings = await fetchSupabaseSettings(userKey);
      if (cloudSettings) {
        setSettings(cloudSettings);
        saveSettings(cloudSettings, userKey);
      }

      showToast(`Welcome back, ${userName}! Connected to your private account.`);
    } else {
      showToast(`Logged into account: ${userName}`);
    }
  };

  const handleLogout = () => {
    saveAuth(false);
    setCurrentUserKey(null);
    setIsAuthenticated(false);
    setExpenses([]);
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'> & { id?: string }) => {
    const userKey = currentUserKey || settings.userName || 'default_user';

    if (expenseData.id) {
      // Editing existing expense
      const updated = expenses.map(e => e.id === expenseData.id ? {
        ...e,
        ...expenseData,
      } as Expense : e);
      updateExpenses(updated);

      const targetExpense = updated.find(e => e.id === expenseData.id);
      if (targetExpense && isSupabaseConfigured) {
        insertSupabaseExpense(targetExpense, userKey);
      }

      showToast(`Updated expense: "${expenseData.title}"`);
    } else {
      // Adding new expense
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}`,
        createdAt: Date.now(),
      };
      updateExpenses([newExpense, ...expenses]);

      if (isSupabaseConfigured) {
        insertSupabaseExpense(newExpense, userKey);
      }

      showToast(`Added new expense: "${expenseData.title}" (-${settings.currencySymbol}${expenseData.amount})`);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const userKey = currentUserKey || settings.userName || 'default_user';
    const target = expenses.find(e => e.id === id);
    if (confirm(`Are you sure you want to delete "${target?.title || 'this expense'}"?`)) {
      const updated = expenses.filter(e => e.id !== id);
      updateExpenses(updated);

      if (isSupabaseConfigured) {
        deleteSupabaseExpense(id);
      }

      showToast('Expense entry deleted.');
    }
  };

  // Automated Word Document (.docx) Export with Bill Screenshots
  const handleExportDocx = async () => {
    if (expenses.length === 0) {
      alert('No expenses found in this account to export.');
      return;
    }

    try {
      setIsExportingDocx(true);
      showToast('Generating automated Word document with bill screenshots...');

      const blob = await generateExpenseWordDocument(expenses, settings, `${settings.userName} Ledger Statement`);
      
      const fileName = `Ambika_${settings.userName.replace(/\s+/g, '_')}_Statement_${new Date().toISOString().split('T')[0]}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Successfully generated ${fileName}! Download started.`);
    } catch (error) {
      console.error('Error exporting Word document:', error);
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)'
      }}>
        Loading Ambika Accounting...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 200,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--accent-blue)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.875rem',
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header Navbar */}
      <Navbar
        settings={settings}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onExportDocx={handleExportDocx}
        onLogout={handleLogout}
        isExportingDocx={isExportingDocx}
      />

      {/* App Body Content */}
      <main className="main-content">
        {/* Moving Headline Ticker Tape */}
        <MovingHeadlineTicker expenses={expenses} settings={settings} />

        {/* Top Summary Cards (Initial Balance, Automated Expenses, Automated Remaining Balance, Receipts Count) */}
        <ExpenseSummary
          expenses={expenses}
          settings={settings}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Dashboard Grid (Main Expense List + Sidebar Analytics) */}
        <div className="dashboard-grid">
          {/* Main Column */}
          <ExpenseList
            expenses={expenses}
            currencySymbol={settings.currencySymbol}
            onEdit={(expense) => {
              setEditingExpense(expense);
              setIsExpenseModalOpen(true);
            }}
            onDelete={handleDeleteExpense}
            onViewReceipt={(expense) => setViewingReceiptExpense(expense)}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
          />

          {/* Right Sidebar Column */}
          <CategoryAnalytics
            expenses={expenses}
            currencySymbol={settings.currencySymbol}
            onExportDocx={handleExportDocx}
            isExportingDocx={isExportingDocx}
          />
        </div>
      </main>

      {/* Add / Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleAddExpense}
        editingExpense={editingExpense}
        currencySymbol={settings.currencySymbol}
      />

      {/* Profile & Account Balance Settings Modal */}
      <BudgetModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        expenses={expenses}
        onSave={updateSettings}
      />

      {/* Receipt Bill Screenshot Viewer Modal */}
      <ReceiptViewerModal
        expense={viewingReceiptExpense}
        onClose={() => setViewingReceiptExpense(null)}
        currencySymbol={settings.currencySymbol}
      />

      {/* Ghost Budget Critical Warning Modal (Triggers at 90% total balance spent) */}
      <GhostWarningModal
        expenses={expenses}
        settings={settings}
      />
    </div>
  );
}
