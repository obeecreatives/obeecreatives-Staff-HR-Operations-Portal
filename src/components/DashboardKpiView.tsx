import React from 'react';
import {
  StaffUser,
  AttendanceRecord,
  PayrollRecord,
  ProjectAssignment,
  ExpenseClaim,
  LeaveRequest,
  MainTabType,
} from '../types';
import {
  Users,
  CheckCircle2,
  CreditCard,
  Video,
  Receipt,
  Calendar,
  FileSpreadsheet,
  ArrowUpRight,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { formatRupiah, formatDistance } from '../utils/geo';
import { exportAttendanceReport, exportPayrollReport, exportExpensesReport, exportProjectsReport } from '../utils/exportExcel';

interface DashboardKpiViewProps {
  staffList: StaffUser[];
  currentUser: StaffUser;
  attendanceList: AttendanceRecord[];
  payrollList: PayrollRecord[];
  projectsList: ProjectAssignment[];
  expensesList: ExpenseClaim[];
  leavesList: LeaveRequest[];
  currentDistance?: number;
  onNavigateTab: (tab: MainTabType) => void;
}

export const DashboardKpiView: React.FC<DashboardKpiViewProps> = ({
  staffList,
  currentUser,
  attendanceList,
  payrollList,
  projectsList,
  expensesList,
  leavesList,
  currentDistance,
  onNavigateTab,
}) => {
  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);

  // Today's attendance
  const todayRecords = attendanceList.filter((a) => a.date === todayStr);
  const presentCount = todayRecords.filter((a) => a.status === 'Hadir').length;
  const leaveCount = todayRecords.filter((a) => ['Izin', 'Sakit', 'Cuti'].includes(a.status)).length;
  const attendancePercentage = staffList.length > 0 ? Math.round((presentCount / staffList.length) * 100) : 0;

  // Total current payroll estimate
  const totalNetPayroll = payrollList.reduce((acc, p) => acc + (p.netSalary || 0), 0);
  const totalContentFees = payrollList.reduce((acc, p) => acc + (p.totalContentFee || 0), 0);

  // Active projects
  const upcomingProjects = projectsList.filter((p) => p.status === 'Upcoming' || p.status === 'In Progress');

  // Pending expenses & leaves
  const pendingExpenses = expensesList.filter((e) => e.status === 'Pending');
  const pendingExpensesTotal = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingLeaves = leavesList.filter((l) => l.status === 'Pending');

  // Department counts
  const departmentCounts: Record<string, number> = {};
  staffList.forEach((s) => {
    const dept = s.department || 'Other';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#E30000]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E30000]/20 text-[#E30000] border border-[#E30000]/30">
                PORTAL EKSEKUTIF v2.4
              </span>
              <span className="text-xs text-slate-400">Studio Kota Batu</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Halo, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Ringkasan kehadiran operasional tim, call sheet photoshoot, estimasi payroll, dan sinkronisasi data sheet obeecreatives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Presensi Sekarang</span>
            </button>
            <button
              type="button"
              onClick={() => exportPayrollReport(payrollList, staffList)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              title="Download Rekap Payroll Excel (.csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Payroll (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Presensi Hari Ini */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Presensi Hari Ini</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {presentCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {staffList.length} Personel</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold">{attendancePercentage}% Tepat Waktu</span>
            <span className="text-slate-400 group-hover:text-slate-200 flex items-center gap-0.5">
              Detail <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Estimasi Payroll */}
        <div
          onClick={() => onNavigateTab('payroll')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Estimasi Payroll Bulan Ini</span>
            <div className="p-2 bg-[#E30000]/10 text-[#E30000] rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono tracking-tight">
            {formatRupiah(totalNetPayroll)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Termasuk {formatRupiah(totalContentFees)} Fee Konten</span>
            <span className="text-slate-400 group-hover:text-slate-200 flex items-center gap-0.5">
              Buka <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Proyek & Call Sheet */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Jadwal Shoot & Call Sheet</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {upcomingProjects.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Sesi Siap Produksi</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-indigo-400 font-medium">Cek Alat & Kru</span>
            <span className="text-slate-400 group-hover:text-slate-200 flex items-center gap-0.5">
              Call Sheet <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Klaim Reimbursement */}
        <div
          onClick={() => onNavigateTab('payroll')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Klaim Reimbursement</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono tracking-tight">
            {formatRupiah(pendingExpensesTotal)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className={pendingExpenses.length > 0 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
              {pendingExpenses.length} Menunggu Persetujuan
            </span>
            <span className="text-slate-400 group-hover:text-slate-200 flex items-center gap-0.5">
              Kelola <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Quick Action Toolbar + Upcoming Call Sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Project Call Sheets */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#E30000]" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Jadwal Shoot & Produksi Terdekat
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="text-xs text-[#E30000] hover:underline font-semibold flex items-center gap-1"
            >
              Lihat Semua Call Sheet &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {upcomingProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Belum ada jadwal photoshoot / videoshoot aktif.
              </div>
            ) : (
              upcomingProjects.slice(0, 3).map((prj) => (
                <div
                  key={prj.id}
                  onClick={() => onNavigateTab('projects')}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#E30000]/15 text-[#E30000] border border-[#E30000]/30">
                        {prj.category}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{prj.clientName}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold">{prj.projectName}</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {prj.shootDate} ({prj.callTime})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E30000]" />
                        {prj.location}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="text-[11px] text-slate-400">Kru Bertugas:</div>
                    <div className="text-xs font-semibold text-slate-200">
                      {prj.crew.length} Orang Kru
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      {prj.equipmentList.filter((e) => e.checked).length}/{prj.equipmentList.length} Alat Siap
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Exports & Studio Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Export Data Operasional (Excel)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Unduh rekapitulasi data format CSV / Excel kompatibel dengan Google Sheets, Microsoft Excel, dan akunting.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => exportAttendanceReport(attendanceList, staffList)}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Rekap Presensi & Log Lokasi</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => exportPayrollReport(payrollList, staffList)}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#E30000]" />
                  <span>Rekap Payroll & Transfer Bank</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => exportExpensesReport(expensesList)}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>Rekap Klaim Reimbursement</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => exportProjectsReport(projectsList)}
                className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-400" />
                  <span>Jadwal Proyek & Brief Shoot</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Studio Geolocation Card */}
          {currentDistance !== undefined && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E30000]" />
                <span className="text-slate-300">Studio Kota Batu:</span>
              </div>
              <span className="font-mono font-bold text-amber-400">
                {formatDistance(currentDistance)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Team Department Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Distribusi Personel per Divisi
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('directory')}
            className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
          >
            Buka Direktori Staf &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(departmentCounts).map(([dept, count]) => (
            <div
              key={dept}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center"
            >
              <div className="text-lg font-black font-mono text-slate-100">{count}</div>
              <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{dept}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
