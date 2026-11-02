import {
  StaffUser,
  AttendanceRecord,
  ContentFeeItem,
  PayrollRecord,
  GasSyncConfig,
  LeaveRequest,
  ExpenseClaim,
  ProjectAssignment,
  WorkMode,
} from '../types';

const STORAGE_KEYS = {
  STAFF: 'obee_staff_database',
  ATTENDANCE: 'obee_attendance_records',
  CONTENT_FEES: 'obee_content_fees',
  PAYROLL: 'obee_payroll_records',
  GAS_CONFIG: 'obee_gas_config',
  ACTIVE_USER: 'obee_active_staff_id',
  LEAVES: 'obee_leave_requests',
  EXPENSES: 'obee_expense_claims',
  PROJECTS: 'obee_project_assignments',
  VERSION: 'obee_storage_version_master_v6',
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

// Seed Fee Konten Asli Terverifikasi dari Project Control (Tab ContentTracker - ID: 1wdsy4L0NbPOR39dYjnOM8Og_Os10piz9VT5DBglb0qQ)
export const INITIAL_CONTENT_FEES_SEED: ContentFeeItem[] = [
  // Konten September 2026 Asli Terverifikasi
  {
    id: 'ca1fab60-5b1d-48cd-ae32-332ab45db401',
    contentTitle: 'Review Keripik Kentang Renyah Gurih',
    contentType: 'Reels / TikTok',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-09-12',
    feeAmount: 15000,
    status: 'Published',
  },
  {
    id: 'e293f98a-46c6-462c-a524-99372e748320',
    contentTitle: 'Game Interaktif Mencocokkan Gambar Keripik',
    contentType: 'Single Post',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-09-15',
    feeAmount: 10000,
    status: 'Published',
  },
  {
    id: 'aac82e38-18cc-4110-82d8-4691b48d2ccb',
    contentTitle: 'Quotes Edukasi: Brand Kuat Berasal dari Produk Konsisten',
    contentType: 'Single Post',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-09-18',
    feeAmount: 10000,
    status: 'Published',
  },
  {
    id: '0a3bc4dc-8f7d-4b14-a2d5-e2ccb9a51503',
    contentTitle: 'Rahasia Dibalik Proses Vacuum Frying Keripik Buah',
    contentType: 'Carousel',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Aldrien Andriansyah',
    approvedDate: '2026-09-23',
    feeAmount: 10000,
    status: 'Published',
  },
  {
    id: '6872106a-8376-4ab6-a8e0-9ec942bda878',
    contentTitle: 'Pentingnya Konsumsi Sayur & Camilan Bergizi untuk Keluarga',
    contentType: 'Carousel',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Aldrien Andriansyah',
    approvedDate: '2026-09-28',
    feeAmount: 10000,
    status: 'Approved',
  },
  {
    id: '745f9cbe-e207-474f-9272-73b305beb5bc',
    contentTitle: 'Single Post Interaktif: Kamu Tim Keripik Gurih atau Manis?',
    contentType: 'Single Post',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Muhammad Labib Azka',
    approvedDate: '2026-09-28',
    feeAmount: 10000,
    status: 'Published',
  },
  {
    id: '458e5918-07e8-4047-918e-d56e856d77ff',
    contentTitle: '5 Manfaat Konsumsi Pangan Lokal untuk Tubuh',
    contentType: 'Carousel',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Muhammad Labib Azka',
    approvedDate: '2026-09-08',
    feeAmount: 10000,
    status: 'Published',
  },
  // Konten Live Oktober 2026 (Sheet: 1wdsy4L0NbPOR39dYjnOM8Og_Os10piz9VT5DBglb0qQ - Tab: ContentTracker)
  {
    id: 'cnt-d7bsz1a',
    contentTitle: 'Peluang Usaha Keripik Buah & Sayur Skala UMKM',
    contentType: 'Reels / TikTok',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 15000,
    status: 'Approved',
  },
  {
    id: 'cnt-gfpf02o',
    contentTitle: 'Solusi Produksi Keripik Tanpa Ribet Mesin & Tenaga',
    contentType: 'Reels / TikTok',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 15000,
    status: 'Approved',
  },
  {
    id: 'cnt-c5y4dn0',
    contentTitle: 'Rekomendasi Varian Keripik Terlaris untuk Reseller',
    contentType: 'Reels / TikTok',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 15000,
    status: 'Approved',
  },
  {
    id: 'cnt-kdc627m',
    contentTitle: 'Panduan Memulai Maklon Keripik Sayur dari Nol',
    contentType: 'Carousel',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 10000,
    status: 'Approved',
  },
  {
    id: 'cnt-fewnpv8',
    contentTitle: 'Camilan Sehat Tanpa Pengawet untuk Keluarga',
    contentType: 'Single Post',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 10000,
    status: 'Approved',
  },
  {
    id: 'cnt-ltj6tck',
    contentTitle: 'Kandungan Nutrisi Keripik Sayur vs Snack Biasa',
    contentType: 'Carousel',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 10000,
    status: 'Approved',
  },
  {
    id: 'cnt-aayt6sa',
    contentTitle: 'Video Ajakan Bergabung Reseller Keripik Sayur',
    contentType: 'Reels / TikTok',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 15000,
    status: 'Approved',
  },
  {
    id: 'cnt-dudnvp6',
    contentTitle: '3 Keripik Anti-Mainstream Paling Diburu',
    contentType: 'Carousel',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 10000,
    status: 'Approved',
  },
  {
    id: 'cnt-pfxoyej',
    contentTitle: 'Inovasi Keripik Tomat Kaya Nutrisi & Vitamin',
    contentType: 'Carousel',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 10000,
    status: 'Approved',
  },
  {
    id: 'cnt-c0onot3',
    contentTitle: 'Punya Penghasilan Tambahan dengan Jadi Reseller',
    contentType: 'Carousel',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 10000,
    status: 'Approved',
  },
  {
    id: 'cnt-qibvvmi',
    contentTitle: 'Video Unboxing Paket Keripik Sayur Premium',
    contentType: 'Reels / TikTok',
    clientName: 'KERIPIK SAYUR ID',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-15',
    feeAmount: 15000,
    status: 'Approved',
  },
  {
    id: 'cnt-4p577mj',
    contentTitle: 'Proses Pembuatan Keripik Tomat Standar Ekspor',
    contentType: 'Reels / TikTok',
    clientName: 'INOVASI PANGAN LESTARI',
    creatorName: 'Adissa Rifdah Aulia',
    approvedDate: '2026-10-20',
    feeAmount: 15000,
    status: 'Approved',
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

// Seed Kehadiran Oktober 2026: Standar 20 Hari Kerja (Senin-Kamis & Sabtu)
const generateOctoberAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const adissaId = 'STF-1785295519572';
  const adissaName = 'Adissa Rifdah Aulia';

  // Jadwal Kerja Resmi Oktober 2026 (Senin-Kamis & Sabtu - Standar 20 Hari Kerja)
  const octoberWorkingDays = [
    '2026-10-01', '2026-10-03', '2026-10-05', '2026-10-06', '2026-10-07',
    '2026-10-08', '2026-10-10', '2026-10-12', '2026-10-13', '2026-10-14',
    '2026-10-15', '2026-10-17', '2026-10-19', '2026-10-20', '2026-10-22',
    '2026-10-24', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29',
    '2026-10-31'
  ];

  // Adissa Rifdah Aulia: 20 Hari Hadir Penuh di Oktober 2026 (WFO + 1 Tugas Luar On-Site)
  octoberWorkingDays.forEach((date, i) => {
    const isOutTask = date === '2026-10-15'; // 15 Okt: Tugas Luar Liputan Klien
    records.push({
      id: `ATT-ADISSA-OKT-${i + 1}`,
      staffId: adissaId,
      staffName: adissaName,
      date: date,
      workMode: isOutTask ? 'On-Site' : 'WFO',
      status: 'Hadir',
      checkInTime: isOutTask ? '08:30' : '08:52',
      checkOutTime: isOutTask ? '17:35' : '17:08',
      latitude: isOutTask ? -7.8680 : -7.8712,
      longitude: isOutTask ? 112.5290 : 112.5271,
      distanceMeters: isOutTask ? 450 : 16,
      locationName: isOutTask ? 'Lokasi Klien Inovasi Pangan Lestari (On-Site Batu)' : 'Studio obeecreatives Kota Batu',
      notes: isOutTask ? 'Tugas luar liputan produksi konten retainer' : 'Presensi WFO terminal GPS studio',
      verifiedByGeo: true,
    });
  });

  // 1 Hari Izin Sakit Adissa (21 Oktober 2026 - dengan surat dokter -> TIDAK memotong gaji)
  records.push({
    id: 'ATT-ADISSA-OKT-SAKIT',
    staffId: adissaId,
    staffName: adissaName,
    date: '2026-10-21',
    workMode: 'WFO',
    status: 'Sakit',
    notes: 'Izin Sakit: Demam & radang tenggorokan (surat dokter klinik terlampir - hak sakit bergaji penuh)',
    verifiedByGeo: false,
  });

  // Presensi Staf Lain di Oktober 2026
  const otherStaff = [
    { id: 'STF-1785307520278', name: 'Aldrien Andriansyah', mode: 'On-Site' as WorkMode },
    { id: 'STF-1785374645853', name: 'Vita Belfi', mode: 'WFO' as WorkMode },
    { id: 'STF-1785303827045', name: 'Lalu Mahendra Ali Akbar', mode: 'WFO' as WorkMode },
    { id: 'STF-1790218381197', name: 'Febrina Putri K', mode: 'WFO' as WorkMode },
  ];

  const sampleDates = ['2026-10-01', '2026-10-05', '2026-10-10', '2026-10-15', '2026-10-20', '2026-10-28', '2026-10-31'];
  sampleDates.forEach((date, idx) => {
    otherStaff.forEach((s) => {
      records.push({
        id: `ATT-${s.id.slice(-4)}-OKT-${idx + 1}`,
        staffId: s.id,
        staffName: s.name,
        date: date,
        workMode: s.mode,
        status: 'Hadir',
        checkInTime: '08:55',
        checkOutTime: '17:15',
        latitude: -7.8712,
        longitude: 112.5271,
        distanceMeters: 20,
        locationName: 'Studio obeecreatives Kota Batu',
        notes: 'Hari kerja reguler Oktober',
        verifiedByGeo: true,
      });
    });
  });

  // 1 Hari Cuti Tahunan Aldrien Andriansyah (09 Oktober 2026 -> TIDAK memotong gaji)
  records.push({
    id: 'ATT-ALDRIEN-OKT-CUTI',
    staffId: 'STF-1785307520278',
    staffName: 'Aldrien Andriansyah',
    date: '2026-10-09',
    workMode: 'WFO',
    status: 'Cuti',
    notes: 'Cuti Tahunan: Acara keluarga (hak cuti tahunan disetujui)',
    verifiedByGeo: false,
  });

  return records;
};

export const INITIAL_ATTENDANCE_SEED: AttendanceRecord[] = [
  ...generateSeptemberAttendance(),
  ...generateOctoberAttendance(),
];

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
        label: 'Fee Konten - Reels / TikTok (KERIPIK SAYUR ID)',
        rate: 15000,
        qty: 1,
        subtotal: 15000,
        contentIds: ['ca1fab60-5b1d-48cd-ae32-332ab45db401'],
        isProjectControl: true,
      },
      {
        label: 'Fee Konten - Single Post (KERIPIK SAYUR ID & INOVASI PANGAN LESTARI)',
        rate: 10000,
        qty: 2,
        subtotal: 20000,
        contentIds: ['e293f98a-46c6-462c-a524-99372e748320', 'aac82e38-18cc-4110-82d8-4691b48d2ccb'],
        isProjectControl: true,
      },
    ],
    totalContentFee: 35000,
    overtime: 0,
    deductions: {
      bpjsKetenagakerjaan: 0,
      bpjsKesehatan: 0,
      premi: 0,
      taxPph21: 0,
      loanInstallment: 0,
    },
    totalDeduction: 0,
    grossSalary: 1205000,
    netSalary: 1205000,
    paymentStatus: 'Lunas',
    paymentDate: '2026-09-30',
    notes: 'Slip Gaji September: Gaji Pokok & Tunjangan Terkunci Direktori Staf & Tim (Potong 2 Hari Izin Rp 130.000) + Fee 3 Konten Project Control.',
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
        label: 'Fee Konten - Carousel (INOVASI PANGAN LESTARI & KERIPIK SAYUR ID)',
        rate: 10000,
        qty: 2,
        subtotal: 20000,
        contentIds: ['0a3bc4dc-8f7d-4b14-a2d5-e2ccb9a51503', '6872106a-8376-4ab6-a8e0-9ec942bda878'],
        isProjectControl: true,
      },
    ],
    totalContentFee: 20000,
    overtime: 0,
    deductions: {
      bpjsKetenagakerjaan: 0,
      bpjsKesehatan: 0,
      premi: 0,
      taxPph21: 0,
      loanInstallment: 0,
    },
    totalDeduction: 0,
    grossSalary: 1020000,
    netSalary: 1020000,
    paymentStatus: 'Lunas',
    paymentDate: '2026-09-30',
    notes: 'Slip Gaji September: Gaji Pokok & Tunjangan Terkunci (Rp 1.000.000) + Fee 2 Konten Project Control (Rp 20.000).',
    createdAt: '2026-09-30T17:00:00.000Z',
  },
  {
    id: 'PAY-2026-10-ADISSA',
    staffId: 'STF-1785295519572',
    staffName: 'Adissa Rifdah Aulia',
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    workDaysStandard: 20,
    daysPresent: 20,
    daysAbsent: 0,
    baseSalaryMonthly: 1000000,
    allowanceMonthly: 300000,
    baseSalaryCalculated: 1000000,
    allowanceCalculated: 300000,
    contentFees: [
      {
        label: 'Fee Konten - Reels / TikTok (INOVASI PANGAN LESTARI & KERIPIK SAYUR ID)',
        rate: 15000,
        qty: 5,
        subtotal: 75000,
        contentIds: ['cnt-d7bsz1a', 'cnt-gfpf02o', 'cnt-c5y4dn0', 'cnt-aayt6sa', 'cnt-qibvvmi'],
        isProjectControl: true,
      },
      {
        label: 'Fee Konten - Carousel (INOVASI PANGAN LESTARI & KERIPIK SAYUR ID)',
        rate: 10000,
        qty: 5,
        subtotal: 50000,
        contentIds: ['cnt-kdc627m', 'cnt-ltj6tck', 'cnt-dudnvp6', 'cnt-pfxoyej', 'cnt-c0onot3'],
        isProjectControl: true,
      },
      {
        label: 'Fee Konten - Single Post (KERIPIK SAYUR ID)',
        rate: 10000,
        qty: 1,
        subtotal: 10000,
        contentIds: ['cnt-fewnpv8'],
        isProjectControl: true,
      },
    ],
    totalContentFee: 135000,
    overtime: 0,
    deductions: {
      bpjsKetenagakerjaan: 0,
      bpjsKesehatan: 0,
      premi: 0,
      taxPph21: 0,
      loanInstallment: 0,
    },
    totalDeduction: 0,
    grossSalary: 1435000,
    netSalary: 1435000,
    paymentStatus: 'Belum',
    paymentDate: undefined,
    notes: 'Slip Gaji Oktober: Gaji Pokok & Tunjangan Terkunci Penuh (20 Hari Hadir Kerja & 1 Izin Sakit Surat Dokter Tanpa Potongan) + 11 Fee Konten Project Control (Rp 135.000).',
    createdAt: '2026-10-31T17:00:00.000Z',
  },
];

