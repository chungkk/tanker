import { searchStations } from '@/lib/services/tankerkoenig';
import { buildStationList } from '@/lib/services/compare';
import { handler, ok, parseCoord, parseRadius } from '@/lib/http';

/**
 * GET /api/stations/search
 * Tìm trạm xăng theo tọa độ + so sánh giá rẻ/đắt trong khu vực
 * Query: lat, lng, rad (km, mặc định 5, max 25)
 */
export const GET = handler(async (request) => {
  const { searchParams } = new URL(request.url);
  const lat = parseCoord(searchParams.get('lat'), 'lat', -90, 90);
  const lng = parseCoord(searchParams.get('lng'), 'lng', -180, 180);
  const rad = parseRadius(searchParams.get('rad'));

  const data = await searchStations(lat, lng, rad);
  return ok(buildStationList(data.stations || []));
});
