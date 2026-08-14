'use client';

import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Expense } from '../lib/types';

interface ReceiptViewerModalProps {
  expense: Expense | null;
  onClose: () => void;
  currencySymbol: string;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  expense,
  onClose,
  currencySymbol,
}) => {
  if (!expense || !expense.receiptImage) return null;

  const handleDownloadImage = () => {
    if (!expense.receiptImage) return;
    const a = document.createElement('a');
    a.href = expense.receiptImage;
    a.download = expense.receiptFileName || `${expense.title.replace(/\s+/g, '_')}_bill.png`;
    a.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{expense.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {expense.date} &bull; {expense.category} &bull; {currencySymbol}{expense.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleDownloadImage}
              title="Save Image File"
            >
              <Download size={14} /> Download
            </button>
            <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ width: '32px', height: '32px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ alignItems: 'center' }}>
          <div style={{
            width: '100%',
            maxHeight: '520px',
            overflow: 'auto',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px'
          }}>
            <img 
              src={expense.receiptImage} 
              alt={`Receipt for ${expense.title}`}
              style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>
          {expense.notes && (
            <div style={{ 
              width: '100%', 
              background: 'rgba(255, 255, 255, 0.04)', 
              padding: '12px 16px', 
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--text-muted)'
            }}>
              <strong>Notes:</strong> {expense.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
