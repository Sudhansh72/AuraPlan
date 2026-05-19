import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Calendar, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 shadow-2xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase italic">
            Aura<span className="text-indigo-400">Plan</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Home</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono text-slate-300 truncate max-w-[150px]">{user?.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold text-pink-400 hover:text-pink-300 uppercase tracking-widest transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <Link 
                to="/planner" 
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                New Plan
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Login</Link>
              <Link 
                to="/register" 
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs border border-white/10 transition-all active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
