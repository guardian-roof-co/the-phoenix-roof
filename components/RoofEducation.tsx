import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

import { OnScheduleHandler } from '../types';

interface RoofEducationProps {
  onSchedule: OnScheduleHandler;
}

const PROBLEMS = [
  {
    title: "Missing Shingles",
    desc: "Strong winds can tear shingles off completely. This exposes the underlayment and deck to moisture.",
    severity: "High",
    img: "/images/roofing/roof-shingles.jpg"
  },
  {
    title: "Granule Loss",
    desc: "If your shingles look bald or you find sand-like granules in gutters, your roof is aging and losing UV protection.",
    severity: "Medium",
    img: "/images/roofing/roof-sand.jpg"
  },
  {
    title: "Moss & Algae",
    desc: "Green patches can trap moisture against the roof surface, potentially causing rot in wood fibers over time.",
    severity: "Low/Medium",
    img: "/images/roofing/Roof-moss-algae.jpg"
  },
  {
    title: "Damaged Flashing",
    desc: "Metal strips around chimneys and vents prevent leaks. If bent or rusted, water can easily enter.",
    severity: "High",
    img: "/images/roofing/roof-chimney.jpg"
  }
];

export const RoofEducation: React.FC<RoofEducationProps> = ({ onSchedule }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-phoenix-100 p-3 rounded-full mb-4">
            <Info className="w-8 h-8 text-phoenix-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Know Your Roof</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Identifying problems early can save you thousands. Here is what to look for before scheduling your inspection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {PROBLEMS.map((problem, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                <div className="md:w-1/2 h-48 md:h-auto">
                  <img className="w-full h-full object-cover" src={problem.img} alt={problem.title} />
                </div>
                <div className="p-6 md:w-1/2 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-slate-900">{problem.title}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${problem.severity === 'High' ? 'bg-red-100 text-red-800' :
                      problem.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {problem.severity} Risk
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{problem.desc}</p>
                  <div className="mt-auto">
                    <button
                      onClick={() => onSchedule(`Inquiry about ${problem.title} from Education Center. Severity: ${problem.severity}`, '')}
                      className="text-phoenix-600 font-semibold text-sm hover:text-phoenix-700 flex items-center gap-1"
                    >
                      Suspect this? Schedule Check <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Not sure what you're looking at?</h3>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              You don't have to climb the ladder. Our certified inspectors use drones and expert eyes to find issues you might miss.
            </p>
            <button
              onClick={() => onSchedule('General professional inspection request from Education Center.', '')}
              className="bg-phoenix-600 hover:bg-phoenix-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-phoenix-900/50"
            >
              Schedule Free Professional Inspection
            </button>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-phoenix-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};