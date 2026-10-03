import React, { useState } from 'react';
import { ExpenseClaim, StaffUser, ExpenseCategory } from '../types';
import {
  Receipt,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  FileSpreadsheet,
  Trash2,
  CreditCard,
  X,
  ExternalLink,
  DollarSign,
  Filter,
} from 'lucide-react';
import { formatRupiah } from '../utils/geo';
import { exportExpensesReport } from '../utils/exportExcel';

interface ExpenseClaimsViewProps {
  expensesList: ExpenseClaim[];
  staffList: StaffUser[];
  currentUser: StaffUser;
  onSaveExpense: (expense: ExpenseClaim) => void;
  onUpdateExpense: (expense: ExpenseClaim) => void;
  onDeleteExpense: (id: string) => void;
  onIncludeInPayroll?: (expense: ExpenseClaim) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Bensin & Transport Shoot',
  'Tiket Lokasi / Izin Lokasi',
  'Konsumsi Kru Lapangan',
  'Sewa Alat Tambahan',
  'Parkir & Tol',
  'Kasbon / Pinjaman Cepat',
  'Lainnya',
];

export const ExpenseClaimsView: React.FC<ExpenseClaimsViewProps> = ({
  expensesList,
  staffList,
  currentUser,
  onSaveExpense,
  onUpdateExpense,
  onDeleteExpense,
  onIncludeInPayroll,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Bensin & Transport Shoot');
  const [amount, setAmount] = useState<number>(100000);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(undefined);

  const filteredExpenses = expensesList.filter((e) => {
    if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
    return true;
  });

  const totalApproved = expensesList
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPending = expensesList
    .filter((e) => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      alert('Judul klaim dan nominal wajib diisi.');
      return;
    }

    const newClaim: ExpenseClaim = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      title: title.trim(),
      category,
      amount,
      date,
      receiptPhoto,
      status: 'Pending',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      isIncludedInPayroll: false,
    };

    onSaveExpense(newClaim);
    setShowAddModal(false);
    setTitle('');
    setAmount(100000);
    setNotes('');
    setReceiptPhoto(undefined);
  };

  const handleApprove = (expense: ExpenseClaim) => {
    onUpdateExpense({
      ...expense,
      status: 'Approved',
      approvedBy: currentUser.name,
    });
  };

  const handleReject = (expense: ExpenseClaim) => {
    onUpdateExpense({
      ...expense,
      status: 'Rejected',
      approvedBy: currentUser.name,
    });
  };

  const handleTogglePayroll = (expense: ExpenseClaim) => {
    const updated = {
      ...expense,
      isIncludedInPayroll: !expense.isIncludedInPayroll,
    };
    onUpdateExpense(updated);
    if (onIncludeInPayroll && updated.isIncludedInPayroll) {
      onIncludeInPayroll(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-amber-500/15 text-amber-400">
              <Receipt className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">EXPENSE & CASH ADVANCE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Klaim Reimbursement & Kasbon
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengajuan nota bensin, tiket lokasi, sewa alat tambahan, dan integrasi otomatis ke komponen slip gaji.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportExpensesReport(expensesList)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Klaim Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">Total Klaim Disetujui</div>
          <div className="text-xl font-black font-mono text-emerald-400">
            {formatRupiah(totalApproved)}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">Menunggu Persetujuan</div>
          <div className="text-xl font-black font-mono text-amber-400">
            {formatRupiah(totalPending)}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">Total Item Klaim</div>
          <div className="text-xl font-black font-mono text-slate-100">
            {expensesList.length} <span className="text-xs font-normal text-slate-400">Pengajuan</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-300">Filter Kategori:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200"
          >
            <option value="ALL">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200"
          >
            <option value="ALL">Semua Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table of Expenses */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <th className="py-3 px-4">Tanggal & ID</th>
                <th className="py-3 px-4">Nama Staf</th>
                <th className="py-3 px-4">Keperluan & Kategori</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Struk / Bukti</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Slip Gaji</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ada klaim reimbursement pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-200">{exp.date}</div>
                      <div className="text-[10px] font-mono text-slate-500">{exp.id}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {exp.staffName}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-200">{exp.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{exp.category}</div>
                      {exp.notes && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5">{exp.notes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 text-sm whitespace-nowrap">
                      {formatRupiah(exp.amount)}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {exp.receiptPhoto ? (
                        <button
                          type="button"
                          onClick={() => setViewReceiptModal(exp.receiptPhoto!)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-indigo-400 font-semibold"
                        >
                          Lihat Struk
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">Tanpa Foto</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          exp.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : exp.status === 'Rejected'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePayroll(exp)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          exp.isIncludedInPayroll
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title="Klik untuk memasukkan atau mengeluarkan klaim ini dari slip gaji"
                      >
                        {exp.isIncludedInPayroll ? '✓ Masuk Slip' : '+ Tambah'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {exp.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(exp)}
                              className="p-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300"
                              title="Setujui Klaim"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(exp)}
                              className="p-1 rounded bg-red-900/60 hover:bg-red-800 text-red-300"
                              title="Tolak Klaim"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus klaim "${exp.title}"?`)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-red-400"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-slate-100 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Ajukan Klaim Reimbursement</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul / Keperluan Biaya *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Bensin Operasional Shoot Cafe Batu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Biaya
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Pengeluaran
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Unggah Foto Struk / Nota (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
                />
                {receiptPhoto && (
                  <div className="mt-2">
                    <img
                      src={receiptPhoto}
                      alt="Pratinjau Struk"
                      className="max-h-32 rounded border border-slate-700 object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Keterangan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail rincian atau keterangan tambahan..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded text-xs font-bold shadow-sm"
                >
                  Kirim Pengajuan Klaim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Receipt Photo Modal */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-lg w-full text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold">Bukti Struk / Nota Pembayaran</h3>
              <button
                type="button"
                onClick={() => setViewReceiptModal(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-black/50 p-2 rounded-lg max-h-[75vh] overflow-hidden">
              <img
                src={viewReceiptModal}
                alt="Foto Struk"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
