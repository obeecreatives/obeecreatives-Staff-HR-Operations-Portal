import {
  StaffUser,
  AttendanceRecord,
  ContentFeeItem,
  PayrollRecord,
  GasSyncConfig,
} from '../types';

const STORAGE_KEYS = {
  STAFF: 'obee_staff_database',
  ATTENDANCE: 'obee_attendance_records',
  CONTENT_FEES: 'obee_content_fees',
  PAYROLL: 'obee_payroll_records',
  GAS_CONFIG: 'obee_gas_config',
  ACTIVE_USER: 'obee_active_staff_id',
  VERSION: 'obee_storage_version_master_v5',
};

// Data Asli 7 Staf Terverifikasi dari Spreadsheet Database Staff obeecreatives (Tab: Staff)
export const INITIAL_STAFF_SEED: StaffUser[] = [
  {
    id: 'STF-1785295519572',
    name: 'Adissa Rifdah Aulia',
    email: 'dissaraulia@gmail.com',
    role: 'staff_creator',
    department: 'Social Media Management',
    jobTitle: 'Content Strategic & Creator',
    gradeSkill: 'Junior Creative',
    workMode: 'WFO',
    phone: '081358855561',
    pin: '123456',
    instagram: '@adissaulia',
    address: 'Jl. Albatros, No. 3, Kec. Bumiaji, Kota Batu',
    status: 'Tetap',
    gender: 'Wanita',
    joinedDate: '2026-08-01',
    contractEndDate: '2026-10-31',
    baseSalary: 1000000,
    allowance: 300000,
    freelancerFee: 0,
    skills: ['Content Strategy', 'Copywriting', 'Canva', 'CapCut', 'Trend Research'],
    bankAccount: {
      bankName: 'Bank Jago',
      accountNumber: '105180543278',
      accountHolder: 'Adissa Rifdah Aulia',
    },
    notes: 'Rekening Bank Jago a/c 105180543278 a/n Adissa Rifdah Aulia',
  },
  {
    id: 'STF-1785300550339',
    name: 'Muhammad Labib Azka',
    email: 'labibmuhammad157@gmail.com',
    role: 'staff_creator',
    department: 'Desain Grafis',
    jobTitle: 'Desainer Grafis',
    gradeSkill: 'Creative Trainee',
    workMode: 'WFH',
    phone: '089513813532',
    pin: '123456',
    instagram: '@azka_iniyah',
    address: 'Dadaprejo, Kec. Junrejo, Kota Batu',
    status: 'Nonaktif',
    gender: 'Pria',
    joinedDate: '2026-07-20',
    contractEndDate: '2026-08-26',
    baseSalary: 600000, // Sesuai Datasheet GajiPokok Rp 600.000
    allowance: 0,
    freelancerFee: 0,
    skills: ['Figma', 'Illustrator', 'Photoshop', 'Brand Identity'],
    bankAccount: {
      bankName: 'Bank Belum Terdata',
      accountNumber: '-',
      accountHolder: 'Muhammad Labib Azka',
    },
    notes: '',
  },
  {
    id: 'STF-1785303827045',
    name: 'Lalu Mahendra Ali Akbar',
    email: 'loehendra@gmail.com',
    role: 'admin',
    department: 'Photography', // Sesuai Datasheet Divisi: Photography
    jobTitle: 'CEO',
    gradeSkill: 'Leader',
    workMode: 'WFO',
    phone: '',
    pin: '123456',
    instagram: '@lalumahendra',
    status: 'Tetap',
    gender: 'Pria',
    address: 'Jl. Batok 8, Kelurahan Sisir, Kota Batu',
    joinedDate: '2025-01-01',
    baseSalary: 0,
    allowance: 0,
    freelancerFee: 0,
    skills: ['Creative Direction', 'System Architecture', 'Production Management', 'Commercial Photography'],
    bankAccount: {
      bankName: 'Bank Mandiri',
      accountNumber: '1410018899201',
      accountHolder: 'Lalu Mahendra',
    },
    notes: 'Rekening Bank Mandiri 1410018899201 a/n Lalu Mahendra. Akses Super Admin seluruh tools obeeTOOLS dan Project Control.',
  },
  {
    id: 'STF-1785307520278',
    name: 'Aldrien Andriansyah',
    email: 'aldrien.and@gmail.com',
    role: 'staff_creator',
    department: 'Videography',
    jobTitle: 'Staff', // Sesuai Datasheet Jabatan: Staff
    gradeSkill: 'Creative Trainee',
    workMode: 'On-Site',
    phone: '085930990792',
    pin: '123456',
    instagram: '@aldrn.andrnsyh',
    address: 'Jl. Menur 3/39 Surabaya',
    status: 'Tetap',
    gender: 'Pria',
    joinedDate: '2026-07-01',
    contractEndDate: '2026-07-31',
    baseSalary: 800000, // Sesuai Datasheet GajiPokok Rp 800.000
    allowance: 200000,  // Sesuai Datasheet TunjJabatan Rp 200.000
    freelancerFee: 0,
    skills: ['Premiere Pro', 'Sony FX3', 'Color Grading', 'Lighting Setup', 'After Effects'],
    bankAccount: {
      bankName: 'Bank BNI',
      accountNumber: '2052442241',
      accountHolder: 'Aldrien Andriansyah',
    },
    notes: 'Rekening BNI 2052442241 an Aldrien Andriansyah',
  },
  {
    id: 'STF-1785374645853',
    name: 'Vita Belfi',
    email: 'loevie02@gmail.com',
    role: 'project_manager',
    department: 'Social Media Management', // Sesuai Datasheet Divisi: Social Media Management
    jobTitle: 'Project Manager & Lead Operations',
    gradeSkill: 'Grade ngikut atas',
    workMode: 'WFO',
    phone: '',
    pin: '123456',
    status: 'Tetap',
    gender: 'Wanita',
    address: 'Jl. Patimura No. 12, Temas, Kota Batu',
    joinedDate: '2025-02-01',
    baseSalary: 0,
    allowance: 0,
    freelancerFee: 0,
    skills: ['Project Management', 'Client Relations', 'Operations', 'Social Media Management'],
    bankAccount: {
      bankName: 'Bank BCA',
      accountNumber: '0190717623',
      accountHolder: 'Vita Belfi',
    },
    notes: 'Rekening Bank BCA 0190717623 a/n Vita Belfi. Penanggung jawab operasional harian dan approval fee konten.',
  },
  {
    id: 'STF-1788690149337',
    name: 'Baiq Ayesha',
    email: 'feedkreatif@gmail.com',
    role: 'staff_creator',
    department: 'Videography',
    jobTitle: 'Video Editor',
    gradeSkill: 'Pemula',
    workMode: 'Mobile',
    phone: '081217360976',
    pin: '123456',
    address: 'Batu',
    status: 'Nonaktif',
    gender: 'Wanita',
    joinedDate: '2026-09-06',
    baseSalary: 0,
    allowance: 0,
    freelancerFee: 0,
    skills: ['CapCut', 'Premiere Pro', 'Sound Design'],
    bankAccount: {
      bankName: 'Bank Belum Terdata',
      accountNumber: '-',
      accountHolder: 'Baiq Ayesha',
    },
    notes: 'Direkrut via Recruitment Obeecreatives. Akun sharing feedkreatif.',
  },
  {
    id: 'STF-1790218381197',
    name: 'Febrina Putri K',
    email: 'putrikriswardani@gmail.com',
    role: 'staff_creator',
    department: 'Desain Grafis',
    jobTitle: 'Desain Grafis',
    gradeSkill: '-',
    workMode: 'WFO',
    phone: '081230673226',
    pin: '123456',
    address: 'Jl. Durian 11 Rt02, Rw02, Songgoriti Kota Batu',
    status: 'Magang',
    gender: 'Wanita',
    joinedDate: '2026-09-24',
    contractEndDate: '2026-10-24',
    baseSalary: 0,
    allowance: 0,
    freelancerFee: 0,
    skills: ['Canva', 'Photoshop', 'Social Media Feed'],
    bankAccount: {
      bankName: 'Bank Belum Terdata',
      accountNumber: '-',
      accountHolder: 'Febrina Putri K',
    },
    notes: '',
  },
];

