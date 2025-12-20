import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Search, Phone, MessageSquare, Copy, Check, Trash2, MoreHorizontal, Filter, AlertCircle, Loader2, Send, CloudLightning, X, History, User, MessageCircle, Database } from 'lucide-react';
import { OutreachContact, OutreachStatus, OutreachMessage } from '../types';
import * as XLSX from 'xlsx';

const STATUS_OPTIONS: OutreachStatus[] = ['Not Contacted', 'Sent', 'Replied', 'Booked', 'Interested', 'No Answer', 'DNC'];

const STATUS_COLORS: Record<OutreachStatus, string> = {
  'Not Contacted': 'bg-gray-100 text-gray-700',
  'Sent': 'bg-blue-100 text-blue-700',
  'Replied': 'bg-green-100 text-green-700',
  'Booked': 'bg-phoenix-100 text-phoenix-700 border border-phoenix-200',
  'Interested': 'bg-yellow-100 text-yellow-700',
  'No Answer': 'bg-orange-100 text-orange-700',
  'DNC': 'bg-red-100 text-red-700'
};

/**
 * Robust Normalization (The Postgres Joining Key)
 */
const normalizeAddressString = (addr: string): string => {
  if (!addr) return '';
  return addr
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") 
    .replace(/\s+/g, " ") 
    .replace(/\bnorth\b/g, "n")
    .replace(/\bsouth\b/g, "s")
    .replace(/\beast\b/g, "e")
    .replace(/\bwest\b/g, "w")
    .replace(/\bstreet\b/g, "st")
    .replace(/\broad\b/g, "rd")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bcourt\b/g, "ct")
    .replace(/\blane\b/g, "ln")
    .replace(/\bdrive\b/g, "dr")
    .toUpperCase();
};

export const OutreachCRM: React.FC = () => {
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | 'All'>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('phoenix_outreach_contacts_v3');
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('phoenix_outreach_contacts_v3', JSON.stringify(contacts));
  }, [contacts]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        setContacts(prev => {
          const updatedContacts = [...prev];

          data.forEach((row, idx) => {
            const findVal = (keys: string[]) => {
              const foundKey = Object.keys(row).find(k => 
                keys.some(search => k.trim().toLowerCase() === search.toLowerCase())
              );
              return foundKey ? String(row[foundKey]).trim() : '';
            };

            const phone = findVal(['Phone', 'Mobile', 'Cell', 'MobileNumber']).replace(/\D/g, '');
            const address = findVal(['Address', 'Street', 'PropertyAddress']);
            const normalized = normalizeAddressString(address);

            // JOIN LOGIC
            const existingIdx = updatedContacts.findIndex(c => 
              (phone && c.phone === phone) || (normalized && c.normalizedAddress === normalized)
            );

            if (existingIdx > -1) {
              const existing = updatedContacts[existingIdx];
              updatedContacts[existingIdx] = {
                ...existing,
                notes: `${existing.notes}\n[Synced ${new Date().toLocaleDateString()}]: Record Refreshed from ${file.name}`,
                sourceFile: file.name
              };
            } else {
              updatedContacts.unshift({
                id: `outreach-${Date.now()}-${idx}`,
                name: findVal(['Name', 'Owner', 'Contact']) || `Lead ${idx + 1}`,
                phone: phone,
                address: address,
                normalizedAddress: normalized,
                status: 'Not Contacted',
                notes: '',
                sourceFile: file.name,
                history: []
              });
            }
          });
          return updatedContacts;
        });
        setIsUploading(false);
      } catch (err) {
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const updateContact = (id: string, updates: Partial<OutreachContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addHistoryMessage = (id: string, direction: 'sent' | 'received') => {
    if (!msgInput.trim()) return;
    const newMessage: OutreachMessage = {
      id: crypto.randomUUID(),
      text: msgInput,
      timestamp: new Date().toISOString(),
      direction
    };
    setContacts(prev => prev.map(c => 
      c.id === id ? { 
        ...c, 
        history: [...c.history, newMessage],
        status: direction === 'received' ? 'Replied' : c.status
      } : c
    ));
    setMsgInput('');
  };

  const activeContact = contacts.find(c => c.id === activeHistoryId);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
         <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Manual Outreach Engine</h2>
            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">High Velocity Prospecting</p>
         </div>
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="bg-phoenix-600 hover:bg-phoenix-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg shadow-phoenix-200"
         >
           {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
           Standardized Import
         </button>
         <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .csv" onChange={handleFileUpload} />
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 flex-1 flex flex-col overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-phoenix-500"
                  placeholder="Filter manual texting list..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest sticky top-0">
                  <tr>
                     <th className="px-6 py-4">Lead</th>
                     <th className="px-6 py-4">Normalization Key</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-center">Velocity Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(contact => (
                    <tr key={contact.id} className="hover:bg-slate-50 transition group">
                       <td className="px-6 py-4">
                          <p className="font-black text-sm text-slate-900">{contact.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{contact.phone}</p>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[9px] font-black bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-slate-600 block w-fit">
                             <Database className="w-3 h-3 inline mr-1 opacity-50" /> {contact.normalizedAddress}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${STATUS_COLORS[contact.status]}`}>
                             {contact.status}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                             <a 
                               href={`sms:${contact.phone}`}
                               onClick={() => updateContact(contact.id, { status: 'Sent' })}
                               className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-black transition shadow-md"
                             >
                                <Send className="w-4 h-4 text-phoenix-400" />
                             </a>
                             <button 
                               onClick={() => setActiveHistoryId(contact.id)}
                               className="bg-white border border-slate-200 p-2.5 rounded-xl hover:bg-slate-50 transition relative"
                             >
                                <History className="w-4 h-4 text-slate-400" />
                                {contact.history.length > 0 && <span className="absolute -top-1 -right-1 bg-phoenix-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">{contact.history.length}</span>}
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {activeHistoryId && activeContact && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col h-[600px] overflow-hidden animate-fade-in-up">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
               <h3 className="font-black text-lg italic uppercase">{activeContact.name} - Log</h3>
               <button onClick={() => setActiveHistoryId(null)}><X className="w-6 h-6"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
               {activeContact.history.map(msg => (
                 <div key={msg.id} className={`flex ${msg.direction === 'sent' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold ${msg.direction === 'sent' ? 'bg-phoenix-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                       {msg.text}
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
               <input 
                  type="text" 
                  value={msgInput} 
                  onChange={(e) => setMsgInput(e.target.value)}
                  className="flex-1 bg-slate-100 rounded-xl px-4 py-2 outline-none text-xs font-bold"
                  placeholder="Record interaction..."
               />
               <button onClick={() => addHistoryMessage(activeContact.id, 'sent')} className="bg-phoenix-600 text-white p-2 rounded-xl"><Send className="w-4 h-4"/></button>
               <button onClick={() => addHistoryMessage(activeContact.id, 'received')} className="bg-green-600 text-white p-2 rounded-xl"><MessageCircle className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
