'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Wallet, User, Mail, Building2, TrendingDown, PiggyBank, Receipt, ShieldCheck } from 'lucide-react';
import { AccountSettings, Expense } from '../lib/types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccountSettings;
  expenses: Expense[];
  onSave: (newSettings: AccountSettings) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  settings,
  expenses = [],
  onSave,
}) => {
  const [initialBalance, setInitialBalance] = useState(settings.initialBalance.toString());
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');
  const [userName, setUserName] = useState(settings.userName || 'Aryan Shah');
  const [accountName, setAccountName] = useState(settings.accountName || 'Ambika Personal Account');

  useEffect(() => {
    setInitialBalance(settings.initialBalance.toString());
    setCurrencySymbol(settings.currencySymbol || '₹');
    setUserName(settings.userName || 'Aryan Shah');
    setAccountName(settings.accountName || 'Ambika Personal Account');
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const totalExpenseUpToNow = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalanceUpToNow = (parseFloat(initialBalance) || 0) - totalExpenseUpToNow;
  const receiptsCount = expenses.filter(e => e.receiptImage).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      initialBalance: parseFloat(initialBalance) || 0,
      monthlyBudget: settings.monthlyBudget || 50000,
      currencySymbol: currencySymbol.trim() || '₹',
      userName: userName.trim() || 'User',
      accountName: accountName.trim() || 'Ambika Personal Account',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={22} color="var(--accent-blue)" />
            <span>Profile & Account Balance Settings</span>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* PROFILE SECTION */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> PROFILE DETAILS
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Profile Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field input-field-normal"
                    placeholder="e.g. Aryan Shah"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Label / Title</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field input-field-normal"
                    placeholder="Ambika Personal Account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                  <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* FINANCIAL BALANCE UP TO NOW SECTION */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={16} /> TOTAL BALANCE UP TO NOW
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Opening Initial Balance ({currencySymbol}) *</label>
                <input
                  type="number"
                  className="input-field input-field-normal"
                  placeholder="e.g. 150000"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="input-field input-field-normal"
                  placeholder="₹, $, €"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                />
              </div>
            </div>

            {/* Read-Only Accumulation Summary Fields */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.725rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Expenses Added
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
                  {currencySymbol}{totalExpenseUpToNow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {expenses.length} entries up to now
                </div>
              </div>

              <div style={{
                background: remainingBalanceUpToNow >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                border: remainingBalanceUpToNow >= 0 ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.725rem', color: remainingBalanceUpToNow >= 0 ? '#34d399' : '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
                  Net Remaining Balance
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: remainingBalanceUpToNow >= 0 ? '#34d399' : '#f87171', marginTop: '4px' }}>
                  {currencySymbol}{remainingBalanceUpToNow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {remainingBalanceUpToNow >= 0 ? 'Surplus Available' : 'Over Budget'}
                </div>
              </div>

              <div style={{
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.725rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
                  Bill Proofs Uploaded
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
                  {receiptsCount} Receipts
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Word export ready
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={18} />
              <span>Save Profile & Balance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
