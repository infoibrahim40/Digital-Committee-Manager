/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { isSupabaseConfigured } from './lib/supabase';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Donations } from './pages/Donations';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Configuration Required</h1>
          <p className="text-slate-500">
            Please set the following environment variables in the <b>Secrets</b> panel to connect to Supabase:
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-left font-mono text-sm space-y-2">
            <p className="text-slate-700">VITE_SUPABASE_URL</p>
            <p className="text-slate-700">VITE_SUPABASE_ANON_KEY</p>
          </div>
          <p className="text-xs text-slate-400">
            You can find these in your Supabase Project Settings &gt; API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/members" element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            } />
            
            <Route path="/donations" element={
              <ProtectedRoute>
                <Donations />
              </ProtectedRoute>
            } />
            
            <Route path="/expenses" element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
