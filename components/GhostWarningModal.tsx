'use client';

import React, { useState, useEffect } from 'react';
import { Ghost, ArrowRight, BellRing, AlertCircle, X } from 'lucide-react';
import { Expense, AccountSettings } from '../lib/types';

interface GhostWarningModalProps {
  expenses: Expense[];
  settings: AccountSettings;
}

export const GhostWarningModal: React.FC<GhostWarningModalProps> = ({
  expenses,
  settings,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const initialBalance = settings.initialBalance || 1;
  const spentRatio = totalExpense / initialBalance;
  const spentPercentage = Math.round(spentRatio * 100);
  const remainingBalance = settings.initialBalance - totalExpense;

  // Trigger popup when spent percentage >= 90%
  const isThresholdExceeded = spentRatio >= 0.90 && settings.initialBalance > 0;

  // Re-open popup if expenses change and remain above 90%
  useEffect(() => {
    if (isThresholdExceeded) {
      setIsOpen(true);
    }
  }, [totalExpense, settings.initialBalance, isThresholdExceeded]);

  if (!isThresholdExceeded) {
    return null;
  }

  const currency = settings.currencySymbol || '₹';

  return (
    <>
      {/* PERSISTENT GHOST ALARM BANNER (Always visible when expenses >= 90%) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(239, 68, 68, 0.25))',
        border: '1px solid rgba(244, 63, 94, 0.6)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 25px rgba(244, 63, 94, 0.3)',
        animation: 'fadeIn 0.3s ease forwards'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(244, 63, 94, 0.6)'
          }}>
            <Ghost size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👻 CRITICAL BUDGET GHOST ALARM!</span>
              <span style={{
                background: '#f43f5e',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.725rem',
                fontWeight: 800
              }}>
                {spentPercentage}% EXHAUSTED
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '2px' }}>
              Warning: Expenses have reached {spentPercentage}% of total balance! Only {currency}{remainingBalance.toLocaleString('en-IN')} remaining.
            </div>
          </div>
        </div>

        <button
          className="btn btn-danger"
          onClick={() => setIsOpen(true)}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            background: '#f43f5e',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)'
          }}
        >
          <BellRing size={16} />
          <span>View Ghost Warning</span>
        </button>
      </div>

      {/* POPUP MODAL (Appears in center of screen) */}
      {isOpen && (
        <div className="modal-overlay" style={{ background: 'rgba(3, 7, 18, 0.9)', zIndex: 300 }}>
          <div 
            className="modal-card animate-fade-in" 
            style={{
              maxWidth: '520px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid rgba(244, 63, 94, 0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 0 60px rgba(244, 63, 94, 0.45), 0 25px 60px rgba(0, 0, 0, 0.95)',
              borderRadius: '24px',
              padding: '0',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Ghost Glow Header Accent */}
            <div style={{
              height: '6px',
              background: 'linear-gradient(90deg, #f43f5e, #f59e0b, #ec4899)'
            }} />

            <div style={{ padding: '32px 28px', textAlign: 'center' }}>
              {/* Animated Ghost Icon */}
              <div 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  background: 'rgba(244, 63, 94, 0.2)',
                  border: '1px solid rgba(244, 63, 94, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 0 35px rgba(244, 63, 94, 0.5)',
                  animation: 'floatGentle 3s ease-in-out infinite'
                }}
              >
                <Ghost size={46} color="#f87171" />
              </div>

              <h2 style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                marginBottom: '8px',
                textShadow: '0 0 20px rgba(244, 63, 94, 0.5)'
              }}>
                👻 BUDGET CRITICAL GHOST ALARM!
              </h2>

              <div style={{
                display: 'inline-block',
                background: 'rgba(244, 63, 94, 0.25)',
                color: '#f87171',
                border: '1px solid rgba(244, 63, 94, 0.5)',
                padding: '5px 16px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 900,
                marginBottom: '20px'
              }}>
                {spentPercentage}% OF TOTAL BALANCE SPENT!
              </div>

              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}>
                Alert! Your expenses have crossed <strong style={{ color: '#f87171' }}>90%</strong> of your opening initial balance. You have very little remaining balance left in your Ambika personal account!
              </p>

              {/* Stats Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                background: 'rgba(11, 15, 25, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '16px',
                borderRadius: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    Total Expense
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
                    {currency}{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    Remaining Balance
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: remainingBalance >= 0 ? '#34d399' : '#f87171', marginTop: '4px' }}>
                    {currency}{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Dismiss & Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsOpen(false)}
                  style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }}
                >
                  Close Warning
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => setIsOpen(false)}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    fontSize: '0.9rem', 
                    background: 'linear-gradient(135deg, #f43f5e, #e11d48)', 
                    color: '#ffffff',
                    boxShadow: '0 4px 16px rgba(244, 63, 94, 0.4)'
                  }}
                >
                  <span>Review Ledger</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
