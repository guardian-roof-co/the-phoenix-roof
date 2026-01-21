import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Calculator, CalendarCheck, MapPin, ShieldCheck, Zap, Bot } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface HeroProps {
  onGetQuote: (address: string, coords: { lat: number, lng: number }) => void;
  onSchedule: () => void;
  onAnalyze: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetQuote, onSchedule, onAnalyze }) => {
  const [activeTab, setActiveTab] = useState<'quote' | 'inspect' | 'insurance'>('quote');
  const [inputValue, setInputValue] = useState('');
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleLoaded(true);
      if (inputRef.current && !autocompleteRef.current) {
        try {
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'geometry']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const address = place.formatted_address;
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              setInputValue(address);
              onGetQuote(address, { lat, lng });
            }
          });

          autocompleteRef.current = autocomplete;
        } catch (e) {
          console.error("Hero Autocomplete Error", e);
        }
      }
    }
  }, [onGetQuote]);

  const handleManualSubmit = () => {
    if (inputValue.trim().length > 3) {
      onGetQuote(inputValue, { lat: 0, lng: 0 });
    }
  };

  return (
    <div className="relative bg-slate-950 overflow-hidden">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover opacity-60"
          src="https://images.unsplash.com/photo-1513584684374-8bdb74838a0f?q=80&w=2070&auto=format&fit=crop"
          alt="Grand Rapids Residential Roofing"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="md:w-2/3 lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-phoenix-600/20 border border-phoenix-500/30 px-3 py-1.5 rounded-full mb-8 backdrop-blur-md">
            <MapPin className="w-4 h-4 text-phoenix-400" />
            <span className="text-phoenix-100 text-[10px] font-black uppercase tracking-widest">Grand Rapids Native • 616 Operations</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9] italic uppercase">
            Built for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-phoenix-400 via-white to-fire-400">
              The 616.
            </span>
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-lg font-medium">
            Local labor. Local prices. No corporate overhead. Just honest Grand Rapids roofing for West Michigan families.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-bold">
              <ShieldCheck className="w-5 h-5 text-phoenix-500" /> MI Code Compliant
            </div>
            <div className="flex items-center gap-2 text-slate-200 text-sm font-bold">
              <Zap className="w-5 h-5 text-yellow-500" /> Operations Verified
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-3 shadow-2xl max-w-md border border-slate-100 ring-4 ring-black/5 animate-fade-in-up">
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
              <button onClick={() => setActiveTab('quote')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex justify-center items-center gap-2 ${activeTab === 'quote' ? 'bg-white text-phoenix-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><Calculator className="w-4 h-4" /> Quote</button>
              <button onClick={() => setActiveTab('inspect')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex justify-center items-center gap-2 ${activeTab === 'inspect' ? 'bg-white text-fire-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><CalendarCheck className="w-4 h-4" /> Visit</button>
              <button onClick={() => setActiveTab('insurance')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex justify-center items-center gap-2 ${activeTab === 'insurance' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><Bot className="w-4 h-4" /> AI Review</button>
            </div>

            <div className="px-4 pb-4">
              {activeTab === 'quote' && (
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Property Address..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-phoenix-500 outline-none text-slate-900 font-bold placeholder-slate-400"
                    />
                  </div>
                  <button onClick={handleManualSubmit} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2">
                    Get Local Estimate <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeTab === 'inspect' && (
                <div className="text-center py-4">
                  <p className="text-slate-600 mb-6 text-sm font-medium leading-relaxed px-4">Suspect damage? Get an honest <span className="text-slate-900 font-bold">616 assessment</span> from our local operations crew.</p>
                  <button onClick={onSchedule} className="w-full bg-phoenix-600 hover:bg-phoenix-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest">Book 616 Inspection</button>
                </div>
              )}

              {activeTab === 'insurance' && (
                <div className="text-center py-4">
                  <p className="text-slate-600 mb-6 text-sm font-medium leading-relaxed px-4">Upload your policy for an instant AI gap analysis by our <span className="text-blue-600 font-black italic">Phoenix AI Engine</span>.</p>
                  <button onClick={onAnalyze} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest">Analyze Policy</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
