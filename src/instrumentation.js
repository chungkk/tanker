/**
 * Next.js Instrumentation Hook
 * Chạy khi server start — thay thế startCollector() từ Express
 * 
 * Sử dụng node-cron để schedule thu thập giá định kỳ
 */
export async function register() {
  // Chỉ chạy trên Node.js runtime (không phải Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { TANKERKOENIG_API_KEY, COLLECT_INTERVAL } = await import('./lib/config.js');

    console.log('\n🚀 Fuel Price API (Next.js) started');

    if (!TANKERKOENIG_API_KEY || TANKERKOENIG_API_KEY === 'your-api-key-here') {
      console.log('\n⚠️  TANKERKOENIG_API_KEY chưa được cấu hình!');
      console.log('   1. Đăng ký miễn phí tại: https://creativecommons.tankerkoenig.de/');
      console.log('   2. Copy .env.example → .env');
      console.log('   3. Điền API key vào file .env\n');
    } else {
      console.log('✅ Tankerkönig API key đã cấu hình');
      console.log(`📡 Data collector: ${COLLECT_INTERVAL}`);

      // Dynamic import để tránh load ở Edge runtime
      const cron = (await import('node-cron')).default;
      const { collectPrices, cleanOldData } = await import('./lib/services/collector.js');

      // Thu thập ngay khi khởi động
      collectPrices();

      // Lên lịch thu thập định kỳ
      cron.schedule(COLLECT_INTERVAL, () => {
        collectPrices();
      });

      // Dọn dẹp data cũ mỗi ngày lúc 3:00 AM
      cron.schedule('0 3 * * *', () => {
        cleanOldData();
      });
    }
  }
}
