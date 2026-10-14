export const todayISO = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export function monthISO(delta = 0) {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + delta, 1, 12).toISOString().slice(0, 7);
}
export function monthDate(delta, day = 5) { return `${monthISO(delta)}-${String(day).padStart(2, '0')}`; }
export function addDays(delta) {
  const d = new Date();
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// Reuse expensive Intl formatters when tables/charts contain many values.
const currencyFormatters = new Map();
export function formatMoney(value, currency = 'USD', digits = 2) {
  try {
    const key = `${currency}:${digits}`;
    if (!currencyFormatters.has(key)) currencyFormatters.set(key, new Intl.NumberFormat('en-US', {
      style: 'currency', currency, minimumFractionDigits: digits, maximumFractionDigits: digits,
    }));
    return currencyFormatters.get(key).format(Number(value) || 0);
  } catch { return `$${(Number(value) || 0).toFixed(digits)}`; }
}
export function shortMoney(value, currency = 'USD') { return formatMoney(value, currency, 0); }
export function prettyDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return '—';
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', options);
}
export function dayDifference(date) {
  const target = new Date(`${date}T12:00:00`);
  const now = new Date(`${todayISO()}T12:00:00`);
  return Math.round((target - now) / 86400000);
}
export function withinRange(date, period, start, end) {
  if (period === 'all') return true;
  if (period === 'custom') return (!start || date >= start) && (!end || date <= end);
  if (period === 'last') return date.slice(0, 7) === monthISO(-1);
  if (period === 'year') return date.slice(0, 4) === todayISO().slice(0, 4);
  return date.slice(0, 7) === monthISO(0);
}
export function calculateTotals(transactions) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  return { income, expenses, balance: income - expenses };
}
export function groupByCategory(transactions) {
  return Object.entries(transactions.filter(t => t.type === 'expense').reduce((o, t) => {
    o[t.category] = (o[t.category] || 0) + Number(t.amount); return o;
  }, {})).sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name, amount }));
}
export const CATEGORY_COLORS = ['#f453c4', '#ffa18f', '#50e1d9', '#4facff', '#8c6cfa', '#a8b8ff', '#ffcf75', '#47dbc0'];

// Group all transactions once rather than filtering the entire array 12
// times whenever a dashboard or reporting component renders.
export function monthlySeries(transactions, count = 12) {
  const months = Array.from({ length: count }, (_, index) => {
    const key = monthISO(index + 1 - count);
    return {
      key,
      month: new Date(`${key}-15T12:00:00`).toLocaleDateString('en-US', { month: 'short' }),
      income: 0,
      expenses: 0,
    };
  });
  const byMonth = new Map(months.map(m => [m.key, m]));
  for (const tx of transactions) {
    const bucket = byMonth.get(tx.date.slice(0, 7));
    if (bucket) bucket[tx.type === 'income' ? 'income' : 'expenses'] += Number(tx.amount) || 0;
  }
  return months;
}
