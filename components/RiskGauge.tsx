import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
    riskLevel: 'Low' | 'Medium' | 'High';
    summary: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ riskLevel, summary }) => {
    return (
        <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center h-full">
                <h3 className="font-bold text-gray-800 mb-6">Damage Likelihood</h3>

                <div className="relative w-48 h-24 mx-auto mb-4 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-t-full"></div>
                    <div
                        className={`absolute top-0 left-0 w-full h-full rounded-t-full transition-all duration-1000 origin-bottom scale-x-100`}
                        style={{
                            clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 0)',
                            background: `conic-gradient(from 180deg at 50% 100%, 
                                ${riskLevel === 'High' ? '#ef4444' : '#e5e7eb'} 0deg 60deg, 
                                ${riskLevel === 'Medium' ? '#eab308' : '#e5e7eb'} 60deg 120deg, 
                                ${riskLevel === 'Low' ? '#22c55e' : '#e5e7eb'} 120deg 180deg)`
                        }}
                    ></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-white rounded-t-full flex items-end justify-center pb-2">
                        <span className={`text-2xl font-extrabold ${riskLevel === 'High' ? 'text-red-600' :
                            riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                            }`}>{riskLevel}</span>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                    {summary.split(/(\*\*.*?\*\*)/).map((part, i) =>
                        part.startsWith('**') && part.endsWith('**')
                            ? <strong key={i} className="font-extrabold text-gray-900">{part.slice(2, -2)}</strong>
                            : part
                    )}
                </p>

                {riskLevel === 'High' && (
                    <div className="mt-6 bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2 text-left">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p><strong>Insurance Alert:</strong> You have qualifying events within the last 12 months. File soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