const CURRENT_STORAGE_VERSION = 'v8_0_clean_authentic_data_v9_aligned';

// Helper Storage API
export const INITIAL_LEAVES_SEED: LeaveRequest[] = [
  // September 2026
  {
    id: 'LEV-001',
    staffId: 'STF-1785295519572',
    staffName: 'Adissa Rifdah Aulia',
    type: 'Izin Sakit',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    totalDays: 1,
    reason: 'Sakit flu & demam, istirahat dokter 1 hari',
    status: 'Approved',
    approvedBy: 'Lalu Mahendra Ali Akbar',
    approvalDate: '2026-09-18',
    createdAt: '2026-09-18T07:15:00Z',
  },
  {
    id: 'LEV-002',
    staffId: 'STF-1785300550339',
    staffName: 'Muhammad Labib Azka',
    type: 'Tugas Luar Studio',
    startDate: '2026-09-24',
    endDate: '2026-09-24',
    totalDays: 1,
    reason: 'Liputan visual & asistensi workshop desain di Malang',
    status: 'Approved',
    approvedBy: 'Lalu Mahendra Ali Akbar',
    approvalDate: '2026-09-23',
    createdAt: '2026-09-23T14:20:00Z',
  },
  // Oktober 2026 (Struktur Izin Resmi: Sakit, Cuti Tahunan, Tugas Luar, Lembur Shoot)
  {
    id: 'LEV-OKT-01',
    staffId: 'STF-1785295519572',
    staffName: 'Adissa Rifdah Aulia',
    type: 'Tugas Luar Studio',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    totalDays: 1,
    reason: 'Liputan produksi konten retainer klien INOVASI PANGAN LESTARI & KERIPIK SAYUR ID',
    status: 'Approved',
    approvedBy: 'Lalu Mahendra Ali Akbar',
    approvalDate: '2026-10-14',
    createdAt: '2026-10-14T11:00:00Z',
  },
  {
    id: 'LEV-OKT-02',
    staffId: 'STF-1785295519572',
    staffName: 'Adissa Rifdah Aulia',
    type: 'Izin Sakit',
    startDate: '2026-10-21',
    endDate: '2026-10-21',
    totalDays: 1,
    reason: 'Sakit demam & radang tenggorokan (surat dokter klinik terlampir - hak sakit bergaji penuh)',
    status: 'Approved',
    approvedBy: 'Lalu Mahendra Ali Akbar',
    approvalDate: '2026-10-21',
    createdAt: '2026-10-21T07:30:00Z',
  },
  {
    id: 'LEV-OKT-03',
    staffId: 'STF-1785307520278',
    staffName: 'Aldrien Andriansyah',
    type: 'Cuti Tahunan',
    startDate: '2026-10-09',
    endDate: '2026-10-09',
    totalDays: 1,
    reason: 'Cuti Tahunan: Acara pernikahan keluarga di Surabaya',
    status: 'Approved',
    approvedBy: 'Lalu Mahendra Ali Akbar',
    approvalDate: '2026-10-07',
    createdAt: '2026-10-07T09:15:00Z',
  },
  {
    id: 'LEV-OKT-04',
    staffId: 'STF-1785374645853',
    staffName: 'Vita Belfi',
    type: 'Lembur Shoot',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    totalDays: 1,
    reason: 'Supervisi lembur workshop creative content bersama Disparta Kota Batu',
    status: 'Approved',
    approvedBy: 'Lalu Mahendra Ali Akbar',
    approvalDate: '2026-10-15',
    createdAt: '2026-10-15T18:00:00Z',
  },
];

