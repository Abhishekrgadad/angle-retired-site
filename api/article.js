const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

function post(hostname, path, headers, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url param required' });

  const scrapedogKey = process.env.SCRAPEDOG_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!scrapedogKey) return res.status(500).json({ error: 'SCRAPEDOG_KEY not configured' });

  try {
    // Step 1: Scrape the article
    const scrapeUrl = `https://api.scrapingdog.com/scrape?api_key=${scrapedogKey}&url=${encodeURIComponent(url)}&dynamic=false&markdown=true`;
    const { status: scrapeStatus, body: rawContent } = await get(scrapeUrl);

    if (scrapeStatus !== 200) {
      return res.status(502).json({ error: 'Failed to scrape article', detail: rawContent.slice(0, 200) });
    }

    // Clean and truncate content
    const content = rawContent.slice(0, 8000);

    // Step 2: Summarize with Claude
    let summary = null;
    if (anthropicKey) {
      const { status: aiStatus, body: aiBody } = await post(
        'api.anthropic.com',
        '/v1/messages',
        {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages: [{
            role: 'user',
            content: `You are a financial news summarizer for Indian investors. Read this article and write a concise summary in 4-5 bullet points. Each bullet should be one clear sentence covering key facts, numbers, and what it means for investors. Use simple English. Do not use asterisks for bullets — use "•" character.\n\nArticle:\n${content.slice(0, 4000)}`,
          }],
        }
      );

      if (aiStatus === 200) {
        const aiData = JSON.parse(aiBody);
        summary = aiData.content?.[0]?.text || null;
      }
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json({ summary, content });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch article', detail: String(err) });
  }
};
