import React, { useState, useEffect } from 'react';
import {
  StaffUser,
  AttendanceRecord,
  ContentFeeItem,
  PayrollRecord,
  GasSyncConfig,
} from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { StaffDirectoryView } from './components/StaffDirectoryView';
import { GeoAttendanceView } from './components/GeoAttendanceView';
import { PayrollModuleView } from './components/PayrollModuleView';
import { ProjectControlSyncView } from './components/ProjectControlSyncView';
import {
  STUDIO_COORDINATES,
  calculateDistanceMeters,
} from './utils/geo';
import { Layers, CheckCircle2, RotateCcw } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'directory' | 'attendance' | 'payroll' | 'sync'>('directory');

  // Application Data States
  const [staffList, setStaffList] = useState<StaffUser[]>(() => StorageService.getStaff());
  const [currentUserId, setCurrentUserId] = useState<string>(() => StorageService.getActiveUserId());
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [contentFees, setContentFees] = useState<ContentFeeItem[]>(() => StorageService.getContentFees());
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>(() => StorageService.getPayroll());
  const [gasConfig, setGasConfig] = useState<GasSyncConfig>(() => StorageService.getGasConfig());

  // Real-time Geolocation distance to Studio Kota Batu
  const [currentDistance, setCurrentDistance] = useState<number | undefined>(undefined);

  // Active User
  const currentUser = staffList.find((s) => s.id === currentUserId) || staffList[0];

  // Geolocation detection on mount
  const refreshDistance = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = calculateDistanceMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            STUDIO_COORDINATES.latitude,
            STUDIO_COORDINATES.longitude
          );
          setCurrentDistance(dist);
        },
        () => {
          // Fallback simulation near Studio Kota Batu
          const fallbackDist = calculateDistanceMeters(
            -7.8712,
            112.5271,
            STUDIO_COORDINATES.latitude,
            STUDIO_COORDINATES.longitude
          );
          setCurrentDistance(fallbackDist);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  useEffect(() => {
    refreshDistance();
  }, []);

  // Save changes to storage
  const handleUpdateStaff = (updated: StaffUser) => {
    const list = staffList.map((s) => (s.id === updated.id ? updated : s));
    setStaffList(list);
    StorageService.saveStaff(list);
  };

  const handleAddStaff = (newStaff: StaffUser) => {
    const list = [newStaff, ...staffList];
    setStaffList(list);
    StorageService.saveStaff(list);
  };

  const handleSelectUser = (user: StaffUser) => {
    setCurrentUserId(user.id);
    StorageService.setActiveUserId(user.id);
  };

  const handleAddAttendance = (record: AttendanceRecord) => {
    const list = [record, ...attendanceList];
    setAttendanceList(list);
    StorageService.saveAttendance(list);
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    const list = attendanceList.map((a) => (a.id === record.id ? record : a));
    setAttendanceList(list);
    StorageService.saveAttendance(list);
  };

  const handleSavePayroll = (record: PayrollRecord) => {
    const list = [record, ...payrollList];
    setPayrollList(list);
    StorageService.savePayroll(list);
  };

  const handleUpdatePayrollStatus = (id: string, status: 'Belum' | 'Lunas', paymentDate?: string) => {
    const list = payrollList.map((p) =>
      p.id === id ? { ...p, paymentStatus: status, paymentDate } : p
    );
    setPayrollList(list);
    StorageService.savePayroll(list);
  };

  const handleUpdateGasConfig = (config: GasSyncConfig) => {
    setGasConfig(config);
    StorageService.saveGasConfig(config);
  };

  const handleImportStaff = (newList: StaffUser[]) => {
    setStaffList(newList);
    StorageService.saveStaff(newList);
  };

  const handleSyncFromSheet = () => {
    // Reload local storage state
    setStaffList(StorageService.getStaff());
    setAttendanceList(StorageService.getAttendance());
    setContentFees(StorageService.getContentFees());
    setPayrollList(StorageService.getPayroll());
  };

  const handleResetToSeed = () => {
    if (confirm('Kembalikan seluruh database staf, absensi, dan fee ke data seed awal obeecreatives?')) {
      StorageService.resetToSeed();
      setStaffList(StorageService.getStaff());
      setAttendanceList(StorageService.getAttendance());
      setContentFees(StorageService.getContentFees());
      setPayrollList(StorageService.getPayroll());
      alert('Data berhasil di-reset ke seed awal.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#E30000] selection:text-white">
      {/* Header & Navigation */}
      <Header
        staffList={staffList}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentDistance={currentDistance}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'directory' && (
          <StaffDirectoryView
            staffList={staffList}
            currentUser={currentUser}
            onUpdateStaff={handleUpdateStaff}
            onAddStaff={handleAddStaff}
            onResetToSeed={handleResetToSeed}
          />
        )}

        {activeTab === 'attendance' && (
          <GeoAttendanceView
            staffList={staffList}
            currentUser={currentUser}
            attendanceList={attendanceList}
            onAddAttendance={handleAddAttendance}
            onUpdateAttendance={handleUpdateAttendance}
            currentDistance={currentDistance}
            onRefreshDistance={refreshDistance}
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollModuleView
            payrollList={payrollList}
            staffList={staffList}
            attendanceList={attendanceList}
            contentFees={contentFees}
            currentUser={currentUser}
            gasConfig={gasConfig}
            onSavePayroll={handleSavePayroll}
            onUpdatePayrollStatus={handleUpdatePayrollStatus}
          />
        )}

        {activeTab === 'sync' && (
          <ProjectControlSyncView
            staffList={staffList}
            gasConfig={gasConfig}
            onUpdateGasConfig={handleUpdateGasConfig}
            onSyncFromSheet={handleSyncFromSheet}
            onImportStaff={handleImportStaff}
            contentFees={contentFees}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">obeecreatives</span>
            <span>&middot;</span>
            <span>Staff &amp; HR Operations Portal</span>
            <span>&middot;</span>
            <span className="font-mono text-[11px] text-slate-600">v2.4 Headless GAS</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleResetToSeed}
              className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1"
              title="Reset ke data seed awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Seed</span>
            </button>
            <span>&copy; {new Date().getFullYear()} obeecreatives. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Offline Mode Indicator */}
      <OfflineIndicator />
    </div>
  );
}
