'use client';

import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { Expense } from '../lib/types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'> & { id?: string }) => void;
  editingExpense?: Expense | null;
  currencySymbol: string;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  currencySymbol,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setDate(editingExpense.date);
      setNotes(editingExpense.notes || '');
      setReceiptImage(editingExpense.receiptImage);
      setReceiptFileName(editingExpense.receiptFileName);
    } else {
      setTitle('');
      setAmount('');
      setDate('');
      setNotes('');
      setReceiptImage(undefined);
      setReceiptFileName(undefined);
    }
    setError('');
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter for what it was expensed');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    // Date is optional; defaults to today's date if not provided
    const finalDate = date.trim() || new Date().toISOString().split('T')[0];

    onSave({
      id: editingExpense?.id,
      title: title.trim(),
      amount: numericAmount,
      category: editingExpense?.category || 'Other',
      paymentMethod: editingExpense?.paymentMethod || 'Cash',
      date: finalDate,
      notes: notes.trim() || undefined,
      receiptImage,
      receiptFileName,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {editingExpense ? 'Edit Expense Entry' : 'Add New Expense'}
          </div>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onClose}
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#f87171', 
              padding: '10px 14px', 
              borderRadius: '8px',
              fontSize: '0.85rem' 
            }}>
              {error}
            </div>
          )}

          {/* For What It Expensed */}
          <div className="form-group">
            <label className="form-label">For What It Expensed *</label>
            <input
              type="text"
              className="input-field input-field-normal"
              placeholder="e.g. Grocery store bill, Electricity bill, Petrol fill..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Amount & Date (Date is optional) */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Expense Amount ({currencySymbol}) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-field input-field-normal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date (Optional - Defaults to Today)</label>
              <input
                type="date"
                className="input-field input-field-normal"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label className="form-label">Notes / Remarks (Optional)</label>
            <textarea
              className="input-field input-field-normal"
              rows={2}
              placeholder="Additional details or remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Bill Screenshot / Receipt Upload Section */}
          <div className="form-group">
            <label className="form-label">
              Bill / Receipt Screenshot (For Word Document Export)
            </label>

            {receiptImage ? (
              <div className="preview-image-box">
                <img src={receiptImage} alt="Receipt Screenshot Preview" />
                <button
                  type="button"
                  className="remove-img-btn"
                  onClick={() => {
                    setReceiptImage(undefined);
                    setReceiptFileName(undefined);
                  }}
                  title="Remove attached bill screenshot"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={32} color="var(--accent-blue)" />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Click to upload bill screenshot / receipt
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    PNG, JPG, WEBP &bull; Will be embedded in Word export
                  </div>
                </div>
              </label>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={18} />
              <span>{editingExpense ? 'Save Changes' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
