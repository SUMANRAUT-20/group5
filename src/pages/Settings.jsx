import React, { useState } from 'react';
import { CircleUserRound, Download, Info, RotateCcw, Save, SlidersHorizontal, ShieldAlert } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PageHeading, Modal, Notice } from '../components/UI';
export default function Settings() {
  const { profile, saveProfile, resetDemo } = useFinance();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currency, setCurrency] = useState(profile.currency);
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState('');
  function save(e) { e.preventDefault(); if (!name.trim() || !email.includes('@')) return setNotice('Please enter a name and a valid email address.'); saveProfile({ name: name.trim(), email: email.trim(), currency }); setNotice('Settings updated on this device.'); }
  function backup() { const raw = localStorage.getItem('promoney-aurora-demo-v1') || '{}'; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([raw], { type: 'application/json' })); a.download = 'promoney-demo-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  return <div className="standard-page"><PageHeading eyebrow="YOUR WORKSPACE" title="Settings" description="Personalize your demo dashboard and manage your local data."/>
    <div className="settings-grid"><section className="glass data-panel"><h2><CircleUserRound size={20}/> Your profile</h2><p className="muted">Your name and preferred display currency.</p><form className="form-stack settings-form" onSubmit={save}><label className="field"><span>Full name</span><input value={name} onChange={e => setName(e.target.value)}/></label><label className="field"><span>Email address</span><input type="email" value={email} onChange={e => setEmail(e.target.value)}/></label><label className="field"><span>Preferred currency</span><select value={currency} onChange={e => setCurrency(e.target.value)}><option value="USD">USD — US Dollar ($)</option><option value="JPY">JPY — Japanese Yen (¥)</option><option value="NPR">NPR — Nepalese Rupee (रू)</option><option value="EUR">EUR — Euro (€)</option><option value="GBP">GBP — British Pound (£)</option><option value="INR">INR — Indian Rupee (₹)</option></select></label><button className="primary-button settings-save" type="submit"><Save size={18}/> Save Settings</button></form></section>
    <div className="settings-aside"><section className="glass data-panel"><h2><SlidersHorizontal size={20}/> Data & privacy</h2><p className="muted">Your current demo records live in this browser's localStorage.</p><button className="outline-button full-width" onClick={backup}><Download size={17}/> Download JSON Backup</button><button className="danger-outline full-width" onClick={() => setConfirm(true)}><RotateCcw size={17}/> Reset Demo Data</button></section><section className="glass data-panel notice-panel"><h2><ShieldAlert size={20}/> Demo mode</h2><p>This project currently runs entirely in your browser. It does <strong>not</strong> include secure accounts, a connected database, or cloud synchronization. Do not enter real sensitive financial information.</p></section></div></div>
    <Notice message={notice} onClose={() => setNotice('')}/>
    {confirm && <Modal title="Reset all demo data?" onClose={() => setConfirm(false)}><p className="muted">This replaces your locally edited transactions, goals, budgets, and settings with the example data. This cannot be undone unless you downloaded a backup.</p><div className="form-actions"><button className="outline-button" onClick={() => setConfirm(false)}>Cancel</button><button className="danger-button" onClick={() => { resetDemo(); setConfirm(false); setNotice('Demo data restored.'); setName('John Doe'); setEmail('john@example.com'); setCurrency('USD'); }}>Reset Demo</button></div></Modal>}
  </div>;
}
