import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Smartphone, 
  ArrowRight,
  CheckCircle2,
  Building2,
  Globe
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Digital Committee</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">About</a>
              <Link to="/login" className="text-sm font-semibold text-white bg-emerald-600 px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6 animate-in">
            <Globe size={14} />
            Multi-Tenant SaaS Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Manage Your Committee <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              With Digital Precision.
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one solution for Mosques, Madrasahs, Clubs, and Building Management. 
            Track members, donations, and expenses with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all group">
              Get Started Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              View Features
            </a>
          </div>
          
          {/* Dashboard Preview Image */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-20"></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="Dashboard Preview" 
                className="w-full h-auto opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-slate-500">Powerful tools designed for community management.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Member Tracking", 
                desc: "Keep a detailed record of all committee members and their contribution history.",
                icon: Users,
                color: "bg-blue-500"
              },
              { 
                title: "Financial Reports", 
                desc: "Generate professional PDF reports for income, expenses, and member dues instantly.",
                icon: BarChart3,
                color: "bg-emerald-500"
              },
              { 
                title: "Secure & Private", 
                desc: "Enterprise-grade security with data isolation for every committee.",
                icon: Shield,
                color: "bg-purple-500"
              },
              { 
                title: "Mobile Ready", 
                desc: "Manage your committee on the go with our fully responsive mobile design.",
                icon: Smartphone,
                color: "bg-rose-500"
              },
              { 
                title: "Multi-Tenant", 
                desc: "One platform, multiple committees. Each with its own unique dashboard.",
                icon: Building2,
                color: "bg-amber-500"
              },
              { 
                title: "Activity Logs", 
                desc: "Track every change made in the system with detailed activity history.",
                icon: CheckCircle2,
                color: "bg-teal-500"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold">D</div>
            <span className="font-bold text-slate-900">Digital Committee Manager</span>
          </div>
          <p className="text-sm text-slate-400">© 2024 Digital Committee Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
