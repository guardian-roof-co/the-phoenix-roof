import React, { useState } from 'react';
import { X, User, Mail, Lock, Ticket, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referral, setReferral] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { login, loginWithGoogle, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) login(email);
    else signup(email, name, referral);
    onClose();
  };

  const handleGoogleLogin = async () => {
    if (!email) {
        alert("Please enter your email to proceed with Google Login simulation.");
        return;
    }
    setIsGoogleLoading(true);
    try {
        await loginWithGoogle(email);
        onClose();
    } catch (e) {
        console.error(e);
    } finally {
        setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-8 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join The Phoenix'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8 space-y-6">
            <button onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 transition flex items-center justify-center gap-3 shadow-sm">
                {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin text-phoenix-600" /> : <><img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" /> <span>Sync with Google Account</span></>}
            </button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="px-2 bg-white text-slate-400">Or use email</span></div></div>

            <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-phoenix-500 outline-none font-bold" placeholder="John Doe" />
                </div>
            )}
            <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-phoenix-500 outline-none font-bold" placeholder="you@example.com" />
            </div>
            {!isLogin && (
                <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Referral Code</label>
                    <input type="text" value={referral} onChange={(e) => setReferral(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-phoenix-500 outline-none font-bold" placeholder="FRIEND-123" />
                </div>
            )}
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-200">
                {isLogin ? 'Log In' : 'Create Account'}
            </button>
            <div className="text-center text-xs font-bold text-slate-500">
                {isLogin ? "New here? " : "Existing member? "}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-phoenix-600 font-black hover:underline uppercase tracking-widest ml-1">{isLogin ? 'Sign Up' : 'Log In'}</button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};
