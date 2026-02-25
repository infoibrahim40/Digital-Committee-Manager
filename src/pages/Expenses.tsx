import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Tag, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Expense } from '../types';
import { format } from 'date-fns';

export const Expenses: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    category: '',
    description: ''
  });

  useEffect(() => {
    if (profile?.committee_id) {
      fetchExpenses();
    }
  }, [profile]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('committee_id', profile?.committee_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{ ...formData, committee_id: profile?.committee_id }]);
      
      if (error) throw error;
      
      setShowModal(false);
      setFormData({ title: '', amount: 0, category: '', description: '' });
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await supabase.from('expenses').delete().eq('id', id);
      fetchExpenses();
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('expenses')}</h2>
          <p className="text-slate-500">Track committee expenditures</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={20} />
          <span>{t('add_expense')}</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-slate-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">{t('category')}</th>
                <th className="px-6 py-4 font-semibold">{t('amount')}</th>
                <th className="px-6 py-4 font-semibold">{t('date')}</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No expenses found</td></tr>
              ) : filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{expense.title}</div>
                    <div className="text-xs text-slate-400">{expense.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-rose-600">৳{expense.amount}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {format(new Date(expense.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-800">{t('add_expense')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Title</label>
                <input 
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('category')}</label>
                <input 
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g. Maintenance, Utility, Salary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('amount')} (৳)</label>
                <input 
                  type="number" required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('description')}</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600">{t('cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
