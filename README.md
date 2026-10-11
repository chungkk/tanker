# 🛢️ Fuel Price API

API giá xăng Đức — Giá realtime + So sánh rẻ/đắt theo khu vực.

**Nguồn dữ liệu**: [Tankerkönig](https://creativecommons.tankerkoenig.de/) (MTS-K / Bundeskartellamt)  
**License**: CC BY 4.0 — Hợp pháp, kể cả sử dụng thương mại (cần ghi nguồn).

Không dùng database: mỗi request gọi thẳng Tankerkönig, kết quả được cache 5 phút → deploy được lên Vercel.

## Cài Đặt

```bash
# 1. Cài dependencies
npm install

# 2. Cấu hình API key
cp .env.example .env
# Sửa file .env, thay TANKERKOENIG_API_KEY bằng key thật
# (Đăng ký miễn phí tại https://creativecommons.tankerkoenig.de/)

# 3. Chạy server
npm run dev
```

Trang test giao diện: `http://localhost:3000/test`

## Deploy lên Vercel

Import repo vào Vercel, thêm biến môi trường `TANKERKOENIG_API_KEY`, deploy. Không cần cấu hình gì thêm.

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/stations/search?lat=&lng=&rad=` | Tìm trạm theo tọa độ + so sánh giá |
| GET | `/api/stations/postalcode/:code?rad=` | Tìm trạm theo mã bưu điện + so sánh giá |
| GET | `/api/stations/:id` | Chi tiết 1 trạm |
| GET | `/api/prices/:id/current` | Giá hiện tại của 1 trạm |
| GET | `/api/stats/global` | Giá trung bình tham khảo (mẫu quanh tâm nước Đức) |

### So sánh rẻ/đắt

Kết quả `search` và `postalcode` có thêm:

- `summary` — giá `min` / `avg` / `max` của từng loại nhiên liệu trong khu vực (chỉ tính trạm đang mở).
- Mỗi giá trong `stations[].fuels[]` có:
  - `diffFromAvg` — chênh lệch so với giá trung bình khu vực (EUR, âm = rẻ hơn)
  - `level` — `cheap` / `average` / `expensive` (ngưỡng ±2 cent)
  - `isCheapest` — trạm rẻ nhất khu vực cho loại nhiên liệu đó

## Ví Dụ Sử Dụng

```bash
# Tìm trạm xăng quanh Halle (Saale)
curl "http://localhost:3000/api/stations/search?lat=51.4947&lng=11.989&rad=5"

# Tìm theo mã bưu điện
curl "http://localhost:3000/api/stations/postalcode/06118?rad=5"

# Giá hiện tại 1 trạm
curl "http://localhost:3000/api/prices/{station-id}/current"
```

## Kiến Trúc

```
fuel-price-api/
├── src/
│   ├── app/
│   │   ├── api/                  # Route handlers (các endpoint ở trên)
│   │   └── test/                 # Trang test giao diện
│   ├── lib/
│   │   ├── config.js             # Cấu hình
│   │   └── services/
│   │       ├── tankerkoenig.js   # Client gọi Tankerkönig API (cache 5 phút)
│   │       ├── geocode.js        # Mã bưu điện → tọa độ (OpenStreetMap Nominatim)
│   │       └── compare.js        # So sánh giá rẻ/đắt trong khu vực
│   └── proxy.js                  # Rate limiting (60 req/phút/IP)
├── .env                          # API key (không commit)
└── package.json
```
