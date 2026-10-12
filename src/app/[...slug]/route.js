import { ApiError, fail } from '@/lib/http';

/**
 * Mọi đường dẫn không tồn tại → 404 dạng JSON (thay vì trang HTML)
 */
export function GET(request) {
  const { pathname } = new URL(request.url);
  return fail(new ApiError(404, `Không tìm thấy ${pathname}.`));
}
