import React, { useState } from 'react';
import {
  Users,
  MapPin,
  CreditCard,
  RefreshCw,
  Menu,
  X,
  Sun,
  Moon,
  Download,
  Building2,
  KeyRound,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { StaffUser } from '../types';
import { formatDistance } from '../utils/geo';
import { useTheme } from '../hooks/useTheme';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileBottomNavProps {
  activeTab: 'directory' | 'attendance' | 'payroll' | 'sync';
  onTabChange: (tab: 'directory' | 'attendance' | 'payroll' | 'sync') => void;
  staffList: StaffUser[];
  currentUser: StaffUser;
  onSelectUser: (user: StaffUser) => void;
  currentDistance?: number;
  onResetToSeed?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  staffList,
  currentUser,
  onSelectUser,
  currentDistance,
  onResetToSeed,
}) => {
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [pinTested, setPinTested] = useState(false);

  const { theme, toggleTheme, isDark } = useTheme();
  const { isInstalled, isInstallable, install, isIOS } = usePWAInstall();

  const navItems = [
    {
      id: 'directory' as const,
      label: 'Direktori',
      icon: Users,
    },
    {
      id: 'attendance' as const,
      label: 'Presensi',
      icon: MapPin,
    },
    {
      id: 'payroll' as const,
      label: 'Payroll',
      icon: CreditCard,
    },
    {
      id: 'sync' as const,
      label: 'Sync GAS',
      icon: RefreshCw,
    },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar - Only on Mobile (md:hidden) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg shadow-2xl transition-colors"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
        aria-label="Navigasi Bawah Mobile"
      >
        <div className="grid grid-cols-5 items-center justify-around h-15 px-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  if (showMenuSheet) setShowMenuSheet(false);
                }}
                className="flex flex-col items-center justify-center w-full h-full py-1 transition-all active:scale-95"
              >
                <div
                  className={`relative p-1 rounded-full transition-colors ${
                    isActive ? 'text-[#E30000]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#E30000] rounded-full shadow-sm shadow-red-500" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-tight leading-tight mt-0.5 ${
                    isActive ? 'text-[#E30000] font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5th item: Menu Lain */}
          <button
            type="button"
            onClick={() => setShowMenuSheet(true)}
            className="flex flex-col items-center justify-center w-full h-full py-1 transition-all active:scale-95"
          >
            <div
              className={`p-1 rounded-full transition-colors ${
                showMenuSheet ? 'text-[#E30000]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-semibold tracking-tight leading-tight mt-0.5 ${
                showMenuSheet ? 'text-[#E30000] font-bold' : 'text-slate-400'
              }`}
            >
              Menu Lain
            </span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Menu Drawer */}
      {showMenuSheet && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in">
          {/* Backdrop click to close */}
          <div
            className="flex-1"
            onClick={() => setShowMenuSheet(false)}
            aria-hidden="true"
          />

          {/* Sheet Content Box */}
          <div
            className="bg-slate-900 border-t border-slate-700/80 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col animate-in slide-in-from-bottom duration-200 text-slate-100"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#E30000] text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {currentUser.role.replace('_', ' ')} &middot; {currentUser.department}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMenuSheet(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Options Body */}
            <div className="p-4 space-y-3">
              {/* Studio Distance Badge */}
              {currentDistance !== undefined && (
                <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E30000]" />
                    <span className="text-xs text-slate-300">Jarak ke Studio Kota Batu:</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    {formatDistance(currentDistance)}
                  </span>
                </div>
              )}

              {/* Mode Terang / Gelap Switcher */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isDark ? (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-200">Mode Tampilan</div>
                    <div className="text-[10px] text-slate-400">
                      {isDark ? 'Mode Gelap aktif' : 'Mode Terang aktif'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-amber-300'
                      : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                  }`}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{isDark ? 'Ganti Terang' : 'Ganti Gelap'}</span>
                </button>
              </div>

              {/* PWA Install Button if available */}
              {!isInstalled && (
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-[#E30000]" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Pasang di HP (PWA)</div>
                      <div className="text-[10px] text-slate-400">
                        {isIOS ? 'Tambah ke Layar Utama iOS' : 'Aplikasi native tanpa browser frame'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (isInstallable) {
                        await install();
                      } else {
                        alert(
                          isIOS
                            ? 'Buka menu Share di Safari, lalu pilih "Tambah ke Layar Utama" (Add to Home Screen).'
                            : 'Buka menu titik tiga di browser Anda, lalu pilih "Instal aplikasi" atau "Tambahkan ke Layar Utama".'
                        );
                      }
                      setShowMenuSheet(false);
                    }}
                    className="px-3 py-1.5 bg-[#E30000] hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Install App
                  </button>
                </div>
              )}

              {/* Ganti Staf Aktif Accordion */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowUserList(!showUserList)}
                  className="w-full p-3 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Ganti Staf Aktif</div>
                      <div className="text-[10px] text-slate-400">Simulasi akses staf lain ({staffList.length} orang)</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{showUserList ? '▲' : '▼'}</span>
                </button>

                {showUserList && (
                  <div className="p-2 border-t border-slate-800 max-h-48 overflow-y-auto space-y-1">
                    {staffList.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          onSelectUser(user);
                          setShowUserList(false);
                          setShowMenuSheet(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left text-xs ${
                          user.id === currentUser.id
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="truncate">
                          <div>{user.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                        </div>
                        {user.id === currentUser.id && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PIN Info & Testing */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">PIN Akses Staf</div>
                    <div className="text-[10px] text-slate-400">
                      PIN {currentUser.name}: <span className="font-mono text-amber-400 font-bold">{currentUser.pin || '123456'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPinTested(true);
                    setTimeout(() => setPinTested(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium"
                >
                  {pinTested ? '✓ Valid' : 'Cek Status'}
                </button>
              </div>

              {/* Reset to Seed Data */}
              {onResetToSeed && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuSheet(false);
                      onResetToSeed();
                    }}
                    className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-amber-400 flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                    <span>Kembalikan Data Awal (Reset Seed)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
