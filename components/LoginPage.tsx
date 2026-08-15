'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  User, 
  Mail, 
  Wallet, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft,
  Lock
} from 'lucide-react';
import { getStoredUsers, saveUserAccount, UserAccount } from '../lib/storage';
import { syncSupabaseUser, isSupabaseConfigured } from '../lib/supabaseService';

interface LoginPageProps {
  onLoginSuccess: (userName: string, initialBalance?: number, userEmail?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In States
  const [signInName, setSignInName] = useState('');
  const [signInPasscode, setSignInPasscode] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);

  // Sign Up States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpBalance, setSignUpBalance] = useState('150000');
  const [signUpPasscode, setSignUpPasscode] = useState('');
  const [signUpConfirmPass, setSignUpConfirmPass] = useState('');
  const [showSignUpPass, setShowSignUpPass] = useState(false);

  // Reset Password States
  const [resetName, setResetName] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetConfirmPass, setResetConfirmPass] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-fill recent user name if available
  useEffect(() => {
    const users = getStoredUsers();
    if (users.length > 0) {
      setSignInName(users[0].name);
    } else {
      // If first time visit, switch to Sign Up so user sets their own password
      setAuthMode('signup');
    }
  }, []);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!signInName.trim()) {
      setError('Please enter your account name or email.');
      return;
    }

    if (!signInPasscode.trim()) {
      setError('Please enter your personal password.');
      return;
    }

    const registeredUsers = getStoredUsers();

    if (registeredUsers.length === 0) {
      setError('No account exists yet. Please switch to the Sign Up tab to create your account and set your own password.');
      return;
    }

    const matchingUser = registeredUsers.find(
      u => u.name.toLowerCase() === signInName.trim().toLowerCase() ||
           u.email.toLowerCase() === signInName.trim().toLowerCase()
    );

    if (!matchingUser) {
      setError('Account not found with this name/email. Please verify your spelling or click Sign Up to create one.');
      return;
    }

    if (matchingUser.passcode !== signInPasscode.trim()) {
      setError('Incorrect password for this account. Please try again or click "Forgot Password?".');
      return;
    }

    setError('');
    onLoginSuccess(matchingUser.name, matchingUser.initialBalance, matchingUser.email);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!signUpName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!signUpPasscode.trim() || signUpPasscode.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (signUpPasscode !== signUpConfirmPass) {
      setError('Passwords do not match. Please verify both fields.');
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

    if (isSupabaseConfigured) {
      syncSupabaseUser(newUser);
    }

    setSuccessMsg('Account created successfully! Logging you into Ambika Accounting...');

    setTimeout(() => {
      onLoginSuccess(newUser.name, newUser.initialBalance, newUser.email);
    }, 600);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetName.trim()) {
      setError('Please enter your registered account name or email.');
      return;
    }

    if (!resetNewPass.trim() || resetNewPass.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    if (resetNewPass !== resetConfirmPass) {
      setError('New passwords do not match. Please try again.');
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

      if (isSupabaseConfigured) {
        syncSupabaseUser(matchingUser);
      }
    } else {
      const newUser: UserAccount = {
        name: resetName.trim(),
        email: `${resetName.toLowerCase().replace(/\s+/g, '')}@ambika.acc`,
        passcode: resetNewPass.trim(),
        initialBalance: 150000,
      };
      saveUserAccount(newUser);

      if (isSupabaseConfigured) {
        syncSupabaseUser(newUser);
      }
    }

    setSuccessMsg('Password updated successfully! Please sign in with your new password.');
    setSignInName(resetName.trim());
    setSignInPasscode(resetNewPass.trim());

    setTimeout(() => {
      setAuthMode('signin');
    }, 1000);
  };

  return (
    <div className="login-container">
      {/* Moving Dynamic Ambient Background */}
      <div className="login-bg-wallpaper" />
      <div className="moving-orb moving-orb-1" />
      <div className="moving-orb moving-orb-2" />
      <div className="moving-orb moving-orb-3" />
      <div className="moving-orb moving-orb-4" />
      <div className="animated-grid-overlay" />

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
                  placeholder="Enter your name or email"
                  value={signInName}
                  onChange={(e) => setSignInName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Your Password *</label>
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
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showSignInPass ? 'text' : 'password'}
                  className="input-field input-field-normal"
                  placeholder="Enter your password"
                  value={signInPasscode}
                  onChange={(e) => setSignInPasscode(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
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
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '4px' }}>
              <span>Sign In to Account</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* SIGN UP FORM (CHOOSE YOUR OWN PASSWORD) */}
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
                <label className="form-label">Choose Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignUpPass ? 'text' : 'password'}
                    className="input-field input-field-normal"
                    placeholder="Min 4 chars"
                    value={signUpPasscode}
                    onChange={(e) => setSignUpPasscode(e.target.value)}
                    style={{ paddingRight: '36px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPass(!showSignUpPass)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    {showSignUpPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type={showSignUpPass ? 'text' : 'password'}
                  className="input-field input-field-normal"
                  placeholder="Re-enter password"
                  value={signUpConfirmPass}
                  onChange={(e) => setSignUpConfirmPass(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-emerald" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
              <UserPlus size={18} />
              <span>Create Account & Set Password</span>
            </button>
          </form>
        )}

        {/* FORGOT / RESET PASSWORD FORM */}
        {authMode === 'forgot' && (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                Reset Your Password
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
              <label className="form-label">Choose New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showResetPass ? 'text' : 'password'}
                  className="input-field input-field-normal"
                  placeholder="Enter new password (min 4 chars)"
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
              <label className="form-label">Confirm New Password *</label>
              <input
                type={showResetPass ? 'text' : 'password'}
                className="input-field input-field-normal"
                placeholder="Re-enter new password"
                value={resetConfirmPass}
                onChange={(e) => setResetConfirmPass(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
              <RefreshCw size={18} />
              <span>Save New Password</span>
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
          <span>Secure Personal Password Authentication</span>
        </div>
      </div>
    </div>
  );
};
