'use client';

import React from 'react';
import { Wallet, TrendingDown, PiggyBank, Receipt, Edit3, Ghost } from 'lucide-react';
import { Expense, AccountSettings } from '../lib/types';

interface ExpenseSummaryProps {
  expenses: Expense[];
  settings: AccountSettings;
  onOpenSettings: () => void;
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  expenses,
  settings,
  onOpenSettings,
}) => {
  const currency = settings.currencySymbol || '₹';
  
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = settings.initialBalance - totalExpense;
  const receiptsCount = expenses.filter(e => e.receiptImage).length;
  
  const spentPercentage = settings.initialBalance > 0 
    ? Math.min(100, Math.round((totalExpense / settings.initialBalance) * 100))
    : 0;

  const isCriticalAlarm = spentPercentage >= 90 && settings.initialBalance > 0;

  return (
    <div className="summary-grid animate-fade-in">
      {/* Starting / Total Income Card */}
      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">Initial Balance / Income</span>
          <div className="card-icon-badge icon-blue">
            <Wallet size={20} />
          </div>
        </div>
        <div className="card-value blue">
          {currency}{settings.initialBalance.toLocaleString('en-IN')}
        </div>
        <div className="card-subtext" style={{ justifyContent: 'space-between' }}>
          <span>Available Opening Fund</span>
          <button 
            onClick={onOpenSettings} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-blue)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <Edit3 size={13} /> Edit
          </button>
        </div>
      </div>

      {/* Automated Total Expenses Card */}
      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">Automated Total Expenses</span>
          <div className="card-icon-badge icon-rose">
            <TrendingDown size={20} />
          </div>
        </div>
        <div className="card-value rose">
          {currency}{totalExpense.toLocaleString('en-IN')}
        </div>
        <div className="card-subtext">
          <span>{expenses.length} transaction entries logged</span>
        </div>
      </div>

      {/* Automated Remaining Balance Card */}
      <div className="summary-card" style={{
        borderColor: isCriticalAlarm 
          ? 'rgba(244, 63, 94, 0.7)' 
          : (remainingBalance < 0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.3)'),
        boxShadow: isCriticalAlarm ? '0 0 25px rgba(244, 63, 94, 0.3)' : undefined
      }}>
        <div className="card-header">
          <span className="card-title">Automated Remaining Balance</span>
          <div className={`card-icon-badge ${remainingBalance >= 0 && !isCriticalAlarm ? 'icon-emerald' : 'icon-rose'}`}>
            {isCriticalAlarm ? <Ghost size={20} color="#f87171" /> : <PiggyBank size={20} />}
          </div>
        </div>
        <div className={`card-value ${remainingBalance >= 0 && !isCriticalAlarm ? 'emerald' : 'rose'}`}>
          {currency}{remainingBalance.toLocaleString('en-IN')}
        </div>
        <div className="card-subtext">
          <span style={{ color: remainingBalance < 0 || isCriticalAlarm ? '#f87171' : '#34d399', fontWeight: 700 }}>
            {spentPercentage}% of income spent
          </span>
          <span>
            &bull; {isCriticalAlarm ? '👻 CRITICAL GHOST ALARM!' : (remainingBalance >= 0 ? 'Sufficient Surplus' : 'Over budget!')}
          </span>
        </div>
      </div>

      {/* Receipts Attached Card */}
      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">Bill Proof Screenshots</span>
          <div className="card-icon-badge icon-purple">
            <Receipt size={20} />
          </div>
        </div>
        <div className="card-value" style={{ color: '#a78bfa' }}>
          {receiptsCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {expenses.length}</span>
        </div>
        <div className="card-subtext">
          <span>Bills ready for Automated Word Export</span>
        </div>
      </div>
    </div>
  );
};
