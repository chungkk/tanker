import { handler, ok } from '@/lib/http';

/**
 * GET /api
 * Tài liệu API (cũng được trả về ở /)
 */
export const GET = handler(async () => {
  return ok(
    {
      name: 'Fuel Price API',
      version: '2.1.0',
      description: 'API giá xăng Đức — giá realtime + so sánh rẻ/đắt theo khu vực',
      source: 'Tankerkönig (MTS-K / Bundeskartellamt) — https://creativecommons.tankerkoenig.de',
      license: 'CC BY 4.0 (cần ghi nguồn Tankerkönig khi hiển thị dữ liệu)',
      notes: [
        'Chỉ hỗ trợ GET. CORS mở cho mọi domain.',
        'Giá cache tối đa 5 phút. Đơn vị giá: EUR/lít.',
        'Lỗi trả về dạng { "error": "..." } với status 400 / 404 / 502 (Tankerkönig lỗi) / 500.',
      ],
      endpoints: [
        {
          path: '/api/stations/search',
          description: 'Tìm trạm theo tọa độ + so sánh giá rẻ/đắt trong khu vực',
          params: {
            lat: 'Vĩ độ (bắt buộc)',
            lng: 'Kinh độ (bắt buộc)',
            rad: 'Bán kính km, mặc định 5, tối đa 25',
          },
          example: '/api/stations/search?lat=51.4947&lng=11.989&rad=5',
        },
        {
          path: '/api/stations/postalcode/:code',
          description: 'Tìm trạm theo mã bưu điện (5 chữ số) + so sánh giá',
          params: { rad: 'Bán kính km, mặc định 5, tối đa 25' },
          example: '/api/stations/postalcode/06118?rad=5',
        },
        {
          path: '/api/stations/:id',
          description: 'Chi tiết 1 trạm (địa chỉ, giờ mở cửa, giá hiện tại)',
          example: '/api/stations/d1eae26d-910f-4430-8d9b-281d6316c3cd',
        },
        {
          path: '/api/prices',
          description: 'Giá hiện tại của nhiều trạm (tối đa 10) trong 1 request',
          params: { ids: 'Danh sách ID trạm, ngăn cách bằng dấu phẩy' },
          example: '/api/prices?ids=d1eae26d-910f-4430-8d9b-281d6316c3cd,278130b1-e062-4a0f-80cc-19e486b4c024',
        },
        {
          path: '/api/prices/:stationId/current',
          description: 'Giá hiện tại của 1 trạm',
          example: '/api/prices/d1eae26d-910f-4430-8d9b-281d6316c3cd/current',
        },
        {
          path: '/api/stats/global',
          description: 'Giá trung bình tham khảo (mẫu 25 km quanh tâm nước Đức)',
          example: '/api/stats/global',
        },
      ],
      response_fields: {
        summary: 'Giá min / avg / max / count theo loại nhiên liệu trong khu vực (chỉ trạm đang mở)',
        'stations[].fuels[].diffFromAvg': 'Chênh lệch so với giá trung bình khu vực (EUR, âm = rẻ hơn)',
        'stations[].fuels[].level': 'cheap | average | expensive (ngưỡng ±2 cent)',
        'stations[].fuels[].isCheapest': 'true nếu là giá rẻ nhất khu vực',
      },
    },
    86400
  );
});
