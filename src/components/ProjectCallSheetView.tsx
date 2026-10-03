import React, { useState } from 'react';
import {
  ProjectAssignment,
  StaffUser,
  ProjectCrewMember,
  EquipmentItem,
} from '../types';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckSquare,
  Square,
  Share2,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { formatRupiah } from '../utils/geo';
import { exportProjectsReport } from '../utils/exportExcel';

interface ProjectCallSheetViewProps {
  projectsList: ProjectAssignment[];
  staffList: StaffUser[];
  currentUser: StaffUser;
  onSaveProject: (project: ProjectAssignment) => void;
  onUpdateProject: (project: ProjectAssignment) => void;
  onDeleteProject: (id: string) => void;
}

const DEFAULT_EQUIPMENT_TEMPLATES = [
  'Sony A7IV Main Camera + 3x Batteries',
  'Lens Sony FE 24-70mm F2.8 GM II',
  'Lens Sony FE 85mm F1.4 GM',
  'Godox AD200 Pro Strobe + Wireless Trigger',
  'Octa Softbox 80cm + Light Stand Heavy Duty',
  'Wireless Mic DJI Mic 2 (TX + RX)',
  'Drone DJI Air 3 + RC2 Controller',
  'Carbon Fiber Tripod Sirui',
  'Sandisk Extreme Pro 128GB SD Card (x2)',
  'Lens Cleaning Kit & Air Blower',
];

