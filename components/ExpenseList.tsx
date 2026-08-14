'use client';

import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, Receipt } from 'lucide-react';
import { Expense } from '../lib/types';
import { ExpenseCard } from './ExpenseCard';

interface ExpenseListProps {
  expenses: Expense[];
  currencySymbol: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onViewReceipt: (expense: Expense) => void;
  onOpenAddExpense: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  currencySymbol,
  onEdit,
  onDelete,
  onViewReceipt,
  onOpenAddExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [onlyWithReceipts, setOnlyWithReceipts] = useState<boolean>(false);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const matchesSearch = 
          expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (expense.notes && expense.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesReceipt = !onlyWithReceipts || Boolean(expense.receiptImage);

        return matchesSearch && matchesReceipt;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchQuery, sortBy, onlyWithReceipts]);

  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="expense-section">
      {/* Section Header with Main "+ Add Expense" Button */}
      <div className="section-header">
        <div className="section-title">
          <span>Expense Ledger Records</span>
          <span className="badge-count">{filteredExpenses.length} entries</span>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={onOpenAddExpense}
          style={{ padding: '9px 18px', fontSize: '0.9rem', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.45)' }}
        >
          <PlusCircle size={18} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Toolbar / Search & Filter Controls */}
      <div className="toolbar-card">
        <div className="filter-row">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="input-field"
              placeholder="Search expenses by purpose, item, or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="date-desc">Newest Date</option>
            <option value="date-asc">Oldest Date</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          <button
            className={`btn btn-sm ${onlyWithReceipts ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setOnlyWithReceipts(!onlyWithReceipts)}
            title="Show only transactions with bill screenshots"
          >
            <Receipt size={14} />
            <span>Bills Only</span>
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <span>Filtered Total Expenditure: <strong style={{ color: '#f87171', fontSize: '0.95rem' }}>{currencySymbol}{filteredTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
          <button 
            onClick={onOpenAddExpense} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-blue)', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <PlusCircle size={14} /> Add New Entry
          </button>
        </div>
      </div>

      {/* List Content */}
      {filteredExpenses.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              currencySymbol={currencySymbol}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewReceipt={onViewReceipt}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Receipt className="empty-icon" />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px', fontSize: '1.1rem' }}>
            No expenses found
          </h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '20px' }}>
            {expenses.length === 0 
              ? 'You have not added any expenses yet.' 
              : 'No expenses match your search query.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenAddExpense}>
            <PlusCircle size={18} />
            <span>Add First Expense Entry</span>
          </button>
        </div>
      )}
    </div>
  );
};
