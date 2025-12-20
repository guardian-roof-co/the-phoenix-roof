import React from 'react';
import { Linkedin, Mail, MapPin, Heart, Star, ExternalLink, Globe, Anchor, ShieldCheck } from 'lucide-react';

export const About = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-phoenix-600/10 rounded-3xl mb-6">
            <MapPin className="w-8 h-8 text-phoenix-600" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic">
            Rooted in the <span className="text-phoenix-600">616.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            We didn't start this in a corporate office. We started it on a ladder in <span className="text-slate-900 font-bold">Alger Heights</span>. The Phoenix Roof is a commitment to the neighbors we see every day from <span className="text-slate-900 font-bold">Creston</span> to the <span className="text-slate-900 font-bold">West Side</span>.
          </p>
          
          {/* Google 5-Star Badge */}
          <div className="mt-10">
            <a 
              href="https://share.google/arwZjfHuPT1YKwBtp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all group hover:-translate-y-1"
            >
              <div className="bg-slate-950 p-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="text-left">
                <div className="flex gap-0.5 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">5.0 Star Google Rated</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-phoenix-600 transition-colors" />
            </a>
          </div>
        </div>

        {/* Local Mission Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
           <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                 <Heart className="w-6 h-6 text-phoenix-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Community First</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">Whether it's a historic repair in <span className="text-slate-900 font-bold">Heritage Hill</span> or a modern install in <span className="text-slate-900 font-bold">Easttown</span>, we treat every street like our own.</p>
           </div>
           <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 group">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                 <Anchor className="w-6 h-6 text-fire-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Local Reputation</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">When a storm hits <span className="text-slate-900 font-bold">Belknap Lookout</span> or <span className="text-slate-900 font-bold">Midtown</span>, we're the guys you'll still see at the coffee shop next year. No storm chasers here.</p>
           </div>
           <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 group">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                 <ShieldCheck className="w-6 h-6 text-phoenix-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">The 616 Standard</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">Materials rated for lake-effect snow loads that would crush "national" shingles. Built for <span className="text-slate-900 font-bold">Galewood</span> winters.</p>
           </div>
        </div>

        {/* Leadership Profiles */}
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Paul Manata Profile */}
          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group">
            <div className="h-[550px] bg-slate-200 relative overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop" 
                 alt="Paul Manata" 
                 className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end">
                  <div className="p-10">
                    <h2 className="text-5xl font-black text-white tracking-tighter italic">Paul Manata</h2>
                    <p className="text-phoenix-400 font-black uppercase tracking-[0.2em] text-xs">Founder • Grand Rapids Native</p>
                  </div>
               </div>
            </div>
            <div className="p-10 flex-1 flex flex-col">
              <div className="space-y-4 text-slate-600 font-medium flex-1 text-base leading-relaxed">
                 <p>
                    I founded The Phoenix Roof because I was tired of seeing out-of-state companies taking advantage of my neighbors. I've personally walked roofs from <span className="text-slate-900 font-bold">Alger Heights</span> to the <span className="text-slate-900 font-bold">West Side</span>, ensuring every family gets a fair shake.
                 </p>
                 <p>
                    This isn't a franchise for me—it's my home. When we put a roof on a house in <span className="text-slate-900 font-bold">Creston</span>, I’m putting my personal reputation on that street for the next 30 years.
                 </p>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50 flex gap-6">
                 <a href="https://www.linkedin.com/in/paul-manata-b66809364/" target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-all hover:scale-110">
                    <Linkedin className="w-5 h-5" />
                 </a>
                 <a href="mailto:paul@thephoenixroof.com" className="bg-slate-900 text-white p-3 rounded-xl hover:bg-phoenix-600 transition-all hover:scale-110">
                    <Mail className="w-5 h-5" />
                 </a>
              </div>
            </div>
          </div>

          {/* Sam Koperski Profile */}
          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group">
            <div className="h-[550px] bg-slate-200 relative overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop" 
                 alt="Sam Koperski" 
                 className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end">
                  <div className="p-10">
                    <h2 className="text-5xl font-black text-white tracking-tighter italic">Sam Koperski</h2>
                    <p className="text-phoenix-400 font-black uppercase tracking-[0.2em] text-xs">Co-Founder • Operations</p>
                  </div>
               </div>
            </div>
            <div className="p-10 flex-1 flex flex-col">
              <div className="space-y-4 text-slate-600 font-medium flex-1 text-base leading-relaxed">
                 <p>
                    As Co-Founder, I'm the one ensuring "The Phoenix Standard" is met on every site. Whether our crews are in <span className="text-slate-900 font-bold">Belknap Lookout</span> or out in <span className="text-slate-900 font-bold">Galewood</span>, my eyes are on the details.
                 </p>
                 <p>
                    I was born and raised in the Furniture City, and I take pride in keeping our logistics tight and our prices low for the people of <span className="text-slate-900 font-bold">Midtown</span> and <span className="text-slate-900 font-bold">Heritage Hill</span>.
                 </p>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50 flex gap-6">
                 <a href="mailto:sam@bootstaff.co" className="bg-slate-900 text-white p-3 rounded-xl hover:bg-phoenix-600 transition-all hover:scale-110">
                    <Mail className="w-5 h-5" />
                 </a>
              </div>
            </div>
          </div>

        </div>

        {/* Shared Vision */}
        <div className="mt-24 bg-slate-950 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl border border-white/5">
             <div className="relative z-10 max-w-3xl mx-auto">
                <h3 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter italic">Our 616 Promise</h3>
                <p className="text-2xl text-slate-300 italic mb-12 leading-relaxed font-medium">
                   "We're not building a national franchise. We're building a reputation that our families can be proud of in the city we call home. No shortcuts, just good roofs."
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 opacity-90 pt-10 border-t border-slate-800">
                    <div className="text-center">
                        <p className="text-3xl font-handwriting text-phoenix-400 mb-1">Paul Manata</p>
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">Founder</p>
                    </div>
                    <div className="h-12 w-px bg-slate-800 hidden md:block"></div>
                    <div className="text-center">
                        <p className="text-3xl font-handwriting text-phoenix-400 mb-1">Sam Koperski</p>
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">Co-Founder</p>
                    </div>
                </div>
             </div>
             {/* Decor */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-phoenix-600 rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-fire-600 rounded-full blur-[150px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>
        </div>

      </div>
    </div>
  );
};