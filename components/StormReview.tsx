import React, { useState } from 'react';
import { CloudLightning, MapPin } from 'lucide-react';
import { getStormHistory } from '../services/stormService';
import { StormReport, OnScheduleHandler } from '../types';
import { RiskGauge } from './RiskGauge';
import { StormTimeline } from './StormTimeline';
import { useGooglePlaces } from '../hooks/useGooglePlaces';

interface StormReviewProps {
    onSchedule: OnScheduleHandler;
}

export const StormReview: React.FC<StormReviewProps> = ({ onSchedule }) => {
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [report, setReport] = useState<StormReport | null>(null);
    const [loading, setLoading] = useState(false);

    // Use custom hook for Autocomplete
    const { inputRef } = useGooglePlaces((selectedAddress, lat, lng) => {
        setAddress(selectedAddress);
        setCoords({ lat, lng });
    });

    const handleSearch = async () => {
        if (!coords) return;
        setLoading(true);
        try {
            const data = await getStormHistory(coords.lat, coords.lng);
            setReport(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-slate-950 rounded-full mb-4 shadow-lg shadow-phoenix-500/20">
                        <CloudLightning className="w-8 h-8 text-phoenix-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        Storm Center Review
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Track hail and wind events at your property for the last 2 years.
                        Find out if you have a valid insurance claim before it expires.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-16 relative z-20">
                    <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex items-center">
                        <MapPin className="ml-3 w-5 h-5 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 p-3 outline-none text-slate-900 font-medium bg-white rounded-xl placeholder-gray-400"
                            placeholder="Enter property address..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading || !coords}
                            className="bg-phoenix-600 hover:bg-phoenix-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Scanning...' : 'Scan History'}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                {report && (
                    <div className="animate-fade-in-up grid md:grid-cols-3 gap-8">
                        <RiskGauge riskLevel={report.riskLevel as 'Low' | 'Medium' | 'High'} summary={report.summary} />
                        <div className="md:col-span-2 flex flex-col gap-8">
                            <StormTimeline events={report.events} onSchedule={onSchedule} address={address} />
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                <p className="text-slate-600 text-sm mb-4 font-medium italic">Concerned about recent storms? Our local team can verify any damage.</p>
                                <button
                                    onClick={() => onSchedule(`I've reviewed my storm history for ${address}. Risk level is ${report.riskLevel}.`, address)}
                                    className="w-full bg-phoenix-600 hover:bg-phoenix-700 text-white py-4 rounded-xl font-bold transition shadow-lg"
                                >
                                    Schedule Storm Damage Inspection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};