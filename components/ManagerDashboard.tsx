
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, Users, Briefcase, 
  MessageSquare, Phone, Mail, MoreHorizontal, LayoutDashboard, 
  Map as MapIcon, ChevronLeft, ChevronRight, Search, 
  CheckCircle2, ListTodo, Send, Filter, Clock, 
  BarChart3, User as UserIcon, LogOut, Plus, ShieldCheck, 
  CloudLightning, Trash2, Edit3, X, History, ExternalLink,
  MapPin // Added missing MapPin import
} from 'lucide-react';
import { User, LeadStage, CRMTask, CRMActivity } from '../types';
import { OutreachCRM } from './OutreachCRM';

// --- HELPER: ADDRESS NORMALIZATION (Standardized for Joins) ---
const normalizeAddress = (addr: string): string => {
  if (!addr) return '';
  return addr.toLowerCase().trim()
    .replace(/[.,]/g, "")
    .replace(/\bstreet\b/g, "st")
    .replace(/\broad\b/g, "rd")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bcourt\b/g, "ct")
    .replace(/\blane\b/g, "ln")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\bnorth\b/g, "n")
    .replace(/\bsouth\b/g, "s")
    .replace(/\beast\b/g, "e")
    .replace(/\bwest\b/g, "w")
    .toUpperCase();
};

const STAGES: LeadStage[] = ['New', 'Contacted', 'Inspection', 'Proposal', 'Won', 'Lost'];

export const ManagerDashboard: React.FC = () => {
  const { users, appointments, logout, updateLeadStage } = useAuth();
  const [activeTab, setActiveTab] = useState<'contacts' | 'pipeline' | 'tasks' | 'outreach' | 'map'>('contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const activeLead = users.find(u => u.id === selectedLeadId);

  // Filtered Leads
  const filteredLeads = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.address && u.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.phone && u.phone.includes(searchTerm))
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* 1. HUB-SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-2xl z-50">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="bg-phoenix-600 p-2 rounded-xl">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
               <p className="font-black text-xs tracking-[0.2em] text-phoenix-400">PHOENIX</p>
               <p className="font-black text-sm uppercase italic">616 CRM</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarLink icon={<Users className="w-5 h-5"/>} label="Contacts" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
          <SidebarLink icon={<LayoutDashboard className="w-5 h-5"/>} label="Deals Pipeline" active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} />
          <SidebarLink icon={<ListTodo className="w-5 h-5"/>} label="Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <SidebarLink icon={<Send className="w-5 h-5"/>} label="Messaging Outreach" active={activeTab === 'outreach'} onClick={() => setActiveTab('outreach')} />
          <SidebarLink icon={<MapIcon className="w-5 h-5"/>} label="Territory Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
        </nav>

        <div className="p-6 border-t border-slate-800/50 bg-slate-950/30">
           <button onClick={logout} className="w-full flex items-center gap-3 text-slate-400 hover:text-white transition group">
              <LogOut className="w-5 h-5 group-hover:text-red-400" />
              <span className="text-sm font-bold">Sign Out</span>
           </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
           <div className="flex items-center gap-4 w-96">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search CRM..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                 <p className="text-xs font-black text-slate-900 uppercase">Grand Rapids Native</p>
                 <p className="text-[10px] text-slate-400 font-bold">Staff Access</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center">
                 <UserIcon className="w-5 h-5 text-slate-400" />
              </div>
           </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-8">
           {activeTab === 'contacts' && <ContactList leads={filteredLeads} onSelect={setSelectedLeadId} />}
           {activeTab === 'pipeline' && <PipelineView leads={users} onUpdateStage={updateLeadStage} />}
           {activeTab === 'tasks' && <TaskManager leads={users} />}
           {activeTab === 'outreach' && <OutreachCRM />}
           {activeTab === 'map' && <LeadMap leads={users} />}
        </div>
      </main>

      {/* 3. LEAD DETAIL SIDEBAR (Slide-out) */}
      {selectedLeadId && activeLead && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-fade-in-right z-40">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Lead Details</h3>
              <button onClick={() => setSelectedLeadId(null)} className="p-2 hover:bg-slate-200 rounded-lg transition">
                 <X className="w-5 h-5 text-slate-400" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Header Info */}
              <div className="text-center">
                 <div className="w-20 h-20 bg-phoenix-50 rounded-full mx-auto mb-4 flex items-center justify-center text-phoenix-600 border border-phoenix-100">
                    <UserIcon className="w-10 h-10" />
                 </div>
                 <h4 className="text-xl font-black text-slate-900">{activeLead.name}</h4>
                 <p className="text-xs font-bold text-slate-400 mt-1">{activeLead.email}</p>
                 <div className="mt-4 flex justify-center gap-2">
                    <span className="px-3 py-1 bg-phoenix-100 text-phoenix-700 text-[10px] font-black uppercase rounded-full border border-phoenix-200">{activeLead.crmStage}</span>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                 <a href={`tel:${activeLead.phone}`} className="flex items-center justify-center gap-2 p-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-200">
                    <Phone className="w-4 h-4" /> Call
                 </a>
                 <a href={`sms:${activeLead.phone}`} className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition">
                    <MessageSquare className="w-4 h-4" /> Text
                 </a>
              </div>

              {/* Data Summary */}
              <div className="space-y-4">
                 <DetailItem label="Address" value={activeLead.address || 'Not Provided'} icon={<MapPin className="w-3.5 h-3.5"/>} />
                 <DetailItem label="Normalized (DB)" value={normalizeAddress(activeLead.address || '')} icon={<ShieldCheck className="w-3.5 h-3.5"/>} />
                 <DetailItem label="Phone" value={activeLead.phone || 'Not Provided'} icon={<Phone className="w-3.5 h-3.5"/>} />
                 <DetailItem label="Referrals" value={`${activeLead.referralCount} (${activeLead.referralCode})`} icon={<Users className="w-3.5 h-3.5"/>} />
              </div>

              {/* Activity Timeline */}
              <div className="pt-6 border-t border-slate-100">
                 <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Activity Timeline</h5>
                 <div className="space-y-4">
                    {activeLead.activities?.map(act => (
                      <div key={act.id} className="flex gap-3 relative pl-4 border-l-2 border-slate-100 last:border-0 pb-4">
                         <div className="absolute -left-[7px] top-0 w-3 h-3 bg-white border-2 border-slate-300 rounded-full"></div>
                         <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900">{act.text}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(act.timestamp).toLocaleDateString()}</p>
                         </div>
                      </div>
                    ))}
                    {!activeLead.activities?.length && <p className="text-xs text-slate-400 italic">No recent activity.</p>}
                 </div>
              </div>
           </div>

           <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-white transition shadow-sm">
                 <Plus className="w-4 h-4 text-phoenix-600" /> Log Activity
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SidebarLink: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active ? 'bg-phoenix-600 text-white shadow-lg shadow-phoenix-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    {icon}
    <span className="text-sm font-bold">{label}</span>
  </button>
);

