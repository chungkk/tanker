import { ApiError } from '../http.js';

/**
 * Đổi mã bưu điện Đức → tọa độ (OpenStreetMap Nominatim)
 * Policy của Nominatim: cần User-Agent, tối đa 1 request/giây → cache 1 ngày
 */
export async function geocodePostalCode(code) {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(code)}&country=de&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'fuel-price-api (https://github.com/chungkk/tanker)' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new ApiError(502, `Nominatim HTTP ${res.status}`);

  const [place] = await res.json();
  if (!place) return null;

  return {
    lat: parseFloat(place.lat),
    lng: parseFloat(place.lon),
    name: place.display_name,
  };
}
