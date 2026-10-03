import React, { useState } from 'react';
import { LeaveRequest, StaffUser, LeaveType, AttendanceRecord } from '../types';
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Trash2,
  X,
  Upload,
  UserCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface LeaveManagementViewProps {
  leavesList: LeaveRequest[];
  staffList: StaffUser[];
  currentUser: StaffUser;
  onSaveLeave: (leave: LeaveRequest) => void;
  onUpdateLeave: (leave: LeaveRequest) => void;
  onDeleteLeave: (id: string) => void;
  onSyncToAttendance?: (leave: LeaveRequest) => void;
}

const LEAVE_TYPES: LeaveType[] = [
  'Cuti Tahunan',
  'Izin Sakit',
  'Izin Keperluan Pribadi',
  'Tugas Luar Studio',
  'Lembur Shoot',
];

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({
  leavesList,
  staffList,
  currentUser,
  onSaveLeave,
  onUpdateLeave,
  onDeleteLeave,
  onSyncToAttendance,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewAttachmentModal, setViewAttachmentModal] = useState<string | null>(null);

  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('Cuti Tahunan');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(undefined);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const filteredLeaves = leavesList.filter((l) => {
    if (filterType !== 'ALL' && l.type !== filterType) return false;
    if (filterStatus !== 'ALL' && l.status !== filterStatus) return false;
    return true;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachmentUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Alasan pengajuan wajib diisi.');
      return;
    }

    const totalDays = calculateDays(startDate, endDate);

    const newLeave: LeaveRequest = {
      id: `LEV-${Date.now().toString().slice(-4)}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      type: leaveType,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim(),
      attachmentUrl,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    onSaveLeave(newLeave);
    setShowAddModal(false);
    setReason('');
    setAttachmentUrl(undefined);
  };

  const handleApprove = (leave: LeaveRequest) => {
    const updated: LeaveRequest = {
      ...leave,
      status: 'Approved',
      approvedBy: currentUser.name,
      approvalDate: new Date().toISOString().slice(0, 10),
    };
    onUpdateLeave(updated);
    if (onSyncToAttendance) {
      onSyncToAttendance(updated);
    }
  };

  const handleReject = (leave: LeaveRequest) => {
    const reason = prompt('Masukkan alasan penolakan (opsional):') || undefined;
    onUpdateLeave({
      ...leave,
      status: 'Rejected',
      approvedBy: currentUser.name,
      rejectionReason: reason,
      approvalDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-indigo-500/15 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">LEAVE & OVERTIME REQUEST</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Pengajuan Izin, Cuti & Lembur
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Form permohonan cuti tahunan, surat dokter sakit, tugas luar studio, dan persetujuan manajemen obeecreatives.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Izin / Cuti</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-300">Tipe Pengajuan:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200"
          >
            <option value="ALL">Semua Tipe</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
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

      {/* Leaves Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <th className="py-3 px-4">Staf Pemohon</th>
                <th className="py-3 px-4">Tipe Pengajuan</th>
                <th className="py-3 px-4">Periode Tanggal</th>
                <th className="py-3 px-4 text-center">Durasi</th>
                <th className="py-3 px-4">Alasan & Bukti</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada pengajuan izin / cuti pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200 whitespace-nowrap">
                      {l.staffName}
                      <div className="text-[10px] font-mono text-slate-500">{l.id}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-950 border border-slate-800 text-indigo-400">
                        {l.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <div>
                        {l.startDate} {l.startDate !== l.endDate && `s/d ${l.endDate}`}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                      {l.totalDays} Hari
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-200">{l.reason}</div>
                      {l.attachmentUrl && (
                        <button
                          type="button"
                          onClick={() => setViewAttachmentModal(l.attachmentUrl!)}
                          className="mt-1 text-[11px] text-emerald-400 hover:underline font-semibold block"
                        >
                          Lihat Lampiran Bukti
                        </button>
                      )}
                      {l.rejectionReason && (
                        <div className="text-[10px] text-red-400 mt-1 italic">
                          Alasan Ditolak: {l.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          l.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : l.status === 'Rejected'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {l.status}
                      </span>
                      {l.approvedBy && (
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          oleh {l.approvedBy}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {l.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(l)}
                              className="p-1.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300"
                              title="Setujui Pengajuan"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(l)}
                              className="p-1.5 rounded bg-red-900/60 hover:bg-red-800 text-red-300"
                              title="Tolak Pengajuan"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus pengajuan "${l.type} - ${l.staffName}"?`)) {
                              onDeleteLeave(l.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Leave Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-slate-100 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Ajukan Izin / Cuti / Lembur</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipe Permohonan
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                Total Hari: <span className="font-bold text-amber-400">{calculateDays(startDate, endDate)} Hari</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan / Detail Keperluan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan alasan izin, cuti tahunan, atau keperluan tugas luar..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lampirkan Surat Dokter / Surat Tugas (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
                />
                {attachmentUrl && (
                  <div className="mt-2">
                    <img
                      src={attachmentUrl}
                      alt="Lampiran"
                      className="max-h-28 rounded border border-slate-700 object-cover"
                    />
                  </div>
                )}
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
                  Kirim Permohonan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attachment Modal */}
      {viewAttachmentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-lg w-full text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold">Lampiran Bukti Pengajuan</h3>
              <button
                type="button"
                onClick={() => setViewAttachmentModal(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center bg-black/50 p-2 rounded-lg max-h-[75vh] overflow-hidden">
              <img
                src={viewAttachmentModal}
                alt="Lampiran"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
