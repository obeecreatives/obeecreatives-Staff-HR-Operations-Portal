# Database Staff obeecreatives
## Panduan Lengkap — Baseline v1-v7 [LOCKED] + v8-v12 [BELUM DI-LOCK RESMI, SUDAH DIPAKAI TIM]

**Developed by lalumahendra/obeecreatives**
**Status: v1-v7 sudah ditest dan DI-LOCK. v8-v12 (termasuk integrasi Project Control, Switch App, dan wrapper GitHub Pages) sudah dipakai tim sehari-hari secara stabil, namun belum resmi dikonfirmasi "lock" oleh user di sesi ini.**
**Link akses utama (bebas banner Apps Script): `https://obeecreatives.github.io/Database-Staff/`**

> ⚠️ **CATATAN PRODUKSI PENTING**: Tools ini SUDAH dipakai tim dan berjalan stabil. Semua update ke depan WAJIB bersifat aditif (tambahan murni) — tidak boleh mengubah struktur/perilaku yang sudah ada, tidak boleh menghilangkan/menimpa data. Perubahan struktural yang tidak terhindarkan WAJIB dikonfirmasi dulu ke user sebelum eksekusi.

Project ini **terpisah** dari sistem "Paket Lengkap" (CRM + Quotation + Invoice) — pakai spreadsheet & Apps Script project sendiri, supaya tidak saling mengganggu.

---

## 1. Ringkasan Fitur

### v1 — Staff (Database Karyawan)
- CRUD lengkap: Tambah, Edit, Nonaktifkan/Aktifkan kembali staff
- Field: Nama, Divisi, Status (Karyawan Tetap/PKWT/Magang/Freelancer/Nonaktif), Jabatan, Grade Skill, Gaji Pokok, Tunjangan Jabatan, Freelancer Fee, Tanggal Mulai/Akhir Kontrak, Jenis Kelamin, NIK, No KK, No Telepon, Instagram, Alamat, Email, Foto (URL), Catatan
- Auto-hitung: **Gaji + Tunjangan** dan **Durasi Kontrak** ("X Hari Lagi", berubah merah kalau ≤ 7 hari)
- Search nama, filter Divisi & Status
- **Role-based access**: Admin (akses penuh + NIK/No KK) vs Staff (view-only, NIK/No KK disembunyikan di server, bukan cuma disembunyikan di tampilan)

### v2 — Workload (Kanban Tugas)
- Sheet `Workload`, tab navigasi baru di dashboard
- Kanban 4 kolom: **To Do → In Progress → Review → Done**
- Filter per Divisi
- Admin: Tambah/Edit/Hapus task. Semua user (Admin & Staff): bisa geser Status lewat dropdown di kartu
- Kartu menampilkan: Nama Task, Staff yang ditugaskan, Divisi, Deadline, badge Prioritas (Low/Medium/High)

### v3 — Attendance (Kehadiran)
- Sheet `Attendance`, tab navigasi ketiga
- Status: Hadir, Izin, Sakit, Cuti, Alpha — kalau "Hadir", muncul field Jam Masuk/Jam Keluar
- **Kartu rekap otomatis** (jumlah per status) mengikuti filter Staff & Bulan aktif
- Filter per Staff dan per Bulan
- Admin: Tambah/Edit/Hapus. Staff: lihat saja

### v4 — Payroll (BARU)
- Sheet `Payroll`, tab keempat di navigasi
- **Periode custom** (bebas pilih tanggal awal-akhir, bukan bulanan tetap)
- **Perhitungan otomatis** saat pilih Staff + Periode: Hari Hadir dihitung dari data Attendance (status "Hadir" dalam rentang tanggal), lalu Gaji Pokok & Tunjangan Jabatan dihitung proporsional: `(nilai bulanan ÷ 20 hari kerja) × Hari Hadir`
- **Komponen Tambahan** fleksibel (bisa tambah baris sebanyak apapun): Label + Rate (Rp) + Qty, subtotal otomatis — untuk Approval Tasks, Freelancer Fee, Saham, dll
- **Lembur Kerja**: input manual
- **Potongan** (semua manual): BPJS Ketenagakerjaan, BPJS Kesehatan, Premi, Pajak PPh 21, Angsuran Pinjaman
- Preview kalkulasi real-time di form (Total Gaji Kotor, Total Potongan, Gaji Yang Dibayarkan) — update otomatis setiap ada perubahan input
- Status Pembayaran: Belum/Lunas, dengan Tandai Lunas/Batalkan Lunas sekali klik (otomatis isi Tanggal Bayar hari ini)
- Tabel ringkas per staff per periode, filter per Staff

### v12 — Wrapper GitHub Pages (Hilangkan Banner Apps Script) + Update Link Switch App (BARU)

**Masalah yang diselesaikan:** setiap Web App Apps Script yang diakses langsung lewat URL `.../exec` menampilkan banner abu-abu bawaan Google ("Aplikasi ini dibuat oleh pengguna Google Apps Script") di bagian atas halaman. Banner ini dipasang Google di LUAR iframe tempat konten kita dirender, jadi tidak bisa dihilangkan lewat CSS/JS di dalam kode Apps Script itu sendiri.

**Solusi:** banner hanya muncul kalau browser menavigasi LANGSUNG (top-level) ke URL `/exec`. Kalau URL itu di-*embed* di dalam `<iframe>` pada halaman terpisah yang di-host di domain lain (bukan `script.google.com`), banner itu tidak muncul.

