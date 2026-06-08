import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const upstream = await fetch(`https://gnews.io/api/v4/search?${params}`);
  const data = await upstream.json();

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(upstream.status).json(data);
}
