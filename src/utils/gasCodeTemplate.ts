/**
 * Kode Utuh Lengkap: Code.gs (Gabungan Baseline v1-v12 + Headless REST API Gateway)
 * File tunggal ini menggantikan seluruh isi file "Kode" / "Code.gs" di Google Apps Script.
 */

export const HEADLESS_GAS_SCRIPT_TEMPLATE = `/**
 * ============================================================================
 * DATABASE STAFF & HR OPERATIONS - OBEECREATIVES
 * Baseline v1-v12 [LOCKED] + v2.4 Headless REST API Gateway (Integrated)
 * Developed by lalumahendra/obeecreatives
 * ============================================================================
 */

// ==================== KONFIGURASI ====================

const SHEET_NAME = 'Staff';

const ADMIN_EMAILS = [
  'loehendra@gmail.com', // Owner
  'loevie02@gmail.com',  // Vita
  'obeecreatives@gmail.com', // Perusahaan
  'obeetools@gmail.com', // Developer - default standar semua tools obeeTOOLS
];

const STAFF_EMAILS = [
  'dissaraulia@gmail.com',
  'aldrien.and@gmail.com',
  'labibmuhammad157@gmail.com',
  'putrikriswardani@gmail.com',
  'feedkreatif@gmail.com',
];

const DIVISI_OPTIONS = [
  'Photography',
  'Desain Grafis',
  'Videography',
  'Social Media Management',
  'Workshop/Pelatihan',
];

const STATUS_OPTIONS = [
  'Aktif - Karyawan Tetap',
  'Aktif - PKWT',
  'Aktif - Magang',
  'Aktif - Freelancer',
  'Nonaktif',
];

const COLUMNS = [
  'ID', 'Nama', 'Divisi', 'Status', 'Jabatan', 'GradeSkill',
  'GajiPokok', 'TunjJabatan', 'FreelancerFee',
  'TanggalMulai', 'TanggalAkhir',
  'JenisKelamin', 'NIK', 'NoKK', 'NoTelpon', 'Instagram', 'Alamat',
  'Email', 'FotoURL', 'Catatan', 'CreatedAt', 'UpdatedAt',
];

const SENSITIVE_FIELDS = ['NIK', 'NoKK'];

// ---- Konfigurasi Workload (v2) ----
const WORKLOAD_SHEET_NAME = 'Workload';

const WORKLOAD_COLUMNS = [
  'ID', 'StaffID', 'NamaTask', 'Divisi', 'Deadline',
  'Prioritas', 'Status', 'EstimasiJam', 'Catatan',
  'CreatedAt', 'UpdatedAt',
];

const PRIORITAS_OPTIONS = ['Low', 'Medium', 'High'];
const WORKLOAD_STATUS_OPTIONS = ['To Do', 'In Progress', 'Review', 'Done'];

// ---- Konfigurasi Attendance (v3) ----
const ATTENDANCE_SHEET_NAME = 'Attendance';

const ATTENDANCE_COLUMNS = [
  'ID', 'StaffID', 'Tanggal', 'Status', 'JamMasuk', 'JamKeluar', 'Catatan',
  'CreatedAt', 'UpdatedAt',
  'KeteranganTambahan',
];

const ATTENDANCE_STATUS_OPTIONS = ['Hadir', 'Izin', 'Sakit', 'Cuti', 'Alpha'];

// ---- Konfigurasi Auto-Attendance (v9) ----
const WORKING_DAYS_OF_WEEK = [1, 2, 3, 4, 6];
const JAM_MASUK_DEFAULT = '09:00';
const JAM_KELUAR_DEFAULT = '17:00';
const AUTO_ATTENDANCE_TRIGGER_FN = 'dailyAutoAttendanceTrigger';

// ---- Konfigurasi Integrasi Project Control ----
const PROJECT_CONTROL_SPREADSHEET_ID = '1el1tK4NGhoslMWECWzIo-7nBAEox6KZ-2TjlJ6WLIV8';
const PC_CONTENT_SHEET_NAME = 'ContentTracker';
const PC_FEELOG_SHEET_NAME = 'FeeIntegrationLog';
const PC_PUSHED_TO_LABEL = 'Payroll';

// ---- Konfigurasi Payroll (v4/v8/v11) ----
const PAYROLL_SHEET_NAME = 'Payroll';
const WORK_DAYS_PER_MONTH = 20;

const PAYROLL_COLUMNS = [
  'ID', 'StaffID', 'PeriodeAwal', 'PeriodeAkhir', 'HariHadir',
  'GajiPokokAmount', 'TunjJabatanAmount', 'KomponenTambahanJSON', 'LemburKerja',
  'TotalGajiKotor',
  'BPJSKetenagakerjaan', 'BPJSKesehatan', 'Premi', 'PajakPPh21', 'AngsuranPinjaman',
  'TotalPotongan', 'GajiDibayarkan',
  'StatusPembayaran', 'TanggalBayar', 'Catatan',
  'CreatedAt', 'UpdatedAt',
  'HariTidakMasuk',
  'GajiPokokBulanan', 'TunjJabatanBulanan',
];

const PAYROLL_STATUS_OPTIONS = ['Belum', 'Lunas'];

// ==================== ENTRY POINT UTAMA ====================

function doGet(e) {
  // [1] JALUR REST API HEADLESS (UNTUK PORTAL REACT OBEECREATIVES)
  if (e && e.parameter && e.parameter.action) {
    return handleHeadlessApi_(e);
  }

  // [2] JALUR WEB APP LAMA (HTML SERVICE)
  ensureSheetExists_();
  ensureWorkloadSheetExists_();
  ensureAttendanceSheetExists_();
  ensurePayrollSheetExists_();

  const email = getUserEmail_();
  const role = getUserRole_(email);

  if (!role) {
    const tpl = HtmlService.createTemplateFromFile('AccessDenied');
    tpl.email = email || '(tidak terdeteksi)';
    return tpl.evaluate()
      .setTitle('Akses Ditolak - Database Staff obeecreatives')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  const tpl = HtmlService.createTemplateFromFile('Index');
  tpl.role = role;
  tpl.email = email;
  return tpl.evaluate()
    .setTitle('Database Staff - obeecreatives')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === 'saveAttendance') {
      const record = postData.data;
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);
      if (!sheet) sheet = ensureAttendanceSheetExists_();

      sheet.appendRow([
        record.id || ('ATT-' + new Date().getTime()),
        record.staffId,
        record.date,
        record.status || 'Hadir',
        record.checkInTime || '',
        record.checkOutTime || '',
        record.notes || '',
        new Date(),
        new Date(),
        record.workMode || 'WFO'
      ]);
      return createJsonResponse_({ success: true, message: 'Presensi berhasil disimpan' });
    }

    return createJsonResponse_({ success: false, message: 'Aksi post tidak dikenal' });
  } catch (err) {
    return createJsonResponse_({ success: false, error: err.toString() });
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==================== REST API JSON HANDLER (HEADLESS) ====================

function createJsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleHeadlessApi_(e) {
  try {
    const params = e.parameter || {};
    const action = params.action;

    // A. Handshake (Uji Koneksi)
    if (action === 'handshake') {
      return createJsonResponse_({
        status: 'online',
        app: 'obeecreatives Staff & HR Operations Portal Gateway',
        version: 'v2.4-headless',
        timestamp: new Date().toISOString()
      });
    }

    // B. Ambil Seluruh Data Staf
    if (action === 'getStaffList') {
      const sheet = getSheet_();
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return createJsonResponse_({ success: true, count: 0, data: [] });
      }

      const lastCol = sheet.getLastColumn();
      const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = values[0];
      const staffList = [];

      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (!row[0] && !row[1]) continue;
        const item = {};
        for (let c = 0; c < headers.length; c++) {
          const key = String(headers[c]).trim();
          let val = row[c];
          if (val instanceof Date) {
            val = dateToSafeString_(val);
          }
          item[key] = (val !== null && val !== undefined) ? val : '';
        }
        staffList.push(item);
      }

      return createJsonResponse_({
        success: true,
        count: staffList.length,
        data: staffList
      });
    }

    // C. Tarik Fee Konten dari Project Control
    if (action === 'pullProjectControlFees') {
      const staffName = params.staffName;
      const startStr = params.startDate;
      const endStr = params.endDate;
      if (!staffName || !startStr || !endStr) {
        return createJsonResponse_({ success: false, message: 'Parameter staffName, startDate, endDate wajib diisi.' });
      }

      const pcSs = SpreadsheetApp.openById(PROJECT_CONTROL_SPREADSHEET_ID);
      const contentSheet = pcSs.getSheetByName(PC_CONTENT_SHEET_NAME);
      const feeLogSheet = pcSs.getSheetByName(PC_FEELOG_SHEET_NAME);

      const usedMap = {};
      if (feeLogSheet && feeLogSheet.getLastRow() > 1) {
        const logData = feeLogSheet.getRange(2, 1, feeLogSheet.getLastRow() - 1, 1).getValues();
        logData.forEach(function(r) { if (r[0]) usedMap[r[0]] = true; });
      }

      const cData = contentSheet.getDataRange().getValues();
      const headers = cData[0];
      const col = {};
      headers.forEach(function(h, idx) { col[h] = idx; });

      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
      endDate.setHours(23, 59, 59);

      const grouped = {};
      for (let i = 1; i < cData.length; i++) {
        const r = cData[i];
        const id = r[col['ID']];
        if (!id || usedMap[id]) continue;

        const fee = Number(r[col['FeeAmount']]) || 0;
        if (fee <= 0) continue;

        const creator = String(r[col['Creator']] || '').trim().toLowerCase();
        if (creator !== staffName.trim().toLowerCase()) continue;

        const tglApprove = new Date(r[col['TanggalApprove']]);
        if (isNaN(tglApprove.getTime()) || tglApprove < startDate || tglApprove > endDate) continue;

        const jenis = r[col['JenisKonten']] || 'Lain-lain';
        if (!grouped[jenis]) grouped[jenis] = { total: 0, count: 0, contentIds: [] };
        grouped[jenis].total += fee;
        grouped[jenis].count += 1;
        grouped[jenis].contentIds.push(id);
      }

      const feeItems = [];
      let totalSum = 0;
      Object.keys(grouped).forEach(function(jenis) {
        const g = grouped[jenis];
        const rate = g.count > 0 ? Math.round(g.total / g.count) : 0;
        feeItems.push({
          label: 'Fee Konten - ' + jenis,
          rate: rate,
          qty: g.count,
          subtotal: g.total,
          contentIds: g.contentIds,
          isProjectControl: true
        });
        totalSum += g.total;
      });

      return createJsonResponse_({ success: true, feeItems: feeItems, totalSum: totalSum });
    }

    return createJsonResponse_({ success: false, message: 'Action tidak dikenal' });
  } catch (err) {
    return createJsonResponse_({ success: false, error: err.toString() });
  }
}

// ==================== AUTH HELPERS ====================

function getUserEmail_() {
  try {
    return Session.getActiveUser().getEmail().toLowerCase().trim();
  } catch (err) {
    return '';
  }
}

function getUserRole_(email) {
  if (!email) return null;
  const isAdmin = ADMIN_EMAILS.some(function (e) { return e.toLowerCase().trim() === email; });
  if (isAdmin) return 'admin';
  const isStaff = STAFF_EMAILS.some(function (e) { return e.toLowerCase().trim() === email; });
  if (isStaff) return 'staff';
  return null;
}

function requireAdmin_() {
  const role = getUserRole_(getUserEmail_());
  if (role !== 'admin') {
    throw new Error('Akses ditolak. Hanya Admin yang bisa melakukan aksi ini.');
  }
}

// ==================== SHEET HELPERS ====================

function ensureSheetExists_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
  }
  return sheet;
}

function getSheet_() {
  return ensureSheetExists_();
}

function ensureWorkloadSheetExists_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(WORKLOAD_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(WORKLOAD_SHEET_NAME);
    sheet.appendRow(WORKLOAD_COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, WORKLOAD_COLUMNS.length).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
  }
  return sheet;
}

function getWorkloadSheet_() {
  return ensureWorkloadSheetExists_();
}

function ensureAttendanceSheetExists_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ATTENDANCE_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(ATTENDANCE_SHEET_NAME);
    sheet.appendRow(ATTENDANCE_COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, ATTENDANCE_COLUMNS.length).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
  } else {
    migrateGenericHeaders_(sheet, ATTENDANCE_COLUMNS);
  }
  return sheet;
}

function migrateGenericHeaders_(sheet, columnsDefinition) {
  const lastCol = sheet.getLastColumn();
  const existingHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  const missingCols = columnsDefinition.filter(function (col) { return existingHeaders.indexOf(col) === -1; });
  if (missingCols.length > 0) {
    const startCol = lastCol + 1;
    sheet.getRange(1, startCol, 1, missingCols.length).setValues([missingCols]);
    sheet.getRange(1, startCol, 1, missingCols.length).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
  }
}

function getAttendanceSheet_() {
  return ensureAttendanceSheetExists_();
}

function ensurePayrollSheetExists_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PAYROLL_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PAYROLL_SHEET_NAME);
    sheet.appendRow(PAYROLL_COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, PAYROLL_COLUMNS.length).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
  } else {
    migratePayrollHeaders_(sheet);
  }
  return sheet;
}

function migratePayrollHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  const existingHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  const missingCols = PAYROLL_COLUMNS.filter(function (col) { return existingHeaders.indexOf(col) === -1; });
  if (missingCols.length > 0) {
    const startCol = lastCol + 1;
    sheet.getRange(1, startCol, 1, missingCols.length).setValues([missingCols]);
    sheet.getRange(1, startCol, 1, missingCols.length).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
  }
}

function getPayrollSheet_() {
  return ensurePayrollSheetExists_();
}

function rowToObjectGeneric_(row, columns) {
  const obj = {};
  columns.forEach(function (col, i) {
    obj[col] = row[i] !== undefined ? row[i] : '';
  });
  return obj;
}

function objectToRowGeneric_(obj, columns) {
  return columns.map(function (col) {
    return obj[col] !== undefined ? obj[col] : '';
  });
}

function rowToObject_(row) {
  const obj = {};
  COLUMNS.forEach(function (col, i) {
    obj[col] = row[i] !== undefined ? row[i] : '';
  });
  return obj;
}

function objectToRow_(obj) {
  return COLUMNS.map(function (col) {
    return obj[col] !== undefined ? obj[col] : '';
  });
}

// ==================== COMPUTED FIELDS ====================

function formatRupiah_(number) {
  const n = Math.round(Number(number) || 0);
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function timeToSafeString_(val) {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return pad(val.getHours()) + ':' + pad(val.getMinutes());
  }
  return String(val);
}

function dateToSafeString_(val) {
  if (!val) return '';
  const d = (val instanceof Date) ? val : new Date(val);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function calcDurasi_(tanggalAkhir) {
  if (!tanggalAkhir) return '-';
  const akhir = new Date(tanggalAkhir);
  if (isNaN(akhir.getTime())) return '-';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  akhir.setHours(0, 0, 0, 0);
  const diffDays = Math.round((akhir - today) / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return diffDays + ' Hari Lagi';
  if (diffDays === 0) return 'Berakhir Hari Ini';
  return 'Berakhir ' + Math.abs(diffDays) + ' Hari Lalu';
}

function enrichStaffObject_(obj) {
  const gajiPokok = Number(obj.GajiPokok) || 0;
  const tunjJabatan = Number(obj.TunjJabatan) || 0;
  obj.GajiTunjangan = gajiPokok + tunjJabatan;
  obj.GajiTunjanganDisplay = formatRupiah_(obj.GajiTunjangan);
  obj.GajiPokokDisplay = formatRupiah_(gajiPokok);
  obj.TunjJabatanDisplay = formatRupiah_(tunjJabatan);
  obj.FreelancerFeeDisplay = formatRupiah_(obj.FreelancerFee);
  obj.Durasi = calcDurasi_(obj.TanggalAkhir);
  obj.TanggalMulai = dateToSafeString_(obj.TanggalMulai);
  obj.TanggalAkhir = dateToSafeString_(obj.TanggalAkhir);
  obj.CreatedAt = dateToSafeString_(obj.CreatedAt);
  obj.UpdatedAt = dateToSafeString_(obj.UpdatedAt);
  return obj;
}

function redactSensitiveFields_(obj, role) {
  if (role !== 'admin') {
    SENSITIVE_FIELDS.forEach(function (field) {
      delete obj[field];
    });
  }
  return obj;
}

// ==================== PUBLIC API (LEGACY DASHBOARD) ====================

function getInitData() {
  try {
    const email = getUserEmail_();
    const role = getUserRole_(email);
    if (!role) throw new Error('Akses ditolak.');

    const sheet = getSheet_();
    const lastRow = sheet.getLastRow();
    let staffList = [];

    if (lastRow > 1) {
      const values = sheet.getRange(2, 1, lastRow - 1, COLUMNS.length).getValues();
      staffList = values
        .map(function (row) { return rowToObject_(row); })
        .filter(function (obj) { return obj.ID; })
        .map(function (obj) { return enrichStaffObject_(obj); })
        .map(function (obj) { return redactSensitiveFields_(obj, role); });
    }

    const staffNameById = {};
    staffList.forEach(function (s) { staffNameById[s.ID] = s.Nama; });

    const wSheet = getWorkloadSheet_();
    const wLastRow = wSheet.getLastRow();
    let workloadList = [];
    if (wLastRow > 1) {
      const wValues = wSheet.getRange(2, 1, wLastRow - 1, WORKLOAD_COLUMNS.length).getValues();
      workloadList = wValues
        .map(function (row) { return rowToObjectGeneric_(row, WORKLOAD_COLUMNS); })
        .filter(function (obj) { return obj.ID; })
        .map(function (obj) {
          obj.StaffNama = staffNameById[obj.StaffID] || '(staff tidak ditemukan)';
          obj.Deadline = dateToSafeString_(obj.Deadline);
          obj.CreatedAt = dateToSafeString_(obj.CreatedAt);
          obj.UpdatedAt = dateToSafeString_(obj.UpdatedAt);
          return obj;
        });
    }

    const aSheet = getAttendanceSheet_();
    const aLastRow = aSheet.getLastRow();
    let attendanceList = [];
    if (aLastRow > 1) {
      const aValues = aSheet.getRange(2, 1, aLastRow - 1, ATTENDANCE_COLUMNS.length).getValues();
      attendanceList = aValues
        .map(function (row) { return rowToObjectGeneric_(row, ATTENDANCE_COLUMNS); })
        .filter(function (obj) { return obj.ID; })
        .map(function (obj) {
          obj.StaffNama = staffNameById[obj.StaffID] || '(staff tidak ditemukan)';
          obj.Tanggal = dateToSafeString_(obj.Tanggal);
          obj.JamMasuk = timeToSafeString_(obj.JamMasuk);
          obj.JamKeluar = timeToSafeString_(obj.JamKeluar);
          obj.CreatedAt = dateToSafeString_(obj.CreatedAt);
          obj.UpdatedAt = dateToSafeString_(obj.UpdatedAt);
          return obj;
        });
    }

    const pSheet = getPayrollSheet_();
    const pLastRow = pSheet.getLastRow();
    let payrollList = [];
    if (pLastRow > 1) {
      const pValues = pSheet.getRange(2, 1, pLastRow - 1, PAYROLL_COLUMNS.length).getValues();
      payrollList = pValues
        .map(function (row) { return rowToObjectGeneric_(row, PAYROLL_COLUMNS); })
        .filter(function (obj) { return obj.ID; })
        .map(function (obj) {
          obj.StaffNama = staffNameById[obj.StaffID] || '(staff tidak ditemukan)';
          obj.PeriodeAwal = dateToSafeString_(obj.PeriodeAwal);
          obj.PeriodeAkhir = dateToSafeString_(obj.PeriodeAkhir);
          obj.TanggalBayar = dateToSafeString_(obj.TanggalBayar);
          obj.CreatedAt = dateToSafeString_(obj.CreatedAt);
          obj.UpdatedAt = dateToSafeString_(obj.UpdatedAt);
          try {
            obj.KomponenTambahan = obj.KomponenTambahanJSON ? JSON.parse(obj.KomponenTambahanJSON) : [];
          } catch (e) {
            obj.KomponenTambahan = [];
          }
          obj.TotalGajiKotorDisplay = formatRupiah_(obj.TotalGajiKotor);
          obj.TotalPotonganDisplay = formatRupiah_(obj.TotalPotongan);
          obj.GajiDibayarkanDisplay = formatRupiah_(obj.GajiDibayarkan);
          return obj;
        });
    }

    return {
      role: role,
      email: email,
      staffList: staffList,
      workloadList: workloadList,
      attendanceList: attendanceList,
      payrollList: payrollList,
      divisiOptions: DIVISI_OPTIONS,
      statusOptions: STATUS_OPTIONS,
      prioritasOptions: PRIORITAS_OPTIONS,
      workloadStatusOptions: WORKLOAD_STATUS_OPTIONS,
      attendanceStatusOptions: ATTENDANCE_STATUS_OPTIONS,
      payrollStatusOptions: PAYROLL_STATUS_OPTIONS,
      workDaysPerMonth: WORK_DAYS_PER_MONTH,
    };
  } catch (err) {
    throw new Error('getInitData gagal: ' + (err && err.message ? err.message : err));
  }
}

function createStaff(data) {
  requireAdmin_();
  const sheet = getSheet_();
  const now = new Date();
  const obj = {};
  COLUMNS.forEach(function (col) { obj[col] = data[col] !== undefined ? data[col] : ''; });
  obj.ID = 'STF-' + now.getTime();
  obj.CreatedAt = now;
  obj.UpdatedAt = now;
  sheet.appendRow(objectToRow_(obj));
  return { success: true, id: obj.ID };
}

function updateStaff(id, data) {
  requireAdmin_();
  if (!id) throw new Error('ID staff tidak valid.');
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Data staff tidak ditemukan.');

  const idColIndex = COLUMNS.indexOf('ID') + 1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      const rowNum = i + 2;
      const existingRow = sheet.getRange(rowNum, 1, 1, COLUMNS.length).getValues()[0];
      const existingObj = rowToObject_(existingRow);
      const merged = {};
      COLUMNS.forEach(function (col) {
        merged[col] = data[col] !== undefined ? data[col] : existingObj[col];
      });
      merged.ID = id;
      merged.CreatedAt = existingObj.CreatedAt;
      merged.UpdatedAt = new Date();
      sheet.getRange(rowNum, 1, 1, COLUMNS.length).setValues([objectToRow_(merged)]);
      return { success: true };
    }
  }
  throw new Error('Staff dengan ID tersebut tidak ditemukan.');
}

function setStaffStatus(id, newStatus) {
  requireAdmin_();
  if (!id) throw new Error('ID staff tidak valid.');
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Data staff tidak ditemukan.');

  const idColIndex = COLUMNS.indexOf('ID') + 1;
  const statusColIndex = COLUMNS.indexOf('Status') + 1;
  const updatedAtColIndex = COLUMNS.indexOf('UpdatedAt') + 1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      const rowNum = i + 2;
      sheet.getRange(rowNum, statusColIndex).setValue(newStatus);
      sheet.getRange(rowNum, updatedAtColIndex).setValue(new Date());
      return { success: true };
    }
  }
  throw new Error('Staff dengan ID tersebut tidak ditemukan.');
}

// ==================== WORKLOAD HELPERS ====================

function createWorkloadTask(data) {
  requireAdmin_();
  if (!data.StaffID) throw new Error('Staff wajib dipilih.');
  if (!data.NamaTask) throw new Error('Nama task wajib diisi.');
  const sheet = getWorkloadSheet_();
  const now = new Date();
  const obj = {};
  WORKLOAD_COLUMNS.forEach(function (col) { obj[col] = data[col] !== undefined ? data[col] : ''; });
  obj.ID = 'WL-' + now.getTime();
  obj.Status = obj.Status || 'To Do';
  obj.CreatedAt = now;
  obj.UpdatedAt = now;
  sheet.appendRow(objectToRowGeneric_(obj, WORKLOAD_COLUMNS));
  return { success: true, id: obj.ID };
}

function updateWorkloadTask(id, data) {
  requireAdmin_();
  if (!id) throw new Error('ID task tidak valid.');
  const sheet = getWorkloadSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Data workload tidak ditemukan.');
  const idColIndex = WORKLOAD_COLUMNS.indexOf('ID') + 1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      const rowNum = i + 2;
      const existingRow = sheet.getRange(rowNum, 1, 1, WORKLOAD_COLUMNS.length).getValues()[0];
      const existingObj = rowToObjectGeneric_(existingRow, WORKLOAD_COLUMNS);
      const merged = {};
      WORKLOAD_COLUMNS.forEach(function (col) {
        merged[col] = data[col] !== undefined ? data[col] : existingObj[col];
      });
      merged.ID = id;
      merged.CreatedAt = existingObj.CreatedAt;
      merged.UpdatedAt = new Date();
      sheet.getRange(rowNum, 1, 1, WORKLOAD_COLUMNS.length).setValues([objectToRowGeneric_(merged, WORKLOAD_COLUMNS)]);
      return { success: true };
    }
  }
  throw new Error('Task dengan ID tersebut tidak ditemukan.');
}

function updateWorkloadStatus(id, newStatus) {
  const role = getUserRole_(getUserEmail_());
  if (!role) throw new Error('Akses ditolak.');
  if (WORKLOAD_STATUS_OPTIONS.indexOf(newStatus) === -1) throw new Error('Status tidak valid.');
  const sheet = getWorkloadSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Data workload tidak ditemukan.');
  const idColIndex = WORKLOAD_COLUMNS.indexOf('ID') + 1;
  const statusColIndex = WORKLOAD_COLUMNS.indexOf('Status') + 1;
  const updatedAtColIndex = WORKLOAD_COLUMNS.indexOf('UpdatedAt') + 1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      const rowNum = i + 2;
      sheet.getRange(rowNum, statusColIndex).setValue(newStatus);
      sheet.getRange(rowNum, updatedAtColIndex).setValue(new Date());
      return { success: true };
    }
  }
  throw new Error('Task dengan ID tersebut tidak ditemukan.');
}

function deleteWorkloadTask(id) {
  requireAdmin_();
  if (!id) throw new Error('ID task tidak valid.');
  const sheet = getWorkloadSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Data workload tidak ditemukan.');
  const idColIndex = WORKLOAD_COLUMNS.indexOf('ID') + 1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      sheet.deleteRow(i + 2);
      return { success: true };
    }
  }
  throw new Error('Task dengan ID tersebut tidak ditemukan.');
}

// ==================== ATTENDANCE HELPERS ====================

function createAttendance(data) {
  requireAdmin_();
  if (!data.StaffID) throw new Error('Staff wajib dipilih.');
  if (!data.Tanggal) throw new Error('Tanggal wajib diisi.');
  if (!data.Status) throw new Error('Status kehadiran wajib dipilih.');

  const sheet = getAttendanceSheet_();
  const now = new Date();
  const obj = {};
  ATTENDANCE_COLUMNS.forEach(function (col) { obj[col] = data[col] !== undefined ? data[col] : ''; });
  obj.ID = 'ATT-' + now.getTime();
  obj.CreatedAt = now;
  obj.UpdatedAt = now;
  if (obj.Status !== 'Hadir') { obj.JamMasuk = ''; obj.JamKeluar = ''; }

  sheet.appendRow(objectToRowGeneric_(obj, ATTENDANCE_COLUMNS));
  return { success: true, id: obj.ID };
}

function updateAttendance(id, data) {
  requireAdmin_();
  if (!id) throw new Error('ID absensi tidak valid.');
  const sheet = getAttendanceSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Data absensi tidak ditemukan.');

  const idColIndex = ATTENDANCE_COLUMNS.indexOf('ID') + 1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      const rowNum = i + 2;
      const existingRow = sheet.getRange(rowNum, 1, 1, ATTENDANCE_COLUMNS.length).getValues()[0];
      const existingObj = rowToObjectGeneric_(existingRow, ATTENDANCE_COLUMNS);
      const merged = {};
      ATTENDANCE_COLUMNS.forEach(function (col) {
        merged[col] = data[col] !== undefined ? data[col] : existingObj[col];
      });
      merged.ID = id;
      merged.CreatedAt = existingObj.CreatedAt;
      merged.UpdatedAt = new Date();
      if (merged.Status !== 'Hadir') { merged.JamMasuk = ''; merged.JamKeluar = ''; }
      sheet.getRange(rowNum, 1, 1, ATTENDANCE_COLUMNS.length).setValues([objectToRowGeneric_(merged, ATTENDANCE_COLUMNS)]);
      return { success: true };
    }
  }
  throw new Error('Data absensi dengan ID tersebut tidak ditemukan.');
}

function deleteAttendance(id) {
  requireAdmin_();
  if (!id) throw new Error('ID absensi tidak valid.');
  const sheet = getAttendanceSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Data absensi tidak ditemukan.');
  const idColIndex = ATTENDANCE_COLUMNS.indexOf('ID') + 1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      sheet.deleteRow(i + 2);
      return { success: true };
    }
  }
  throw new Error('Data absensi dengan ID tersebut tidak ditemukan.');
}

function dailyAutoAttendanceTrigger() {
  const today = new Date();
  if (WORKING_DAYS_OF_WEEK.indexOf(today.getDay()) === -1) return;

  const dateStr = dateToSafeString_(today);
  const staffSheet = getSheet_();
  const staffLastRow = staffSheet.getLastRow();
  if (staffLastRow < 2) return;

  const staffValues = staffSheet.getRange(2, 1, staffLastRow - 1, COLUMNS.length).getValues();
  const activeStaff = staffValues
    .map(function (row) { return rowToObject_(row); })
    .filter(function (obj) { return obj.ID && obj.Status !== 'Nonaktif'; });

  const attSheet = getAttendanceSheet_();
  const attLastRow = attSheet.getLastRow();
  const existingStaffIds = {};
  if (attLastRow > 1) {
    const attValues = attSheet.getRange(2, 1, attLastRow - 1, ATTENDANCE_COLUMNS.length).getValues();
    attValues.forEach(function (row) {
      const obj = rowToObjectGeneric_(row, ATTENDANCE_COLUMNS);
      if (dateToSafeString_(obj.Tanggal) === dateStr) existingStaffIds[obj.StaffID] = true;
    });
  }

  const now = new Date();
  activeStaff.forEach(function (staff) {
    if (existingStaffIds[staff.ID]) return;
    const obj = {};
    ATTENDANCE_COLUMNS.forEach(function (col) { obj[col] = ''; });
    obj.ID = 'ATT-' + Utilities.getUuid();
    obj.StaffID = staff.ID;
    obj.Tanggal = dateStr;
    obj.Status = 'Hadir';
    obj.JamMasuk = JAM_MASUK_DEFAULT;
    obj.JamKeluar = JAM_KELUAR_DEFAULT;
    obj.Catatan = 'Otomatis - hari kerja terjadwal';
    obj.CreatedAt = now;
    obj.UpdatedAt = now;
    attSheet.appendRow(objectToRowGeneric_(obj, ATTENDANCE_COLUMNS));
  });
}

function setupAutoAttendanceTrigger_() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) {
    if (t.getHandlerFunction() === AUTO_ATTENDANCE_TRIGGER_FN) {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger(AUTO_ATTENDANCE_TRIGGER_FN)
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .create();

  SpreadsheetApp.getUi().alert('Trigger Absensi Otomatis berhasil diatur (07:00 pagi tiap hari kerja).');
}

// ==================== PAYROLL HELPERS ====================

function findStaffRowById_(staffId) {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const idColIndex = COLUMNS.indexOf('ID') + 1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === staffId) {
      const row = sheet.getRange(i + 2, 1, 1, COLUMNS.length).getValues()[0];
      return rowToObject_(row);
    }
  }
  return null;
}

function countHariHadir_(staffId, periodeAwal, periodeAkhir) {
  const sheet = getAttendanceSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, 1, lastRow - 1, ATTENDANCE_COLUMNS.length).getValues();
  const awal = new Date(periodeAwal);
  const akhir = new Date(periodeAkhir);
  awal.setHours(0, 0, 0, 0);
  akhir.setHours(23, 59, 59, 999);

  let count = 0;
  values.forEach(function (row) {
    const obj = rowToObjectGeneric_(row, ATTENDANCE_COLUMNS);
    if (obj.StaffID !== staffId || obj.Status !== 'Hadir') return;
    const tgl = new Date(obj.Tanggal);
    if (isNaN(tgl.getTime())) return;
    if (tgl >= awal && tgl <= akhir) count++;
  });
  return count;
}

function countHariTidakMasuk_(staffId, periodeAwal, periodeAkhir) {
  const sheet = getAttendanceSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, 1, lastRow - 1, ATTENDANCE_COLUMNS.length).getValues();
  const awal = new Date(periodeAwal);
  const akhir = new Date(periodeAkhir);
  awal.setHours(0, 0, 0, 0);
  akhir.setHours(23, 59, 59, 999);

  const STATUS_PEMOTONG = ['Izin', 'Alpha'];
  let count = 0;
  values.forEach(function (row) {
    const obj = rowToObjectGeneric_(row, ATTENDANCE_COLUMNS);
    if (obj.StaffID !== staffId || STATUS_PEMOTONG.indexOf(obj.Status) === -1) return;
    const tgl = new Date(obj.Tanggal);
    if (isNaN(tgl.getTime())) return;
    if (tgl >= awal && tgl <= akhir) count++;
  });
  return count;
}

function computePayrollAmounts_(staffId, periodeAwal, periodeAkhir) {
  const staff = findStaffRowById_(staffId);
  if (!staff) throw new Error('Staff tidak ditemukan.');

  const hariHadir = countHariHadir_(staffId, periodeAwal, periodeAkhir);
  const hariTidakMasuk = countHariTidakMasuk_(staffId, periodeAwal, periodeAkhir);
  const gajiPokokBulanan = Number(staff.GajiPokok) || 0;
  const tunjJabatanBulanan = Number(staff.TunjJabatan) || 0;

  const potonganPerHariGajiPokok = gajiPokokBulanan / WORK_DAYS_PER_MONTH;
  const potonganPerHariTunjJabatan = tunjJabatanBulanan / WORK_DAYS_PER_MONTH;

  const gajiPokokAmount = Math.max(0, Math.round(gajiPokokBulanan - potonganPerHariGajiPokok * hariTidakMasuk));
  const tunjJabatanAmount = Math.max(0, Math.round(tunjJabatanBulanan - potonganPerHariTunjJabatan * hariTidakMasuk));

  return {
    staffNama: staff.Nama,
    hariHadir: hariHadir,
    hariTidakMasuk: hariTidakMasuk,
    gajiPokokAmount: gajiPokokAmount,
    tunjJabatanAmount: tunjJabatanAmount,
    gajiPokokBulanan: gajiPokokBulanan,
    tunjJabatanBulanan: tunjJabatanBulanan,
    gajiPokokDisplay: formatRupiah_(gajiPokokAmount),
    tunjJabatanDisplay: formatRupiah_(tunjJabatanAmount),
  };
}

function previewPayrollCalc(staffId, periodeAwal, periodeAkhir) {
  if (!staffId || !periodeAwal || !periodeAkhir) throw new Error('Staff dan periode wajib diisi.');
  return computePayrollAmounts_(staffId, periodeAwal, periodeAkhir);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Database Staff')
    .addItem('Setup Sheet Staff', 'ensureSheetExists_')
    .addItem('Setup Sheet Workload', 'ensureWorkloadSheetExists_')
    .addItem('Setup Sheet Attendance', 'ensureAttendanceSheetExists_')
    .addItem('Setup Sheet Payroll', 'ensurePayrollSheetExists_')
    .addSeparator()
    .addItem('⏰ Setup Trigger Absensi Otomatis', 'setupAutoAttendanceTrigger_')
    .addToUi();
}
`;
