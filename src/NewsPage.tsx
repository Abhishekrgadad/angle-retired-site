import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ExternalLink, Clock, Newspaper } from 'lucide-react';

const GNEWS_KEY = import.meta.env.VITE_GNEWS_KEY as string | undefined;
const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

interface Article {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
  titleKn?: string;
  descKn?: string;
  translating?: boolean;
}

const CATEGORIES = [
  { id: 'all',     kn: 'ಎಲ್ಲಾ',               q: 'India stock market finance investment economy' },
  { id: 'stocks',  kn: 'ಷೇರು ಮಾರುಕಟ್ಟೆ',     q: 'NSE BSE Nifty Sensex stocks India market' },
  { id: 'mf',      kn: 'ಮ್ಯೂಚುಯಲ್ ಫಂಡ್',      q: 'mutual funds SIP AMC AMFI India investment' },
  { id: 'fno',     kn: 'F&O',                   q: 'futures options F&O derivatives trading India' },
  { id: 'economy', kn: 'ಆರ್ಥಿಕತೆ',             q: 'India economy GDP inflation budget government' },
  { id: 'global',  kn: 'ಜಾಗತಿಕ ಮಾರುಕಟ್ಟೆ',    q: 'global markets Dow Jones Nasdaq gold commodity' },
  { id: 'rbi',     kn: 'RBI / ನೀತಿ',           q: 'RBI repo rate monetary policy India finance' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

async function translateKn(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return (data[0] as [string, string][]).map(([t]) => t).join('');
  } catch {
    return text;
  }
}

async function fetchGNews(q: string): Promise<Article[]> {
  const params = new URLSearchParams({
    q,
    lang: 'en',
    country: 'in',
    max: '12',
    sortby: 'publishedAt',
    apikey: GNEWS_KEY!,
  });
  const res = await fetch(`https://gnews.io/api/v4/search?${params}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[GNews] HTTP', res.status, body);
    throw new Error(`GNews ${res.status}: ${body}`);
  }
  const data = await res.json();
  console.log('[GNews] ok — articles:', data.articles?.length ?? 0, 'key present:', !!GNEWS_KEY);
  return (data.articles ?? []) as Article[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'ಈಗ ತಾನೇ';
  if (m < 60) return `${m} ನಿಮಿಷ ಹಿಂದೆ`;
  if (h < 24) return `${h} ಗಂಟೆ ಹಿಂದೆ`;
  return `${d} ದಿನ ಹಿಂದೆ`;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-pulse"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex justify-between mb-4">
        <div className="h-5 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-4 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="h-5 w-full rounded mb-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="h-5 w-4/5 rounded mb-5" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="flex flex-col gap-2 mb-5">
        {[1, 0.85, 0.7].map((w, i) => (
          <div key={i} className="h-4 rounded" style={{ background: 'rgba(255,255,255,0.04)', width: `${w * 100}%` }} />
        ))}
      </div>
      <div className="h-px mb-3" style={{ background: 'var(--border)' }} />
      <div className="h-4 w-28 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

function NewsCard({ article, idx }: { article: Article; idx: number }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noreferrer noopener"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.05, ease }}
      className="group flex flex-col gap-3 rounded-2xl p-5"
      style={{
        background: 'var(--surface)',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#1e293b',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
      }}
      whileHover={{
        y: -4,
        borderColor: 'rgba(245,158,11,0.3)',
        boxShadow: '0 8px 32px rgba(245,158,11,0.10), 0 2px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Source + timestamp */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
          {article.source.name}
        </span>
        <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted)' }}>
          <Clock className="w-3 h-3" />
          {timeAgo(article.publishedAt)}
        </span>
      </div>

      {/* Headline */}
      <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
        {article.titleKn || article.title}
        {article.translating && (
          <span className="ml-1.5 text-[9px] font-normal align-middle" style={{ color: 'var(--muted)', opacity: 0.6 }}>
            ಭಾಷಾಂತರ…
          </span>
        )}
      </h3>

      {/* Description */}
      {(article.descKn || article.description) && (
        <p className="text-xs sm:text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--muted)' }}>
          {article.descKn || article.description}
        </p>
      )}

      {/* Read more */}
      <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs font-semibold"
        style={{ borderTop: '1px solid var(--border)', color: '#f59e0b' }}>
        ಇನ್ನಷ್ಟು ಓದಿ
        <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.a>
  );
}

export default function NewsPage() {
  const [category, setCategory] = useState<CategoryId>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'no_key' | 'failed' | ''>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const reqId = useRef(0);
  const cache = useRef<Record<string, string>>({});

  const load = useCallback(async (catId: CategoryId) => {
    const id = ++reqId.current;
    setLoading(true);
    setError('');
    setArticles([]);

    if (!GNEWS_KEY) {
      setError('no_key');
      setLoading(false);
      return;
    }

    const cat = CATEGORIES.find(c => c.id === catId)!;
    try {
      console.log('[NewsPage] fetching category:', catId, '| key:', GNEWS_KEY ? GNEWS_KEY.slice(0,6) + '…' : 'MISSING');
      const raw = await fetchGNews(cat.q);
      if (id !== reqId.current) return;

      setLastUpdated(new Date());
      setArticles(raw.map(a => ({ ...a, translating: true })));
      setLoading(false);

      // Translate each card incrementally as translations arrive
      raw.forEach(async (a, i) => {
        const tk = `t:${a.title}`;
        const dk = `d:${a.description ?? ''}`;

        const [titleKn, descKn] = await Promise.all([
          cache.current[tk]
            ? Promise.resolve(cache.current[tk])
            : translateKn(a.title),
          a.description && !cache.current[dk]
            ? translateKn(a.description)
            : Promise.resolve(cache.current[dk] ?? ''),
        ]);

        if (id !== reqId.current) return;
        cache.current[tk] = titleKn;
        if (a.description) cache.current[dk] = descKn;

        setArticles(prev => {
          const next = [...prev];
          if (next[i]) next[i] = { ...next[i], titleKn, descKn, translating: false };
          return next;
        });
      });
    } catch (err) {
      console.error('[NewsPage] fetch failed:', err);
      if (id !== reqId.current) return;
      setError('failed');
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(category); }, [category, load]);

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--bg)' }}>

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] font-bold mb-2" style={{ color: '#f59e0b' }}>
              ಲೈವ್ ಸುದ್ದಿ
            </p>
            <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--text)' }}>
              ಹಣಕಾಸು ಸುದ್ದಿ
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              ಮಾರುಕಟ್ಟೆ, ಷೇರು, MF ಮತ್ತು ಆರ್ಥಿಕ ಸುದ್ದಿಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಓದಿ
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {lastUpdated && (
              <span className="text-xs hidden sm:block" style={{ color: 'var(--muted)' }}>
                {timeAgo(lastUpdated.toISOString())} ನವೀಕರಿಸಲಾಗಿದೆ
              </span>
            )}
            <motion.button
              onClick={() => load(category)}
              disabled={loading}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0a1322', border: 'none', padding: '0.5rem 1rem' }}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              ನವೀಕರಿಸಿ
            </motion.button>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="flex-shrink-0 rounded-full text-sm font-semibold transition-all duration-200"
                style={active ? {
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#0a1322',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                  border: 'none',
                  padding: '0.45rem 1rem',
                  ['--button-glow' as string]: 'rgba(245,158,11,0.45)',
                } : {
                  background: 'var(--surface)',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                  padding: '0.45rem 1rem',
                  ['--button-glow' as string]: 'rgba(245,158,11,0.35)',
                }}>
                {cat.kn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <AnimatePresence mode="wait">

          {loading && (
            <motion.div key="skel"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          )}

          {!loading && error === 'no_key' && (
            <motion.div key="nokey"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Newspaper className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
                  API ಕೀ ಸಂರಚಿಸಿ
                </h3>
                <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
                  ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು{' '}
                  <code className="font-mono" style={{ color: '#fbbf24' }}>.env</code>{' '}
                  ಫೈಲ್‌ನಲ್ಲಿ{' '}
                  <code className="font-mono" style={{ color: '#fbbf24' }}>VITE_GNEWS_KEY</code>{' '}
                  ಸೇರಿಸಿ
                </p>
                <p className="text-xs mt-3" style={{ color: 'var(--muted)', opacity: 0.55 }}>
                  gnews.io ನಲ್ಲಿ ಉಚಿತ API ಕೀ ಪಡೆಯಿರಿ
                </p>
              </div>
            </motion.div>
          )}

          {!loading && error === 'failed' && (
            <motion.div key="err"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                ಸುದ್ದಿ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.
              </p>
              <motion.button
                onClick={() => load(category)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="rounded-full text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0a1322', border: 'none', padding: '0.6rem 1.25rem' }}>
                ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ
              </motion.button>
            </motion.div>
          )}

          {!loading && !error && articles.length === 0 && (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center py-24">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಸುದ್ದಿ ಇಲ್ಲ.
              </p>
            </motion.div>
          )}

          {!loading && !error && articles.length > 0 && (
            <motion.div key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((a, i) => (
                <NewsCard key={a.url} article={a} idx={i} />
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
