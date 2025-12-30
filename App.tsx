import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuoteFlow } from './components/QuoteFlow';
import { InsuranceAnalyzer } from './components/InsuranceAnalyzer';
import { RoofingServices } from './components/RoofingServices';
import { Scheduler } from './components/Scheduler';
import { RoofEducation } from './components/RoofEducation';
import { ChatAssistant } from './components/ChatAssistant';
import { SelfInspection } from './components/SelfInspection';
import { StormReview } from './components/StormReview';
import { About } from './components/About';
import { ViewState } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { Signup } from './components/Signup';
import { Certifications } from './components/Certifications';
import { Testimonials } from './components/Testimonials';
import { MapPin, Shield, Star, ThumbsUp, Hammer, Wrench, ShieldAlert, CheckCircle2, Bot, ArrowRight, ShieldCheck, FileSearch } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [quoteLocation, setQuoteLocation] = useState<{ address: string, coords?: { lat: number, lng: number } } | null>(null);
  const [schedulerPrefill, setSchedulerPrefill] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utms = {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign')
    };

    if (utms.utmSource) sessionStorage.setItem('utm_source', utms.utmSource);
    if (utms.utmMedium) sessionStorage.setItem('utm_medium', utms.utmMedium);
    if (utms.utmCampaign) sessionStorage.setItem('utm_campaign', utms.utmCampaign);
  }, []);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleStartQuote = (address: string, coords: { lat: number, lng: number }) => {
    setQuoteLocation({ address, coords });
    handleNavigate('quote');
  };

  const handleScheduleWithNotes = (notes: string) => {
    setSchedulerPrefill(notes);
    handleNavigate('schedule');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero onGetQuote={handleStartQuote} onSchedule={() => handleNavigate('schedule')} onAnalyze={() => handleNavigate('insurance')} />

            {/* Trust Bar */}
            <div className="bg-slate-950 py-6 border-y border-slate-900 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-phoenix-500" /> Serving Grand Rapids & Kent County</div>
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> 5.0 Star Google Rating</div>
                <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Licensed & Locally Insured</div>
                <div className="flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-fire-500" /> Trusted West MI Choice</div>
              </div>
            </div>

            <Certifications />

            {/* AI Policy Review Section - NEW */}
            <div className="bg-white py-24 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 skew-x-12 transform translate-x-1/2"></div>
              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest">
                      <Bot className="w-4 h-4" /> AI Powered Analysis
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 italic uppercase leading-none">
                      Don't Get <span className="text-blue-600">Denied.</span>
                    </h2>
                    <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
                      Most Grand Rapids homeowners don't realize their policy has "Roof Surface Payment" exclusions or high Hail deductibles until it's too late.
                      Our AI reviews your policy for <strong>roofing-specific gaps</strong> and gives you a professional recommendation instantly.
                    </p>
                    <div className="space-y-4 mb-10">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-600 rounded-full p-0.5"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                        <p className="text-sm font-bold text-slate-800 uppercase italic tracking-wide">Checks ACV vs RCV Coverage</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-600 rounded-full p-0.5"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                        <p className="text-sm font-bold text-slate-800 uppercase italic tracking-wide">Identifies Wind/Hail Deductibles</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-600 rounded-full p-0.5"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                        <p className="text-sm font-bold text-slate-800 uppercase italic tracking-wide">Finds Code Upgrade Endorsements</p>
                      </div>
                    </div>
                    <button onClick={() => handleNavigate('insurance')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3">
                      Run Free AI Policy Review <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative z-10 border border-slate-800">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                          <FileSearch className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Instant Analysis</p>
                          <p className="text-white font-black uppercase italic">Gemini 3.0 Vision</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-4 bg-slate-800 rounded-full w-3/4"></div>
                        <div className="h-4 bg-slate-800 rounded-full w-full"></div>
                        <div className="h-4 bg-slate-800 rounded-full w-5/6"></div>
                        <div className="h-20 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                          <p className="text-blue-300 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Scanning Policy Part 1A...</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-full h-full bg-slate-200 rounded-[3rem] -z-0"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-slate-50 py-24 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest">
                    <Wrench className="w-4 h-4 text-phoenix-400" /> Honest Grand Rapids Pricing
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">No Games. <span className="text-phoenix-600">Just Repairs.</span></h2>
                  <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">
                    Tired of $3,000 "minimums" from national companies? We offer flat-rate pricing based on repair size for our neighbors in Greater Grand Rapids.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-slate-50 rounded-2xl text-slate-900">
                        <Hammer className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starts At</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">$299</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase italic">Minor Patch</h3>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-green-500" /> Missing Shingle Match</li>
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-green-500" /> Sealant Refresh</li>
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-green-500" /> Loose Trim/Drip Edge</li>
                    </ul>
                    <button onClick={() => handleScheduleWithNotes("Small Repair Request ($299 tier)")} className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase py-4 rounded-2xl text-[10px] tracking-widest transition-all">Book Small Fix</button>
                  </div>

                  <div className="bg-white p-8 rounded-[3rem] shadow-xl border-2 border-phoenix-600 flex flex-col relative scale-105 z-10">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-phoenix-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Most Popular</div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-phoenix-50 rounded-2xl text-phoenix-600">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starts At</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">$599</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase italic">Standard Fix</h3>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-phoenix-500" /> Pipe Boot Replacement</li>
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-phoenix-500" /> Flashing Leak Repair</li>
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-phoenix-500" /> Multiple Leak Source Fix</li>
                    </ul>
                    <button onClick={() => handleScheduleWithNotes("Medium Repair Request ($599 tier)")} className="w-full bg-phoenix-600 hover:bg-phoenix-700 text-white font-black uppercase py-4 rounded-2xl text-[10px] tracking-widest transition-all">Book Standard Fix</button>
                  </div>

                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-fire-50 rounded-2xl text-fire-600">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starts At</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">$999</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase italic">Major Rescue</h3>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-fire-500" /> Emergency Tarping</li>
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-fire-500" /> Chimney Flashing Overhaul</li>
                      <li className="flex items-center gap-2 text-sm text-slate-600 font-bold"><CheckCircle2 className="w-4 h-4 text-fire-500" /> Valley Replacement</li>
                    </ul>
                    <button onClick={() => handleScheduleWithNotes("Major Repair Request ($999+ tier)")} className="w-full border-2 border-fire-600 text-fire-600 hover:bg-fire-50 font-black uppercase py-4 rounded-2xl text-[10px] tracking-widest transition-all">Request Emergency Fix</button>
                  </div>
                </div>
              </div>
            </div>

            <Testimonials />

            <div className="bg-white py-24 relative">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">The Phoenix <span className="text-phoenix-600">Standard</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-12 mb-20">
                  <div className="group text-center">
                    <div className="w-20 h-20 bg-phoenix-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-phoenix-600">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight">Fair Local Pricing</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">No national corporate overhead means better prices for <span className="text-slate-900 font-bold">Grand Rapids residents</span>.</p>
                  </div>
                  <div className="group text-center">
                    <div className="w-20 h-20 bg-fire-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-fire-600">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight">616 Proven Quality</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">Built for lake-effect snow. <span className="text-slate-900 font-bold">Lifetime workmanship warranty.</span></p>
                  </div>
                  <div className="group text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-900">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight">Honest Consults</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">No high-pressure sales. We'll tell you if your roof <span className="text-slate-900 font-bold">just needs a repair</span>.</p>
                  </div>
                </div>
              </div>
            </div>
            <RoofingServices onSchedule={() => handleNavigate('schedule')} onNavigate={handleNavigate} />
          </>
        );
      case 'quote':
        return <QuoteFlow initialLocation={quoteLocation} onSchedule={() => handleNavigate('schedule')} />;
      case 'insurance':
        return <InsuranceAnalyzer onSchedule={() => handleNavigate('schedule')} />;
      case 'maintenance':
        return <RoofingServices onSchedule={() => handleNavigate('schedule')} onNavigate={handleNavigate} />;
      case 'storm':
        return <StormReview onSchedule={() => handleNavigate('schedule')} />;
      case 'education':
        return <RoofEducation onSchedule={() => handleNavigate('schedule')} />;
      case 'schedule':
        return <Scheduler initialNotes={schedulerPrefill} />;
      case 'about':
        return <About />;
      case 'signup':
        return <Signup />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header onNavigate={handleNavigate} currentView={currentView} />
      <main>
        {renderContent()}
      </main>
      <ChatAssistant />
      <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h4 className="text-white font-black text-2xl mb-6 tracking-tight uppercase italic">The <span className="text-phoenix-500">Phoenix</span> Roof</h4>
              <p className="text-sm leading-relaxed max-w-sm font-medium">Grand Rapids' locally owned premium roofer. Greater Grand Rapids Area Coverage.</p>
            </div>
            <div className="flex flex-col md:items-end gap-4">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">616 Support Line</p>
                <a href="tel:6163194245" className="text-white font-black text-xl tracking-tighter italic hover:text-phoenix-500 transition-colors">616-319-HAIL</a>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest">© 2025 The Phoenix Roof & Exteriors | License #2101234567</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
