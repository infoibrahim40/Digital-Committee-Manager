import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [committeeName, setCommitteeName] = useState('');
  const [committeeType, setCommitteeType] = useState('mosque');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // 1. Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Sign up failed');

        // 2. Create the committee
        const { data: committeeData, error: committeeError } = await supabase
          .from('committees')
          .insert([{ name: committeeName, type: committeeType }])
          .select()
          .single();

        if (committeeError) throw committeeError;

        // 3. Update the profile with the committee_id
        // Retry a few times in case the trigger hasn't finished creating the profile
        let profileUpdated = false;
        for (let i = 0; i < 5; i++) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ committee_id: committeeData.id })
            .eq('id', authData.user.id);
          
          if (!profileError) {
            profileUpdated = true;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!profileUpdated) {
          throw new Error('Failed to associate committee with your profile. Please try logging in.');
        }

        alert('Account created! Please check your email for verification (if enabled).');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Digital Committee Manager</h1>
          <p className="text-slate-500 mt-2">
            {isSignUp ? 'Create your committee account' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Committee Name</label>
                <input
                  type="text"
                  required
                  value={committeeName}
                  onChange={(e) => setCommitteeName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="My Mosque Committee"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Committee Type</label>
                <select
                  value={committeeType}
                  onChange={(e) => setCommitteeType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="mosque">Mosque</option>
                  <option value="madrasah">Madrasah</option>
                  <option value="club">Club</option>
                  <option value="building">Building</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t('email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : t('login'))}
          </button>
        </form>

        <div className="text-center space-y-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-emerald-600 font-medium hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need a committee account? Sign Up'}
          </button>
          
          {!isSignUp && (
            <div className="text-xs text-slate-500">
              <p>Demo Admin: admin@committee.com / password123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
