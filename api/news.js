const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const q = req.query.q;
  const max = req.query.max || '12';

  if (!q) {
    return res.status(400).json({ error: 'q param required' });
  }

  const key = process.env.VITE_GNEWS_KEY || process.env.GNEWS_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const params = new URLSearchParams({ q, lang: 'en', country: 'in', max: String(max), sortby: 'publishedAt', apikey: key });

  try {
    const { status, body } = await httpsGet(`https://gnews.io/api/v4/search?${params}`);
    const data = JSON.parse(body);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'upstream failed', detail: String(err) });
  }
};