export const INITIAL_EXPENSES_SEED: ExpenseClaim[] = [
  {
    id: 'EXP-001',
    staffId: 'STF-1785303827045',
    staffName: 'Lalu Mahendra Ali Akbar',
    title: 'BBM & Tol Mobil Operasional Produksi Konten Luar Studio Batu',
    category: 'Bensin & Transport Shoot',
    amount: 150000,
    date: '2026-10-15',
    status: 'Approved',
    notes: 'Kru 3 orang produksi footage on-site di Batu',
    approvedBy: 'Finance Management',
    createdAt: '2026-10-15T20:00:00Z',
    isIncludedInPayroll: true,
  },
  {
    id: 'EXP-002',
    staffId: 'STF-1785295519572',
    staffName: 'Adissa Rifdah Aulia',
    title: 'Sample Produk & Property Styling Foto Keripik',
    category: 'Tiket Lokasi / Izin Lokasi',
    amount: 75000,
    date: '2026-10-14',
    status: 'Approved',
    notes: 'Pembelian prop piring keramik & alas foto produk',
    approvedBy: 'Lalu Mahendra Ali Akbar',
    createdAt: '2026-10-14T16:30:00Z',
    isIncludedInPayroll: true,
  },
  {
    id: 'EXP-003',
    staffId: 'STF-1785307520278',
    staffName: 'Aldrien Andriansyah',
    title: 'Konsumsi Kru Lapangan Liputan Klien Inovasi Pangan Lestari',
    category: 'Konsumsi Kru Lapangan',
    amount: 65000,
    date: '2026-10-15',
    status: 'Approved',
    notes: 'Makan siang kru lapangan saat take video produk',
    approvedBy: 'Lalu Mahendra Ali Akbar',
    createdAt: '2026-10-15T13:10:00Z',
    isIncludedInPayroll: false,
  },
];

