import { NextResponse } from 'next/server';
import { getStmts } from '@/lib/database';

/**
 * GET /api/stations/postalcode/:code
 * Tìm trạm theo mã bưu điện
 */
export async function GET(request, { params }) {
  try {
    const { code } = await params;

    // Tìm trong DB local theo postal_code
    const stmts = getStmts();
    const stations = stmts.searchStations
      ? []
      : [];

    // Gọi Tankerkönig API để tìm trạm
    const { searchStations } = await import('@/lib/services/tankerkoenig');

    // Dùng geocoding đơn giản cho postal code Đức (approximate center)
    // Tankerkönig không có endpoint tìm theo postal code trực tiếp
    // Nên ta tìm trong DB local trước
    const localStations = stmts.getStation
      ? (() => {
          try {
            // Tìm trạm có postal_code trùng khớp trong DB
            const { getDb } = require('@/lib/database');
            const db = getDb();
            const results = db
              .prepare(
                `SELECT * FROM stations WHERE postal_code = ? ORDER BY name`
              )
              .all(code);
            return results;
          } catch {
            return [];
          }
        })()
      : [];

    if (localStations.length > 0) {
      return NextResponse.json({
        count: localStations.length,
        source: 'local_db',
        stations: localStations.map((s) => ({
          ...s,
          opening_times: JSON.parse(s.opening_times || '[]'),
        })),
      });
    }

    // Fallback: tìm trên Tankerkönig bằng tọa độ approximate
    // (Cần geocoding service thực tế, đây chỉ là placeholder)
    return NextResponse.json({
      count: 0,
      source: 'tankerkoenig',
      stations: [],
      note: 'Không tìm thấy trạm. Hãy dùng /api/stations/search với tọa độ.',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
