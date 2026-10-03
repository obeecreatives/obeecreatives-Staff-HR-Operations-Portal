import React, { useState } from 'react';
import { StaffUser, MainTabType } from '../types';
import { MapPin, KeyRound, Building2 } from 'lucide-react';
import { formatDistance } from '../utils/geo';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  staffList: StaffUser[];
  currentUser: StaffUser;
  onSelectUser: (user: StaffUser) => void;
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  currentDistance?: number;
}

export const Header: React.FC<HeaderProps> = ({
  staffList,
  currentUser,
  onSelectUser,
  activeTab,
  onTabChange,
  currentDistance,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleVerifyPin = () => {
    if (pinInput.trim() === (currentUser.pin || '123456')) {
      setPinMessage({ type: 'success', text: 'PIN diverifikasi! Akses penuh dibuka.' });
      setTimeout(() => {
        setShowPinModal(false);
        setPinInput('');
        setPinMessage(null);
      }, 700);
    } else {
      setPinMessage({ type: 'error', text: 'PIN salah! Default staf adalah 123456.' });
    }
  };

  return (
    <header className="bg-slate-950 text-slate-100 border-b border-slate-800 sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-baseline tracking-tight">
            <span className="text-xl sm:text-2xl font-black text-slate-100">obee</span>
            <span className="text-xl sm:text-2xl font-black text-[#E30000]">creatives</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            HR
          </span>
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-slate-400 pl-3 border-l border-slate-800">
            Staff & HR Operations Portal
          </span>
        </div>

        {/* Center / Right Zone: Distance, Theme, PWA & Active User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Light / Dark Mode Switcher */}
          <ThemeToggle variant="header" />

          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Geolocation Studio Indicator */}
          {currentDistance !== undefined && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#E30000] shrink-0" />
              <span>Studio Kota Batu:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {formatDistance(currentDistance)}
              </span>
            </div>
          )}

          {/* Active User Simulator / Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-md text-left transition-colors"
            >
              <div className="w-7 h-7 rounded bg-[#E30000] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-xs font-semibold text-slate-100 max-w-[140px] truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ganti Staf Aktif (Simulasi Akses)
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {staffList.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        onSelectUser(user);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-800 transition-colors ${
                        user.id === currentUser.id ? 'bg-slate-800/80 text-white font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div>{user.name}</div>
                        <div className="text-[10px] text-slate-400">{user.jobTitle || user.role}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 font-mono">
                        {user.role === 'admin' ? 'ADMIN' : user.role === 'project_manager' ? 'PM' : 'STAFF'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowPinModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Uji Verifikasi PIN ({currentUser.pin || '123456'})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar (Desktop & Tablet) */}
      <div className="hidden md:block bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-3 py-2">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-[#E30000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Dashboard &amp; KPI
            </button>
            <button
              type="button"
              onClick={() => onTabChange('directory')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'bg-[#E30000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Direktori Staf &amp; Tim
            </button>
            <button
              type="button"
              onClick={() => onTabChange('attendance')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-[#E30000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Presensi &amp; Cuti/Izin
            </button>
            <button
              type="button"
              onClick={() => onTabChange('projects')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-[#E30000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Call Sheet &amp; Shoot
            </button>
            <button
              type="button"
              onClick={() => onTabChange('payroll')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'payroll'
                  ? 'bg-[#E30000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Payroll &amp; Reimburse
            </button>
            <button
              type="button"
              onClick={() => onTabChange('sync')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'sync'
                  ? 'bg-[#E30000] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Sync GAS &amp; Export
            </button>
          </nav>
        </div>
      </div>

      {/* Modal Verifikasi PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-sm w-full p-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold">Verifikasi PIN Staf</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Masukkan 4–8 digit PIN untuk <strong>{currentUser.name}</strong> (PIN awal bawaan: <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">123456</code>).
            </p>

            <div className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                placeholder="Ketik PIN..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-center tracking-widest text-lg font-mono focus:outline-none focus:border-[#E30000]"
                autoFocus
              />

              {pinMessage && (
                <div
                  className={`text-xs p-2 rounded text-center ${
                    pinMessage.type === 'error' ? 'bg-red-950/80 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {pinMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                    setPinMessage(null);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPin}
                  className="px-4 py-1.5 bg-[#E30000] hover:bg-red-700 text-white rounded text-xs font-semibold"
                >
                  Verifikasi PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
