import { getStationDetail } from '@/lib/services/tankerkoenig';
import { ApiError, handler, ok, parseStationId } from '@/lib/http';

/**
 * GET /api/stations/:id
 * Thông tin chi tiết 1 trạm + giá hiện tại + giờ mở cửa
 */
export const GET = handler(async (request, { params }) => {
  const id = parseStationId((await params).id);
  const station = await getStationDetail(id);

  if (!station) throw new ApiError(404, 'Không tìm thấy trạm.');
  return ok(station);
});
