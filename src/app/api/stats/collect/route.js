import { NextResponse } from 'next/server';
import { collectPrices } from '@/lib/services/collector';

/**
 * POST /api/stats/collect
 * Thu thập giá ngay lập tức (manual trigger)
 */
export async function POST() {
  try {
    const result = await collectPrices();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
