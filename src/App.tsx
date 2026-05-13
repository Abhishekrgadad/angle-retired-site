import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Coins, Home, Heart, Plane, Shield, ArrowDown, Sparkles, Play, CheckCircle2, Calendar, Youtube, Star, ChevronDown, Phone, User, Zap, BarChart2, Menu, X } from 'lucide-react';

const HERO_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4';

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n));
const fmtC = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(2)} L` : `₹${Math.round(n)}`;
const tickFmt = (v: number) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${Math.round(v)}`;

function useChartTheme() {
  return true;
}

function makeChartColors(isDark: boolean) {
  return {
    grid:  isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)',
    axis:  isDark ? '#334155' : '#e2e8f0',
    tick:  isDark ? '#475569' : '#64748b',
    TT: {
      contentStyle: {
        backgroundColor: isDark ? '#050c18' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.1)'}`,
        borderRadius: '12px',
        fontSize: '12px',
        color: isDark ? '#f9fafb' : '#0f172a',
        boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 4px 20px rgba(15,23,42,0.12)',
      },
      formatter: (v: number) => fmtC(v),
      labelFormatter: (l: number) => `Age ${l}`,
    },
  };
}

const ease = [0.21, 0.47, 0.32, 0.98];

function FadeUp({ children, delay = 0, className = '' }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease }}>
      {children}
    </motion.div>
  );
}

function HeroOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
      <motion.div animate={{ y: [0, -28, 0], x: [0, 18, 0], scale: [1, 1.08, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', top: '-25%', left: '-12%', background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 68%)' }} />
      <motion.div animate={{ y: [0, 22, 0], x: [0, -18, 0], scale: [1, 0.92, 1] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '15%', right: '-8%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 68%)' }} />
      <motion.div animate={{ y: [0, -18, 0], scale: [1, 1.12, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', bottom: '8%', left: '28%', background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 68%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />
    </div>
  );
}

const CAROUSEL_SLIDES = [
  {
    type: 'stat' as const,
    badge: 'SIP Calculator',
    title: 'Will ₹5K/month fund your retirement?',
    highlight: '₹2.1 Crore',
    sub: 'corpus in 25 yrs with 10% annual step-up',
    color: '#f59e0b',
    icon: TrendingUp,
  },
  {
    type: 'stat' as const,
    badge: 'Lumpsum Plan',
    title: 'Put your savings to serious work.',
    highlight: '9.6×',
    sub: '₹10L lumpsum → ₹96L in 20 years at 12% p.a.',
    color: '#8b5cf6',
    icon: Coins,
  },
  {
    type: 'testimonial' as const,
    name: 'Rahul K.',
    role: 'Software Engineer, Bengaluru',
    quote: 'Started SIP at 22. The step-up calculator showed exactly how much to increase each year. Hit ₹1 Cr before I turned 40.',
    stars: 5,
  },
  {
    type: 'testimonial' as const,
    name: 'Meena S.',
    role: 'Doctor, Hyderabad',
    quote: 'The inflation calculator was a wake-up call — ₹40K today needs ₹1.8L at retirement. Doubled my SIP that same week.',
    stars: 5,
  },
  {
    type: 'testimonial' as const,
    name: 'Arjun V.',
    role: 'Teacher, Pune',
    quote: "20 years of flat SIP and I thought I was fine. The withdrawal chart showed I'd run out at 72. Fixed it in time.",
    stars: 5,
  },
];

function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const total = CAROUSEL_SLIDES.length;

  const go = (next: number) => {
    setDir(next > idx ? 1 : -1);
    setIdx((next + total) % total);
  };

  useEffect(() => {
    const t = setInterval(() => go((idx + 1) % total), 4500);
    return () => clearInterval(t);
  }, [idx]);

  const slide = CAROUSEL_SLIDES[idx];

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 300 }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.42, ease }}
            className="rounded-2xl p-7 flex flex-col gap-5"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid var(--card-border)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

            {slide.type === 'stat' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: `${slide.color}18`, color: slide.color, border: `1px solid ${slide.color}30` }}>
                    {slide.badge}
                  </span>
                  <slide.icon className="w-5 h-5" style={{ color: slide.color }} />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{slide.title}</p>
                <div>
                  <p className="text-5xl font-black leading-none" style={{ color: slide.color }}>{slide.highlight}</p>
                  <p className="text-slate-500 text-xs mt-2">{slide.sub}</p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--track-bg)' }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                    style={{ background: `linear-gradient(90deg, ${slide.color}99, ${slide.color})` }} />
                </div>
              </>
            )}

            {slide.type === 'testimonial' && (
              <>
                <div className="flex gap-0.5">
                  {[...Array(slide.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-200 text-sm leading-relaxed flex-1">"{slide.quote}"</p>
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--divider)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-slate-900 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                    {slide.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{slide.name}</p>
                    <p className="text-xs text-slate-500">{slide.role}</p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-1.5">
          {CAROUSEL_SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 20 : 6, height: 6,
                background: i === idx ? '#f59e0b' : 'rgba(255,255,255,0.15)',
              }} />
          ))}
        </div>
        <div className="flex gap-2">
          {[-1, 1].map(d => (
            <motion.button key={d} onClick={() => go(idx + d)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <ChevronDown className="w-4 h-4 text-slate-400" style={{ transform: `rotate(${d === -1 ? 90 : -90}deg)` }} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full px-4 sm:px-6 py-10 md:py-20">
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

function CalcHeroSection({ mode }: { mode: 'sip' | 'lumpsum' }) {
  const isSip = mode === 'sip';

  const cfg = isSip ? {
    badge: 'SIP Calculator',
    headline: 'Build Wealth.',
    headlineAccent: 'One Month at a Time.',
    sub: 'Systematic Investment Plans with step-up, real Indian inflation adjustment, and full retirement withdrawal simulation.',
    accent: '#f59e0b',
    orb1: 'rgba(245,158,11,0.13)',
    orb2: 'rgba(251,191,36,0.07)',
    Icon: TrendingUp,
    stats: [
      { label: 'Starting SIP',        value: '₹5,000',  note: 'per month' },
      { label: 'Corpus in 25 years',  value: '₹2.1 Cr', note: 'with 10% step-up at 12% p.a.', highlight: true },
      { label: 'Wealth multiplier',   value: '17.5×',   note: 'money grown' },
    ],
  } : {
    badge: 'Lumpsum Calculator',
    headline: 'One Decision.',
    headlineAccent: 'Decades of Returns.',
    sub: 'Deploy a lumpsum today with annual top-ups, compounded annually, and see exactly how it funds your retirement.',
    accent: '#8b5cf6',
    orb1: 'rgba(139,92,246,0.13)',
    orb2: 'rgba(167,139,250,0.07)',
    Icon: Coins,
    stats: [
      { label: 'Lumpsum deployed',   value: '₹10L',   note: 'one-time investment' },
      { label: 'Corpus in 20 years', value: '₹96L',   note: 'at 12% p.a. + top-ups', highlight: true },
      { label: 'Wealth multiplier',  value: '9.6×',   note: 'money grown' },
    ],
  };

  return (
    <section className="relative w-full overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient orbs */}
      <motion.div animate={{ y: [0, -22, 0], scale: [1, 1.1, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', top: '-25%', right: '-8%', pointerEvents: 'none',
          background: `radial-gradient(circle, ${cfg.orb1} 0%, transparent 68%)` }} />
      <motion.div animate={{ y: [0, 20, 0], scale: [1, 0.88, 1] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', bottom: '-15%', left: '-6%', pointerEvents: 'none',
          background: `radial-gradient(circle, ${cfg.orb2} 0%, transparent 68%)` }} />

      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}60, transparent)` }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

        {/* ── Left: text ── */}
        <div className="flex-1 lg:max-w-[540px] flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold self-start"
            style={{ background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}35`, color: cfg.accent }}>
            <cfg.Icon className="w-3.5 h-3.5" /> {cfg.badge}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease }}>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.12] tracking-tight">
              <span className="text-white">{cfg.headline}</span>
              <br />
              <span style={{
                background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accent}bb)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                display: 'inline-block',
              }}>
                {cfg.headlineAccent}
              </span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2, ease }}
            className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-[420px]">
            {cfg.sub}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35, ease }}
            className="flex items-center gap-2 text-xs text-slate-600">
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
              <ArrowDown className="w-3.5 h-3.5" style={{ color: cfg.accent }} />
            </motion.div>
            Scroll down to start calculating
          </motion.div>
        </div>

        {/* ── Right: stat cards ── */}
        <div className="flex-1 w-full lg:max-w-[400px] flex flex-col gap-3">
          {cfg.stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.2 + i * 0.1, ease }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="rounded-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden"
              style={{
                background: s.highlight ? `${cfg.accent}0d` : 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${s.highlight ? cfg.accent + '40' : 'var(--card-border)'}`,
                boxShadow: s.highlight ? `0 0 32px ${cfg.accent}14, 0 4px 20px rgba(0,0,0,0.25)` : '0 2px 16px rgba(0,0,0,0.18)',
              }}>
              {/* shimmer line on highlighted card */}
              {s.highlight && (
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}60, transparent)` }} />
              )}
              {/* color bar */}
              <div className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ background: cfg.accent, opacity: s.highlight ? 1 : 0.35, boxShadow: s.highlight ? `0 0 12px ${cfg.accent}` : 'none' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5 truncate">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-black leading-none tabular-nums"
                  style={{ color: s.highlight ? cfg.accent : '#f9fafb' }}>
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">{s.note}</p>
              </div>
              {s.highlight && (
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cfg.accent}20` }}>
                  <cfg.Icon className="w-4 h-4" style={{ color: cfg.accent }} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function AppHeader() {
  const links = [
    { to: '/', label: 'Home' },
    { to: '/sip', label: 'SIP Plan' },
    { to: '/lumpsum', label: 'Lumpsum Plan' },
  ];

  return (
    <motion.nav className="sticky top-0 z-40 w-full" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease }}
      style={{ borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px) saturate(160%)', background: 'var(--bg-soft)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Angel Investments" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="flex flex-col" style={{ paddingTop: '4px' }}>
            <p className="font-bold text-sm leading-none text-white tracking-wide">Angel Investments</p>
            <p className="text-[10px] text-amber-400 italic mt-1.5 leading-none">Learn to Earn</p>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }: { isActive: boolean }) => `text-sm font-medium transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <Link to="/sip" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-900"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
          <Phone className="w-3.5 h-3.5" /> Get Started
        </Link>
      </div>
    </motion.nav>
  );
}

