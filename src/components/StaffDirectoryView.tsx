import React, { useState, useMemo } from 'react';
import { StaffUser, Department, StaffStatus, StaffRole, WorkMode } from '../types';
import {
  Search,
  UserPlus,
  KeyRound,
  Edit3,
  Phone,
  Mail,
  Building,
  CreditCard,
  Layers,
  MapPin,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { formatRupiah, formatPhoneForWhatsApp } from '../utils/geo';

interface StaffDirectoryViewProps {
  staffList: StaffUser[];
  currentUser: StaffUser;
  onUpdateStaff: (staff: StaffUser) => void;
  onAddStaff: (staff: StaffUser) => void;
  onDeleteStaff?: (id: string) => void;
  onResetToSeed?: () => void;
}

export const StaffDirectoryView: React.FC<StaffDirectoryViewProps> = ({
  staffList,
  currentUser,
  onUpdateStaff,
  onAddStaff,
  onResetToSeed,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modals state
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [resetPinStaff, setResetPinStaff] = useState<StaffUser | null>(null);
  const [newPinValue, setNewPinValue] = useState('123456');
  const [waCopied, setWaCopied] = useState(false);

  const departments: (Department | 'ALL')[] = [
    'ALL',
    'Photography',
    'Desain Grafis',
    'Videography',
    'Social Media Management',
    'Workshop/Pelatihan',
    'Management',
  ];

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchDept = selectedDept === 'ALL' || s.department === selectedDept;
      const matchStatus =
        selectedStatus === 'ALL' ||
        s.status === selectedStatus ||
        (selectedStatus === 'Tetap' && (s.status === 'Tetap' || s.status === 'Aktif - Karyawan Tetap')) ||
        (selectedStatus === 'PKWT' && (s.status === 'PKWT' || s.status === 'Aktif - PKWT')) ||
        (selectedStatus === 'Magang' && (s.status === 'Magang' || s.status === 'Aktif - Magang'));
      const matchSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.id && s.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.jobTitle && s.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchDept && matchStatus && matchSearch;
    });
  }, [staffList, selectedDept, selectedStatus, searchQuery]);

  // Handler Reset Paksa PIN
  const handleApplyResetPin = () => {
    if (!resetPinStaff) return;
    const updated: StaffUser = {
      ...resetPinStaff,
      pin: newPinValue,
    };
    onUpdateStaff(updated);
    setResetPinStaff(updated);
  };

  const generateWhatsAppResetMessage = (staff: StaffUser, pin: string) => {
    return `*OBEECREATIVES - PEMBERITAHUAN KEAMANAN SISTEM*\n\nHalo ${staff.name},\n\nPIN akses akun portal staf obeecreatives Anda telah diperbarui oleh Admin/Project Manager:\n\n*PIN Baru:* \`${pin}\`\n*Email Akun:* ${staff.email}\n*Portal Akses:* obeecreatives Workspace OS\n\nSilakan login ke portal dan segera ganti PIN Anda di menu Profil jika diperlukan.\n\nTerima kasih,\n_Tim Operasional obeecreatives_`;
  };

  const handleCopyWaMessage = (staff: StaffUser) => {
    const text = generateWhatsAppResetMessage(staff, newPinValue);
    navigator.clipboard.writeText(text);
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2000);
  };

  const handleOpenWhatsAppDirect = (staff: StaffUser) => {
    const phone = formatPhoneForWhatsApp(staff.phone);
    if (!phone) {
      alert('Nomor WhatsApp staf belum dicatat.');
      return;
    }
    const text = encodeURIComponent(generateWhatsAppResetMessage(staff, newPinValue));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Zone */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-[#E30000]" />
              Direktori Staf & Manajemen Tim
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Database personel, kontak resmi, rekening payroll, dan kontrol akses PIN terintegrasi obeecreatives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kartu Profil
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tabel Data
              </button>
            </div>

            {/* Tambah Staf Baru Button */}
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Staf</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Department Filter Tabs (Zero-Pill Discipline: Segmented Controls) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  selectedDept === dept
                    ? 'bg-white text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {dept === 'ALL' ? 'Semua Divisi' : dept}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Select matching official sheet */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none focus:border-[#E30000]"
            >
              <option value="ALL">Semua Status</option>
              <option value="Tetap">Tetap</option>
              <option value="Nonaktif">Nonaktif</option>
              <option value="Magang">Magang</option>
              <option value="PKWT">PKWT</option>
              <option value="Freelancer">Freelancer</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ID, nama, jabatan, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>
        </div>

        {/* Source Datasheet Sync Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 -mx-5 -mb-5 p-4 rounded-b-lg">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Sumber Data Resmi: Spreadsheet Database Staff obeecreatives (Tab: Staff)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-mono">
              7 Personel Terverifikasi
            </span>
          </div>
          {onResetToSeed && (
            <button
              type="button"
              onClick={onResetToSeed}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-semibold transition-colors self-start sm:self-auto shadow-xs"
              title="Perbarui & sinkronkan ulang seluruh data staf dan payroll sesuai Google Sheets resmi"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sinkronkan Ulang ke Datasheet</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className={`bg-slate-900 border rounded-lg p-5 flex flex-col justify-between transition-shadow hover:shadow-md ${
                staff.status === 'Nonaktif' ? 'border-slate-800/60 opacity-80' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header Card: Avatar & Name */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 text-[#E30000] flex items-center justify-center font-bold text-base shrink-0">
                      {staff.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white leading-tight">
                        {staff.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">{staff.jobTitle || 'Staf Kreatif'}</p>
                    </div>
                  </div>

                  {/* Role Tag */}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 uppercase">
                    {staff.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Zero-Pill Unboxed Metadata Separators */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">{staff.department || 'Creative Content'}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-medium">{staff.workMode || 'WFO'}</span>
                  <span>·</span>
                  <span
                    className={
                      staff.status === 'Nonaktif'
                        ? 'text-slate-500'
                        : staff.status?.includes('Tetap')
                        ? 'text-emerald-400'
                        : 'text-sky-400'
                    }
                  >
                    {staff.status || 'Aktif'}
                  </span>
                </div>

                {/* Skill Mastery Tags */}
                {staff.skills && staff.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {staff.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-slate-950 border border-slate-800/80 rounded text-[10px] text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Payroll & Banking Information */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Gaji Pokok + Tunjangan</span>
                    <span className="font-mono font-bold text-slate-100 tabular-nums">
                      {formatRupiah((staff.baseSalary || 0) + (staff.allowance || 0))}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Rekening Bank</span>
                    {staff.bankAccount?.bankName ? (
                      <span className="text-slate-300 text-[11px] truncate block font-mono">
                        {staff.bankAccount.bankName} - {staff.bankAccount.accountNumber}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px] block">-</span>
                    )}
                  </div>
                </div>

                {/* Kontak WhatsApp & Email */}
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  {staff.phone && (
                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(staff.phone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                      title="Buka WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-mono text-[11px]">{staff.phone}</span>
                    </a>
                  )}
                  {staff.email && (
                    <div className="flex items-center gap-1 truncate text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetPinStaff(staff);
                    setNewPinValue(staff.pin || '123456');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-amber-400 font-medium transition-colors"
                  title="Reset Paksa PIN & Kirim WA"
                >
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  <span>Reset PIN ({staff.pin || '123456'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingStaff(staff)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profil</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Mode View */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1100px]">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-3 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Nama Lengkap</th>
                  <th className="py-3 px-3 font-semibold">Divisi</th>
                  <th className="py-3 px-3 font-semibold text-center">Status</th>
                  <th className="py-3 px-3 font-semibold">Jabatan</th>
                  <th className="py-3 px-3 font-semibold">Grade</th>
                  <th className="py-3 px-3 font-semibold text-right">Gaji Pokok</th>
                  <th className="py-3 px-3 font-semibold text-right">Tunj. Jabatan</th>
                  <th className="py-3 px-3 font-semibold">Kontak</th>
                  <th className="py-3 px-3 font-semibold">Rekening Bank</th>
                  <th className="py-3 px-3 font-semibold text-center">PIN</th>
                  <th className="py-3 px-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* Col A: ID */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {staff.id}
                    </td>

                    {/* Col B: Nama & Email */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{staff.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{staff.email}</div>
                    </td>

                    {/* Col C: Divisi */}
                    <td className="py-3 px-3">
                      <span className="text-slate-200 font-medium">{staff.department}</span>
                    </td>

                    {/* Col D: Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          staff.status === 'Nonaktif'
                            ? 'bg-slate-800 text-slate-400'
                            : staff.status === 'Tetap'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                            : staff.status === 'Magang'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800/80'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/80'
                        }`}
                      >
                        {staff.status || '-'}
                      </span>
                    </td>

                    {/* Col E: Jabatan */}
                    <td className="py-3 px-3 text-slate-200">
                      {staff.jobTitle || '-'}
                    </td>

                    {/* Col F: Grade */}
                    <td className="py-3 px-3">
                      <span className="text-slate-300 font-mono text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {staff.gradeSkill || '-'}
                      </span>
                    </td>

                    {/* Col G: Gaji Pokok */}
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-100">
                      {staff.baseSalary ? formatRupiah(staff.baseSalary) : '-'}
                    </td>

                    {/* Col H: Tunjangan Jabatan */}
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-100">
                      {staff.allowance ? formatRupiah(staff.allowance) : '-'}
                    </td>

                    {/* Col I: Kontak WA */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {staff.phone ? (
                        <a
                          href={`https://wa.me/${formatPhoneForWhatsApp(staff.phone)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 font-mono text-[11px]"
                          title="Buka Chat WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{staff.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">-</span>
                      )}
                    </td>

                    {/* Col J: Rekening Bank */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {staff.bankAccount?.bankName && staff.bankAccount.accountNumber !== '-' ? (
                        <div>
                          <div className="text-slate-200 font-medium">{staff.bankAccount.bankName}</div>
                          <div className="text-slate-400">{staff.bankAccount.accountNumber}</div>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* PIN */}
                    <td className="py-3 px-3 font-mono font-bold text-amber-400 text-center">
                      {staff.pin || '123456'}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setResetPinStaff(staff);
                            setNewPinValue(staff.pin || '123456');
                          }}
                          title="Reset Paksa PIN"
                          className="p-1.5 text-amber-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStaff(staff)}
                          title="Edit Staf"
                          className="p-1.5 text-slate-300 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-lg p-6">
          <p className="text-sm text-slate-400">Tidak ada staf yang cocok dengan kriteria pencarian.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedDept('ALL');
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* MODAL RESET PAKSA PIN & NOTIFIKASI WHATSAPP */}
      {resetPinStaff && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full shadow-2xl overflow-hidden max-h-[82vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Reset Paksa PIN Staf (Lupa PIN)</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPinStaff(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <span className="text-xs text-slate-400">Staf Terpilih:</span>
                <div className="text-sm font-bold text-white">{resetPinStaff.name}</div>
                <div className="text-xs text-slate-400">{resetPinStaff.jobTitle} &middot; {resetPinStaff.email}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Masukkan PIN Baru (4–8 Digit):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-base font-mono text-amber-400 font-bold focus:outline-none focus:border-[#E30000]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const random = Math.floor(100000 + Math.random() * 900000).toString();
                      setNewPinValue(random);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-medium"
                  >
                    Acak 6 Digit
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyResetPin}
                    className="px-3 py-2 bg-[#E30000] hover:bg-red-700 text-white text-xs rounded font-semibold"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Template WhatsApp Notification Box */}
              <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Format Pesan WhatsApp Resmi
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyWaMessage(resetPinStaff)}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                    >
                      {waCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{waCopied ? 'Tersalin!' : 'Salin Pesan'}</span>
                    </button>
                  </div>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap font-sans text-[11px] leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  {generateWhatsAppResetMessage(resetPinStaff, newPinValue)}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppDirect(resetPinStaff)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kirim Langsung ke WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResetPinStaff(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH STAF (Anti-Clipping: max-h-[82vh] + internal scroll) */}
      {(editingStaff || isAddingNew) && (
        <StaffFormModal
          initialData={editingStaff}
          onSave={(saved) => {
            if (editingStaff) {
              onUpdateStaff(saved);
            } else {
              onAddStaff(saved);
            }
            setEditingStaff(null);
            setIsAddingNew(false);
          }}
          onClose={() => {
            setEditingStaff(null);
            setIsAddingNew(false);
          }}
        />
      )}
    </div>
  );
};

// Form Modal Component (Strict Laptop Zero-Clipping Rules)
interface StaffFormModalProps {
  initialData: StaffUser | null;
  onSave: (staff: StaffUser) => void;
  onClose: () => void;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<StaffUser>(
    initialData || {
      id: 'STF-' + Date.now(),
      name: '',
      email: '',
      role: 'staff_creator',
      department: 'Creative Content',
      jobTitle: '',
      workMode: 'WFO',
      status: 'Aktif - PKWT',
      gender: 'Pria',
      phone: '',
      pin: '123456',
      baseSalary: 1000000,
      allowance: 250000,
      skills: [],
      bankAccount: {
        bankName: 'Bank Mandiri',
        accountNumber: '',
        accountHolder: '',
      },
      notes: '',
    }
  );

  const [skillsString, setSkillsString] = useState((formData.skills || []).join(', '));

  const handleChange = (field: keyof StaffUser, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankAccount: {
        ...(prev.bankAccount || { bankName: '', accountNumber: '', accountHolder: '' }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Nama dan Email resmi wajib diisi.');
      return;
    }
    const cleanSkills = skillsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      ...formData,
      skills: cleanSkills,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden max-h-[82vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-white">
            {initialData ? 'Edit Profil Staf' : 'Tambah Staf Baru'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Section: Identitas & Kontak */}
          <div className="text-[11px] font-bold text-[#E30000] uppercase tracking-wider">
            Informasi Pribadi & Kontak
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="cth: Adissa Rifdah Aulia"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Resmi *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="cth: staff@gmail.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Nomor WhatsApp *</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="cth: 081335125277"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Instagram (@username)</label>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="cth: @lalumahendra"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>

          {/* Section: Organisasi & RBAC */}
          <div className="pt-2 text-[11px] font-bold text-[#E30000] uppercase tracking-wider">
            Posisi, Departemen & Hak Akses
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Departemen / Divisi</label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value as Department)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              >
                <option value="Photography">Photography</option>
                <option value="Desain Grafis">Desain Grafis</option>
                <option value="Videography">Videography</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Workshop/Pelatihan">Workshop/Pelatihan</option>
                <option value="Management">Management</option>
                <option value="Creative Content">Creative Content</option>
                <option value="Tech & Dev">Tech & Dev</option>
                <option value="Field Ops">Field Ops</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Jabatan (Job Title)</label>
              <input
                type="text"
                value={formData.jobTitle || ''}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
                placeholder="cth: Senior Videographer"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Role RBAC</label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value as StaffRole)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              >
                <option value="admin">admin (Full Control)</option>
                <option value="project_manager">project_manager (PM Ops)</option>
                <option value="staff_creator">staff_creator</option>
                <option value="web_developer">web_developer</option>
                <option value="site_engineer">site_engineer</option>
                <option value="vendor_lapangan">vendor_lapangan</option>
                <option value="client">client</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Status Kepegawaian</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as StaffStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              >
                <option value="Tetap">Tetap</option>
                <option value="Nonaktif">Nonaktif</option>
                <option value="Magang">Magang</option>
                <option value="PKWT">PKWT</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Mode Kerja</label>
              <select
                value={formData.workMode}
                onChange={(e) => handleChange('workMode', e.target.value as WorkMode)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              >
                <option value="WFO">WFO (Studio Kota Batu)</option>
                <option value="On-Site">On-Site (Liputan Klien)</option>
                <option value="WFH">WFH (Rumah)</option>
                <option value="Mobile">Mobile (Kafe/Remote)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">PIN Akses (4-8 Digit)</label>
              <input
                type="text"
                maxLength={8}
                value={formData.pin || '123456'}
                onChange={(e) => handleChange('pin', e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-amber-400 font-bold focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Skill & Software Mastery (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="cth: Premiere Pro, Figma, After Effects, Copywriting, Lighting"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
            />
          </div>

          {/* Section: Data Payroll & Rekening Bank */}
          <div className="pt-2 text-[11px] font-bold text-[#E30000] uppercase tracking-wider">
            Payroll & Rekening Pembayaran
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Gaji Pokok Bulanan (Rp)</label>
              <input
                type="number"
                value={formData.baseSalary || 0}
                onChange={(e) => handleChange('baseSalary', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono tabular-nums text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Tunjangan Tetap (Rp)</label>
              <input
                type="number"
                value={formData.allowance || 0}
                onChange={(e) => handleChange('allowance', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono tabular-nums text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Nama Bank</label>
              <input
                type="text"
                value={formData.bankAccount?.bankName || ''}
                onChange={(e) => handleBankChange('bankName', e.target.value)}
                placeholder="cth: Bank Jago / BCA / BNI / Mandiri"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Nomor Rekening</label>
              <input
                type="text"
                value={formData.bankAccount?.accountNumber || ''}
                onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                placeholder="cth: 105180543278"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Atas Nama Rekening</label>
            <input
              type="text"
              value={formData.bankAccount?.accountHolder || ''}
              onChange={(e) => handleBankChange('accountHolder', e.target.value)}
              placeholder="cth: Adissa Rifdah Aulia"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Catatan Staf</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Catatan kepegawaian..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-[#E30000]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E30000] hover:bg-red-700 text-white font-semibold rounded shadow-sm"
            >
              Simpan Profil Staf
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
