import React, { useState } from 'react';
import { StaffUser, GasSyncConfig, ContentFeeItem } from '../types';
import {
  RefreshCw,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Link,
  ShieldCheck,
  FileJson,
  FileSpreadsheet,
  Layers,
  Search,
  Upload,
  ClipboardPaste,
  X,
  FileText,
} from 'lucide-react';
import { HEADLESS_GAS_SCRIPT_TEMPLATE } from '../utils/gasCodeTemplate';
import { StorageService } from '../services/storage';
import { parseSheetDataToStaff } from '../utils/csvParser';

interface ProjectControlSyncViewProps {
  staffList: StaffUser[];
  gasConfig: GasSyncConfig;
  onUpdateGasConfig: (config: GasSyncConfig) => void;
  onSyncFromSheet: () => void;
  onImportStaff: (newList: StaffUser[]) => void;
  contentFees: ContentFeeItem[];
}

export const ProjectControlSyncView: React.FC<ProjectControlSyncViewProps> = ({
  staffList,
  gasConfig,
  onUpdateGasConfig,
  onSyncFromSheet,
  onImportStaff,
  contentFees,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(gasConfig.gasWebhookUrl);
  const [spreadsheetId, setSpreadsheetId] = useState(gasConfig.spreadsheetId);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    { ok: boolean; message: string; timestamp: string } | null
  >(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [syncingNow, setSyncingNow] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Modal Impor Langsung State
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawPastedText, setRawPastedText] = useState('');
  const [previewParsedStaff, setPreviewParsedStaff] = useState<StaffUser[]>([]);
  const [parseError, setParseError] = useState('');

  const handlePreviewParse = () => {
    if (!rawPastedText.trim()) {
      setParseError('Data teks masih kosong. Silakan paste data dari Google Sheet.');
      return;
    }
    const { staffList: parsed, errors } = parseSheetDataToStaff(rawPastedText);
    if (parsed.length === 0) {
      setParseError(errors[0] || 'Gagal membaca format data. Pastikan menyertakan baris judul kolom (header).');
      setPreviewParsedStaff([]);
    } else {
      setParseError('');
      setPreviewParsedStaff(parsed);
    }
  };

  const handleApplyImport = () => {
    if (previewParsedStaff.length === 0) return;
    onImportStaff(previewParsedStaff);
    setShowImportModal(false);
    setRawPastedText('');
    setPreviewParsedStaff([]);
  };

  // Audit Nama Creator vs Database Staf
  // Mencegah salah hitung fee akibat typo penulisan nama kreator di kartu konten kanban
  const staffNames = staffList.map((s) => s.name.toLowerCase().trim());
  const auditResults = contentFees.map((item) => {
    const creatorLower = item.creatorName.toLowerCase().trim();
    const isMatched = staffNames.includes(creatorLower);
    return {
      contentId: item.id,
      title: item.contentTitle,
      creatorName: item.creatorName,
      feeAmount: item.feeAmount,
      isMatched,
      suggestedStaff: staffList.find(
        (s) =>
          s.name.toLowerCase().includes(creatorLower) ||
          creatorLower.includes(s.name.toLowerCase().split(' ')[0])
      )?.name,
    };
  });

  const handleSaveConfig = () => {
    const updated: GasSyncConfig = {
      ...gasConfig,
      gasWebhookUrl: webhookUrl,
      spreadsheetId: spreadsheetId,
    };
    onUpdateGasConfig(updated);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!webhookUrl) {
      return;
    }

    setTestingConnection(true);
    setConnectionStatus(null);

    const targetUrl = `${webhookUrl}?action=handshake`;

    try {
      // 1. Coba lewat proxy internal terlebih dahulu (mengatasi CORS & 302 redirect Google)
      let data: any = null;
      try {
        const proxyRes = await fetch(`/api/gas-proxy?url=${encodeURIComponent(targetUrl)}`);
        data = await proxyRes.json();
      } catch {
        // Fallback langsung via browser
        const directRes = await fetch(targetUrl, { method: 'GET', mode: 'cors' });
        data = await directRes.json();
      }

      setTestingConnection(false);

      if (data && data.status === 'online') {
        // Otomatis simpan konfigurasi saat handshake berhasil
        const updated: GasSyncConfig = {
          ...gasConfig,
          gasWebhookUrl: webhookUrl,
          spreadsheetId: spreadsheetId,
        };
        onUpdateGasConfig(updated);
        setSaveFeedback(true);
        setTimeout(() => setSaveFeedback(false), 2500);

        setConnectionStatus({
          ok: true,
          message: `Koneksi Berhasil! ${data.app || 'Headless GAS Engine'} (Status: Online) — Konfigurasi otomatis tersimpan.`,
          timestamp: new Date().toLocaleTimeString('id-ID'),
        });
      } else if (data && data.isHtml) {
        setConnectionStatus({
          ok: false,
          message: `Deployment Web App Anda masih mengeksekusi doGet() lama di file "Kode.gs" yang mengembalikan tampilan HTML Web App (bukan JSON). Masukkan 3 baris router di awal doGet() file Kode.gs seperti panduan di bawah.`,
          timestamp: new Date().toLocaleTimeString('id-ID'),
        });
      } else {
        setConnectionStatus({
          ok: false,
          message: data?.message || 'Server merespon namun format data tidak dikenali.',
          timestamp: new Date().toLocaleTimeString('id-ID'),
        });
      }
    } catch (err: any) {
      setTestingConnection(false);
      setConnectionStatus({
        ok: false,
        message: `Gagal terhubung (${err.message}). Pastikan Deployment Web App di Google diset 'Who has access: Anyone' (Siapa saja).`,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(staffList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `obeecreatives_staff_database_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = [
      'id',
      'name',
      'email',
      'role',
      'department',
      'jobTitle',
      'workMode',
      'phone',
      'pin',
      'status',
      'baseSalary',
      'allowance',
      'bankName',
      'accountNumber',
      'accountHolder',
      'skills',
    ];

    const rows = staffList.map((s) => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.role}"`,
      `"${s.department || ''}"`,
      `"${s.jobTitle || ''}"`,
      `"${s.workMode || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.pin || ''}"`,
      `"${s.status || ''}"`,
      s.baseSalary || 0,
      s.allowance || 0,
      `"${s.bankAccount?.bankName || ''}"`,
      `"${s.bankAccount?.accountNumber || ''}"`,
      `"${s.bankAccount?.accountHolder || ''}"`,
      `"${(s.skills || []).join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `obeecreatives_staff_database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(HEADLESS_GAS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyJsonSchema = () => {
    navigator.clipboard.writeText(JSON.stringify(staffList, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleTriggerSync = async () => {
    if (!webhookUrl) {
      alert('Masukkan URL Webhook Google Apps Script terlebih dahulu.');
      return;
    }

    setSyncingNow(true);
    const targetUrl = `${webhookUrl}?action=getStaffList`;

    try {
      let json: any = null;
      try {
        const proxyRes = await fetch(`/api/gas-proxy?url=${encodeURIComponent(targetUrl)}`);
        json = await proxyRes.json();
      } catch {
        const directRes = await fetch(targetUrl, { method: 'GET', mode: 'cors' });
        json = await directRes.json();
      }

      if (json && json.isHtml) {
        setSyncingNow(false);
        alert('Google Apps Script masih mengembalikan tampilan HTML Web App lama, bukan data JSON. Ikuti panduan router doGet() di bagian bawah tab ini.');
        return;
      }

      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        // Map raw sheet data to StaffUser
        const mappedStaff: StaffUser[] = json.data.map((r: any, idx: number) => {
          const cleanNum = (val: any) => {
            if (!val) return 0;
            const cleaned = String(val).replace(/[^0-9]/g, '');
            return cleaned ? parseInt(cleaned, 10) : 0;
          };

          return {
            id: String(r.ID || ('STF-' + Date.now() + idx)),
            name: String(r.Nama || ''),
            email: String(r.Email || ''),
            role: (r.Role || (String(r.Nama || '').toLowerCase().includes('mahendra') ? 'admin' : 'staff_creator')) as any,
            department: (r.Divisi || 'Creative Content') as any,
            jobTitle: String(r.Jabatan || 'Staf Kreatif'),
            workMode: (r.WorkMode || 'WFO') as any,
            status: (r.Status || 'Aktif - PKWT') as any,
            phone: String(r.NoTelpon || ''),
            pin: String(r.PIN || '123456'),
            baseSalary: cleanNum(r.GajiPokok),
            allowance: cleanNum(r.TunjJabatan),
            bankAccount: {
              bankName: r.NamaBank || (String(r.Catatan || '').includes('Bank') ? String(r.Catatan).split(' ')[1] : 'Bank'),
              accountNumber: String(r.NoRekening || '-'),
              accountHolder: String(r.Nama || ''),
            },
            notes: String(r.Catatan || ''),
          };
        });

        onImportStaff(mappedStaff);
        setSyncingNow(false);
        alert(`Berhasil menarik ${mappedStaff.length} data staf asli secara live dari Google Sheet!`);
      } else {
        setSyncingNow(false);
        alert(json?.message || 'Data staf dari Google Apps Script kosong atau belum sesuai format.');
      }
    } catch (err: any) {
      setSyncingNow(false);
      alert(`Gagal menarik data via Webhook: ${err.message}. Periksa file HeadlessApi di Google Apps Script dan pastikan deployment versi baru sudah terpasang.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-[#E30000] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Headless Architecture &middot; v2.4</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Integrasi Project Control & Google Apps Script (GAS)
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Jembatan sinkronisasi data dua arah antara Spreadsheet Project Control (Konten & Fee), Database Staf, dan Portal Web React ini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-xs font-semibold shadow-sm transition-colors"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Impor / Paste dari Sheet</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={syncingNow}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingNow ? 'animate-spin' : ''}`} />
              <span>{syncingNow ? 'Menyinkronkan...' : 'Tarik via Webhook'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Webhook Settings & Audit Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Koneksi Webhook GAS */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Link className="w-4 h-4 text-[#E30000]" />
            <h2 className="text-sm font-bold text-white">
              Konfigurasi API Gateway Google Apps Script
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                URL Deployment Web App Google Apps Script (/exec)
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 text-[11px] focus:outline-none focus:border-[#E30000]"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Diambil dari Deployment Web App dengan hak akses: <strong>Anyone (Siapa saja)</strong>.
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Spreadsheet ID Project Control
              </label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 text-[11px] focus:outline-none focus:border-[#E30000]"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Target Sheet: ContentTracker, FeeIntegrationLog, Staff.
              </span>
            </div>

            {connectionStatus && (
              <div
                className={`p-3 rounded text-xs border ${
                  connectionStatus.ok
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {connectionStatus.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Status Handshake ({connectionStatus.timestamp})</span>
                </div>
                <div className="mt-1 text-[11px] leading-relaxed">{connectionStatus.message}</div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors"
              >
                {testingConnection ? 'Menguji...' : 'Uji Koneksi (Handshake)'}
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className={`px-4 py-2 rounded font-semibold transition-all flex items-center gap-1.5 ${
                  saveFeedback
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#E30000] hover:bg-red-700 text-white'
                }`}
              >
                {saveFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <span>Simpan Konfigurasi</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Panel Audit Akurasi Nama Kreator (Pencegah Typo Fee) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">
                  Audit Akurasi Nama Kreator Konten
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                Pencegah Typo Fee
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              Memeriksa kecocokan penulisan nama di kartu konten kanban Project Control terhadap Database Staf agar hak fee tidak hilang atau bernilai Rp 0.
            </p>

            <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
              {auditResults.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950 border border-slate-800/80 rounded flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-slate-200 truncate">{item.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>Kreator: <strong>{item.creatorName}</strong></span>
                      <span>&middot;</span>
                      <span className="font-mono text-amber-400">Rp {item.feeAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div>
                    {item.isMatched ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                        Cocok 100%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
                        Typo / Beda Nama
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Tips: Pastikan nama di field Creator pada Google Sheet sama persis dengan nama di direktori staf.
          </div>
        </div>
      </div>

      {/* Export Schema Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileJson className="w-4 h-4 text-[#E30000]" />
              Ekspor Data Terstruktur (Interface StaffUser)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kompatibel penuh dengan skema TypeScript obeecreatives Workspace OS &amp; Project Control.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJsonSchema}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Tersalin!' : 'Salin JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Unduh .JSON</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 bg-[#E30000] hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh .CSV</span>
            </button>
          </div>
        </div>

        {/* JSON Preview Codebox */}
        <div className="mt-4">
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-emerald-400 max-h-48 overflow-y-auto leading-relaxed">
            {JSON.stringify(staffList.slice(0, 3), null, 2)}
          </pre>
          <div className="text-[10px] text-slate-500 mt-1">
            * Menampilkan sampel 3 dari total {staffList.length} entri data staf.
          </div>
        </div>
      </div>

      {/* Headless GAS Script Generator Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/80 rounded text-xs text-emerald-200">
          <div className="font-bold flex items-center gap-1.5 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Solusi 1 File Tunggal: Mengganti Seluruh Isi Code.gs</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-200/90 leading-relaxed">
            Agar tidak ada file yang bentrok, Anda cukup memiliki <strong>satu file saja</strong> yaitu <code>Code.gs</code> (atau <code>Kode</code>). Hapus file <code>HeadlessApi</code> jika sempat dibuat, buka file <code>Kode</code>, kosongkan isinya (<strong>Ctrl + A</strong> &rarr; <strong>Delete</strong>), lalu tempel seluruh kode utuh di bawah ini.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">
                Kode Utuh Lengkap: Code.gs (Pengganti Tunggal 100%)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Salin kode utuh di bawah lalu tempelkan menggantikan seluruh isi file <code className="text-amber-300 font-mono">Kode / Code.gs</code> di editor Apps Script Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-4 py-2 bg-[#E30000] hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Kode Utuh Berhasil Disalin!' : 'Salin Seluruh Kode Code.gs'}</span>
          </button>
        </div>

        <div className="mt-4">
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-300 max-h-64 overflow-y-auto leading-relaxed whitespace-pre">
            {HEADLESS_GAS_SCRIPT_TEMPLATE}
          </pre>
        </div>
      </div>

      {/* MODAL IMPOR LANGSUNG DARI SHEET (Copy-Paste / File) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden max-h-[82vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Impor &amp; Sinkronkan Data Asli dari Google Sheet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cara Kerja:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  1. Buka tab sheet <strong>&quot;Staff&quot;</strong> di Google Sheet Anda.<br />
                  2. Blok seluruh tabel (mulai dari baris header: <code className="text-amber-300">ID, Nama, Divisi, ...</code>) lalu tekan <strong>Ctrl + C</strong>.<br />
                  3. Tempel (Paste / <strong>Ctrl + V</strong>) di kotak bawah ini, lalu klik &quot;Uji &amp; Tampilkan Pratinjau&quot;.
                </p>
              </div>

              <div>
                <label className="text-slate-200 font-semibold block mb-1">
                  Tempelkan (Paste) Teks Tabel / CSV Google Sheet di sini:
                </label>
                <textarea
                  rows={6}
                  value={rawPastedText}
                  onChange={(e) => setRawPastedText(e.target.value)}
                  placeholder="ID&#9;Nama&#9;Divisi&#9;Status&#9;Jabatan&#9;GajiPokok...&#10;STF-1785295519572&#9;Adissa Rifdah Aulia&#9;Social Media Management..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-200 focus:outline-none focus:border-[#E30000]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviewParse}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Uji &amp; Tampilkan Pratinjau</span>
                </button>
                {previewParsedStaff.length > 0 && (
                  <span className="text-emerald-400 font-bold">
                    ✓ Terdeteksi {previewParsedStaff.length} staf siap diimpor
                  </span>
                )}
              </div>

              {parseError && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded text-xs">
                  {parseError}
                </div>
              )}

              {previewParsedStaff.length > 0 && (
                <div className="mt-3 border border-slate-800 rounded overflow-hidden">
                  <div className="p-2 bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-300">
                    Pratinjau Staf yang Akan Diperbarui:
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-950 text-slate-400">
                        <tr>
                          <th className="p-2">Nama</th>
                          <th className="p-2">Divisi</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Gaji Pokok</th>
                          <th className="p-2">Rekening Bank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {previewParsedStaff.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-2 font-bold text-white">{s.name}</td>
                            <td className="p-2 text-slate-300">{s.department}</td>
                            <td className="p-2 font-mono text-[10px]">{s.role}</td>
                            <td className="p-2 font-mono text-emerald-400">
                              Rp {(s.baseSalary || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-2 font-mono text-slate-300">
                              {s.bankAccount?.bankName} ({s.bankAccount?.accountNumber})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0 bg-slate-950">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={previewParsedStaff.length === 0}
                onClick={handleApplyImport}
                className="px-5 py-2 bg-[#E30000] hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-sm"
              >
                Terapkan &amp; Sinkronkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
