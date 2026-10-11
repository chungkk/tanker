import { NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

/**
 * GET /api/stats/local
 * Thống kê cục bộ từ dữ liệu đã thu thập
 */
export async function GET() {
  try {
    const db = getDb();

    const stats = db
      .prepare(
        `
      SELECT 
        fuel_name,
        fuel_category,
        COUNT(DISTINCT station_id) as stations_tracked,
        COUNT(*) as total_records,
        MIN(price) as min_price,
        MAX(price) as max_price,
        ROUND(AVG(price), 3) as avg_price,
        MIN(recorded_at) as first_record,
        MAX(recorded_at) as last_record
      FROM price_history
      GROUP BY fuel_name
      ORDER BY fuel_name
    `
      )
      .all();

    const dbInfo = db
      .prepare(
        `
      SELECT
        (SELECT COUNT(*) FROM stations) as total_stations,
        (SELECT COUNT(*) FROM watched_stations) as watched_stations,
        (SELECT COUNT(*) FROM price_history) as total_price_records
    `
      )
      .get();

    return NextResponse.json({
      database: dbInfo,
      fuel_stats: stats,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
