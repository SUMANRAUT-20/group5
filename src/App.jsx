import React, { Suspense, lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';

// Import route bundles on first visit, instead of loading every page and
// the charting library before the initial dashboard can appear.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const TransactionModule = lazy(() => import('./pages/Transactions.jsx').then(module => ({ default: module.TransactionPage })));
const Savings = lazy(() => import('./pages/Savings.jsx'));
const Budgets = lazy(() => import('./pages/Budgets.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const CustomReport = lazy(() => import('./pages/CustomReport.jsx'));
const Categories = lazy(() => import('./pages/Categories.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const DemoAuth = lazy(() => import('./pages/DemoAuth.jsx'));

function Transactions({ type }) {
  return <TransactionModule type={type}/>;
}

function LoadingPage() {
  return <div className="route-loading" role="status" aria-live="polite">
    <span className="route-loading-spinner" aria-hidden="true"/> Loading page…
  </div>;
}

export default function App() {
  return <Suspense fallback={<LoadingPage/>}>
    <Routes>
      <Route path="/login" element={<DemoAuth/>}/>
      <Route path="/register" element={<DemoAuth register/>}/>
      <Route path="/" element={<Layout><Suspense fallback={<LoadingPage/>}><Outlet/></Suspense></Layout>}>
        <Route index element={<Dashboard/>}/>
        <Route path="income" element={<Transactions key="income" type="income"/>}/>
        <Route path="expenses" element={<Transactions key="expense" type="expense"/>}/>
        <Route path="savings" element={<Savings/>}/>
        <Route path="budgets" element={<Budgets/>}/>
        <Route path="reports" element={<Reports/>}/>
        <Route path="custom-report" element={<CustomReport/>}/>
        <Route path="categories" element={<Categories/>}/>
        <Route path="settings" element={<Settings/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </Suspense>;
}
