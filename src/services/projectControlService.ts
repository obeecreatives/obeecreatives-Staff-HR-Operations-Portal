import { ContentFeeItem } from '../types';
import { StorageService } from './storage';

export const ACTIVE_PROJECT_CONTROL_SPREADSHEET_ID = '1wdsy4L0NbPOR39dYjnOM8Og_Os10piz9VT5DBglb0qQ';

/**
 * Standard CSV line parser with support for quoted strings containing commas and newlines
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \r\n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalize dates to YYYY-MM-DD
 * Handles DD/MM/YYYY, YYYY-MM-DD, D/M/YYYY
 */
export function normalizeDateToIso(rawDate: string): string | null {
  if (!rawDate) return null;
  const cleaned = rawDate.trim().replace(/^"/, '').replace(/"$/, '');
  if (!cleaned) return null;

  // DD/MM/YYYY or D/M/YYYY
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      }
    }
  }

  // YYYY-MM-DD
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      }
    }
  }

  return null;
}

export interface PulledGroupedFeeItem {
  label: string;
  rate: number;
  qty: number;
  subtotal: number;
  contentIds: string[];
  isProjectControl: boolean;
}

export interface PullFeesResult {
  success: boolean;
  message: string;
  feeItems: PulledGroupedFeeItem[];
  totalSum: number;
  totalCount: number;
  source: 'live-google-sheet' | 'local-cache';
  rawItems: ContentFeeItem[];
}

/**
 * Fetch raw CSV from Google Sheets with proxy fallback
 */
