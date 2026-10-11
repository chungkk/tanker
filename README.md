# 🛢️ Fuel Price API

API giá xăng Đức — Dữ liệu realtime + Lịch sử + Dự đoán giá.

**Nguồn dữ liệu**: [Tankerkönig](https://creativecommons.tankerkoenig.de/) (MTS-K / Bundeskartellamt)  
**License**: CC BY 4.0 — Hợp pháp, kể cả sử dụng thương mại.

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

## API Endpoints

### Trạm Xăng

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/stations/search?lat=&lng=&rad=` | Tìm trạm theo tọa độ |
| GET | `/api/stations/postalcode/:code` | Tìm theo mã bưu điện |
| GET | `/api/stations/watched` | Danh sách trạm đang theo dõi |
| GET | `/api/stations/:id` | Chi tiết 1 trạm |
| POST | `/api/stations/watch` | Thêm vùng vào watchlist |
| POST | `/api/stations/watch/:id` | Thêm 1 trạm cụ thể |
| DELETE | `/api/stations/watch/:id` | Xóa khỏi watchlist |

### Giá

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/prices/:id/current` | Giá hiện tại |
| GET | `/api/prices/:id/history?fuel=&days=` | Lịch sử giá |
| GET | `/api/prices/:id/forecast?fuel=&hours=` | Dự đoán giá |
| GET | `/api/prices/:id/best-time?fuel=` | Thời điểm rẻ nhất |
| GET | `/api/prices/:id/stats?days=` | Thống kê min/max/avg |

### Thống Kê

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/stats/global` | Giá trung bình toàn quốc |
| GET | `/api/stats/local` | Thống kê dữ liệu đã thu thập |
| POST | `/api/stats/collect` | Thu thập giá ngay |

## Ví Dụ Sử Dụng

```bash
# Tìm trạm xăng quanh Halle (Saale)
curl "http://localhost:3000/api/stations/search?lat=51.4947&lng=11.989&rad=5"

# Thêm trạm vào watchlist
curl -X POST "http://localhost:3000/api/stations/watch" \
  -H "Content-Type: application/json" \
  -d '{"lat": 51.4947, "lng": 11.989, "radius": 5}'

# Xem lịch sử giá 7 ngày
curl "http://localhost:3000/api/prices/{station-id}/history?fuel=Diesel&days=7"

# Dự đoán giá 24h
curl "http://localhost:3000/api/prices/{station-id}/forecast?fuel=Diesel"

# Thời điểm rẻ nhất
curl "http://localhost:3000/api/prices/{station-id}/best-time?fuel=Diesel"
```

## Kiến Trúc

```
fuel-price-api/
├── src/
│   ├── server.js              # Express server + routes
│   ├── config.js              # Cấu hình
│   ├── database.js            # SQLite setup + queries
│   ├── routes/
│   │   ├── stations.js        # Tìm + quản lý trạm
│   │   ├── prices.js          # Giá + lịch sử + dự đoán
│   │   └── stats.js           # Thống kê
│   ├── services/
│   │   ├── tankerkoenig.js    # Client gọi Tankerkönig API
│   │   ├── collector.js       # Cron job thu thập giá
│   │   └── forecast.js        # Thuật toán dự đoán giá
│   └── middleware/
│       └── rateLimit.js       # Rate limiting
├── data/                      # SQLite database (auto-created)
├── .env                       # API key (không commit)
└── package.json
```
