import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Coins, Home, Heart, Plane, Shield, ArrowDown, Sparkles, Play, CheckCircle2, Calendar, Youtube, Star, ChevronDown, Phone, User, Zap, BarChart2, MessageCircle } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n));
const fmtC = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(2)} L` : `₹${Math.round(n)}`;
const tickFmt = (v: number) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${Math.round(v)}`;
const TT = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', fontSize: '12px' }, formatter: (v: number) => fmtC(v), labelFormatter: (l: number) => `Age ${l}` };

function Slider({ label, value, onChange, min, max, step, suffix = '', prefix = '', format }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
                <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-xs font-bold text-amber-300">{prefix}{format ? format(value) : value}{suffix}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full bg-slate-700 appearance-none cursor-pointer accent-amber-500" />
        </div>
    );
}

function KPI({ icon, label, value, sub, color = 'slate' }: any) {
    const styles: any = { amber: 'border-amber-500/30 bg-amber-500/5', sky: 'border-sky-500/30 bg-sky-500/5', emerald: 'border-emerald-500/30 bg-emerald-500/5', rose: 'border-rose-500/30 bg-rose-500/5', violet: 'border-violet-500/30 bg-violet-500/5', slate: 'border-slate-700/50 bg-slate-800/30' };
    const ic: any = { amber: 'text-amber-400', sky: 'text-sky-400', emerald: 'text-emerald-400', rose: 'text-rose-400', violet: 'text-violet-400', slate: 'text-slate-400' };
    return (
        <div className={`rounded-2xl border p-6 ${styles[color]}`}>
            <div className={`mb-3 ${ic[color]}`}>{icon}</div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</div>
            <div className="text-3xl font-black text-white leading-tight">{value}</div>
            {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
    );
}

function SectionHeader({ n, title, sub }: any) {
    return (
        <div className="flex items-start gap-4 mb-8">
            <span className="text-6xl font-black text-slate-800 leading-none select-none">{n}</span>
            <div className="pt-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
                {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

function ChartCard({ title, children }: any) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">{title}</p>
            {children}
        </div>
    );
}

function ExpenseRow({ icon, label, value, total, color, onChange }: any) {
    const [editing, setEditing] = useState(false);
    const [raw, setRaw] = useState(String(value));
    const commit = () => { onChange(parseInt(raw) || 0); setEditing(false); };
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-300">{icon}<span>{label}</span></div>
                {editing
                    ? <div className="flex items-center gap-1"><span className="text-xs text-slate-400">₹</span>
                        <input autoFocus type="number" value={raw} onChange={e => setRaw(e.target.value)}
                            onBlur={commit} onKeyDown={(e: any) => (e.key === 'Enter' || e.key === 'Escape') && commit()}
                            className="w-28 bg-slate-700 border border-amber-500 rounded px-2 py-0.5 text-sm text-right focus:outline-none" /></div>
                    : <button onClick={() => { setRaw(String(value)); setEditing(true); }} className="flex items-center gap-1.5 group">
                        <span className="text-sm font-semibold">₹{fmt(value)}</span>
                        <span className="text-xs text-slate-600 group-hover:text-amber-400 transition">✏</span>
                    </button>}
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(value / total * 100, 100)}%` }} />
            </div>
        </div>
    );
}

function ExpensePanel({ infExp, customExp, setCustomExp, years }: any) {
    const upd = (k: string, v: number) => setCustomExp((p: any) => ({ ...(p || { food: infExp.food, util: infExp.util, health: infExp.health, leisure: infExp.leisure, buf: infExp.buf }), [k]: v }));
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-4">
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
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="font-semibold text-white">Total Monthly Need</span>
                <div className="text-right">
                    <span className="text-xl font-black text-white">₹{fmt(infExp.total)}</span>
                    {customExp && <button onClick={() => setCustomExp(null)} className="block text-xs text-slate-500 hover:text-amber-400 mt-0.5">↺ reset to auto</button>}
                </div>
            </div>
        </div>
    );
}

function FormField({ icon, label, value, onChange, placeholder, type = 'text' }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">{icon}{label}</label>
            <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition" />
        </div>
    );
}

function showCallToast() {
    const el = document.getElementById('call-toast');
    if (el) { el.style.display = 'flex'; setTimeout(() => { el.style.display = 'none'; }, 3000); }
}

function WithdrawalPanel({ exp, yrs, wd, wMode, setWMode, cW, setCW, wInflationOn, setWInflationOn, wInflation, setWInflation, ryr }: any) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-5 border-b border-slate-800">
                <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Starting monthly withdrawal at retirement</p>
                    <p className="text-3xl font-black text-white">₹{fmt(wd.mw)}<span className="text-sm font-normal text-slate-400">/month</span></p>
                    <p className="text-xs text-slate-500 mt-1">₹{fmt(exp)}/month today × 8% inflation × {yrs} years</p>
                </div>
                <button onClick={() => { setWMode(wMode === 'custom' ? 'auto' : 'custom'); if (wMode === 'auto' && cW === null) setCW(wd.suggestedW); }}
                    className={`self-start sm:self-auto flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold border transition ${wMode === 'custom' ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'border-slate-700 text-slate-400 hover:border-amber-500/30 hover:text-amber-400'}`}>
                    {wMode === 'custom' ? '✓ Manual amount' : '✏ Change amount'}
                </button>
            </div>
            {wMode === 'custom' && (
                <div className="mb-5 pb-5 border-b border-slate-800">
                    <Slider label="Your starting monthly withdrawal" value={cW || wd.suggestedW} onChange={setCW}
                        min={10000} max={Math.max(Math.round(wd.suggestedW * 3), 500000)} step={5000} prefix="₹" format={fmt} />
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((m: number) => (
                            <button key={m} onClick={() => setCW(Math.round(wd.suggestedW * m))}
                                className="px-2 py-1 text-[11px] rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:border-amber-500/40 hover:text-amber-300 transition">
                                {m}x · ₹{fmt(Math.round(wd.suggestedW * m))}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => { setWMode('auto'); setCW(null); }} className="mt-3 text-xs text-slate-500 hover:text-amber-400 transition">↺ Reset to inflation-calculated amount</button>
                </div>
            )}
            <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-white">Annual withdrawal step-up</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {wInflationOn ? `Withdrawal increases ${wInflation}% every year — because inflation doesn't stop when you retire.` : 'OFF — same fixed amount every month. Toggle ON for the realistic picture.'}
                        </p>
                    </div>
                    <button onClick={() => setWInflationOn(!wInflationOn)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold border transition whitespace-nowrap ${wInflationOn ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300'}`}>
                        {wInflationOn ? '✓ Step-up ON' : 'Step-up OFF'}
                    </button>
                </div>
                {wInflationOn && (
                    <div className="mt-4 pt-4 border-t border-indigo-500/15">
                        <Slider label="Annual increase in withdrawal" value={wInflation} onChange={setWInflation} min={3} max={10} step={0.5} suffix="%" />
                    </div>
                )}
            </div>
        </div>
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
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)' }}>
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
    );

    if (shortfall <= 5) return (
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}>
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
    );

    return (
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
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
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)' }}>
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
    );

    if (shortfall <= 5) return (
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}>
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
    );

    return (
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
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
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <Slider label="Monthly SIP" value={sip} onChange={setSip} min={1000} max={1000000} step={1000} prefix="₹" format={fmt} />
                    <Slider label="Annual Step-up" value={su} onChange={setSu} min={0} max={20} step={1} suffix="%" />
                    <Slider label="Expected Returns" value={ret} onChange={setRet} min={8} max={15} step={0.5} suffix="%" />
                    <Slider label="Invest Years" value={yrs} onChange={setYrs} min={10} max={35} step={1} suffix=" yrs" />
                    <Slider label="Starting Age" value={age} onChange={setAge} min={18} max={45} step={1} suffix=" yrs" />
                    <Slider label="Post-Ret Returns" value={pret} onChange={setPret} min={5} max={10} step={0.5} suffix="%" />
                    <Slider label="Retirement Yrs" value={ryr} onChange={setRyr} min={15} max={60} step={1} suffix=" yrs" />
                    <Slider label="Monthly Expenses Now" value={exp} onChange={setExp} min={10000} max={300000} step={5000} prefix="₹" format={fmt} />
                </div>
                <div className="mt-5 pt-5 border-t border-slate-800 flex flex-wrap gap-3">
                    <button onClick={() => setStepOn(!stepOn)} className={`px-4 py-2 rounded-lg text-sm border transition ${stepOn ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'border-slate-700 text-slate-500'}`}>{stepOn ? '✓ Step-up ON' : 'Step-up OFF'}</button>
                    <button onClick={() => setCmp(!cmp)} className={`px-4 py-2 rounded-lg text-sm border transition ${cmp ? 'bg-sky-500/15 border-sky-500/40 text-sky-300' : 'border-slate-700 text-slate-500'}`}>{cmp ? '✓ Comparing Start Age' : 'Compare: Start 10 yrs late'}</button>
                </div>
                <div className="mt-4 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3 text-sm text-amber-200/70">
                    💡 ₹{fmt(exp)}/month today → <strong className="text-amber-300">₹{fmt(inflationNeed)}/month</strong> in {yrs} years at 8% inflation
                </div>
            </div>

            <div>
                <SectionHeader n="01" title="The Seed" sub="Your money compounding quietly for decades" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <KPI icon={<Coins className="w-5 h-5" />} label="You invest" value={fmtC(ti)} sub={`Over ${yrs} years`} />
                    <KPI icon={<TrendingUp className="w-5 h-5" />} label="Corpus at retirement" value={fmtC(stepOn ? fc : fns)} sub={`Age ${age + yrs}`} color="amber" />
                    <KPI icon={<Sparkles className="w-5 h-5" />} label="Wealth multiplier" value={`${((stepOn ? fc : fns) / ti).toFixed(1)}x`} sub="money grown" color="emerald" />
                </div>
                {magic && <div className="mb-6 rounded-xl border-l-4 border-amber-500 bg-amber-500/5 px-5 py-4"><p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Magic Year</p><p className="text-slate-200">At <strong className="text-amber-300">age {magic.age}</strong> your returns ({fmtC(magic.yr)}) beat contributions ({fmtC(magic.yc)}). Compounding takes over.</p></div>}
                <ChartCard title="Corpus growth — the hockey stick">
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={acc}>
                            <defs>
                                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#475569" stopOpacity={0.3} /><stop offset="95%" stopColor="#475569" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="age" stroke="#475569" tick={{ fontSize: 11 }} /><YAxis stroke="#475569" tickFormatter={tickFmt} tick={{ fontSize: 11 }} width={52} />
                            <Tooltip {...TT} />
                            {magic && <ReferenceLine x={magic.age} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Magic Year', fill: '#f59e0b', fontSize: 11 }} />}
                            <Area type="monotone" dataKey="ns" stroke="#475569" strokeWidth={1.5} fill="url(#g2)" name="Flat SIP" />
                            <Area type="monotone" dataKey="corpus" stroke="#f59e0b" strokeWidth={2.5} fill="url(#g1)" name="With step-up" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-5 mt-4 text-sm">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span>With {su}% step-up: {fmtC(fc)}</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500" /><span className="text-slate-400">Flat: {fmtC(fns)}</span></div>
                        <span className="ml-auto text-emerald-400 font-semibold">+{fmtC(fc - fns)} from step-up</span>
                    </div>
                </ChartCard>
                {cmp && cd.length > 0 && <div className="mt-5 rounded-2xl border border-sky-800/30 bg-sky-500/5 p-6"><p className="text-xs uppercase tracking-widest text-sky-400 mb-4">Cost of starting late</p><div className="grid grid-cols-2 gap-5">{cd.map((d: any, i: number) => <div key={i} className={`rounded-xl p-5 border ${i === 0 ? 'border-emerald-700/40 bg-emerald-500/5' : 'border-rose-700/40 bg-rose-500/5'}`}><p className="text-sm text-slate-400 mb-1">{d.l}</p><p className="text-3xl font-black">{fmtC(d.v)}</p></div>)}</div><p className="text-slate-300 mt-4">10-year delay costs <strong className="text-rose-400">{fmtC(cd[0].v - cd[1].v)}</strong></p></div>}
            </div>

            <div>
                <SectionHeader n="02" title="The Harvest" sub="Turning corpus into a monthly paycheck" />
                <WithdrawalPanel exp={exp} yrs={yrs} wd={wd} ryr={ryr} wMode={wMode} setWMode={setWMode} cW={cW} setCW={setCW} wInflationOn={wInflationOn} setWInflationOn={setWInflationOn} wInflation={wInflation} setWInflation={setWInflation} />
                <SIPVerdict wd={wd} ryr={ryr} age={age} yrs={yrs} sip={sip} su={su} ret={ret} stepOn={stepOn} pret={pret} inflationNeed={inflationNeed} wInflationOn={wInflationOn} wInflation={wInflation} />
                {wd.dep && <div className="mb-5 rounded-xl border-l-4 border-rose-500 bg-rose-500/5 px-5 py-4"><p className="text-xs text-rose-400 uppercase tracking-wider mb-1">⚠ Corpus Runs Out</p><p className="text-slate-200">Money runs out at <strong className="text-rose-300">age {wd.dep}</strong> — only {wd.dep - (age + yrs)} years of income, then zero.</p></div>}
                {!wd.dep && wd.bal > 1000000 && <div className="mb-5 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/5 px-5 py-4"><p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">✓ Legacy Left Behind</p><p className="text-slate-200">After {ryr} years you still have <strong className="text-emerald-300">{fmtC(wd.bal)}</strong> left for your family.</p></div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    <KPI icon={<ArrowDown className="w-5 h-5" />} label="Starting withdrawal" value={`₹${fmt(wd.mw)}`} sub="per month (year 1)" color="sky" />
                    <KPI icon={<Coins className="w-5 h-5" />} label="Final year withdrawal" value={`₹${fmt(wd.finalMonthlyW)}`} sub={wInflationOn ? `after ${wInflation}% step-up/yr` : 'flat — no step-up'} color={wInflationOn ? 'rose' : 'slate'} />
                    <KPI icon={<TrendingUp className="w-5 h-5" />} label={wd.dep ? 'Depletes at age' : 'Legacy left'} value={wd.dep ? `${wd.dep}` : fmtC(wd.bal)} color={wd.dep ? 'rose' : 'emerald'} />
                </div>
                <ChartCard title="Full journey — build & spend">
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={jrn}>
                            <defs><linearGradient id="jg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="age" stroke="#475569" tick={{ fontSize: 11 }} /><YAxis stroke="#475569" tickFormatter={tickFmt} tick={{ fontSize: 11 }} width={52} />
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
                <div className={`rounded-2xl border p-8 mb-8 ${V.b}`}><p className="text-xs uppercase tracking-widest text-slate-500 mb-2">The Verdict</p><p className={`text-4xl md:text-5xl font-black mb-2 ${V.c}`}>{V.t}</p><p className="text-slate-300">{V.d}</p></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <ExpensePanel infExp={iExp} customExp={cExp} setCustomExp={setCExp} years={yrs} />
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col">
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">The Bottom Line</p>
                        <div className="flex flex-col flex-1">
                            {[['Starting monthly income', `₹${fmt(wd.mw)}`, 'text-sky-400'], ['Monthly expenses (inflated)', `₹${fmt(iExp.total)}`, 'text-white'], [wd.dep ? 'Corpus runs out' : 'Corpus lasts full retirement', wd.dep ? `Age ${wd.dep}` : `Till age ${retireAge + ryr}`, wd.dep ? 'text-rose-400' : 'text-emerald-400']].map(([l, v, c]: any) => (
                                <div key={l} className="flex justify-between items-center py-4 border-b border-slate-800 last:border-0"><span className="text-slate-400 text-sm">{l}</span><span className={`text-2xl font-black ${c}`}>{v}</span></div>
                            ))}
                        </div>
                        <div className="mt-5 p-4 bg-slate-800/50 rounded-xl text-sm text-slate-300"><strong className="text-amber-300">Why 8% inflation?</strong> 6% general + 2% lifestyle creep. Healthcare at 10% — the silent retirement killer.</div>
                    </div>
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
            <div className="rounded-xl border-l-4 border-violet-500 bg-violet-500/5 px-5 py-4"><p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Lumpsum Retirement Plan</p><p className="text-slate-200">For investors with <strong className="text-violet-300">₹10L or more</strong> ready to deploy today.</p></div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
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
                <div className="mt-5 pt-5 border-t border-slate-800 flex flex-wrap gap-3">
                    <button onClick={() => setTuOn(!tuOn)} className={`px-4 py-2 rounded-lg text-sm border transition ${tuOn ? 'bg-violet-500/15 border-violet-500/40 text-violet-300' : 'border-slate-700 text-slate-500'}`}>{tuOn ? '✓ Annual Top-up ON' : 'Annual Top-up OFF'}</button>
                </div>
                <div className="mt-4 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3 text-sm text-amber-200/70">
                    💡 ₹{fmt(exp)}/month today → <strong className="text-amber-300">₹{fmt(inflationNeedLS)}/month</strong> in {yrs} years at 8% inflation
                </div>
            </div>

            <div>
                <SectionHeader n="01" title="One Investment. Decades of Growth." sub="Watch a single decision compound into a retirement engine" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                    <KPI icon={<Coins className="w-5 h-5" />} label="Total deployed" value={fmtC(ti)} sub={tuOn ? `+top-ups` : 'lumpsum only'} />
                    <KPI icon={<TrendingUp className="w-5 h-5" />} label="Corpus at retirement" value={fmtC(fc)} sub={`Age ${age + yrs}`} color="violet" />
                    <KPI icon={<Sparkles className="w-5 h-5" />} label="Multiplier" value={`${(fc / ti).toFixed(1)}x`} color="emerald" />
                </div>
                {tuOn && <div className="mb-6 rounded-xl border-l-4 border-violet-500 bg-violet-500/5 px-5 py-4"><p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Top-up Impact</p><p className="text-slate-200">Annual top-ups add <strong className="text-violet-300">{fmtC(fc - fcn)}</strong> to your final corpus.</p></div>}
                <ChartCard title="Corpus growth over time">
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={acc}>
                            <defs>
                                <linearGradient id="lsg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                                <linearGradient id="lsg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#475569" stopOpacity={0.3} /><stop offset="95%" stopColor="#475569" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="age" stroke="#475569" tick={{ fontSize: 11 }} /><YAxis stroke="#475569" tickFormatter={tickFmt} tick={{ fontSize: 11 }} width={52} />
                            <Tooltip {...TT} />
                            <Area type="monotone" dataKey="cn" stroke="#475569" strokeWidth={1.5} fill="url(#lsg2)" name="No top-up" />
                            <Area type="monotone" dataKey="corpus" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#lsg1)" name="With top-up" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div>
                <SectionHeader n="02" title="The Harvest" sub="Your corpus converted to monthly income" />
                <WithdrawalPanel exp={exp} yrs={yrs} wd={wd} ryr={ryr} wMode={wMode} setWMode={setWMode} cW={cW} setCW={setCW} wInflationOn={wInflationOn} setWInflationOn={setWInflationOn} wInflation={wInflation} setWInflation={setWInflation} />
                <LSVerdict wd={wd} ryr={ryr} age={age} yrs={yrs} ls={ls} tu={tu} tuOn={tuOn} ret={ret} pret={pret} inflationNeed={inflationNeedLS} wInflationOn={wInflationOn} wInflation={wInflation} />
                {wd.dep && <div className="mb-5 rounded-xl border-l-4 border-rose-500 bg-rose-500/5 px-5 py-4"><p className="text-xs text-rose-400 uppercase tracking-wider mb-1">⚠ Corpus Runs Out</p><p className="text-slate-200">Money runs out at <strong className="text-rose-300">age {wd.dep}</strong>.</p></div>}
                {!wd.dep && wd.bal > 1000000 && <div className="mb-5 rounded-xl border-l-4 border-emerald-500 bg-emerald-500/5 px-5 py-4"><p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">✓ Legacy Left Behind</p><p className="text-slate-200">You leave <strong className="text-emerald-300">{fmtC(wd.bal)}</strong> for your family.</p></div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    <KPI icon={<ArrowDown className="w-5 h-5" />} label="Starting withdrawal" value={`₹${fmt(wd.mw)}`} sub="per month (year 1)" color="sky" />
                    <KPI icon={<Coins className="w-5 h-5" />} label="Final year withdrawal" value={`₹${fmt(wd.finalMonthlyW)}`} sub={wInflationOn ? `after ${wInflation}% step-up/yr` : 'flat — no step-up'} color={wInflationOn ? 'rose' : 'slate'} />
                    <KPI icon={<TrendingUp className="w-5 h-5" />} label={wd.dep ? 'Depletes at age' : 'Legacy left'} value={wd.dep ? `${wd.dep}` : fmtC(wd.bal)} color={wd.dep ? 'rose' : 'emerald'} />
                </div>
                <ChartCard title="Full journey — deploy & withdraw">
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={jrn}>
                            <defs><linearGradient id="lsjg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="age" stroke="#475569" tick={{ fontSize: 11 }} /><YAxis stroke="#475569" tickFormatter={tickFmt} tick={{ fontSize: 11 }} width={52} />
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
                <div className={`rounded-2xl border p-8 mb-8 ${V.b}`}><p className="text-xs uppercase tracking-widest text-slate-500 mb-2">The Verdict</p><p className={`text-4xl md:text-5xl font-black mb-2 ${V.c}`}>{V.t}</p><p className="text-slate-300">{V.d}</p></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <ExpensePanel infExp={iExp} customExp={cExp} setCustomExp={setCExp} years={yrs} />
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col">
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">The Bottom Line</p>
                        <div className="flex flex-col flex-1">
                            {[['Starting monthly income', `₹${fmt(wd.mw)}`, 'text-sky-400'], ['Monthly expenses (inflated)', `₹${fmt(iExp.total)}`, 'text-white'], [wd.dep ? 'Corpus runs out' : 'Corpus lasts full retirement', wd.dep ? `Age ${wd.dep}` : `Till age ${retireAge + ryr}`, wd.dep ? 'text-rose-400' : 'text-emerald-400']].map(([l, v, c]: any) => (
                                <div key={l} className="flex justify-between items-center py-4 border-b border-slate-800 last:border-0"><span className="text-slate-400 text-sm">{l}</span><span className={`text-2xl font-black ${c}`}>{v}</span></div>
                            ))}
                        </div>
                        <div className="mt-5 p-4 bg-slate-800/50 rounded-xl text-sm text-slate-300"><strong className="text-amber-300">Why 8% inflation?</strong> 6% general + 2% lifestyle creep. Healthcare at 10% — the silent retirement killer.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [mode, setMode] = useState('sip'), [exp, setExp] = useState(40000), [faq, setFaq] = useState<number | null>(null), [done, setDone] = useState(false);
    const [fd, setFd] = useState({ name: '', phone: '', cap: '' });

    const submit = async () => {
        if (!fd.name || !fd.phone) return;
        // Store lead locally in sessionStorage until webhook is configured
        const lead = { ...fd, mode, timestamp: new Date().toISOString() };
        const existing = JSON.parse(sessionStorage.getItem('angel_leads') || '[]');
        existing.push(lead);
        sessionStorage.setItem('angel_leads', JSON.stringify(existing));
        console.log('Lead saved:', lead);
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
        <div className="min-h-screen text-slate-100" style={{ background: '#060b14', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

            {/* Toast */}
            <div id="call-toast" style={{ display: 'none' }} className="fixed top-20 left-1/2 z-50 -translate-x-1/2 items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl">
                <Phone className="w-5 h-5" /><div><div className="font-bold">+91 90352 54332</div><div className="text-xs opacity-80">Opens dialer on your phone!</div></div>
            </div>

            {/* Floating call */}
            <button onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full text-white font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', animation: 'pr 2s ease-out infinite' }}>
                <Phone className="w-4 h-4" /><div className="leading-tight"><div className="text-[10px] opacity-70 font-normal">Call us free</div><div className="text-sm">90352 54332</div></div>
            </button>
            <style>{`@keyframes pr{0%{box-shadow:0 0 0 0 rgba(16,185,129,.5)}70%{box-shadow:0 0 0 14px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}`}</style>

            {/* Nav */}
            <nav className="sticky top-0 z-40" style={{ borderBottom: '1px solid #1e293b', backdropFilter: 'blur(16px)', background: 'rgba(6,11,20,0.85)' }}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Angel Investments"
                            className="w-14 h-14 object-contain flex-shrink-0"
                        />
                        <div className="flex flex-col" style={{ paddingTop: '4px' }}>
                            <p className="font-bold text-sm leading-none text-white tracking-wide">Angel Investments</p>
                            <p className="text-[10px] text-amber-400 italic mt-1.5 leading-none">Learn to Earn</p>
                        </div>
                    </div>
                    <button onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-900 transition hover:scale-105"
                        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                        <Phone className="w-3.5 h-3.5" /> +91 90352 54332
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-amber-300 mb-6" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Sparkles className="w-3.5 h-3.5" /> Retirement Reality Check
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-5 leading-tight tracking-tight whitespace-nowrap md:whitespace-normal overflow-hidden" style={{ background: 'linear-gradient(135deg,#fff 40%,#475569)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Will your money last<br />as long as you do?
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">SIP or lumpsum — see if your retirement plan actually works. Adjusted for real Indian inflation, with withdrawal step-up. Takes 60 seconds.</p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <a href="#calc" onClick={(e: any) => { e.preventDefault(); document.getElementById('calc')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-slate-900 transition hover:scale-105"
                        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                        <Play className="w-4 h-4 fill-current" /> Check My Plan
                    </a>
                    <button onClick={() => { window.open('tel:+919035254332', '_self'); showCallToast(); }}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-emerald-300 transition hover:scale-105"
                        style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
                        <Phone className="w-4 h-4" /> Talk to us now
                    </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-10" style={{ borderTop: '1px solid #1e293b' }}>
                    {[
                        [<Youtube className="w-4 h-4 text-rose-500" />, '5L+ Subscribers'],
                        [<div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>, 'Top-rated'],
                        [<Shield className="w-4 h-4 text-emerald-500" />, 'SEBI Regulated Products']
                    ].map(([ico, txt]: any, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-500">{ico}{txt}</div>
                    ))}
                </div>
            </section>

            {/* Toggle + Calculator */}
            <section id="calc" className="max-w-7xl mx-auto px-6 pb-20">
                <div className="flex justify-center mb-10">
                    <div className="inline-flex p-1.5 rounded-2xl gap-1.5" style={{ background: '#0d1520', border: '1px solid #1e293b' }}>
                        <button onClick={() => setMode('sip')}
                            className={`flex items-center gap-3 px-7 py-4 rounded-xl text-sm font-semibold transition ${mode === 'sip' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
                            style={mode === 'sip' ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)' } : {}}>
                            <BarChart2 className="w-5 h-5" />
                            <div className="text-left"><div className="font-bold">SIP Plan</div><div className={`text-xs font-normal ${mode === 'sip' ? 'text-slate-700' : 'text-slate-600'}`}>Monthly investing · Any amount</div></div>
                        </button>
                        <button onClick={() => setMode('lumpsum')}
                            className={`flex items-center gap-3 px-7 py-4 rounded-xl text-sm font-semibold transition ${mode === 'lumpsum' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            style={mode === 'lumpsum' ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' } : {}}>
                            <Zap className="w-5 h-5" />
                            <div className="text-left"><div className="font-bold">Lumpsum Plan</div><div className={`text-xs font-normal ${mode === 'lumpsum' ? 'text-violet-200' : 'text-slate-600'}`}>One-time · Min ₹10 Lakh</div></div>
                        </button>
                    </div>
                </div>
                {mode === 'sip' ? <SIPCalc exp={exp} setExp={setExp} /> : <LSCalc exp={exp} setExp={setExp} />}
            </section>

            {/* Consultation */}
            <section style={{ borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', background: 'linear-gradient(180deg,#060b14 0%,#071a0e 50%,#060b14 100%)' }}>
                <div className="max-w-4xl mx-auto px-6 py-20">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-amber-300 mb-6" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <Calendar className="w-3.5 h-3.5" /> Free 1-on-1 Consultation
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Numbers are great.<br /><span className="text-amber-400">A plan is better.</span></h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Tell us where you are. We'll tell you what to do next — in plain language, no jargon, no pressure.</p>
                        <p className="text-xs text-slate-600 mt-2">SEBI Regulated Products Only</p>
                    </div>
                    {!done ? (
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1520', border: '1px solid #1e293b' }}>
                            <div className="grid grid-cols-3 gap-0" style={{ borderBottom: '1px solid #1e293b' }}>
                                {[{ n: '01', t: 'Fill this form', d: '30 seconds. Name & number only.' }, { n: '02', t: 'We call within 24hrs', d: 'Our expert reviews your numbers first.' }, { n: '03', t: 'Get your plan', d: 'Clear next steps. No sales pressure.' }].map((s, i) => (
                                    <div key={s.n} className="p-5 text-center" style={{ borderRight: i < 2 ? '1px solid #1e293b' : 'none' }}>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mx-auto mb-3" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#07090f' }}>{s.n}</div>
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
                                            { v: 'starting', l: "Just starting out", d: "Haven't invested yet or just started SIP" },
                                            { v: 'sip-growing', l: "Building via SIP", d: "Regular SIP investor, want to optimise" },
                                            { v: 'lumpsum-ready', l: "Have a lumpsum ready", d: "₹10L+ ready to deploy" },
                                            { v: 'hni', l: "HNI — looking for PMS/AIF", d: "₹50L+ portfolio, want professional management" },
                                        ].map(opt => (
                                            <button key={opt.v} onClick={() => setFd({ ...fd, cap: opt.v })}
                                                className="text-left p-4 rounded-xl border transition"
                                                style={{ background: fd.cap === opt.v ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)', border: fd.cap === opt.v ? '1px solid rgba(245,158,11,0.5)' : '1px solid #1e293b' }}>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center" style={{ borderColor: fd.cap === opt.v ? '#f59e0b' : '#374151' }}>
                                                        {fd.cap === opt.v && <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />}
                                                    </div>
                                                    <div><p className="text-sm font-semibold" style={{ color: fd.cap === opt.v ? '#f59e0b' : '#f9fafb' }}>{opt.l}</p><p className="text-xs text-slate-500 mt-0.5">{opt.d}</p></div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={submit} disabled={!fd.name || !fd.phone}
                                    className="w-full py-4 rounded-xl font-black text-lg text-slate-900 transition hover:scale-[1.01] disabled:opacity-40 flex items-center justify-center gap-2 mb-4"
                                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                                    <Calendar className="w-5 h-5" /> Book My Free Consultation
                                </button>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {['RK', 'MS', 'AP', 'VN'].map(i => (
                                            <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 border-2" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderColor: '#0d1520' }}>{i}</div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500">10,000+ investors already consulted</p>
                                </div>
                                <p className="text-xs text-slate-600 text-center mt-3">No spam. Your details are only used to schedule your call.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
                            <h3 className="text-3xl font-black mb-3">You're in, {fd.name.split(' ')[0]}!</h3>
                            <p className="text-slate-400 mb-2">Our team will call you within 24 hours.</p>
                            <p className="text-sm text-slate-500 mb-6">You mentioned: <span className="text-amber-400 font-semibold">{{ starting: 'Getting started with SIP', 'sip-growing': 'Optimising your SIP', 'lumpsum-ready': 'Lumpsum investment', hni: 'PMS / AIF management' }[fd.cap as string] || 'Investment planning'}</span></p>
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-4xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-black text-center mb-2">Common Questions</h2>
                <p className="text-slate-500 text-center mb-10">From our YouTube community</p>
                <div className="flex flex-col gap-2">
                    {faqs.map((f, i) => (
                        <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e293b', background: '#0d1520' }}>
                            <button onClick={() => setFaq(faq === i ? null : i)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/20 transition">
                                <span className="font-semibold pr-4">{f.q}</span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${faq === i ? 'rotate-180' : ''}`} />
                            </button>
                            {faq === i && <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed" style={{ borderTop: '1px solid #1e293b', paddingTop: '14px' }}>{f.a}</div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid #1e293b', background: '#060b14' }}>
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src="/logo.png"
                                    alt="Angel Investments"
                                    className="w-11 h-11 object-contain flex-shrink-0"
                                />
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
                    <div className="pt-6 text-center text-xs text-slate-700" style={{ borderTop: '1px solid #1e293b' }}>© 2026 Angel Investments Content Studios. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
}