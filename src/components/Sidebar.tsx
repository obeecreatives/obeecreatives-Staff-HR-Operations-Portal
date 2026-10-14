import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Video,
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Download,
  Building2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { MainTabType, StaffUser } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useFullscreen } from '../hooks/useFullscreen';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SidebarProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  currentUser: StaffUser;
  pendingLeavesCount?: number;
  pendingExpensesCount?: number;
  upcomingProjectsCount?: number;
}

const STORAGE_COLLAPSED_KEY = 'obee_sidebar_collapsed';

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  pendingLeavesCount = 0,
  pendingExpensesCount = 0,
  upcomingProjectsCount = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem(STORAGE_COLLAPSED_KEY);
      return saved !== null ? saved === 'true' : true; // Default mini collapsed for sleek UI
    } catch {
      return true;
    }
  });

  const { theme, toggleTheme, isDark } = useTheme();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isInstalled, isInstallable, install, isIOS } = usePWAInstall();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COLLAPSED_KEY, String(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard & KPI',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Ringkasan eksekutif & operasional',
      badge: null,
    },
    {
      id: 'directory' as const,
      label: 'Direktori Staf',
      shortLabel: 'Staf',
      icon: Users,
      description: 'Database tim terverifikasi obee',
      badge: null,
    },
    {
      id: 'attendance' as const,
      label: 'Presensi & Cuti',
      shortLabel: 'Presensi',
      icon: MapPin,
      description: 'Terminal GPS Studio Kota Batu',
      badge: pendingLeavesCount > 0 ? `${pendingLeavesCount} Cuti` : null,
      badgeColor: 'bg-amber-500 text-black',
    },
    {
      id: 'projects' as const,
      label: 'Call Sheet Shoot',
      shortLabel: 'Call Sheet',
      icon: Video,
      description: 'Jadwal produksi & checklist gear',
      badge: upcomingProjectsCount > 0 ? `${upcomingProjectsCount} Shoot` : null,
      badgeColor: 'bg-indigo-500 text-white',
    },
    {
      id: 'payroll' as const,
      label: 'Payroll & Reimburse',
      shortLabel: 'Payroll',
      icon: CreditCard,
      description: 'Gaji, fee konten & klaim nota',
      badge: pendingExpensesCount > 0 ? `${pendingExpensesCount} Nota` : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'sync' as const,
      label: 'Sync GAS & Export',
      shortLabel: 'GAS Sync',
      icon: RefreshCw,
      description: 'Integrasi Sheet & Export Excel',
      badge: 'v2.4',
      badgeColor: 'bg-slate-700 text-slate-300',
    },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col border-r transition-all duration-300 ease-in-out shrink-0 select-none z-30 h-screen sticky top-0 ${
        isDark ? 'bg-[#070d19] border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
      } ${isCollapsed ? 'w-[76px]' : 'w-72'}`}
      aria-label="Sidebar Navigasi"
    >
      {/* Brand Header */}
      <div className="h-16 px-3.5 flex items-center justify-between border-b border-slate-800/60 shrink-0">
        {isCollapsed ? (
          <div className="w-full flex items-center justify-center">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              title="obeecreatives Workspace OS"
              className="w-10 h-10 rounded-xl bg-[#E30000] text-white flex items-center justify-center font-black text-lg shadow-sm hover:scale-105 transition-transform"
            >
              O
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#E30000] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              O
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight truncate text-slate-100">
                  obeecreatives
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#E30000]/20 text-[#E30000] border border-[#E30000]/30 shrink-0">
                  OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate font-medium">
                Staff &amp; Operations Portal
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse / Expand Toggle Button Strip */}
      <div className="px-3 pt-3 pb-1 shrink-0 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          } ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? 'Perlebar Sidebar (Expand)' : 'Perkecil Sidebar (Mini Mode)'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#E30000]" />
          ) : (
            <>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium text-slate-400">Mini Sidebar</span>
            </>
          )}
        </button>
      </div>

      {/* Section Label (Expanded Only) */}
      {!isCollapsed && (
        <div className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Menu Operasional
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-2 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (isCollapsed) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                title={`${item.label} — ${item.description}`}
                className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center relative transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E30000] text-white shadow-md shadow-[#E30000]/25 scale-105'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-850'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#070d19]" />
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all duration-200 group ${
                isActive
                  ? 'bg-[#E30000] text-white shadow-md shadow-[#E30000]/20'
                  : isDark
                  ? 'text-slate-300 hover:bg-slate-850 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? 'bg-black/20 text-white'
                    : isDark
                    ? 'bg-slate-900 text-slate-400 group-hover:text-white group-hover:bg-slate-800'
                    : 'bg-white text-slate-600 group-hover:text-slate-900 shadow-xs'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    isActive ? 'text-white/80' : 'text-slate-400'
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Actions: Fullscreen, Theme, PWA */}
      <div className="p-2.5 border-t border-slate-800/80 space-y-1.5 shrink-0 bg-slate-950/40">
        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Fullscreen)'}
          className={`w-full p-2 rounded-xl border flex items-center transition-colors ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          } ${isCollapsed ? 'justify-center' : 'gap-2.5 px-3'}`}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Maximize2 className="w-4 h-4 text-indigo-400 shrink-0" />
          )}
          {!isCollapsed && (
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">
                {isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Full)'}
              </div>
              <div className="text-[10px] text-slate-400">Tekan F11 atau klik</div>
            </div>
          )}
        </button>

        {/* Theme Mode Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)'}
          className={`w-full p-2 rounded-xl border flex items-center transition-colors ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          } ${isCollapsed ? 'justify-center' : 'gap-2.5 px-3'}`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
          )}
          {!isCollapsed && (
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">
                {isDark ? 'Mode Terang' : 'Mode Gelap'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isDark ? 'Tampilan Siang Hari' : 'Tampilan Gelap Studio'}
              </div>
            </div>
          )}
        </button>

        {/* PWA Install Button if available */}
        {!isInstalled && (
          <button
            type="button"
            onClick={async () => {
              if (isInstallable) {
                await install();
              } else {
                alert(
                  isIOS
                    ? 'Buka menu Share di Safari, lalu pilih "Tambah ke Layar Utama" (Add to Home Screen).'
                    : 'Buka menu browser Anda (titik tiga), lalu pilih "Instal aplikasi" atau "Tambahkan ke Layar Utama".'
                );
              }
            }}
            title="Install Web App ke PC / Laptop"
            className={`w-full p-2 rounded-xl border flex items-center transition-colors ${
              isDark
                ? 'bg-[#E30000]/10 border-[#E30000]/30 text-[#E30000] hover:bg-[#E30000]/20'
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            } ${isCollapsed ? 'justify-center' : 'gap-2.5 px-3'}`}
          >
            <Download className="w-4 h-4 shrink-0 text-[#E30000]" />
            {!isCollapsed && (
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-bold text-[#E30000] truncate">
                  Install Aplikasi (PC)
                </div>
                <div className="text-[10px] text-slate-400">Aplikasi standalone desktop</div>
              </div>
            )}
          </button>
        )}

        {/* User Card Mini Profile */}
        <div
          className={`pt-2 border-t border-slate-800/60 flex items-center ${
            isCollapsed ? 'justify-center' : 'gap-2.5 px-1'
          }`}
          title={`Masuk sebagai: ${currentUser.name} (${currentUser.jobTitle || currentUser.role})`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0 overflow-hidden">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name.slice(0, 2).toUpperCase()
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate text-slate-200">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#E30000]" />
                <span>{currentUser.department || 'Studio Batu'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
