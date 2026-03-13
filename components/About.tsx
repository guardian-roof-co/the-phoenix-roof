import { Mail, MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';

export const About = () => {
   return (
      <div className="bg-slate-50 min-h-screen py-16 font-sans">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Main Hero / Text Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
               <div>
                  <div className="inline-flex items-center gap-2 bg-phoenix-100 text-phoenix-700 px-4 py-1.5 rounded-full mb-8 text-[10px] font-black uppercase tracking-widest">
                     <ShieldCheck className="w-4 h-4" /> Locally Owned & Operated
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic leading-[0.9]">
                     Family Owned. <br />
                     <span className="text-phoenix-600">Rockford Driven.</span>
                  </h1>
                  <p className="text-2xl text-slate-600 font-medium leading-relaxed italic mb-8">
                     "With over 25 years of experience in home restoration, our family owned and operated company looks forward to helping you navigate your next project with end results you will be proud of for years to come!"
                  </p>
               </div>
               <div className="relative">
                  <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative z-10 border border-slate-800">
                     <div className="space-y-8">
                        <h3 className="text-white text-2xl font-black uppercase tracking-tighter italic border-b border-slate-800 pb-4">Contact Information</h3>

                        <div className="flex items-start gap-5">
                           <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                              <MapPin className="w-6 h-6 text-phoenix-500" />
                           </div>
                           <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Our Location</p>
                              <p className="text-white font-bold">Rockford, MI, United States</p>
                              <p className="text-slate-400 text-sm">Serving West Michigan</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-5">
                           <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                              <Phone className="w-6 h-6 text-green-500" />
                           </div>
                           <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Call Us Direct</p>
                              <a href="tel:6168632650" className="text-white font-black text-2xl tracking-tighter hover:text-phoenix-400 transition-colors cursor-pointer">+1 616-863-2650</a>
                           </div>
                        </div>

                        <div className="flex items-start gap-5">
                           <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                              <Mail className="w-6 h-6 text-blue-500" />
                           </div>
                           <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Email Support</p>
                              <a href="mailto:info@thephoenixroof.com" className="text-white font-bold hover:text-blue-400 transition-colors">info@thephoenixroof.com</a>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-full h-full bg-phoenix-600/10 rounded-[3rem] -z-0"></div>
               </div>
            </div>

            {/* Experience Banner */}
            <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 mb-24 grid md:grid-cols-3 gap-8 text-center">
               <div>
                  <p className="text-4xl font-black text-slate-900 mb-2">25+</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Years Experience</p>
               </div>
               <div className="border-x border-slate-100">
                  <p className="text-4xl font-black text-phoenix-600 mb-2">616</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local Native</p>
               </div>
               <div>
                  <p className="text-4xl font-black text-slate-900 mb-2">5.0</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Star Rating</p>
               </div>
            </div>

            {/* Owner Section */}
            <div className="max-w-4xl mx-auto mb-24">
               <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                     <ShieldCheck className="w-64 h-64" />
                  </div>

                  <div className="relative z-10">
                     <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                           <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest">
                              A Message from the Owner
                           </div>
                           <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 leading-tight">
                              Meet <span className="text-phoenix-600">Sam Koperski</span>
                           </h2>
                           <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed italic">
                              <p>
                                 "Growing up here in West Michigan, I learned early on that your word is your bond and your work is your legacy. At The Phoenix Roof, we strive to build more than just a roofing company—we provide a service that families can trust implicitly."
                              </p>
                              <p>
                                 "With over two decades of hands-on experience in the industry, I've seen it all. But what never changes is the satisfaction of seeing a homeowner's peace of mind when a job is done right. We treat every roof as if it were protecting our own family, using only the best materials and the most dedicated local craftsmen."
                              </p>
                           </div>

                           <div className="mt-10 pt-10 border-t border-slate-100 flex items-center gap-4">
                              <div className="w-12 h-12 bg-phoenix-600 rounded-full flex items-center justify-center text-white font-black italic">
                                 SK
                              </div>
                              <div>
                                 <p className="text-slate-900 font-black uppercase italic tracking-tight">Sam Koperski</p>
                                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Owner</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Promise Section */}
            <div className="max-w-3xl mx-auto text-center">
               <Heart className="w-12 h-12 text-phoenix-500 mx-auto mb-6" />
               <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-6">Our Family's Promise to Yours</h2>
               <p className="text-slate-600 font-medium leading-relaxed mb-10 text-lg">
                  We don't just work in Rockford; we live here. Every project we take on is handled with the same care and attention to detail we would provide for our own family's home. From the first phone call to the final cleanup, we're with you every step of the way.
               </p>
            </div>

         </div>
      </div>
   );
};