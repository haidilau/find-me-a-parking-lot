/**
 * Live Carpark Availability Endpoint (Lot Type: C - Cars only)
 * Uses: https://api.data.gov.sg/v1/transport/carpark-availability
 */

import { fetchHdbAvailability } from './hdb-availability.js';

export default async function handler(req, res) {
  const dateTime = req.query?.date_time;
  const availability = await fetchHdbAvailability(dateTime);

  res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');
  return res.status(200).json({
    status: 'Success',
    source: 'data.gov.sg_carpark_availability',
    timestamp: availability.timestamp,
    lotType: 'C',
    count: availability.count,
    result: availability.list.map((item) => ({
      carparkNo: item.carparkNumber,
      lotType: 'C',
      totalLots: item.totalLots,
      lotsAvailable: String(item.availableLots),
    })),
  });
}
