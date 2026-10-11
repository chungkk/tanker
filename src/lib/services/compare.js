/**
 * So sánh giá giữa các trạm trong cùng khu vực → trạm nào rẻ / đắt.
 * Chỉ tính trạm đang mở cửa và có giá.
 */
export function summarizeFuels(stations) {
  const byFuel = {};

  for (const s of stations) {
    if (!s.isOpen) continue;
    for (const f of s.fuels || []) {
      if (f.price == null) continue;
      (byFuel[f.name] ||= []).push(f.price);
    }
  }

  const summary = {};
  for (const [fuel, prices] of Object.entries(byFuel)) {
    const sum = prices.reduce((a, b) => a + b, 0);
    summary[fuel] = {
      min: Math.min(...prices),
      avg: round3(sum / prices.length),
      max: Math.max(...prices),
      count: prices.length,
    };
  }
  return summary;
}

/**
 * Gắn thêm cho mỗi giá: chênh lệch so với trung bình khu vực + mức (cheap/average/expensive)
 * Ngưỡng: rẻ/đắt hơn trung bình từ 2 cent trở lên
 */
export function rateFuel(fuel, summary) {
  const s = summary[fuel.name];
  if (!s || fuel.price == null) return { ...fuel, diffFromAvg: null, level: null };

  const diff = round3(fuel.price - s.avg);
  let level = 'average';
  if (diff <= -0.02) level = 'cheap';
  else if (diff >= 0.02) level = 'expensive';

  return { ...fuel, diffFromAvg: diff, isCheapest: fuel.price === s.min, level };
}

/**
 * Format kết quả tìm trạm (dùng chung cho search + postalcode):
 * danh sách trạm đã chấm rẻ/đắt + bảng tóm tắt giá khu vực
 */
export function buildStationList(stations) {
  const summary = summarizeFuels(stations);

  return {
    count: stations.length,
    summary,
    stations: stations.map((s) => ({
      id: s.id,
      name: s.name,
      brand: s.brand,
      street: [s.street, s.houseNumber].filter(Boolean).join(' '),
      postalCode: s.postalCode,
      place: s.place,
      coords: s.coords,
      isOpen: s.isOpen,
      distance: s.dist,
      fuels: (s.fuels || []).map((f) => rateFuel(f, summary)),
    })),
  };
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}
