import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CheckSquare2, Download, FileSpreadsheet, Filter, Plus, Table2, WandSparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeading, EmptyState } from '../components/UI';
import { formatMoney, monthISO, prettyDate, todayISO, groupByCategory } from '../utils/finance';
const INITIAL_COLUMNS = [{ id: 'date', label: 'Date', show: true }, { id: 'note', label: 'Description', show: true }, { id: 'category', label: 'Category', show: true }, { id: 'type', label: 'Type', show: false }, { id: 'amount', label: 'Amount', show: true }];
export default function CustomReport() {
  const { transactions, categories, profile } = useFinance();
  const [start, setStart] = useState(`${monthISO()}-01`);
  const [end, setEnd] = useState(todayISO());
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [calculation, setCalculation] = useState(false);
  const [operation, setOperation] = useState('percent');
  const [value, setValue] = useState('10');
  const [calcLabel, setCalcLabel] = useState('Calculated Value');
  const [showChart, setShowChart] = useState(true);
  const [error, setError] = useState('');
  const visible = columns.filter(c => c.show || calculation && c.id === 'amount');
  const allCategories = [...new Set(categories.filter(c => type === 'all' || c.type === type).map(c => c.name))];
  const rows = useMemo(() => transactions.filter(t => (!start || t.date >= start) && (!end || t.date <= end) && (type === 'all' || t.type === type) && (category === 'all' || t.category === category)).sort((a, b) => b.date.localeCompare(a.date)), [transactions, start, end, type, category]);
  const numericValue = Number(value);
  function compute(amount) {
    if (!Number.isFinite(numericValue)) return null;
    if (operation === 'percent') return amount * numericValue / 100;
    if (operation === 'multiply') return amount * numericValue;
    if (operation === 'add') return amount + numericValue;
    if (operation === 'subtract') return amount - numericValue;
    return amount;
  }
  function showValue(id, tx) { if (id === 'date') return prettyDate(tx.date); if (id === 'amount') return formatMoney(tx.amount, profile.currency); if (id === 'type') return tx.type === 'income' ? 'Income' : 'Expense'; return tx[id]; }
  function move(index, delta) { setColumns(prev => { const next = [...prev]; const to = index + delta; if (to < 0 || to >= next.length) return prev; [next[index], next[to]] = [next[to], next[index]]; return next; }); }
  function exportCSV() {
    if (start && end && start > end) return setError('Start date must be before end date.');
    if (!visible.length) return setError('Select at least one column for your report.');
    if (calculation && (!Number.isFinite(numericValue) || !calcLabel.trim())) return setError('Enter a valid calculation value and column name.');
    const formatRow = cells => cells.map(x => `"${String(x ?? '').replaceAll('"', '""')}"`).join(',');
    const csv = [formatRow([...visible.map(c => c.label), ...(calculation ? [calcLabel] : [])]), ...rows.map(t => formatRow([...visible.map(c => c.id === 'amount' ? t.amount : c.id === 'type' ? t.type : t[c.id]), ...(calculation ? [compute(t.amount)?.toFixed(2)] : [])]))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `promoney-custom-report-${todayISO()}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setError('');
  }
  const chartRows = groupByCategory(rows).slice(0, 5);
  const chartMax = Math.max(1, ...chartRows.map(x => x.amount));
  return <div className="standard-page"><PageHeading eyebrow="REPORT BUILDER" title="Generate Custom Report" description="Choose exactly what you want to see, preview the results, and export your own report." secondary={<button className="primary-button" onClick={exportCSV}><Download size={18}/> Export Report</button>}/>
    <div className="report-builder-grid">
      <div className="builder-config">
        <section className="glass data-panel builder-panel"><h2><Filter size={19}/> 1. Filter your data</h2><p className="muted">Only matching transactions will appear in your report.</p><div className="filter-fields"><label className="field"><span>Start date</span><input type="date" value={start} onChange={e => setStart(e.target.value)}/></label><label className="field"><span>End date</span><input type="date" value={end} onChange={e => setEnd(e.target.value)}/></label><label className="field"><span>Transaction type</span><select value={type} onChange={e => { setType(e.target.value); setCategory('all'); }}><option value="all">Income & Expenses</option><option value="income">Income only</option><option value="expense">Expenses only</option></select></label><label className="field"><span>Category</span><select value={category} onChange={e => setCategory(e.target.value)}><option value="all">All categories</option>{allCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></label></div></section>
        <section className="glass data-panel builder-panel"><h2><Table2 size={19}/> 2. Choose your columns</h2><p className="muted">Turn columns on or off, rename them, or change their order.</p><div className="column-editor">{columns.map((column, i) => <div className="column-edit-row" key={column.id}><label className="check-toggle"><input type="checkbox" checked={column.show || calculation && column.id === 'amount'} disabled={calculation && column.id === 'amount'} onChange={e => setColumns(prev => prev.map(c => c.id === column.id ? { ...c, show: e.target.checked } : c))}/><span/></label><input aria-label={`Column title for ${column.id}`} value={column.label} onChange={e => setColumns(prev => prev.map(c => c.id === column.id ? { ...c, label: e.target.value } : c))}/><div className="reorder-actions"><button disabled={!i} aria-label={`Move ${column.label} up`} onClick={() => move(i, -1)}><ArrowUp size={15}/></button><button disabled={i === columns.length - 1} aria-label={`Move ${column.label} down`} onClick={() => move(i, 1)}><ArrowDown size={15}/></button></div></div>)}</div></section>
        <section className="glass data-panel builder-panel"><h2><WandSparkles size={19}/> 3. Add a calculation</h2><p className="muted">Optional, safe calculations using each transaction's amount.</p><label className="switch-line"><input type="checkbox" checked={calculation} onChange={e => setCalculation(e.target.checked)}/><span>Add calculated column</span></label>{calculation && <div className="calculation-fields"><label className="field"><span>Calculation</span><select value={operation} onChange={e => setOperation(e.target.value)}><option value="percent">Amount × percentage (%)</option><option value="multiply">Amount × number</option><option value="add">Amount + number</option><option value="subtract">Amount − number</option></select></label><label className="field"><span>{operation === 'percent' ? 'Percentage (%)' : 'Number'}</span><input type="number" step="any" value={value} onChange={e => setValue(e.target.value)}/></label><label className="field wide-field"><span>Output column name</span><input value={calcLabel} onChange={e => setCalcLabel(e.target.value)} placeholder="e.g. Tax Estimate"/></label></div>}<label className="switch-line"><input type="checkbox" checked={showChart} onChange={e => setShowChart(e.target.checked)}/><span>Show category chart in preview</span></label></section>
      </div>
      <div className="builder-preview"><section className="glass data-panel preview-panel"><div className="preview-title"><div><span className="eyebrow">LIVE PREVIEW</span><h2>Report Results</h2><p className="muted">{rows.length} matching transactions</p></div><span className="preview-count"><FileSpreadsheet size={22}/></span></div>{error && <p className="validation-error">{error}</p>}{start && end && start > end && <p className="validation-error">Start date must be before end date.</p>}{visible.length ? <div className="table-scroll"><table className="data-table compact-table"><thead><tr>{visible.map(c => <th key={c.id}>{c.label || c.id}</th>)}{calculation && <th>{calcLabel || 'Calculation'}</th>}</tr></thead><tbody>{rows.slice(0, 12).map(t => <tr key={t.id}>{visible.map(c => <td key={c.id}>{showValue(c.id, t)}</td>)}{calculation && <td className="amount-positive">{compute(t.amount) === null ? 'Invalid value' : formatMoney(compute(t.amount), profile.currency)}</td>}</tr>)}</tbody></table></div> : <EmptyState title="Select a report column" detail="Switch on at least one column to preview results."/>}{!rows.length && visible.length && <EmptyState title="No matching transactions" detail="Try broadening the report filters."/>}{rows.length > 12 && <p className="preview-limited">Showing the first 12 rows. CSV export includes all {rows.length}.</p>}</section>
        {showChart && <section className="glass data-panel preview-chart-panel"><h2>Spending by category</h2><p className="muted">Top expense categories matching your filters</p><div className="category-breakdown">{chartRows.length ? chartRows.map((c, i) => <div className="breakdown-row" key={c.name}><div><strong>{c.name}</strong><span>{formatMoney(c.amount, profile.currency)}</span></div><div className="track-rail"><span style={{ width: `${c.amount / chartMax * 100}%`, background: ['#51b9ff','#8c6afa','#32dabc','#e85aa9','#ffc16b'][i] }}/></div></div>) : <p className="muted">No expense data in this selection.</p>}</div></section>}
      </div>
    </div>
  </div>;
}
