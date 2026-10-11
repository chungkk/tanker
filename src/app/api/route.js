import { NextResponse } from 'next/server';

/**
 * GET /api
 * API Documentation (root)
 */
export async function GET() {
  return NextResponse.json({
    name: 'Fuel Price API',
    version: '1.0.0',
    description: 'API giá xăng Đức - Realtime + Lịch sử + Dự đoán',
    source: 'Tankerkönig (MTS-K / Bundeskartellamt)',
    license: 'CC BY 4.0',
    endpoints: {
      // Trạm xăng
      'GET  /api/stations/search?lat=&lng=&rad=':
        'Tìm trạm xăng theo tọa độ',
      'GET  /api/stations/postalcode/:code':
        'Tìm trạm theo mã bưu điện',
      'GET  /api/stations/watched':
        'Danh sách trạm đang theo dõi + giá hiện tại',
      'GET  /api/stations/:id':
        'Thông tin chi tiết 1 trạm',
      'POST /api/stations/watch':
        'Thêm trạm vào watchlist (body: {lat, lng, radius, label})',
      'POST /api/stations/watch/:id':
        'Thêm 1 trạm cụ thể vào watchlist',
      'DELETE /api/stations/watch/:id':
        'Xóa trạm khỏi watchlist',

      // Giá
      'GET  /api/prices/:stationId/current':
        'Giá hiện tại',
      'GET  /api/prices/:stationId/history?fuel=&days=':
        'Lịch sử giá (mặc định 7 ngày)',
      'GET  /api/prices/:stationId/forecast?fuel=&hours=':
        'Dự đoán giá (mặc định 24h)',
      'GET  /api/prices/:stationId/best-time?fuel=':
        'Thời điểm giá rẻ nhất',
      'GET  /api/prices/:stationId/stats?days=':
        'Thống kê min/max/avg',

      // Thống kê chung
      'GET  /api/stats/global':
        'Giá trung bình toàn quốc (Tankerkönig)',
      'GET  /api/stats/local':
        'Thống kê dữ liệu đã thu thập',
      'POST /api/stats/collect':
        'Thu thập giá ngay (manual trigger)',
    },
  });
}