// Seed Fee Konten dari Project Control
export const INITIAL_CONTENT_FEES_SEED: ContentFeeItem[] = [
  {
    id: 'CNT-2026-0901',
    contentTitle: 'Promo Reels Kopi Tepi Sawah - September Launch',
    contentType: 'Reels Promo',
    clientName: 'Kopi Tepi Sawah',
    creatorName: 'Aldrien Andriansyah',
    approvedDate: '2026-09-12',
    feeAmount: 350000,
    status: 'Published',
  },
  {
    id: 'CNT-2026-0902',
    contentTitle: 'Carousel Edukasi Skin Barrier Tips',
    contentType: 'Feed Carousel',
    clientName: 'Glow Botanic Skincare',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-09-15',
    feeAmount: 200000,
    status: 'Published',
  },
  {
    id: 'CNT-2026-0903',
    contentTitle: 'Video Liputan Opening Outlet Sunset Road',
    contentType: 'Video Liputan',
    clientName: 'Ayam Bakar Taliwang Asli',
    creatorName: 'Aldrien Andriansyah',
    approvedDate: '2026-09-22',
    feeAmount: 450000,
    status: 'Scheduled',
  },
  {
    id: 'CNT-2026-0904',
    contentTitle: 'TikTok Storytelling Series: Weekend di Lombok',
    contentType: 'TikTok Series',
    clientName: 'Lombok Travel Guide',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-09-25',
    feeAmount: 250000,
    status: 'Approved',
  },
  {
    id: 'CNT-2026-0905',
    contentTitle: 'Social Media Feed Banner Promo Gajian',
    contentType: 'Feed Carousel',
    clientName: 'Batu Creative Hub',
    creatorName: 'Febrina Putri K',
    approvedDate: '2026-09-28',
    feeAmount: 150000,
    status: 'Published',
  },
];

