import React from 'react';
import { PayrollRecord, StaffUser } from '../types';
import { Printer, Download, X } from 'lucide-react';
import { formatRupiah } from '../utils/geo';

interface PayslipPrintModalProps {
  payroll: PayrollRecord;
  staff: StaffUser;
  onClose: () => void;
}

export const PayslipPrintModal: React.FC<PayslipPrintModalProps> = ({
  payroll,
  staff,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container Box */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between print:hidden shrink-0 bg-slate-950">
          <div className="flex items-center gap-2.5 text-white">
            <Printer className="w-5 h-5 text-[#E30000]" />
            <h3 className="text-sm sm:text-base font-bold">
              Pratinjau Slip Gaji A4 &mdash; {payroll.staffName}
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip A4 Body */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 print:p-0 print:m-0 print:w-full print:h-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b-2 border-[#E30000] pb-4 mb-4">
            <div>
              <div className="text-2xl font-black tracking-tight leading-none">
                <span className="text-black">obee</span>
                <span className="text-[#E30000]">creatives</span>
              </div>
              <div className="text-[10px] text-slate-600 font-semibold mt-1 uppercase tracking-wider">
                Creative Content & Production Agency &middot; Kota Batu, Jawa Timur
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-slate-900 tracking-wide">SLIP GAJI RESMI</div>
              <div className="text-[11px] font-mono text-slate-600">No: {payroll.id}</div>
            </div>
          </div>

          {/* Staff & Period Information Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b border-slate-200">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Nama Staf</span>
                <span className="font-bold text-slate-900">: {payroll.staffName}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Jabatan</span>
                <span className="text-slate-800">: {staff.jobTitle || 'Staf Kreatif'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Divisi</span>
                <span className="text-slate-800">: {staff.department || 'Creative Content'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Rekening Bank</span>
                <span className="text-slate-800 font-mono font-semibold">
                  : {staff.bankAccount?.bankName || '-'} {staff.bankAccount?.accountNumber ? `(${staff.bankAccount.accountNumber})` : ''}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Periode Penggajian</span>
                <span className="font-bold text-slate-900">: {payroll.periodStart} s/d {payroll.periodEnd}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Hari Kerja Standar</span>
                <span className="text-slate-800 font-mono">: {payroll.workDaysStandard} hari</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Kehadiran (Hadir)</span>
                <span className="text-emerald-700 font-bold font-mono">: {payroll.daysPresent} hari</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Hari Izin / Alpha</span>
                <span className="text-[#E30000] font-bold font-mono">: {payroll.daysAbsent} hari (Dipotong)</span>
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="mt-5">
            <div className="text-xs font-bold text-[#E30000] uppercase tracking-wider mb-2.5">
              1. Rincian Penerimaan (Earnings)
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-y border-slate-300">
                  <th className="py-1.5 px-2 font-semibold">Komponen Gaji</th>
                  <th className="py-1.5 px-2 font-semibold text-right">Nilai Pokok</th>
                  <th className="py-1.5 px-2 font-semibold text-center">Volume/Hari</th>
                  <th className="py-1.5 px-2 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                <tr>
                  <td className="py-1.5 px-2 font-sans">
                    Gaji Pokok
                    {payroll.daysAbsent > 0 && (
                      <span className="text-[10px] text-slate-500 block">
                        (Nilai Penuh {formatRupiah(payroll.baseSalaryMonthly)} dipotong {payroll.daysAbsent} hari izin/alpha)
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-right">{formatRupiah(payroll.baseSalaryMonthly)}</td>
                  <td className="py-1.5 px-2 text-center font-sans">{payroll.daysPresent} hari</td>
                  <td className="py-1.5 px-2 text-right font-bold">{formatRupiah(payroll.baseSalaryCalculated)}</td>
                </tr>

                <tr>
                  <td className="py-1.5 px-2 font-sans">
                    Tunjangan Jabatan / Tetap
                    {payroll.daysAbsent > 0 && (
                      <span className="text-[10px] text-slate-500 block">
                        (Nilai Penuh {formatRupiah(payroll.allowanceMonthly)} dipotong {payroll.daysAbsent} hari izin/alpha)
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-right">{formatRupiah(payroll.allowanceMonthly)}</td>
                  <td className="py-1.5 px-2 text-center font-sans">{payroll.daysPresent} hari</td>
                  <td className="py-1.5 px-2 text-right font-bold">{formatRupiah(payroll.allowanceCalculated)}</td>
                </tr>

                {/* Content Fees Breakdown */}
                {payroll.contentFees.map((fee, idx) => (
                  <tr key={idx} className="bg-amber-50/40">
                    <td className="py-1.5 px-2 font-sans">
                      <span className="font-semibold text-slate-900">{fee.label}</span>
                      {fee.isProjectControl && (
                        <span className="text-[10px] text-[#E30000] ml-1.5 font-bold font-sans">
                          &middot; Project Control Approved
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-right">{formatRupiah(fee.rate)}</td>
                    <td className="py-1.5 px-2 text-center font-sans">{fee.qty} konten</td>
                    <td className="py-1.5 px-2 text-right font-bold">{formatRupiah(fee.subtotal)}</td>
                  </tr>
                ))}

                {/* Overtime */}
                {payroll.overtime > 0 && (
                  <tr>
                    <td className="py-1.5 px-2 font-sans">Uang Lembur Produksi</td>
                    <td className="py-1.5 px-2 text-right">-</td>
                    <td className="py-1.5 px-2 text-center font-sans">1 paket</td>
                    <td className="py-1.5 px-2 text-right font-bold">{formatRupiah(payroll.overtime)}</td>
                  </tr>
                )}

                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <td colSpan={3} className="py-2 px-2 font-sans uppercase">Total Gaji Kotor</td>
                  <td className="py-2 px-2 text-right text-slate-900">{formatRupiah(payroll.grossSalary)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deductions Breakdown */}
          <div className="mt-4">
            <div className="text-[11px] font-bold text-[#E30000] uppercase tracking-wider mb-2">
              2. Potongan (Deductions)
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-y border-slate-300">
                  <th className="py-1.5 px-2 font-semibold">Komponen Potongan</th>
                  <th className="py-1.5 px-2 font-semibold text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {payroll.deductions.bpjsKetenagakerjaan > 0 && (
                  <tr>
                    <td className="py-1 px-2 font-sans">BPJS Ketenagakerjaan</td>
                    <td className="py-1 px-2 text-right">{formatRupiah(payroll.deductions.bpjsKetenagakerjaan)}</td>
                  </tr>
                )}
                {payroll.deductions.bpjsKesehatan > 0 && (
                  <tr>
                    <td className="py-1 px-2 font-sans">BPJS Kesehatan</td>
                    <td className="py-1 px-2 text-right">{formatRupiah(payroll.deductions.bpjsKesehatan)}</td>
                  </tr>
                )}
                {payroll.deductions.taxPph21 > 0 && (
                  <tr>
                    <td className="py-1 px-2 font-sans">Pajak PPh 21</td>
                    <td className="py-1 px-2 text-right">{formatRupiah(payroll.deductions.taxPph21)}</td>
                  </tr>
                )}
                {payroll.deductions.loanInstallment > 0 && (
                  <tr>
                    <td className="py-1 px-2 font-sans">Angsuran Pinjaman / Kasbon</td>
                    <td className="py-1 px-2 text-right">{formatRupiah(payroll.deductions.loanInstallment)}</td>
                  </tr>
                )}
                {payroll.deductions.premi > 0 && (
                  <tr>
                    <td className="py-1 px-2 font-sans">Premi Asuransi Lainnya</td>
                    <td className="py-1 px-2 text-right">{formatRupiah(payroll.deductions.premi)}</td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td className="py-1.5 px-2 font-sans uppercase">Total Potongan</td>
                  <td className="py-1.5 px-2 text-right text-red-700">- {formatRupiah(payroll.totalDeduction)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total Net Salary */}
          <div className="mt-4 p-3.5 bg-neutral-900 text-white rounded flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#E30000]">
                Gaji Bersih Yang Dibayarkan (Take-Home Pay)
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Status Pembayaran:{' '}
                <span className="font-bold text-emerald-400 uppercase tracking-wider">
                  {payroll.paymentStatus}
                </span>
                {payroll.paymentDate && <span> &middot; {payroll.paymentDate}</span>}
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-white">
              {formatRupiah(payroll.netSalary)}
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
            <div>
              <div className="text-slate-500">Penerima (Staf),</div>
              <div className="h-14"></div>
              <div className="font-bold text-slate-900 underline">{payroll.staffName}</div>
            </div>

            <div>
              <div className="text-slate-500">Finance & Management,</div>
              <div className="h-14"></div>
              <div className="font-bold text-slate-900 underline">obeecreatives Management</div>
            </div>
          </div>

          <div className="mt-8 text-center text-[9px] text-slate-400">
            Dicetak secara otomatis melalui obeecreatives Staff & HR Operations Portal &middot; Terintegrasi Project Control OS
          </div>
        </div>
      </div>
    </div>
  );
};