export const ProjectCallSheetView: React.FC<ProjectCallSheetViewProps> = ({
  projectsList,
  staffList,
  currentUser,
  onSaveProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState<ProjectAssignment['category']>('Commercial Shoot');
  const [location, setLocation] = useState('Studio obeecreatives Kota Batu');
  const [shootDate, setShootDate] = useState(new Date().toISOString().slice(0, 10));
  const [callTime, setCallTime] = useState('08:00 WIB');
  const [totalProjectFee, setTotalProjectFee] = useState<number>(2500000);
  const [notes, setNotes] = useState('');

  // Selected Crew
  const [selectedCrew, setSelectedCrew] = useState<ProjectCrewMember[]>([
    {
      staffId: currentUser.id,
      staffName: currentUser.name,
      roleInProject: 'Lead Photographer',
      customFee: 500000,
    },
  ]);

  // Selected Equipment
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(
    DEFAULT_EQUIPMENT_TEMPLATES.map((name, i) => ({ id: `eq-${i}`, name, checked: true }))
  );
  const [customEquipment, setCustomEquipment] = useState('');

  const filteredProjects = projectsList.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  const handleToggleEquipment = (project: ProjectAssignment, eqId: string) => {
    const updated = {
      ...project,
      equipmentList: project.equipmentList.map((e) =>
        e.id === eqId ? { ...e, checked: !e.checked } : e
      ),
    };
    onUpdateProject(updated);
  };

  const handleStatusChange = (project: ProjectAssignment, newStatus: ProjectAssignment['status']) => {
    const updated = { ...project, status: newStatus };
    onUpdateProject(updated);
  };

  const handleAddCrewRow = () => {
    const available = staffList.find((s) => !selectedCrew.some((c) => c.staffId === s.id)) || staffList[0];
    setSelectedCrew([
      ...selectedCrew,
      {
        staffId: available.id,
        staffName: available.name,
        roleInProject: 'Videographer',
        customFee: 300000,
      },
    ]);
  };

  const handleRemoveCrew = (index: number) => {
    setSelectedCrew(selectedCrew.filter((_, idx) => idx !== index));
  };

  const handleAddCustomEquipment = () => {
    if (!customEquipment.trim()) return;
    setEquipmentList([
      ...equipmentList,
      { id: `eq-custom-${Date.now()}`, name: customEquipment.trim(), checked: true },
    ]);
    setCustomEquipment('');
  };

  const handleSaveNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !projectName.trim()) {
      alert('Nama klien dan proyek wajib diisi.');
      return;
    }

    const newProject: ProjectAssignment = {
      id: `PRJ-${Date.now().toString().slice(-4)}`,
      clientName: clientName.trim(),
      projectName: projectName.trim(),
      category,
      location: location.trim(),
      shootDate,
      callTime,
      status: 'Upcoming',
      crew: selectedCrew,
      equipmentList,
      notes: notes.trim(),
      totalProjectFee,
      createdAt: new Date().toISOString(),
    };

    onSaveProject(newProject);
    setShowAddModal(false);
    // Reset form
    setClientName('');
    setProjectName('');
    setNotes('');
  };

  const handleCopyCallSheetWhatsApp = (project: ProjectAssignment) => {
    const crewText = project.crew
      .map((c) => `• ${c.staffName} (${c.roleInProject})`)
      .join('\n');

    const gearText = project.equipmentList
      .map((g) => `${g.checked ? '✅' : '⬜'} ${g.name}`)
      .join('\n');

    const text = `*CALL SHEET PRODUKSI — OBEECREATIVES*
🎬 *Proyek:* ${project.projectName}
🏢 *Klien:* ${project.clientName} (${project.category})
📅 *Tanggal:* ${project.shootDate}
⏰ *Call Time:* ${project.callTime}
📍 *Lokasi:* ${project.location}

👥 *KRU BERTUGAS:*
${crewText}

🎒 *CHECKLIST GEAR & PERALATAN:*
${gearText}

📝 *Catatan / Brief:*
${project.notes || '-'}

_Mohon hadir tepat waktu di Studio Kota Batu / Lokasi. Salam Kreatif obeecreatives!_`;

    navigator.clipboard.writeText(text);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#E30000]/15 text-[#E30000]">
              <Video className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">CREW & GEAR CALL SHEET</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Jadwal Penugasan Proyek Shoot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manajemen penugasan kru fotografer, videografer, checklist alat studio Kota Batu, dan fee proyek.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportProjectsReport(projectsList)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Call Sheet Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {['ALL', 'Upcoming', 'In Progress', 'Completed'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              filterStatus === st
                ? 'bg-[#E30000] text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            {st === 'ALL' ? 'Semua Proyek' : st} ({projectsList.filter((p) => (st === 'ALL' ? true : p.status === st)).length})
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-500 text-xs">
            Tidak ada jadwal proyek dengan filter ini.
          </div>
        ) : (
          filteredProjects.map((prj) => {
            const readyEquipmentCount = prj.equipmentList.filter((e) => e.checked).length;
            const totalEquipmentCount = prj.equipmentList.length;

            return (
              <div
                key={prj.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#E30000]/15 text-[#E30000] border border-[#E30000]/30">
                      {prj.category}
                    </span>

                    <select
                      value={prj.status}
                      onChange={(e) => handleStatusChange(prj, e.target.value as any)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded border focus:outline-none ${
                        prj.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : prj.status === 'In Progress'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </div>

                  {/* Title & Client */}
                  <h3 className="text-base font-bold text-slate-100">{prj.projectName}</h3>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    Klien: <span className="text-slate-200">{prj.clientName}</span>
                  </div>

                  {/* Date, Time, Location */}
                  <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{prj.shootDate}</span>
                      <span className="text-slate-600">&middot;</span>
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-semibold text-amber-400">{prj.callTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#E30000] shrink-0" />
                      <span className="truncate">{prj.location}</span>
                    </div>
                  </div>

                  {/* Assigned Crew */}
                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Kru Bertugas ({prj.crew.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {prj.crew.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-200 flex items-center gap-1"
                        >
                          <span className="font-semibold">{c.staffName}</span>
                          <span className="text-[10px] text-slate-500">({c.roleInProject})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Equipment Checklist */}
                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Checklist Gear / Alat Studio</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {readyEquipmentCount}/{totalEquipmentCount} Siap
                      </span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 max-h-36 overflow-y-auto space-y-1">
                      {prj.equipmentList.map((eq) => (
                        <button
                          key={eq.id}
                          type="button"
                          onClick={() => handleToggleEquipment(prj, eq.id)}
                          className="w-full flex items-center gap-2 text-left py-1 px-1.5 rounded hover:bg-slate-900 transition-colors text-xs"
                        >
                          {eq.checked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          )}
                          <span className={eq.checked ? 'text-slate-200' : 'text-slate-500 line-through'}>
                            {eq.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes / Brief */}
                  {prj.notes && (
                    <div className="mt-3 text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
                      <span className="font-bold text-slate-300">Brief: </span>
                      {prj.notes}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-slate-300">
                    {prj.totalProjectFee ? formatRupiah(prj.totalProjectFee) : '-'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCallSheetWhatsApp(prj)}
                      className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-xs font-semibold text-emerald-400 flex items-center gap-1 transition-colors"
                      title="Salin Call Sheet format WhatsApp"
                    >
                      {copiedId === prj.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === prj.id ? 'Tersalin!' : 'Copy WA'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus jadwal shoot "${prj.projectName}"?`)) {
                          onDeleteProject(prj.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      title="Hapus Call Sheet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Call Sheet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#E30000]" />
                <h3 className="text-base font-bold">Buat Call Sheet & Penugasan Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProject} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Klien / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: Batu Eco Resto"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Proyek
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                  >
                    <option value="Commercial Shoot">Commercial Shoot</option>
                    <option value="Prewedding & Wedding">Prewedding & Wedding</option>
                    <option value="Social Media Retainer">Social Media Retainer</option>
                    <option value="Event & Workshop">Event & Workshop</option>
                    <option value="Product Catalog">Product Catalog</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Proyek / Sesi Shoot *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Contoh: Photoshoot Menu Baru & Video Reels"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Shoot
                  </label>
                  <input
                    type="date"
                    required
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Call Time (WIB)
                  </label>
                  <input
                    type="text"
                    required
                    value={callTime}
                    onChange={(e) => setCallTime(e.target.value)}
                    placeholder="07:30 WIB"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Budget / Fee Proyek (Rp)
                  </label>
                  <input
                    type="number"
                    value={totalProjectFee}
                    onChange={(e) => setTotalProjectFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lokasi Shoot
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Studio Kota Batu atau Alamat Klien"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
                />
              </div>

              {/* Crew Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Kru Bertugas ({selectedCrew.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCrewRow}
                    className="text-xs text-[#E30000] hover:underline font-semibold"
                  >
                    + Tambah Kru
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedCrew.map((crew, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={crew.staffId}
                        onChange={(e) => {
                          const staff = staffList.find((s) => s.id === e.target.value);
                          if (staff) {
                            const updated = [...selectedCrew];
                            updated[idx] = { ...updated[idx], staffId: staff.id, staffName: staff.name };
                            setSelectedCrew(updated);
                          }
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100"
                      >
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.department})
                          </option>
                        ))}
                      </select>

                      <select
                        value={crew.roleInProject}
                        onChange={(e) => {
                          const updated = [...selectedCrew];
                          updated[idx] = { ...updated[idx], roleInProject: e.target.value as any };
                          setSelectedCrew(updated);
                        }}
                        className="w-36 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100"
                      >
                        <option value="Lead Photographer">Lead Photographer</option>
                        <option value="Videographer">Videographer</option>
                        <option value="Drone Pilot">Drone Pilot</option>
                        <option value="Assistant & Lighting">Assistant & Lighting</option>
                        <option value="Editor">Editor</option>
                        <option value="Project Coordinator">Project Coordinator</option>
                      </select>

                      {selectedCrew.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCrew(idx)}
                          className="p-1 text-slate-500 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Peralatan Studio Siap Bawa ({equipmentList.length} item)
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded p-2.5 max-h-32 overflow-y-auto space-y-1">
                  {equipmentList.map((eq) => (
                    <label key={eq.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eq.checked}
                        onChange={() => {
                          setEquipmentList(
                            equipmentList.map((e) => (e.id === eq.id ? { ...e, checked: !e.checked } : e))
                          );
                        }}
                        className="accent-[#E30000]"
                      />
                      <span>{eq.name}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value)}
                    placeholder="Tambah gear custom..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEquipment}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan / Brief Tambahan
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Moodboard, tone warna, arahan kostum klien..."
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
                  Simpan & Rilis Call Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
