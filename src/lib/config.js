// Tankerkönig API
export const TANKERKOENIG_API_KEY = process.env.TANKERKOENIG_API_KEY || '';
export const TANKERKOENIG_BASE_URL = 'https://creativecommons.tankerkoenig.de';

// Server
export const PORT = parseInt(process.env.PORT || '3000');

// Cron schedule cho data collector
export const COLLECT_INTERVAL = process.env.COLLECT_INTERVAL || '*/5 * * * *';

// Giữ data bao nhiêu ngày
export const HISTORY_DAYS = parseInt(process.env.HISTORY_DAYS || '90');

// Fuel type mapping (Tankerkönig category → tên hiển thị)
export const FUEL_CATEGORIES = {
  diesel: 'Diesel',
  gasoline: 'Benzin',
  lpg: 'LPG',
  cng: 'CNG',
};