- **Tidak ada perubahan apapun** di `Code.gs` maupun file HTML Database Staff — karena Database Staff adalah **Single-Page App (React)**, semua tab (Dashboard/Staff/Workload/Attendance/Payroll) berpindah lewat state React di client, BUKAN lewat parameter `?mode=` di server. Jadi solusi "penuh" (atribut `data-nav-mode` + `postMessage` untuk navigasi antar-halaman) yang dibutuhkan sistem multi-halaman **tidak diperlukan** di sini — cukup wrapper sederhana yang memuat `/exec` satu kali lewat iframe
- **File baru**: `wrapper-index Database Staff.html` — di-host terpisah di **GitHub Pages** (bukan bagian dari project Apps Script), sekarang live di **`https://obeecreatives.github.io/Database-Staff/`**
- `XFrameOptionsMode.ALLOWALL` di `doGet()` (sudah ada sejak awal) adalah syarat wajib supaya iframe tidak diblokir — sudah terpenuhi tanpa perlu diubah
- Link exec asli (`.../exec`) tetap berfungsi seperti biasa untuk siapa pun yang masih memakainya — cuma link **wrapper** yang dibagikan ke pengguna akhir sebagai link utama sekarang
- **Konsekuensi untuk Switch App**: konstanta `SWITCH_APPS` di `JavaScript.html` sekarang berisi **link wrapper GitHub Pages** untuk semua tools (CRM, Laporan Keuangan, Equipment Hub, Document Hub, Database Surat, Recruitment, Logo & Packaging Builder), **bukan lagi link exec langsung**. Kalau nanti ada tools baru ditambahkan atau link wrapper berubah, sumber acuannya ada di spreadsheet registry Document Hub
- **Catatan penting**: kalau kode `Code.gs`/`JavaScript.html` di-update & di-deploy ulang di kemudian hari, **file wrapper GitHub TIDAK PERLU diupload ulang** — dia cuma memuat Web App secara live lewat iframe, jadi otomatis ikut versi terbaru

### v11 — Integrasi Fee dari Project Control ke Payroll (BARU)

**File ini di-update langsung oleh user (di luar thread ini) lalu diupload untuk diverifikasi dan dijadikan baseline resmi.**

**Cara Kerja**
- Di form Payroll, ada tombol **"⟳ Tarik Fee dari Project Control"** — menarik otomatis fee konten milik staff yang bersangkutan dari spreadsheet **Project Control** (`PROJECT_CONTROL_SPREADSHEET_ID`, sheet `ContentTracker`)
- Kriteria konten yang ditarik: `Creator` cocok dengan nama staff, `FeeAmount > 0`, dan **`TanggalApprove`** (dicatat otomatis sistem saat status pertama kali disetujui, TIDAK bisa diedit manual) berada dalam rentang Periode Payroll — **bukan** `TanggalProduksi` (field manual yang bisa diubah kapan saja meski fee sudah terkunci)
- Hasil tarikan dikelompokkan **per Jenis Konten**, jadi baris Komponen Tambahan dengan Label `"Fee Konten - [Jenis]"`, ditandai visual **"· Project Control"**, dan **read-only** (tidak bisa diedit manual) untuk menjaga akurasi
- **Anti dobel-hitung**: memakai sheet `FeeIntegrationLog` milik Project Control sebagai pencatatan bersama — begitu suatu ContentID sudah ditarik ke payroll manapun, tidak akan disarankan lagi. Sheet log yang sama ini juga dipakai oleh Laporan Keuangan (project terpisah) untuk mencegah fee yang sama dobel-tercatat di dua tempat berbeda
- Klik ulang tombol tarik (misal saat edit payroll) **aman** — baris Project Control lama yang sudah tidak muncul lagi di hasil tarikan baru (karena sudah kepakai) tetap dipertahankan, tidak hilang

**Perlindungan Data Historis (Payroll Locking)**
- Payroll yang **sudah tersimpan** tidak dihitung ulang dari data Staff yang berlaku SEKARANG kalau cuma diedit untuk hal lain (Komponen Tambahan/Lembur/Potongan/Status) — `GajiPokokAmount`/`TunjJabatanAmount` dikunci dari histori record itu sendiri
- Ini **mencegah promosi gaji staff di kemudian hari diam-diam mengubah nominal payroll periode lama** yang sudah final/terbayar
- Hitung ulang dari data Staff terkini HANYA terjadi kalau Admin sengaja mengganti Staff atau Periode saat Edit payroll
- Kolom baru `GajiPokokBulanan` & `TunjJabatanBulanan` (nilai penuh sebelum potongan Izin/Alpha, untuk breakdown tampilan slip gaji) — ditambahkan di **paling akhir** `PAYROLL_COLUMNS`, aman untuk data lama

**Detail Teknis**
- Fungsi baru: `pullContentFeeSuggestions()`, `getProjectControlFeeLogSet_()`, `extractProjectControlContentIds_()`, `markProjectControlFeesUsed_()`, `findLastPcContentDataRow_()`
- `buildPayrollTotals_()` sekarang menerima parameter kedua `lockedBase` (opsional) — kalau diisi, pakai angka gaji yang sudah terkunci dari record lama alih-alih hitung ulang
- Konfigurasi: `PROJECT_CONTROL_SPREADSHEET_ID`, `PC_CONTENT_SHEET_NAME`, `PC_FEELOG_SHEET_NAME`, `PC_PUSHED_TO_LABEL` di bagian atas `Code.gs`
- Konten Bantuan bagian Payroll sudah diperbarui mencakup fitur ini + dikoreksi (sebelumnya masih mendeskripsikan rumus lama "proporsional" padahal sudah berubah sejak v8)
- **Tidak ada sheet/kolom yang dihapus atau diubah urutannya** — semua penambahan bersifat aditif, konsisten dengan pola migrasi aman yang sudah dipakai sejak v8-v10

