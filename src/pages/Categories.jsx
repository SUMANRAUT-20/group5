import React, { useMemo, useState } from 'react';
import { Tags, Plus, Edit3, Trash2, LockKeyhole, UtensilsCrossed, ShoppingBag, Car, ReceiptText, HeartPulse, Music2, CircleDollarSign } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Modal, PageHeading } from '../components/UI';
const ICONS = [UtensilsCrossed, Car, ShoppingBag, ReceiptText, Music2, HeartPulse, CircleDollarSign];
export default function Categories() {
  const { categories, transactions, addCategory, updateCategory, removeCategory } = useFinance();
  const [type, setType] = useState('expense');
  const [newName, setNewName] = useState('');
  const [edit, setEdit] = useState(null);
  const [remove, setRemove] = useState(null);
  const [error, setError] = useState('');
  const items = categories.filter(c => c.type === type);
  function save(e) { e.preventDefault(); const name = newName.trim(); if (!name) return setError('Enter a category name.'); if (categories.some(c => c.type === type && c.name.toLowerCase() === name.toLowerCase() && c.id !== edit?.id)) return setError('A category with this name already exists.'); if (edit?.id) updateCategory(edit.id, name); else addCategory({ name, type }); setNewName(''); setEdit(null); setError(''); }
  function openEdit(c) { setEdit(c); setNewName(c.name); setError(''); }
  function doRemove(c) { if (transactions.some(t => t.category === c.name && t.type === c.type)) return setError('This category is used by a transaction. Reassign those records before deleting it.'); removeCategory(c.id); setRemove(null); setError(''); }
  return <div className="standard-page"><PageHeading eyebrow="MAKE IT YOURS" title="Categories" description="Keep your transactions neatly organized. Default categories are always available."/>
    <section className="glass data-panel"><div className="data-toolbar"><div><h2>Your categories</h2><p className="muted">Create custom categories that fit your lifestyle.</p></div><div className="segmented"><button className={type === 'expense' ? 'selected' : ''} onClick={() => setType('expense')}>Expenses</button><button className={type === 'income' ? 'selected' : ''} onClick={() => setType('income')}>Income</button></div></div>
      {error && <p className="validation-error category-error">{error} <button onClick={() => setError('')}>Dismiss</button></p>}
      <div className="category-tile-grid">{items.map((c, i) => { const Icon = ICONS[i % ICONS.length]; const used = transactions.filter(t => t.category === c.name && t.type === c.type).length; return <div className="category-tile" key={c.id}><div className={`category-tile-icon tone-${i % 4}`}><Icon size={24}/></div><strong>{c.name}</strong><small>{used} transaction{used === 1 ? '' : 's'}</small><div className="category-tile-actions">{c.builtIn ? <span className="category-default"><LockKeyhole size={13}/> Built-in</span> : <><button aria-label={`Rename ${c.name}`} onClick={() => openEdit(c)}><Edit3 size={15}/></button><button aria-label={`Delete ${c.name}`} onClick={() => setRemove(c)}><Trash2 size={15}/></button></>}</div></div>; })}<button className="category-tile add-category" onClick={() => { setNewName(''); setEdit({ id: null }); setError(''); }}><span className="add-icon"><Plus size={26}/></span><strong>Add Category</strong><small>Your own custom category</small></button></div>
    </section>
    {edit && <Modal title={edit.id ? 'Rename Category' : 'Add Category'} onClose={() => setEdit(null)}><form onSubmit={save} className="form-stack"><label className="field"><span>Category name</span><input autoFocus placeholder="e.g. Pet Care" value={newName} onChange={e => setNewName(e.target.value)} /></label>{error && <p className="validation-error">{error}</p>}<div className="form-actions"><button type="button" className="outline-button" onClick={() => { setEdit(null); setError(''); }}>Cancel</button><button className="primary-button" type="submit">Save Category</button></div></form></Modal>}
    {remove && <Modal title="Delete Category?" onClose={() => setRemove(null)}><p className="muted">Remove <strong>{remove.name}</strong> from your custom categories?</p><div className="form-actions"><button className="outline-button" onClick={() => setRemove(null)}>Cancel</button><button className="danger-button" onClick={() => doRemove(remove)}>Delete Category</button></div></Modal>}
  </div>;
}
