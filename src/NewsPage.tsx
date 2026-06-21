import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ExternalLink, Clock, X, Sparkles, Loader2 } from 'lucide-react';

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

// Module-level prefetch cache — populated before NewsPage mounts
const prefetchMap = new Map<string, Promise<Article[]>>();

export function prefetchCategory(q: string) {
  if (!prefetchMap.has(q)) {
    prefetchMap.set(q, fetchGNews(q).catch(() => []));
  }
}

// Module-level article detail cache — pre-warmed in background after news loads
const detailCache = new Map<string, Promise<ArticleDetail>>();

function getOrFetchDetail(url: string): Promise<ArticleDetail> {
  if (!detailCache.has(url)) {
    detailCache.set(
      url,
      fetchArticleDetail(url).catch(() => ({ summary: null, content: '' }))
    );
  }
  return detailCache.get(url)!;
}

function schedulePrefetches(articles: Article[]) {
  // Articles already in Supabase cache → instant, prefetch all immediately
  articles.filter(a => a.summary).forEach(a => getOrFetchDetail(a.url));
  // Articles without cache → stagger by 2s each to avoid hammering ScrapingDog/Gemini
  articles.filter(a => !a.summary).forEach((a, i) =>
    setTimeout(() => getOrFetchDetail(a.url), (i + 1) * 2000)
  );
}

// 5-minute client-side session cache for instant display on return visits
const SESSION_KEY = 'angel_news_v1';
const SESSION_TTL = 5 * 60 * 1000;

function getSessionCache(q: string): Article[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as Record<string, { ts: number; articles: Article[] }>;
    const entry = store[q];
    if (!entry || Date.now() - entry.ts > SESSION_TTL) return null;
    return entry.articles;
  } catch { return null; }
}

function setSessionCache(q: string, articles: Article[]) {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[q] = { ts: Date.now(), articles };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(store));
  } catch {}
}

interface Article {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
  summary?: string | null;
  titleKn?: string;
  descKn?: string;
  translating?: boolean;
}

interface ArticleDetail {
  summary: string | null;
  content: string;
}

const CATEGORIES = [
  { id: 'all',     kn: 'ಎಲ್ಲಾ',               q: 'India finance market' },
  { id: 'stocks',  kn: 'ಷೇರು ಮಾರುಕಟ್ಟೆ',     q: 'Nifty Sensex India' },
  { id: 'mf',      kn: 'ಮ್ಯೂಚುಯಲ್ ಫಂಡ್',      q: 'mutual funds India' },
  { id: 'fno',     kn: 'F&O',                   q: 'India derivatives trading' },
  { id: 'economy', kn: 'ಆರ್ಥಿಕತೆ',             q: 'India economy GDP' },
  { id: 'global',  kn: 'ಜಾಗತಿಕ ಮಾರುಕಟ್ಟೆ',    q: 'global markets gold' },
  { id: 'rbi',     kn: 'RBI / ನೀತಿ',           q: 'RBI India' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

// Detect if text is already predominantly Kannada (skip translation)
function isKannada(text: string): boolean {
  const knChars = (text.match(/[ಀ-೿]/g) || []).length;
  return knChars > text.length * 0.15;
}

async function translateChunk(text: string): Promise<string> {
  const res = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(text)}`
  );
  const data = await res.json();
  return (data[0] as [string, string][]).map(([t]) => t).join('');
}

async function translateKn(text: string): Promise<string> {
  if (isKannada(text)) return text; // already Kannada — no HTTP calls needed
  try {
    const lines = text.split('\n');
    const nonEmpty = lines.map((l, i) => ({ l, i, empty: !l.trim() }));
    const toTranslate = nonEmpty.filter(x => !x.empty).map(x => x.l);
    if (!toTranslate.length) return text;

    // Batch into chunks of 6 lines (2 calls max instead of 12)
    const BATCH = 6;
    const results: string[] = [];
    for (let i = 0; i < toTranslate.length; i += BATCH) {
      const batch = toTranslate.slice(i, i + BATCH).join('\n');
      const translated = await translateChunk(batch);
      results.push(...translated.split('\n'));
    }

    // Reconstruct with original empty lines
    let ri = 0;
    return lines.map(l => l.trim() ? (results[ri++] ?? l) : l).join('\n');
  } catch {
    return text;
  }
}

async function fetchGNews(q: string): Promise<Article[]> {
  const params = new URLSearchParams({ q });
  const res = await fetch(`/api/news?${params}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[news proxy] HTTP', res.status, body);
    throw new Error(`news ${res.status}`);
  }
  const data = await res.json();
  return (data.articles ?? []) as Article[];
}