### v10 — Standar Konvensi Lintas-Tools + Switch App (BARU)
- **🔀 Switch App**: ikon bulat di topbar (sebelah Bantuan), dropdown pindah ke web app tools obeeTOOLS lain (CRM, Laporan Keuangan, Equipment Hub, Document Hub, Database Surat) di tab yang sama tanpa buka tab baru. Project Control sengaja tidak dimasukkan. Daftar URL ada di konstanta `SWITCH_APPS` di `JavaScript.html`
- **Tombol Bantuan** diubah dari tombol teks jadi **ikon bulat "?"** — menyamakan standar visual dengan tools lain (CRM, Equipment Hub, Document Hub, dll), tetap sejajar dalam satu baris dengan badge role & Switch App (bukan mengambang position:fixed terpisah seperti standar asli, disesuaikan karena permintaan sebelumnya supaya ketiganya sejajar)
- **Nomor versi ditampilkan di dalam modal Bantuan** ("Versi: v10") — standar semua tools, memudahkan cek versi tanpa buka kode
- **`obeetools@gmail.com`** (akun Developer) ditambahkan ke `ADMIN_EMAILS` sebagai default standar semua tools obeeTOOLS (sebelumnya cuma ada loehendra, loevie02, obeecreatives)
- Perubahan ini murni tambahan/penyesuaian tampilan & konfigurasi — **tidak ada sheet/kolom yang diubah atau dihapus**
- **Belum diterapkan** (menyusul terpisah, karena perubahan struktural lebih besar): **Kelola Akses** (sheet "Users" menggantikan hardcode `ADMIN_EMAILS`/`STAFF_EMAILS`) — sudah jadi standar di CRM, Equipment Hub, Project Control, dan sistem Database Staff yang lain (bukan sistem ini)

### v9 — Absensi Otomatis Harian (BARU)

**Cara Kerja**
- Setiap **hari kerja** (Senin, Selasa, Rabu, Kamis, Sabtu — jam 09:00-17:00), sistem otomatis membuat data Attendance berstatus **"Hadir"** untuk SEMUA staff aktif, tanpa perlu input manual
- **Jumat & Minggu dilewati** (bukan hari kerja, tidak ada absensi dibuat)
- Kalau ternyata staff tersebut Izin/Sakit/Cuti, Admin tinggal **Edit** data yang sudah otomatis terisi itu dan ganti Status-nya — tidak perlu hapus/buat ulang
- Tidak akan membuat data duplikat — kalau staff sudah punya data Attendance untuk tanggal itu (baik dari input manual atau auto), sistem otomatis skip

**Setup yang Diperlukan (Sekali Saja)**
1. Buka **Google Sheets** (bukan web app) dari spreadsheet Database Staff
2. Refresh halaman supaya menu custom "Database Staff" muncul di menu bar
3. Klik **Database Staff → ⏰ Setup Trigger Absensi Otomatis**
4. Google akan minta otorisasi (kalau baru pertama kali) — izinkan
5. Setelah itu, sistem akan otomatis jalan sendiri setiap hari sekitar jam 07:00 pagi lewat **Time-Driven Trigger** bawaan Apps Script (gratis, tidak perlu layanan luar)

**Fitur Tambahan**
- Tombol **"⚡ Generate Absensi Hari Ini"** di tab Attendance (khusus Admin) — untuk memicu manual kapan saja, berguna untuk testing atau kalau trigger otomatis belum sempat diatur / terlewat suatu hari
- Fungsi inti (`autoCreateAttendanceForDate_`) dipakai bersama oleh trigger otomatis dan tombol manual, jadi perilakunya konsisten

**Detail Teknis**
- Fungsi baru: `isWorkingDay_()`, `autoCreateAttendanceForDate_()`, `generateAttendanceForToday()` (dipanggil dari web app), `dailyAutoAttendanceTrigger()` (dipanggil trigger, TANPA `requireAdmin_()` karena trigger berjalan tanpa sesi user), `setupAutoAttendanceTrigger_()` (setup sekali, idempotent — hapus trigger lama sebelum bikin baru)
- Konfigurasi hari & jam kerja ada di konstanta `WORKING_DAYS_OF_WEEK`, `JAM_MASUK_DEFAULT`, `JAM_KELUAR_DEFAULT` di `Code.gs` — gampang diubah kalau ketentuan jam kerja berubah di masa depan

### v8 — Rumus Gaji Baru (Izin/Alpha Memotong Gaji, BARU)
- **Gaji Pokok** & **Tunj. Jabatan** = nilai bulanan PENUH/maksimal (tidak bertambah meski staff hadir >20 hari)
- Dipotong per hari untuk setiap hari **Izin** atau **Alpha**: `potongan/hari = nilai bulanan ÷ 20`
- **Sakit & Cuti TIDAK memotong gaji**
- Kolom baru `HariTidakMasuk` ditambahkan di sheet Payroll (di paling akhir + migrasi otomatis, aman untuk data lama)
- Lihat bagian 7 (Standar Perhitungan Payroll) untuk detail lengkap & riwayat perubahan rumus

### v7 — Bantuan / Help (BARU)
- Tombol **"📖 Bantuan"** di pojok kanan atas (topbar), di samping badge role
- Membuka modal dengan **8 section** navigasi tab: Memulai, Dashboard, Staff, Workload, Attendance, Payroll, **Ketentuan Grade**, Lain-lain
- Section **Ketentuan Grade**: tabel referensi Level/Grade Staff (C=Creative Trainee, B=Junior Creative, A=Creative Specialist, S=Senior Creative Specialist, L=Lead Creative) beserta format penulisan yang benar di field Grade Skill — jadi panduan Admin saat Tambah/Edit Staff
- Berisi penjelasan lengkap tiap modul, perbedaan akses Admin vs Staff, dan tips penggunaan
- Bisa diakses oleh Admin maupun Staff
- Murni fitur frontend — tidak ada perubahan di Code.gs
- Isi teks bantuan mudah diedit di masa depan lewat konstanta `HELP_SECTIONS` di `JavaScript.html`

