import { StaffUser, Department, StaffRole, StaffStatus, WorkMode } from '../types';

/**
 * Parser pintar untuk data CSV atau TSV (Copy-Paste langsung dari Google Sheet)
 */
export function parseSheetDataToStaff(text: string): { staffList: StaffUser[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { staffList: [], errors: ['Data terlalu pendek atau kosong. Minimal harus ada baris header dan 1 baris data.'] };
  }

  // Detect delimiter (Tab or Comma)
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  // Helper to split CSV row taking quotes into account
  const splitRow = (rowStr: string): string[] => {
    if (delimiter === '\t') {
      return rowStr.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    }
    // Comma regex taking quotes into account
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const headers = splitRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Header mappings
  const colIndex = {
    id: headers.findIndex((h) => h === 'id'),
    name: headers.findIndex((h) => h === 'nama' || h === 'name'),
    divisi: headers.findIndex((h) => h === 'divisi' || h === 'department'),
    status: headers.findIndex((h) => h === 'status'),
    jabatan: headers.findIndex((h) => h === 'jabatan' || h === 'jobtitle'),
    grade: headers.findIndex((h) => h === 'gradeskill' || h === 'grade'),
    gajiPokok: headers.findIndex((h) => h === 'gajipokok' || h === 'basesalary'),
    tunjangan: headers.findIndex((h) => h === 'tunjjabatan' || h === 'tunjangan' || h === 'allowance'),
    phone: headers.findIndex((h) => h === 'notelpon' || h === 'telepon' || h === 'phone' || h === 'whatsapp'),
    email: headers.findIndex((h) => h === 'email'),
    bank: headers.findIndex((h) => h === 'namabank' || h === 'bank'),
    noRek: headers.findIndex((h) => h === 'norekening' || h === 'rekening'),
    pin: headers.findIndex((h) => h === 'pin'),
    workMode: headers.findIndex((h) => h === 'workmode' || h === 'modekerja'),
    role: headers.findIndex((h) => h === 'role'),
    skills: headers.findIndex((h) => h === 'skills' || h === 'skill'),
    notes: headers.findIndex((h) => h === 'catatan' || h === 'notes'),
    address: headers.findIndex((h) => h === 'alamat' || h === 'address'),
    instagram: headers.findIndex((h) => h === 'instagram' || h === 'ig'),
  };

  const staffList: StaffUser[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = splitRow(lines[i]);
    const getVal = (idx: number) => (idx >= 0 && rawCols[idx] !== undefined ? rawCols[idx].trim() : '');

    const name = getVal(colIndex.name);
    if (!name) continue;

    // Clean numbers
    const cleanNum = (str: string) => {
      const cleaned = str.replace(/[^0-9]/g, '');
      return cleaned ? parseInt(cleaned, 10) : 0;
    };

    const id = getVal(colIndex.id) || ('STF-' + Date.now() + i);
    const divisiRaw = getVal(colIndex.divisi);
    let department: Department = 'Creative Content';
    if (divisiRaw.toLowerCase().includes('tech') || divisiRaw.toLowerCase().includes('dev')) department = 'Tech & Dev';
    else if (divisiRaw.toLowerCase().includes('ops') || divisiRaw.toLowerCase().includes('field')) department = 'Field Ops';
    else if (divisiRaw.toLowerCase().includes('manage') || divisiRaw.toLowerCase().includes('ceo')) department = 'Management';

    // Status map
    const statusRaw = getVal(colIndex.status);
    let status: StaffStatus = 'Aktif - PKWT';
    if (statusRaw.toLowerCase().includes('nonaktif')) status = 'Nonaktif';
    else if (statusRaw.toLowerCase().includes('tetap')) status = 'Aktif - Karyawan Tetap';
    else if (statusRaw.toLowerCase().includes('magang')) status = 'Aktif - Magang';
    else if (statusRaw.toLowerCase().includes('freelance')) status = 'Aktif - Freelancer';

    // Role map
    let role: StaffRole = 'staff_creator';
    const roleRaw = getVal(colIndex.role).toLowerCase();
    const jabatanRaw = getVal(colIndex.jabatan).toLowerCase();
    if (roleRaw.includes('admin') || jabatanRaw.includes('ceo') || name.toLowerCase().includes('mahendra')) {
      role = 'admin';
    } else if (roleRaw.includes('pm') || roleRaw.includes('project_manager') || jabatanRaw.includes('project manager')) {
      role = 'project_manager';
    } else if (roleRaw.includes('developer')) {
      role = 'web_developer';
    }

    // Bank Account parsing
    let bankName = getVal(colIndex.bank);
    let accountNumber = getVal(colIndex.noRek);
    let accountHolder = name;

    // If bank info was in "Catatan" in old format: "Rekening Bank Jago a/c 105180543278"
    const catatan = getVal(colIndex.notes);
    if (!bankName && catatan.toLowerCase().includes('bank')) {
      const match = catatan.match(/bank\s+([a-zA-Z]+)(?:\s+a\/c\s+(\d+))?/i);
      if (match) {
        bankName = 'Bank ' + match[1].toUpperCase();
        if (match[2]) accountNumber = match[2];
      }
    }

    const skillsRaw = getVal(colIndex.skills);
    const skills = skillsRaw ? skillsRaw.split(/[;,]/).map((s) => s.trim()).filter(Boolean) : [];

    staffList.push({
      id: id,
      name: name,
      email: getVal(colIndex.email) || `${name.toLowerCase().replace(/\s+/g, '')}@obeecreatives.com`,
      role: role,
      department: department,
      jobTitle: getVal(colIndex.jabatan) || 'Staf Kreatif',
      workMode: (getVal(colIndex.workMode) as WorkMode) || 'WFO',
      status: status,
      phone: getVal(colIndex.phone),
      pin: getVal(colIndex.pin) || '123456',
      baseSalary: cleanNum(getVal(colIndex.gajiPokok)),
      allowance: cleanNum(getVal(colIndex.tunjangan)),
      bankAccount: {
        bankName: bankName || 'Bank Belum Terdata',
        accountNumber: accountNumber || '-',
        accountHolder: accountHolder,
      },
      skills: skills.length > 0 ? skills : ['Creative Content', 'Production'],
      address: getVal(colIndex.address),
      instagram: getVal(colIndex.instagram),
      notes: catatan,
    });
  }

  return { staffList, errors };
}
