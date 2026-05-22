import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Coins, Sparkles, TrendingUp } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n));
const fmtC = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` :
  n >= 100000 ? `₹${(n / 100000).toFixed(2)} L` :
  `₹${Math.round(n)}`;
const tickFmt = (v: number) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${Math.round(v)}`;

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

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

function GlassCard({ children, className = '' }: any) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 4px 32px var(--shadow)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--card-shimmer), transparent)' }} />
      {children}
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step, suffix = '', prefix = '', format, accent = '#8b5cf6' }: any) {
  const [inputVal, setInputVal] = useState('');
  const [editing, setEditing] = useState(false);
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
        <input
          type="text"
          value={editing ? inputVal : (format ? format(value) : `${prefix}${value}${suffix}`)}
          onFocus={() => { setEditing(true); setInputVal(String(value)); }}
          onChange={e => setInputVal(e.target.value)}
          onBlur={() => {
            setEditing(false);
            const n = parseFloat(String(inputVal).replace(/[^0-9.]/g, ''));
            if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          style={{ color: accent, borderBottom: `1px solid ${accent}66` }}
          className="text-xs font-bold tabular-nums bg-transparent text-right w-28 outline-none"
        />
      </div>
      <div className="relative h-1.5 rounded-full" style={{ background: 'var(--track-bg)' }}>
        <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-75"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}88, ${accent})`, boxShadow: `0 0 8px ${accent}55` }} />
        <input type="range" min={min} max={max} step={step} value={Math.min(max, value)}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0" style={{ height: '100%', zIndex: 2 }} />
      </div>
    </div>
  );
}

function DonutCenter({ corpus }: { corpus: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Corpus</p>
      <p style={{ fontSize: '17px', color: '#f9fafb', fontWeight: 900, lineHeight: 1.2 }}>{fmtC(corpus)}</p>
    </div>
  );
}

export function LumpsumPage() {
  const [amount, setAmount] = useState(1000000);
  const [duration, setDuration] = useState(20);
  const [returns, setReturns] = useState(12);
  const [topUpOn, setTopUpOn] = useState(false);
  const [topUp, setTopUp] = useState(100000);

  const { corpus, invested, gains, multiplier, chartData } = useMemo(() => {
    let c = amount, totalInv = amount;
    const r = returns / 100;
    const chart: { year: number; corpus: number; invested: number }[] = [];
    for (let y = 0; y < duration; y++) {
      c = c * (1 + r);
      if (topUpOn) { c += topUp; totalInv += topUp; }
      chart.push({ year: y + 1, corpus: Math.round(c), invested: Math.round(totalInv) });
    }
    const finalCorpus = Math.round(c);
    const finalInvested = Math.round(totalInv);
    return {
      corpus: finalCorpus,
      invested: finalInvested,
      gains: finalCorpus - finalInvested,
      multiplier: finalCorpus / finalInvested,
      chartData: chart,
    };
  }, [amount, duration, returns, topUpOn, topUp]);

  const donutData = [
    { name: 'Invested', value: invested, color: '#8b5cf6' },
    { name: 'Gains', value: Math.max(0, gains), color: '#10b981' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: 'var(--tooltip-text)' }}>
        <p style={{ color: payload[0].payload.color }} className="font-bold">{payload[0].name}</p>
        <p>{fmtC(payload[0].value)}</p>
      </div>
    );
  };

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: 'var(--tooltip-text)' }}>
        <p className="text-slate-400 mb-1">Year {label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.stroke || p.fill }}>{p.name}: {fmtC(p.value)}</p>)}
      </div>
    );
  };

  const gridColor = 'rgba(255,255,255,0.04)';
  const axisColor = '#334155';
  const tickColor = '#475569';

  return (
    <div className="w-full px-4 sm:px-6 py-10 md:py-14">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Page header */}
        <FadeUp>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
            <Coins className="w-3.5 h-3.5" /> Lumpsum Calculator
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            One Decision.{' '}
            <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Decades of Returns.
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            See how a one-time investment compounds over time — with optional annual top-ups to supercharge growth.
          </p>
        </FadeUp>

        {/* Main grid: inputs left, results right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 items-start">

          {/* Inputs */}
          <FadeUp delay={0.1}>
            <GlassCard className="p-6">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-6">Configure Your Investment</p>
              <div className="flex flex-col gap-6">
                <SliderInput label="Lumpsum Amount" value={amount} onChange={setAmount} min={10000} max={100000000} step={10000} prefix="₹" format={fmtC} />
                <SliderInput label="Duration" value={duration} onChange={setDuration} min={1} max={40} step={1} suffix=" yrs" />
                <SliderInput label="Expected Returns" value={returns} onChange={setReturns} min={6} max={20} step={0.5} suffix="% p.a." />

                {/* Annual top-up toggle */}
                <div className="flex flex-wrap gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <motion.button onClick={() => setTopUpOn(!topUpOn)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition"
                    style={topUpOn
                      ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }
                      : { background: 'transparent', border: '1px solid var(--border)', color: '#64748b' }}>
                    {topUpOn ? '✓ Annual Top-up ON' : 'Annual Top-up OFF'}
                  </motion.button>
                </div>

                {topUpOn && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <SliderInput label="Annual Top-up Amount" value={topUp} onChange={setTopUp} min={1000} max={5000000} step={5000} prefix="₹" format={fmtC} accent="#10b981" />
                  </motion.div>
                )}
              </div>

              {/* Insight pill */}
              <div className="mt-6 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
                <span className="text-violet-300/60">{fmtC(amount)} deployed for {duration} yrs → </span>
                <strong className="text-violet-300">{fmtC(corpus)}</strong>
                <span className="text-violet-300/60"> at {returns}% p.a.</span>
              </div>
            </GlassCard>
          </FadeUp>

          {/* Results */}
          <div className="flex flex-col gap-6">

            {/* Donut chart */}
            <FadeUp delay={0.15}>
              <GlassCard className="p-6">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Corpus Breakdown</p>
                <div className="relative" style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%" cy="50%"
                        innerRadius={72} outerRadius={105}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        isAnimationActive
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <DonutCenter corpus={corpus} />
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-8 mt-3">
                  {donutData.map(d => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider">{d.name}</p>
                        <p className="text-sm font-black text-white">{fmtC(d.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </FadeUp>

            {/* KPI row */}
            <FadeUp delay={0.2}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Invested', value: fmtC(invested), color: '#8b5cf6', icon: <Coins className="w-4 h-4" /> },
                  { label: 'Returns', value: fmtC(gains), color: '#10b981', icon: <TrendingUp className="w-4 h-4" /> },
                  { label: 'Multiplier', value: `${multiplier.toFixed(1)}×`, color: '#f59e0b', icon: <Sparkles className="w-4 h-4" /> },
                ].map(k => (
                  <div key={k.label} className="rounded-2xl p-4 flex flex-col items-center text-center"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                    <div className="mb-2" style={{ color: k.color }}>{k.icon}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{k.label}</div>
                    <div className="text-sm font-black leading-tight" style={{ color: k.color }}>{k.value}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>

        {/* Growth chart */}
        <FadeUp delay={0.25}>
          <GlassCard className="p-6">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-6">Corpus Growth Over Time</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="lsCorpusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lsInvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="year" stroke={axisColor} tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => `Yr ${v}`} />
                <YAxis stroke={axisColor} tickFormatter={tickFmt} tick={{ fontSize: 11, fill: tickColor }} width={52} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="invested" stroke={axisColor} strokeWidth={1.5} fill="url(#lsInvGrad)" name="Invested" />
                <Area type="monotone" dataKey="corpus" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#lsCorpusGrad)" name="Corpus" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-5 mt-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#8b5cf6' }} /><span>Corpus: {fmtC(corpus)}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500" /><span className="text-slate-400">Invested: {fmtC(invested)}</span></div>
              <span className="ml-auto text-emerald-400 font-semibold">+{fmtC(gains)} in returns</span>
            </div>
          </GlassCard>
        </FadeUp>

        {/* Summary banner */}
        <FadeUp delay={0.3}>
          <div className="rounded-2xl px-6 py-5" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed">
              <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <span className="text-slate-400">Investing</span>
              <strong className="text-white">{fmtC(amount)}</strong>
              {topUpOn && <><span className="text-slate-400">with</span><strong className="text-emerald-300">{fmtC(topUp)}/yr top-up</strong></>}
              <span className="text-slate-400">for</span>
              <strong className="text-white">{duration} years</strong>
              <span className="text-slate-400">at</span>
              <strong className="text-white">{returns}% p.a.</strong>
              <span className="text-slate-400">grows to</span>
              <strong className="text-violet-300 text-base">{fmtC(corpus)}</strong>
              <span className="text-slate-500">— a</span>
              <strong className="text-emerald-400">{multiplier.toFixed(1)}× multiplier</strong>
            </div>
          </div>
        </FadeUp>

      </div>
    </div>
  );
}
