import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'fuel_prices.db');

// Đảm bảo thư mục data tồn tại
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Singleton: chỉ tạo 1 connection duy nhất
let _db;

function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);

    // Bật WAL mode cho performance tốt hơn
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');

    // Tạo bảng
    _db.exec(`
      -- Bảng trạm xăng
      CREATE TABLE IF NOT EXISTS stations (
        id TEXT PRIMARY KEY,               -- UUID từ Tankerkönig
        name TEXT NOT NULL,
        brand TEXT,
        street TEXT,
        postal_code TEXT,
        place TEXT,                         -- Thành phố
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        is_open INTEGER DEFAULT 1,
        opening_times TEXT,                 -- JSON string
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Bảng lịch sử giá
      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT NOT NULL,
        fuel_name TEXT NOT NULL,            -- "Diesel", "Super E5", "Super E10", ...
        fuel_category TEXT NOT NULL,        -- "diesel", "gasoline", "lpg", "cng"
        price REAL NOT NULL,                -- EUR/Liter
        recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (station_id) REFERENCES stations(id)
      );

      -- Bảng trạm đang theo dõi (watchlist)
      CREATE TABLE IF NOT EXISTS watched_stations (
        station_id TEXT PRIMARY KEY,
        label TEXT,                          -- Nhãn tùy chỉnh (ví dụ: "Trạm gần nhà")
        added_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (station_id) REFERENCES stations(id)
      );

      -- Indexes cho performance
      CREATE INDEX IF NOT EXISTS idx_price_station_fuel
        ON price_history(station_id, fuel_name);
      CREATE INDEX IF NOT EXISTS idx_price_recorded
        ON price_history(recorded_at);
      CREATE INDEX IF NOT EXISTS idx_price_station_fuel_time
        ON price_history(station_id, fuel_name, recorded_at);
      CREATE INDEX IF NOT EXISTS idx_stations_coords
        ON stations(lat, lng);
    `);

    // Thêm hàm radians cho SQLite (không có sẵn)
    _db.function('radians', (deg) => (deg * Math.PI) / 180);
    _db.function('acos', (x) => Math.acos(Math.min(1, Math.max(-1, x))));
  }
  return _db;
}

// =============================================
// Prepared statements (tái sử dụng cho performance)
// =============================================

function getStmts() {
  const db = getDb();

  return {
    // Upsert trạm xăng
    upsertStation: db.prepare(`
      INSERT INTO stations (id, name, brand, street, postal_code, place, lat, lng, is_open, opening_times, updated_at)
      VALUES (@id, @name, @brand, @street, @postal_code, @place, @lat, @lng, @is_open, @opening_times, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        name = @name, brand = @brand, street = @street,
        postal_code = @postal_code, place = @place,
        lat = @lat, lng = @lng, is_open = @is_open,
        opening_times = @opening_times, updated_at = datetime('now')
    `),

    // Thêm giá mới (chỉ khi giá thay đổi so với lần cuối)
    insertPrice: db.prepare(`
      INSERT INTO price_history (station_id, fuel_name, fuel_category, price, recorded_at)
      SELECT @station_id, @fuel_name, @fuel_category, @price, datetime('now')
      WHERE NOT EXISTS (
        SELECT 1 FROM price_history
        WHERE station_id = @station_id
          AND fuel_name = @fuel_name
          AND price = @price
          AND id = (
            SELECT id FROM price_history
            WHERE station_id = @station_id AND fuel_name = @fuel_name
            ORDER BY recorded_at DESC LIMIT 1
          )
      )
    `),

    // Lấy giá hiện tại của 1 trạm
    getCurrentPrices: db.prepare(`
      SELECT fuel_name, fuel_category, price, recorded_at
      FROM price_history ph1
      WHERE station_id = ?
        AND recorded_at = (
          SELECT MAX(recorded_at) FROM price_history ph2
          WHERE ph2.station_id = ph1.station_id AND ph2.fuel_name = ph1.fuel_name
        )
      ORDER BY fuel_name
    `),

    // Lấy lịch sử giá
    getPriceHistory: db.prepare(`
      SELECT fuel_name, price, recorded_at
      FROM price_history
      WHERE station_id = ?
        AND fuel_name = ?
        AND recorded_at >= ?
        AND recorded_at <= ?
      ORDER BY recorded_at ASC
    `),

    // Lấy lịch sử tất cả fuel types
    getPriceHistoryAll: db.prepare(`
      SELECT fuel_name, price, recorded_at
      FROM price_history
      WHERE station_id = ?
        AND recorded_at >= ?
        AND recorded_at <= ?
      ORDER BY fuel_name, recorded_at ASC
    `),

    // Lấy thông tin trạm
    getStation: db.prepare(`SELECT * FROM stations WHERE id = ?`),

    // Tìm trạm theo tọa độ (approximate bounding box)
    searchStations: db.prepare(`
      SELECT *, 
        (6371 * acos(
          cos(radians(@lat)) * cos(radians(lat)) *
          cos(radians(lng) - radians(@lng)) +
          sin(radians(@lat)) * sin(radians(lat))
        )) AS distance_km
      FROM stations
      WHERE lat BETWEEN @lat - @delta_lat AND @lat + @delta_lat
        AND lng BETWEEN @lng - @delta_lng AND @lng + @delta_lng
      ORDER BY distance_km ASC
      LIMIT @limit
    `),

    // Watchlist
    addWatched: db.prepare(`
      INSERT OR REPLACE INTO watched_stations (station_id, label) VALUES (?, ?)
    `),
    removeWatched: db.prepare(`DELETE FROM watched_stations WHERE station_id = ?`),
    getWatched: db.prepare(`
      SELECT s.*, w.label, w.added_at as watched_since
      FROM watched_stations w
      JOIN stations s ON w.station_id = s.id
    `),

    // Thống kê
    getStats: db.prepare(`
      SELECT 
        fuel_name,
        MIN(price) as min_price,
        MAX(price) as max_price,
        ROUND(AVG(price), 3) as avg_price,
        COUNT(*) as data_points
      FROM price_history
      WHERE station_id = ?
        AND recorded_at >= ?
      GROUP BY fuel_name
    `),

    // Xóa data cũ
    cleanOldData: db.prepare(`
      DELETE FROM price_history WHERE recorded_at < datetime('now', ? || ' days')
    `),
  };
}

export { getDb, getStmts };
