'use client';

import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Settings, 
  LogOut,
} from 'lucide-react';
import { AccountSettings } from '../lib/types';

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
              <span className="badge-count" style={{ fontSize: '0.7rem' }}>Personal Ledger</span>
            </div>
            <div className="brand-subtitle">{settings.userName} &bull; {settings.accountName}</div>
          </div>
        </div>

        <div className="nav-actions">
          <button 
            className="btn btn-emerald" 
            onClick={onExportDocx} 
            disabled={isExportingDocx}
            title="Generate automated Word document (.docx) with attached bill screenshots"
          >
            <FileSpreadsheet size={18} />
            <span>{isExportingDocx ? 'Generating Word...' : 'Export Word (.docx)'}</span>
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onOpenSettings}
            title="Account & Balance Settings"
          >
            <Settings size={18} />
          </button>

          <button 
            className="btn btn-danger btn-icon" 
            onClick={onLogout}
            title="Lock / Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
