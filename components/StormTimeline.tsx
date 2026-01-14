import React from 'react';
import { CloudLightning, Wind } from 'lucide-react';
import { StormReport } from '../types';

interface StormTimelineProps {
    events: StormReport['events'];
    onSchedule?: (notes: string, address?: string) => void;
    address?: string;
}

export const StormTimeline: React.FC<StormTimelineProps> = ({ events, onSchedule, address }) => {
    return (
        <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center justify-between">
                    <span>Storm Timeline ({events.length} Events)</span>
                    <span className="text-xs text-gray-400 font-normal">Source: NOAA Data</span>
                </h3>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {events.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No recorded storm events in this area.</p>
                    ) : (
                        events.map((event, idx) => {
                            // Determine Icon
                            let Icon = CloudLightning;
                            let iconColor = "text-phoenix-500";
                            if (event.type.includes('Wind')) {
                                Icon = Wind;
                                iconColor = "text-sky-500";
                            }

                            return (
                                <div key={idx} className={`relative pl-8 pb-4 border-l-2 ${event.insurancePotential ? 'border-red-500' : 'border-gray-200'} last:border-0`}>
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${event.insurancePotential ? 'bg-red-500' : 'bg-gray-300'
                                        }`}></div>

                                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">{event.beginDate || event.date}</span>
                                                    {event.insurancePotential && (
                                                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Potential Claim</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-bold mb-1">
                                                    <Icon className={`w-4 h-4 ${iconColor}`} />
                                                    {event.type} {event.severity && `• ${event.severity}`}
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium italic">
                                                    {event.location} • {event.distance ? `${event.distance} miles away` : 'Direct Impact'}
                                                </div>
                                            </div>

                                            {event.insurancePotential && onSchedule && (
                                                <button
                                                    onClick={() => onSchedule(`I'd like to schedule an inspection for the ${event.severity} ${event.type} event from ${event.beginDate || event.date}.`, address)}
                                                    className="bg-white border-2 border-phoenix-600 text-phoenix-600 hover:bg-phoenix-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap"
                                                >
                                                    Inspect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