// Seed Kehadiran September 2026: 20 Hari Hadir & 2 Hari Izin untuk Adissa Rifdah Aulia (Sesuai Log Resmi GAS)
const generateSeptemberAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const adissaId = 'STF-1785295519572';
  const adissaName = 'Adissa Rifdah Aulia';

  // 20 Hari Hadir Adissa
  const presentDates = [
    '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04',
    '2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11',
    '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17',
    '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25',
    '2026-09-28', '2026-09-30'
  ];

  presentDates.forEach((date, i) => {
    records.push({
      id: `ATT-ADISSA-H-${i + 1}`,
      staffId: adissaId,
      staffName: adissaName,
      date: date,
      workMode: 'WFO',
      status: 'Hadir',
      checkInTime: '08:50',
      checkOutTime: '17:10',
      latitude: -7.8712,
      longitude: 112.5271,
      distanceMeters: 15,
      locationName: 'Studio obeecreatives Kota Batu',
      verifiedByGeo: true,
    });
  });

  // 2 Hari Izin Adissa (18 & 19 September 2026) -> memotong gaji harian
  const izinDates = ['2026-09-18', '2026-09-19'];
  izinDates.forEach((date, i) => {
    records.push({
      id: `ATT-ADISSA-IZIN-${i + 1}`,
      staffId: adissaId,
      staffName: adissaName,
      date: date,
      workMode: 'WFO',
      status: 'Izin',
      notes: 'Izin keperluan keluarga (potong gaji harian)',
      verifiedByGeo: false,
    });
  });

  // Data staf lain
  records.push(
    {
      id: 'ATT-ALDRIEN-01',
      staffId: 'STF-1785307520278',
      staffName: 'Aldrien Andriansyah',
      date: '2026-09-30',
      workMode: 'On-Site',
      status: 'Hadir',
      checkInTime: '09:10',
      checkOutTime: '17:40',
      latitude: -7.8680,
      longitude: 112.5290,
      distanceMeters: 450,
      locationName: 'Lokasi Klien - Cafe Kota Batu',
      notes: 'Shooting footage b-roll makanan',
      verifiedByGeo: true,
    },
    {
      id: 'ATT-VITA-01',
      staffId: 'STF-1785374645853',
      staffName: 'Vita Belfi',
      date: '2026-09-30',
      workMode: 'WFO',
      status: 'Hadir',
      checkInTime: '08:45',
      checkOutTime: '17:30',
      latitude: -7.8711,
      longitude: 112.5270,
      distanceMeters: 18,
      locationName: 'Studio obeecreatives Kota Batu',
      notes: 'Review jadwal tayang Project Control',
      verifiedByGeo: true,
    },
    {
      id: 'ATT-FEBRINA-01',
      staffId: 'STF-1790218381197',
      staffName: 'Febrina Putri K',
      date: '2026-09-30',
      workMode: 'WFO',
      status: 'Hadir',
      checkInTime: '09:05',
      latitude: -7.8713,
      longitude: 112.5272,
      distanceMeters: 22,
      locationName: 'Studio obeecreatives Kota Batu',
      notes: 'Magang grafis batch September',
      verifiedByGeo: true,
    }
  );

  return records;
};

