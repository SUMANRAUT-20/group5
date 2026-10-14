import React, { useState } from 'react';
import { X, Plus, Search, Check } from 'lucide-react';
export function SectionTitle({ title, action, onAction, children }) {
  return <div className="section-title"><h2>{title}</h2><div className="section-title-tools">{children}{action && <button className="text-action" onClick={onAction}>{action}</button>}</div></div>;
}
export function PageHeading({ eyebrow, title, description, action, onAction, secondary }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow || 'YOUR FINANCIAL WORKSPACE'}</span><h1>{title}</h1><p>{description}</p></div><div className="heading-actions">{secondary}{action && <button className="primary-button" onClick={onAction}><Plus size={18}/>{action}</button>}</div></div>;
}
export function Modal({ title, children, onClose, footer }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="modal-panel glass" role="dialog" aria-modal="true" aria-label={title} onMouseDown={e => e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-button" aria-label="Close" onClick={onClose}><X/></button></div><div className="modal-body">{children}</div>{footer && <div className="modal-footer">{footer}</div>}</div></div>;
}
export function EmptyState({ title = 'Nothing here yet', detail = 'Add your first item to get started.', icon: Icon = Search }) {
  return <div className="empty-state"><Icon size={30}/><strong>{title}</strong><p>{detail}</p></div>;
}
export function ProgressBar({ value, color = 'blue', thin = false }) {
  return <div className={`progress-track ${thin ? 'thin' : ''}`}><span className={`progress-fill ${color}`} style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }}/></div>;
}
export function Notice({ message, onClose }) { return message && <div className="toast"><Check size={18}/>{message}<button className="icon-button" aria-label="Dismiss" onClick={onClose}><X size={15}/></button></div>; }
export function SelectField({ label, ...props }) { return <label className="field"><span>{label}</span><select {...props}/></label>; }
export function InputField({ label, ...props }) { return <label className="field"><span>{label}</span><input {...props}/></label>; }
export function SearchBox({ value, onChange, placeholder = 'Search...' }) { return <label className="inline-search"><Search size={17}/><input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}/></label>; }