function HomePage() {
  return (
    <section className="relative w-full px-6 pt-24 pb-20 text-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={HERO_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        style={{ filter: 'brightness(0.58) saturate(1.15)' }}
      />
      <div className="absolute inset-0 bg-slate-950/70" />
      <HeroOrbs />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-amber-300 mb-8"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}>
          <Sparkles className="w-3.5 h-3.5" /> Retirement Reality Check
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease }}
          className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 leading-tight tracking-tight"
          style={{ background: 'linear-gradient(135deg,#ffffff 30%,rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Will your money last<br />as long as you do?
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease }}
          className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          SIP or lumpsum — see if your retirement plan actually works. Adjusted for real Indian inflation, with withdrawal step-up. Takes 60 seconds.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease }}
          className="flex flex-wrap gap-4 justify-center mb-14">
          <Link to="/sip" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-slate-900 text-sm"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 32px rgba(245,158,11,0.4)' }}>
            <Play className="w-4 h-4 fill-current" /> Check SIP Plan
          </Link>
          <Link to="/lumpsum" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-emerald-300 text-sm"
            style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)' }}>
            <Phone className="w-4 h-4" /> View Lumpsum Plan
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function GlassCard({ children, className = '', glow = '' }: any) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid var(--card-border)',
        boxShadow: `0 4px 32px var(--shadow), inset 0 1px 0 var(--surface-strong)${glow ? `, 0 0 60px ${glow}` : ''}`,
      }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--card-shimmer), transparent)' }} />
      {children}
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step, suffix = '', prefix = '', format }: any) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
        <motion.span key={String(value)} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="text-xs font-bold text-amber-300 tabular-nums">
          {prefix}{format ? format(value) : value}{suffix}
        </motion.span>
      </div>
      <div className="relative h-1.5 rounded-full" style={{ background: 'var(--track-bg)' }}>
        <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-75"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#b45309,#f59e0b)', boxShadow: '0 0 8px rgba(245,158,11,0.4)' }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0" style={{ height: '100%', zIndex: 2 }} />
      </div>
    </div>
  );
}

