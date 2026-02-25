import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building, User, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Committee } from '../types';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    district: ''
  });

  useEffect(() => {
    if (profile?.committee_id) {
      fetchCommittee();
    } else if (profile) {
      setLoading(false);
    }
  }, [profile]);

  const fetchCommittee = async () => {
    try {
      const { data, error } = await supabase
        .from('committees')
        .select('*')
        .eq('id', profile?.committee_id)
        .single();

      if (error) throw error;
      setCommittee(data);
      setFormData({
        name: data.name,
        type: data.type,
        district: data.district || ''
      });
    } catch (error) {
      console.error('Error fetching committee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('committees')
        .update(formData)
        .eq('id', profile?.committee_id);

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile?.committee_id) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <SettingsIcon size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No Committee Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Your account is not yet associated with a committee. Please contact your administrator or try logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">{t('settings')}</h2>
        <p className="text-slate-500">Manage your committee profile and preferences</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Building className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800">Committee Information</h3>
        </div>
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">{t('committee_name')}</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">{t('committee_type')}</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="mosque">{t('mosque')}</option>
                <option value="madrasah">{t('madrasah')}</option>
                <option value="club">{t('club')}</option>
                <option value="building">{t('building')}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">{t('district')}</label>
              <input 
                type="text" 
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : t('save')}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Bell className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800">SMS Notifications (Ready to Integrate)</h3>
        </div>
        <div className="p-8 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-medium text-slate-800">Payment Confirmation SMS</p>
              <p className="text-xs text-slate-500">Send SMS to members after donation/contribution</p>
            </div>
            <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-not-allowed">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-medium text-slate-800">Meeting Notices</p>
              <p className="text-xs text-slate-500">Broadcast meeting alerts to all members</p>
            </div>
            <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-not-allowed">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium italic">Note: SMS API integration requires a valid API key from a local provider.</p>
        </div>
      </div>
    </div>
  );
};
