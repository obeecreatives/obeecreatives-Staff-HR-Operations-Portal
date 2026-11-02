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
  HelpCircle,
  ArrowLeftRight,
  ExternalLink,
  BookOpen,
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

const SWITCH_APPS = [
  { name: 'CRM & Pipeline', url: 'https://obeecreatives.github.io/CRM/', desc: 'Klien, Leads, & Project Deals' },
  { name: 'Laporan Keuangan', url: 'https://obeecreatives.github.io/Laporan-Keuangan/', desc: 'Cashflow, Neraca & Laba Rugi' },
  { name: 'Equipment Hub', url: 'https://obeecreatives.github.io/Equipment-Hub/', desc: 'Inventaris Kamera & Gear Studio' },
  { name: 'Document Hub', url: 'https://obeecreatives.github.io/Document-Hub/', desc: 'Template Kontrak & Surat Penawaran' },
  { name: 'Database Surat', url: 'https://obeecreatives.github.io/Database-Surat/', desc: 'Nomor Surat Keluar & Arsip' },
  { name: 'Recruitment Hub', url: 'https://obeecreatives.github.io/Recruitment/', desc: 'Seleksi Kru & Talent Creative' },
];

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
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
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

          {/* Switch App Dropdown (v10 Standard) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSwitchDropdown(!showSwitchDropdown);
                setShowUserDropdown(false);
              }}
              title="Switch App — Pindah ke Tools obeeTOOLS Lain"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
            >
              <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            </button>

            {showSwitchDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>obeeTOOLS Ecosystem</span>
                  <span className="text-emerald-400 font-mono text-[9px]">v10 Standard</span>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                  {SWITCH_APPS.map((app) => (
                    <a
                      key={app.name}
                      href={app.url}
                      className="block px-3 py-2 hover:bg-slate-800 transition-colors group"
                    >
                      <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                        <span>{app.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{app.desc}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Button "?" (v10 Standard) */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            title="Bantuan & SOP Operasional (v10)"
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ?
          </button>

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

      {/* Modal Pusat Bantuan & SOP Sistem (v10 Standard) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-[#E30000] border border-red-500/30 flex items-center justify-center text-lg font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pusat Bantuan &amp; Panduan Operasional
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sistem Manajemen Staf &amp; Operasional obeecreatives Studio Kota Batu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Section 1: Presensi Otomatis Harian (v9) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>⏰</span>
                  <span>Absensi Otomatis Harian (SOP v9)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Setiap hari kerja (Senin, Selasa, Rabu, Kamis, dan Sabtu), sistem otomatis mengisi presensi <strong className="text-white">Hadir (09:00 - 17:00)</strong> untuk seluruh staf aktif. Hari Jumat &amp; Minggu otomatis dilewati (libur). Jika ada staf Izin/Sakit/Cuti, Admin cukup mengubah status baris tersebut tanpa menghapus atau membuat ulang.
                </p>
              </div>

              {/* Section 2: Standar Perhitungan Payroll (v8) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>💵</span>
                  <span>Standar Perhitungan Payroll (SOP v8)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Standar kerja bulanan adalah <strong className="text-white">20 hari</strong>. Gaji Pokok &amp; Tunjangan Jabatan merupakan nilai bulanan penuh. Sakit (dengan surat dokter) dan Cuti <strong className="text-emerald-300">TIDAK</strong> memotong gaji. Hanya <strong className="text-red-400">Izin dan Alpha</strong> yang memotong gaji secara harian proporsional (<code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">Nilai Bulanan ÷ 20 hari</code>).
                </p>
              </div>

              {/* Section 3: Integrasi Project Control Fee (v11) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Integrasi Fee Project Control (v11)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Fee konten ditarik langsung dari tab <strong className="text-white">ContentTracker</strong> spreadsheet Project Control berdasarkan tanggal approve, anti dobel-hitung melalui pencatatan FeeIntegrationLog, dan otomatis terkunci (locked) pada payroll tersimpan agar tidak terpengaruh perubahan tarif di kemudian hari.
                </p>
              </div>

              {/* Section 4: Ketentuan Grade Skill */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>Ketentuan Level &amp; Grade Skill</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="font-bold text-white block">C — Creative Trainee</span>
                    <span className="text-[10px] text-slate-400">Magang / Adaptasi SOP</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="font-bold text-white block">B — Junior Creative</span>
                    <span className="text-[10px] text-slate-400">Karier Awal / Produksi</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="font-bold text-white block">A — Creative Specialist</span>
                    <span className="text-[10px] text-slate-400">Mandiri &amp; Multitasking</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="font-bold text-white block">S — Senior Specialist</span>
                    <span className="text-[10px] text-slate-400">Lead Teknis &amp; QA Klien</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="font-bold text-white block">L — Lead Creative</span>
                    <span className="text-[10px] text-slate-400">Supervisi Divisi &amp; Directing</span>
                  </div>
                </div>
              </div>

              {/* Footer Versi */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-emerald-400 font-bold">
                    Versi: v10
                  </span>
                  <span>obeeTOOLS Standard Compliance</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
