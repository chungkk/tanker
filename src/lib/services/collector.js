import { getDb, getStmts } from '../database.js';
import * as tankerkoenig from './tankerkoenig.js';
import { HISTORY_DAYS } from '../config.js';

/**
 * Thu thập và lưu giá từ Tankerkönig cho tất cả trạm đang watch.
 * Chỉ lưu khi giá thay đổi (tránh duplicate).
 */
export async function collectPrices() {
  const stmts = getStmts();
  const db = getDb();
  const watched = stmts.getWatched.all();

  if (watched.length === 0) {
    console.log('[Collector] Không có trạm nào trong watchlist.');
    return { collected: 0, stations: 0 };
  }

  const stationIds = watched.map((w) => w.id);
  console.log(`[Collector] Thu thập giá cho ${stationIds.length} trạm...`);

  try {
    // Tankerkönig cho phép tối đa 10 IDs/request
    let totalInserted = 0;
    const chunks = chunkArray(stationIds, 10);

    for (const chunk of chunks) {
      const data = await tankerkoenig.getByIds(chunk);

      if (!data.stations || !data.stations.length) continue;

      const insertMany = db.transaction((stations) => {
        for (const station of stations) {
          // Lưu giá cho mỗi loại nhiên liệu
          if (station.fuels) {
            for (const fuel of station.fuels) {
              if (fuel.price != null) {
                const result = stmts.insertPrice.run({
                  station_id: station.id,
                  fuel_name: fuel.name,
                  fuel_category: fuel.category,
                  price: fuel.price,
                });
                if (result.changes > 0) totalInserted++;
              }
            }
          }
        }
      });

      insertMany(data.stations);

      // Respect rate limit: đợi 2 giây giữa các chunk
      if (chunks.length > 1) {
        await sleep(2000);
      }
    }

    console.log(
      `[Collector] Hoàn tất. ${totalInserted} thay đổi giá mới được lưu.`
    );
    return { collected: totalInserted, stations: stationIds.length };
  } catch (err) {
    console.error('[Collector] Lỗi:', err.message);
    return { error: err.message };
  }
}

/**
 * Tìm và thêm trạm xăng vào watchlist + thu thập giá lần đầu
 */
export async function addStationsToWatch(lat, lng, radius = 5, label) {
  const stmts = getStmts();
  const db = getDb();
  const data = await tankerkoenig.searchStations(lat, lng, radius);

  if (!data.stations || !data.stations.length) {
    return { added: 0, message: 'Không tìm thấy trạm nào.' };
  }

  const insertStations = db.transaction((stations) => {
    for (const station of stations) {
      // Lưu thông tin trạm
      stmts.upsertStation.run({
        id: station.id,
        name: station.name || '',
        brand: station.brand || '',
        street: station.street || '',
        postal_code: station.postalCode || '',
        place: station.place || '',
        lat: station.coords.lat,
        lng: station.coords.lng,
        is_open: station.isOpen ? 1 : 0,
        opening_times: JSON.stringify(station.openingTimes || []),
      });

      // Thêm vào watchlist
      stmts.addWatched.run(
        station.id,
        label || `${station.brand} ${station.place}`
      );

      // Lưu giá hiện tại
      if (station.fuels) {
        for (const fuel of station.fuels) {
          if (fuel.price != null) {
            stmts.insertPrice.run({
              station_id: station.id,
              fuel_name: fuel.name,
              fuel_category: fuel.category,
              price: fuel.price,
            });
          }
        }
      }
    }
  });

  insertStations(data.stations);
  console.log(`[Collector] Đã thêm ${data.stations.length} trạm vào watchlist.`);

  return {
    added: data.stations.length,
    stations: data.stations.map((s) => ({
      id: s.id,
      name: s.name,
      brand: s.brand,
      place: s.place,
      distance: s.dist,
    })),
  };
}

/**
 * Dọn dẹp dữ liệu cũ
 */
export function cleanOldData() {
  const stmts = getStmts();
  const result = stmts.cleanOldData.run(`-${HISTORY_DAYS}`);
  console.log(`[Cleanup] Đã xóa ${result.changes} records cũ hơn ${HISTORY_DAYS} ngày.`);
  return result.changes;
}

// Helpers
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