function KPI({ icon, label, value, sub, color = 'slate' }: any) {
  const styles: any = { amber: 'border-amber-500/20 bg-amber-500/5', sky: 'border-sky-500/20 bg-sky-500/5', emerald: 'border-emerald-500/20 bg-emerald-500/5', rose: 'border-rose-500/20 bg-rose-500/5', violet: 'border-violet-500/20 bg-violet-500/5', slate: 'border-white/5 bg-white/[0.02]' };
  const ic: any = { amber: 'text-amber-400', sky: 'text-sky-400', emerald: 'text-emerald-400', rose: 'text-rose-400', violet: 'text-violet-400', slate: 'text-slate-400' };
  const glow: any = { amber: 'rgba(245,158,11,0.12)', sky: 'rgba(14,165,233,0.12)', emerald: 'rgba(16,185,129,0.12)', rose: 'rgba(239,68,68,0.12)', violet: 'rgba(139,92,246,0.12)', slate: 'transparent' };
  return (
    <motion.div className={`rounded-2xl border p-6 relative overflow-hidden ${styles[color]}`}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      whileHover={{ scale: 1.025, y: -3 }} transition={{ type: 'spring', stiffness: 360, damping: 28 }}>
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glow[color]}, transparent 70%)` }} />
      <div className={`mb-3 ${ic[color]}`}>{icon}</div>
      <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className="text-3xl font-black text-white leading-tight">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </motion.div>
  );
}

function SectionHeader({ n, title, sub }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} className="flex items-start gap-4 mb-8"
      initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease }}>
      <span className="text-6xl font-black leading-none select-none" style={{ color: 'var(--num-ghost)' }}>{n}</span>
      <div className="pt-1">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

function ChartCard({ title, children }: any) {
  return (
    <FadeUp>
      <GlassCard className="p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">{title}</p>
        {children}
      </GlassCard>
    </FadeUp>
  );
}

function ExpenseRow({ icon, label, value, total, color, onChange }: any) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(value));
  const commit = () => { onChange(parseInt(raw) || 0); setEditing(false); };
  const pct = Math.min(value / total * 100, 100);
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2 text-sm text-slate-300">{icon}<span>{label}</span></div>
        {editing
          ? <div className="flex items-center gap-1"><span className="text-xs text-slate-400">₹</span>
            <input autoFocus type="number" value={raw} onChange={e => setRaw(e.target.value)}
              onBlur={commit} onKeyDown={(e: any) => (e.key === 'Enter' || e.key === 'Escape') && commit()}
              className="w-28 rounded px-2 py-0.5 text-sm text-right focus:outline-none border border-amber-500"
              style={{ background: 'var(--input-bg)', color: 'var(--text)' }} /></div>
          : <button onClick={() => { setRaw(String(value)); setEditing(true); }} className="flex items-center gap-1.5 group/btn">
            <span className="text-sm font-semibold">₹{fmt(value)}</span>
            <span className="text-xs text-slate-600 group-hover/btn:text-amber-400 transition">✏</span>
          </button>}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--track-bg)' }}>
        <motion.div className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ boxShadow: '0 0 8px currentColor' }} />
      </div>
    </div>
  );
}

function ExpensePanel({ infExp, customExp, setCustomExp, years }: any) {
  const upd = (k: string, v: number) => setCustomExp((p: any) => ({ ...(p || { food: infExp.food, util: infExp.util, health: infExp.health, leisure: infExp.leisure, buf: infExp.buf }), [k]: v }));
  return (
    <GlassCard className="p-6 flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">Monthly expenses in {years} yrs (8% inflation)</p>
        <p className="text-xs text-slate-600 mt-0.5">Tap any amount to edit ✏</p>
      </div>
      <div className="flex flex-col gap-3">
        <ExpenseRow icon={<Coins className="w-4 h-4" />} label="Food & Groceries" value={infExp.food} total={infExp.total} color="bg-emerald-500" onChange={(v: number) => upd('food', v)} />
        <ExpenseRow icon={<Home className="w-4 h-4" />} label="Utilities & Housing" value={infExp.util} total={infExp.total} color="bg-sky-500" onChange={(v: number) => upd('util', v)} />
        <ExpenseRow icon={<Heart className="w-4 h-4" />} label="Healthcare (10% inflation)" value={infExp.health} total={infExp.total} color="bg-rose-500" onChange={(v: number) => upd('health', v)} />
        <ExpenseRow icon={<Plane className="w-4 h-4" />} label="Leisure & Travel" value={infExp.leisure} total={infExp.total} color="bg-violet-500" onChange={(v: number) => upd('leisure', v)} />
        <ExpenseRow icon={<Shield className="w-4 h-4" />} label="Emergency Buffer" value={infExp.buf} total={infExp.total} color="bg-amber-500" onChange={(v: number) => upd('buf', v)} />
      </div>
      <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="font-semibold text-white">Total Monthly Need</span>
        <div className="text-right">
          <span className="text-xl font-black text-white">₹{fmt(infExp.total)}</span>
          {customExp && <button onClick={() => setCustomExp(null)} className="block text-xs text-slate-500 hover:text-amber-400 mt-0.5 transition">↺ reset to auto</button>}
        </div>
      </div>
    </GlassCard>
  );
}

function FormField({ icon, label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">{icon}{label}</label>
      <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-xl px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none transition"
        style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', outline: 'none', color: 'var(--text)' }}
        onFocus={e => { e.target.style.border = '1px solid rgba(245,158,11,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.09)'; }}
        onBlur={e => { e.target.style.border = '1px solid var(--input-border)'; e.target.style.boxShadow = 'none'; }} />
    </div>
  );
}

function ConsultImageCard() {
  const stats = [
    { n: '10,000+', l: 'Investors Consulted', color: '#f59e0b', dur: 3.6 },
    { n: '5L+',     l: 'YouTube Subscribers', color: '#ef4444', dur: 4.3 },
    { n: '100%',    l: 'SEBI Regulated Products', color: '#10b981', dur: 3.9 },
    { n: '24 hr',   l: 'Callback Guarantee',  color: '#8b5cf6', dur: 4.7 },
  ];
  return (
    <div className="relative rounded-3xl overflow-hidden h-full flex flex-col"
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(28px) saturate(160%)',
        border: '1px solid var(--card-border)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        minHeight: 480,
      }}>

      {/* Animated ambient orbs */}
      <motion.div animate={{ y: [0, -24, 0], scale: [1, 1.12, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', top: '-15%', right: '-12%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(245,158,11,0.13) 0%, transparent 68%)' }} />
      <motion.div animate={{ y: [0, 20, 0], scale: [1, 0.88, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', bottom: '5%', left: '-10%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 68%)' }} />
      <motion.div animate={{ y: [0, -14, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', bottom: '30%', right: '5%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 68%)' }} />

      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Content */}
      <div className="relative z-10 p-7 flex flex-col gap-7 flex-1">

        {/* Logo block */}
        <div className="flex flex-col items-center text-center pt-2">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(245,158,11,0.18)', '0 0 50px rgba(245,158,11,0.38)', '0 0 20px rgba(245,158,11,0.18)'] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl p-3 mb-4 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <img src="/logo.png" alt="Angel Investments" className="w-16 h-16 object-contain" />
          </motion.div>
          <p className="font-black text-lg text-white tracking-wide">Angel Investments</p>
          <p className="text-amber-400 text-xs italic mt-1">Learn to Earn</p>
        </div>

        {/* Floating stat pills */}
        <div className="flex flex-col gap-3">
          {stats.map((s, i) => (
            <motion.div key={s.n}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              className="flex items-center gap-4 rounded-xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                boxShadow: `0 2px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}>
              <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}80` }} />
              <span className="text-xl font-black leading-none" style={{ color: s.color }}>{s.n}</span>
              <span className="text-sm text-slate-400 leading-tight">{s.l}</span>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="mt-auto rounded-2xl p-4"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.14)' }}>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            "Plain language, no jargon, no pressure — just a clear plan built around <strong className="text-amber-300 not-italic">your numbers.</strong>"
          </p>
        </div>
      </div>
    </div>
  );
}

function showCallToast() {
  const el = document.getElementById('call-toast');
  if (el) { el.style.display = 'flex'; setTimeout(() => { el.style.display = 'none'; }, 3000); }
}

function WithdrawalPanel({ exp, yrs, wd, wMode, setWMode, cW, setCW, wInflationOn, setWInflationOn, wInflation, setWInflation }: any) {
  return (
    <GlassCard className="p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Starting monthly withdrawal at retirement</p>
          <p className="text-3xl font-black text-white">₹{fmt(wd.mw)}<span className="text-sm font-normal text-slate-400">/month</span></p>
          <p className="text-xs text-slate-500 mt-1">₹{fmt(exp)}/month today × 8% inflation × {yrs} years</p>
        </div>
        <motion.button onClick={() => { setWMode(wMode === 'custom' ? 'auto' : 'custom'); if (wMode === 'auto' && cW === null) setCW(wd.suggestedW); }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className={`self-start sm:self-auto flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold border transition ${wMode === 'custom' ? 'text-amber-300' : 'text-slate-400 hover:text-amber-400'}`}
          style={wMode === 'custom' ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' } : { border: '1px solid var(--border)' }}>
          {wMode === 'custom' ? '✓ Manual amount' : '✏ Change amount'}
        </motion.button>
      </div>
      <AnimatePresence>
        {wMode === 'custom' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }} className="mb-5 pb-5 overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
            <Slider label="Your starting monthly withdrawal" value={cW || wd.suggestedW} onChange={setCW}
              min={10000} max={Math.max(Math.round(wd.suggestedW * 3), 500000)} step={5000} prefix="₹" format={fmt} />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((m: number) => (
                <motion.button key={m} onClick={() => setCW(Math.round(wd.suggestedW * m))}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-2 py-1 text-[11px] rounded-lg text-slate-400 hover:text-amber-300 transition"
                  style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                  {m}x · ₹{fmt(Math.round(wd.suggestedW * m))}
                </motion.button>
              ))}
            </div>
            <button onClick={() => { setWMode('auto'); setCW(null); }} className="mt-3 text-xs text-slate-500 hover:text-amber-400 transition">↺ Reset to inflation-calculated amount</button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">Annual withdrawal step-up</p>
            <p className="text-xs text-slate-400 mt-1">{wInflationOn ? `Withdrawal increases ${wInflation}% every year — because inflation doesn't stop when you retire.` : 'OFF — same fixed amount every month.'}</p>
          </div>
          <motion.button onClick={() => setWInflationOn(!wInflationOn)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold border transition whitespace-nowrap ${wInflationOn ? 'text-indigo-300' : 'text-slate-300 hover:text-indigo-300'}`}
            style={wInflationOn ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)' } : { background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
            {wInflationOn ? '✓ Step-up ON' : 'Step-up OFF'}
          </motion.button>
        </div>
        <AnimatePresence>
          {wInflationOn && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }} className="mt-4 pt-4 overflow-hidden" style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              <Slider label="Annual increase in withdrawal" value={wInflation} onChange={setWInflation} min={3} max={10} step={0.5} suffix="%" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

function SIPVerdict({ wd, ryr, age, yrs, sip, su, ret, stepOn, pret, inflationNeed, wInflation, wInflationOn }: any) {
  const extraSIP = useMemo(() => {
    if (!wd.dep) return 0;
    const mr = pret / 100 / 12;
    let lo = 0, hi = 1000000, result = 0;
    for (let iter = 0; iter < 30; iter++) {
      const mid = Math.round((lo + hi) / 2);
      const mr2 = ret / 100 / 12;
      let c = 0, cs = sip + mid;
      for (let y = 0; y < yrs; y++) { for (let m = 0; m < 12; m++) c = (c + cs) * (1 + mr2); cs *= (1 + su / 100); }
      if (!stepOn) { c = 0; cs = sip + mid; for (let y = 0; y < yrs; y++) { for (let m = 0; m < 12; m++) c = (c + (sip + mid)) * (1 + mr2); } }
      let cur = c; let dep = null;
      for (let yi = 0; yi < ryr; yi++) {
        const w = wInflationOn ? Math.round(inflationNeed * Math.pow(1 + wInflation / 100, yi)) : inflationNeed;
        for (let m = 0; m < 12; m++) { cur = cur * (1 + mr) - w; if (cur <= 0 && !dep) { dep = true; cur = 0; } }
      }
      if (!dep) { result = mid; hi = mid; } else { lo = mid + 1; }
    }
    return result;
  }, [wd.dep, pret, age, yrs, ryr, sip, su, ret, stepOn, inflationNeed, wInflationOn, wInflation]);

  const yearsLast = wd.dep ? wd.dep - (age + yrs) : ryr;
  const shortfall = ryr - yearsLast;

  if (!wd.dep) return (
    <FadeUp>
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 0 40px rgba(16,185,129,0.05)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400 mb-1">Your SIP is on track</p>
            <p className="text-lg font-black text-white mb-1">Corpus lasts the full {ryr} years of retirement</p>
            <p className="text-sm text-slate-400">Your current SIP is sufficient to fund your retirement even with {wInflationOn ? `${wInflation}% annual withdrawal increases` : 'flat withdrawals'}.</p>
            {wd.bal > 1000000 && <p className="text-sm text-emerald-400 mt-2 font-semibold">Bonus: ₹{fmt(wd.bal)} legacy left for your family.</p>}
          </div>
        </div>
      </div>
    </FadeUp>
  );

  if (shortfall <= 5) return (
    <FadeUp>
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 0 40px rgba(245,158,11,0.05)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(245,158,11,0.15)' }}>⚠️</div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-amber-400 mb-1">Your SIP is close — needs a small boost</p>
            <p className="text-lg font-black text-white mb-1">Only {yearsLast} of {ryr} retirement years funded</p>
            <p className="text-sm text-slate-400 mb-4">A small SIP increase now will secure the remaining {shortfall} years.</p>
            <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs text-slate-400 mb-1">Recommended SIP increase</p>
              <p className="text-2xl font-black text-amber-300">+₹{fmt(extraSIP)}<span className="text-sm font-normal text-slate-400">/month</span></p>
              <p className="text-xs text-slate-500 mt-1">₹{fmt(sip)}/mo → ₹{fmt(sip + extraSIP)}/mo</p>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );

  return (
    <FadeUp>
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 0 40px rgba(239,68,68,0.05)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(239,68,68,0.15)' }}>🚨</div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-rose-400 mb-1">Your SIP needs an increase</p>
            <p className="text-lg font-black text-white mb-1">Corpus runs out at age {wd.dep} — only {yearsLast} of {ryr} retirement years funded</p>
            <p className="text-sm text-slate-400 mb-4">Your money lasts {yearsLast} years into retirement but runs out {shortfall} years before the end.</p>
            <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs text-slate-400 mb-1">To secure full {ryr} years — increase SIP by</p>
              <p className="text-3xl font-black text-rose-300">+₹{fmt(extraSIP)}<span className="text-sm font-normal text-slate-400">/month</span></p>
              <p className="text-xs text-slate-500 mt-1">₹{fmt(sip)}/mo → ₹{fmt(sip + extraSIP)}/mo</p>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

function LSVerdict({ wd, ryr, age, yrs, ls, tu, tuOn, ret, pret, inflationNeed, wInflation, wInflationOn }: any) {
  const yearsLast = wd.dep ? wd.dep - (age + yrs) : ryr;
  const shortfall = ryr - yearsLast;

  const extraLS = useMemo(() => {
    if (!wd.dep) return 0;
    const mr = pret / 100 / 12;
    let lo = 0, hi = 200000000, result = 0;
    for (let iter = 0; iter < 40; iter++) {
      const mid = Math.round((lo + hi) / 2);
      const r = ret / 100;
      let c = ls + mid;
      for (let y = 0; y < yrs; y++) { c = c * (1 + r) + (tuOn ? tu : 0); }
      let cur = c; let dep = null;
      for (let yi = 0; yi < ryr; yi++) {
        const w = wInflationOn ? Math.round(inflationNeed * Math.pow(1 + wInflation / 100, yi)) : inflationNeed;
        for (let m = 0; m < 12; m++) { cur = cur * (1 + mr) - w; if (cur <= 0 && !dep) { dep = true; cur = 0; } }
      }
      if (!dep) { result = mid; hi = mid; } else { lo = mid + 1; }
    }
    return result;
  }, [wd.dep, pret, yrs, ryr, ls, tu, tuOn, ret, inflationNeed, wInflationOn, wInflation]);

  const extraTU = useMemo(() => {
    if (!wd.dep) return 0;
    const mr = pret / 100 / 12;
    let lo = 0, hi = 10000000, result = 0;
    for (let iter = 0; iter < 40; iter++) {
      const mid = Math.round((lo + hi) / 2);
      const r = ret / 100;
      let c = ls;
      for (let y = 0; y < yrs; y++) { c = c * (1 + r) + tu + mid; }
      let cur = c; let dep = null;
      for (let yi = 0; yi < ryr; yi++) {
        const w = wInflationOn ? Math.round(inflationNeed * Math.pow(1 + wInflation / 100, yi)) : inflationNeed;
        for (let m = 0; m < 12; m++) { cur = cur * (1 + mr) - w; if (cur <= 0 && !dep) { dep = true; cur = 0; } }
      }
      if (!dep) { result = mid; hi = mid; } else { lo = mid + 1; }
    }
    return result;
  }, [wd.dep, pret, yrs, ryr, ls, tu, ret, inflationNeed, wInflationOn, wInflation]);

  if (!wd.dep) return (
    <FadeUp>
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 0 40px rgba(16,185,129,0.05)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-400 mb-1">Your lumpsum is on track</p>
            <p className="text-lg font-black text-white mb-1">Corpus lasts the full {ryr} years of retirement</p>
            <p className="text-sm text-slate-400">Your lumpsum is sufficient to fund retirement even with {wInflationOn ? `${wInflation}% annual withdrawal increases` : 'flat withdrawals'}.</p>
            {wd.bal > 1000000 && <p className="text-sm text-emerald-400 mt-2 font-semibold">Bonus: ₹{fmt(wd.bal)} legacy left for your family after {ryr} years.</p>}
          </div>
        </div>
      </div>
    </FadeUp>
  );

  if (shortfall <= 5) return (
    <FadeUp>
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(245,158,11,0.15)' }}>⚠️</div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-amber-400 mb-1">Your lumpsum is close — needs a small boost</p>
            <p className="text-lg font-black text-white mb-1">Corpus runs out at age {wd.dep} — only {yearsLast} of {ryr} retirement years funded</p>
            <p className="text-sm text-slate-400 mb-4">A small increase will secure the remaining {shortfall} years.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs text-slate-400 mb-1">Option 1 — Increase lumpsum by</p>
                <p className="text-2xl font-black text-amber-300">+{fmtC(extraLS)}</p>
                <p className="text-xs text-slate-500 mt-1">{fmtC(ls)} → {fmtC(ls + extraLS)}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs text-slate-400 mb-1">Option 2 — Increase annual top-up by</p>
                <p className="text-2xl font-black text-amber-300">+{fmtC(extraTU)}/yr</p>
                <p className="text-xs text-slate-500 mt-1">{fmtC(tu)}/yr → {fmtC(tu + extraTU)}/yr</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );

  return (
    <FadeUp>
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(239,68,68,0.15)' }}>🚨</div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-rose-400 mb-1">Your lumpsum needs an increase</p>
            <p className="text-lg font-black text-white mb-1">Corpus runs out at age {wd.dep} — only {yearsLast} of {ryr} retirement years funded</p>
            <p className="text-sm text-slate-400 mb-4">Your money lasts {yearsLast} years into retirement but runs out {shortfall} years before the end. You have two ways to fix this:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-xs text-slate-400 mb-1">Option 1 — Increase lumpsum by</p>
                <p className="text-2xl font-black text-rose-300">+{fmtC(extraLS)}</p>
                <p className="text-xs text-slate-500 mt-1">{fmtC(ls)} → {fmtC(ls + extraLS)} one-time</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-xs text-slate-400 mb-1">Option 2 — Increase annual top-up by</p>
                <p className="text-2xl font-black text-rose-300">+{fmtC(extraTU)}/yr</p>
                <p className="text-xs text-slate-500 mt-1">{fmtC(tu)}/yr → {fmtC(tu + extraTU)}/yr top-up</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

function SIPCalc({ exp, setExp }: any) {
  const [sip, setSip] = useState(5000), [su, setSu] = useState(10), [ret, setRet] = useState(12), [yrs, setYrs] = useState(25), [age, setAge] = useState(18), [pret, setPret] = useState(8), [ryr, setRyr] = useState(50);
  const [stepOn, setStepOn] = useState(true), [cmp, setCmp] = useState(false);
  const [wMode, setWMode] = useState('auto'), [cW, setCW] = useState<number | null>(null);
  const [wInflationOn, setWInflationOn] = useState(true), [wInflation, setWInflation] = useState(6);
  const [cExp, setCExp] = useState<any>(null);
  const INF = 8, HINF = 10;
  const C = makeChartColors(useChartTheme());

  const acc = useMemo(() => {
    let c = 0, ns = 0, cs = sip; const mr = ret / 100 / 12;
    return Array.from({ length: yrs }, (_, i) => {
      for (let m = 0; m < 12; m++) { c = (c + cs) * (1 + mr); ns = (ns + sip) * (1 + mr); }
      const row = { age: age + i + 1, corpus: Math.round(c), ns: Math.round(ns), yc: Math.round(cs * 12), yr: Math.round(c * ret / 100) };
      cs *= (1 + su / 100); return row;
    });
  }, [sip, su, ret, yrs, age]);

  const fc = acc[acc.length - 1]?.corpus || 0, fns = acc[acc.length - 1]?.ns || 0;
  const magic = acc.find(d => d.yr > d.yc);
  const ti = useMemo(() => { let t = 0, c = sip; for (let y = 0; y < yrs; y++) { t += c * 12; c *= (1 + su / 100); } return t; }, [sip, su, yrs]);
  const inflationNeed = useMemo(() => Math.round(exp * Math.pow(1 + INF / 100, yrs)), [exp, yrs]);

  const wd = useMemo(() => {
    let c = stepOn ? fc : fns; const mr = pret / 100 / 12;
    const suggestedW = inflationNeed;
    const startW = wMode === 'custom' && cW !== null ? cW : suggestedW;
    let cur = c; let dep: number | null = null;
    const data = Array.from({ length: ryr }, (_, yi) => {
      const thisYearW = wInflationOn ? Math.round(startW * Math.pow(1 + wInflation / 100, yi)) : startW;
      for (let m = 0; m < 12; m++) { cur = cur * (1 + mr) - thisYearW; if (cur <= 0 && !dep) { dep = age + yrs + yi + 1; cur = 0; } }
      return { age: age + yrs + yi + 1, corpus: Math.max(0, Math.round(cur)), monthlyW: thisYearW };
    });
    return { data, mw: Math.round(startW), suggestedW, dep, bal: Math.max(0, Math.round(cur)), finalMonthlyW: data[data.length - 1]?.monthlyW || startW };
  }, [fc, fns, pret, ryr, yrs, age, stepOn, wMode, cW, inflationNeed, wInflationOn, wInflation]);

  const jrn = useMemo(() => [...acc.map(d => ({ age: d.age, value: d.corpus })), ...wd.data.map(d => ({ age: d.age, value: d.corpus }))], [acc, wd]);
  const aExp = useMemo(() => { const m = Math.pow(1 + INF / 100, yrs), h = Math.pow(1 + HINF / 100, yrs); return { food: Math.round(exp * 0.35 * m), util: Math.round(exp * 0.15 * m), health: Math.round(exp * 0.10 * h), leisure: Math.round(exp * 0.25 * m), buf: Math.round(exp * 0.15 * m) }; }, [exp, yrs]);
  const iExp = useMemo(() => { const e = cExp ? { ...aExp, ...cExp } : aExp; return { ...e, total: e.food + e.util + e.health + e.leisure + e.buf }; }, [aExp, cExp]);
  const retireAge = age + yrs;
  const sR = (wd.mw - iExp.total) / iExp.total;
  const V = wd.dep ? { t: 'Plan at Risk', c: 'text-rose-400', b: 'border-rose-500/30 bg-rose-500/5', d: `Corpus runs out at age ${wd.dep}. Your SIP needs to increase.` }
    : sR > 0.5 ? { t: 'Luxurious Retirement', c: 'text-emerald-400', b: 'border-emerald-500/30 bg-emerald-500/5', d: 'Travel, hobbies, gifting — all covered with comfort.' }
      : sR > 0.15 ? { t: 'Peaceful Retirement', c: 'text-sky-400', b: 'border-sky-500/30 bg-sky-500/5', d: 'Comfortable lifestyle with breathing room for emergencies.' }
        : sR > -0.1 ? { t: 'Tight but Manageable', c: 'text-amber-400', b: 'border-amber-500/30 bg-amber-500/5', d: 'Basic needs met — but no room for surprises.' }
          : { t: 'Stretched Thin', c: 'text-rose-400', b: 'border-rose-500/30 bg-rose-500/5', d: 'Lifestyle downgrade likely. Consider increasing SIP.' };

  const cd = useMemo(() => {
    if (!cmp) return [];
    const calc = (d: number) => { let c = 0, cs = sip; const mr = ret / 100 / 12; for (let y = 0; y < yrs - d; y++) { for (let m = 0; m < 12; m++)c = (c + cs) * (1 + mr); cs *= (1 + su / 100); } return Math.round(c); };
    return [{ l: `Start at ${age}`, v: calc(0) }, { l: `Start at ${age + 10}`, v: calc(10) }];
  }, [cmp, sip, su, ret, yrs, age]);

  return (
    <div className="space-y-14">
      <FadeUp>
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Slider label="Monthly SIP" value={sip} onChange={setSip} min={1000} max={1000000} step={1000} prefix="₹" format={fmt} />
            <Slider label="Annual Step-up" value={su} onChange={setSu} min={0} max={20} step={1} suffix="%" />
            <Slider label="Expected Returns" value={ret} onChange={setRet} min={8} max={15} step={0.5} suffix="%" />
            <Slider label="Invest Years" value={yrs} onChange={setYrs} min={10} max={35} step={1} suffix=" yrs" />
            <Slider label="Starting Age" value={age} onChange={setAge} min={18} max={45} step={1} suffix=" yrs" />
            <Slider label="Post-Ret Returns" value={pret} onChange={setPret} min={5} max={10} step={0.5} suffix="%" />
            <Slider label="Retirement Yrs" value={ryr} onChange={setRyr} min={15} max={60} step={1} suffix=" yrs" />
            <Slider label="Monthly Expenses Now" value={exp} onChange={setExp} min={10000} max={300000} step={5000} prefix="₹" format={fmt} />
          </div>
          <div className="mt-5 pt-5 flex flex-wrap gap-3" style={{ borderTop: '1px solid var(--border)' }}>
            <motion.button onClick={() => setStepOn(!stepOn)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className={`px-4 py-2 rounded-lg text-sm border transition ${stepOn ? 'text-amber-300' : 'text-slate-500'}`}
              style={stepOn ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' } : { border: '1px solid var(--border)' }}>
              {stepOn ? '✓ Step-up ON' : 'Step-up OFF'}
            </motion.button>
            <motion.button onClick={() => setCmp(!cmp)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className={`px-4 py-2 rounded-lg text-sm border transition ${cmp ? 'text-sky-300' : 'text-slate-500'}`}
              style={cmp ? { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)' } : { border: '1px solid var(--border)' }}>
              {cmp ? '✓ Comparing Start Age' : 'Compare: Start 10 yrs late'}
            </motion.button>
          </div>
          <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <span className="text-amber-200/60">💡 ₹{fmt(exp)}/month today → </span><strong className="text-amber-300">₹{fmt(inflationNeed)}/month</strong><span className="text-amber-200/60"> in {yrs} years at 8% inflation</span>
          </div>
        </GlassCard>
      </FadeUp>

      <div>
        <SectionHeader n="01" title="The Seed" sub="Your money compounding quietly for decades" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <KPI icon={<Coins className="w-5 h-5" />} label="You invest" value={fmtC(ti)} sub={`Over ${yrs} years`} />
          <KPI icon={<TrendingUp className="w-5 h-5" />} label="Corpus at retirement" value={fmtC(stepOn ? fc : fns)} sub={`Age ${age + yrs}`} color="amber" />
          <KPI icon={<Sparkles className="w-5 h-5" />} label="Wealth multiplier" value={`${((stepOn ? fc : fns) / ti).toFixed(1)}x`} sub="money grown" color="emerald" />
        </div>
        <AnimatePresence>
          {magic && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="mb-6 rounded-xl px-5 py-4" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245,158,11,0.05)' }}>
              <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Magic Year</p>
              <p className="text-slate-200">At <strong className="text-amber-300">age {magic.age}</strong> your returns ({fmtC(magic.yr)}) beat contributions ({fmtC(magic.yc)}). Compounding takes over.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <ChartCard title="Corpus growth — the hockey stick">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={acc}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#475569" stopOpacity={0.25} /><stop offset="95%" stopColor="#475569" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="age" stroke={C.axis} tick={{ fontSize: 11, fill: C.tick }} />
              <YAxis stroke={C.axis} tickFormatter={tickFmt} tick={{ fontSize: 11, fill: C.tick }} width={52} />
              <Tooltip {...C.TT} />
              {magic && <ReferenceLine x={magic.age} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Magic Year', fill: '#f59e0b', fontSize: 11 }} />}
              <Area type="monotone" dataKey="ns" stroke={C.axis} strokeWidth={1.5} fill="url(#g2)" name="Flat SIP" />
              <Area type="monotone" dataKey="corpus" stroke="#f59e0b" strokeWidth={2.5} fill="url(#g1)" name="With step-up" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-5 mt-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span>With {su}% step-up: {fmtC(fc)}</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500" /><span className="text-slate-400">Flat: {fmtC(fns)}</span></div>
            <span className="ml-auto text-emerald-400 font-semibold">+{fmtC(fc - fns)} from step-up</span>
          </div>
        </ChartCard>
        <AnimatePresence>
          {cmp && cd.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="mt-5 rounded-2xl p-6" style={{ border: '1px solid rgba(14,165,233,0.15)', background: 'rgba(14,165,233,0.04)' }}>
              <p className="text-xs uppercase tracking-widest text-sky-400 mb-4">Cost of starting late</p>
              <div className="grid grid-cols-2 gap-5">
                {cd.map((d: any, i: number) => (
                  <div key={i} className={`rounded-xl p-5 border ${i === 0 ? 'border-emerald-700/40 bg-emerald-500/5' : 'border-rose-700/40 bg-rose-500/5'}`}>
                    <p className="text-sm text-slate-400 mb-1">{d.l}</p>
                    <p className="text-3xl font-black">{fmtC(d.v)}</p>
                  </div>
                ))}
              </div>
              <p className="text-slate-300 mt-4">10-year delay costs <strong className="text-rose-400">{fmtC(cd[0].v - cd[1].v)}</strong></p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <SectionHeader n="02" title="The Harvest" sub="Turning corpus into a monthly paycheck" />
        <WithdrawalPanel exp={exp} yrs={yrs} wd={wd} ryr={ryr} wMode={wMode} setWMode={setWMode} cW={cW} setCW={setCW} wInflationOn={wInflationOn} setWInflationOn={setWInflationOn} wInflation={wInflation} setWInflation={setWInflation} />
        <SIPVerdict wd={wd} ryr={ryr} age={age} yrs={yrs} sip={sip} su={su} ret={ret} stepOn={stepOn} pret={pret} inflationNeed={inflationNeed} wInflationOn={wInflationOn} wInflation={wInflation} />
        {wd.dep && <FadeUp><div className="mb-5 rounded-xl px-5 py-4" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239,68,68,0.05)' }}><p className="text-xs text-rose-400 uppercase tracking-wider mb-1">⚠ Corpus Runs Out</p><p className="text-slate-200">Money runs out at <strong className="text-rose-300">age {wd.dep}</strong> — only {wd.dep - (age + yrs)} years of income, then zero.</p></div></FadeUp>}
        {!wd.dep && wd.bal > 1000000 && <FadeUp><div className="mb-5 rounded-xl px-5 py-4" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16,185,129,0.05)' }}><p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">✓ Legacy Left Behind</p><p className="text-slate-200">After {ryr} years you still have <strong className="text-emerald-300">{fmtC(wd.bal)}</strong> left for your family.</p></div></FadeUp>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <KPI icon={<ArrowDown className="w-5 h-5" />} label="Starting withdrawal" value={`₹${fmt(wd.mw)}`} sub="per month (year 1)" color="sky" />
          <KPI icon={<Coins className="w-5 h-5" />} label="Final year withdrawal" value={`₹${fmt(wd.finalMonthlyW)}`} sub={wInflationOn ? `after ${wInflation}% step-up/yr` : 'flat — no step-up'} color={wInflationOn ? 'rose' : 'slate'} />
          <KPI icon={<TrendingUp className="w-5 h-5" />} label={wd.dep ? 'Depletes at age' : 'Legacy left'} value={wd.dep ? `${wd.dep}` : fmtC(wd.bal)} color={wd.dep ? 'rose' : 'emerald'} />
        </div>
        <ChartCard title="Full journey — build & spend">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={jrn}>
              <defs><linearGradient id="jg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="age" stroke={C.axis} tick={{ fontSize: 11, fill: C.tick }} />
              <YAxis stroke={C.axis} tickFormatter={tickFmt} tick={{ fontSize: 11, fill: C.tick }} width={52} />
              <Tooltip {...C.TT} />
              <ReferenceLine x={age + yrs} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Retire', fill: '#f59e0b', fontSize: 11 }} />
              {wd.dep && <ReferenceLine x={wd.dep} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Depleted', fill: '#ef4444', fontSize: 11 }} />}
              <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#jg)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <SectionHeader n="03" title="The Life It Buys" sub={`₹${fmt(exp)}/month today → ₹${fmt(iExp.total)}/month needed at retirement`} />
        <FadeUp>
          <div className={`rounded-2xl border p-8 mb-8 relative overflow-hidden ${V.b}`} style={{ boxShadow: wd.dep ? '0 0 60px rgba(239,68,68,0.06)' : sR > 0.5 ? '0 0 60px rgba(16,185,129,0.06)' : '0 0 60px rgba(245,158,11,0.06)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${wd.dep ? 'rgba(239,68,68,0.4)' : sR > 0.5 ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}, transparent)` }} />
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">The Verdict</p>
            <p className={`text-4xl md:text-5xl font-black mb-2 ${V.c}`}>{V.t}</p>
            <p className="text-slate-300">{V.d}</p>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FadeUp delay={0.1}><ExpensePanel infExp={iExp} customExp={cExp} setCustomExp={setCExp} years={yrs} /></FadeUp>
          <FadeUp delay={0.2}>
            <GlassCard className="p-6 flex flex-col h-full">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">The Bottom Line</p>
              <div className="flex flex-col flex-1">
                {[['Starting monthly income', `₹${fmt(wd.mw)}`, 'text-sky-400'], ['Monthly expenses (inflated)', `₹${fmt(iExp.total)}`, 'text-white'], [wd.dep ? 'Corpus runs out' : 'Corpus lasts full retirement', wd.dep ? `Age ${wd.dep}` : `Till age ${retireAge + ryr}`, wd.dep ? 'text-rose-400' : 'text-emerald-400']].map(([l, v, c]: any) => (
                  <div key={l} className="flex justify-between items-center py-4 last:border-0" style={{ borderBottom: '1px solid var(--divider)' }}>
                    <span className="text-slate-400 text-sm">{l}</span><span className={`text-2xl font-black ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl text-sm text-slate-300" style={{ background: 'var(--surface-alt)' }}><strong className="text-amber-300">Why 8% inflation?</strong> 6% general + 2% lifestyle creep. Healthcare at 10% — the silent retirement killer.</div>
            </GlassCard>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}

function LSCalc({ exp, setExp }: any) {
  const [ls, setLs] = useState(2500000), [tu, setTu] = useState(100000), [tuOn, setTuOn] = useState(true), [ret, setRet] = useState(12), [yrs, setYrs] = useState(20), [age, setAge] = useState(18), [pret, setPret] = useState(8), [ryr, setRyr] = useState(50);
  const [wMode, setWMode] = useState('auto'), [cW, setCW] = useState<number | null>(null);
  const [wInflationOn, setWInflationOn] = useState(true), [wInflation, setWInflation] = useState(6);
  const [cExp, setCExp] = useState<any>(null);
  const INF = 8, HINF = 10;
  const C = makeChartColors(useChartTheme());

  const acc = useMemo(() => { const r = ret / 100; let c = ls, cn = ls; return Array.from({ length: yrs }, (_, i) => { c = c * (1 + r) + (tuOn ? tu : 0); cn = cn * (1 + r); return { age: age + i + 1, corpus: Math.round(c), cn: Math.round(cn) }; }); }, [ls, tu, tuOn, ret, yrs, age]);
  const fc = acc[acc.length - 1]?.corpus || 0, fcn = acc[acc.length - 1]?.cn || 0;
  const ti = ls + (tuOn ? tu * yrs : 0);
  const inflationNeedLS = useMemo(() => Math.round(exp * Math.pow(1 + INF / 100, yrs)), [exp, yrs]);

  const wd = useMemo(() => {
    let c = fc; const mr = pret / 100 / 12;
    const suggestedW = inflationNeedLS;
    const startW = wMode === 'custom' && cW !== null ? cW : suggestedW;
    let cur = c; let dep: number | null = null;
    const data = Array.from({ length: ryr }, (_, yi) => {
      const thisYearW = wInflationOn ? Math.round(startW * Math.pow(1 + wInflation / 100, yi)) : startW;
      for (let m = 0; m < 12; m++) { cur = cur * (1 + mr) - thisYearW; if (cur <= 0 && !dep) { dep = age + yrs + yi + 1; cur = 0; } }
      return { age: age + yrs + yi + 1, corpus: Math.max(0, Math.round(cur)), monthlyW: thisYearW };
    });
    return { data, mw: Math.round(startW), suggestedW, dep, bal: Math.max(0, Math.round(cur)), finalMonthlyW: data[data.length - 1]?.monthlyW || startW };
  }, [fc, pret, ryr, yrs, age, wMode, cW, inflationNeedLS, wInflationOn, wInflation]);

  const jrn = useMemo(() => [...acc.map(d => ({ age: d.age, value: d.corpus })), ...wd.data.map(d => ({ age: d.age, value: d.corpus }))], [acc, wd]);
  const aExp = useMemo(() => { const m = Math.pow(1 + INF / 100, yrs), h = Math.pow(1 + HINF / 100, yrs); return { food: Math.round(exp * 0.35 * m), util: Math.round(exp * 0.15 * m), health: Math.round(exp * 0.10 * h), leisure: Math.round(exp * 0.25 * m), buf: Math.round(exp * 0.15 * m) }; }, [exp, yrs]);
  const iExp = useMemo(() => { const e = cExp ? { ...aExp, ...cExp } : aExp; return { ...e, total: e.food + e.util + e.health + e.leisure + e.buf }; }, [aExp, cExp]);
  const retireAge = age + yrs;
  const sR = (wd.mw - iExp.total) / iExp.total;
  const V = wd.dep ? { t: 'Plan at Risk', c: 'text-rose-400', b: 'border-rose-500/30 bg-rose-500/5', d: `Corpus runs out at age ${wd.dep}. Increase lumpsum or top-ups.` }
    : sR > 0.5 ? { t: 'Luxurious Retirement', c: 'text-emerald-400', b: 'border-emerald-500/30 bg-emerald-500/5', d: 'Travel, hobbies, gifting — all covered with comfort.' }
      : sR > 0.15 ? { t: 'Peaceful Retirement', c: 'text-sky-400', b: 'border-sky-500/30 bg-sky-500/5', d: 'Comfortable lifestyle with breathing room.' }
        : sR > -0.1 ? { t: 'Tight but Manageable', c: 'text-amber-400', b: 'border-amber-500/30 bg-amber-500/5', d: 'Basic needs met — but no room for surprises.' }
          : { t: 'Stretched Thin', c: 'text-rose-400', b: 'border-rose-500/30 bg-rose-500/5', d: 'Corpus may not cover inflated lifestyle.' };

  return (
    <div className="space-y-14">
      <FadeUp>
        <div className="rounded-xl px-5 py-4" style={{ borderLeft: '4px solid #7c3aed', background: 'rgba(124,58,237,0.05)' }}>
          <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Lumpsum Retirement Plan</p>
          <p className="text-slate-200">For investors with <strong className="text-violet-300">₹10L or more</strong> ready to deploy today.</p>
        </div>
      </FadeUp>
      <FadeUp>
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Slider label="Lumpsum Amount" value={ls} onChange={setLs} min={1000000} max={100000000} step={500000} format={fmtC} />
            <Slider label="Annual Top-up" value={tu} onChange={setTu} min={0} max={2000000} step={50000} format={fmtC} />
            <Slider label="Expected Returns" value={ret} onChange={setRet} min={8} max={15} step={0.5} suffix="%" />
            <Slider label="Invest Years" value={yrs} onChange={setYrs} min={5} max={35} step={1} suffix=" yrs" />
            <Slider label="Current Age" value={age} onChange={setAge} min={18} max={55} step={1} suffix=" yrs" />
            <Slider label="Post-Ret Returns" value={pret} onChange={setPret} min={5} max={10} step={0.5} suffix="%" />
            <Slider label="Retirement Yrs" value={ryr} onChange={setRyr} min={15} max={60} step={1} suffix=" yrs" />
            <Slider label="Monthly Expenses Now" value={exp} onChange={setExp} min={10000} max={300000} step={5000} prefix="₹" format={fmt} />
          </div>
          <div className="mt-5 pt-5 flex flex-wrap gap-3" style={{ borderTop: '1px solid var(--border)' }}>
            <motion.button onClick={() => setTuOn(!tuOn)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className={`px-4 py-2 rounded-lg text-sm border transition ${tuOn ? 'text-violet-300' : 'text-slate-500'}`}
              style={tuOn ? { background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' } : { border: '1px solid var(--border)' }}>
              {tuOn ? '✓ Annual Top-up ON' : 'Annual Top-up OFF'}
            </motion.button>
          </div>
          <div className="mt-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <span className="text-amber-200/60">💡 ₹{fmt(exp)}/month today → </span><strong className="text-amber-300">₹{fmt(inflationNeedLS)}/month</strong><span className="text-amber-200/60"> in {yrs} years at 8% inflation</span>
          </div>
        </GlassCard>
      </FadeUp>

      <div>
        <SectionHeader n="01" title="One Investment. Decades of Growth." sub="Watch a single decision compound into a retirement engine" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <KPI icon={<Coins className="w-5 h-5" />} label="Total deployed" value={fmtC(ti)} sub={tuOn ? `+top-ups` : 'lumpsum only'} />
          <KPI icon={<TrendingUp className="w-5 h-5" />} label="Corpus at retirement" value={fmtC(fc)} sub={`Age ${age + yrs}`} color="violet" />
          <KPI icon={<Sparkles className="w-5 h-5" />} label="Multiplier" value={`${(fc / ti).toFixed(1)}x`} color="emerald" />
        </div>
        <AnimatePresence>
          {tuOn && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="mb-6 rounded-xl px-5 py-4" style={{ borderLeft: '4px solid #7c3aed', background: 'rgba(124,58,237,0.05)' }}>
              <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Top-up Impact</p>
              <p className="text-slate-200">Annual top-ups add <strong className="text-violet-300">{fmtC(fc - fcn)}</strong> to your final corpus.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <ChartCard title="Corpus growth over time">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={acc}>
              <defs>
                <linearGradient id="lsg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                <linearGradient id="lsg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#334155" stopOpacity={0.25} /><stop offset="95%" stopColor="#334155" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="age" stroke={C.axis} tick={{ fontSize: 11, fill: C.tick }} />
              <YAxis stroke={C.axis} tickFormatter={tickFmt} tick={{ fontSize: 11, fill: C.tick }} width={52} />
              <Tooltip {...C.TT} />
              <Area type="monotone" dataKey="cn" stroke={C.axis} strokeWidth={1.5} fill="url(#lsg2)" name="No top-up" />
              <Area type="monotone" dataKey="corpus" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#lsg1)" name="With top-up" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <SectionHeader n="02" title="The Harvest" sub="Your corpus converted to monthly income" />
        <WithdrawalPanel exp={exp} yrs={yrs} wd={wd} ryr={ryr} wMode={wMode} setWMode={setWMode} cW={cW} setCW={setCW} wInflationOn={wInflationOn} setWInflationOn={setWInflationOn} wInflation={wInflation} setWInflation={setWInflation} />
        <LSVerdict wd={wd} ryr={ryr} age={age} yrs={yrs} ls={ls} tu={tu} tuOn={tuOn} ret={ret} pret={pret} inflationNeed={inflationNeedLS} wInflationOn={wInflationOn} wInflation={wInflation} />
        {wd.dep && <FadeUp><div className="mb-5 rounded-xl px-5 py-4" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239,68,68,0.05)' }}><p className="text-xs text-rose-400 uppercase tracking-wider mb-1">⚠ Corpus Runs Out</p><p className="text-slate-200">Money runs out at <strong className="text-rose-300">age {wd.dep}</strong>.</p></div></FadeUp>}
        {!wd.dep && wd.bal > 1000000 && <FadeUp><div className="mb-5 rounded-xl px-5 py-4" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16,185,129,0.05)' }}><p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">✓ Legacy Left Behind</p><p className="text-slate-200">You leave <strong className="text-emerald-300">{fmtC(wd.bal)}</strong> for your family.</p></div></FadeUp>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <KPI icon={<ArrowDown className="w-5 h-5" />} label="Starting withdrawal" value={`₹${fmt(wd.mw)}`} sub="per month (year 1)" color="sky" />
          <KPI icon={<Coins className="w-5 h-5" />} label="Final year withdrawal" value={`₹${fmt(wd.finalMonthlyW)}`} sub={wInflationOn ? `after ${wInflation}% step-up/yr` : 'flat — no step-up'} color={wInflationOn ? 'rose' : 'slate'} />
          <KPI icon={<TrendingUp className="w-5 h-5" />} label={wd.dep ? 'Depletes at age' : 'Legacy left'} value={wd.dep ? `${wd.dep}` : fmtC(wd.bal)} color={wd.dep ? 'rose' : 'emerald'} />
        </div>
        <ChartCard title="Full journey — deploy & withdraw">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={jrn}>
              <defs><linearGradient id="lsjg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="age" stroke={C.axis} tick={{ fontSize: 11, fill: C.tick }} />
              <YAxis stroke={C.axis} tickFormatter={tickFmt} tick={{ fontSize: 11, fill: C.tick }} width={52} />
              <Tooltip {...C.TT} />
              <ReferenceLine x={age + yrs} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value: 'Retire', fill: '#8b5cf6', fontSize: 11 }} />
              {wd.dep && <ReferenceLine x={wd.dep} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Depleted', fill: '#ef4444', fontSize: 11 }} />}
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#lsjg)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <SectionHeader n="03" title="The Life It Buys" sub={`₹${fmt(exp)}/month today → ₹${fmt(iExp.total)}/month needed at retirement`} />
        <FadeUp>
          <div className={`rounded-2xl border p-8 mb-8 relative overflow-hidden ${V.b}`}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${wd.dep ? 'rgba(239,68,68,0.4)' : sR > 0.5 ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}, transparent)` }} />
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">The Verdict</p>
            <p className={`text-4xl md:text-5xl font-black mb-2 ${V.c}`}>{V.t}</p>
            <p className="text-slate-300">{V.d}</p>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FadeUp delay={0.1}><ExpensePanel infExp={iExp} customExp={cExp} setCustomExp={setCExp} years={yrs} /></FadeUp>
          <FadeUp delay={0.2}>
            <GlassCard className="p-6 flex flex-col h-full">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">The Bottom Line</p>
              <div className="flex flex-col flex-1">
                {[['Starting monthly income', `₹${fmt(wd.mw)}`, 'text-sky-400'], ['Monthly expenses (inflated)', `₹${fmt(iExp.total)}`, 'text-white'], [wd.dep ? 'Corpus runs out' : 'Corpus lasts full retirement', wd.dep ? `Age ${wd.dep}` : `Till age ${retireAge + ryr}`, wd.dep ? 'text-rose-400' : 'text-emerald-400']].map(([l, v, c]: any) => (
                  <div key={l} className="flex justify-between items-center py-4 last:border-0" style={{ borderBottom: '1px solid var(--divider)' }}>
                    <span className="text-slate-400 text-sm">{l}</span><span className={`text-2xl font-black ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl text-sm text-slate-300" style={{ background: 'var(--surface-alt)' }}><strong className="text-amber-300">Why 8% inflation?</strong> 6% general + 2% lifestyle creep. Healthcare at 10% — the silent retirement killer.</div>
            </GlassCard>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    window.localStorage.removeItem('angel_theme');
  }, []);

  const location = useLocation();
  const isSip = location.pathname === '/sip';
  const isLS = location.pathname === '/lumpsum';
  const routeMode = isSip ? 'sip' : isLS ? 'lumpsum' : 'home';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exp, setExp] = useState(40000), [faq, setFaq] = useState<number | null>(null), [done, setDone] = useState(false);
  const [fd, setFd] = useState({ name: '', phone: '', cap: '' });

  const submit = async () => {
    if (!fd.name || !fd.phone) return;
    const lead = { ...fd, mode: routeMode, timestamp: new Date().toISOString() };
    const existing = JSON.parse(sessionStorage.getItem('angel_leads') || '[]');
    existing.push(lead);
    sessionStorage.setItem('angel_leads', JSON.stringify(existing));
    setDone(true);
  };

  const faqs = [
    { q: 'Is ₹5,000/month really enough for retirement?', a: 'It depends on when you start and how disciplined you are with the annual step-up. Starting at 18 with ₹5,000/month and a 10% step-up, your corpus at 43 (25 years later) will be over ₹2 crore. The earlier you start, the less you need to invest. Delaying by even 5 years can cost you ₹50–80 lakhs in final corpus.' },
    { q: 'What is the annual step-up and why does it matter?', a: 'Step-up means increasing your SIP amount every year — usually matching your salary hike. A 10% step-up on ₹5,000 means ₹5,500 in year 2, ₹6,050 in year 3, and so on. Over 25 years, a 10% step-up typically doubles your final corpus compared to a flat SIP. It is the single biggest lever most investors ignore.' },
    { q: 'Why does the calculator show 8% inflation?', a: 'Official CPI inflation is 5–6%. But your lifestyle does not stay the same — better food, more travel, better healthcare as you age adds another 2%. That is lifestyle creep. Healthcare is inflated separately at 10% because medical costs in India have been rising at 10–12% annually for the last decade.' },
    { q: 'What is the withdrawal step-up and why is it on by default?', a: 'During retirement, your expenses keep rising every year due to inflation. If you withdraw the same fixed amount every month for 25 years, you will be able to afford less and less each year. The step-up models this reality — your withdrawal increases by 6% every year to match inflation.' },
    { q: 'What is the minimum investment for PMS?', a: 'SEBI mandates a minimum of ₹50 lakhs for Portfolio Management Services (PMS). This is a direct, customised equity portfolio managed by experienced fund managers — different from mutual funds where your money is pooled with others.' },
    { q: 'What is AIF and who is it for?', a: 'Alternative Investment Funds (AIF) are for investors with ₹1 crore or more seeking access to private equity, venture capital, real estate credit, and hedge strategies. These asset classes are unavailable to retail investors and offer returns uncorrelated to the stock market.' },
    { q: 'What are GIFT City Funds?', a: "GIFT City is India's IFSC — International Financial Services Centre. It allows Indian investors to invest in USD-denominated global funds. Minimum investment is around $1,50,000 (~₹1.25 Cr). Ideal for HNI investors seeking USD exposure and global equity diversification." },
    { q: 'How is the "increase SIP by X" number calculated?', a: 'The calculator works backwards using a binary search algorithm. It finds the minimum additional monthly SIP that, when added to your current SIP and compounded at the same returns, produces a corpus large enough to fund your full retirement period with inflation-adjusted withdrawals.' },
    { q: 'Is my data safe? Does Angel Investments see my numbers?', a: 'All calculations happen entirely in your browser — your numbers never leave your device. The only data we receive is what you voluntarily submit in the consultation form (name and phone). We do not store calculator inputs or retirement numbers.' },
    { q: 'Can I use this calculator for my parents or spouse?', a: 'Absolutely. Just change the starting age and current monthly expenses to match their situation. The calculator works for any investor — whether they are 18 starting their first SIP or 55 planning retirement with a lumpsum.' },
  ];

  return (
    <div className="min-h-screen w-full text-slate-100" style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter',system-ui,-apple-system,sans-serif" }}>

      {/* Toast */}
      <div id="call-toast" style={{ display: 'none', background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        className="fixed top-20 left-1/2 z-50 -translate-x-1/2 items-center gap-3 px-5 py-3 rounded-2xl text-white">
        <Phone className="w-5 h-5" /><div><div className="font-bold">+91 90352 54332</div><div className="text-xs opacity-80">Opens dialer on your phone!</div></div>
      </div>

      {/* Floating call */}
      <motion.button onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }}
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3.5 rounded-full text-white font-bold"
        style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}
        whileHover={{ scale: 1.06, boxShadow: '0 12px 40px rgba(16,185,129,0.5)' }} whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.5)', '0 0 0 14px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0)'] }}
        transition={{ boxShadow: { duration: 2, repeat: Infinity }, scale: { type: 'spring', stiffness: 400 } }}>
        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <div className="leading-tight"><div className="hidden sm:block text-[10px] opacity-70 font-normal">Call us free</div><div className="text-xs sm:text-sm">90352 54332</div></div>
      </motion.button>

      {/* Nav */}
      <motion.nav className="sticky top-0 z-40 w-full" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease }}
        style={{ borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px) saturate(160%)', background: 'var(--bg-soft)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.png" alt="Angel Investments" className="w-11 h-11 object-contain flex-shrink-0" />
            <div className="flex flex-col" style={{ paddingTop: '4px' }}>
              <p className="font-bold text-sm leading-none text-white tracking-wide">Angel Investments</p>
              <p className="text-[10px] text-amber-400 italic mt-1.5 leading-none">Learn to Earn</p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[['/', 'Home'], ['/sip', 'SIP Plan'], ['/lumpsum', 'Lumpsum Plan']].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }: { isActive: boolean }) => `text-sm font-medium transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop CTA + mobile hamburger */}
          <div className="flex items-center gap-3">
            <motion.button onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-slate-900"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 6px 24px rgba(245,158,11,0.45)' }} whileTap={{ scale: 0.97 }}>
              <Phone className="w-3.5 h-3.5" /> +91 90352 54332
            </motion.button>
            <motion.button className="md:hidden p-2 rounded-lg text-slate-300"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-soft)', backdropFilter: 'blur(20px)' }}>
              <div className="flex flex-col px-4 py-4 gap-1">
                {[['/', 'Home'], ['/sip', 'SIP Plan'], ['/lumpsum', 'Lumpsum Plan']].map(([to, label]) => (
                  <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }: { isActive: boolean }) => `px-3 py-3 rounded-xl text-sm font-medium transition ${isActive ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    {label}
                  </NavLink>
                ))}
                <div className="pt-3 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => { setMobileMenuOpen(false); window.open('tel:+919035254332', '_self'); showCallToast(); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-slate-900"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                    <Phone className="w-4 h-4" /> Call +91 90352 54332
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {(!isSip && !isLS) && (
      <>
        {/* Hero */}
        <section className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
          {/* Video bg */}
          <video className="absolute inset-0 w-full h-full object-cover"
            src={HERO_VIDEO_URL} autoPlay loop muted playsInline
            style={{ filter: 'brightness(0.45) saturate(1.1)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(6,11,20,0.85) 0%, rgba(6,11,20,0.6) 50%, rgba(6,11,20,0.75) 100%)' }} />
          <HeroOrbs />

          {/* Two-column content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* ── Left: text ── */}
            <div className="flex-1 lg:max-w-[520px] flex flex-col gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-amber-300 self-start"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.22)' }}>
                <Sparkles className="w-3.5 h-3.5" /> Retirement Reality Check
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1, ease }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight"
                style={{ background: 'linear-gradient(135deg,#ffffff 40%,rgba(255,255,255,0.45))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Will your money last<br />as long as you do?
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2, ease }}
                className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-md">
                SIP or lumpsum — see if your retirement plan actually works. Adjusted for real Indian inflation, with withdrawal step-up. Takes 60 seconds.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.3, ease }}
                className="flex flex-wrap gap-3">
                <Link to="/sip" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-slate-900 text-sm"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 28px rgba(245,158,11,0.38)' }}>
                  <Play className="w-4 h-4 fill-current" /> Check SIP Plan
                </Link>
                <Link to="/lumpsum" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-emerald-300 text-sm"
                  style={{ border: '1px solid rgba(16,185,129,0.28)', background: 'rgba(16,185,129,0.06)' }}>
                  <BarChart2 className="w-4 h-4" /> Lumpsum Plan
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.45, ease }}
                className="flex flex-wrap items-center gap-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  [<Youtube key="yt" className="w-4 h-4 text-rose-500" />, '5L+ Subscribers'],
                  [<div key="stars" className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>, 'Top-rated'],
                  [<Shield key="sh" className="w-4 h-4 text-emerald-500" />, 'SEBI Regulated'],
                ].map(([ico, txt]: any, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08, ease }}
                    className="flex items-center gap-2 text-sm text-slate-500">{ico}{txt}</motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: carousel ── */}
            <motion.div className="flex-1 w-full lg:max-w-[440px]"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.25, ease }}>
              <HeroCarousel />
            </motion.div>

          </div>
        </section>
      </>
      )}

      {(isSip || isLS) && (
        <>
          <CalcHeroSection mode={isSip ? 'sip' : 'lumpsum'} />
          <PageContainer>
            {isSip ? <SIPCalc exp={exp} setExp={setExp} /> : <LSCalc exp={exp} setExp={setExp} />}
          </PageContainer>
        </>
      )}

      {/* Consultation */}
      {!isSip && !isLS && (
      <section className="w-full" style={{ borderTop: '1px solid var(--section-border)', borderBottom: '1px solid var(--section-border)', background: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-24">

          {/* Section header */}
          <FadeUp className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-amber-300 mb-6"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <Calendar className="w-3.5 h-3.5" /> Free 1-on-1 Consultation
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Numbers are great.<br /><span className="text-amber-400">A plan is better.</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">Tell us where you are. We'll tell you what to do next — in plain language, no jargon, no pressure.</p>
          </FadeUp>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">

            {/* Left: Glassmorphism image card */}
            <FadeUp className="lg:w-5/12">
              <ConsultImageCard />
            </FadeUp>

            {/* Right: Form */}
            <div className="lg:w-7/12">
          {!done ? (
            <FadeUp delay={0.15}>
              <GlassCard>
                <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  {[{ n: '01', t: 'Fill this form', d: '30 seconds. Name & number only.' }, { n: '02', t: 'We call within 24hrs', d: 'Our expert reviews your numbers first.' }, { n: '03', t: 'Get your plan', d: 'Clear next steps. No sales pressure.' }].map((s, i) => (
                    <div key={s.n} className="p-5 text-center" style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mx-auto mb-3"
                        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#07090f', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>{s.n}</div>
                      <p className="text-sm font-bold text-white mb-1">{s.t}</p>
                      <p className="text-xs text-slate-500">{s.d}</p>
                    </div>
                  ))}
                </div>
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <FormField icon={<User className="w-4 h-4" />} label="Full Name" value={fd.name} onChange={(v: string) => setFd({ ...fd, name: v })} placeholder="Your name" />
                    <FormField icon={<Phone className="w-4 h-4" />} label="Contact Number" type="tel" value={fd.phone} onChange={(v: string) => setFd({ ...fd, phone: v })} placeholder="+91 98765 43210" />
                  </div>
                  <div className="mb-6">
                    <label className="text-xs uppercase tracking-widest text-slate-500 mb-3 block">Where are you in your investment journey?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { v: 'starting', l: 'Just starting out', d: "Haven't invested yet or just started SIP" },
                        { v: 'sip-growing', l: 'Building via SIP', d: 'Regular SIP investor, want to optimise' },
                        { v: 'lumpsum-ready', l: 'Have a lumpsum ready', d: '₹10L+ ready to deploy' },
                        { v: 'hni', l: 'HNI — looking for PMS/AIF', d: '₹50L+ portfolio, want professional management' },
                      ].map(opt => (
                        <motion.button key={opt.v} onClick={() => setFd({ ...fd, cap: opt.v })}
                          className="text-left p-4 rounded-xl border transition"
                          style={{ background: fd.cap === opt.v ? 'rgba(245,158,11,0.08)' : 'var(--surface-alt)', border: fd.cap === opt.v ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)', boxShadow: fd.cap === opt.v ? '0 0 20px rgba(245,158,11,0.08)' : 'none' }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <div className="flex items-start gap-3">
                            <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition"
                              style={{ borderColor: fd.cap === opt.v ? '#f59e0b' : '#374151' }}>
                              {fd.cap === opt.v && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />}
                            </div>
                            <div><p className="text-sm font-semibold" style={{ color: fd.cap === opt.v ? 'var(--primary)' : 'var(--text)' }}>{opt.l}</p><p className="text-xs text-slate-500 mt-0.5">{opt.d}</p></div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <motion.button onClick={submit} disabled={!fd.name || !fd.phone}
                    className="w-full py-4 rounded-xl font-black text-lg text-slate-900 disabled:opacity-40 flex items-center justify-center gap-2 mb-4"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 32px rgba(245,158,11,0.35)' }}
                    whileHover={{ scale: 1.01, boxShadow: '0 12px 40px rgba(245,158,11,0.5)' }} whileTap={{ scale: 0.99 }}>
                    <Calendar className="w-5 h-5" /> Book My Free Consultation
                  </motion.button>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {['RK', 'MS', 'AP', 'VN'].map(i => (
                        <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 border-2"
                          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderColor: 'var(--bg)' }}>{i}</div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">10,000+ investors already consulted</p>
                  </div>
                  <p className="text-xs text-slate-600 text-center mt-3">No spam. Your details are only used to schedule your call.</p>
                </div>
              </GlassCard>
            </FadeUp>
          ) : (
            <FadeUp>
              <div className="rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', boxShadow: '0 0 60px rgba(16,185,129,0.06)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.15)', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h3 className="text-3xl font-black mb-3">You're in, {fd.name.split(' ')[0]}!</h3>
                <p className="text-slate-400 mb-2">Our team will call you within 24 hours.</p>
                <p className="text-sm text-slate-500 mb-6">You mentioned: <span className="text-amber-400 font-semibold">{{ starting: 'Getting started with SIP', 'sip-growing': 'Optimising your SIP', 'lumpsum-ready': 'Lumpsum investment', hni: 'PMS / AIF management' }[fd.cap as string] || 'Investment planning'}</span></p>
              </div>
            </FadeUp>
          )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* FAQ */}
      {!isSip && !isLS && (
      <section className="w-full px-4 sm:px-6 py-14 md:py-24 relative overflow-hidden">

        {/* Floating background decoration */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {[
            { text: '?', x: '8%',  y: '12%', size: 180, delay: 0 },
            { text: '?', x: '78%', y: '5%',  size: 240, delay: 1.8 },
            { text: '?', x: '55%', y: '60%', size: 160, delay: 0.9 },
          ].map((d, i) => (
            <motion.div key={i}
              animate={{ y: [0, -22, 0], opacity: [0.025, 0.055, 0.025] }}
              transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
              className="absolute font-black text-white leading-none"
              style={{ left: d.x, top: d.y, fontSize: d.size }}>
              {d.text}
            </motion.div>
          ))}
          {/* Ambient orb */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '20%', left: '50%', transform: 'translateX(-50%)',
              background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">

          {/* Section header */}
          <FadeUp className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-amber-300 mb-5"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Sparkles className="w-3.5 h-3.5" /> From our YouTube community
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1, ease }}
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight">
              Common{' '}
              <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Questions
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2, ease }}
              className="text-slate-500 max-w-md mx-auto">
              {faqs.length} questions answered — from investors just like you.
            </motion.p>
          </FadeUp>

          {/* FAQ items */}
          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => {
              const isOpen = faq === i;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease }}
                  whileHover={{ y: isOpen ? 0 : -2 }}
                >
                  <div className="relative rounded-2xl overflow-hidden"
                    style={{
                      border: `1px solid ${isOpen ? 'rgba(245,158,11,0.32)' : 'var(--faq-border)'}`,
                      background: isOpen ? 'rgba(245,158,11,0.04)' : 'var(--faq-bg)',
                      boxShadow: isOpen ? '0 0 32px rgba(245,158,11,0.07), 0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.12)',
                      transition: 'border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease',
                    }}>

                    {/* Active left accent bar */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease }}
                          className="absolute left-0 top-0 bottom-0 w-[3px] origin-top rounded-r-full"
                          style={{ background: 'linear-gradient(to bottom, #f59e0b, #d97706)' }} />
                      )}
                    </AnimatePresence>

                    {/* Question row */}
                    <button onClick={() => setFaq(isOpen ? null : i)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left group">

                      {/* Number badge */}
                      <motion.div
                        animate={{
                          background: isOpen ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.05)',
                          scale: isOpen ? 1.08 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black"
                        style={{ color: isOpen ? '#07090f' : '#475569', boxShadow: isOpen ? '0 0 14px rgba(245,158,11,0.35)' : 'none' }}>
                        {String(i + 1).padStart(2, '0')}
                      </motion.div>

                      <span className="flex-1 font-semibold text-sm sm:text-base pr-2 leading-snug"
                        style={{ color: isOpen ? '#f9fafb' : '#cbd5e1' }}>
                        {f.q}
                      </span>

                      {/* Chevron */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? '#f59e0b' : '#475569' }}
                        transition={{ duration: 0.3, ease }}
                        className="flex-shrink-0">
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>

                    {/* Answer */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease }}
                          className="overflow-hidden"
                          style={{ borderTop: '1px solid rgba(245,158,11,0.1)' }}>
                          <motion.p
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{ duration: 0.28, delay: 0.08 }}
                            className="px-5 pt-4 pb-5 text-sm text-slate-400 leading-relaxed"
                            style={{ paddingLeft: '4.25rem' }}>
                            {f.a}
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.2, ease }}
            className="mt-10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div>
              <p className="font-bold text-white mb-1">Still have questions?</p>
              <p className="text-sm text-slate-400">Our advisors answer within 24 hours — no jargon, no pressure.</p>
            </div>
            <motion.button
              onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 28px rgba(245,158,11,0.45)' }}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-slate-900 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
              <Phone className="w-4 h-4" /> Call Us Free
            </motion.button>
          </motion.div>

        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="w-full" style={{ borderTop: '1px solid var(--footer-border)', background: 'var(--footer-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Angel Investments" className="w-11 h-11 object-contain flex-shrink-0" />
                <div className="flex flex-col" style={{ paddingTop: '4px' }}>
                  <p className="font-bold text-white">Angel Investments</p>
                  <p className="text-xs text-amber-400 italic mt-1">Learn to Earn</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">Wealth Management & Investment Distribution. AMFI-registered Distributor. We deal exclusively in SEBI regulated products.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-4">Connect</p>
              <div className="flex flex-col gap-3 text-sm text-slate-500">
                <a href="https://www.youtube.com/@angelinvestments_" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-2 transition"><Youtube className="w-4 h-4" /> YouTube Channel</a>
                <a href="https://www.instagram.com/angelinvestments_/" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-2 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  Instagram
                </a>
                <button onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }} className="hover:text-emerald-400 flex items-center gap-2 transition text-left"><Phone className="w-4 h-4" /> +91 90352 54332</button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-4">Disclaimer</p>
              <p className="text-xs text-slate-600 leading-relaxed">This calculator is for illustrative and educational purposes only. Angel Investments is an AMFI-registered Mutual Fund Distributor. We deal exclusively in SEBI regulated investment products — Mutual Funds, Portfolio Management Services (PMS), Alternative Investment Funds (AIF), and GIFT City Funds. We are not SEBI-registered Investment Advisors and do not provide regulated investment advice. All investments are subject to market risk. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.</p>
            </div>
          </div>
          <div className="pt-6 text-center text-xs text-slate-700" style={{ borderTop: '1px solid var(--divider)' }}>© 2026 Angel Investments Content Studios. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