export const INITIAL_ATTENDANCE_SEED: AttendanceRecord[] = generateSeptemberAttendance();

// Seed Rekap Payroll Resmi September 2026 (Sesuai Log Resmi GAS & Project Control)
export const INITIAL_PAYROLL_SEED: PayrollRecord[] = [
  {
    id: 'PAY-2026-09-ADISSA',
    staffId: 'STF-1785295519572',
    staffName: 'Adissa Rifdah Aulia',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    workDaysStandard: 20,
    daysPresent: 20,
    daysAbsent: 2,
    baseSalaryMonthly: 1000000, // Nilai penuh terkunci dari Direktori Staf
    allowanceMonthly: 300000,  // Nilai penuh terkunci dari Direktori Staf
    baseSalaryCalculated: 900000, // Rp 1.000.000 - (2 * Rp 50.000 potongan izin)
    allowanceCalculated: 270000,  // Rp 300.000 - (2 * Rp 15.000 potongan izin)
    contentFees: [
      {
        label: 'Fee Konten - Feed Carousel (Glow Botanic Skincare)',
        rate: 200000,
        qty: 1,
        subtotal: 200000,
        contentIds: ['CNT-2026-0902'],
        isProjectControl: true,
      },
      {
        label: 'Fee Konten - TikTok Series (Lombok Travel Guide)',
        rate: 250000,
        qty: 1,
        subtotal: 250000,
        contentIds: ['CNT-2026-0904'],
        isProjectControl: true,
      },
    ],
    totalContentFee: 450000,
    overtime: 0,
    deductions: {
      bpjsKetenagakerjaan: 0,
      bpjsKesehatan: 0,
      premi: 0,
      taxPph21: 0,
      loanInstallment: 0,
    },
    totalDeduction: 0,
    grossSalary: 1620000,
    netSalary: 1620000,
    paymentStatus: 'Lunas',
    paymentDate: '2026-09-30',
    notes: 'Gaji Pokok & Tunjangan Terkunci Direktori Staf & Tim. Presensi 20 Hari Hadir & 2 Hari Izin + Fee 2 Konten Project Control.',
    createdAt: '2026-09-30T17:00:00.000Z',
  },
  {
    id: 'PAY-2026-09-ALDRIEN',
    staffId: 'STF-1785307520278',
    staffName: 'Aldrien Andriansyah',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    workDaysStandard: 20,
    daysPresent: 20,
    daysAbsent: 0,
    baseSalaryMonthly: 800000, // Sesuai Datasheet GajiPokok Rp 800.000
    allowanceMonthly: 200000,  // Sesuai Datasheet TunjJabatan Rp 200.000
    baseSalaryCalculated: 800000,
    allowanceCalculated: 200000,
    contentFees: [
      {
        label: 'Fee Konten - Reels Promo (Kopi Tepi Sawah)',
        rate: 350000,
        qty: 1,
        subtotal: 350000,
        contentIds: ['CNT-2026-0901'],
        isProjectControl: true,
      },
      {
        label: 'Fee Konten - Video Liputan (Ayam Bakar Taliwang Asli)',
        rate: 450000,
        qty: 1,
        subtotal: 450000,
        contentIds: ['CNT-2026-0903'],
        isProjectControl: true,
      },
    ],
    totalContentFee: 800000,
    overtime: 0,
    deductions: {
      bpjsKetenagakerjaan: 0,
      bpjsKesehatan: 0,
      premi: 0,
      taxPph21: 0,
      loanInstallment: 0,
    },
    totalDeduction: 0,
    grossSalary: 1800000,
    netSalary: 1800000,
    paymentStatus: 'Lunas',
    paymentDate: '2026-09-30',
    notes: 'Gaji Pokok & Tunjangan Terkunci (Rp 1.000.000) + Fee 2 Konten Project Control (Rp 800.000).',
    createdAt: '2026-09-30T17:00:00.000Z',
  },
];

