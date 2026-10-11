import { TANKERKOENIG_BASE_URL, TANKERKOENIG_API_KEY } from '../config.js';
import { ApiError } from '../http.js';

const BASE_URL = TANKERKOENIG_BASE_URL;
const API_KEY = TANKERKOENIG_API_KEY;
const CACHE_SECONDS = 300;

/**
 * Tìm trạm xăng theo tọa độ + bán kính
 * GET /json/list.php?lat=&lng=&rad=&sort=&type=&apikey=
 */
export async function searchStations(lat, lng, rad = 5, sort = 'dist', type = 'all') {
  const url = `${BASE_URL}/json/list.php?apikey=${API_KEY}&lat=${lat}&lng=${lng}&rad=${Math.min(rad, 25)}&sort=${sort}&type=${type}`;
  const data = await fetchJson(url);
  
  // Normalize response format cho nhất quán
  return {
    stations: (data.stations || []).map(normalizeStation),
  };
}

/**
 * Lấy giá hiện tại theo danh sách station IDs (max 10)
 * GET /json/prices.php?ids=&apikey=
 */
export async function getByIds(ids) {
  const url = `${BASE_URL}/json/prices.php?apikey=${API_KEY}&ids=${ids.join(',')}`;
  const data = await fetchJson(url);

  // prices.php trả về format khác: { prices: { "uuid": { status, e5, e10, diesel } } }
  // Cần convert sang format chuẩn với fuels array
  if (!data.prices) return { stations: [] };

  const stations = [];
  for (const [id, priceData] of Object.entries(data.prices)) {
    const fuels = [];
    if (priceData.e5 && priceData.e5 !== false) {
      fuels.push({ name: 'Super E5', category: 'gasoline', price: priceData.e5 });
    }
    if (priceData.e10 && priceData.e10 !== false) {
      fuels.push({ name: 'Super E10', category: 'gasoline', price: priceData.e10 });
    }
    if (priceData.diesel && priceData.diesel !== false) {
      fuels.push({ name: 'Diesel', category: 'diesel', price: priceData.diesel });
    }
    stations.push({
      id,
      isOpen: priceData.status === 'open',
      fuels,
    });
  }

  return { stations };
}

/**
 * Lấy chi tiết 1 trạm xăng
 * GET /json/detail.php?id=&apikey=
 */
export async function getStationDetail(id) {
  const url = `${BASE_URL}/json/detail.php?apikey=${API_KEY}&id=${id}`;
  let data;
  try {
    data = await fetchJson(url);
  } catch (err) {
    // Tankerkönig báo "Station nicht vorhanden" (ok: false) khi ID không tồn tại → 404
    if (/nicht vorhanden/i.test(err.message)) return null;
    throw err;
  }

  if (!data.station) return null;
  return normalizeStation(data.station);
}

/**
 * Normalize station object từ Tankerkönig response
 * (list.php và detail.php trả format hơi khác nhau)
 */
function normalizeStation(s) {
  const fuels = [];
  if (s.e5 != null && s.e5 !== false) {
    fuels.push({ name: 'Super E5', category: 'gasoline', price: s.e5 });
  }
  if (s.e10 != null && s.e10 !== false) {
    fuels.push({ name: 'Super E10', category: 'gasoline', price: s.e10 });
  }
  if (s.diesel != null && s.diesel !== false) {
    fuels.push({ name: 'Diesel', category: 'diesel', price: s.diesel });
  }

  return {
    id: s.id,
    name: s.name || '',
    brand: s.brand || '',
    street: (s.street || '').trim(),
    houseNumber: s.houseNumber || '',
    // Tankerkönig trả postCode dạng số → mất số 0 đầu (06118 → 6118)
    postalCode: s.postCode || s.postalCode ? String(s.postCode || s.postalCode).padStart(5, '0') : '',
    place: s.place || '',
    coords: { lat: s.lat, lng: s.lng },
    isOpen: s.isOpen === true,
    dist: s.dist || null,
    fuels,
    openingTimes: s.openingTimes || [],
    wholeDay: s.wholeDay || false,
  };
}

/**
 * Fetch + parse JSON + error handling
 * Cache 5 phút (Tankerkönig chỉ cập nhật giá vài phút/lần) để tiết kiệm quota
 */
async function fetchJson(url) {
  if (!API_KEY) throw new Error('Chưa cấu hình TANKERKOENIG_API_KEY');

  const res = await fetch(url, { next: { revalidate: CACHE_SECONDS } });
  if (!res.ok) {
    throw new ApiError(502, `Tankerkönig HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.ok === false) {
    throw new ApiError(502, `Tankerkönig: ${data.message || 'Unknown error'}`);
  }

  return data;
}
