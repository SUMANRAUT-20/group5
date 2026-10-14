import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Download, Edit3, Trash2, ReceiptText, Search, Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeading, Modal, EmptyState, SelectField, InputField, SearchBox } from '../components/UI';
import { formatMoney, prettyDate, todayISO, withinRange } from '../utils/finance';

const PAGE_SIZE = 50;
const blankTx = type => ({ type, amount: '', category: '', note: '', date: todayISO() });
export function TransactionPage({ type }) {
  const { transactions, categories, addTransaction, updateTransaction, removeTransaction, profile } = useFinance();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const [period, setPeriod] = useState('month');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(blankTx(type));
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const isIncome = type === 'income';
  const title = isIncome ? 'Income' : 'Expenses';
  const catOptions = categories.filter(c => c.type === type);
  const rows = useMemo(() => transactions.filter(t => t.type === type && withinRange(t.date, period) && `${t.category} ${t.note} ${t.amount}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)), [transactions, type, period, search]);
  const total = useMemo(() => rows.reduce((s, t) => s + Number(t.amount), 0), [rows]);
  const visibleRows = rows.slice(0, page * PAGE_SIZE);
  function openNew() { setEditId(null); setForm({ ...blankTx(type), category: catOptions[0]?.name || '' }); setError(''); setModalOpen(true); }
  function openEdit(tx) { setEditId(tx.id); setForm({ ...tx }); setError(''); setModalOpen(true); }
  function save(e) { e.preventDefault(); if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0 || !form.note.trim() || !form.category || !form.date) { setError('Enter a positive amount, category, description, and date.'); return; } const value = { ...form, note: form.note.trim(), amount: Number(form.amount) }; if (editId) updateTransaction(editId, value); else addTransaction(value); setModalOpen(false); }
  function downloadCSV() { const cells = [['Date', 'Description', 'Category', 'Amount'], ...rows.map(t => [t.date, t.note, t.category, t.amount])]; const csv = cells.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); a.download = `promoney-${type}-${todayISO()}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  return <div className="standard-page">
    <PageHeading eyebrow="TRANSACTION MANAGEMENT" title={title} description={isIncome ? 'Keep every payment you receive in one organized place.' : 'See where your money goes and keep your spending under control.'} action={`Add ${isIncome ? 'Income' : 'Expense'}`} onAction={openNew}/>
    <div className="overview-strip"><div className="glass metric-strip"><span className={`large-metric-icon ${isIncome ? 'teal' : 'pink'}`}>{isIncome ? <ArrowUpRight/> : <ArrowDownLeft/>}</span><div><small>{period === 'month' ? 'This month' : period === 'last' ? 'Last month' : period === 'year' ? 'This year' : 'All time'} {title.toLowerCase()}</small><strong>{formatMoney(total, profile.currency)}</strong></div></div><div className="glass metric-strip"><span className="large-metric-icon blue"><ReceiptText/></span><div><small>Matching transactions</small><strong>{rows.length}</strong></div></div><div className="glass metric-strip"><span className="large-metric-icon purple"><Search/></span><div><small>Categories in view</small><strong>{new Set(rows.map(t => t.category)).size}</strong></div></div></div>
    <section className="glass data-panel"><div className="data-toolbar"><div><h2>{title} history</h2><p className="muted">Edit or delete records whenever you need.</p></div><div className="toolbar-controls"><SearchBox value={search} onChange={value => { setSearch(value); setPage(1); }} placeholder="Search transactions"/><select className="glass-select" value={period} onChange={e => { setPeriod(e.target.value); setPage(1); }}><option value="month">This Month</option><option value="last">Last Month</option><option value="year">This Year</option><option value="all">All Time</option></select><button className="outline-button" onClick={downloadCSV}><Download size={17}/>Export CSV</button></div></div>
    {rows.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="align-right">Amount</th><th className="align-right">Actions</th></tr></thead><tbody>{visibleRows.map(t => <tr key={t.id}><td className="desc-cell"><span className={`transaction-bubble ${isIncome ? 'teal' : 'pink'}`}>{isIncome ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}</span><strong>{t.note}</strong></td><td><span className="category-tag">{t.category}</span></td><td>{prettyDate(t.date)}</td><td className={`align-right ${isIncome ? 'amount-positive' : 'amount-negative'}`}>{isIncome ? '+' : '-'}{formatMoney(t.amount, profile.currency)}</td><td className="align-right"><div className="row-actions"><button aria-label={`Edit ${t.note}`} onClick={() => openEdit(t)}><Edit3 size={16}/></button><button className="danger-action" aria-label={`Delete ${t.note}`} onClick={() => setConfirmId(t.id)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No matching transactions" detail="Try another date range or add a new record." icon={ReceiptText}/>}
    {visibleRows.length < rows.length && <div className="load-more-row">
      <span>Showing {visibleRows.length} of {rows.length} transactions</span>
      <button className="outline-button" onClick={() => setPage(current => current + 1)}>Show {Math.min(PAGE_SIZE, rows.length - visibleRows.length)} more</button>
    </div>}
    </section>
    {modalOpen && <Modal title={editId ? `Edit ${isIncome ? 'Income' : 'Expense'}` : `Add ${isIncome ? 'Income' : 'Expense'}`} onClose={() => setModalOpen(false)}><form onSubmit={save} className="form-stack"><InputField label="Amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required/><SelectField label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>{catOptions.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</SelectField><InputField label="Description" placeholder={isIncome ? 'e.g. Project payment' : 'e.g. Grocery Store'} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} required/><InputField label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required/>{error && <p className="validation-error">{error}</p>}<div className="form-actions"><button className="outline-button" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit">{editId ? 'Save Changes' : `Add ${isIncome ? 'Income' : 'Expense'}`}</button></div></form></Modal>}
    {confirmId && <Modal title="Delete this transaction?" onClose={() => setConfirmId(null)}><p className="muted">This will remove the record from your dashboard, reports, and budget totals.</p><div className="form-actions"><button className="outline-button" onClick={() => setConfirmId(null)}>Cancel</button><button className="danger-button" onClick={() => { removeTransaction(confirmId); setConfirmId(null); }}>Delete transaction</button></div></Modal>}
  </div>;
}
