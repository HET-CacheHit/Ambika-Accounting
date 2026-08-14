'use client';

import React from 'react';
import { Wallet, TrendingDown, PiggyBank, Building2 } from 'lucide-react';
import { Expense, AccountSettings } from '../lib/types';

interface MovingHeadlineTickerProps {
  expenses: Expense[];
  settings: AccountSettings;
}

export const MovingHeadlineTicker: React.FC<MovingHeadlineTickerProps> = ({
  expenses,
  settings,
}) => {
  const currency = settings.currencySymbol || '₹';
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = settings.initialBalance - totalExpense;

  const headlineItems = [
    {
      icon: <TrendingDown size={17} color="#f87171" />,
      label: 'TOTAL EXPENSE',
      value: `${currency}${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      color: '#f87171',
    },
    {
      icon: <Wallet size={17} color="#60a5fa" />,
      label: 'TOTAL BALANCE',
      value: `${currency}${settings.initialBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      color: '#60a5fa',
    },
    {
      icon: <PiggyBank size={17} color={remainingBalance >= 0 ? '#34d399' : '#f87171'} />,
      label: 'REMAINING BALANCE',
      value: `${currency}${remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      color: remainingBalance >= 0 ? '#34d399' : '#f87171',
    },
    {
      icon: <Building2 size={17} color="#a78bfa" />,
      label: 'AMBIKA ACCOUNTING SERVICE',
      value: 'Personal Financial System',
      color: '#a78bfa',
    },
  ];

  return (
    <div className="ticker-wrapper">
      <div className="ticker-badge">
        <span className="live-dot" />
        <span>HEADLINE</span>
      </div>
      <div className="ticker-content">
        <div className="ticker-track">
          {[...headlineItems, ...headlineItems, ...headlineItems, ...headlineItems].map((item, idx) => (
            <div key={idx} className="ticker-item">
              <span className="ticker-icon">{item.icon}</span>
              <span className="ticker-label">{item.label}:</span>
              <span className="ticker-value" style={{ color: item.color }}>
                {item.value}
              </span>
              <span className="ticker-divider">&bull;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
