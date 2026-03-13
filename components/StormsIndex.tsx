
import React from 'react';
import { MapPin, Calendar, Zap, ArrowRight, ShieldAlert } from 'lucide-react';
import { ViewState } from '../types';
import { StormData } from '../data/storms';

interface StormsIndexProps {
  storms: StormData[];
  onNavigate: (view: ViewState, slug?: string) => void;
}

export const StormsIndex: React.FC<StormsIndexProps> = ({ storms, onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-red-100 text-red-700 px-4 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest relative">
            <span className="absolute -left-1 w-2 h-2 bg-red-600 rounded-full beacon-red"></span>
            <ShieldAlert className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Storm Damage Alert Center</span>
            <span className="absolute -right-1 w-2 h-2 bg-red-600 rounded-full beacon-red"></span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">
            Active <span className="text-red-600">Storm Events</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            Select a recent storm event to see confirmed impact data and schedule your forensic roof inspection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {storms.map((storm) => (
            <div 
              key={storm.slug}
              onClick={() => onNavigate('storm-landing', storm.slug)}
              className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hail Size</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{storm.hailSize}</p>
                </div>
              </div>

              <h3 className="text-2xl font-black mb-1 uppercase italic text-slate-900 leading-tight">
                {storm.city}
              </h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> {storm.date}
              </p>

              <p className="text-slate-600 text-sm font-medium mb-8 flex-1 leading-relaxed">
                {storm.description}
              </p>

              <div className="flex items-center gap-2 text-red-600 font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                View Impact Data <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
