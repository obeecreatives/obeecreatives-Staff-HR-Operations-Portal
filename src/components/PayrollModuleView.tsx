import React, { useState } from 'react';
import {
  PayrollRecord,
  StaffUser,
  AttendanceRecord,
  ContentFeeItem,
  GasSyncConfig,
} from '../types';
import {
  Banknote,
  Plus,
  Printer,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Copy,
  Check,
  Share2,
  Sparkles,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { formatRupiah, formatPhoneForWhatsApp } from '../utils/geo';
import { PayslipPrintModal } from './PayslipPrintModal';

interface PayrollModuleViewProps {
  payrollList: PayrollRecord[];
  staffList: StaffUser[];
  attendanceList: AttendanceRecord[];
  contentFees: ContentFeeItem[];
  currentUser: StaffUser;
  gasConfig?: GasSyncConfig;
  onSavePayroll: (record: PayrollRecord) => void;
  onDeletePayroll?: (id: string) => void;
  onUpdatePayrollStatus: (id: string, status: 'Belum' | 'Lunas', paymentDate?: string) => void;
}

export const PayrollModuleView: React.FC<PayrollModuleViewProps> = ({
  payrollList,
  staffList,
  attendanceList,
  contentFees,
  currentUser,
  gasConfig,
  onSavePayroll,
  onDeletePayroll,
  onUpdatePayrollStatus,
}) => {
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('ALL');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [printPayroll, setPrintPayroll] = useState<{ payroll: PayrollRecord; staff: StaffUser } | null>(null);

  // WhatsApp Share Modal State
  const [waModalPayroll, setWaModalPayroll] = useState<{ payroll: PayrollRecord; staff: StaffUser } | null>(null);
  const [waCopied, setWaCopied] = useState(false);

  // Default Staf: Utamakan Adissa Rifdah Aulia jika ada di daftar staf
  const adissaStaff = staffList.find((s) => s.id === 'STF-1785295519572');
  const defaultStaffId = adissaStaff ? adissaStaff.id : (staffList[0]?.id || '');

  // Form Generator State
  const [targetStaffId, setTargetStaffId] = useState(defaultStaffId);
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');
  const [workDaysStandard, setWorkDaysStandard] = useState(20);
  const [periodNotice, setPeriodNotice] = useState<string>('');

  // Target staff reference (Gaji Pokok & Tunjangan Jabatan TERKUNCI MUTLAK dari tab Direktori Staf & Tim)
  const targetStaff = staffList.find((s) => s.id === targetStaffId) || staffList[0];

  // Presensi Kehadiran
  const [daysPresentInput, setDaysPresentInput] = useState<number>(20);
  const [daysAbsentInput, setDaysAbsentInput] = useState<number>(2);

  const [overtime, setOvertime] = useState(0);

  // Deductions
  const [bpjsKetenagakerjaan, setBpjsKetenagakerjaan] = useState(0);
  const [bpjsKesehatan, setBpjsKesehatan] = useState(0);
  const [premi, setPremi] = useState(0);
  const [taxPph21, setTaxPph21] = useState(0);
  const [loanInstallment, setLoanInstallment] = useState(0);
  const [notes, setNotes] = useState('');

  // Pulled content fees & manual components
  const [pulledFees, setPulledFees] = useState<
    { label: string; rate: number; qty: number; subtotal: number; contentIds: string[]; isProjectControl: boolean }[]
  >([]);
  const [isPullingFee, setIsPullingFee] = useState(false);
  const [pullMsg, setPullMsg] = useState('');

  // Manual component form toggle
  const [showAddManualComp, setShowAddManualComp] = useState(false);
  const [manualCompLabel, setManualCompLabel] = useState('');
  const [manualCompRate, setManualCompRate] = useState<number>(0);
  const [manualCompQty, setManualCompQty] = useState<number>(1);

  // Fungsi sinkronisasi otomatis data presensi dan fee berdasarkan periode dan staf
  const syncPeriodData = (staffId: string, start: string, end: string) => {
    const staff = staffList.find((s) => s.id === staffId);
    const att = attendanceList.filter(
      (a) => a.staffId === staffId && a.date >= start && a.date <= end
    );
    const pres = att.filter((a) => a.status === 'Hadir').length;
    const abs = att.filter((a) => a.status === 'Izin' || a.status === 'Alpha').length;

    if (att.length > 0) {
      setDaysPresentInput(pres);
      setDaysAbsentInput(abs);
      setPeriodNotice(
        `✓ Memuat presensi ${staff?.name || ''} (${start} s/d ${end}): ${pres} Hadir, ${abs} Izin/Alpha.`
      );
    } else {
      // Periode tanpa riwayat log presensi (misal Oktober 2026 atau bulan baru):
      // Menggunakan standar hari kerja penuh (20 hari hadir, 0 hari izin/alpha)
      setDaysPresentInput(workDaysStandard);
      setDaysAbsentInput(0);
      setPeriodNotice(
        `ℹ Periode ${start} s/d ${end} dimuat: Standar 20 Hadir, 0 Izin (Gaji Pokok & Tunjangan diterima penuh 100%).`
      );
    }

    // Sinkronkan juga fee konten Project Control pada periode yang bersangkutan
    autoSyncContentFees(staffId, start, end);
  };

  // Sinkronisasi otomatis fee Project Control
  const autoSyncContentFees = (staffId: string, start: string, end: string) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;
    const staffNameLower = staff.name.toLowerCase().trim();
    const eligible = contentFees.filter((item) => {
      const matchCreator =
        item.creatorName.toLowerCase().trim() === staffNameLower ||
        item.creatorName.toLowerCase().includes(staffNameLower.split(' ')[0]);
      const inDate = item.approvedDate >= start && item.approvedDate <= end;
      const validFee = item.feeAmount > 0;
      return matchCreator && inDate && validFee;
    });

    if (eligible.length === 0) {
      setPulledFees([]);
      setPullMsg(`Tidak ada klaim fee konten komersial untuk ${staff.name} pada periode ${start} s/d ${end}.`);
    } else {
      const grouped: Record<string, { total: number; count: number; ids: string[] }> = {};
      eligible.forEach((item) => {
        const type = item.contentType || 'Lain-lain';
        if (!grouped[type]) {
          grouped[type] = { total: 0, count: 0, ids: [] };
        }
        grouped[type].total += item.feeAmount;
        grouped[type].count += 1;
        grouped[type].ids.push(item.id);
      });

      const items = Object.keys(grouped).map((type) => {
        const g = grouped[type];
        const rate = Math.round(g.total / g.count);
        return {
          label: `Fee Konten - ${type}`,
          rate: rate,
          qty: g.count,
          subtotal: g.total,
          contentIds: g.ids,
          isProjectControl: true,
        };
      });
      setPulledFees(items);
      setPullMsg(`✓ Menarik ${eligible.length} konten komersial (${formatRupiah(eligible.reduce((s, c) => s + c.feeAmount, 0))}) dari Project Control periode ini.`);
    }
  };

  // Handler saat Staf dipilih
  const handleSelectStaff = (id: string) => {
    setTargetStaffId(id);
    syncPeriodData(id, periodStart, periodEnd);
    setShowAddManualComp(false);
  };

  // Handler saat Periode Awal diubah
  const handlePeriodStartChange = (newStart: string) => {
    setPeriodStart(newStart);
    syncPeriodData(targetStaffId, newStart, periodEnd);
  };

  // Handler saat Periode Akhir diubah
  const handlePeriodEndChange = (newEnd: string) => {
    setPeriodEnd(newEnd);
    syncPeriodData(targetStaffId, periodStart, newEnd);
  };

  // Handler reload data periode
  const handleReloadPeriodData = () => {
    syncPeriodData(targetStaffId, periodStart, periodEnd);
  };

  // Sinkronkan manual dari data presensi GPS
  const handleSyncFromGpsAttendance = () => {
    syncPeriodData(targetStaffId, periodStart, periodEnd);
  };

  // Helper tambah komponen manual
  const handleAddManualComponent = () => {
    if (!manualCompLabel.trim()) return;
    const qty = Math.max(1, manualCompQty);
    const rate = Math.max(0, manualCompRate);
    setPulledFees((prev) => [
      ...prev,
      {
        label: manualCompLabel.trim(),
        rate: rate,
        qty: qty,
        subtotal: rate * qty,
        contentIds: [],
        isProjectControl: false,
      },
    ]);
    setManualCompLabel('');
    setManualCompRate(0);
    setManualCompQty(1);
    setShowAddManualComp(false);
  };

  const handleRemoveComponent = (idx: number) => {
    setPulledFees((prev) => prev.filter((_, i) => i !== idx));
  };

  // Formula v8/v11 calculation: Gaji Pokok & Tunjangan TERKUNCI dari targetStaff di tab Direktori Staf
  // Pemotongan izin/alpha memotong proporsional Gaji Pokok & Tunjangan Jabatan sesuai standar hari kerja
  const baseSalaryMonthly = targetStaff?.baseSalary || 0;
  const allowanceMonthly = targetStaff?.allowance || 0;
  const daysPresent = daysPresentInput;
  const daysAbsent = daysAbsentInput;

  const deductionPerDayBase = workDaysStandard > 0 ? baseSalaryMonthly / workDaysStandard : 0;
  const deductionPerDayAllowance = workDaysStandard > 0 ? allowanceMonthly / workDaysStandard : 0;

  const potonganGajiPokok = Math.round(deductionPerDayBase * daysAbsent);
  const potonganTunjangan = Math.round(deductionPerDayAllowance * daysAbsent);

  const baseSalaryCalculated = Math.max(
    0,
    baseSalaryMonthly - potonganGajiPokok
  );
  const allowanceCalculated = Math.max(
    0,
    allowanceMonthly - potonganTunjangan
  );

  const totalContentFee = pulledFees.reduce((sum, f) => sum + f.subtotal, 0);
  const grossSalary = baseSalaryCalculated + allowanceCalculated + totalContentFee + overtime;
  const totalDeduction = bpjsKetenagakerjaan + bpjsKesehatan + premi + taxPph21 + loanInstallment;
  const netSalary = Math.max(0, grossSalary - totalDeduction);

  // Function to pull fee from Project Control (Live GAS Webhook with local fallback)
  const handlePullContentFees = async () => {
    if (!targetStaff) return;
    setIsPullingFee(true);
    setPullMsg('');

    // 1. Coba tarik via live Google Apps Script jika Webhook aktif
    if (gasConfig?.gasWebhookUrl) {
      try {
        const queryUrl = `${gasConfig.gasWebhookUrl}?action=pullProjectControlFees&staffName=${encodeURIComponent(targetStaff.name)}&startDate=${periodStart}&endDate=${periodEnd}`;
        const proxyRes = await fetch(`/api/gas-proxy?url=${encodeURIComponent(queryUrl)}`);
        const json = await proxyRes.json();

        if (json.success && Array.isArray(json.feeItems) && json.feeItems.length > 0) {
          setPulledFees(json.feeItems);
          setPullMsg(`✓ Live Sync: Menarik ${json.feeItems.length} kelompok fee (${formatRupiah(json.totalSum)}) langsung dari Google Spreadsheet Project Control.`);
          setIsPullingFee(false);
          return;
        }
      } catch (err) {
        console.warn('Live GAS fee pull fallback to local cache:', err);
      }
    }

    // 2. Fallback ke data cache Project Control
    const staffNameLower = targetStaff.name.toLowerCase().trim();
    const eligible = contentFees.filter((item) => {
      const matchCreator =
        item.creatorName.toLowerCase().trim() === staffNameLower ||
        item.creatorName.toLowerCase().includes(staffNameLower.split(' ')[0]);
      const inDate = item.approvedDate >= periodStart && item.approvedDate <= periodEnd;
      const validFee = item.feeAmount > 0;
      return matchCreator && inDate && validFee;
    });

    if (eligible.length === 0) {
      setPullMsg(`Tidak ada konten bersyarat fee baru untuk ${targetStaff.name} pada periode ${periodStart} s/d ${periodEnd}.`);
      setPulledFees([]);
      setIsPullingFee(false);
      return;
    }

    const grouped: Record<string, { total: number; count: number; ids: string[] }> = {};
    eligible.forEach((item) => {
      const type = item.contentType || 'Lain-lain';
      if (!grouped[type]) {
        grouped[type] = { total: 0, count: 0, ids: [] };
      }
      grouped[type].total += item.feeAmount;
      grouped[type].count += 1;
      grouped[type].ids.push(item.id);
    });

    const items = Object.keys(grouped).map((type) => {
      const g = grouped[type];
      const rate = Math.round(g.total / g.count);
      return {
        label: `Fee Konten - ${type}`,
        rate: rate,
        qty: g.count,
        subtotal: g.total,
        contentIds: g.ids,
        isProjectControl: true,
      };
    });

    setPulledFees(items);
    setPullMsg(`✓ Cache Sync: Memuat ${eligible.length} konten komersial (${formatRupiah(eligible.reduce((s, c) => s + c.feeAmount, 0))}) dari Project Control.`);
    setIsPullingFee(false);
  };

  const handleSaveNewPayroll = () => {
    if (!targetStaff) return;

    const newRec: PayrollRecord = {
      id: 'PAY-' + Date.now(),
      staffId: targetStaff.id,
      staffName: targetStaff.name,
      periodStart: periodStart,
      periodEnd: periodEnd,
      workDaysStandard: workDaysStandard,
      daysPresent: daysPresent,
      daysAbsent: daysAbsent,
      baseSalaryMonthly: baseSalaryMonthly,
      allowanceMonthly: allowanceMonthly,
      baseSalaryCalculated: baseSalaryCalculated,
      allowanceCalculated: allowanceCalculated,
      contentFees: pulledFees,
      totalContentFee: totalContentFee,
      overtime: overtime,
      grossSalary: grossSalary,
      deductions: {
        bpjsKetenagakerjaan: bpjsKetenagakerjaan,
        bpjsKesehatan: bpjsKesehatan,
        premi: premi,
        taxPph21: taxPph21,
        loanInstallment: loanInstallment,
      },
      totalDeduction: totalDeduction,
      netSalary: netSalary,
      paymentStatus: 'Belum',
      notes: notes,
      createdAt: new Date().toISOString(),
    };

    onSavePayroll(newRec);
    setShowGenerateModal(false);
    setPulledFees([]);
    setPullMsg('');
  };

  const buildWhatsAppMessage = (payroll: PayrollRecord, staff: StaffUser) => {
    const feeLines =
      payroll.contentFees.length > 0
        ? payroll.contentFees.map((f) => `  • ${f.label} (${f.qty}x): ${formatRupiah(f.subtotal)}`).join('\n')
        : '  • Tidak ada klaim fee konten periode ini';

    return `*SLIP GAJI RESMI - OBEECREATIVES*
Periode: ${payroll.periodStart} s/d ${payroll.periodEnd}
Nama: ${staff.name} (${staff.jobTitle || 'Staf Kreatif'})
Divisi: ${staff.department || '-'}

*Rincian Penerimaan (Earnings):*
• Gaji Pokok: ${formatRupiah(payroll.baseSalaryCalculated)}
• Tunjangan Jabatan: ${formatRupiah(payroll.allowanceCalculated)}
• Fee Konten Project Control (${formatRupiah(payroll.totalContentFee)}):
${feeLines}
${payroll.overtime > 0 ? `• Lembur: ${formatRupiah(payroll.overtime)}\n` : ''}• *Total Gaji Kotor:* ${formatRupiah(payroll.grossSalary)}

*Potongan Kehadiran & Lainnya:*
• Kehadiran: ${payroll.daysPresent} Hari Hadir / ${payroll.daysAbsent} Hari Izin/Alpha
• *Total Potongan:* -${formatRupiah(payroll.totalDeduction)}

*TOTAL GAJI BERSIH DITERIMA:*
*${formatRupiah(payroll.netSalary)}*

*Rekening Tujuan Transfer:*
${staff.bankAccount?.bankName || 'Bank'} : ${staff.bankAccount?.accountNumber || '-'}
a/n ${staff.bankAccount?.accountHolder || staff.name}
Status: *${payroll.paymentStatus === 'Lunas' ? 'LUNAS' : 'SEDANG DIPROSES'}*

_Diterbitkan secara resmi oleh Manajemen & Finance obeecreatives._`;
  };

  const filteredPayroll = payrollList.filter((p) => {
    return selectedStaffFilter === 'ALL' || p.staffId === selectedStaffFilter;
  });

  // Summary Metrics
  const totalPayrollAmount = filteredPayroll.reduce((acc, p) => acc + p.netSalary, 0);
  const totalFeeAmount = filteredPayroll.reduce((acc, p) => acc + p.totalContentFee, 0);
  const countLunas = filteredPayroll.filter((p) => p.paymentStatus === 'Lunas').length;
  const countBelum = filteredPayroll.filter((p) => p.paymentStatus === 'Belum').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Zone */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[#E30000]" />
              Modul Rekap Gaji &amp; Fee Konten
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Perhitungan slip gaji otomatis, integrasi fee konten komersial Project Control, pemotongan izin/alpha standar 20 hari, dan cetak slip PDF resmi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const staff = staffList.find((s) => s.id === 'STF-1785295519572') || staffList[0];
                const sId = staff?.id || defaultStaffId;
                setTargetStaffId(sId);
                syncPeriodData(sId, periodStart, periodEnd);
                setShowAddManualComp(false);
                setShowGenerateModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Slip Gaji Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Payroll Diterbitkan
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {formatRupiah(totalPayrollAmount)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {filteredPayroll.length} slip gaji tercatat
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Fee Konten Project Control
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {formatRupiah(totalFeeAmount)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Klaim konten approved
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Status Pembayaran
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-emerald-400 font-mono">{countLunas} Lunas</span>
            <span className="text-slate-600">&middot;</span>
            <span className="text-sm font-bold text-red-400 font-mono">{countBelum} Belum</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Kelola status di tabel
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Standar Hari Kerja (Formula v8/v11)
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            20 Hari / Bulan
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Izin &amp; Alpha memotong gaji harian
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Staf:</span>
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-[#E30000]"
          >
            <option value="ALL">Semua Staf ({payrollList.length})</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Total Slip Tercatat:{' '}
          <strong className="text-white font-mono">{filteredPayroll.length}</strong>
        </div>
      </div>

      {/* Payroll Records List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[980px]">
            <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider text-xs border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 font-bold">Nama Staf</th>
                <th className="py-4 px-4 font-bold">Periode Penggajian</th>
                <th className="py-4 px-4 font-bold text-center">Kehadiran (Hadir / Izin)</th>
                <th className="py-4 px-4 font-bold text-right">Gaji Pokok + Tunj.</th>
                <th className="py-4 px-4 font-bold text-right">Fee Konten</th>
                <th className="py-4 px-4 font-bold text-right">Gaji Bersih</th>
                <th className="py-4 px-4 font-bold text-center">Status</th>
                <th className="py-4 px-4 font-bold text-center">Aksi &amp; Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredPayroll.map((payroll) => {
                const staff = staffList.find((s) => s.id === payroll.staffId) || {
                  id: payroll.staffId,
                  name: payroll.staffName,
                  email: '',
                  role: 'staff_creator',
                };

                return (
                  <tr key={payroll.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-base">{payroll.staffName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {payroll.id}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-sm">
                      <div className="text-slate-200 font-semibold">
                        {payroll.periodStart} &rarr; {payroll.periodEnd}
                      </div>
                      <div className="text-xs text-slate-500 font-sans mt-0.5">
                        Standar {payroll.workDaysStandard || 20} hari kerja
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono tabular-nums text-sm">
                      <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                        {payroll.daysPresent} Hadir
                      </span>
                      <span className="text-slate-500 mx-1.5">&middot;</span>
                      <span className="text-amber-400 font-bold bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
                        {payroll.daysAbsent} Izin
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-sm tabular-nums text-slate-200 font-semibold">
                      {formatRupiah(payroll.baseSalaryCalculated + payroll.allowanceCalculated)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400 text-sm tabular-nums">
                      {formatRupiah(payroll.totalContentFee)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-base sm:text-lg tabular-nums">
                      {formatRupiah(payroll.netSalary)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = payroll.paymentStatus === 'Lunas' ? 'Belum' : 'Lunas';
                          const today = new Date().toISOString().slice(0, 10);
                          onUpdatePayrollStatus(payroll.id, newStatus, newStatus === 'Lunas' ? today : undefined);
                          if (newStatus === 'Lunas') {
                            setWaModalPayroll({ payroll, staff: staff as StaffUser });
                          }
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${
                          payroll.paymentStatus === 'Lunas'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 hover:bg-emerald-900'
                            : 'bg-red-950 text-red-400 border border-red-700 hover:bg-red-900'
                        }`}
                        title="Klik untuk ubah status Lunas / Belum"
                      >
                        {payroll.paymentStatus === 'Lunas' ? '✓ Lunas' : 'Belum Lunas'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Tombol Cetak PDF A4 */}
                        <button
                          type="button"
                          onClick={() => setPrintPayroll({ payroll, staff: staff as StaffUser })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-semibold transition-colors border border-slate-700 shadow-xs"
                          title="Pratinjau & Cetak Slip Gaji A4"
                        >
                          <Printer className="w-4 h-4 text-[#E30000]" />
                          <span>Slip Gaji</span>
                        </button>

                        {/* WhatsApp Notify */}
                        <button
                          type="button"
                          onClick={() => setWaModalPayroll({ payroll, staff: staff as StaffUser })}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded text-xs font-semibold transition-colors shadow-xs"
                          title="Kirim Notifikasi Slip ke WA"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WA</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayroll.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-400">
            Belum ada slip gaji yang dibuat. Klik tombol &ldquo;Buat Slip Gaji Baru&rdquo; di atas untuk memulai.
          </div>
        )}
      </div>

      {/* MODAL GENERATOR PAYROLL - SPASIOUS EXTRA-WIDE VIEWPORT (max-w-7xl, tidak ada kolom terpotong) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-7xl xl:max-w-[1440px] w-[96vw] shadow-2xl overflow-hidden max-h-[94vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-950/80 border border-red-800 rounded-lg text-[#E30000]">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>Buat Rekap Slip Gaji Baru</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Formula Resmi v8/v11
                    </span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Gaji Pokok &amp; Tunjangan terkunci otomatis dari profil Direktori Staf &middot; Integrasi Fee Konten Project Control &amp; Presensi GPS
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                title="Tutup dialog"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - 2 Columns Grid */}
            <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* KOLOM KIRI (7/12): Identitas, Parameter Kehadiran, & Komponen Tambahan */}
                <div className="lg:col-span-7 space-y-6">
                  {/* 1. Periode & Staff */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-[#E30000] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-xs text-red-400">1</span>
                      <span>Periode &amp; Staf Penerima Gaji</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-100 block mb-1.5">Pilih Staf *</label>
                        <select
                          value={targetStaffId}
                          onChange={(e) => handleSelectStaff(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm sm:text-base font-semibold text-slate-100 focus:outline-none focus:border-[#E30000]"
                        >
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.department || '-'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-100 block mb-1.5">Periode Awal *</label>
                        <input
                          type="date"
                          value={periodStart}
                          onChange={(e) => handlePeriodStartChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm sm:text-base font-mono text-slate-100 focus:outline-none focus:border-[#E30000]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-100 block mb-1.5">Periode Akhir *</label>
                        <input
                          type="date"
                          value={periodEnd}
                          onChange={(e) => handlePeriodEndChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm sm:text-base font-mono text-slate-100 focus:outline-none focus:border-[#E30000]"
                        />
                      </div>
                    </div>

                    {/* Quick Period Switcher & Sync Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleReloadPeriodData}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 rounded text-xs font-semibold transition-colors shadow-xs"
                          title="Muat ulang presensi dan fee periode ini"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>⟳ Muat Data Periode Ini</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPeriodStart('2026-09-01');
                            setPeriodEnd('2026-09-30');
                            syncPeriodData(targetStaffId, '2026-09-01', '2026-09-30');
                          }}
                          className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                            periodStart === '2026-09-01' && periodEnd === '2026-09-30'
                              ? 'bg-red-950 text-red-200 border-red-700 font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          September 2026
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPeriodStart('2026-10-01');
                            setPeriodEnd('2026-10-31');
                            syncPeriodData(targetStaffId, '2026-10-01', '2026-10-31');
                          }}
                          className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                            periodStart === '2026-10-01' && periodEnd === '2026-10-31'
                              ? 'bg-emerald-950 text-emerald-200 border-emerald-700 font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          Oktober 2026
                        </button>
                      </div>

                      {periodNotice && (
                        <div className="text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1 rounded border border-slate-800">
                          {periodNotice}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Gaji Pokok & Tunjangan Terkunci (MUTLAK DARI TAB DIREKTORI STAF & TIM - TANPA DROPDOWN) */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xs text-emerald-400 font-bold shrink-0">2</span>
                        <div>
                          <div className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>Gaji Pokok &amp; Tunjangan Jabatan</span>
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                              <Lock className="w-3 h-3 text-emerald-400" />
                              TERKUNCI MUTLAK
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Sesuai SOP Keuangan obeecreatives: Terkunci dari tab Direktori Staf &amp; Tim (tidak ada opsi dropdown / edit manual).
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSyncFromGpsAttendance}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
                        title="Tarik data presensi GPS periode terpilih"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>⟳ Tarik dari Presensi GPS</span>
                      </button>
                    </div>

                    {/* Visual Card Gaji Pokok & Tunjangan Jabatan Terkunci */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Kartu Gaji Pokok */}
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Gaji Pokok Master
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                            <Lock className="w-3 h-3" /> Locked Profile
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                          {formatRupiah(baseSalaryMonthly)}
                        </div>
                        
                        <div className="pt-2 border-t border-slate-900 space-y-1.5 text-xs">
                          {daysAbsent > 0 ? (
                            <div className="flex justify-between items-center text-red-400">
                              <span>Potongan Izin ({daysAbsent} hr &times; {formatRupiah(deductionPerDayBase)}):</span>
                              <span className="font-mono font-bold">- {formatRupiah(potonganGajiPokok)}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Potongan Izin/Alpha:</span>
                              <span className="font-mono text-emerald-400 font-bold">Rp 0 (Kehadiran Penuh)</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-slate-200 font-semibold pt-1 border-t border-slate-900/60">
                            <span>Gaji Pokok Diterima:</span>
                            <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                              {formatRupiah(baseSalaryCalculated)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Kartu Tunjangan Jabatan */}
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Tunjangan Jabatan Master
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                            <Lock className="w-3 h-3" /> Locked Profile
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                          {formatRupiah(allowanceMonthly)}
                        </div>
                        
                        <div className="pt-2 border-t border-slate-900 space-y-1.5 text-xs">
                          {daysAbsent > 0 ? (
                            <div className="flex justify-between items-center text-red-400">
                              <span>Potongan Izin ({daysAbsent} hr &times; {formatRupiah(deductionPerDayAllowance)}):</span>
                              <span className="font-mono font-bold">- {formatRupiah(potonganTunjangan)}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Potongan Izin/Alpha:</span>
                              <span className="font-mono text-emerald-400 font-bold">Rp 0 (Kehadiran Penuh)</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-slate-200 font-semibold pt-1 border-t border-slate-900/60">
                            <span>Tunjangan Diterima:</span>
                            <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                              {formatRupiah(allowanceCalculated)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Parameter Presensi & Perhitungan Hari Kerja */}
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                          Log Presensi Periode Ini (Standar {workDaysStandard} Hari Kerja)
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono self-start sm:self-auto">
                          {daysAbsent > 0
                            ? `Presensi: ${daysPresent}H Hadir · ${daysAbsent}H Izin (Gaji Terpotong)`
                            : `Presensi: ${daysPresent}H Hadir (Kehadiran Penuh 100%)`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-slate-200 block mb-1">
                            Jumlah Hari Hadir (hari)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="31"
                            value={daysPresentInput}
                            onChange={(e) => setDaysPresentInput(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-2xl font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
                          />
                          <span className="text-xs text-slate-400 mt-1 block">
                            Standar kerja: {workDaysStandard} hari per bulan.
                          </span>
                        </div>

                        <div>
                          <label className="text-sm font-bold text-slate-200 block mb-1">
                            Jumlah Hari Izin / Alpha (hari)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="31"
                            value={daysAbsentInput}
                            onChange={(e) => setDaysAbsentInput(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono text-2xl font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                          />
                          <span className="text-xs text-slate-400 mt-1 block">
                            {daysAbsentInput > 0
                              ? `Memotong ${formatRupiah(deductionPerDayBase + deductionPerDayAllowance)}/hari dari Pokok & Tunjangan`
                              : '0 hari (Gaji Pokok & Tunjangan diterima penuh 100%)'}
                          </span>
                        </div>
                      </div>

                      {/* Rincian Pemotongan Kehadiran */}
                      <div className="mt-3 pt-3.5 border-t border-slate-800/80 space-y-2 text-xs sm:text-sm font-sans text-slate-300">
                        <div className="flex justify-between items-center">
                          <span>Potongan Gaji Pokok ({daysAbsent} hr &times; {formatRupiah(deductionPerDayBase)}/hari):</span>
                          <span className="font-mono text-red-400 font-bold">
                            - {formatRupiah(potonganGajiPokok)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Potongan Tunjangan ({daysAbsent} hr &times; {formatRupiah(deductionPerDayAllowance)}/hari):</span>
                          <span className="font-mono text-red-400 font-bold">
                            - {formatRupiah(potonganTunjangan)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-slate-100 font-semibold">
                          <span>Subtotal Gaji Tetap Bersih (Pokok + Tunjangan):</span>
                          <span className="font-mono text-emerald-400 text-base font-bold">
                            {formatRupiah(baseSalaryCalculated + allowanceCalculated)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Komponen Tambahan & Fee Konten Project Control */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="text-sm font-bold text-[#E30000] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-xs text-amber-400">3</span>
                      <span>Fee Konten Project Control &amp; Komponen Tambahan</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handlePullContentFees}
                        disabled={isPullingFee}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-60 shadow-xs"
                      >
                        <RefreshCw className={`w-4 h-4 ${isPullingFee ? 'animate-spin' : ''}`} />
                        <span>{isPullingFee ? 'Menarik...' : '⟳ Tarik Fee dari Project Control'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAddManualComp(!showAddManualComp)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>+ Tambah Komponen Manual</span>
                      </button>
                    </div>

                    {pullMsg && (
                      <div className="text-xs sm:text-sm text-amber-300 bg-amber-950/60 p-3 rounded-lg border border-amber-900 leading-relaxed font-mono">
                        {pullMsg}
                      </div>
                    )}

                    {/* Inline Form Tambah Komponen Manual */}
                    {showAddManualComp && (
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                        <div className="font-bold text-white text-sm">Tambah Komponen / Fee Manual:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="cth: Bonus Performa / Fee Desain"
                            value={manualCompLabel}
                            onChange={(e) => setManualCompLabel(e.target.value)}
                            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Qty (cth: 1)"
                            value={manualCompQty}
                            onChange={(e) => setManualCompQty(Number(e.target.value))}
                            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Rate (Rp)"
                            value={manualCompRate || ''}
                            onChange={(e) => setManualCompRate(Number(e.target.value))}
                            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddManualComp(false)}
                            className="px-3.5 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={handleAddManualComponent}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs"
                          >
                            Tambahkan
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Daftar Komponen Tambahan Aktif */}
                    {pulledFees.length > 0 && (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {pulledFees.map((fee, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleRemoveComponent(idx)}
                                className="text-slate-500 hover:text-red-400 p-1.5 rounded"
                                title="Hapus komponen ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div>
                                <div className="font-bold text-slate-200 text-sm">{fee.label}</div>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">
                                  {fee.qty} item &times; {formatRupiah(fee.rate)}
                                </div>
                              </div>
                            </div>
                            <div className="font-mono font-bold text-amber-400 text-base sm:text-lg">
                              {formatRupiah(fee.subtotal)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* KOLOM KANAN (5/12): Lembur, Potongan, Catatan, & Ringkasan Gaji Bersih */}
                <div className="lg:col-span-5 space-y-6 lg:pl-6 lg:border-l lg:border-slate-800/80 flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* 4. Lembur & Potongan */}
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-[#E30000] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-300">4</span>
                        <span>Lembur &amp; Potongan Resmi</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-sm font-bold text-slate-200 block mb-1">
                            Lembur Kerja (Rp)
                          </label>
                          <input
                            type="number"
                            value={overtime}
                            onChange={(e) => setOvertime(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 text-base font-semibold focus:outline-none focus:border-[#E30000]"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-300 block mb-1">
                            BPJS Naker (Rp)
                          </label>
                          <input
                            type="number"
                            value={bpjsKetenagakerjaan}
                            onChange={(e) => setBpjsKetenagakerjaan(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 text-sm focus:outline-none focus:border-[#E30000]"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-300 block mb-1">
                            BPJS Sehat (Rp)
                          </label>
                          <input
                            type="number"
                            value={bpjsKesehatan}
                            onChange={(e) => setBpjsKesehatan(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 text-sm focus:outline-none focus:border-[#E30000]"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-300 block mb-1">
                            PPh 21 (Rp)
                          </label>
                          <input
                            type="number"
                            value={taxPph21}
                            onChange={(e) => setTaxPph21(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 text-sm focus:outline-none focus:border-[#E30000]"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-300 block mb-1">
                            Angsuran Pinjaman (Rp)
                          </label>
                          <input
                            type="number"
                            value={loanInstallment}
                            onChange={(e) => setLoanInstallment(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 text-sm focus:outline-none focus:border-[#E30000]"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-sm font-semibold text-slate-300 block mb-1">
                            Premi Asuransi Lain (Rp)
                          </label>
                          <input
                            type="number"
                            value={premi}
                            onChange={(e) => setPremi(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-100 text-sm focus:outline-none focus:border-[#E30000]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 5. Catatan Slip */}
                    <div>
                      <label className="text-sm font-bold text-slate-200 block mb-1">
                        Catatan Slip Gaji (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="cth: Gaji periode September & fee 2 konten approved"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-[#E30000]"
                      />
                    </div>
                  </div>

                  {/* 6. Kartu Total Gaji Bersih (Take-Home Pay dengan Font Besar & Elegan) */}
                  <div className="p-6 bg-slate-950 border-2 border-slate-800 rounded-xl space-y-4 font-mono shadow-xl">
                    <div className="flex justify-between text-slate-300 text-sm font-sans">
                      <span className="font-semibold">Total Penghasilan Kotor:</span>
                      <span className="font-bold font-mono text-white text-lg">
                        {formatRupiah(grossSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 text-sm font-sans">
                      <span className="font-semibold">Total Potongan:</span>
                      <span className="text-red-400 font-bold font-mono text-lg">
                        - {formatRupiah(totalDeduction)}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <div className="text-xs text-slate-400 uppercase font-sans font-bold tracking-wider">
                        Gaji Bersih Diterima (Take-Home Pay)
                      </div>
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 mt-1 tracking-tight">
                        {formatRupiah(netSalary)}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-900 text-xs text-slate-300 font-sans leading-relaxed">
                      Rekening Transfer Tujuan:{' '}
                      <span className="text-white font-mono font-bold text-sm block mt-0.5">
                        {targetStaff?.bankAccount?.bankName || 'Bank'} &mdash;{' '}
                        {targetStaff?.bankAccount?.accountNumber || '-'}
                      </span>
                      <div className="text-xs text-slate-400 mt-0.5 font-sans">
                        a/n {targetStaff?.bankAccount?.accountHolder || targetStaff?.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-950">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewPayroll}
                className="px-6 py-2.5 bg-[#E30000] hover:bg-red-700 text-white font-bold rounded-lg text-sm shadow-md transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan &amp; Kunci Slip Gaji</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT SLIP GAJI MODAL */}
      {printPayroll && (
        <PayslipPrintModal
          payroll={printPayroll.payroll}
          staff={printPayroll.staff}
          onClose={() => setPrintPayroll(null)}
        />
      )}

      {/* WHATSAPP SHARE & NOTIFICATION MODAL */}
      {waModalPayroll && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
              <div className="flex items-center gap-2 text-white">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Kirim Notifikasi Slip Gaji WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setWaModalPayroll(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded">
                <div>
                  <div className="font-bold text-white text-sm">{waModalPayroll.staff.name}</div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                    No. WA: {waModalPayroll.staff.phone || '(Belum ada nomor WA)'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Total Transfer:</div>
                  <div className="text-emerald-400 font-mono font-bold text-sm">
                    {formatRupiah(waModalPayroll.payroll.netSalary)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1.5">
                  Pratinjau Pesan Resmi Slip Gaji:
                </label>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {buildWhatsAppMessage(waModalPayroll.payroll, waModalPayroll.staff)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
              <button
                type="button"
                onClick={() => {
                  const text = buildWhatsAppMessage(waModalPayroll.payroll, waModalPayroll.staff);
                  navigator.clipboard.writeText(text);
                  setWaCopied(true);
                  setTimeout(() => setWaCopied(false), 2000);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                {waCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{waCopied ? 'Pesan Disalin!' : 'Salin Teks WA'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWaModalPayroll(null)}
                  className="px-3 py-2 text-slate-400 hover:text-white text-xs"
                >
                  Tutup
                </button>

                {waModalPayroll.staff.phone ? (
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(waModalPayroll.staff.phone)}?text=${encodeURIComponent(
                      buildWhatsAppMessage(waModalPayroll.payroll, waModalPayroll.staff)
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka WhatsApp Web</span>
                  </a>
                ) : (
                  <span className="text-slate-500 text-[11px]">Masukkan nomor WA di Direktori Staf</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
