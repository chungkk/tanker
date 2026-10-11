import { NextResponse } from 'next/server';
import { searchStations } from '@/lib/services/tankerkoenig';

/**
 * GET /api/stations/search
 * Tìm trạm xăng theo tọa độ
 * Query: lat, lng, rad (km, max 25)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const rad = searchParams.get('rad') || '5';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Cần có lat và lng.' },
        { status: 400 }
      );
    }

    const data = await searchStations(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(rad)
    );

    return NextResponse.json({
      count: data.stations?.length || 0,
      stations: (data.stations || []).map(formatStation),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Helper: Format station từ Tankerkönig response
function formatStation(s) {
  return {
    id: s.id,
    name: s.name,
    brand: s.brand,
    street: s.street,
    postalCode: s.postalCode,
    place: s.place,
    coords: s.coords,
    isOpen: s.isOpen,
    distance: s.dist,
    fuels: (s.fuels || []).map((f) => ({
      name: f.name,
      category: f.category,
      price: f.price,
      lastChange: f.lastChange,
    })),
  };
}
