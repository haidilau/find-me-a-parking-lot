/**
 * HDB Carpark Availability Real-Time Endpoint
 * Source: https://api.data.gov.sg/v1/transport/carpark-availability
 * Filter: Uses ONLY Lot Type: C (Cars) as requested
 */

let cachedAvailability = null;
let lastAvailabilityTime = 0;

export async function fetchHdbAvailability(dateTimeParam = '') {
  const now = Date.now();
  // Cache live availability for 20 seconds to prevent rate limits while keeping data live
  if (cachedAvailability && (now - lastAvailabilityTime) < 20000 && !dateTimeParam) {
    return cachedAvailability;
  }

  try {
    let url = 'https://api.data.gov.sg/v1/transport/carpark-availability';
    if (dateTimeParam) {
      url += `?date_time=${encodeURIComponent(dateTimeParam)}`;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ParkSG-Live/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const carparkData = data.items?.[0]?.carpark_data || [];
      const timestamp = data.items?.[0]?.timestamp || new Date().toISOString();

      // Filter ONLY lot_type === 'C' (Cars)
      const carLotsMap = new Map();
      const carLotsList = [];

      for (const cp of carparkData) {
        const carInfo = cp.carpark_info?.find((info) => info.lot_type === 'C');
        if (carInfo && cp.carpark_number) {
          const totalLots = parseInt(carInfo.total_lots || '0', 10);
          const availableLots = parseInt(carInfo.lots_available || '0', 10);
          const entry = {
            carparkNumber: cp.carpark_number,
            lotType: 'C',
            totalLots,
            availableLots,
            updateDatetime: cp.update_datetime,
          };
          carLotsMap.set(cp.carpark_number.toUpperCase(), entry);
          carLotsList.push(entry);
        }
      }

      cachedAvailability = {
        timestamp,
        count: carLotsList.length,
        lotType: 'C',
        map: carLotsMap,
        list: carLotsList,
      };
      lastAvailabilityTime = now;
      return cachedAvailability;
    }
  } catch (err) {
    console.warn('[HDB Availability API] Error querying live availability:', err.message);
  }

  return cachedAvailability || { timestamp: new Date().toISOString(), count: 0, lotType: 'C', map: new Map(), list: [] };
}

export default async function handler(req, res) {
  const dateTime = req.query?.date_time;
  const availability = await fetchHdbAvailability(dateTime);

  res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');
  return res.status(200).json({
    status: 'Success',
    source: 'data.gov.sg_carpark_availability',
    timestamp: availability.timestamp,
    lotTypeFilter: 'C (Cars only)',
    totalCarCarparks: availability.count,
    carparkData: availability.list,
  });
}
