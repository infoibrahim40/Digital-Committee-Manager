import React, { useState, useEffect } from 'react';
import { 
  Users, 
  HandCoins, 
  ReceiptText, 
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    members: 0,
    collection: 0,
    donations: 0,
    expenses: 0,
    balance: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.committee_id) {
      fetchStats();
    } else if (profile) {
      // Profile exists but no committee_id yet (maybe just signed up)
      setLoading(false);
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const committeeId = profile?.committee_id;

      // Fetch member count
      const { count: memberCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('committee_id', committeeId);

      // Fetch total contributions
      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount')
        .eq('committee_id', committeeId);
      
      const totalCollection = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      // Fetch total donations
      const { data: donations } = await supabase
        .from('donations')
        .select('amount')
        .eq('committee_id', committeeId);
      
      const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      // Fetch total expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('committee_id', committeeId);
      
      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      setStats({
        members: memberCount || 0,
        collection: totalCollection,
        donations: totalDonations,
        expenses: totalExpenses,
        balance: (totalCollection + totalDonations) - totalExpenses
      });

      // Mock chart data for now
      setChartData([
        { name: 'Jan', income: 4000, expense: 2400 },
        { name: 'Feb', income: 3000, expense: 1398 },
        { name: 'Mar', income: 2000, expense: 9800 },
        { name: 'Apr', income: 2780, expense: 3908 },
        { name: 'May', income: 1890, expense: 4800 },
        { name: 'Jun', income: 2390, expense: 3800 },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: t('total_members'), value: stats.members, icon: Users, color: 'bg-blue-500' },
    { title: t('total_collection'), value: `৳${stats.collection}`, icon: TrendingUp, color: 'bg-emerald-500' },
    { title: t('total_donation'), value: `৳${stats.donations}`, icon: HandCoins, color: 'bg-purple-500' },
    { title: t('total_expense'), value: `৳${stats.expenses}`, icon: TrendingDown, color: 'bg-rose-500' },
    { title: t('balance'), value: `৳${stats.balance}`, icon: Wallet, color: 'bg-amber-500' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile?.committee_id) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <Wallet size={32} />
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
        <h2 className="text-2xl font-bold text-slate-800">{t('dashboard')}</h2>
        <p className="text-slate-500">{t('welcome')}, {profile?.full_name}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-xl text-white`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{card.title}</p>
              <p className="text-xl font-bold text-slate-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">{t('income_vs_expense')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <HandCoins size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Donation from Rahim Uddin</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-emerald-600">+৳500</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
