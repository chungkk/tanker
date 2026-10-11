/**
 * Helpers dùng chung cho các route handler:
 * response JSON + cache CDN, lỗi có status code, validate tham số
 */

// Lỗi trả về cho client với status code cụ thể
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Response thành công. `cache` = số giây CDN (Vercel) được giữ response.
 * stale-while-revalidate: hết hạn vẫn trả bản cũ ngay, cập nhật ngầm phía sau
 */
export function ok(data, cache = 300) {
  return Response.json(data, {
    headers: {
      'Cache-Control': `public, max-age=60, s-maxage=${cache}, stale-while-revalidate=${cache * 2}`,
    },
  });
}

// Response lỗi (không cache)
export function fail(err) {
  const status = err instanceof ApiError ? err.status : 500;
  if (status >= 500) console.error(err);
  return Response.json(
    { error: status === 500 ? 'Lỗi máy chủ.' : err.message },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

// Bọc handler: tự bắt lỗi → fail()
export function handler(fn) {
  return async (request, ctx) => {
    try {
      return await fn(request, ctx);
    } catch (err) {
      return fail(err);
    }
  };
}

// =============================================
// Validate tham số
// =============================================

export function parseCoord(value, name, min, max) {
  const n = Number(value);
  if (value == null || value === '' || !Number.isFinite(n) || n < min || n > max) {
    throw new ApiError(400, `Tham số ${name} không hợp lệ (cần số từ ${min} đến ${max}).`);
  }
  return n;
}

export function parseRadius(value) {
  if (value == null || value === '') return 5;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 25) {
    throw new ApiError(400, 'Tham số rad không hợp lệ (cần số > 0 và ≤ 25 km).');
  }
  return n;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseStationId(id) {
  if (!UUID_RE.test(id)) {
    throw new ApiError(400, 'ID trạm không hợp lệ (cần dạng UUID).');
  }
  return id.toLowerCase();
}
