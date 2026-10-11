import { NextResponse } from 'next/server';

/**
 * GET /api
 * API Documentation (root)
 */
export async function GET() {
  return NextResponse.json({
    name: 'Fuel Price API',
    version: '2.0.0',
    description: 'API giá xăng Đức - Giá realtime + so sánh rẻ/đắt theo khu vực',
    source: 'Tankerkönig (MTS-K / Bundeskartellamt)',
    license: 'CC BY 4.0',
    endpoints: {
      // Trạm xăng
      'GET  /api/stations/search?lat=&lng=&rad=':
        'Tìm trạm theo tọa độ + so sánh giá rẻ/đắt trong khu vực',
      'GET  /api/stations/postalcode/:code?rad=':
        'Tìm trạm theo mã bưu điện + so sánh giá',
      'GET  /api/stations/:id':
        'Thông tin chi tiết 1 trạm',

      // Giá
      'GET  /api/prices/:stationId/current':
        'Giá hiện tại của 1 trạm',
      'GET  /api/stats/global':
        'Giá trung bình tham khảo (mẫu quanh tâm nước Đức)',
    },
  });
}
