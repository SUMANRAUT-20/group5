import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { calculateTotals, formatMoney, groupByCategory, prettyDate, withinRange } from '../utils/finance';
import { ProgressBar } from '../components/UI';

export default function Dashboard() {
  const { transactions, budgets, goals, profile } = useFinance();
  const [period, setPeriod] = useState('month');
  const filtered = useMemo(() => transactions.filter(t => withinRange(t.date, period)), [transactions, period]);
  const totals = useMemo(() => calculateTotals(filtered), [filtered]);
  const categories = useMemo(() => groupByCategory(filtered), [filtered]);
  const monthSpent = useMemo(() => new Map(groupByCategory(transactions.filter(t => withinRange(t.date, 'month'))).map(c => [c.name, c.amount])), [transactions]);
  const recent = useMemo(() => [...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8), [filtered]);
  const budgetTotal = budgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetUsed = budgets.reduce((sum, b) => sum + (monthSpent.get(b.category) || 0), 0);
  return <div className="standard-page">
    <div className="page-heading">
      <div><h1>Dashboard</h1><p>Your money overview at a glance.</p></div>
      <label className="field period-control"><span>Period</span><select value={period} onChange={e => setPeriod(e.target.value)}><option value="month">This month</option><option value="last">Last month</option><option value="year">This year</option><option value="all">All time</option></select></label>
    </div>
    <div className="stats-grid">
      <div className="metric-strip"><small>Income</small><strong>{formatMoney(totals.income, profile.currency)}</strong></div>
      <div className="metric-strip"><small>Expenses</small><strong>{formatMoney(totals.expenses, profile.currency)}</strong></div>
      <div className="metric-strip"><small>Net balance</small><strong>{formatMoney(totals.balance, profile.currency)}</strong></div>
      <div className="metric-strip"><small>Transactions</small><strong>{filtered.length}</strong></div>
    </div>
    <div className="quick-actions"><Link className="primary-button" to="/income">Income records</Link><Link className="outline-button" to="/expenses">Expense records</Link><Link className="outline-button" to="/budgets">Manage budgets</Link><Link className="outline-button" to="/custom-report">Custom report</Link></div>
    <div className="dashboard-columns">
      <section className="data-panel"><div className="section-title"><h2>Recent transactions</h2><Link to="/expenses">View all</Link></div>{recent.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th className="align-right">Amount</th></tr></thead><tbody>{recent.map(t => <tr key={t.id}><td>{prettyDate(t.date)}</td><td>{t.note}</td><td>{t.category}</td><td className={`align-right ${t.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>{t.type === 'income' ? '+' : '-'}{formatMoney(t.amount, profile.currency)}</td></tr>)}</tbody></table></div> : <p className="muted">No transactions in this period.</p>}</section>
      <div className="dashboard-summary">
        <section className="data-panel"><div className="section-title"><h2>Top expense categories</h2><Link to="/reports">Reports</Link></div>{categories.slice(0, 5).map(c => <div className="simple-row" key={c.name}><span>{c.name}</span><strong>{formatMoney(c.amount, profile.currency)}</strong></div>)}{!categories.length && <p className="muted">No expenses for this period.</p>}</section>
        <section className="data-panel"><div className="section-title"><h2>Budget overview</h2><Link to="/budgets">Details</Link></div><p className="small-label">Budgeted spending: {formatMoney(budgetUsed, profile.currency)} / {formatMoney(budgetTotal, profile.currency)}</p><ProgressBar value={budgetTotal ? budgetUsed / budgetTotal * 100 : 0}/><p className="muted">Budget limits are monthly; compare them with this month's expenses on the Budgets page.</p></section>
        <section className="data-panel"><div className="section-title"><h2>Savings goals</h2><Link to="/savings">Details</Link></div>{goals.slice(0, 3).map(g => <div className="goal-line" key={g.id}><div className="simple-row"><span>{g.name}</span><strong>{Math.round(g.target ? g.saved / g.target * 100 : 0)}%</strong></div><ProgressBar value={g.target ? g.saved / g.target * 100 : 0}/></div>)}{!goals.length && <p className="muted">No goals yet.</p>}</section>
      </div>
    </div>
  </div>;
}
