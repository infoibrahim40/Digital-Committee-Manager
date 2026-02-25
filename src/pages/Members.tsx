import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Member } from '../types';

export const Members: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    monthly_contribution_amount: 0,
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    if (profile?.committee_id) {
      fetchMembers();
    } else if (profile) {
      setLoading(false);
    }
  }, [profile]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('committee_id', profile?.committee_id)
        .order('name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('members')
          .update(formData)
          .eq('id', editingMember.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('members')
          .insert([{ ...formData, committee_id: profile?.committee_id }]);
        if (error) throw error;
      }
      setShowModal(false);
      setEditingMember(null);
      setFormData({ name: '', phone: '', address: '', monthly_contribution_amount: 0, status: 'active' });
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      address: member.address,
      monthly_contribution_amount: member.monthly_contribution_amount,
      status: member.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (error) throw error;
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.phone.includes(searchTerm)
  );

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('members')}</h2>
          <p className="text-slate-500">Manage your committee members</p>
        </div>
        <button 
          onClick={() => {
            setEditingMember(null);
            setFormData({ name: '', phone: '', address: '', monthly_contribution_amount: 0, status: 'active' });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={20} />
          <span>{t('add_member')}</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search members..."
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
                <th className="px-6 py-4 font-semibold">{t('phone')}</th>
                <th className="px-6 py-4 font-semibold">{t('monthly_contribution')}</th>
                <th className="px-6 py-4 font-semibold">{t('status')}</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No members found</td></tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{member.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {member.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {member.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">৳{member.monthly_contribution_amount}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      member.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {member.status === 'active' ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(member)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-800">
              {editingMember ? 'Edit Member' : t('add_member')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('name')}</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                <label className="text-sm font-medium text-slate-700">Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('monthly_contribution')} (৳)</label>
                <input 
                  type="number" 
                  value={formData.monthly_contribution_amount}
                  onChange={(e) => setFormData({...formData, monthly_contribution_amount: Number(e.target.value)})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">{t('status')}</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">{t('active')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
