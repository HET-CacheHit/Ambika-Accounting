'use client';

import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Settings, 
  LogOut,
  Cloud,
  CloudOff
} from 'lucide-react';
import { AccountSettings } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface NavbarProps {
  settings: AccountSettings;
  onOpenSettings: () => void;
  onExportDocx: () => void;
  onLogout: () => void;
  isExportingDocx: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenSettings,
  onExportDocx,
  onLogout,
  isExportingDocx,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-logo">
          <div className="brand-icon">
            <Building2 size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-text-gradient">Ambika Accounting</span>
              <span className="badge-count badge-count-desktop" style={{ fontSize: '0.7rem' }}>Personal Ledger</span>
            </div>
            <div className="brand-subtitle">{settings.userName} &bull; {settings.accountName}</div>
          </div>
        </div>

        <div className="nav-actions">
          {/* Cloud Sync Status Indicator */}
          <div 
            className="cloud-status-badge"
            title={isSupabaseConfigured ? "Connected & Synced with Supabase Cloud DB" : "Running in Local Storage Mode"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isSupabaseConfigured ? '#34d399' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {isSupabaseConfigured ? <Cloud size={14} color="#34d399" /> : <CloudOff size={14} color="var(--text-dim)" />}
            <span className="cloud-status-text">{isSupabaseConfigured ? 'Supabase' : 'Local'}</span>
          </div>

          <button 
            className="btn btn-emerald nav-export-btn" 
            onClick={onExportDocx} 
            disabled={isExportingDocx}
            title="Generate automated Word document (.docx) with attached bill screenshots"
          >
            <FileSpreadsheet size={18} />
            <span className="btn-text-responsive">{isExportingDocx ? 'Exporting...' : 'Export Word'}</span>
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onOpenSettings}
            title="Account & Balance Settings"
            aria-label="Account Settings"
          >
            <Settings size={18} />
          </button>

          <button 
            className="btn btn-danger btn-icon" 
            onClick={onLogout}
            title="Lock / Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
