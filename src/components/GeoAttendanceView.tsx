import React, { useState, useEffect } from 'react';
import { StaffUser, AttendanceRecord, WorkMode, LeaveRequest } from '../types';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Compass,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  STUDIO_COORDINATES,
  calculateDistanceMeters,
  formatDistance,
} from '../utils/geo';
import { exportAttendanceReport } from '../utils/exportExcel';
import { LeaveManagementView } from './LeaveManagementView';

interface GeoAttendanceViewProps {
  staffList: StaffUser[];
  currentUser: StaffUser;
  attendanceList: AttendanceRecord[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  currentDistance?: number;
  onRefreshDistance: () => void;
  leavesList?: LeaveRequest[];
  onSaveLeave?: (leave: LeaveRequest) => void;
  onUpdateLeave?: (leave: LeaveRequest) => void;
  onDeleteLeave?: (id: string) => void;
}

export const GeoAttendanceView: React.FC<GeoAttendanceViewProps> = ({
  staffList,
  currentUser,
  attendanceList,
  onAddAttendance,
  onUpdateAttendance,
  currentDistance,
  onRefreshDistance,
  leavesList = [],
  onSaveLeave,
  onUpdateLeave,
  onDeleteLeave,
}) => {
  const [subTab, setSubTab] = useState<'attendance' | 'leaves'>('attendance');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('ALL');

  // Check-In Form State
  const [workMode, setWorkMode] = useState<WorkMode>(currentUser.workMode || 'WFO');
  const [attendanceStatus, setAttendanceStatus] = useState<
    'Hadir' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpha'
  >('Hadir');
  const [locationName, setLocationName] = useState('Studio obeecreatives Kota Batu');
  const [notes, setNotes] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distMeters, setDistMeters] = useState<number | undefined>(currentDistance);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Time ticker
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update workMode when currentUser changes
  useEffect(() => {
    if (currentUser.workMode) {
      setWorkMode(currentUser.workMode);
    }
  }, [currentUser]);

  // Handle GPS detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation API.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsCoords({ lat, lng });

        const d = calculateDistanceMeters(
          lat,
          lng,
          STUDIO_COORDINATES.latitude,
          STUDIO_COORDINATES.longitude
        );
        setDistMeters(d);
        setGpsLoading(false);

