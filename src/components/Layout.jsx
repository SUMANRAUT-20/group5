import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';

const links = [
  ['/', 'Dashboard'], ['/income', 'Income'], ['/expenses', 'Expenses'],
  ['/categories', 'Categories'], ['/budgets', 'Budgets & Goals'],
  ['/savings', 'Savings'], ['/reports', 'Reports'],
  ['/custom-report', 'Custom Report'], ['/settings', 'Settings'],
];

export function Logo() { return <span className="brand">ProMoney <small>Lite</small></span>; }

export function Layout({ children }) {
  const { profile } = useFinance();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = links.find(([path]) => path === pathname)?.[1] || 'ProMoney';
  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu" type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label="Toggle navigation">☰</button>
      <div className="brand-area" onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate('/')}><Logo/></div>
      <span className="header-page">{current}</span>
      <span className="header-user">{profile.name} · Demo</span>
    </header>
    <div className="page-frame">
      {open && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <nav aria-label="Main navigation" className="sidebar-nav">
          {links.map(([to, name]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{name}</NavLink>)}
        </nav>
        <p className="sidebar-note">Local demo only. No server account or database.</p>
      </aside>
      <main className="page-content" id="main-content">{children}</main>
    </div>
  </div>;
}
