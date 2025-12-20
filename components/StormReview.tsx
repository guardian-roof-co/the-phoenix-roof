import React, { useState, useRef, useEffect } from 'react';
import { CloudLightning, MapPin, AlertTriangle, Calendar, Search, CheckCircle, ArrowRight, Wind } from 'lucide-react';
import { getStormHistory } from '../services/stormService';
import { StormReport } from '../types';

interface StormReviewProps {
    onSchedule: () => void;
}

export const StormReview: React.FC<StormReviewProps> = ({ onSchedule }) => {
    const [address, setAddress] = useState('');
    const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
    const [report, setReport] = useState<StormReport | null>(null);
    const [loading, setLoading] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);

    // Init Autocomplete
    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places && inputRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry && place.geometry.location) {
                    setAddress(place.formatted_address || '');
                    setCoords({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    });
                }
            });
        }
    }, []);

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
                        {/* Updated to Phoenix Blue (500) which fits Rain/Storm theme better */}
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
                        
                        {/* 1. Risk Gauge */}
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
                                                ${report.riskLevel === 'High' ? '#ef4444' : '#e5e7eb'} 0deg 60deg, 
                                                ${report.riskLevel === 'Medium' ? '#eab308' : '#e5e7eb'} 60deg 120deg, 
                                                ${report.riskLevel === 'Low' ? '#22c55e' : '#e5e7eb'} 120deg 180deg)`
                                        }}
                                    ></div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-white rounded-t-full flex items-end justify-center pb-2">
                                        <span className={`text-2xl font-extrabold ${
                                            report.riskLevel === 'High' ? 'text-red-600' :
                                            report.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                        }`}>{report.riskLevel}</span>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mt-4">{report.summary}</p>
                                
                                {report.riskLevel === 'High' && (
                                    <div className="mt-6 bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2 text-left">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                        <p><strong>Insurance Alert:</strong> You have qualifying events within the last 12 months. File soon.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Timeline */}
                        <div className="md:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-6 flex items-center justify-between">
                                    <span>Storm Timeline (Last 2 Years)</span>
                                    <span className="text-xs text-gray-400 font-normal">Source: NOAA Data</span>
                                </h3>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {report.events.length === 0 ? (
                                        <p className="text-gray-400 text-center py-8">No recorded storm events in this area.</p>
                                    ) : (
                                        report.events.map((event, idx) => (
                                            <div key={idx} className={`relative pl-8 pb-4 border-l-2 ${event.insurancePotential ? 'border-red-500' : 'border-gray-200'} last:border-0`}>
                                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                                    event.insurancePotential ? 'bg-red-500' : 'bg-gray-300'
                                                }`}></div>
                                                
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-gray-900">{new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                            {event.insurancePotential && (
                                                                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Potential Claim</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            {event.type === 'Hail' ? <CloudLightning className="w-4 h-4" /> : <Wind className="w-4 h-4" />}
                                                            {event.severity}
                                                        </div>
                                                    </div>
                                                    {event.insurancePotential && (
                                                        <button 
                                                            onClick={onSchedule}
                                                            className="mt-3 sm:mt-0 text-xs bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-md font-bold hover:bg-red-50"
                                                        >
                                                            Inspect
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
                
                {/* CTA */}
                {report && (
                    <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">Don't let the filing window expire.</h3>
                            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                                Storm damage isn't always visible from the ground. If our report shows High Risk, we recommend a free professional inspection immediately.
                            </p>
                            <button
                                onClick={onSchedule}
                                className="bg-phoenix-600 hover:bg-phoenix-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-phoenix-900/50 flex items-center gap-2 mx-auto"
                            >
                                Schedule Inspection <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Decorative background - Now Blue */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-phoenix-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                )}
            </div>
        </div>
    );
};