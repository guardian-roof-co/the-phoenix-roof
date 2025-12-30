import React from 'react';
import { Shield, Hammer, CloudLightning, Home, CheckCircle2, MapPin, ArrowRight, Snowflake, DollarSign, Award, ThumbsUp } from 'lucide-react';

interface RoofingServicesProps {
  onSchedule: () => void;
  onNavigate?: (view: any) => void;
}

const SERVICES = [
  {
    id: 'insurance',
    title: 'Insurance-Guided Storm Restoration',
    subtitle: 'Serving Ada, Cascade, & Greater Grand Rapids.',
    description: 'We help homeowners navigate the insurance claim process for storm damage repairs. Insurance coverage is determined by your carrier, and homeowners are responsible for their deductible as required by law.',
    icon: CloudLightning,
    features: [
      'Digital Storm Damage Documentation',
      'Xactimate Industry-Standard Estimates',
      'Adjuster Coordination Support',
      'Michigan Building Code Expertise'
    ],
    cta: 'Check Storm History',
    color: 'border-fire-500 bg-fire-50/30'
  },
  {
    id: 'retail',
    title: 'Retail Replacement',
    subtitle: 'Grand Rapids\' Best Price',
    description: 'Highest quality Owens Corning & GAF shingles installed for thousands less than the big "national" brands. Local labor, local prices, lifetime durability.',
    icon: Home,
    features: [
      'Local Price Match Guarantee',
      'Ice & Water Shield Included',
      'Certified Master Installers',
      'Lifetime Shingle Warranty'
    ],
    cta: 'Get Instant Price',
    color: 'border-phoenix-500 bg-phoenix-50/30'
  },
  {
    id: 'emergency',
    title: 'Emergency Service',
    subtitle: '616 Fast Response',
    description: 'Active leak in Kentwood? Missing shingles in Wyoming? Our local rapid-response crew is minutes away to protect your home from Michigan rain.',
    icon: Shield,
    features: [
      'Same-Day Emergency Tarping',
      'Honest Repair vs Replace Advice',
      'Leak Detection Experts',
      'Ice Dam Protection'
    ],
    cta: 'Call 616-319-HAIL',
    color: 'border-slate-800 bg-slate-50'
  }
];

export const RoofingServices: React.FC<RoofingServicesProps> = ({ onSchedule, onNavigate }) => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-phoenix-100 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Local Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-phoenix-600" />
            <span className="text-sm font-black text-phoenix-600 uppercase tracking-widest">Proudly Serving Kent County</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">
            West Michigan's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-phoenix-600 to-fire-600">Local Value Leader</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
            Big quality shouldn't come with a big-box price tag. We've built our reputation on honest estimates and hard work in Grand Rapids since day one.
          </p>
        </div>

        {/* Value Comparison Bar */}
        <div className="bg-slate-50 rounded-3xl p-6 md:p-8 mb-16 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-sm">The Local Advantage</h4>
              <p className="text-slate-500 text-sm">Save 15-20% compared to national franchises</p>
            </div>
          </div>
          <div className="h-px w-full md:w-px md:h-12 bg-slate-200"></div>
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <Award className="w-8 h-8 text-phoenix-500" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-sm">Certified Quality</h4>
              <p className="text-slate-500 text-sm">Master Elite installers using top-tier materials</p>
            </div>
          </div>
          <div className="h-px w-full md:w-px md:h-12 bg-slate-200"></div>
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <ThumbsUp className="w-8 h-8 text-fire-500" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-sm">Trusted History</h4>
              <p className="text-slate-500 text-sm">500+ Grand Rapids homes protected & counting</p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className={`flex flex-col p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${service.color}`}
            >
              <div className="mb-6">
                <div className={`p-4 rounded-2xl inline-flex mb-4 transition-transform group-hover:rotate-6 ${service.id === 'insurance' ? 'bg-fire-100 text-fire-600' : service.id === 'retail' ? 'bg-phoenix-100 text-phoenix-600' : 'bg-slate-900 text-white'}`}>
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{service.title}</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${service.id === 'insurance' ? 'text-fire-600' : service.id === 'retail' ? 'text-phoenix-600' : 'text-slate-400'}`}>
                  {service.subtitle}
                </p>
              </div>

              <p className="text-slate-600 text-sm mb-8 leading-relaxed font-medium">
                {service.description}
              </p>

              <ul className="space-y-4 mb-10 flex-1">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-700">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-[-2px] ${service.id === 'insurance' ? 'text-fire-500' : service.id === 'retail' ? 'text-phoenix-500' : 'text-slate-900'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (service.id === 'insurance' && onNavigate) onNavigate('storm');
                  else if (service.id === 'retail' && onNavigate) onNavigate('quote');
                  else onSchedule();
                }}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${service.id === 'insurance' ? 'bg-fire-600 hover:bg-fire-700 text-white shadow-fire-200' :
                  service.id === 'retail' ? 'bg-phoenix-600 hover:bg-phoenix-700 text-white shadow-phoenix-200' :
                    'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
              >
                {service.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Local Pride CTA */}
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 text-phoenix-400 font-bold mb-4 uppercase tracking-[0.2em] text-xs">
              <Snowflake className="w-4 h-4" /> Built for the 616
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
              Stop paying for <br />
              the CEO's jet.
            </h3>
            <p className="text-slate-300 text-lg font-medium">
              When you choose The Phoenix Roof, your money stays in Grand Rapids. No middleman, no hidden fees, just honest local craft.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto min-w-[320px]">
            <button
              onClick={onSchedule}
              className="bg-white hover:bg-phoenix-50 text-slate-900 px-8 py-5 rounded-2xl font-black uppercase tracking-widest transition transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3 group"
            >
              Schedule Local Estimate
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center md:text-right">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Support West Michigan</p>
              <p className="text-white text-[10px] font-bold mt-1 opacity-60">
                Grand Rapids • Ada • Cascade • Forest Hills
              </p>
            </div>
          </div>

          {/* Decor */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-phoenix-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </div>
    </section>
  );
};