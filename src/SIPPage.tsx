import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Sparkles, Coins } from 'lucide-react';

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

function SliderInput({ label, value, onChange, min, max, step, suffix = '', prefix = '', format, accent = '#f59e0b' }: any) {
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

function DonutLabel({ viewBox, corpus }: any) {
  const { cx, cy } = viewBox;
  return (
    <text textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} y={cy - 10} fill="#94a3b8" fontSize="10" fontWeight="600" letterSpacing="1.5">CORPUS</tspan>
      <tspan x={cx} y={cy + 12} fill="#f9fafb" fontSize="17" fontWeight="900">{fmtC(corpus)}</tspan>
    </text>
  );
}

export function SIPPage() {
  const [sip, setSip] = useState(5000);
  const [duration, setDuration] = useState(20);
  const [returns, setReturns] = useState(12);
  const [stepUpOn, setStepUpOn] = useState(true);
  const [stepUp, setStepUp] = useState(10);
  const [topUpOn, setTopUpOn] = useState(false);
  const [topUp, setTopUp] = useState(12000);

  const { corpus, invested, gains, multiplier, chartData } = useMemo(() => {
    let c = 0, totalInv = 0;
    let monthSip = sip;
    const mr = returns / 100 / 12;
    const chart: { year: number; corpus: number; invested: number }[] = [];
    for (let y = 0; y < duration; y++) {
      for (let m = 0; m < 12; m++) {
        c = (c + monthSip) * (1 + mr);
        totalInv += monthSip;
      }
      if (topUpOn) { c += topUp; totalInv += topUp; }
      chart.push({ year: y + 1, corpus: Math.round(c), invested: Math.round(totalInv) });
      if (stepUpOn && y < duration - 1) monthSip *= (1 + stepUp / 100);
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
  }, [sip, duration, returns, stepUpOn, stepUp, topUpOn, topUp]);

  const donutData = [
    { name: 'Invested', value: invested, color: '#f59e0b' },
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
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
            <TrendingUp className="w-3.5 h-3.5" /> SIP Calculator
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Build Wealth,{' '}
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One Month at a Time
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Calculate how your monthly SIP grows over time — with step-up and annual top-up features built in.
          </p>
        </FadeUp>

        {/* Main grid: inputs left, results right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 items-start">

          {/* Inputs */}
          <FadeUp delay={0.1}>
            <GlassCard className="p-6">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-6">Configure Your SIP</p>
              <div className="flex flex-col gap-6">
                <SliderInput label="Monthly SIP" value={sip} onChange={setSip} min={500} max={500000} step={500} prefix="₹" format={fmt} />
                <SliderInput label="Duration" value={duration} onChange={setDuration} min={1} max={40} step={1} suffix=" yrs" />
                <SliderInput label="Expected Returns" value={returns} onChange={setReturns} min={6} max={20} step={0.5} suffix="% p.a." />

                {/* Feature toggles */}
                <div className="flex flex-wrap gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <motion.button onClick={() => setStepUpOn(!stepUpOn)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition"
                    style={stepUpOn
                      ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }
                      : { background: 'transparent', border: '1px solid var(--border)', color: '#64748b' }}>
                    {stepUpOn ? '✓ Step-up ON' : 'Step-up OFF'}
                  </motion.button>
                  <motion.button onClick={() => setTopUpOn(!topUpOn)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition"
                    style={topUpOn
                      ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }
                      : { background: 'transparent', border: '1px solid var(--border)', color: '#64748b' }}>
                    {topUpOn ? '✓ Annual Top-up ON' : 'Annual Top-up OFF'}
                  </motion.button>
                </div>

                {/* Conditional sliders */}
                {stepUpOn && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <SliderInput label="Annual Step-up %" value={stepUp} onChange={setStepUp} min={0} max={30} step={1} suffix="%" />
                  </motion.div>
                )}
                {topUpOn && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <SliderInput label="Annual Top-up Amount" value={topUp} onChange={setTopUp} min={1000} max={1000000} step={1000} prefix="₹" format={fmt} accent="#10b981" />
                  </motion.div>
                )}
              </div>

              {/* Insight pill */}
              <div className="mt-6 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <span className="text-amber-200/60">₹{fmt(sip)}/month × {duration} yrs → </span>
                <strong className="text-amber-300">{fmtC(corpus)}</strong>
                <span className="text-amber-200/60"> at {returns}% p.a.</span>
              </div>
            </GlassCard>
          </FadeUp>

          {/* Results */}
          <div className="flex flex-col gap-6">

            {/* Donut chart */}
            <FadeUp delay={0.15}>
              <GlassCard className="p-6">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Corpus Breakdown</p>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%" cy="50%"
                        innerRadius={72} outerRadius={105}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={(props: any) => <DonutLabel viewBox={props.viewBox} corpus={corpus} />}
                        isAnimationActive
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
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
                  { label: 'Invested', value: fmtC(invested), color: '#f59e0b', icon: <Coins className="w-4 h-4" /> },
                  { label: 'Returns', value: fmtC(gains), color: '#10b981', icon: <TrendingUp className="w-4 h-4" /> },
                  { label: 'Multiplier', value: `${multiplier.toFixed(1)}×`, color: '#8b5cf6', icon: <Sparkles className="w-4 h-4" /> },
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
                  <linearGradient id="sipCorpusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sipInvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="year" stroke={axisColor} tick={{ fontSize: 11, fill: tickColor }} tickFormatter={v => `Yr ${v}`} />
                <YAxis stroke={axisColor} tickFormatter={tickFmt} tick={{ fontSize: 11, fill: tickColor }} width={52} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="invested" stroke={axisColor} strokeWidth={1.5} fill="url(#sipInvGrad)" name="Invested" />
                <Area type="monotone" dataKey="corpus" stroke="#f59e0b" strokeWidth={2.5} fill="url(#sipCorpusGrad)" name="Corpus" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-5 mt-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span>Corpus: {fmtC(corpus)}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500" /><span className="text-slate-400">Invested: {fmtC(invested)}</span></div>
              <span className="ml-auto text-emerald-400 font-semibold">+{fmtC(gains)} in returns</span>
            </div>
          </GlassCard>
        </FadeUp>

        {/* Summary banner */}
        <FadeUp delay={0.3}>
          <div className="rounded-2xl px-6 py-5" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-slate-400">Investing</span>
              <strong className="text-white">₹{fmt(sip)}/month</strong>
              {stepUpOn && <><span className="text-slate-400">with</span><strong className="text-amber-300">{stepUp}% annual step-up</strong></>}
              <span className="text-slate-400">for</span>
              <strong className="text-white">{duration} years</strong>
              <span className="text-slate-400">at</span>
              <strong className="text-white">{returns}% p.a.</strong>
              <span className="text-slate-400">grows to</span>
              <strong className="text-amber-300 text-base">{fmtC(corpus)}</strong>
              <span className="text-slate-500">— a</span>
              <strong className="text-emerald-400">{multiplier.toFixed(1)}× multiplier</strong>
            </div>
          </div>
        </FadeUp>

      </div>
    </div>
  );
}
