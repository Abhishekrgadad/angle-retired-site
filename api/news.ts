import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';

function httpsGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode ?? 500, body }));
    }).on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q, max = '12' } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'q param required' });
  }

  const key = process.env.VITE_GNEWS_KEY || process.env.GNEWS_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const params = new URLSearchParams({
    q,
    lang: 'en',
    country: 'in',
    max: String(max),
    sortby: 'publishedAt',
    apikey: key,
  });

  try {
    const { status, body } = await httpsGet(`https://gnews.io/api/v4/search?${params}`);
    const data = JSON.parse(body);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'upstream fetch failed', detail: String(err) });
  }
}
