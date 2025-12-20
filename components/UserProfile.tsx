
import React, { useState } from 'react';
import { User, Calendar, FileText, Gift, Copy, LogOut, Shield, Check, Mail, Facebook, Twitter, MessageCircle, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
    onNavigate: (view: any) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onNavigate }) => {
  const { user, logout, getUserAppointments, getUserQuotes } = useAuth();
  const [copied, setCopied] = useState(false);
  const appointments = getUserAppointments();
  const quotes = getUserQuotes();

  if (!user) return <div className="p-8 text-center">Please log in.</div>;

  const copyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Get $25 off your roof inspection with The Phoenix Roof! Use my code: ${user.referralCode}`;
  const shareUrl = 'https://thephoenixroof.com'; // Simulated URL for demo

  const shareLinks = {
    email: `mailto:?subject=Discount on Roof Inspection&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-phoenix-100 p-4 rounded-full">
              <User className="w-8 h-8 text-phoenix-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className="bg-blue-100 p-2 rounded-lg"><Camera className="w-5 h-5 text-blue-600"/></div>
                     <div>
                         <p className="font-bold text-gray-800">Self-Inspection</p>
                         <p className="text-xs text-gray-500">Check your roof health</p>
                     </div>
                 </div>
                 <button onClick={() => onNavigate('self-inspection')} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">Start</button>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className="bg-phoenix-100 p-2 rounded-lg"><Shield className="w-5 h-5 text-phoenix-600"/></div>
                     <div>
                         <p className="font-bold text-gray-800">Maintenance Plan</p>
                         <p className="text-xs text-gray-500">View coverage details</p>
                     </div>
                 </div>
                 <button onClick={() => onNavigate('maintenance')} className="text-sm font-bold text-phoenix-600 hover:bg-phoenix-50 px-3 py-1.5 rounded-lg transition">View</button>
             </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Referral Card */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-6 text-white h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-phoenix-500/20 rounded-lg">
                  <Gift className="w-6 h-6 text-phoenix-400" />
                </div>
                <h2 className="font-bold text-xl">Refer & Earn</h2>
              </div>
              
              <p className="text-slate-300 text-sm mb-6">
                Give $25, Get $50. Share your unique code with neighbors and friends.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <span className="block text-3xl font-bold text-white">{user.referralCount}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Referrals</span>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <span className="block text-3xl font-bold text-phoenix-400">${user.rewardsEarned}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Earned</span>
                </div>
              </div>
              
              {/* Code Display */}
              <div className="bg-slate-950/50 rounded-xl p-1 mb-6 border border-slate-700 relative group">
                 <p className="text-[10px] text-slate-500 uppercase font-bold absolute -top-2.5 left-4 bg-slate-900 px-2">Your Code</p>
                 <div className="flex items-center justify-between pl-4 pr-1 py-2">
                    <span className="text-xl font-mono font-bold tracking-widest text-white">{user.referralCode}</span>
                    <button 
                      onClick={copyReferral} 
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors relative"
                      title="Copy Code"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                 </div>
              </div>

              {/* Share Options */}
              <div className="mt-auto">
                  <p className="text-xs text-slate-400 mb-3 font-medium">Share via:</p>
                  <div className="grid grid-cols-4 gap-2">
                      <a href={shareLinks.email} className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg flex justify-center transition-colors" title="Email"><Mail className="w-5 h-5" /></a>
                      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] p-3 rounded-lg flex justify-center transition-colors" title="Twitter"><Twitter className="w-5 h-5" /></a>
                      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="bg-[#4267B2]/20 hover:bg-[#4267B2]/30 text-[#4267B2] p-3 rounded-lg flex justify-center transition-colors" title="Facebook"><Facebook className="w-5 h-5" /></a>
                      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] p-3 rounded-lg flex justify-center transition-colors" title="WhatsApp"><MessageCircle className="w-5 h-5" /></a>
                  </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Appointments */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-phoenix-600" /> Scheduled Inspections
              </h3>
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No appointments scheduled.</p>
                  <button onClick={() => onNavigate('schedule')} className="mt-2 text-phoenix-600 font-semibold hover:underline">Schedule Now</button>
                </div>
              ) : (
                <div className="space-y-4">
                   {appointments.map(appt => (
                     <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-phoenix-500">
                        <div>
                          <p className="font-bold text-gray-900 capitalize">{appt.type}</p>
                          <p className="text-sm text-gray-500">{new Date(appt.date).toLocaleDateString()} at {appt.time}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appt.status}
                        </span>
                     </div>
                   ))}
                </div>
              )}
            </div>

            {/* Saved Quotes */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-phoenix-600" /> Saved Estimates
              </h3>
              {quotes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No saved quotes.</p>
                  <button onClick={() => onNavigate('quote')} className="mt-2 text-phoenix-600 font-semibold hover:underline">Get Instant Quote</button>
                </div>
              ) : (
                <div className="space-y-4">
                   {quotes.map(quote => (
                     <div key={quote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-bold text-gray-900">{quote.material?.name || "Unknown Material"}</p>
                          <p className="text-sm text-gray-500">{quote.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-phoenix-600">${quote.estimatedCost.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{quote.roofAreaSqFt} sq ft</p>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
