import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, UserRound } from 'lucide-react';
import { Logo } from '../components/Layout';
import { useFinance } from '../context/FinanceContext';
export default function DemoAuth({ register = false }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { saveProfile } = useFinance();
  const navigate = useNavigate();
  function submit(e) { e.preventDefault(); if (!email.includes('@') || register && !name.trim()) return setError('Please enter the requested information.'); saveProfile({ ...(register ? { name: name.trim() } : {}), email: email.trim() }); navigate('/'); }
  return <main className="auth-page"><div className="auth-ambient"/><div className="glass auth-card"><Link to="/" className="auth-brand"><Logo/></Link><h1>{register ? 'Create your demo workspace' : 'Welcome back'}</h1><p>Simple local demo. No server or password verification.</p><div className="demo-disclaimer"><Lock size={17}/> UI demo only. This does not create a secure account or verify passwords.</div><form className="form-stack" onSubmit={submit}>{register && <label className="field"><span>Full name</span><div className="auth-input"><UserRound size={18}/><input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required/></div></label>}<label className="field"><span>Email</span><div className="auth-input"><Mail size={18}/><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>{error && <p className="validation-error">{error}</p>}<button className="primary-button auth-submit">Continue to dashboard <ArrowRight size={17}/></button></form><p className="auth-switch">{register ? 'Already previewed ProMoney?' : 'New to the preview?'} <Link to={register ? '/login' : '/register'}>{register ? 'Demo sign in' : 'Create demo profile'}</Link></p><Link className="auth-return" to="/">← Back to dashboard</Link></div></main>;
}
