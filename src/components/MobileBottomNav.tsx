import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MapPin,
  CreditCard,
  RefreshCw,
  Video,
  FileSpreadsheet,
  Menu,
  X,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Download,
  Building2,
  KeyRound,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { StaffUser, MainTabType, AttendanceRecord, PayrollRecord } from '../types';
import { formatDistance } from '../utils/geo';
import { useTheme } from '../hooks/useTheme';
import { useFullscreen } from '../hooks/useFullscreen';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { exportAttendanceReport, exportPayrollReport } from '../utils/exportExcel';

interface MobileBottomNavProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  staffList: StaffUser[];
  currentUser: StaffUser;
  onSelectUser: (user: StaffUser) => void;
  currentDistance?: number;
  onResetToSeed?: () => void;
  attendanceList?: AttendanceRecord[];
  payrollList?: PayrollRecord[];
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  staffList,
  currentUser,
  onSelectUser,
  currentDistance,
  onResetToSeed,
  attendanceList = [],
  payrollList = [],
}) => {
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [pinTested, setPinTested] = useState(false);

  const { theme, toggleTheme, isDark } = useTheme();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isInstalled, isInstallable, install, isIOS } = usePWAInstall();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'attendance' as const,
      label: 'Presensi',
      icon: MapPin,
    },
    {
      id: 'projects' as const,
      label: 'Call Sheet',
      icon: Video,
    },
    {
      id: 'payroll' as const,
      label: 'Payroll',
      icon: CreditCard,
    },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar - Only on Mobile/Tablet (< lg) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg shadow-2xl transition-colors"
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
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#E30000] text-white shadow-md shadow-[#E30000]/30 scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight ${
                    isActive ? 'font-bold text-[#E30000]' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5th Action: Menu Drawer */}
          <button
            type="button"
            onClick={() => setShowMenuSheet(!showMenuSheet)}
            className="flex flex-col items-center justify-center w-full h-full py-1 transition-all active:scale-95"
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                showMenuSheet || activeTab === 'directory' || activeTab === 'sync'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                showMenuSheet || activeTab === 'directory' || activeTab === 'sync'
                  ? 'font-bold text-slate-100'
                  : 'text-slate-400'
              }`}
            >
              Menu Lain
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-Up Bottom Drawer Sheet */}
      {showMenuSheet && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMenuSheet(false)}
          />

          {/* Drawer Content */}
          <div
            className="relative bg-slate-900 border-t border-slate-700/80 rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl text-slate-100 transition-transform"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

            {/* Drawer Header */}
            <div className="px-5 pb-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E30000] text-white flex items-center justify-center font-black text-sm">
                  O
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">obeecreatives Workspace</h3>
                  <span className="text-[10px] text-slate-400">Pusat Navigasi &amp; Kontrol HP</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMenuSheet(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Options Body */}
            <div className="p-4 space-y-3">
              {/* Quick Navigation Links */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('directory');
                    setShowMenuSheet(false);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'directory'
                      ? 'bg-[#E30000]/15 border-[#E30000]/40 text-[#E30000]'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold">Direktori Staf</span>
                  <span className="text-[10px] text-slate-500">Database Personel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onTabChange('sync');
                    setShowMenuSheet(false);
                  }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'sync'
                      ? 'bg-[#E30000]/15 border-[#E30000]/40 text-[#E30000]'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold">Sync GAS Sheet</span>
                  <span className="text-[10px] text-slate-500">Headless Sync</span>
                </button>
              </div>

              {/* 1-Click Export Excel */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Export Rekap Excel</div>
                    <div className="text-[10px] text-slate-400">Unduh file .xlsx / CSV ke HP</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      exportAttendanceReport(attendanceList, staffList);
                      setShowMenuSheet(false);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold"
                  >
                    Presensi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportPayrollReport(payrollList, staffList);
                      setShowMenuSheet(false);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold"
                  >
                    Payroll
                  </button>
                </div>
              </div>

              {/* Fullscreen Mode Switcher */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-indigo-400" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-200">Layar Penuh (Full Screen)</div>
                    <div className="text-[10px] text-slate-400">
                      {isFullscreen ? 'Mode layar penuh aktif' : 'Tampilan aplikasi penuh tanpa browser bar'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    toggleFullscreen();
                    setShowMenuSheet(false);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  {isFullscreen ? 'Keluar' : 'Aktifkan'}
                </button>
              </div>

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
                      {isDark ? 'Mode Gelap aktif (Studio)' : 'Mode Terang aktif (Siang)'}
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

              {/* Active User Section & Switcher */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Personel Aktif
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUserList(!showUserList)}
                    className="text-[11px] text-[#E30000] font-bold hover:underline"
                  >
                    {showUserList ? 'Tutup Daftar' : 'Ganti Personel ▼'}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E30000] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-100 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[9px] text-slate-300">
                        {currentUser.role.toUpperCase()}
                      </span>
                      <span className="truncate">{currentUser.department || 'Studio Batu'}</span>
                    </div>
                  </div>
                </div>

                {/* Collapsible User List */}
                {showUserList && (
                  <div className="pt-2 border-t border-slate-800 space-y-1 max-h-48 overflow-y-auto">
                    {staffList.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          onSelectUser(user);
                          setShowUserList(false);
                        }}
                        className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                          user.id === currentUser.id
                            ? 'bg-[#E30000]/15 text-[#E30000] font-bold'
                            : 'hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{user.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {user.department || user.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset to Seed Action */}
              {onResetToSeed && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuSheet(false);
                    onResetToSeed();
                  }}
                  className="w-full py-2 text-slate-500 hover:text-amber-400 text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Database ke Seed Asli</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