async function fetchArticleDetail(url: string): Promise<ArticleDetail> {
  const params = new URLSearchParams({ url });
  const res = await fetch(`/api/article?${params}`);
  if (!res.ok) throw new Error(`article fetch ${res.status}`);
  return res.json();
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

// ── Article Modal ────────────────────────────────────────────────────────────

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const [detail, setDetail] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Server always returns Kannada summary — show directly, no client-side translation needed
  const displaySummary = detail?.summary ?? article.summary ?? null;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    // Use prefetch cache if already in-flight or resolved — avoids duplicate fetches
    getOrFetchDetail(article.url)
      .then(d => { if (!cancelled) { setDetail(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(String(e)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [article.url]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);


  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-3xl flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg)',
            border: '1px solid rgba(245,158,11,0.2)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            maxHeight: '92vh',
            height: '92vh',
          }}
        >
          {/* Sticky header */}
          <div className="flex items-start gap-3 p-5 pr-14 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 inline-block"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                {article.source.name}
              </span>
              <h2 className="font-bold text-base leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
                {article.titleKn || article.title}
              </h2>
            </div>
          </div>

          {/* Close button — perfectly circular, outside flex flow */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, boxShadow: '0 0 14px rgba(245,158,11,0.55)' }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'absolute',
              top: '13px',
              right: '13px',
              width: '32px',
              height: '32px',
              minWidth: '32px',
              minHeight: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              border: '2px solid rgba(255,255,255,0.25)',
              boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 20,
              padding: 0,
            }}
          >
            <X style={{ width: '15px', height: '15px', color: '#000', strokeWidth: 3, display: 'block', flexShrink: 0 }} />
          </motion.button>

          {/* Ghost source link — bottom-left, faded, reveals on hover */}
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer noopener"
            className="ghost-source-link"
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              color: 'var(--muted)',
              textDecoration: 'none',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              zIndex: 10,
              pointerEvents: 'auto',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.45')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            <ExternalLink style={{ width: '10px', height: '10px' }} />
            {article.source.name}
          </a>

          {/* Scrollable body — summary only */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(245,158,11,0.3) transparent' }}>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))', border: '1px solid rgba(245,158,11,0.25)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                  ಸಾರಾಂಶ
                </span>
              </div>
            </div>

            {displaySummary ? (
              <div className="rounded-xl p-5"
                style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <div className="text-[15px] leading-8 whitespace-pre-line" style={{ color: 'var(--text)' }}>
                  {displaySummary}
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: '#f59e0b' }} />
                <p className="text-sm" style={{ color: 'var(--muted)' }}>ಸಾರಾಂಶ ತಯಾರಿಸಲಾಗುತ್ತಿದೆ…</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ article, idx, onOpen }: { article: Article; idx: number; onOpen: () => void }) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(idx, 12) * 0.05, ease }}
      className="group flex flex-col gap-3 rounded-2xl p-5 cursor-pointer"
      style={{
        background: 'var(--surface)',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#1e293b',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        textDecoration: 'none',
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
        <Sparkles className="w-3 h-3" />
        ಸಾರಾಂಶ ನೋಡಿ
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [category, setCategory] = useState<CategoryId>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'failed' | ''>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const reqId = useRef(0);
  const cache = useRef<Record<string, string>>({});

  const load = useCallback(async (catId: CategoryId) => {
    const id = ++reqId.current;
    setError('');
    const cat = CATEGORIES.find(c => c.id === catId)!;

    function applyAndTranslate(raw: Article[]) {
      setSessionCache(cat.q, raw);
      setLastUpdated(new Date());
      setArticles(raw.map(a => ({ ...a, translating: true })));
      setLoading(false);

      // Pre-warm article detail cache in background so modal opens instantly
      schedulePrefetches(raw);

      raw.forEach(async (a, i) => {
        const tk = `t:${a.title}`;
        const dk = `d:${a.description ?? ''}`;
        const [titleKn, descKn] = await Promise.all([
          cache.current[tk] ? Promise.resolve(cache.current[tk]) : translateKn(a.title),
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
    }

    // 1. Session cache hit → show instantly, revalidate silently in background
    const sessionCached = getSessionCache(cat.q);
    if (sessionCached) {
      setArticles(sessionCached);
      setLoading(false);
      try {
        const fresh = await (prefetchMap.get(cat.q) ?? fetchGNews(cat.q));
        prefetchMap.delete(cat.q);
        if (id !== reqId.current) return;
        applyAndTranslate(fresh);
      } catch { /* keep showing cached */ }
      return;
    }

    // 2. No session cache → skeleton, but drain prefetch promise if already in-flight
    setLoading(true);
    setArticles([]);
    try {
      const raw = await (prefetchMap.get(cat.q) ?? fetchGNews(cat.q));
      prefetchMap.delete(cat.q);
      if (id !== reqId.current) return;
      applyAndTranslate(raw);
    } catch {
      if (id !== reqId.current) return;
      setError('failed');
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(category); }, [category, load]);

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--bg)' }}>

      {/* Article Modal */}
      {openArticle && (
        <ArticleModal
          article={openArticle}
          onClose={() => setOpenArticle(null)}
        />
      )}

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
              ಕಾರ್ಡ್ ಕ್ಲಿಕ್ ಮಾಡಿ — ಕನ್ನಡದಲ್ಲಿ ಸಾರಾಂಶ ನೋಡಿ
              {articles.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {articles.length} ಸುದ್ದಿಗಳು
                </span>
              )}
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
                } : {
                  background: 'var(--surface)',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                  padding: '0.45rem 1rem',
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
                <NewsCard
                  key={a.url}
                  article={a}
                  idx={i}
                  onOpen={() => setOpenArticle(a)}
                />
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
