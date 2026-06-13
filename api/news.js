const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const CACHE_TTL_HOURS = 2;

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

function sbHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };
}

async function getCached(query) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 3600000).toISOString();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/news_cache?query=eq.${encodeURIComponent(query)}&fetched_at=gte.${encodeURIComponent(cutoff)}&order=fetched_at.desc&limit=1`,
      { headers: sbHeaders() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0]?.articles ?? null;
  } catch { return null; }
}

async function saveCache(query, articles) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/news_cache?query=eq.${encodeURIComponent(query)}`,
      { method: 'DELETE', headers: sbHeaders() }
    );
    await fetch(`${SUPABASE_URL}/rest/v1/news_cache`, {
      method: 'POST',
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ query, articles, fetched_at: new Date().toISOString() }),
    });
  } catch { /* non-fatal */ }
}

module.exports = async function handler(req, res) {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'q param required' });

  // 1. Try Supabase cache first
  const cached = await getCached(q);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ articles: cached });
  }

  // 2. Cache miss — call ScrapeDog
  const key = process.env.SCRAPEDOG_KEY;
  if (!key) return res.status(500).json({ error: 'SCRAPEDOG_KEY not configured' });

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

    // 3. Save to Supabase (fire-and-forget)
    saveCache(q, articles);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(status).json({ articles });
  } catch (err) {
    return res.status(502).json({ error: 'upstream failed', detail: String(err) });
  }
};
