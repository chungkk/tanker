import { getByIds } from '@/lib/services/tankerkoenig';
import { ApiError, handler, ok, parseStationId } from '@/lib/http';

const MAX_IDS = 10; // giới hạn của Tankerkönig prices.php

/**
 * GET /api/prices?ids=id1,id2,...
 * Giá hiện tại của nhiều trạm trong 1 request (tối đa 10) — dùng cho danh sách trạm yêu thích
 */
export const GET = handler(async (request) => {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get('ids') || '').split(',').filter(Boolean);

  if (!raw.length) throw new ApiError(400, 'Thiếu tham số ids.');
  if (raw.length > MAX_IDS) throw new ApiError(400, `Tối đa ${MAX_IDS} trạm mỗi lần.`);

  const ids = [...new Set(raw.map(parseStationId))];
  const { stations } = await getByIds(ids);

  const prices = {};
  for (const s of stations) {
    prices[s.id] = { isOpen: s.isOpen, fuels: s.fuels };
  }
  return ok({ prices });
});
