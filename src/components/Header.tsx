import React, { useState } from 'react';
import { StaffUser, MainTabType } from '../types';
import {
  MapPin,
  KeyRound,
  Building2,
  Maximize2,
  Minimize2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatDistance } from '../utils/geo';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';
import { useFullscreen } from '../hooks/useFullscreen';

interface HeaderProps {
  staffList: StaffUser[];
  currentUser: StaffUser;
  onSelectUser: (user: StaffUser) => void;
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  currentDistance?: number;
}

const TAB_TITLES: Record<MainTabType, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard & KPI Operasional',
    subtitle: 'Ringkasan eksekutif kehadiran, proyek shoot, dan estimasi payroll',
  },
  directory: {
    title: 'Direktori Staf & Tim Kreatif',
    subtitle: 'Database 7 personel terverifikasi obeecreatives Studio Kota Batu',
  },
  attendance: {
    title: 'Presensi Geo-Location & Izin Cuti',
    subtitle: 'Terminal absensi GPS radius 100m Studio Batu & pengajuan cuti',
  },
  projects: {
    title: 'Call Sheet Shoot & Penugasan Kru',
    subtitle: 'Jadwal commercial shoot, crew assignment, & checklist gear studio',
  },
  payroll: {
    title: 'Rekap Gaji & Klaim Reimbursement',
    subtitle: 'Slip gaji resmi A4/WA, fee konten, & pengajuan nota operasional',
  },
  sync: {
    title: 'Integrasi Headless GAS & Export',
    subtitle: 'Sinkronisasi 2-arah Google Apps Script & download rekap Excel',
  },
};

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

  const { isFullscreen, toggleFullscreen } = useFullscreen();

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

  const activeMeta = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <header className="bg-slate-950 text-slate-100 border-b border-slate-800/80 sticky top-0 z-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Breadcrumb on Desktop, Brand on Mobile */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Only Logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E30000] text-white flex items-center justify-center font-black text-sm shrink-0">
              O
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1">
                <span className="font-black text-sm text-slate-100">obee</span>
                <span className="font-black text-sm text-[#E30000]">creatives</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400">STAFF PORTAL</span>
            </div>
          </div>

          {/* Desktop Breadcrumbs & Active Title */}
          <div className="hidden lg:block min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>Portal Operasional</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-[#E30000] font-semibold">{activeMeta.title}</span>
            </div>
            <h1 className="text-sm font-bold text-slate-100 truncate mt-0.5">
              {activeMeta.title}
            </h1>
          </div>
        </div>

        {/* Right Section: Geolocation, Fullscreen, Theme, PWA & Active User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Fullscreen Button (Desktop & Mobile) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Fullscreen)'}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Light / Dark Mode Switcher */}
          <ThemeToggle variant="header" />

          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Geolocation Studio Indicator */}
          {currentDistance !== undefined && (
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300"
              title="Jarak GPS koordinat langsung ke Studio obeecreatives Kota Batu (-7.8712, 112.5271)"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E30000] shrink-0" />
              <span className="hidden xl:inline">Studio Kota Batu:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {formatDistance(currentDistance)}
              </span>
            </div>
          )}

          {/* Active User Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-left transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#E30000] text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                )}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-xs font-semibold text-slate-100 max-w-[130px] truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.department || currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 ml-1">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Ganti Personel Staf</span>
                  <span className="text-[9px] font-mono text-emerald-400">Sheet Database</span>
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
                      className={`w-full px-3 py-2.5 text-left flex items-center justify-between text-xs hover:bg-slate-800 transition-colors ${
                        user.id === currentUser.id ? 'bg-slate-800/80 text-white font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-[10px] text-slate-400">{user.jobTitle || user.role}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-300 shrink-0">
                        {user.department || user.role}
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
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
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

      {/* Modal Verifikasi PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl text-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Verifikasi PIN Staf</h3>
                <p className="text-xs text-slate-400">
                  {currentUser.name} ({currentUser.department})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Masukkan PIN keamanan Anda untuk memvalidasi akses slip gaji dan terminal presensi.
            </p>

            <div className="space-y-3">
              <div>
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Ketik PIN..."
                  autoFocus
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono text-lg tracking-widest text-slate-100 focus:outline-none focus:border-[#E30000]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyPin();
                  }}
                />
                <div className="text-[11px] text-slate-500 text-center mt-1">
                  Default PIN terdaftar dari sheet: <span className="font-mono text-slate-300 font-bold">{currentUser.pin || '123456'}</span>
                </div>
              </div>

              {pinMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs text-center ${
                    pinMessage.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  {pinMessage.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                    setPinMessage(null);
                  }}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPin}
                  className="flex-1 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Verifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
