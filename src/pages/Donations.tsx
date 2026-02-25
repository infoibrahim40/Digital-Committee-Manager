import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Calendar, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Donation } from '../types';
import { format } from 'date-fns';

export const Donations: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    donor_name: '',
    phone: '',
    amount: 0,
    purpose: ''
  });

  useEffect(() => {
    if (profile?.committee_id) {
      fetchDonations();
    } else if (profile) {
      setLoading(false);
    }
  }, [profile]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('committee_id', profile?.committee_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('donations')
        .insert([{ ...formData, committee_id: profile?.committee_id }]);
      
      if (error) throw error;
      
      setShowModal(false);
      setFormData({ donor_name: '', phone: '', amount: 0, purpose: '' });
      fetchDonations();
    } catch (error) {
      console.error('Error saving donation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await supabase.from('donations').delete().eq('id', id);
      fetchDonations();
    }
  };

  const filteredDonations = donations.filter(d => 
    d.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('donations')}</h2>
          <p className="text-slate-500">Track one-time donations</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={20} />
          <span>{t('add_donation')}</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-slate-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">{t('name')}</th>
                <th className="px-6 py-4 font-semibold">{t('purpose')}</th>
                <th className="px-6 py-4 font-semibold">{t('amount')}</th>
                <th className="px-6 py-4 font-semibold">{t('date')}</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredDonations.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No donations found</td></tr>
              ) : filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{donation.donor_name}</div>
                    <div className="text-xs text-slate-400">{donation.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{donation.purpose}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">৳{donation.amount}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {format(new Date(donation.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(donation.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
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
            <h3 className="text-xl font-bold text-slate-800">{t('add_donation')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('name')}</label>
                <input 
                  type="text" required
                  value={formData.donor_name}
                  onChange={(e) => setFormData({...formData, donor_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('phone')}</label>
                <input 
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('amount')} (৳)</label>
                <input 
                  type="number" required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('purpose')}</label>
                <input 
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600">{t('cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
