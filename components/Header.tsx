import React, { useState } from 'react';
import { Flame, Menu, X, CloudLightning, Ruler, Home, ShieldCheck, Bot, User } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (view: ViewState) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer space-x-3" onClick={() => handleNav('home')}>
              <div className="bg-gradient-to-tr from-phoenix-600 to-fire-500 p-2.5 rounded-xl shadow-inner">
                <Flame className="h-7 w-7 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter italic hidden sm:block">THE <span className="text-phoenix-500">PHOENIX</span> ROOF</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button onClick={() => handleNav('schedule')} className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 ${currentView === 'schedule' ? 'text-white bg-phoenix-600' : 'text-slate-300'}`}>
                Schedule
              </button>
              <button onClick={() => handleNav('quote')} className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 ${currentView === 'quote' ? 'text-phoenix-400 bg-slate-800/50' : 'text-slate-300'}`}>
                Instant Quote
              </button>
              <button onClick={() => handleNav('insurance')} className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 ${currentView === 'insurance' ? 'text-blue-400 bg-slate-800/50' : 'text-slate-300'}`}>
                Policy Review
              </button>
              <button onClick={() => handleNav('storm')} className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 ${currentView === 'storm' ? 'text-fire-400 bg-slate-800/50' : 'text-slate-300'}`}>
                Storm Tracker
              </button>
              <button onClick={() => handleNav('signup')} className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 ${currentView === 'signup' ? 'text-white bg-phoenix-600' : 'text-slate-300'}`}>
                Signup
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 hover:bg-slate-800 rounded-2xl transition-all">
                {isMenuOpen ? <X className="h-7 w-7 text-phoenix-500" /> : <Menu className="h-7 w-7 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full right-0 w-full lg:w-96 bg-slate-900 border-b lg:border-l border-slate-800 shadow-2xl animate-fade-in-down overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 px-4">Core Tools</p>
                <button onClick={() => handleNav('home')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-sm font-bold text-slate-300"><Home className="w-4 h-4" /> Home</button>
                <button onClick={() => handleNav('quote')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-sm font-bold text-slate-300"><Ruler className="w-4 h-4 text-phoenix-500" /> Get a Quote</button>
                <button onClick={() => handleNav('insurance')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-sm font-bold text-slate-300"><Bot className="w-4 h-4 text-blue-500" /> Policy Review</button>
                <button onClick={() => handleNav('storm')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-sm font-bold text-slate-300"><CloudLightning className="w-4 h-4 text-fire-500" /> Storm Tracker</button>
                <button onClick={() => handleNav('education')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-sm font-bold text-slate-300"><ShieldCheck className="w-4 h-4 text-green-500" /> Education</button>
                <button onClick={() => handleNav('signup')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-3 text-sm font-bold text-slate-300"><User className="w-4 h-4 text-phoenix-500" /> Signup</button>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button onClick={() => handleNav('schedule')} className="w-full bg-phoenix-600 hover:bg-phoenix-700 text-white px-4 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black uppercase text-xs tracking-widest">
                  Schedule Free Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
