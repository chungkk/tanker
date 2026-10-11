import { getByIds } from '@/lib/services/tankerkoenig';
import { ApiError, handler, ok, parseStationId } from '@/lib/http';

/**
 * GET /api/prices/:stationId/current
 * Lấy giá hiện tại của trạm
 */
export const GET = handler(async (request, { params }) => {
  const stationId = parseStationId((await params).stationId);
  const { stations } = await getByIds([stationId]);
  const station = stations[0];

  if (!station || !station.fuels.length) {
    throw new ApiError(404, 'Không có dữ liệu giá cho trạm này.');
  }

  return ok({
    station_id: stationId,
    isOpen: station.isOpen,
    prices: station.fuels.map((f) => ({
      fuel: f.name,
      category: f.category,
      price: f.price,
    })),
  });
});
