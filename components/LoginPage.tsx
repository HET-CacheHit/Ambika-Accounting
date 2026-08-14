'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  UserPlus, 
  LogIn, 
  User, 
  Mail, 
  Wallet,
  CheckCircle2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { getStoredUsers, saveUserAccount, UserAccount } from '../lib/storage';

interface LoginPageProps {
  onLoginSuccess: (userName: string, initialBalance?: number) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In States
  const [signInName, setSignInName] = useState('Aryan Shah');
  const [signInPasscode, setSignInPasscode] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);

  // Sign Up States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpBalance, setSignUpBalance] = useState('150000');
  const [signUpPasscode, setSignUpPasscode] = useState('');
  const [signUpConfirmPass, setSignUpConfirmPass] = useState('');

  // Reset Passcode States
  const [resetName, setResetName] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInPasscode.trim()) {
      setError('Please enter your access passcode');
      return;
    }

    const registeredUsers = getStoredUsers();
    const matchingUser = registeredUsers.find(
      u => u.name.toLowerCase() === signInName.trim().toLowerCase() ||
           u.email.toLowerCase() === signInName.trim().toLowerCase()
    );

    if (matchingUser) {
      if (matchingUser.passcode === signInPasscode.trim()) {
        setError('');
        onLoginSuccess(matchingUser.name, matchingUser.initialBalance);
        return;
      } else {
        setError('Incorrect passcode for this account.');
        return;
      }
    }

    // Default fallback access (ambika123 or any 4+ char PIN)
    if (signInPasscode.trim().toLowerCase() === 'ambika123' || signInPasscode.length >= 4) {
      setError('');
      onLoginSuccess(signInName.trim() || 'Aryan Shah');
    } else {
      setError('Invalid passcode. Minimum 4 characters required (Default: ambika123)');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!signUpName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!signUpPasscode.trim() || signUpPasscode.length < 4) {
      setError('Passcode must be at least 4 characters long');
      return;
    }

    if (signUpPasscode !== signUpConfirmPass) {
      setError('Passcodes do not match. Please check again.');
      return;
    }

    const initialBal = parseFloat(signUpBalance) || 150000;

    const newUser: UserAccount = {
      name: signUpName.trim(),
      email: signUpEmail.trim() || `${signUpName.toLowerCase().replace(/\s+/g, '')}@ambika.acc`,
      passcode: signUpPasscode.trim(),
      initialBalance: initialBal,
    };

    saveUserAccount(newUser);
    setSuccessMsg('Account created successfully! Logging you in...');

    setTimeout(() => {
      onLoginSuccess(newUser.name, newUser.initialBalance);
    }, 800);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetName.trim()) {
      setError('Please enter your account name or email');
      return;
    }

    if (!resetNewPass.trim() || resetNewPass.length < 4) {
      setError('New passcode must be at least 4 characters long');
      return;
    }

    if (resetNewPass !== resetConfirmPass) {
      setError('New passcodes do not match. Please try again.');
      return;
    }

    const registeredUsers = getStoredUsers();
    const matchingUser = registeredUsers.find(
      u => u.name.toLowerCase() === resetName.trim().toLowerCase() ||
           u.email.toLowerCase() === resetName.trim().toLowerCase()
    );

    if (matchingUser) {
      matchingUser.passcode = resetNewPass.trim();
      saveUserAccount(matchingUser);
    } else {
      // Register or update fallback user
      const updatedUser: UserAccount = {
        name: resetName.trim(),
        email: `${resetName.toLowerCase().replace(/\s+/g, '')}@ambika.acc`,
        passcode: resetNewPass.trim(),
        initialBalance: 150000,
      };
      saveUserAccount(updatedUser);
    }

    setSuccessMsg('Passcode reset successfully! Please sign in with your new passcode.');
    setSignInName(resetName.trim());
    setSignInPasscode(resetNewPass.trim());

    setTimeout(() => {
      setAuthMode('signin');
      setSuccessMsg('Passcode reset completed!');
    }, 1200);
  };

  const handleQuickDemoAccess = () => {
    onLoginSuccess('Aryan Shah', 150000);
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <Building2 size={36} color="#ffffff" />
          </div>
          <h1 className="brand-text-login" style={{ marginBottom: '8px' }}>Ambika Accounting</h1>
          <p className="login-subtitle">Personal Financial & Expense Management System</p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        {authMode !== 'forgot' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(11, 15, 25, 0.6)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError('');
                setSuccessMsg('');
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'signin' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                color: authMode === 'signin' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={16} /> Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError('');
                setSuccessMsg('');
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: authMode === 'signup' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                color: authMode === 'signup' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={16} /> Sign Up
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">Account Holder Name or Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field input-field-normal"
                  placeholder="e.g. Aryan Shah"
                  value={signInName}
                  onChange={(e) => setSignInName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Access Passcode *</label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setResetName(signInName);
                    setError('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-blue)',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Forgot Passcode?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showSignInPass ? 'text' : 'password'}
                  className="input-field input-field-normal"
                  placeholder="Enter passcode (e.g. ambika123)"
                  value={signInPasscode}
                  onChange={(e) => setSignInPasscode(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPass(!showSignInPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer'
                  }}
                >
                  {showSignInPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Default Passcode: <strong style={{ color: 'var(--accent-blue)' }}>ambika123</strong>
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '4px' }}>
              <span>Sign In to Account</span>
              <ArrowRight size={18} />
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleQuickDemoAccess}
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
            >
              <KeyRound size={16} />
              <span>Quick 1-Click Login</span>
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field input-field-normal"
                  placeholder="e.g. Aryan Shah"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-field input-field-normal"
                  placeholder="name@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Opening Income / Starting Balance (₹)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  className="input-field input-field-normal"
                  placeholder="150000"
                  value={signUpBalance}
                  onChange={(e) => setSignUpBalance(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <Wallet size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Passcode *</label>
                <input
                  type={showSignInPass ? 'text' : 'password'}
                  className="input-field input-field-normal"
                  placeholder="Min 4 chars"
                  value={signUpPasscode}
                  onChange={(e) => setSignUpPasscode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Passcode *</label>
                <input
                  type={showSignInPass ? 'text' : 'password'}
                  className="input-field input-field-normal"
                  placeholder="Re-enter"
                  value={signUpConfirmPass}
                  onChange={(e) => setSignUpConfirmPass(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-emerald" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
              <UserPlus size={18} />
              <span>Create Ambika Account</span>
            </button>
          </form>
        )}

        {/* FORGOT / RESET PASSCODE FORM */}
        {authMode === 'forgot' && (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                Reset Access Passcode
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Account Holder Name or Email *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field input-field-normal"
                  placeholder="e.g. Aryan Shah"
                  value={resetName}
                  onChange={(e) => setResetName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Passcode *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showResetPass ? 'text' : 'password'}
                  className="input-field input-field-normal"
                  placeholder="Enter new passcode (min 4 chars)"
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowResetPass(!showResetPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer'
                  }}
                >
                  {showResetPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Passcode *</label>
              <input
                type={showResetPass ? 'text' : 'password'}
                className="input-field input-field-normal"
                placeholder="Re-enter new passcode"
                value={resetConfirmPass}
                onChange={(e) => setResetConfirmPass(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
              <RefreshCw size={18} />
              <span>Reset Passcode & Save</span>
            </button>
          </form>
        )}

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          <span>Local Encrypted Personal Accounting Session</span>
        </div>
      </div>
    </div>
  );
};