const DetailItem: React.FC<{ label: string, value: string, icon: any }> = ({ label, value, icon }) => (
  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
     <div className="flex items-center gap-1.5 mb-1">
        <span className="text-slate-400">{icon}</span>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</span>
     </div>
     <p className="text-xs font-bold text-slate-800 break-words">{value}</p>
  </div>
);

// MASTER CONTACT LIST
const ContactList: React.FC<{ leads: User[], onSelect: (id: string) => void }> = ({ leads, onSelect }) => (
  <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
     <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-black text-slate-900 uppercase italic text-sm">Master Contact Database</h3>
        <span className="text-[10px] font-black uppercase bg-slate-900 text-white px-3 py-1 rounded-full">{leads.length} Records</span>
     </div>
     <div className="overflow-x-auto">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                 <th className="px-6 py-4">Name</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Standardized Address</th>
                 <th className="px-6 py-4">Last Event</th>
                 <th className="px-6 py-4 text-center">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50 transition group">
                   <td className="px-6 py-4">
                      <p className="font-black text-sm text-slate-900 group-hover:text-phoenix-600 transition-colors">{lead.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{lead.email}</p>
                   </td>
                   <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${
                        lead.crmStage === 'Won' ? 'bg-green-50 text-green-700 border-green-200' :
                        lead.crmStage === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                         {lead.crmStage || 'New'}
                      </span>
                   </td>
                   <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block max-w-[200px] truncate" title={normalizeAddress(lead.address || '')}>
                         {normalizeAddress(lead.address || '') || 'MISSING'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px] font-medium">{lead.address}</p>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                         <Clock className="w-3 h-3" /> {lead.lastContact || 'Legacy Import'}
                      </div>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onSelect(lead.id)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition shadow-sm"
                      >
                         Open Hub
                      </button>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
     </div>
  </div>
);

// KANBAN PIPELINE VIEW
const PipelineView: React.FC<{ leads: User[], onUpdateStage: (id: string, stage: any) => void }> = ({ leads, onUpdateStage }) => (
  <div className="flex gap-6 h-full overflow-x-auto pb-4">
    {STAGES.map(stage => (
      <div key={stage} className="w-80 flex flex-col bg-slate-100/50 rounded-[2rem] border border-slate-200 h-full p-2">
         <div className="p-4 flex justify-between items-center mb-2">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">{stage}</h4>
            <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm text-slate-900 border border-slate-100">
              {leads.filter(l => l.crmStage === stage || (stage === 'New' && !l.crmStage)).length}
            </span>
         </div>
         <div className="flex-1 overflow-y-auto space-y-3 p-2 custom-scrollbar">
            {leads.filter(l => l.crmStage === stage || (stage === 'New' && !l.crmStage)).map(lead => (
              <div key={lead.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all cursor-grab active:cursor-grabbing group">
                 <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-sm text-slate-900">{lead.name}</p>
                    <MoreHorizontal className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                 </div>
                 <p className="text-[10px] text-slate-400 font-bold truncate mb-3">{lead.address}</p>
                 <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <div className="flex gap-2">
                       {lead.phone && <Phone className="w-3 h-3 text-slate-300" />}
                       {lead.activities?.length ? <History className="w-3 h-3 text-phoenix-400" /> : null}
                    </div>
                    <div className="flex gap-1">
                       <button 
                        onClick={() => onUpdateStage(lead.id, STAGES[Math.max(0, STAGES.indexOf(stage) - 1)])}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400"
                       >&lt;</button>
                       <button 
                        onClick={() => onUpdateStage(lead.id, STAGES[Math.min(STAGES.length - 1, STAGES.indexOf(stage) + 1)])}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400"
                       >&gt;</button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    ))}
  </div>
);

// TERRITORY MAP
const LeadMap: React.FC<{ leads: User[] }> = ({ leads }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (window.google && window.google.maps && mapRef.current && !mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 42.9634, lng: -85.6681 }, 
        zoom: 11,
        styles: [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#ffffff"}]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#000000"},{"lightness": 13}]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#000000"},{"lightness": 20}]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{"color": "#000000"},{"lightness": 20}]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"color": "#0ea5e9"},{"lightness": 17}]
          }
        ],
        backgroundColor: '#0f172a'
      });
    }
    
    if (mapInstance.current) {
      leads.forEach(u => {
        if (u.location) {
          const marker = new window.google.maps.Marker({
            position: u.location,
            map: mapInstance.current,
            title: u.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: u.crmStage === 'Won' ? "#22c55e" : "#0ea5e9",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }
          });
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style="padding:10px; font-family:sans-serif;">
                        <p style="font-weight:900; margin:0;">${u.name}</p>
                        <p style="font-size:10px; color:#64748b; margin:2px 0;">${u.address}</p>
                        <span style="font-size:9px; font-weight:900; background:#f0f9ff; color:#0369a1; padding:2px 6px; border-radius:4px; margin-top:4px; display:inline-block;">${u.crmStage || 'New'}</span>
                      </div>`
          });
          
          marker.addListener('click', () => {
            infoWindow.open(mapInstance.current, marker);
          });
        }
      });
    }
  }, [leads]);

  return (
    <div className="h-full rounded-[3rem] overflow-hidden border border-slate-200 relative bg-slate-900 shadow-2xl">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-6 left-6 bg-slate-950/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 text-white max-w-xs shadow-2xl">
         <h4 className="font-black text-xs uppercase tracking-widest text-phoenix-400 mb-3">Territory Health</h4>
         <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold">
               <span>Alger Heights</span>
               <span className="text-phoenix-500">24 Leads</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
               <span>Creston</span>
               <span className="text-phoenix-500">18 Leads</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
               <span>West Side</span>
               <span className="text-phoenix-500">31 Leads</span>
            </div>
         </div>
      </div>
    </div>
  );
};

// TASK MANAGER
const TaskManager: React.FC<{ leads: User[] }> = ({ leads }) => {
   const [tasks, setTasks] = useState<CRMTask[]>([
      { id: 't1', title: 'Follow up on Creston Hail Claim', dueDate: '2025-05-20', completed: false, priority: 'High' },
      { id: 't2', title: 'Call 7266 Weathersfield regarding quote', dueDate: '2025-05-21', completed: false, priority: 'Medium' }
   ]);

   return (
      <div className="grid md:grid-cols-2 gap-8 h-full">
         <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="font-black text-slate-900 text-lg italic uppercase">Tasks & Follow-Ups</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Daily Action Items</p>
               </div>
               <button className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-black transition shadow-lg">
                  <Plus className="w-5 h-5" />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {tasks.map(task => (
                 <div key={task.id} className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:shadow-md transition">
                    <button className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-phoenix-600 transition group/check">
                       <CheckCircle2 className="w-4 h-4 text-phoenix-600 opacity-0 group-hover/check:opacity-100 transition" />
                    </button>
                    <div className="flex-1">
                       <p className="font-bold text-slate-900 text-sm">{task.title}</p>
                       <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {task.dueDate}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                             task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-200 text-slate-600'
                          }`}>{task.priority}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col">
            <h3 className="text-2xl font-black italic mb-6">Staff Productivity</h3>
            <div className="space-y-6 flex-1">
               <StatProgress label="Outreach Targets" val={65} color="bg-phoenix-500" />
               <StatProgress label="Inspection Quota" val={42} color="bg-fire-500" />
               <StatProgress label="Closing Rate" val={18} color="bg-green-500" />
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 flex gap-4">
               <div className="flex-1 text-center">
                  <p className="text-3xl font-black text-phoenix-400">12</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Booked Today</p>
               </div>
               <div className="flex-1 text-center">
                  <p className="text-3xl font-black text-white">$4.2k</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pipe Value</p>
               </div>
            </div>
         </div>
      </div>
   );
};

const StatProgress: React.FC<{ label: string, val: number, color: string }> = ({ label, val, color }) => (
  <div>
     <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
        <span className="text-xs font-black">{val}%</span>
     </div>
     <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${val}%` }}></div>
     </div>
  </div>
);
