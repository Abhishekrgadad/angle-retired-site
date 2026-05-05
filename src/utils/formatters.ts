export const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN').format(Math.round(n));

export const fmtC = (n: number) =>
  n >= 10_000_000
    ? `₹${(n / 10_000_000).toFixed(2)} Cr`
    : n >= 100_000
    ? `₹${(n / 100_000).toFixed(2)} L`
    : `₹${Math.round(n)}`;

export const tickFmt = (v: number) =>
  v >= 10_000_000
    ? `${(v / 10_000_000).toFixed(1)}Cr`
    : v >= 100_000
    ? `${(v / 100_000).toFixed(0)}L`
    : `${Math.round(v)}`;

export const TT = {
  contentStyle: {
    backgroundColor: '#050c18',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  formatter: (v: number) => fmtC(v),
  labelFormatter: (l: number) => `Age ${l}`,
};
