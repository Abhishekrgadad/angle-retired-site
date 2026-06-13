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

function parseLastUpdated(str) {
  if (!str) return new Date().toISOString();
  const m = str.match(/(\d+)\s+(minute|hour|day|week|month)/i);
  if (m) {
    const n = parseInt(m[1]);
    const unit = m[2].toLowerCase();
    const msMap = { minute: 60000, hour: 3600000, day: 86400000, week: 604800000, month: 2592000000 };
    return new Date(Date.now() - n * (msMap[unit] || 0)).toISOString();
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

module.exports = async function handler(req, res) {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ error: 'q param required' });
  }

  const key = process.env.SCRAPEDOG_KEY;
  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const params = new URLSearchParams({ api_key: key, query: q, country: 'in', language: 'en' });

  try {
    const { status, body } = await httpsGet(`https://api.scrapingdog.com/google_news?${params}`);
    const data = JSON.parse(body);
    const raw = data.news_results || [];

    const articles = raw.map(a => ({
      title: a.title || '',
      description: a.snippet || null,
      url: a.url || '',
      image: null,
      publishedAt: parseLastUpdated(a.lastUpdated),
      source: { name: a.source || 'Unknown', url: '' },
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ articles });
  } catch (err) {
    return res.status(502).json({ error: 'upstream failed', detail: String(err) });
  }
};
