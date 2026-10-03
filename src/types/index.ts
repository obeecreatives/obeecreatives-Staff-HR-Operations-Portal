export type StaffRole =
  | 'project_manager'
  | 'web_developer'
  | 'admin'
  | 'staff_creator'
  | 'site_engineer'
  | 'vendor_lapangan'
  | 'client';

export type Department =
  | 'Photography'
  | 'Desain Grafis'
  | 'Videography'
  | 'Social Media Management'
  | 'Workshop/Pelatihan'
  | 'Management'
  | 'Creative Content'
  | 'Tech & Dev'
  | 'Field Ops';

export type WorkMode = 'WFO' | 'On-Site' | 'WFH' | 'Mobile';

export type StaffStatus =
  | 'Tetap'
  | 'Nonaktif'
  | 'Magang'
  | 'PKWT'
  | 'Freelancer'
  | 'Aktif - Karyawan Tetap'
  | 'Aktif - PKWT'
  | 'Aktif - Magang'
  | 'Aktif - Freelancer';

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  workMode?: WorkMode;
  avatar?: string;
  pin?: string; // 4-8 digits
  phone?: string;
  jobTitle?: string;
  department?: Department;
  skills?: string[];
  joinedDate?: string;
  contractEndDate?: string;
  status?: StaffStatus;
  gender?: 'Pria' | 'Wanita';
  gradeSkill?: string;
  baseSalary?: number;
  allowance?: number;
  freelancerFee?: number;
  bankAccount?: BankAccount;
  address?: string;
  instagram?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  workMode: WorkMode;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpha';
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  latitude?: number;
  longitude?: number;
  distanceMeters?: number; // Jarak ke Studio obeecreatives Kota Batu
  locationName?: string;
  notes?: string;
  verifiedByGeo?: boolean;
}

export interface ContentFeeItem {
  id: string;
  contentTitle: string;
  contentType: string; // e.g., 'Reels Promo', 'Feed Carousel', 'TikTok Series', 'YouTube Long'
  clientName: string;
  creatorName: string;
  approvedDate: string; // YYYY-MM-DD (TanggalApprove locked)
  feeAmount: number;
  status: 'Approved' | 'Scheduled' | 'Published';
  usedInPayrollId?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;
  workDaysStandard: number; // Standar 20 hari kerja
  daysPresent: number;
  daysAbsent: number; // Izin & Alpha yang memotong gaji
  baseSalaryMonthly: number; // Nilai penuh terkunci
  allowanceMonthly: number; // Nilai penuh terkunci
  baseSalaryCalculated: number; // Setelah potongan
  allowanceCalculated: number; // Setelah potongan
  contentFees: {
    label: string;
    rate: number;
    qty: number;
    subtotal: number;
    contentIds?: string[];
    isProjectControl?: boolean;
  }[];
  totalContentFee: number;
  overtime: number;
  grossSalary: number;
  deductions: {
    bpjsKetenagakerjaan: number;
    bpjsKesehatan: number;
    premi: number;
    taxPph21: number;
    loanInstallment: number;
  };
  totalDeduction: number;
  netSalary: number;
  paymentStatus: 'Belum' | 'Lunas';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

export interface GasSyncConfig {
  gasWebhookUrl: string;
  spreadsheetId: string;
  lastSyncTime?: string;
  autoSync: boolean;
}

// ----------------------------------------------------
// Modul 2: Pengajuan Izin, Cuti & Lembur
// ----------------------------------------------------
export type LeaveType =
  | 'Cuti Tahunan'
  | 'Izin Sakit'
  | 'Izin Keperluan Pribadi'
  | 'Tugas Luar Studio'
  | 'Lembur Shoot';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string; // Foto surat dokter / bukti tugas
  status: RequestStatus;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

// ----------------------------------------------------
// Modul 3: Klaim Reimbursement & Kasbon Operasional
// ----------------------------------------------------
export type ExpenseCategory =
  | 'Bensin & Transport Shoot'
  | 'Tiket Lokasi / Izin Lokasi'
  | 'Konsumsi Kru Lapangan'
  | 'Sewa Alat Tambahan'
  | 'Parkir & Tol'
  | 'Kasbon / Pinjaman Cepat'
  | 'Lainnya';

export interface ExpenseClaim {
  id: string;
  staffId: string;
  staffName: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  receiptPhoto?: string; // Data URL foto struk/nota
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed';
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  isIncludedInPayroll?: boolean;
}

// ----------------------------------------------------
// Modul 4: Jadwal Penugasan Proyek & Crew Call Sheet
// ----------------------------------------------------
export interface ProjectCrewMember {
  staffId: string;
  staffName: string;
  roleInProject:
    | 'Lead Photographer'
    | 'Videographer'
    | 'Drone Pilot'
    | 'Assistant & Lighting'
    | 'Editor'
    | 'Project Coordinator';
  customFee?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface ProjectAssignment {
  id: string;
  clientName: string;
  projectName: string;
  category:
    | 'Commercial Shoot'
    | 'Prewedding & Wedding'
    | 'Social Media Retainer'
    | 'Event & Workshop'
    | 'Product Catalog';
  location: string;
  shootDate: string; // YYYY-MM-DD
  callTime: string; // e.g. "06:30 WIB"
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Canceled';
  crew: ProjectCrewMember[];
  equipmentList: EquipmentItem[];
  notes?: string;
  totalProjectFee?: number;
  createdAt: string;
}

export type MainTabType =
  | 'dashboard'
  | 'directory'
  | 'attendance'
  | 'projects'
  | 'payroll'
  | 'sync';

