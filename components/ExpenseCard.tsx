'use client';

import React from 'react';
import { 
  Receipt,
  Paperclip,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Expense } from '../lib/types';

interface ExpenseCardProps {
  expense: Expense;
  currencySymbol: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onViewReceipt: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  currencySymbol,
  onEdit,
  onDelete,
  onViewReceipt,
}) => {
  return (
    <div className="expense-card animate-fade-in">
      <div className="expense-info">
        <div className="category-icon-box">
          <Receipt size={22} />
        </div>
        <div className="expense-title-block">
          <div className="expense-title">{expense.title}</div>
          <div className="expense-meta">
            <span>{expense.date}</span>
            {expense.receiptImage && (
              <button 
                className="receipt-pill" 
                onClick={() => onViewReceipt(expense)}
                title="View attached bill screenshot"
              >
                <Paperclip size={12} />
                <span>Bill Attached</span>
              </button>
            )}
          </div>
          {expense.notes && (
            <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              {expense.notes}
            </div>
          )}
        </div>
      </div>

      <div className="expense-amount-block">
        <div className="expense-amount">
          -{currencySymbol}{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className="action-buttons">
          <button 
            className="btn btn-secondary btn-icon btn-sm" 
            onClick={() => onEdit(expense)}
            title="Edit Expense"
          >
            <Edit2 size={14} />
          </button>
          <button 
            className="btn btn-danger btn-icon btn-sm" 
            onClick={() => onDelete(expense.id)}
            title="Delete Expense"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