### v6 — Reminder Kontrak & Export Payroll Massal (BARU)

**Reminder Kontrak Akan Berakhir (H-7)**
- Kartu peringatan otomatis muncul di atas Dashboard kalau ada staff aktif yang kontraknya (`TanggalAkhir`) berakhir dalam 0-7 hari
- Setiap staff yang terdaftar punya tombol **"Kirim WA"** (khusus Admin) — klik-kirim WhatsApp reminder ke staff tsb, sama seperti pola notifikasi Payroll (v5.1)
- **Keterbatasan yang disengaja**: ini BUKAN reminder otomatis tanpa ada yang buka aplikasi — karena pakai pendekatan klik-kirim (gratis, tanpa gateway berbayar), reminder hanya muncul & bisa dikirim kalau Admin membuka Dashboard. Kalau butuh reminder yang benar-benar berjalan sendiri (misal lewat email setiap pagi), itu bisa ditambahkan pakai time-driven trigger + `MailApp` (gratis, native Apps Script) sebagai pengembangan lanjutan.

**Export Payroll Massal (ZIP)**
- Di tab Payroll, ada dropdown untuk pilih salah satu periode yang sudah ada datanya, lalu tombol **"Export Semua (ZIP)"**
- Menghasilkan satu file **.zip** berisi PDF slip gaji SEMUA staff untuk periode itu sekaligus (bukan satu-satu)
- Nama file dalam ZIP otomatis dibedakan kalau ada nama staff yang sama
- Fungsi backend baru: `generatePayslipsBatchZipBase64(periodeAwal, periodeAkhir)` — pakai `Utilities.zip()` bawaan Apps Script, tidak perlu library tambahan

### v5.1 — Notifikasi WhatsApp Saat Gaji Lunas (BARU)
- Saat Admin klik **"Tandai Lunas"** di baris Payroll, setelah dikonfirmasi & status tersimpan, **tab baru otomatis terbuka ke WhatsApp** (`wa.me`) dengan nomor staff (dari field No. Telepon) dan pesan notifikasi sudah terisi otomatis
- Admin tinggal klik **Kirim** di WhatsApp — ini pendekatan **"klik-kirim"** (semi-otomatis), gratis, tanpa perlu daftar layanan pihak ketiga
- Nomor telepon otomatis dikonversi ke format internasional (`08xx` → `62 8xx`)
- Kalau No. Telepon staff kosong, muncul toast error dan WhatsApp tidak dibuka
- Pola ini sengaja membuka tab kosong **sebelum** memanggil server (bukan sesudah), supaya tidak diblokir popup blocker browser — kalau mau menambah notifikasi otomatis serupa di masa depan (misal saat approve Workload), ikuti pola yang sama
- **Murni fitur frontend** — tidak ada perubahan di Code.gs
- Catatan: ini BUKAN pengiriman otomatis penuh. Kalau ke depannya mau full otomatis tanpa klik manual, perlu upgrade ke WhatsApp Gateway pihak ketiga (misal Fonnte/Wablas) yang terhubung lewat `UrlFetchApp` di Apps Script — sudah pernah dibahas sebagai opsi lanjutan

### v5 — Dashboard Ringkasan Lintas Divisi (BARU)
- Tab **Dashboard** — sekarang jadi tab pertama/default saat dashboard dibuka
- **Kartu ringkasan**: Total Staff Aktif, Jumlah Divisi, Total Task Aktif (belum Done), Total Payroll Bulan Ini
- **2 Chart** (pakai Chart.js): Bar chart Jumlah Staff per Divisi, dan Stacked Bar Chart distribusi status Workload (To Do/In Progress/Review/Done) per Divisi
- **Tabel ringkasan per Divisi**: Jumlah Staff, breakdown status Workload, **Tingkat Kehadiran bulan berjalan** (persentase Hadir dari total absensi tercatat bulan ini, dengan progress bar visual), Total Payroll bulan berjalan
- Semua dihitung otomatis di frontend dari data yang sudah ada (Staff, Workload, Attendance, Payroll) — **tidak perlu sheet baru, tidak ada perubahan di Code.gs sama sekali**

### v4.1 — Export Slip Gaji PDF (BARU)
- Tombol **"Export PDF"** di setiap baris tabel Payroll — bisa diakses Admin maupun Staff (hanya membaca data yang sudah terlihat di tabel)
- PDF berisi: brand header obeecreatives, info staff (Nama/Jabatan/Divisi/Grade/Status/Hari Hadir), rincian gaji (Gaji Pokok, Tunj. Jabatan, semua Komponen Tambahan, Lembur, Total Gaji Kotor), rincian Potongan, **Gaji Yang Dibayarkan**, Status Pembayaran, Tanggal Bayar, dan Catatan
- Dibuat lewat `HtmlService.createHtmlOutput(html).getAs('application/pdf')` — pola yang sama seperti PDF generation di sistem Paket Lengkap
- File otomatis terdownload ke browser dengan nama `Slip_Gaji_[Nama]_[PeriodeAwal]_sd_[PeriodeAkhir].pdf`

### Akses Saat Ini
| Role | Email | Akses |
|---|---|---|
| Admin | `loehendra@gmail.com` (Owner) | Penuh — semua fitur + NIK/No KK |
| Admin | `loevie02@gmail.com` (Vita) | Penuh — semua fitur + NIK/No KK |
| Staff | *(belum ada)* | View-only, tanpa NIK/No KK — tinggal ditambahkan ke `STAFF_EMAILS` kapan saja |

