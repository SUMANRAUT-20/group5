import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { PageHeading } from '../components/UI';
import { calculateTotals, formatMoney, groupByCategory, monthlySeries, todayISO, withinRange } from '../utils/finance';

export default function Reports() {
  const { transactions, profile } = useFinance();
  const [period, setPeriod] = useState('year');
  const filtered = useMemo(() => transactions.filter(t => withinRange(t.date, period)), [transactions, period]);
  const totals = useMemo(() => calculateTotals(filtered), [filtered]);
  const categoryRows = useMemo(() => groupByCategory(filtered), [filtered]);
  const monthly = useMemo(() => monthlySeries(transactions), [transactions]);
  function downloadSummary() {
    const rows = [['Month', 'Income', 'Expenses', 'Net'], ...monthly.map(m => [m.key, m.income, m.expenses, m.income - m.expenses])];
    const content = rows.map(r => r.join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `promoney-summary-${todayISO()}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="standard-page">
    <PageHeading title="Financial Reports" description="Review your income and spending without heavy charts." secondary={<div className="heading-actions"><select value={period} onChange={e => setPeriod(e.target.value)} aria-label="Report period"><option value="month">This month</option><option value="last">Last month</option><option value="year">This year</option><option value="all">All time</option></select><button className="outline-button" onClick={downloadSummary}>Download 12-month CSV</button></div>}/>
    <div className="overview-strip"><div className="metric-strip"><small>Income</small><strong>{formatMoney(totals.income, profile.currency)}</strong></div><div className="metric-strip"><small>Expenses</small><strong>{formatMoney(totals.expenses, profile.currency)}</strong></div><div className="metric-strip"><small>Net</small><strong>{formatMoney(totals.balance, profile.currency)}</strong></div></div>
    <div className="report-grid">
      <section className="data-panel"><h2>Last 12 months</h2><p className="muted">Includes all recorded months below, regardless of the summary period above.</p><div className="table-scroll"><table className="data-table"><thead><tr><th>Month</th><th className="align-right">Income</th><th className="align-right">Expenses</th><th className="align-right">Net</th></tr></thead><tbody>{monthly.map(m => <tr key={m.key}><td>{m.key}</td><td className="align-right">{formatMoney(m.income, profile.currency)}</td><td className="align-right">{formatMoney(m.expenses, profile.currency)}</td><td className="align-right">{formatMoney(m.income-m.expenses, profile.currency)}</td></tr>)}</tbody></table></div></section>
      <section className="data-panel"><h2>Expenses by category</h2><p className="muted">Uses the selected report period.</p><div className="table-scroll"><table className="data-table"><thead><tr><th>Category</th><th className="align-right">Amount</th><th className="align-right">Share</th></tr></thead><tbody>{categoryRows.map(c => <tr key={c.name}><td>{c.name}</td><td className="align-right">{formatMoney(c.amount, profile.currency)}</td><td className="align-right">{totals.expenses ? (c.amount / totals.expenses * 100).toFixed(1) : '0'}%</td></tr>)}</tbody></table></div>{!categoryRows.length && <p className="muted">No expenses in this period.</p>}</section>
    </div>
    <p className="report-cta">Need selected columns, date filters or calculated amounts? <Link to="/custom-report">Open Custom Report →</Link></p>
  </div>;
}
