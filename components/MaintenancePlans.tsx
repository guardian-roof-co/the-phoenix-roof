
import React from 'react';
import { Check, ShieldCheck, Camera } from 'lucide-react';
import { MaintenancePlan } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface MaintenancePlansProps {
  onSchedule: () => void;
  onSelfInspect?: () => void;
}

const PLANS: MaintenancePlan[] = [
  {
    id: 'basic',
    name: 'Essential Care',
    priceMonthly: 19,
    features: [
      'Annual Roof Inspection',
      'Gutter Cleaning (1x/year)',
      'Minor Sealant Touch-ups',
      'Priority Scheduling for Repairs'
    ]
  },
  {
    id: 'pro',
    name: 'Phoenix Pro',
    priceMonthly: 39,
    isPopular: true,
    features: [
      'Bi-Annual Roof Inspections',
      'Gutter Cleaning (2x/year)',
      'Debris Removal',
      'Skylight Cleaning',
      '10% Discount on Repairs',
      '$500 Leak Repair Deductible Credit'
    ]
  },
  {
    id: 'premium',
    name: 'Ultimate Shield',
    priceMonthly: 69,
    features: [
      'Quarterly Inspections',
      'Seasonal Gutter Maintenance',
      'Full Roof Soft Wash (1x/year)',
      'Attic Ventilation Check',
      '20% Discount on Repairs',
      'Storm Priority Response Team'
    ]
  }
];

export const MaintenancePlans: React.FC<MaintenancePlansProps> = ({ onSchedule, onSelfInspect }) => {
  const { user } = useAuth();
  
  return (
    <div className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Existing Member Self-Check CTA */}
        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden mb-16 relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-phoenix-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
             <div className="relative z-10 px-8 py-10 md:flex items-center justify-between">
                 <div className="mb-6 md:mb-0">
                     <span className="bg-phoenix-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full mb-3 inline-block">Member Exclusive</span>
                     <h3 className="text-2xl font-bold text-white mb-2">Already have a plan?</h3>
                     <p className="text-slate-300 max-w-xl">
                         Perform a <strong className="text-white">Self-Inspection</strong> using our AI & Google Street View tool. 
                         Ensure your roof is eligible for coverage or check for storm damage instantly.
                     </p>
                 </div>
                 <button 
                    onClick={onSelfInspect}
                    className="bg-white text-slate-900 hover:bg-phoenix-50 font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition transform hover:scale-105"
                 >
                     <Camera className="w-5 h-5 text-phoenix-600" /> Start Self-Inspection
                 </button>
             </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Protect Your Investment
          </h2>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
            Regular maintenance extends the life of your roof by up to 10 years. Join the Phoenix Shield program today.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-white rounded-2xl shadow-xl flex flex-col ${plan.isPopular ? 'border-2 border-phoenix-500 scale-105 z-10' : 'border border-gray-100'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-phoenix-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="p-8 flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">${plan.priceMonthly}</span>
                  <span className="text-slate-500 ml-2">/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-base text-slate-600">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 bg-slate-50 rounded-b-2xl border-t border-gray-100">
                <button
                  onClick={onSchedule}
                  className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-md transition-colors ${
                    plan.isPopular 
                      ? 'text-white bg-phoenix-600 hover:bg-phoenix-700 shadow-lg shadow-phoenix-200' 
                      : 'text-phoenix-600 bg-white border-phoenix-200 hover:bg-phoenix-50'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