---

## 2. Struktur File

| File | Isi |
|---|---|
| `Code.gs` | Semua logic backend: CRUD Staff/Workload/Attendance, role-based access, kalkulasi gaji & durasi |
| `Index.html` | Entry point HTML, load React + Babel Standalone (JSX) dari CDN |
| `Stylesheet.html` | Semua CSS — brand identity obeecreatives (merah `#E30000` + hitam + grey/white) |
| `JavaScript.html` | Seluruh komponen React (JSX): tab Staff/Workload/Attendance, modal form, Kanban, toast, dsb |
| `AccessDenied.html` | Halaman untuk email yang tidak terdaftar di `ADMIN_EMAILS`/`STAFF_EMAILS` |

**Arsitektur teknis penting:**
- React di-load lewat CDN (unpkg), JSX ditranspile langsung di browser pakai **Babel Standalone** (bukan `htm` tagged-template — sempat dicoba tapi kurang reliable di lingkungan Apps Script)
- Semua field tanggal & jam (TanggalMulai, TanggalAkhir, Deadline, JamMasuk, JamKeluar, CreatedAt, UpdatedAt) **wajib dikonversi ke string** sebelum dikirim ke browser (lihat bagian Troubleshooting di bawah untuk alasannya)
- Tidak ada `<form>` tag sama sekali (pakai `onClick`/`onInput`/`onChange`) — menghindari bug submit event di sandbox Apps Script
- Error Boundary React terpasang — kalau ada error render, muncul kotak pesan error yang jelas, bukan halaman blank

---

## 3. Cara Setup dari Nol

1. Buka **Google Sheets baru** (spreadsheet khusus Database Staff)
2. **Extensions > Apps Script**
3. Hapus isi `Code.gs` default → paste isi `Code.gs` dari sini
4. Buat 4 file HTML baru (ikon `+` di Apps Script editor), nama harus **persis**:
   - `Index`
   - `Stylesheet`
   - `JavaScript`
   - `AccessDenied`
5. Paste isi masing-masing file
6. Di `Code.gs`, sesuaikan `ADMIN_EMAILS` dan `STAFF_EMAILS` (lihat bagian 4)
7. **Deploy > New deployment**:
   - Type: **Web app**
   - Execute as: **User accessing the web app**
   - Who has access: **Anyone with Google account**
8. Buka link web app-nya — sheet `Staff`, `Workload`, `Attendance` otomatis dibuat dengan header saat pertama kali diakses

## Cara Update Kode Setelah Setup Awal

**PENTING** — ini penyebab paling umum kalau perubahan "tidak muncul":
1. Edit file di Apps Script editor, Simpan (Ctrl+S)
2. **Deploy > Manage deployments > klik ikon pensil (Edit) > Version: New version > Deploy**
3. Baru buka lagi link web app-nya

Edit kode saja **tidak otomatis** memperbarui link yang sudah di-deploy.

---

## 4. Mengelola Akses (Admin vs Staff)

Di `Code.gs`, paling atas:

```javascript
const ADMIN_EMAILS = [
  'loehendra@gmail.com', // Owner
  'loevie02@gmail.com',  // Vita
  'obeecreatives@gmail.com', // Perusahaan
  'obeetools@gmail.com', // Developer - default standar semua tools
];

const STAFF_EMAILS = [
  // 'bimo@gmail.com', 'sasha@gmail.com', dst — tinggal uncomment/tambah
];
```

- **Admin**: akses penuh, termasuk lihat & edit NIK/No KK
- **Staff**: view-only, NIK/No KK otomatis disembunyikan (dari server, aman walau di-inspect browser), tidak ada tombol Tambah/Edit/Hapus/Nonaktifkan
- Satu email cukup di salah satu list saja
- Setelah edit list ini → **wajib Deploy versi baru** (lihat bagian 3)
- **Catatan (v10)**: sistem ini masih pakai hardcode `ADMIN_EMAILS`/`STAFF_EMAILS` (bukan sheet "Kelola Akses" seperti tools lain) — migrasi ke Kelola Akses direncanakan menyusul terpisah, belum dikerjakan

---

## 5. Panduan Protect Sheet (Kalau Mau Menerapkan)

Kalau suatu saat mau memproteksi sheet dari edit langsung di Google Sheets (bukan lewat web app), penting diketahui: **Protect Sheet hanya membatasi EDIT, bukan membaca** — jadi web app tetap bisa "memuat data" seperti biasa apapun kondisinya. Yang bisa terganggu adalah operasi **simpan/edit/hapus** dari web app, karena deployment kita pakai **"Execute as: User accessing the web app"** — tiap request tulis ke sheet memakai identitas Google akun orang yang sedang pakai web app saat itu, bukan identitas developer.

### Siapa Butuh Akses Edit di Sheet Mana

| Sheet | Yang Perlu Jadi "Editor" | Alasan |
|---|---|---|
| **Staff** | `ADMIN_EMAILS` saja | Hanya Admin yang boleh Tambah/Edit/Nonaktifkan staff |
| **Workload** | `ADMIN_EMAILS` **+ `STAFF_EMAILS`** | Staff juga perlu menggeser status Kanban — kalau Staff tidak diberi akses edit di sheet ini, geser status akan **gagal tersimpan** |
| **Attendance** | `ADMIN_EMAILS` **+ akun yang setup trigger otomatis** | Hanya Admin yang edit manual, TAPI absensi otomatis (trigger harian) berjalan atas nama akun yang menjalankan "Setup Trigger Absensi Otomatis" — akun itu wajib tetap punya akses edit |
| **Payroll** | `ADMIN_EMAILS` saja | Hanya Admin yang bikin/edit payroll |

