import { AttendanceRecord, PayrollRecord, StaffUser, ExpenseClaim, ProjectAssignment } from '../types';
import { formatRupiah } from './geo';

/**
 * Trigger browser file download with UTF-8 BOM for Excel compatibility
 */
function downloadCsv(content: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * 1. Export Rekap Absensi Staf Bulanan ke CSV / Excel
 */
export function exportAttendanceReport(
  records: AttendanceRecord[],
  staffList: StaffUser[],
  monthLabel: string = 'Bulan Berjalan'
) {
  const headers = [
    'No',
    'ID Presensi',
    'Tanggal',
    'Nama Staf',
    'Departemen / Divisi',
    'Status Kehadiran',
    'Jam Masuk (WIB)',
    'Jam Keluar (WIB)',
    'Mode Kerja',
    'Verifikasi Radius Studio',
    'Jarak ke Studio (Meter)',
    'Keterangan / Catatan',
  ];

  const rows = records.map((r, idx) => {
    const staff = staffList.find((s) => s.id === r.staffId);
    return [
      idx + 1,
      r.id,
      r.date,
      r.staffName,
      staff?.department || '-',
      r.status,
      r.checkInTime || '-',
      r.checkOutTime || '-',
      r.workMode,
      r.verifiedByGeo ? 'VALID (Radius <= 100m)' : 'LUAR RADIUS',
      r.distanceMeters !== undefined ? `${r.distanceMeters} m` : '-',
      r.notes || '-',
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csv = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const filename = `Rekap_Presensi_obeecreatives_${monthLabel.replace(/\s+/g, '_')}.csv`;
  downloadCsv(csv, filename);
}

/**
 * 2. Export Rekapitulasi Payroll & Rincian Transfer Bank ke CSV / Excel
 */
export function exportPayrollReport(
  payrolls: PayrollRecord[],
  staffList: StaffUser[],
  periodLabel: string = 'Periode_Berjalan'
) {
  const headers = [
    'No',
    'ID Payroll',
    'Nama Staf',
    'Departemen',
    'Bank Tujuan',
    'Nomor Rekening',
    'Nama Pemilik Rekening',
    'Periode Mulai',
    'Periode Selesai',
    'Hari Hadir',
    'Hari Absen/Potong',
    'Gaji Pokok Terhitung (Rp)',
    'Tunjangan Terhitung (Rp)',
    'Total Fee Konten & Proyek (Rp)',
    'Lembur (Rp)',
    'Gaji Kotor (Gross Rp)',
    'Total Potongan (Rp)',
    'Gaji Bersih (Net Take Home Pay Rp)',
    'Status Pembayaran',
    'Tanggal Bayar',
  ];

  const rows = payrolls.map((p, idx) => {
    const staff = staffList.find((s) => s.id === p.staffId);
    // Prefix account number with tab so Excel doesn't truncate or convert to scientific notation
    const accNum = staff?.bankAccount?.accountNumber ? `\t${staff.bankAccount.accountNumber}` : '-';

    return [
      idx + 1,
      p.id,
      p.staffName,
      staff?.department || '-',
      staff?.bankAccount?.bankName || 'Belum Terdata',
      accNum,
      staff?.bankAccount?.accountHolder || p.staffName,
      p.periodStart,
      p.periodEnd,
      p.daysPresent,
      p.daysAbsent,
      p.baseSalaryCalculated,
      p.allowanceCalculated,
      p.totalContentFee,
      p.overtime,
      p.grossSalary,
      p.totalDeduction,
      p.netSalary,
      p.paymentStatus,
      p.paymentDate || '-',
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csv = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const filename = `Rekap_Payroll_Transfer_obeecreatives_${periodLabel.replace(/\s+/g, '_')}.csv`;
  downloadCsv(csv, filename);
}

/**
 * 3. Export Rekap Reimbursement & Pengeluaran Lapangan
 */
export function exportExpensesReport(expenses: ExpenseClaim[]) {
  const headers = [
    'No',
    'ID Klaim',
    'Tanggal',
    'Nama Staf',
    'Kategori Biaya',
    'Judul / Keperluan',
    'Nominal (Rp)',
    'Status Approval',
    'Disetujui Oleh',
    'Masuk Slip Gaji?',
    'Catatan',
  ];

  const rows = expenses.map((e, idx) => [
    idx + 1,
    e.id,
    e.date,
    e.staffName,
    e.category,
    e.title,
    e.amount,
    e.status,
    e.approvedBy || '-',
    e.isIncludedInPayroll ? 'YA (Slip Gaji)' : 'TIDAK',
    e.notes || '-',
  ].map(escapeCsv).join(','));

  const csv = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const filename = `Rekap_Reimbursement_obeecreatives_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsv(csv, filename);
}

/**
 * 4. Export Jadwal Proyek & Crew Assignment
 */
export function exportProjectsReport(projects: ProjectAssignment[]) {
  const headers = [
    'No',
    'ID Proyek',
    'Klien',
    'Nama Proyek',
    'Kategori',
    'Tanggal Shoot',
    'Call Time',
    'Lokasi',
    'Status Proyek',
    'Kru Bertugas',
    'Total Budget / Fee (Rp)',
    'Catatan / Brief',
  ];

  const rows = projects.map((prj, idx) => {
    const crewSummary = prj.crew.map((c) => `${c.staffName} (${c.roleInProject})`).join('; ');
    return [
      idx + 1,
      prj.id,
      prj.clientName,
      prj.projectName,
      prj.category,
      prj.shootDate,
      prj.callTime,
      prj.location,
      prj.status,
      crewSummary,
      prj.totalProjectFee || 0,
      prj.notes || '-',
    ].map(escapeCsv).join(',');
  });

  const csv = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const filename = `Jadwal_Shoot_Proyek_obeecreatives_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsv(csv, filename);
}
