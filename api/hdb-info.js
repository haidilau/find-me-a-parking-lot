/**
 * HDB Carpark Information Endpoint
 * Dataset: d_23f946fa557947f93a8043bbef41dd09
 * Source: https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09
 */

let cachedHdbInfo = null;
let lastFetchTime = 0;

export async function fetchHdbInfo(limit = 2000) {
  const now = Date.now();
  // Cache HDB static info for 6 hours
  if (cachedHdbInfo && (now - lastFetchTime) < 6 * 60 * 60 * 1000) {
    return cachedHdbInfo;
  }

  try {
    const url = `https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ParkSG-Live/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.result?.records) {
        cachedHdbInfo = data.result.records;
        lastFetchTime = now;
        return cachedHdbInfo;
      }
    }
  } catch (err) {
    console.warn('[HDB Info API] Error fetching from data.gov.sg:', err.message);
  }

  return cachedHdbInfo || [];
}

export default async function handler(req, res) {
  const limit = parseInt(req.query?.limit || '1000', 10);
  const records = await fetchHdbInfo(limit);

  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  return res.status(200).json({
    success: true,
    source: 'data.gov.sg_d_23f946fa557947f93a8043bbef41dd09',
    count: records.length,
    records,
  });
}