### Langkah Pasang Protect Sheet (Ulangi per Sheet)

1. Buka spreadsheet Database Staff
2. Klik kanan tab sheet (misal "Staff") → **Protect sheet**
3. Isi deskripsi (misal "Hanya Admin Database Staff")
4. Klik **Set permissions**
5. Pilih **"Only you"** dulu (default), lalu klik **"+ Add editors"**
6. Masukkan semua email sesuai tabel di atas untuk sheet tersebut
7. Klik **Done**
8. Ulangi untuk sheet Workload, Attendance, Payroll (dengan editor yang sesuai per sheet)

**Jangan protect** sheet apapun yang belum dipakai/kosong.

### Checklist Testing Setelah Pasang Proteksi

- [ ] Login ke web app pakai akun **Admin** → coba Tambah Staff, Edit Payroll, dll → harus tetap berhasil
- [ ] Kalau `STAFF_EMAILS` sudah diisi, login pakai salah satu akun **Staff** → coba geser status Workload → harus tetap berhasil
- [ ] Coba buka sheet mentahnya langsung (bukan lewat web app) pakai akun yang TIDAK ada di daftar editor → coba edit sel manual → harus muncul peringatan "read-only" dari Google Sheets
- [ ] Tunggu 1 hari kerja, cek apakah absensi otomatis (trigger) tetap ter-generate seperti biasa

### Penting Diingat Kalau Ada Perubahan

- Setiap kali menambah email baru ke `ADMIN_EMAILS`/`STAFF_EMAILS` di `Code.gs`, **jangan lupa juga tambahkan sebagai editor** di Protect Sheet masing-masing sheet yang relevan — dua tempat ini **tidak otomatis sinkron**, harus diupdate manual di keduanya
- Kalau bikin sheet baru lagi di masa depan (fitur baru), ulangi langkah yang sama
- Kalau mau proteksi lebih ketat lagi (misal Admin sekalipun tidak boleh sentuh sheet mentah sama sekali), itu perlu ganti mode eksekusi ke "Execute as: Me" — tapi konsekuensinya sistem deteksi role Admin/Staff yang sekarang (berbasis identitas per-user) akan rusak dan perlu didesain ulang. Diskusikan dulu sebelum mengubah ini.

## 6. Troubleshooting — Masalah yang Pernah Ditemukan & Solusinya

Dicatat di sini supaya kalau muncul lagi (atau saat develop v4), tidak perlu debug dari nol.

### "Blank putih total saat klik tombol tertentu"
**Penyebab:** pendekatan awal pakai library `htm` (tagged template) untuk render React tanpa build step. Ternyata kurang reliable di sandbox Apps Script.
**Solusi:** diganti total ke **JSX + Babel Standalone** (`@babel/standalone` dari CDN, script type `text/babel`). Sudah diverifikasi lewat automated render test sebelum deploy.

### "Server mengembalikan data kosong" / macet di "Memuat data..."
**Penyebab:** Google Sheets **otomatis mengonversi teks tanggal/jam** (misal `"2026-01-15"` atau `"09:00"`) jadi objek Date/Time asli saat disimpan ke sel. Kalau field bertipe Date ini dikirim mentah-mentah lewat `google.script.run` ke browser, seluruh respons bisa gagal terkirim (jadi `null` di sisi client) meski di Executions log Apps Script terlihat "Selesai" (sukses).
**Solusi:** semua field tanggal (`TanggalMulai`, `TanggalAkhir`, `Deadline`, `CreatedAt`, `UpdatedAt`) dan field jam (`JamMasuk`, `JamKeluar`) **dikonversi jadi string** (`dateToSafeString_()` / `timeToSafeString_()`) di server sebelum dikirim ke client. **Kalau nanti menambah field tanggal/jam baru di versi berikutnya (v4 Payroll, dst), field itu WAJIB dikonversi ke string juga dengan cara yang sama** — ini pola yang harus selalu diikuti.

### Perubahan kode tidak muncul di web app
**Penyebab:** edit script di Apps Script editor tidak otomatis memperbarui deployment yang sudah publish.
**Solusi:** selalu **Deploy > Manage deployments > Edit > New version > Deploy** setiap kali update kode.

### Cara debug kalau macet lagi di masa depan
1. Apps Script editor → ikon jam ⏱️ **Executions** → klik eksekusi `getInitData` paling atas → cek status (Selesai/Gagal) dan pesan error kalau ada
2. `getInitData()` sudah dibungkus try-catch + `Logger.log()` — detail log bisa dilihat di panel eksekusi yang sama
3. Browser DevTools (F12) → tab **Console** → cari pesan error berwarna merah

---

## 7. Standar Perhitungan Payroll

**Rumus saat ini (v8 — berlaku sejak update terbaru, menggantikan rumus proporsional v4):**
- Standar hari kerja per bulan: **20 hari**
- **Gaji Pokok** & **Tunj. Jabatan**: masing-masing adalah nilai bulanan **PENUH/maksimal** (contoh: Gaji Pokok Rp 800.000 tetap Rp 800.000 meski staff hadir >20 hari dalam periode itu — TIDAK bisa lebih dari nilai bulanan).
- **Dipotong per hari** untuk setiap hari **Izin** atau **Alpha** yang tercatat di Attendance dalam periode payroll: `potongan/hari = nilai bulanan ÷ 20`. Contoh: Gaji Pokok Rp 800.000 → potongan Rp 40.000/hari Izin atau Alpha.
- **Sakit & Cuti TIDAK memotong gaji** (dianggap izin yang tetap dibayar penuh).
- Hasil akhir dijamin tidak negatif (kalau hari tidak masuk sangat banyak, minimal Rp 0, bukan minus).
- Field **Hari Hadir** tetap ditampilkan (informasi jumlah hari status "Hadir" tercatat), terpisah dari **Hari Izin/Alpha** yang jadi dasar potongan.
- Komponen tambahan (Approval Tasks, Freelancer Fee, Saham, dll): tiap komponen punya Label + Rate (Rp) + Jumlah/Qty, subtotal = Rate × Qty — **input manual**
- Lembur Kerja: nominal, **input manual**
- Potongan (BPJS Ketenagakerjaan, BPJS Kesehatan, Premi, Pajak PPh 21, Angsuran Pinjaman): semua **input manual**
- **Periode payroll bersifat custom** (rentang tanggal bebas, bukan bulanan tetap)
- Rumus akhir: **Gaji Yang Dibayarkan = Total Gaji Kotor − Total Potongan**

