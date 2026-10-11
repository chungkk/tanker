import { getStmts } from '../database.js';

/**
 * Dự đoán giá dựa trên pattern lịch sử.
 * 
 * Thuật toán: Weighted Moving Average + Daily Pattern
 * - Phân tích pattern giá theo giờ trong ngày (giá thường tăng sáng, giảm tối)
 * - Kết hợp trend gần nhất
 * - Dự đoán tối đa 24 giờ tới
 */
export function forecastPrices(stationId, fuelName, hoursAhead = 24) {
  const stmts = getStmts();

  // Lấy dữ liệu 7 ngày gần nhất
  const history = stmts.getPriceHistory.all(
    stationId,
    fuelName,
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  );

  if (history.length < 5) {
    return { error: 'Không đủ dữ liệu để dự đoán (cần ít nhất 5 data points).' };
  }

  // 1. Tính giá hiện tại
  const currentPrice = history[history.length - 1].price;

  // 2. Phân tích pattern theo giờ trong ngày
  const hourlyPattern = {};
  const hourlyCount = {};

  for (let i = 1; i < history.length; i++) {
    const hour = new Date(history[i].recorded_at).getUTCHours();
    const change = history[i].price - history[i - 1].price;

    if (!hourlyPattern[hour]) {
      hourlyPattern[hour] = 0;
      hourlyCount[hour] = 0;
    }
    hourlyPattern[hour] += change;
    hourlyCount[hour]++;
  }

  // Trung bình thay đổi giá theo giờ
  const avgHourlyChange = {};
  for (const hour of Object.keys(hourlyPattern)) {
    avgHourlyChange[hour] = hourlyPattern[hour] / hourlyCount[hour];
  }

  // 3. Tính trend gần nhất (3 data points cuối)
  const recentPoints = history.slice(-3);
  let recentTrend = 0;
  if (recentPoints.length >= 2) {
    const totalChange =
      recentPoints[recentPoints.length - 1].price - recentPoints[0].price;
    recentTrend = totalChange / (recentPoints.length - 1);
  }

  // 4. Tạo dự đoán
  const forecasts = [];
  let predictedPrice = currentPrice;
  const now = new Date();

  for (let h = 1; h <= hoursAhead; h++) {
    const futureTime = new Date(now.getTime() + h * 60 * 60 * 1000);
    const futureHour = futureTime.getUTCHours();

    // Kết hợp pattern giờ + trend gần nhất (70% pattern, 30% trend)
    const hourChange = avgHourlyChange[futureHour] || 0;
    const predictedChange = hourChange * 0.7 + recentTrend * 0.3;

    predictedPrice = Math.round((predictedPrice + predictedChange) * 1000) / 1000;

    // Giới hạn giá không âm và không quá xa giá hiện tại (±20%)
    predictedPrice = Math.max(
      currentPrice * 0.8,
      Math.min(currentPrice * 1.2, predictedPrice)
    );

    forecasts.push({
      time: futureTime.toISOString(),
      price: predictedPrice,
      confidence: Math.max(0.3, 1 - h * 0.03), // Confidence giảm theo thời gian
    });
  }

  // 5. Thống kê bổ sung
  const prices = history.map((h) => h.price);
  const stats = {
    current_price: currentPrice,
    min_7d: Math.min(...prices),
    max_7d: Math.max(...prices),
    avg_7d: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 1000) / 1000,
    trend: recentTrend > 0.001 ? 'rising' : recentTrend < -0.001 ? 'falling' : 'stable',
    data_points: history.length,
  };

  return {
    station_id: stationId,
    fuel_name: fuelName,
    stats,
    forecasts,
  };
}

/**
 * Tìm thời điểm giá rẻ nhất trong ngày (dựa trên lịch sử)
 */
export function findBestTime(stationId, fuelName) {
  const stmts = getStmts();

  const history = stmts.getPriceHistory.all(
    stationId,
    fuelName,
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  );

  if (history.length < 10) {
    return { error: 'Không đủ dữ liệu.' };
  }

  // Nhóm giá theo giờ
  const hourlyPrices = {};
  for (const record of history) {
    const hour = new Date(record.recorded_at).getUTCHours();
    if (!hourlyPrices[hour]) hourlyPrices[hour] = [];
    hourlyPrices[hour].push(record.price);
  }

  // Tính giá trung bình theo giờ
  const hourlyAvg = {};
  for (const [hour, prices] of Object.entries(hourlyPrices)) {
    hourlyAvg[hour] = {
      hour: parseInt(hour),
      avg_price: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 1000) / 1000,
      sample_size: prices.length,
    };
  }

  // Sắp xếp theo giá
  const sorted = Object.values(hourlyAvg).sort((a, b) => a.avg_price - b.avg_price);

  return {
    station_id: stationId,
    fuel_name: fuelName,
    cheapest_hours: sorted.slice(0, 3),
    most_expensive_hours: sorted.slice(-3).reverse(),
    all_hours: sorted,
  };
}
