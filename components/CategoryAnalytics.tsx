'use client';

import React from 'react';
import { FileCheck2, Info, Receipt, Wallet, TrendingDown } from 'lucide-react';
import { Expense } from '../lib/types';

interface CategoryAnalyticsProps {
  expenses: Expense[];
  currencySymbol: string;
  onExportDocx: () => void;
  isExportingDocx: boolean;
}

export const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({
  expenses,
  currencySymbol,
  onExportDocx,
  isExportingDocx,
}) => {
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const receiptsCount = expenses.filter((e) => e.receiptImage).length;
  const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;

  return (
    <div>
      {/* Automated Word Document Banner */}
      <div className="sidebar-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(59, 130, 246, 0.18))',
        borderColor: 'rgba(16, 185, 129, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileCheck2 size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>
              Automated Word (.docx)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>
              {receiptsCount} Bill Screenshots Attached
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
          Export your complete accounting report into Word format containing itemized ledger rows and embedded bill screenshots!
        </p>
        <button
          className="btn btn-emerald"
          style={{ width: '100%' }}
          onClick={onExportDocx}
          disabled={isExportingDocx}
        >
          {isExportingDocx ? 'Creating Word File...' : 'Generate Word Report'}
        </button>
      </div>

      {/* Ledger Overview Quick Stats */}
      <div className="sidebar-card">
        <div className="sidebar-title">
          <span>Ledger Summary Stats</span>
          <Receipt size={16} color="var(--accent-blue)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Recorded Entries</span>
            <strong style={{ color: 'var(--text-main)' }}>{expenses.length} transactions</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Average Per Expense</span>
            <strong style={{ color: '#60a5fa' }}>{currencySymbol}{avgExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Attached Bill Proofs</span>
            <strong style={{ color: '#34d399' }}>{receiptsCount} screenshots</strong>
          </div>
        </div>
      </div>

      {/* Quick Personal Accounting Info */}
      <div className="sidebar-card" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="sidebar-title" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} color="var(--accent-blue)" /> Accounting System Info
          </span>
        </div>
        <ul style={{ 
          fontSize: '0.775rem', 
          color: 'var(--text-muted)', 
          listStyleType: 'disc', 
          paddingLeft: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          lineHeight: '1.4'
        }}>
          <li>Automated live balance subtracts all expense amounts from your initial budget.</li>
          <li>Date entry is optional when adding expenses (defaults to today).</li>
          <li>All uploaded bill images are saved locally and bundled into downloadable Word files.</li>
        </ul>
      </div>
    </div>
  );
};