**Riwayat perubahan rumus:**
- v4 (awal): Gaji Pokok/Tunj. Jabatan dihitung proporsional dari hari Hadir — `(nilai bulanan ÷ 20) × hari Hadir`. Kalau hadir >20 hari, nilai bisa MELEBIHI gaji bulanan (dianggap kurang sesuai kebutuhan nyata).
- **v8 (saat ini)**: diubah jadi nilai bulanan penuh dikurangi potongan per hari Izin/Alpha, sesuai kebutuhan nyata obeeTOOLS — gaji tidak pernah melebihi nilai bulanan yang ditetapkan.

---

## 8. Checklist Testing Lengkap (v1+v2+v3, semua sudah PASS)

**v1 — Staff**
- [x] Tambah/Edit/Nonaktifkan/Aktifkan staff
- [x] Durasi Kontrak berubah merah kalau ≤ 7 hari lagi
- [x] NIK/No KK tersembunyi untuk role Staff
- [x] Email tidak terdaftar → halaman Akses Ditolak

**v2 — Workload**
- [x] Tambah/Edit/Hapus task, geser Status via Kanban
- [x] Filter per Divisi

**v3 — Attendance**
- [x] Tambah/Edit/Hapus absensi, field Jam Masuk/Keluar muncul kalau status Hadir
- [x] Kartu rekap & filter Staff/Bulan akurat

**v4 — Payroll**
- [x] Preview Hari Hadir, Gaji Pokok, Tunj. Jabatan otomatis sesuai data Attendance
- [x] Komponen Tambahan (Label/Rate/Qty) ikut terhitung ke Total Gaji Kotor
- [x] Lembur & Potongan terhitung dengan benar
- [x] Simpan payroll baru, angka konsisten dengan preview
- [x] Tandai Lunas / Batalkan Lunas
- [x] Edit & Hapus payroll
- [x] Role Staff hanya bisa lihat, tanpa tombol aksi

**Catatan implementasi v4:** field tanggal (`PeriodeAwal`, `PeriodeAkhir`, `TanggalBayar`) dikonversi ke string via `dateToSafeString_()` mengikuti pola v1-v3. Sempat ada bug Komponen Tambahan tidak ikut terhitung ke Total Gaji Kotor — sudah diperbaiki dengan menambahkan `normalizeKomponenTambahan_()` (fallback parsing lebih defensif) dan `Logger.log()` diagnostik di `buildPayrollTotals_()` untuk memudahkan debug kalau muncul lagi.

**v4.1 — Export Slip Gaji PDF**
- [x] Export PDF berhasil, file terdownload otomatis
- [x] Isi PDF sesuai (Nama, Periode, Rincian Gaji + Komponen Tambahan, Potongan, Gaji Dibayarkan, Status)
- [x] Bisa diakses Admin maupun Staff
- [x] Nama file sesuai format `Slip_Gaji_[Nama]_[Periode].pdf`

**v5 — Dashboard**
- [x] Tab Dashboard tampil sebagai tab pertama & default
- [x] Kartu ringkasan, chart, dan tabel per divisi menampilkan data yang benar

**v5.1 — Notifikasi WhatsApp**
- [x] Tandai Lunas → tab WhatsApp otomatis terbuka dengan nomor & pesan sudah terisi
- [x] Nomor telepon terkonversi ke format internasional dengan benar

**v6 — Reminder Kontrak & Export Payroll Massal**
- [x] Kartu peringatan kontrak muncul di Dashboard sesuai kondisi (≤7 hari)
- [x] Tombol "Kirim WA" berfungsi, hanya tampil untuk Admin
- [x] Export Semua (ZIP) berhasil, isi PDF di dalamnya benar per staff

**v7 — Bantuan/Help**
- [x] Tombol Bantuan berfungsi, modal terbuka dengan 8 tab navigasi
- [x] Semua section (termasuk Ketentuan Grade) tampil dengan benar
- [x] Bisa diakses Admin maupun Staff

**v8 — Rumus Gaji Baru (belum ditest, checklist berikut untuk dijalankan)**
- [ ] Staff yang hadir >20 hari dalam satu periode → Gaji Pokok & Tunj. Jabatan tetap sebesar nilai bulanan (tidak lebih)
- [ ] Staff dengan 1 hari Izin → Gaji Pokok berkurang tepat (nilai bulanan ÷ 20)
- [ ] Staff dengan 1 hari Alpha → potongan sama seperti Izin
- [ ] Staff dengan Sakit/Cuti → TIDAK ada potongan gaji untuk hari itu
- [ ] Preview di form Payroll menampilkan "Hari Izin/Alpha" sesuai data Attendance
- [ ] Tabel Payroll & PDF slip gaji menampilkan kolom/baris "Hari Izin/Alpha" dengan benar
- [ ] Payroll yang SUDAH ADA sebelumnya (dibuat dengan rumus lama) — cek apakah perlu di-Edit ulang supaya rumus baru diterapkan (rumus baru hanya berlaku untuk payroll yang dibuat/diedit setelah update ini)