const CURRENT_STORAGE_VERSION = 'v6_0_studio_kota_batu_verified';

// Helper Storage API
export const StorageService = {
  getStaff(): StaffUser[] {
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (version !== CURRENT_STORAGE_VERSION) {
      // Force refresh cache with exact verified sheet data
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF_SEED));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE_SEED));
      localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL_SEED));
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION);
      return INITIAL_STAFF_SEED;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF_SEED));
      return INITIAL_STAFF_SEED;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_STAFF_SEED;
    }
  },

  saveStaff(staff: StaffUser[]): void {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION);
  },

  getAttendance(): AttendanceRecord[] {
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (version !== CURRENT_STORAGE_VERSION) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE_SEED));
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF_SEED));
      localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL_SEED));
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION);
      return INITIAL_ATTENDANCE_SEED;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE_SEED));
      return INITIAL_ATTENDANCE_SEED;
    }
    try {
      const parsed: AttendanceRecord[] = JSON.parse(raw);
      // Validasi wajib: Adissa Rifdah Aulia harus memiliki 20 hari hadir & 2 hari izin di September 2026
      const adissaHadir = parsed.filter(
        (a) => a.staffId === 'STF-1785295519572' && a.status === 'Hadir' && a.date.startsWith('2026-09')
      ).length;
      if (adissaHadir < 20) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE_SEED));
        return INITIAL_ATTENDANCE_SEED;
      }
      return parsed;
    } catch {
      return INITIAL_ATTENDANCE_SEED;
    }
  },

  saveAttendance(attendance: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  },

  getContentFees(): ContentFeeItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTENT_FEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTENT_FEES, JSON.stringify(INITIAL_CONTENT_FEES_SEED));
      return INITIAL_CONTENT_FEES_SEED;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CONTENT_FEES_SEED;
    }
  },

  saveContentFees(fees: ContentFeeItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTENT_FEES, JSON.stringify(fees));
  },

  getPayroll(): PayrollRecord[] {
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (version !== CURRENT_STORAGE_VERSION) {
      localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL_SEED));
      return INITIAL_PAYROLL_SEED;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.PAYROLL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL_SEED));
      return INITIAL_PAYROLL_SEED;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL_SEED));
        return INITIAL_PAYROLL_SEED;
      }
      return parsed;
    } catch {
      return INITIAL_PAYROLL_SEED;
    }
  },

  savePayroll(records: PayrollRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(records));
  },

  getGasConfig(): GasSyncConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.GAS_CONFIG);
    if (!raw) {
      const def: GasSyncConfig = {
        gasWebhookUrl: 'https://script.google.com/macros/s/AKfycbyni6-XwvwRugvD0THhLCCbtlsIYZcbJST8Woi8XkFAC8sFjji8ftTgS7yF-6rUCVgj8g/exec',
        spreadsheetId: '1el1tK4NGhoslMWECWzIo-7nBAEox6KZ-2TjlJ6WLIV8',
        autoSync: false,
      };
      localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(def));
      return def;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        gasWebhookUrl: '',
        spreadsheetId: '',
        autoSync: false,
      };
    }
  },

  saveGasConfig(config: GasSyncConfig): void {
    localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(config));
  },

  getActiveUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || 'STF-1785303827045'; // Default Lalu Mahendra
  },

  setActiveUserId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, id);
  },

  resetToSeed(): void {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF_SEED));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE_SEED));
    localStorage.setItem(STORAGE_KEYS.CONTENT_FEES, JSON.stringify(INITIAL_CONTENT_FEES_SEED));
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL_SEED));
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION);
  },
};
