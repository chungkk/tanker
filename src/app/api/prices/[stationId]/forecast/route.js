import { NextResponse } from 'next/server';
import { forecastPrices } from '@/lib/services/forecast';

/**
 * GET /api/prices/:stationId/forecast
 * Dự đoán giá trong 24h tới
 * Query: fuel (bắt buộc), hours (mặc định 24)
 */
export async function GET(request, { params }) {
  try {
    const { stationId } = await params;
    const { searchParams } = new URL(request.url);
    const fuel = searchParams.get('fuel');
    const hours = parseInt(searchParams.get('hours') || '24');

    if (!fuel) {
      return NextResponse.json(
        { error: 'Cần có tham số fuel (ví dụ: ?fuel=Diesel)' },
        { status: 400 }
      );
    }

    const result = forecastPrices(stationId, fuel, hours);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