**v9 — Absensi Otomatis (belum ditest, checklist berikut untuk dijalankan)**
- [ ] Jalankan menu "Database Staff → ⏰ Setup Trigger Absensi Otomatis" dari Google Sheets, pastikan muncul konfirmasi berhasil
- [ ] Klik tombol "⚡ Generate Absensi Hari Ini" di tab Attendance → cek jumlah "created"/"skipped" sesuai jumlah staff aktif
- [ ] Kalau hari ini kebetulan Jumat/Minggu, tombol Generate harus memberi tahu "bukan hari kerja" tanpa membuat data
- [ ] Cek data yang ter-generate: Status "Hadir", Jam Masuk 09:00, Jam Keluar 17:00, Catatan "Otomatis - hari kerja terjadwal"
- [ ] Klik Generate 2x di hari yang sama → staff yang sudah ada datanya harus ter-skip (tidak dobel)
- [ ] Edit salah satu data yang auto-generated, ubah Status jadi Izin/Sakit/Cuti → cek perubahan tersimpan dengan benar
- [ ] Tunggu 1 hari kerja setelah setup trigger, cek apakah absensi ter-generate otomatis tanpa perlu buka aplikasi sama sekali (test paling penting untuk fitur ini)

**v10 — Standar Konvensi + Switch App (belum ditest, checklist berikut untuk dijalankan)**
- [ ] Ikon "?" di topbar berubah jadi bulat putih (bukan tombol teks lagi), tetap sejajar dengan badge role & Switch App
- [ ] Klik ikon "?" tetap membuka modal Bantuan seperti biasa, dan menampilkan "Versi: v10" di bagian bawah
- [ ] Login pakai email `obeetools@gmail.com` → harus langsung dapat akses Admin
- [ ] Klik "🔀 Switch App" → semua tools di daftar (CRM, Laporan Keuangan, Equipment Hub, Document Hub, Database Surat) bisa diklik dan berpindah dengan benar di tab yang sama

**v11 — Integrasi Fee Project Control (sudah dipakai tim, checklist berikut untuk verifikasi ulang kalau perlu)**
- [ ] Klik "⟳ Tarik Fee dari Project Control" di form Payroll (Staff & Periode sudah diisi) → muncul baris Komponen Tambahan bertanda "· Project Control", read-only
- [ ] Konten yang fee-nya sudah pernah ditarik ke payroll lain TIDAK muncul lagi di tarikan berikutnya (anti dobel-hitung)
- [ ] Edit payroll yang sudah ada, klik tarik lagi → baris Project Control lama yang sudah dipakai TETAP ada, tidak hilang
- [ ] Edit payroll (ubah Lembur/Potongan saja, TANPA ganti Staff/Periode) → cek GajiPokokAmount/TunjJabatanAmount TIDAK berubah walau data gaji staff di sheet Staff sudah beda (fitur locking)
- [ ] Ganti Staff atau Periode saat Edit payroll → GajiPokokAmount/TunjJabatanAmount dihitung ulang dari data terkini (locking tidak berlaku di kasus ini)
- [ ] Cek isi Bantuan bagian Payroll sudah menyebut fitur Tarik Fee & rumus yang benar

**Catatan implementasi v5:** murni fitur frontend, tidak ada perubahan di Code.gs (semua dihitung dari data getInitData yang sudah ada).

**Perbaikan tambahan setelah v5:** lebar kolom di template PDF Slip Gaji (`buildPayslipHtml_` di Code.gs) sempat menyebabkan teks di kolom kanan (Periode, Status Kerja, dll) wrap ke beberapa baris karena pakai lebar pixel tetap (130px/330px). Sudah diperbaiki dengan `table-layout:fixed` + lebar persentase (14%/36%) supaya proporsional terhadap lebar halaman PDF dan lebih tahan terhadap perubahan konten di masa depan.

**Bug fix — Komponen Tambahan hilang saat Edit Payroll:** ditemukan bug di `updatePayroll()` — field `KomponenTambahan` (array) bukan bagian dari `PAYROLL_COLUMNS` (yang tersimpan cuma versi JSON-nya), sehingga proses penggabungan data (`merged`) tidak pernah menyalin array baru dari form; akibatnya kalau Edit payroll untuk menambah komponen baru, yang tersimpan tetap daftar komponen LAMA dari sheet. Sudah diperbaiki: `merged.KomponenTambahan` sekarang selalu di-set eksplisit dari `data.KomponenTambahan` (array baru dari form), dengan fallback ke JSON lama hanya kalau client benar-benar tidak mengirim field itu.

---

## 9. Roadmap Selanjutnya

Seluruh siklus utama (Staff → Workload → Attendance → Payroll), Export Slip Gaji PDF, Dashboard, Notifikasi WhatsApp, Reminder Kontrak, Export Payroll Massal, dan Bantuan/Help sudah selesai dibangun, ditest, dan di-lock. Project ini menjadi baseline produksi resmi Database Staff obeecreatives.

Quick wins yang masih tersedia kalau suatu saat dibutuhkan:
- **Search & filter lebih lengkap** di tab Attendance/Workload (multi-status, rentang tanggal custom)
- **Riwayat perubahan (audit log)** — catat siapa mengubah apa dan kapan

Ide pengembangan menengah/besar lainnya (approval workflow, upload dokumen, portal self-service staff, integrasi dengan Paket Lengkap) tetap tersedia sebagai opsi kalau kebutuhan agency berkembang.
