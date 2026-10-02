// Koordinat Resmi Studio obeecreatives (Kota Batu, Jawa Timur)
export const STUDIO_COORDINATES = {
  latitude: -7.8712,
  longitude: 112.5271,
  name: 'Studio obeecreatives Kota Batu',
  address: 'Jl. Batok No. 8, Kelurahan Sisir, Kota Batu, Jawa Timur',
  validRadiusMeters: 200, // Radius toleransi check-in WFO studio (200m)
};

/**
 * Menghitung jarak garis lurus menggunakan formula Haversine dalam satuan meter
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Format jarak ke teks terbaca
 */
export function formatDistance(meters?: number): string {
  if (meters === undefined || isNaN(meters)) return '-';
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format nilai mata uang Rupiah
 */
export function formatRupiah(value: number | undefined | null): string {
  const n = Math.round(Number(value) || 0);
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format nomor WhatsApp ke format internasional 62
 */
export function formatPhoneForWhatsApp(phone?: string): string {
  if (!phone) return '';
  let p = phone.replace(/[^0-9]/g, '');
  if (p.startsWith('0')) {
    p = '62' + p.slice(1);
  } else if (!p.startsWith('62')) {
    p = '62' + p;
  }
  return p;
}
