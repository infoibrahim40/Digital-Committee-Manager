import React, { useState } from 'react';
import { FileBarChart, Download, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { exportToPDF } from '../utils/pdfExport';
import { format } from 'date-fns';

export const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'income_expense' | 'member_due'>('income_expense');

  const generateIncomeExpenseReport = async () => {
    setLoading(true);
    try {
      const committeeId = profile?.committee_id;
      
      // Fetch donations
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .eq('committee_id', committeeId);
      
      // Fetch expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('committee_id', committeeId);

      const headers = ['Date', 'Type', 'Title/Donor', 'Amount'];
      const data: any[][] = [];

      donations?.forEach(d => {
        data.push([format(new Date(d.created_at), 'dd/MM/yyyy'), 'Income (Donation)', d.donor_name, `৳${d.amount}`]);
      });

      expenses?.forEach(e => {
        data.push([format(new Date(e.created_at), 'dd/MM/yyyy'), 'Expense', e.title, `৳${e.amount}`]);
      });

      // Sort by date
      data.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

      exportToPDF('Income & Expense Report', headers, data, 'income_expense_report');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMemberDueReport = async () => {
    setLoading(true);
    try {
      const committeeId = profile?.committee_id;
      const { data: members } = await supabase
        .from('members')
        .select('*')
        .eq('committee_id', committeeId);

      const headers = ['Member Name', 'Phone', 'Monthly Amount', 'Status'];
      const data = members?.map(m => [m.name, m.phone, `৳${m.monthly_contribution_amount}`, m.status]) || [];

      exportToPDF('Member Status Report', headers, data, 'member_report');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.committee_id) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <FileBarChart size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No Committee Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Your account is not yet associated with a committee. Please contact your administrator or try logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">{t('reports')}</h2>
        <p className="text-slate-500">Generate and download committee reports</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileBarChart size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Income & Expense Report</h3>
            <p className="text-sm text-slate-500 mt-1">Detailed list of all donations and expenses for the current period.</p>
          </div>
          <button 
            onClick={generateIncomeExpenseReport}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <Download size={20} />
            <span>{loading ? 'Generating...' : t('export_pdf')}</span>
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Filter size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Member Status Report</h3>
            <p className="text-sm text-slate-500 mt-1">Overview of all members and their monthly contribution status.</p>
          </div>
          <button 
            onClick={generateMemberDueReport}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <Download size={20} />
            <span>{loading ? 'Generating...' : t('export_pdf')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