export const INITIAL_PROJECTS_SEED: ProjectAssignment[] = [
  {
    id: 'PRJ-101',
    clientName: 'INOVASI PANGAN LESTARI',
    projectName: 'Commercial Video & Product Catalog Maklon Keripik',
    category: 'Commercial Shoot',
    location: 'Studio obeecreatives Kota Batu',
    shootDate: '2026-10-05',
    callTime: '08:30 WIB',
    status: 'Completed',
    totalProjectFee: 3500000,
    crew: [
      {
        staffId: 'STF-1785303827045',
        staffName: 'Lalu Mahendra Ali Akbar',
        roleInProject: 'Lead Photographer',
        customFee: 500000,
      },
      {
        staffId: 'STF-1785295519572',
        staffName: 'Adissa Rifdah Aulia',
        roleInProject: 'Assistant & Lighting',
        customFee: 250000,
      },
    ],
    equipmentList: [
      { id: 'eq-1', name: 'Sony A7IV Main Camera + Battery (3x)', checked: true },
      { id: 'eq-2', name: 'Lens Sony FE 24-70mm F2.8 GM II', checked: true },
      { id: 'eq-3', name: 'Lens Sony FE 85mm F1.4 GM', checked: true },
      { id: 'eq-4', name: 'Godox AD200 Pro + Softbox Octa 80cm', checked: true },
      { id: 'eq-5', name: 'Wireless Mic DJI Mic 2 (Transmitter + Receiver)', checked: true },
      { id: 'eq-6', name: 'Tripod Carbon Fiber Sirui', checked: true },
    ],
    notes: 'Brief klien: tone warna natural warm, video 9:16 untuk Reels dan video horizontal 16:9 untuk display katalog.',
    createdAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 'PRJ-102',
    clientName: 'KERIPIK SAYUR ID',
    projectName: 'Social Media Monthly Retainer Shoot & Video Unboxing',
    category: 'Social Media Retainer',
    location: 'Studio obeecreatives Kota Batu',
    shootDate: '2026-10-15',
    callTime: '09:00 WIB',
    status: 'In Progress',
    totalProjectFee: 2800000,
    crew: [
      {
        staffId: 'STF-1785295519572',
        staffName: 'Adissa Rifdah Aulia',
        roleInProject: 'Project Coordinator',
        customFee: 300000,
      },
      {
        staffId: 'STF-1785307520278',
        staffName: 'Aldrien Andriansyah',
        roleInProject: 'Editor',
        customFee: 200000,
      },
    ],
    equipmentList: [
      { id: 'eq-11', name: 'Studio Table Top Background Set', checked: true },
      { id: 'eq-12', name: 'Continuous LED Amaran 200d', checked: true },
      { id: 'eq-13', name: 'SD Card Sandisk Extreme Pro 128GB', checked: true },
    ],
    notes: 'Konten batch 5 carousel edukasi pangan + 3 video reels unboxing.',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'PRJ-103',
    clientName: 'Disparta Kota Batu',
    projectName: 'Workshop Pelatihan Creative Content Creator',
    category: 'Event & Workshop',
    location: 'Graha Pancasila Balaikota Among Tani, Batu',
    shootDate: '2026-10-20',
    callTime: '08:00 WIB',
    status: 'Upcoming',
    totalProjectFee: 5000000,
    crew: [
      {
        staffId: 'STF-1785303827045',
        staffName: 'Lalu Mahendra Ali Akbar',
        roleInProject: 'Lead Photographer',
        customFee: 1000000,
      },
      {
        staffId: 'STF-1785374645853',
        staffName: 'Vita Belfi',
        roleInProject: 'Project Coordinator',
        customFee: 500000,
      },
    ],
    equipmentList: [
      { id: 'eq-21', name: 'Sony A7C II + 24-105mm F4 G', checked: true },
      { id: 'eq-22', name: 'Presenter Clicker & HDMI Cable', checked: true },
      { id: 'eq-23', name: 'Roll Banner & Handout Materi Peserta', checked: true },
    ],
    notes: 'Pemateri utama: Mas Hendra. Sesi praktek video smartphone dihandle tim kreatif obeecreatives.',
    createdAt: '2026-10-05T11:00:00Z',
  },
];

