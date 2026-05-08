import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Coins, Home, Heart, Plane, Shield, ArrowDown, Sparkles, Play, CheckCircle2, Calendar, Youtube, Star, ChevronDown, Phone, User, Zap, BarChart2 } from 'lucide-react';

function MarketChartBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const maxPts = 220;
    const prices: number[] = [24000];
    for (let i = 1; i < maxPts; i++)
      prices.push(Math.max(20000, prices[i - 1] + (Math.random() - 0.47) * 90));

    const tickers = [
      { label: 'NIFTY 50',    val: '24,178',      pct: '▲1.24%',    up: true  },
      { label: 'SENSEX',      val: '79,802',      pct: '▲0.98%',    up: true  },
      { label: 'GOLD',        val: '₹72,420',     pct: '▲0.34%',    up: true  },
      { label: 'MIDCAP 150',  val: '57,340',      pct: '▲1.87%',    up: true  },
      { label: 'MF RETURNS',  val: '18.2% CAGR',  pct: '▲SIP',      up: true  },
      { label: 'SMALLCAP',    val: '16,892',      pct: '▲2.11%',    up: true  },
    ];

    let frame = 0, tickerX = 0, animId: number;

    const draw = () => {
      if (frame % 3 === 0) {
        prices.push(Math.max(20000, prices[prices.length - 1] + (Math.random() - 0.47) * 90));
        if (prices.length > maxPts) prices.shift();
      }

      ctx.clearRect(0, 0, w, h);

      // grid
      const gs = 56;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= w; x += gs) {
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += gs) {
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // dashed price levels
      ctx.setLineDash([3, 6]);
      ctx.lineWidth = 0.5;
      [0.25, 0.48, 0.7].forEach(f => {
        const y = h * 0.08 + h * 0.6 * f;
        ctx.strokeStyle = 'rgba(245,158,11,0.08)';
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      });
      ctx.setLineDash([]);

      // chart geometry
      const cTop = h * 0.07, cBot = h * 0.7, cH = cBot - cTop;
      const N = Math.min(prices.length, 130);
      const slice = prices.slice(-N);
      const minP = Math.min(...slice) * 0.997;
      const maxP = Math.max(...slice) * 1.003;
      const range = maxP - minP || 1;
      const toX = (i: number) => (i / (N - 1)) * w;
      const toY = (p: number) => cTop + cH - ((p - minP) / range) * cH;

      // area fill
      const ag = ctx.createLinearGradient(0, cTop, 0, cBot);
      ag.addColorStop(0, 'rgba(245,158,11,0.22)');
      ag.addColorStop(0.55, 'rgba(245,158,11,0.06)');
      ag.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(slice[0]));
      for (let i = 1; i < slice.length; i++) {
        const cx = (toX(i - 1) + toX(i)) / 2;
        ctx.bezierCurveTo(cx, toY(slice[i-1]), cx, toY(slice[i]), toX(i), toY(slice[i]));
      }
      ctx.lineTo(w, cBot); ctx.lineTo(0, cBot); ctx.closePath();
      ctx.fillStyle = ag; ctx.fill();

      // line
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(slice[0]));
      for (let i = 1; i < slice.length; i++) {
        const cx = (toX(i - 1) + toX(i)) / 2;
        ctx.bezierCurveTo(cx, toY(slice[i-1]), cx, toY(slice[i]), toX(i), toY(slice[i]));
      }
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(245,158,11,0.6)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // candlesticks
      const volTop = h * 0.74, volH = h * 0.12;
      const cw = Math.max(2, w / N - 1);
      for (let i = 1; i < slice.length; i++) {
        const up = slice[i] >= slice[i - 1];
        const bh = Math.max(1.5, (Math.abs(slice[i] - slice[i - 1]) / range) * volH * 5);
        ctx.fillStyle = up ? 'rgba(16,185,129,0.58)' : 'rgba(239,68,68,0.48)';
        ctx.fillRect(toX(i) - cw / 2, volTop + volH - bh, cw, bh);
      }

      // live dot with pulse
      const lx = toX(slice.length - 1), ly = toY(slice[slice.length - 1]);
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.09);
      ctx.beginPath(); ctx.arc(lx, ly, 3 + pulse * 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,158,11,${0.1 * pulse})`; ctx.fill();
      ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = 'rgba(245,158,11,0.95)'; ctx.shadowBlur = 14;
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = '600 11px Inter,sans-serif';
      ctx.fillStyle = 'rgba(245,158,11,0.9)';
      ctx.fillText(`₹${Math.round(slice[slice.length - 1]).toLocaleString('en-IN')}`, lx + 10, ly + 4);

      // ticker strip
      const sy = h - 34;
      ctx.fillStyle = 'rgba(6,11,20,0.9)'; ctx.fillRect(0, sy, w, 34);
      ctx.strokeStyle = 'rgba(245,158,11,0.14)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(w, sy); ctx.stroke();

      tickerX += 0.45;
      const tw = 192, totalTW = tickers.length * tw;
      ctx.save(); ctx.beginPath(); ctx.rect(0, sy, w, 34); ctx.clip();
      for (let rep = -1; rep <= Math.ceil(w / totalTW) + 1; rep++) {
        tickers.forEach((tk, t) => {
          const x = rep * totalTW + t * tw - (tickerX % totalTW);
          if (x > w + tw || x < -tw) return;
          ctx.font = '10px Inter,sans-serif'; ctx.fillStyle = 'rgba(148,163,184,0.65)';
          ctx.fillText(tk.label, x + 10, sy + 13);
          ctx.font = 'bold 11px Inter,sans-serif'; ctx.fillStyle = tk.up ? '#10b981' : '#ef4444';
          ctx.fillText(`${tk.val}  ${tk.pct}`, x + 10, sy + 28);
          ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x + tw - 8, sy + 5); ctx.lineTo(x + tw - 8, sy + 29); ctx.stroke();
        });
      }
      ctx.restore();

      frame++;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n));
const fmtC = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(2)} L` : `₹${Math.round(n)}`;
const tickFmt = (v: number) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${Math.round(v)}`;
const TT = { contentStyle: { backgroundColor: '#050c18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }, formatter: (v: number) => fmtC(v), labelFormatter: (l: number) => `Age ${l}` };

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
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, background: 'linear-gradient(to bottom, transparent, #060b14)' }} />
    </div>
  );
}

function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full px-6 py-24">
      <div className="max-w-7xl mx-auto">{children}</div>
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
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
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
      style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px) saturate(160%)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: `0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)${glow ? `, 0 0 60px ${glow}` : ''}` }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
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
      <div className="relative h-1.5 rounded-full" style={{ background: 'rgba(51,65,85,0.6)' }}>
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
      <span className="text-6xl font-black leading-none select-none" style={{ color: 'rgba(255,255,255,0.04)' }}>{n}</span>
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
              style={{ background: 'rgba(255,255,255,0.05)' }} /></div>
          : <button onClick={() => { setRaw(String(value)); setEditing(true); }} className="flex items-center gap-1.5 group/btn">
            <span className="text-sm font-semibold">₹{fmt(value)}</span>
            <span className="text-xs text-slate-600 group-hover/btn:text-amber-400 transition">✏</span>
          </button>}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(51,65,85,0.5)' }}>
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
      <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
        className="rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
        onFocus={e => { e.target.style.border = '1px solid rgba(245,158,11,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
        onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Starting monthly withdrawal at retirement</p>
          <p className="text-3xl font-black text-white">₹{fmt(wd.mw)}<span className="text-sm font-normal text-slate-400">/month</span></p>
          <p className="text-xs text-slate-500 mt-1">₹{fmt(exp)}/month today × 8% inflation × {yrs} years</p>
        </div>
        <motion.button onClick={() => { setWMode(wMode === 'custom' ? 'auto' : 'custom'); if (wMode === 'auto' && cW === null) setCW(wd.suggestedW); }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className={`self-start sm:self-auto flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold border transition ${wMode === 'custom' ? 'text-amber-300' : 'text-slate-400 hover:text-amber-400'}`}
          style={wMode === 'custom' ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' } : { border: '1px solid rgba(255,255,255,0.08)' }}>
          {wMode === 'custom' ? '✓ Manual amount' : '✏ Change amount'}
        </motion.button>
      </div>
      <AnimatePresence>
        {wMode === 'custom' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }} className="mb-5 pb-5 overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Slider label="Your starting monthly withdrawal" value={cW || wd.suggestedW} onChange={setCW}
              min={10000} max={Math.max(Math.round(wd.suggestedW * 3), 500000)} step={5000} prefix="₹" format={fmt} />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((m: number) => (
                <motion.button key={m} onClick={() => setCW(Math.round(wd.suggestedW * m))}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-2 py-1 text-[11px] rounded-lg text-slate-400 hover:text-amber-300 transition"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
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
            style={wInflationOn ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
          <div className="mt-5 pt-5 flex flex-wrap gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.button onClick={() => setStepOn(!stepOn)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className={`px-4 py-2 rounded-lg text-sm border transition ${stepOn ? 'text-amber-300' : 'text-slate-500'}`}
              style={stepOn ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' } : { border: '1px solid rgba(255,255,255,0.08)' }}>
              {stepOn ? '✓ Step-up ON' : 'Step-up OFF'}
            </motion.button>
            <motion.button onClick={() => setCmp(!cmp)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className={`px-4 py-2 rounded-lg text-sm border transition ${cmp ? 'text-sky-300' : 'text-slate-500'}`}
              style={cmp ? { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)' } : { border: '1px solid rgba(255,255,255,0.08)' }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis stroke="#334155" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#475569' }} width={52} />
              <Tooltip {...TT} />
              {magic && <ReferenceLine x={magic.age} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Magic Year', fill: '#f59e0b', fontSize: 11 }} />}
              <Area type="monotone" dataKey="ns" stroke="#334155" strokeWidth={1.5} fill="url(#g2)" name="Flat SIP" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis stroke="#334155" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#475569' }} width={52} />
              <Tooltip {...TT} />
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
                  <div key={l} className="flex justify-between items-center py-4 last:border-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-slate-400 text-sm">{l}</span><span className={`text-2xl font-black ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl text-sm text-slate-300" style={{ background: 'rgba(255,255,255,0.03)' }}><strong className="text-amber-300">Why 8% inflation?</strong> 6% general + 2% lifestyle creep. Healthcare at 10% — the silent retirement killer.</div>
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
          <div className="mt-5 pt-5 flex flex-wrap gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.button onClick={() => setTuOn(!tuOn)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className={`px-4 py-2 rounded-lg text-sm border transition ${tuOn ? 'text-violet-300' : 'text-slate-500'}`}
              style={tuOn ? { background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' } : { border: '1px solid rgba(255,255,255,0.08)' }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis stroke="#334155" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#475569' }} width={52} />
              <Tooltip {...TT} />
              <Area type="monotone" dataKey="cn" stroke="#334155" strokeWidth={1.5} fill="url(#lsg2)" name="No top-up" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="age" stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis stroke="#334155" tickFormatter={tickFmt} tick={{ fontSize: 11, fill: '#475569' }} width={52} />
              <Tooltip {...TT} />
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
                  <div key={l} className="flex justify-between items-center py-4 last:border-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-slate-400 text-sm">{l}</span><span className={`text-2xl font-black ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl text-sm text-slate-300" style={{ background: 'rgba(255,255,255,0.03)' }}><strong className="text-amber-300">Why 8% inflation?</strong> 6% general + 2% lifestyle creep. Healthcare at 10% — the silent retirement killer.</div>
            </GlassCard>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem('angel_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('angel_theme', theme);
  }, [theme]);

  const location = useLocation();
  const isSip = location.pathname === '/sip';
  const isLS = location.pathname === '/lumpsum';
  const routeMode = isSip ? 'sip' : isLS ? 'lumpsum' : 'home';
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
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`} style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter',system-ui,-apple-system,sans-serif" }}>

      {/* Toast */}
      <div id="call-toast" style={{ display: 'none', background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        className="fixed top-20 left-1/2 z-50 -translate-x-1/2 items-center gap-3 px-5 py-3 rounded-2xl text-white">
        <Phone className="w-5 h-5" /><div><div className="font-bold">+91 90352 54332</div><div className="text-xs opacity-80">Opens dialer on your phone!</div></div>
      </div>

      {/* Floating call */}
      <motion.button onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full text-white font-bold"
        style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}
        whileHover={{ scale: 1.06, boxShadow: '0 12px 40px rgba(16,185,129,0.5)' }} whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.5)', '0 0 0 14px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0)'] }}
        transition={{ boxShadow: { duration: 2, repeat: Infinity }, scale: { type: 'spring', stiffness: 400 } }}>
        <Phone className="w-4 h-4" />
        <div className="leading-tight"><div className="text-[10px] opacity-70 font-normal">Call us free</div><div className="text-sm">90352 54332</div></div>
      </motion.button>

      {/* Nav */}
      <motion.nav className="sticky top-0 z-40 w-full" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease }}
        style={{ borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px) saturate(160%)', background: 'var(--bg-soft)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Angel Investments" className="w-14 h-14 object-contain flex-shrink-0" />
            <div className="flex flex-col" style={{ paddingTop: '4px' }}>
              <p className="font-bold text-sm leading-none text-white tracking-wide">Angel Investments</p>
              <p className="text-[10px] text-amber-400 italic mt-1.5 leading-none">Learn to Earn</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              Home
            </NavLink>
            <NavLink to="/sip" className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              SIP Plan
            </NavLink>
            <NavLink to="/lumpsum" className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              Lumpsum Plan
            </NavLink>
          </div>
          <div className="flex items-center gap-3">
            <label className="cosmic-toggle" aria-label="Toggle theme">
              <input className="toggle" type="checkbox"
                checked={theme === 'light'}
                onChange={e => setTheme(e.target.checked ? 'light' : 'dark')} />
              <div className="slider">
                <div className="cosmos"></div>
                <div className="energy-line"></div>
                <div className="energy-line"></div>
                <div className="energy-line"></div>
                <div className="toggle-orb">
                  <div className="inner-orb"></div>
                  <div className="ring"></div>
                </div>
                <div className="particles">
                  <div style={{ '--angle': '30deg' } as React.CSSProperties} className="particle"></div>
                  <div style={{ '--angle': '60deg' } as React.CSSProperties} className="particle"></div>
                  <div style={{ '--angle': '90deg' } as React.CSSProperties} className="particle"></div>
                  <div style={{ '--angle': '120deg' } as React.CSSProperties} className="particle"></div>
                  <div style={{ '--angle': '150deg' } as React.CSSProperties} className="particle"></div>
                  <div style={{ '--angle': '180deg' } as React.CSSProperties} className="particle"></div>
                </div>
              </div>
            </label>
            <motion.button onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-900"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 6px 24px rgba(245,158,11,0.45)' }} whileTap={{ scale: 0.97 }}>
              <Phone className="w-3.5 h-3.5" /> +91 90352 54332
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {(!isSip && !isLS) && (
      <>
        {/* Hero */}
        <section className="relative w-full px-6 pt-24 pb-20 text-center overflow-hidden">
          <MarketChartBg />
          <div className="absolute inset-0 bg-slate-950/60" />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              [<Youtube className="w-4 h-4 text-rose-500" />, '5L+ Subscribers'],
              [<div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>, 'Top-rated'],
              [<Shield className="w-4 h-4 text-emerald-500" />, 'SEBI Regulated Products']
            ].map(([ico, txt]: any, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1, ease }}
                className="flex items-center gap-2 text-sm text-slate-500">{ico}{txt}</motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      </>
      )}

      {(isSip || isLS) && (
        <PageContainer>
          {isSip ? <SIPCalc exp={exp} setExp={setExp} /> : <LSCalc exp={exp} setExp={setExp} />}
        </PageContainer>
      )}

      {/* Consultation */}
      {!isSip && !isLS && (
      <section className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(180deg,#060b14 0%,#061410 50%,#060b14 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <FadeUp className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-amber-300 mb-6"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <Calendar className="w-3.5 h-3.5" /> Free 1-on-1 Consultation
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Numbers are great.<br /><span className="text-amber-400">A plan is better.</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">Tell us where you are. We'll tell you what to do next — in plain language, no jargon, no pressure.</p>
            <p className="text-xs text-slate-600 mt-2">SEBI Regulated Products Only</p>
          </FadeUp>
          {!done ? (
            <FadeUp delay={0.15}>
              <GlassCard>
                <div className="grid grid-cols-3 gap-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {[{ n: '01', t: 'Fill this form', d: '30 seconds. Name & number only.' }, { n: '02', t: 'We call within 24hrs', d: 'Our expert reviews your numbers first.' }, { n: '03', t: 'Get your plan', d: 'Clear next steps. No sales pressure.' }].map((s, i) => (
                    <div key={s.n} className="p-5 text-center" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mx-auto mb-3"
                        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#07090f', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>{s.n}</div>
                      <p className="text-sm font-bold text-white mb-1">{s.t}</p>
                      <p className="text-xs text-slate-500">{s.d}</p>
                    </div>
                  ))}
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField icon={<User className="w-4 h-4" />} label="Full Name" value={fd.name} onChange={(v: string) => setFd({ ...fd, name: v })} placeholder="Your name" />
                    <FormField icon={<Phone className="w-4 h-4" />} label="Contact Number" type="tel" value={fd.phone} onChange={(v: string) => setFd({ ...fd, phone: v })} placeholder="+91 98765 43210" />
                  </div>
                  <div className="mb-6">
                    <label className="text-xs uppercase tracking-widest text-slate-500 mb-3 block">Where are you in your investment journey?</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { v: 'starting', l: 'Just starting out', d: "Haven't invested yet or just started SIP" },
                        { v: 'sip-growing', l: 'Building via SIP', d: 'Regular SIP investor, want to optimise' },
                        { v: 'lumpsum-ready', l: 'Have a lumpsum ready', d: '₹10L+ ready to deploy' },
                        { v: 'hni', l: 'HNI — looking for PMS/AIF', d: '₹50L+ portfolio, want professional management' },
                      ].map(opt => (
                        <motion.button key={opt.v} onClick={() => setFd({ ...fd, cap: opt.v })}
                          className="text-left p-4 rounded-xl border transition"
                          style={{ background: fd.cap === opt.v ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)', border: fd.cap === opt.v ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.06)', boxShadow: fd.cap === opt.v ? '0 0 20px rgba(245,158,11,0.08)' : 'none' }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <div className="flex items-start gap-3">
                            <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition"
                              style={{ borderColor: fd.cap === opt.v ? '#f59e0b' : '#374151' }}>
                              {fd.cap === opt.v && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />}
                            </div>
                            <div><p className="text-sm font-semibold" style={{ color: fd.cap === opt.v ? '#f59e0b' : '#f9fafb' }}>{opt.l}</p><p className="text-xs text-slate-500 mt-0.5">{opt.d}</p></div>
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
                          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderColor: '#0a1628' }}>{i}</div>
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
              <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', boxShadow: '0 0 60px rgba(16,185,129,0.06)' }}>
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
      </section>
      )}

      {/* FAQ */}
      {!isSip && !isLS && (
      <section className="w-full px-6 py-24">
        <FadeUp className="text-center mb-12">
          <h2 className="text-3xl font-black mb-2">Common Questions</h2>
          <p className="text-slate-500">From our YouTube community</p>
        </FadeUp>
        <div className="flex flex-col gap-2">
          {faqs.map((f, i) => (
            <FadeUp key={i} delay={i * 0.04}>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <button onClick={() => setFaq(faq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left transition hover:bg-white/[0.02]">
                  <span className="font-semibold pr-4 text-slate-100">{f.q}</span>
                  <motion.div animate={{ rotate: faq === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {faq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="px-6 py-5 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#060b14' }}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
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
          <div className="pt-6 text-center text-xs text-slate-700" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>© 2026 Angel Investments Content Studios. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
