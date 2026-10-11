import { searchStations } from '@/lib/services/tankerkoenig';
import { geocodePostalCode } from '@/lib/services/geocode';
import { buildStationList } from '@/lib/services/compare';
import { ApiError, handler, ok, parseRadius } from '@/lib/http';

/**
 * GET /api/stations/postalcode/:code
 * Tìm trạm theo mã bưu điện (đổi sang tọa độ rồi tìm như /search)
 * Query: rad (km, mặc định 5, max 25)
 */
export const GET = handler(async (request, { params }) => {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const rad = parseRadius(searchParams.get('rad'));

  if (!/^\d{5}$/.test(code)) {
    throw new ApiError(400, 'Mã bưu điện Đức phải có 5 chữ số (ví dụ: 06118).');
  }

  const location = await geocodePostalCode(code);
  if (!location) {
    throw new ApiError(404, `Không tìm thấy mã bưu điện ${code}.`);
  }

  const data = await searchStations(location.lat, location.lng, rad);
  return ok({ location, ...buildStationList(data.stations || []) });
});