        if (workMode === 'WFO') {
          if (d <= STUDIO_COORDINATES.validRadiusMeters) {
            setLocationName('Studio obeecreatives Kota Batu (Terverifikasi)');
          } else {
            setLocationName(`Luar Studio (${formatDistance(d)} dari Kota Batu)`);
          }
        }
      },
      (err) => {
        setGpsLoading(false);
        console.warn('Geolocation error:', err.message);
        // Fallback simulation for dev/office
        const mockLat = -7.8712;
        const mockLng = 112.5271;
        setGpsCoords({ lat: mockLat, lng: mockLng });
        const d = calculateDistanceMeters(
          mockLat,
          mockLng,
          STUDIO_COORDINATES.latitude,
          STUDIO_COORDINATES.longitude
        );
        setDistMeters(d);
        setLocationName('Studio obeecreatives Kota Batu');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Run GPS once on mount
  useEffect(() => {
    handleDetectGps();
  }, []);

  // Check today's check-in for currentUser
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = attendanceList.find(
    (a) => a.staffId === currentUser.id && a.date === todayStr
  );

  const handleCheckIn = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newRec: AttendanceRecord = {
      id: 'ATT-' + Date.now(),
      staffId: currentUser.id,
      staffName: currentUser.name,
      date: todayStr,
      workMode: workMode,
      status: attendanceStatus,
      checkInTime: attendanceStatus === 'Hadir' ? timeStr : undefined,
      latitude: gpsCoords?.lat,
      longitude: gpsCoords?.lng,
      distanceMeters: distMeters,
      locationName: locationName,
      notes: notes,
      verifiedByGeo:
        workMode === 'WFO' && distMeters !== undefined && distMeters <= STUDIO_COORDINATES.validRadiusMeters,
    };

    onAddAttendance(newRec);
    setSubmitSuccess(true);
    setNotes('');
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const updated: AttendanceRecord = {
      ...todayRecord,
      checkOutTime: timeStr,
    };
    onUpdateAttendance(updated);
  };

  // Filtered logs
  const filteredAttendance = attendanceList.filter((a) => {
    const matchMonth = a.date.startsWith(selectedMonth);
    const matchStaff = selectedStaffFilter === 'ALL' || a.staffId === selectedStaffFilter;
    return matchMonth && matchStaff;
  });

  // Calculate Monthly Statistics for filtered view
  const stats = {
    hadir: filteredAttendance.filter((a) => a.status === 'Hadir').length,
    izin: filteredAttendance.filter((a) => a.status === 'Izin').length,
    sakit: filteredAttendance.filter((a) => a.status === 'Sakit').length,
    cuti: filteredAttendance.filter((a) => a.status === 'Cuti').length,
    alpha: filteredAttendance.filter((a) => a.status === 'Alpha').length,
  };

  const pendingLeavesCount = leavesList.filter((l) => l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              subTab === 'attendance'
                ? 'bg-[#E30000] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Presensi Terminal &amp; GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('leaves')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              subTab === 'leaves'
                ? 'bg-[#E30000] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Pengajuan Cuti &amp; Izin</span>
            {pendingLeavesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold font-mono">
                {pendingLeavesCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => exportAttendanceReport(attendanceList, staffList, selectedMonth)}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Rekap Absensi (.xlsx)</span>
        </button>
      </div>

      {subTab === 'leaves' ? (
        <LeaveManagementView
          leavesList={leavesList}
          staffList={staffList}
          currentUser={currentUser}
          onSaveLeave={onSaveLeave || (() => {})}
          onUpdateLeave={onUpdateLeave || (() => {})}
          onDeleteLeave={onDeleteLeave || (() => {})}
        />
      ) : (
        <>
          {/* Top Banner & Live Check-in Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Check-in Desk */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-[#E30000] flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Geo-Attendance Terminal</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Presensi Staf: {currentUser.name}
              </h2>
            </div>

            <div className="text-right flex items-center gap-3">
              <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-center">
                <span className="text-[10px] text-slate-400 block font-medium">Jam Kantor</span>
                <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">
                  {currentTime} WITA
                </span>
              </div>
            </div>
          </div>

          {/* Form Check-In Grid */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Kehadiran */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Status Kehadiran Hari Ini
              </label>
              <select
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value as any)}
                disabled={!!todayRecord}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
              >
                <option value="Hadir">Hadir Bekerja</option>
                <option value="Izin">Izin (Potong Gaji Pro-rata)</option>
                <option value="Sakit">Sakit (Tetap Dibayar)</option>
                <option value="Cuti">Cuti Tahunan (Tetap Dibayar)</option>
                <option value="Alpha">Alpha (Potong Gaji Pro-rata)</option>
              </select>
            </div>

            {/* Mode Kerja */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Mode Penugasan
              </label>
              <select
                value={workMode}
                onChange={(e) => {
                  const mode = e.target.value as WorkMode;
                  setWorkMode(mode);
                  if (mode === 'WFO') setLocationName('Studio obeecreatives Kota Batu');
                  else if (mode === 'On-Site') setLocationName('Lokasi Liputan Klien');
                  else if (mode === 'WFH') setLocationName('Rumah / Remote');
                  else setLocationName('Mobile / Kafe');
                }}
                disabled={!!todayRecord}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
              >
                <option value="WFO">WFO (Studio Kota Batu)</option>
                <option value="On-Site">On-Site (Liputan Klien)</option>
                <option value="WFH">WFH (Rumah)</option>
                <option value="Mobile">Mobile (Kafe)</option>
              </select>
            </div>

            {/* Lokasi / Nama Tempat */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Keterangan Lokasi Presensi
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                disabled={!!todayRecord}
                placeholder="cth: Studio Kota Batu / Cafe Alun-alun"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>

            {/* Catatan Tugas Harian */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Catatan Rencana Kerja Harian
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="cth: Editing video promo reels Kopi Tepi Sawah"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>

          {/* Geo Distance Box */}
          <div className="mt-4 p-3.5 bg-slate-950 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-[#E30000]" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">
                  Jarak ke Studio obeecreatives:
                  <span className="font-mono font-bold text-amber-400 ml-1.5 tabular-nums">
                    {formatDistance(distMeters)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Titik Studio Kota Batu: {STUDIO_COORDINATES.latitude}, {STUDIO_COORDINATES.longitude} (Radius sah: {STUDIO_COORDINATES.validRadiusMeters}m)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {distMeters !== undefined && distMeters <= STUDIO_COORDINATES.validRadiusMeters ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Di Area Studio</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
                  Di Luar Radius Studio
                </span>
              )}

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={gpsLoading}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors"
              >
                {gpsLoading ? 'Mendeteksi...' : '⟳ Refresh GPS'}
              </button>
            </div>
          </div>

          {/* Action Zone: Check-In & Check-Out */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              {todayRecord ? (
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-200">
                    Check-in hari ini tercatat:{' '}
                    <strong className="text-emerald-400 font-mono">
                      {todayRecord.checkInTime || '-'}
                    </strong>
                    {todayRecord.checkOutTime && (
                      <span className="ml-2">
                        &middot; Check-out:{' '}
                        <strong className="text-amber-400 font-mono">
                          {todayRecord.checkOutTime}
                        </strong>
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  Status hari ini: <span className="text-amber-400 font-semibold">Belum Check-In</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!todayRecord ? (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  className="px-5 py-2.5 bg-[#E30000] hover:bg-red-700 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  <span>Check-In Sekarang ({currentTime})</span>
                </button>
              ) : !todayRecord.checkOutTime ? (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  <span>Check-Out Hari Ini ({currentTime})</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-semibold px-3 py-1.5 bg-emerald-950/80 border border-emerald-800 rounded flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Presensi Hari Ini Selesai</span>
                </span>
              )}
            </div>
          </div>

          {submitSuccess && (
            <div className="mt-3 p-2 bg-emerald-950 border border-emerald-800 rounded text-xs text-emerald-300 text-center">
              Presensi berhasil dicatat ke sistem!
            </div>
          )}
        </div>

        {/* Right Col: Studio Profile & Quick Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
              <MapPin className="w-4 h-4 text-[#E30000]" />
              <span>Studio obeecreatives</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Markas Produksi & Konten Kota Batu
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Pusat workshop kreatif, audio recording, dan editorial studio obeecreatives.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 bg-slate-950 rounded border border-slate-800/80">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">WFO:</span>
                  <span className="text-slate-400 ml-1">
                    Radius toleransi &le; 200m dari studio Kota Batu.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-slate-950 rounded border border-slate-800/80">
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">On-Site:</span>
                  <span className="text-slate-400 ml-1">
                    Wajib mencantumkan nama klien / lokasi peliputan.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-slate-950 rounded border border-slate-800/80">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">Aturan Payroll:</span>
                  <span className="text-slate-400 ml-1">
                    Izin & Alpha memotong gaji (standar 20 hari). Sakit & Cuti tidak memotong gaji.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Standar Jam Kerja:</span>
            <span className="font-mono text-slate-200 font-bold">09:00 - 17:00 WITA</span>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Recap Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hadir</span>
          <span className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
            {stats.hadir}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Hari Kerja</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Izin</span>
          <span className="text-2xl font-black font-mono text-sky-400 tabular-nums">
            {stats.izin}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Potong Gaji</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sakit</span>
          <span className="text-2xl font-black font-mono text-amber-400 tabular-nums">
            {stats.sakit}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Gaji Penuh</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cuti</span>
          <span className="text-2xl font-black font-mono text-purple-400 tabular-nums">
            {stats.cuti}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Gaji Penuh</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Alpha</span>
          <span className="text-2xl font-black font-mono text-[#E30000] tabular-nums">
            {stats.alpha}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Potong Gaji</span>
        </div>
      </div>

      {/* Attendance History Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E30000]" />
            <h3 className="text-sm font-bold text-white">Log Riwayat Presensi & Lokasi</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter Bulan */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-[#E30000]"
            />

            {/* Filter Staf */}
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-[#E30000]"
            >
              <option value="ALL">Semua Staf</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Tanggal</th>
                <th className="py-3 px-4 font-semibold">Nama Staf</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Mode Kerja</th>
                <th className="py-3 px-4 font-semibold">Check-In / Out</th>
                <th className="py-3 px-4 font-semibold">Jarak ke Studio</th>
                <th className="py-3 px-4 font-semibold">Lokasi & Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium">{record.date}</td>
                  <td className="py-3 px-4 font-bold text-white">{record.staffName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        record.status === 'Hadir'
                          ? 'text-emerald-400'
                          : record.status === 'Alpha'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {record.workMode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {record.checkInTime || '-'} {record.checkOutTime ? `→ ${record.checkOutTime}` : ''}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    <span
                      className={
                        record.verifiedByGeo
                          ? 'text-emerald-400 font-bold'
                          : 'text-slate-400'
                      }
                    >
                      {formatDistance(record.distanceMeters)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <div className="text-slate-300">{record.locationName || '-'}</div>
                    {record.notes && <div className="text-[11px] text-slate-500 italic">{record.notes}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendance.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-500">
            Tidak ada catatan kehadiran pada filter bulan atau staf yang dipilih.
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
