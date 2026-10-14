import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addDays, monthDate, todayISO } from '../utils/finance';

const FinanceContext = createContext(null);
const DEFAULT_CATEGORIES = [
  { id: 'inc-salary', name: 'Salary', type: 'income', builtIn: true },
  { id: 'inc-freelance', name: 'Freelance', type: 'income', builtIn: true },
  { id: 'inc-business', name: 'Business', type: 'income', builtIn: true },
  { id: 'inc-other', name: 'Other Income', type: 'income', builtIn: true },
  ...['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Health', 'Travel', 'Education', 'Other'].map((name, i) => ({ id: `expense-${i}`, name, type: 'expense', builtIn: true })),
];
const DEFAULT_BUDGETS = [
  { id: 'b1', category: 'Food & Dining', amount: 1000 },
  { id: 'b2', category: 'Transportation', amount: 650 },
  { id: 'b3', category: 'Shopping', amount: 600 },
  { id: 'b4', category: 'Bills & Utilities', amount: 700 },
  { id: 'b5', category: 'Entertainment', amount: 450 },
  { id: 'b6', category: 'Other', amount: 400 },
];
const DEFAULT_GOALS = [
  { id: 'g1', name: 'Emergency Fund', target: 5000, saved: 3500, icon: 'shield', color: 'blue' },
  { id: 'g2', name: 'New Laptop', target: 2000, saved: 900, icon: 'laptop', color: 'purple' },
  { id: 'g3', name: 'Vacation Trip', target: 4000, saved: 1200, icon: 'plane', color: 'teal' },
];
const DEFAULT_PAYMENTS = [
  { id: 'p1', name: 'Internet Bill', amount: 45, dueDate: addDays(2), icon: 'wifi' },
  { id: 'p2', name: 'Car Loan', amount: 320, dueDate: addDays(7), icon: 'car' },
  { id: 'p3', name: 'Credit Card', amount: 150, dueDate: addDays(10), icon: 'credit' },
];
function seedTransactions() {
  const thisMonth = [
    ['income', 'Salary', 'Monthly salary', 2500, 4],
    ['income', 'Freelance', 'Freelance work', 800, 8],
    ['income', 'Business', 'Side project', 900, 11],
    ['expense', 'Food & Dining', 'Grocery Store', 85, 12],
    ['expense', 'Entertainment', 'Netflix', 12.99, 11],
    ['expense', 'Transportation', 'Fuel', 50, 10],
    ['expense', 'Food & Dining', 'Dining out', 265, 9],
    ['expense', 'Bills & Utilities', 'Internet Bill', 45, 8],
    ['expense', 'Transportation', 'Car fuel', 190, 8],
    ['expense', 'Food & Dining', 'Coffee and snacks', 112, 7],
    ['expense', 'Shopping', 'Clothing', 180, 7],
    ['expense', 'Entertainment', 'Concert tickets', 200, 6],
    ['expense', 'Bills & Utilities', 'Electricity & water', 140, 6],
    ['expense', 'Bills & Utilities', 'Phone plan', 64, 6],
    ['expense', 'Food & Dining', 'Weekly groceries', 250, 5],
    ['expense', 'Shopping', 'New accessories', 247.5, 5],
    ['expense', 'Health', 'Pharmacy', 56.5, 4],
    ['expense', 'Transportation', 'Parking', 73, 4],
    ['expense', 'Bills & Utilities', 'Insurance', 150, 3],
    ['expense', 'Food & Dining', 'Restaurant', 200, 3],
    ['expense', 'Entertainment', 'Games', 129.01, 3],
    ['expense', 'Transportation', 'Train tickets', 200, 2],
    ['expense', 'Other', 'Gifts', 100, 2],
    ['expense', 'Education', 'Books', 100, 2],
  ];
  const current = thisMonth.map(([type, category, note, amount, day], i) => ({
    id: `demo-${i}`, type, category, note, amount,
    date: monthDate(0, Math.min(day, new Date().getDate())),
  }));
  const historical = [];
  const monthly = [2350, 2700, 2200, 2620, 2930, 2750, 3420, 2650, 2550, 2860, 2340];
  for (let monthsAgo = 1; monthsAgo <= 11; monthsAgo++) {
    const exp = monthly[(monthsAgo - 1) % monthly.length];
    historical.push({ id: `old-e-${monthsAgo}`, type: 'expense', category: 'Food & Dining', note: 'Monthly spending history', amount: exp, date: monthDate(-monthsAgo, 14) });
    historical.push({ id: `old-i-${monthsAgo}`, type: 'income', category: 'Salary', note: 'Monthly income history', amount: 3500 + ((monthsAgo * 173) % 750), date: monthDate(-monthsAgo, 4) });
  }
  return [...current, ...historical];
}
function makeInitial() {
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    budgets: [],
    goals: [],
    payments: [],
    profile: {
      name: '',
      email: '',
      currency: 'USD'
    }
  };
}
function loadData() {
  try {
    const raw = localStorage.getItem('promoney-aurora-demo-v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.transactions) && Array.isArray(parsed.categories)) return parsed;
    }
  } catch { /* fall back to demo seed */ }
  return makeInitial();
}
const uid = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
export function FinanceProvider({ children }) {
  const [data, setData] = useState(loadData);
  useEffect(() => { try { localStorage.setItem('promoney-aurora-demo-v1', JSON.stringify(data)); } catch (error) { console.warn('Local demo data could not be saved:', error); } }, [data]);
  const update = (key, fn) => setData(prev => ({ ...prev, [key]: fn(prev[key]) }));
  const api = useMemo(() => ({
    ...data,
    addTransaction: t => update('transactions', xs => [...xs, { ...t, id: uid(), amount: Number(t.amount) }]),
    updateTransaction: (id, changes) => update('transactions', xs => xs.map(x => x.id === id ? { ...x, ...changes, amount: Number(changes.amount ?? x.amount) } : x)),
    removeTransaction: id => update('transactions', xs => xs.filter(x => x.id !== id)),
    addCategory: category => update('categories', xs => [...xs, { ...category, builtIn: false, id: uid() }]),
    updateCategory: (id, name) => setData(prev => {
      const original = prev.categories.find(c => c.id === id && !c.builtIn);
      if (!original) return prev;
      return {
        ...prev,
        categories: prev.categories.map(c => c.id === id ? { ...c, name } : c),
        transactions: prev.transactions.map(t => t.type === original.type && t.category === original.name ? { ...t, category: name } : t),
        budgets: original.type === 'expense' ? prev.budgets.map(b => b.category === original.name ? { ...b, category: name } : b) : prev.budgets,
      };
    }),
    removeCategory: id => update('categories', xs => xs.filter(x => x.id !== id || x.builtIn)),
    saveBudget: (category, amount) => update('budgets', xs => xs.some(x => x.category === category)
      ? xs.map(x => x.category === category ? { ...x, amount: Number(amount) } : x)
      : [...xs, { id: uid(), category, amount: Number(amount) }]),
    removeBudget: category => update('budgets', xs => xs.filter(x => x.category !== category)),
    addGoal: goal => update('goals', xs => [...xs, { ...goal, id: uid(), saved: Number(goal.saved), target: Number(goal.target) }]),
    saveGoal: (id, changes) => update('goals', xs => xs.map(x => x.id === id ? { ...x, ...changes } : x)),
    removeGoal: id => update('goals', xs => xs.filter(x => x.id !== id)),
    saveProfile: changes => update('profile', x => ({ ...x, ...changes })),
    resetDemo: () => setData(makeInitial()),
  }), [data]);
  return <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>;
}
export function useFinance() {
  const value = useContext(FinanceContext);
  if (!value) throw new Error('FinanceProvider missing');
  return value;
}
