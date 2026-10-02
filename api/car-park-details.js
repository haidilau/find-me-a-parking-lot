/**
 * Car Park List and Rates Endpoint
 * Source: https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Details
 */

import { getUraToken } from './ura-token.js';

export default async function handler(req, res) {
  const uraAccessKey = process.env.URA_ACCOUNT_KEY || process.env.URA_ACCESS_KEY || '';

  if (uraAccessKey && uraAccessKey !== 'MY_URA_ACCOUNT_KEY') {
    try {
      const token = await getUraToken();
      const headers = {
        'AccessKey': uraAccessKey,
        'User-Agent': 'ParkSG-Details/1.0',
      };
      if (token) {
        headers['Token'] = token;
      }

      const response = await fetch('https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Details', {
        headers,
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.Status === 'Success' && Array.isArray(data.Result)) {
          return res.status(200).json({
            status: 'Success',
            source: 'ura_dataservice_live',
            count: data.Result.length,
            result: data.Result,
          });
        }
      }
    } catch (err) {
      console.warn('[URA Details API] Failed to fetch details:', err.message);
    }
  }

  // Fallback curated rate list if URA_ACCOUNT_KEY not yet set
  return res.status(200).json({
    status: 'Success',
    source: 'fallback_cache',
    message: 'URA_ACCOUNT_KEY not configured or unreachable; serving baseline rate dataset',
    count: 3,
    result: [
      {
        weekdayMin: '30 mins',
        ppName: 'ALIWAL STREET',
        endTime: '05.00 PM',
        weekdayRate: '$0.50',
        startTime: '08.30 AM',
        ppCode: 'A0004',
        sunPHRate: '$0.50',
        satdayMin: '30 mins',
        sunPHMin: '30 mins',
        parkingSystem: 'C',
        parkCapacity: 69,
        vehCat: 'Car',
        satdayRate: '$0.50',
        geometries: [
          { coordinates: '31045.6165, 31694.0055' }
        ],
      },
      {
        weekdayMin: '30 mins',
        ppName: 'ORCHARD ROAD / ANGULLIA PARK',
        endTime: '05.00 PM',
        weekdayRate: '$1.60',
        startTime: '08.00 AM',
        ppCode: 'N0006',
        sunPHRate: '$1.80',
        satdayMin: '30 mins',
        sunPHMin: '30 mins',
        parkingSystem: 'C',
        parkCapacity: 560,
        vehCat: 'Car',
        satdayRate: '$1.80',
        geometries: [
          { coordinates: '28956.4609, 29088.2522' }
        ],
      },
      {
        weekdayMin: '30 mins',
        ppName: 'MARINA SQUARE / BAYFRONT',
        endTime: '05.00 PM',
        weekdayRate: '$1.20',
        startTime: '07.00 AM',
        ppCode: 'M0045',
        sunPHRate: '$1.50',
        satdayMin: '30 mins',
        sunPHMin: '30 mins',
        parkingSystem: 'C',
        parkCapacity: 2450,
        vehCat: 'Car',
        satdayRate: '$1.50',
        geometries: [
          { coordinates: '30550.800, 29800.200' }
        ],
      }
    ],
  });
}