export const StorageService = {
  ensureInitialized(): void {
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (version !== CURRENT_STORAGE_VERSION) {
      this.resetToSeed();
    }
  },

  getStaff(): StaffUser[] {
    this.ensureInitialized();
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
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE_SEED));
      return INITIAL_ATTENDANCE_SEED;
    }
    try {
      const parsed: AttendanceRecord[] = JSON.parse(raw);
      // Validasi wajib: Adissa Rifdah Aulia harus memiliki 20 hari hadir & 2 hari izin di September 2026
      const adissaHadirSep = parsed.filter(
        (a) => a.staffId === 'STF-1785295519572' && a.status === 'Hadir' && a.date.startsWith('2026-09')
      ).length;

      // Cek apakah data bulan Oktober 2026 sudah ada
      const hasOctober = parsed.some((a) => a.date.startsWith('2026-10'));

      if (adissaHadirSep < 20 || !hasOctober) {
        // Gabungkan entri Oktober yang belum ada
        const existingIds = new Set(parsed.map((a) => a.id));
        let changed = false;
        INITIAL_ATTENDANCE_SEED.forEach((seed) => {
          if (!existingIds.has(seed.id)) {
            parsed.push(seed);
            changed = true;
          }
        });
        if (changed || adissaHadirSep < 20) {
          localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(parsed));
        }
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
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.CONTENT_FEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTENT_FEES, JSON.stringify(INITIAL_CONTENT_FEES_SEED));
      return INITIAL_CONTENT_FEES_SEED;
    }
    try {
      const parsed: ContentFeeItem[] = JSON.parse(raw);
      // Merge initial seed to ensure verified seeds (e.g. October 2026) are present
      const existingIds = new Set(parsed.map((item) => item.id));
      let hasNew = false;
      for (const seed of INITIAL_CONTENT_FEES_SEED) {
        if (!existingIds.has(seed.id)) {
          parsed.push(seed);
          hasNew = true;
        }
      }
      if (hasNew) {
        localStorage.setItem(STORAGE_KEYS.CONTENT_FEES, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_CONTENT_FEES_SEED;
    }
  },

  saveContentFees(fees: ContentFeeItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTENT_FEES, JSON.stringify(fees));
  },

  getPayroll(): PayrollRecord[] {
    this.ensureInitialized();
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
    const defaultSpreadsheetId = '1wdsy4L0NbPOR39dYjnOM8Og_Os10piz9VT5DBglb0qQ';
    const defaultWebhookUrl = 'https://script.google.com/macros/s/AKfycbzLzc0-TiWtK2KCB3hBGP6nbUbdMTGYNpQg_s8eHfwPTxlUjV7t6XVaw0yR1mf7jATP/exec';
    const raw = localStorage.getItem(STORAGE_KEYS.GAS_CONFIG);
    if (!raw) {
      const def: GasSyncConfig = {
        gasWebhookUrl: defaultWebhookUrl,
        spreadsheetId: defaultSpreadsheetId,
        autoSync: false,
      };
      localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(def));
      return def;
    }
    try {
      const parsed = JSON.parse(raw);
      // Auto-migrate legacy spreadsheet ID to active Project Control ID
      if (!parsed.spreadsheetId || parsed.spreadsheetId === '1el1tK4NGhoslMWECWzIo-7nBAEox6KZ-2TjlJ6WLIV8') {
        parsed.spreadsheetId = defaultSpreadsheetId;
      }
      if (!parsed.gasWebhookUrl || parsed.gasWebhookUrl.includes('AKfycbyni6-XwvwRugvD0THhLCCbtlsIYZcbJST8Woi8XkFAC8sFjji8ftTgS7yF')) {
        parsed.gasWebhookUrl = defaultWebhookUrl;
      }
      localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(parsed));
      return parsed;
    } catch {
      return {
        gasWebhookUrl: defaultWebhookUrl,
        spreadsheetId: defaultSpreadsheetId,
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

  getLeaves(): LeaveRequest[] {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVES_SEED));
      return INITIAL_LEAVES_SEED;
    }
    try {
      const parsed: LeaveRequest[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return INITIAL_LEAVES_SEED;
      const hasOctober = parsed.some((l) => l.startDate.startsWith('2026-10'));
      if (!hasOctober) {
        const existingIds = new Set(parsed.map((l) => l.id));
        INITIAL_LEAVES_SEED.forEach((seed) => {
          if (!existingIds.has(seed.id)) {
            parsed.push(seed);
          }
        });
        localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_LEAVES_SEED;
    }
  },

  saveLeaves(leaves: LeaveRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  },

  getExpenses(): ExpenseClaim[] {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES_SEED));
      return INITIAL_EXPENSES_SEED;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_EXPENSES_SEED;
    } catch {
      return INITIAL_EXPENSES_SEED;
    }
  },

  saveExpenses(expenses: ExpenseClaim[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getProjects(): ProjectAssignment[] {
    this.ensureInitialized();
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS_SEED));
      return INITIAL_PROJECTS_SEED;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_PROJECTS_SEED;
    } catch {
      return INITIAL_PROJECTS_SEED;
    }
  },

  saveProjects(projects: ProjectAssignment[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  resetToSeed(): void {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF_SEED));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE_SEED));
    localStorage.setItem(STORAGE_KEYS.CONTENT_FEES, JSON.stringify(INITIAL_CONTENT_FEES_SEED));
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL_SEED));
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVES_SEED));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES_SEED));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS_SEED));
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_STORAGE_VERSION);
  },
};
