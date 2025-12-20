import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertTriangle, X, Shield, Bot, FileType, Mail, User, Phone, Loader2 } from 'lucide-react';
import { analyzeInsurancePolicy } from '../services/geminiService';
import { AnalysisStatus } from '../types';

const MarkdownDisplay = ({ text }: { text: string }) => {
  return (
    <div className="prose prose-sm prose-slate max-w-none">
      {text.split('\n').map((line, i) => (
        <p key={i} className={`mb-2 ${line.startsWith('#') ? 'font-bold text-gray-900 mt-4' : 'text-gray-700'}`}>
          {line.replace(/^#+\s/, '')}
        </p>
      ))}
    </div>
  )
}

interface InsuranceAnalyzerProps {
  onSchedule: () => void;
}

export const InsuranceAnalyzer: React.FC<InsuranceAnalyzerProps> = ({ onSchedule }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // User Info for HubSpot
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMsg("File is too large (10MB limit).");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!preview || !file || !userEmail) {
      if (!userEmail) setErrorMsg("Email is required for analysis results.");
      return;
    }

    // Helper to get HubSpot tracking cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    const hutk = getCookie('hubspotutk');

    setStatus(AnalysisStatus.ANALYZING);
    try {
      const base64Data = preview.split(',')[1];
      let mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      const analysisText = await analyzeInsurancePolicy(base64Data, mimeType);
      setResult(analysisText);
      setStatus(AnalysisStatus.COMPLETE);

      // HubSpot Sync (via Backend Bridge)
      try {
        const names = userName.trim().split(' ');
        await fetch('/api/quotes-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            firstName: names[0],
            lastName: names.slice(1).join(' ') || 'Lead',
            phone: userPhone,
            leadSource: 'AI Insurance Analyzer',
            pageUri: window.location.href,
            pageName: 'Insurance Analysis',
            hutk
          })
        });
      } catch (e) {
        console.warn('[HubSpot Bridge Error]', e);
      }

    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-3xl mb-6 shadow-sm">
          <Bot className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 italic uppercase">AI Policy Reviewer</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
          Upload your insurance declaration page. Gemini AI will scan it for ACV/RCV coverage and hidden roof deductibles instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Upload & Form Section */}
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 border border-slate-100 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-2">1. Your Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                <input value={userName} onChange={e => setUserName(e.target.value)} type="text" placeholder="Name" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                <input value={userPhone} onChange={e => setUserPhone(e.target.value)} type="tel" placeholder="Phone" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              </div>
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
              <input value={userEmail} onChange={e => setUserEmail(e.target.value)} type="email" placeholder="Email (Required for results)" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-2">2. Policy Upload</h3>
            <div
              className={`border-2 border-dashed rounded-[2.5rem] h-64 flex flex-col items-center justify-center transition-all overflow-hidden relative ${preview ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="relative w-full h-full p-4 flex items-center justify-center">
                  {file?.type === 'application/pdf' ? (
                    <div className="text-center">
                      <FileType className="w-20 h-20 text-red-500 mx-auto mb-2" />
                      <p className="font-black text-slate-900 text-sm truncate max-w-[200px]">{file?.name}</p>
                    </div>
                  ) : (
                    <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-2xl shadow-inner" />
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(''); setStatus(AnalysisStatus.IDLE); }} className="absolute top-4 right-4 bg-slate-900 text-white p-2 rounded-full hover:bg-black shadow-lg"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="text-center p-8 cursor-pointer">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Policy Doc</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">PDF or Image up to 10MB</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || !userEmail || status === AnalysisStatus.ANALYZING}
            className={`w-full py-5 rounded-[2rem] font-black text-white transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest ${!file || !userEmail ? 'bg-slate-200 cursor-not-allowed text-slate-400' :
              status === AnalysisStatus.ANALYZING ? 'bg-blue-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
          >
            {status === AnalysisStatus.ANALYZING ? "AI Scanning..." : "Analyze My Policy"}
            <Shield className="w-5 h-5" />
          </button>

          {errorMsg && <p className="text-xs text-red-500 text-center font-black uppercase tracking-widest">{errorMsg}</p>}
        </div>

        {/* Results Sidebar */}
        <div className="bg-slate-900 rounded-[3rem] shadow-2xl p-10 text-white min-h-[600px] flex flex-col border border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <Bot className="w-6 h-6 text-blue-400" />
            <h3 className="font-black text-xl italic uppercase">Review Report</h3>
          </div>

          <div className="flex-1 bg-white/5 rounded-[2rem] p-8 overflow-y-auto max-h-[500px] border border-white/10">
            {status === AnalysisStatus.IDLE && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                <Shield className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-medium text-sm">Waiting for upload...</p>
              </div>
            )}

            {status === AnalysisStatus.ANALYZING && (
              <div className="space-y-6">
                <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-32 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              </div>
            )}

            {status === AnalysisStatus.ERROR && (
              <div className="text-center text-red-400 mt-10">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">AI Failure. Please try again with a clearer image.</p>
              </div>
            )}

            {status === AnalysisStatus.COMPLETE && (
              <div className="animate-fade-in">
                <div className="bg-blue-500/20 text-blue-300 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/30 flex items-center gap-3">
                  <Check className="w-4 h-4" />
                  Review Generated • {isSyncing ? "Syncing to CRM..." : "Synced to HubSpot"}
                </div>
                <div className="text-slate-100 prose prose-invert prose-sm">
                  <MarkdownDisplay text={result} />
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-sm text-slate-400 mb-6 font-medium">Found gaps? Let's discuss them in person.</p>
                  <button onClick={onSchedule} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl">
                    Schedule Free Expert Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