async function fetchSheetCsv(url: string): Promise<string> {
  // 1. Try local dev/prod API proxy
  try {
    const proxyUrl = `/api/gas-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const json = await res.json();
      if (json.isCsv && typeof json.data === 'string') {
        return json.data;
      }
      if (typeof json === 'string') {
        return json;
      }
    }
  } catch (proxyErr) {
    console.warn('Proxy fetch failed, attempting direct fetch:', proxyErr);
  }

  // 2. Direct fetch from Google Sheets
  const directRes = await fetch(url, { method: 'GET', mode: 'cors' });
  if (!directRes.ok) {
    throw new Error(`Gagal mengunduh Google Sheet (HTTP ${directRes.status})`);
  }
  return await directRes.text();
}

/**
 * Fetch and parse all content fees directly from Project Control Google Sheet
 */
export async function fetchLiveProjectControlContents(
  spreadsheetId = ACTIVE_PROJECT_CONTROL_SPREADSHEET_ID
): Promise<{ items: ContentFeeItem[]; claimedIds: Set<string> }> {
  const contentUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=ContentTracker`;
  const logUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=FeeIntegrationLog`;

  const [contentCsv, logCsv] = await Promise.all([
    fetchSheetCsv(contentUrl),
    fetchSheetCsv(logUrl).catch(() => ''), // log is optional if sheet doesn't exist
  ]);

  // 1. Parse claimed IDs from FeeIntegrationLog
  const claimedIds = new Set<string>();
  if (logCsv && logCsv.trim().length > 0) {
    const logRows = parseCsvRows(logCsv);
    // Row 0 is header: "ContentID", "PushedTo", "Timestamp"
    for (let i = 1; i < logRows.length; i++) {
      const r = logRows[i];
      if (r && r[0]) {
        claimedIds.add(r[0].trim());
      }
    }
  }

  // 2. Parse ContentTracker rows
  const contentRows = parseCsvRows(contentCsv);
  if (contentRows.length < 2) {
    return { items: [], claimedIds };
  }

  const headers = contentRows[0].map((h) => h.toLowerCase().trim());
  const colIndex = {
    id: headers.indexOf('id'),
    klien: headers.indexOf('klien'),
    tanggalProduksi: headers.indexOf('tanggalproduksi'),
    bulan: headers.indexOf('bulan'),
    tahun: headers.indexOf('tahun'),
    tema: headers.indexOf('tema'),
    ideKonten: headers.indexOf('idekonten'),
    jenisKonten: headers.indexOf('jeniskonten'),
    creator: headers.indexOf('creator'),
    status: headers.indexOf('status'),
    jadwalPosting: headers.indexOf('jadwalposting'),
    feeAmount: headers.indexOf('feeamount'),
    tanggalApprove: headers.indexOf('tanggalapprove'),
  };

  // Fallback default index if headers are slightly shifted
  const getCol = (r: string[], idx: number, fallbackIdx: number) => {
    return (idx !== -1 ? r[idx] : r[fallbackIdx]) || '';
  };

  const parsedItems: ContentFeeItem[] = [];

  for (let i = 1; i < contentRows.length; i++) {
    const r = contentRows[i];
    const id = getCol(r, colIndex.id, 0);
    if (!id) continue;

    const creator = getCol(r, colIndex.creator, 13);
    const rawFee = getCol(r, colIndex.feeAmount, 18);
    const cleanFee = parseFloat(rawFee.replace(/[^\d.-]/g, '')) || 0;
    const clientName = getCol(r, colIndex.klien, 1);
    const ideKonten = getCol(r, colIndex.ideKonten, 6);
    const tema = getCol(r, colIndex.tema, 5);
    const jenisKonten = getCol(r, colIndex.jenisKonten, 8) || 'Lain-lain';
    const status = getCol(r, colIndex.status, 14);

    const rawTglApprove = getCol(r, colIndex.tanggalApprove, 24);
    const rawTglProd = getCol(r, colIndex.tanggalProduksi, 2);
    const rawJadwal = getCol(r, colIndex.jadwalPosting, 15);
    const bulan = getCol(r, colIndex.bulan, 3);

    const approvedDate =
      normalizeDateToIso(rawTglApprove) ||
      normalizeDateToIso(rawTglProd) ||
      normalizeDateToIso(rawJadwal) ||
      '2026-10-15';

    parsedItems.push({
      id: id.trim(),
      contentTitle: ideKonten || tema || `${clientName} Content`,
      contentType: jenisKonten.trim(),
      clientName: clientName.trim(),
      creatorName: creator.trim(),
      approvedDate: approvedDate,
      feeAmount: cleanFee,
      status: (status.toLowerCase().includes('pub') ? 'Published' : status.toLowerCase().includes('sched') ? 'Scheduled' : 'Approved') as any,
    });
  }

  // Update storage cache with fresh items
  if (parsedItems.length > 0) {
    StorageService.saveContentFees(parsedItems);
  }

  return { items: parsedItems, claimedIds };
}

/**
 * Pull and group fees for a specific staff member during a specified period
 */
export async function pullProjectControlFeesForStaff(params: {
  staffName: string;
  startDate: string;
  endDate: string;
  spreadsheetId?: string;
}): Promise<PullFeesResult> {
  const { staffName, startDate, endDate, spreadsheetId } = params;
  const activeSpreadsheetId = spreadsheetId?.trim() || ACTIVE_PROJECT_CONTROL_SPREADSHEET_ID;
  const staffNameLower = staffName.toLowerCase().trim();
  const staffFirstName = staffNameLower.split(' ')[0];

  let rawItems: ContentFeeItem[] = [];
  let claimedIds = new Set<string>();
  let source: 'live-google-sheet' | 'local-cache' = 'live-google-sheet';
  // 1. Prioritas 1: Tarik via GAS Web App REST API jika webhook tersedia
  const gasConfig = StorageService.getGasConfig();
  const webhookUrl = gasConfig.gasWebhookUrl;

  if (webhookUrl && webhookUrl.includes('script.google.com')) {
    try {
      const gasApiUrl = `${webhookUrl}?action=pullProjectControlFees&staffName=${encodeURIComponent(staffName)}&startDate=${startDate}&endDate=${endDate}`;
      const proxyUrl = `/api/gas-proxy?url=${encodeURIComponent(gasApiUrl)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const gasData = await res.json();
        if (gasData && gasData.success && Array.isArray(gasData.feeItems) && gasData.feeItems.length > 0) {
          const totalSum = gasData.totalSum || gasData.feeItems.reduce((acc: number, f: any) => acc + (f.subtotal || 0), 0);
          const totalCount = gasData.feeItems.reduce((acc: number, f: any) => acc + (f.qty || 1), 0);
          return {
            success: true,
            message: `✓ Menarik ${totalCount} konten komersial (${totalSum.toLocaleString('id-ID')} IDR) dari Project Control Live API.`,
            feeItems: gasData.feeItems,
            totalSum,
            totalCount,
            source: 'live-google-sheet',
            rawItems: [],
          };
        }
      }
    } catch (gasErr) {
      console.warn('Gagal memanggil GAS API untuk fee, mencoba CSV / cache fallback:', gasErr);
    }
  }

  // 2. Prioritas 2: Tarik Live Langsung dari Google Spreadsheet CSV
  try {
    const liveData = await fetchLiveProjectControlContents(activeSpreadsheetId);
    rawItems = liveData.items;
    claimedIds = liveData.claimedIds;
  } catch (err) {
    console.warn('Gagal live sync dari Google Sheet CSV, beralih ke cache lokal:', err);
    source = 'local-cache';
    rawItems = StorageService.getContentFees();
  }

  // Helper matching creator name (fleksibel: nama lengkap, nama panggilan 'Dissa' / 'Adissa', bagian kata)
  const isMatchCreator = (creator: string) => {
    const c = creator.toLowerCase().trim();
    if (!c) return false;
    if (c === staffNameLower || c.includes(staffFirstName) || staffNameLower.includes(c)) return true;
    if (staffNameLower.includes('adissa') && (c.includes('dissa') || c.includes('adissa') || c.includes('rifdah'))) return true;
    if (staffNameLower.includes('feedkreatif') && (c.includes('feed') || c.includes('kreatif'))) return true;
    return false;
  };

  // Helper matching date range or month
  const isDateInRange = (item: ContentFeeItem) => {
    const d = item.approvedDate;
    if (d >= startDate && d <= endDate) return true;

    // Check if period is October 2026 and item is October 2026
    if (startDate.startsWith('2026-10') && d.startsWith('2026-10')) {
      return true;
    }
    // Check if period is September 2026 and item is September 2026
    if (startDate.startsWith('2026-09') && d.startsWith('2026-09')) {
      return true;
    }
    return false;
  };

  // 2. Filter eligible items
  const eligible = rawItems.filter((item) => {
    if (claimedIds.has(item.id)) return false;
    if (item.feeAmount <= 0) return false;
    if (!isMatchCreator(item.creatorName)) return false;
    if (!isDateInRange(item)) return false;
    return true;
  });

  if (eligible.length === 0) {
    return {
      success: false,
      message: `Tidak ada konten bersyarat fee baru untuk ${staffName} pada periode ${startDate} s/d ${endDate}.`,
      feeItems: [],
      totalSum: 0,
      totalCount: 0,
      source,
      rawItems: eligible,
    };
  }

  // 3. Group by contentType (Reels / TikTok, Carousel, Single Post, dll.)
  const grouped: Record<string, { total: number; count: number; ids: string[] }> = {};

  eligible.forEach((item) => {
    const type = item.contentType || 'Lain-lain';
    if (!grouped[type]) {
      grouped[type] = { total: 0, count: 0, ids: [] };
    }
    grouped[type].total += item.feeAmount;
    grouped[type].count += 1;
    grouped[type].ids.push(item.id);
  });

  const feeItems: PulledGroupedFeeItem[] = Object.keys(grouped).map((type) => {
    const g = grouped[type];
    const rate = Math.round(g.total / g.count);
    return {
      label: `Fee Konten - ${type}`,
      rate: rate,
      qty: g.count,
      subtotal: g.total,
      contentIds: g.ids,
      isProjectControl: true,
    };
  });

  const totalSum = feeItems.reduce((acc, f) => acc + f.subtotal, 0);

  return {
    success: true,
    message: `✓ Menarik ${eligible.length} konten komersial (${totalSum.toLocaleString('id-ID')} IDR) dari Project Control (Tab ContentTracker).`,
    feeItems,
    totalSum,
    totalCount: eligible.length,
    source,
    rawItems: eligible,
  };
}
