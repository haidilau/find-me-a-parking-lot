/**
 * Helper to acquire and cache URA DataService Token
 * Endpoint: https://eservice.ura.gov.sg/uraDataService/insertNewToken.action
 */

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getUraToken() {
  const uraAccessKey = process.env.URA_ACCOUNT_KEY || process.env.URA_ACCESS_KEY || '';
  if (!uraAccessKey || uraAccessKey === 'MY_URA_ACCOUNT_KEY') {
    return null;
  }

  const now = Date.now();
  // Return cached token if valid (expires in 24 hours, renew 30 mins early)
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const res = await fetch('https://eservice.ura.gov.sg/uraDataService/insertNewToken.action', {
      headers: {
        'AccessKey': uraAccessKey,
        'User-Agent': 'ParkSG/1.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.Status === 'Success' && data.Result) {
        cachedToken = data.Result;
        tokenExpiresAt = now + (23 * 60 * 60 * 1000); // cache for 23 hours
        return cachedToken;
      }
    }
  } catch (err) {
    console.warn('[URA Token Helper] Error fetching token:', err.message);
  }

  return null;
}

export default async function handler(req, res) {
  const token = await getUraToken();
  if (token) {
    return res.status(200).json({ status: 'Success', tokenMasked: `${token.slice(0, 4)}...${token.slice(-4)}` });
  }
  return res.status(200).json({ status: 'KeyNotSetOrFallback', message: 'Set URA_ACCOUNT_KEY in environment variables' });
}
