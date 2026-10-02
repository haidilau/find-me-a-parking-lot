/**
 * API Health & Diagnostics Handler
 * Monitors:
 * 1. HDB Carpark Information: https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09
 * 2. HDB Live Carpark Availability (Lot Type: C): https://api.data.gov.sg/v1/transport/carpark-availability
 * 3. URA Car Park Details & Availability
 * 4. LTA DataMall EVCBatch
 */

const startTime = Date.now();

export default async function handler(req, res) {
  const uraAccountKey = process.env.URA_ACCOUNT_KEY || process.env.URA_ACCESS_KEY || '';
  const govAccountKey = process.env.GOV_ACCOUNT_KEY || process.env.LTA_DATAMALL_KEY || '';

  const results = {
    status: 'healthy',
    service: 'ParkSG HDB & Singapore Government Gateway',
    lotTypeFilter: 'C (Cars only)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    environment: {
      hdbOpenApiStatus: 'ACTIVE (Direct Government Open Data, No Key Required)',
      uraAccountKeyConfigured: Boolean(uraAccountKey && uraAccountKey !== 'MY_URA_ACCOUNT_KEY'),
      govAccountKeyConfigured: Boolean(govAccountKey && govAccountKey !== 'MY_LTA_DATAMALL_KEY'),
      vercelRegion: process.env.VERCEL_REGION || process.env.AWS_REGION || 'local-dev',
    },
    endpoints: {
      hdbCarparkInfo: {
        name: 'HDB Carpark Info (d_23f946fa557947f93a8043bbef41dd09)',
        url: 'https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09&limit=1',
        status: 'pending',
        httpCode: null,
        latencyMs: 0,
      },
      hdbCarparkAvailability: {
        name: 'HDB Live Availability (Lot Type: C)',
        url: 'https://api.data.gov.sg/v1/transport/carpark-availability',
        status: 'pending',
        httpCode: null,
        latencyMs: 0,
      },
      uraCarParkAvailability: {
        name: 'URA Car Park Availability',
        url: 'https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Availability',
        status: 'pending',
        httpCode: null,
        latencyMs: 0,
      },
      ltaEvcBatch: {
        name: 'LTA DataMall EVCBatch',
        url: 'https://datamall2.mytransport.sg/ltaodataservice/EVCBatch',
        status: 'pending',
        httpCode: null,
        latencyMs: 0,
      },
    },
  };

  const pingStart = Date.now();

  // Test 1: HDB Carpark Info (data.gov.sg datastore_search)
  try {
    const t0 = Date.now();
    const resp = await fetch('https://data.gov.sg/api/action/datastore_search?resource_id=d_23f946fa557947f93a8043bbef41dd09&limit=1', {
      headers: { 'User-Agent': 'ParkSG-Monitor/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    results.endpoints.hdbCarparkInfo.latencyMs = Date.now() - t0;
    results.endpoints.hdbCarparkInfo.httpCode = resp.status;
    results.endpoints.hdbCarparkInfo.status = resp.ok ? 'connected' : `http_${resp.status}`;
  } catch (err) {
    results.endpoints.hdbCarparkInfo.status = 'unreachable';
    results.endpoints.hdbCarparkInfo.error = err.message;
  }

  // Test 2: HDB Carpark Availability (api.data.gov.sg transport availability)
  try {
    const t0 = Date.now();
    const resp = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability', {
      headers: { 'User-Agent': 'ParkSG-Monitor/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    results.endpoints.hdbCarparkAvailability.latencyMs = Date.now() - t0;
    results.endpoints.hdbCarparkAvailability.httpCode = resp.status;
    results.endpoints.hdbCarparkAvailability.status = resp.ok ? 'connected' : `http_${resp.status}`;
  } catch (err) {
    results.endpoints.hdbCarparkAvailability.status = 'unreachable';
    results.endpoints.hdbCarparkAvailability.error = err.message;
  }

  // Test 3: URA Car_Park_Availability
  try {
    const t0 = Date.now();
    const resp = await fetch('https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Availability', {
      headers: { 'User-Agent': 'ParkSG-Monitor/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    results.endpoints.uraCarParkAvailability.latencyMs = Date.now() - t0;
    results.endpoints.uraCarParkAvailability.httpCode = resp.status;
    results.endpoints.uraCarParkAvailability.status = resp.ok ? 'connected' : `http_${resp.status}`;
  } catch (err) {
    results.endpoints.uraCarParkAvailability.status = 'unreachable';
    results.endpoints.uraCarParkAvailability.error = err.message;
  }

  // Test 4: LTA EVCBatch
  try {
    const t0 = Date.now();
    const resp = await fetch('https://datamall2.mytransport.sg/ltaodataservice/EVCBatch', {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });
    results.endpoints.ltaEvcBatch.latencyMs = Date.now() - t0;
    results.endpoints.ltaEvcBatch.httpCode = resp.status;
    results.endpoints.ltaEvcBatch.status = resp.ok ? 'connected' : `http_${resp.status}`;
  } catch (err) {
    results.endpoints.ltaEvcBatch.status = 'unreachable';
    results.endpoints.ltaEvcBatch.error = err.message;
  }

  results.totalDurationMs = Date.now() - pingStart;

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(results);
}
