import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Shield, Star, Hammer, Wrench, ShieldAlert, CheckCircle2, Bot, ChevronRight, Ruler, Plus, Minus, Info, Camera, Calendar, ArrowRight, Zap, Loader2, Settings2, Sliders, ShieldCheck, TrendingUp, Info as InfoIcon } from 'lucide-react';
import { RoofMaterial, OnScheduleHandler, StormReport } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getStormHistory } from '../services/stormService';
import { apiClient } from '../services/apiClient';
import { useGooglePlaces } from '../hooks/useGooglePlaces';

interface QuoteFlowProps {
    initialLocation?: { address: string, coords?: { lat: number, lng: number } } | null;
    onSchedule: OnScheduleHandler;
}

// Localized Grand Rapids, Michigan Pricing Logic
// Factors in local labor rates and MI code requirements (Ice & Water shield, etc.)
const MATERIALS: RoofMaterial[] = [
    { id: 'asphalt-shingle', name: 'Architectural Shingle', description: 'Owens Corning Duration - 616 Standard.', costPerSqFt: 6.25, lifespan: '25-30 Years', image: '/images/roofing/asphalt-shingle.jpg' },
    { id: 'metal-seam', name: 'Standing Seam Metal', description: 'Lifetime Snow Shedding & Durability.', costPerSqFt: 14.75, lifespan: '50+ Years', image: '/images/roofing/metal-seam.jpg' },
    { id: 'synthetic-slate', name: 'EuroShield / Synthetic', description: 'Class 4 Hail Rating - Premium Look.', costPerSqFt: 19.95, lifespan: '50+ Years', image: '/images/roofing/synthetic-slate.jpg' }
];

const PITCH_OPTIONS = [
    { label: 'Shallow', factor: 1.0, desc: 'Walkable (4/12)' },
    { label: 'Standard', factor: 1.15, desc: 'Average (7/12)' },
    { label: 'Steep', factor: 1.35, desc: 'Non-walkable (10/12)' },
    { label: 'Extreme', factor: 1.55, desc: 'Historic/Mansard' }
];

const COMPLEXITY_OPTIONS = [
    { label: 'Simple', factor: 1.0, desc: 'Straight Gables' },
    { label: 'Moderate', factor: 1.18, desc: 'Valleys & Dormers' },
    { label: 'Complex', factor: 1.40, desc: 'Turrets & Multiple Planes' }
];

export const QuoteFlow: React.FC<QuoteFlowProps> = ({ initialLocation, onSchedule }) => {
    const [step, setStep] = useState(initialLocation?.coords ? 2 : 1);
    const [address, setAddress] = useState(initialLocation?.address || '');
    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(initialLocation?.coords || null);
    const [inputValue, setInputValue] = useState(initialLocation?.address || '');
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [roofArea, setRoofArea] = useState<number>(0);
    const [detectedAreaSqFt, setDetectedAreaSqFt] = useState<number>(0);
    const [isManualMode, setIsManualMode] = useState(false);
    const [isDetected, setIsDetected] = useState(false);

    // Complexity & Pricing Factors
    const [pitch, setPitch] = useState(PITCH_OPTIONS[1]);
    const [complexity, setComplexity] = useState(COMPLEXITY_OPTIONS[0]);
    const [selectedMaterial, setSelectedMaterial] = useState<RoofMaterial>(MATERIALS[0]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { saveQuote } = useAuth();

    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any | null>(null);

    // Use Custom Hook for Autocomplete
    const { inputRef: autoCompleteRef } = useGooglePlaces((selectedAddress, lat, lng) => {
        setAddress(selectedAddress);
        setInputValue(selectedAddress);
        setCoordinates({ lat, lng });

        // Auto-advance logic
        setTimeout(() => setStep(2), 500);
    });

    const [apiError, setApiError] = useState<string | null>(null);

    // -------------------------------------------------------------
    // Step 2: Google Solar API Integration (The "WOW" Factor)
    // -------------------------------------------------------------
    useEffect(() => {
        if (step === 2 && coordinates && mapRef.current && window.google) {

            // 1. Initialize Map centered on home
            googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: coordinates,
                zoom: 20,
                mapTypeId: 'satellite',
                tilt: 0,
                disableDefaultUI: true,
            });

            // 2. Solar API: Measure Roof Area
            const fetchRoofData = async () => {
                setIsMeasuring(true);
                setApiError(null);
                try {
                    // Call backend which securely calls Google Solar API
                    const data = await apiClient.get(`/api/solar-roof?lat=${coordinates.lat}&lng=${coordinates.lng}`);

                    if (data && data.status === 'SUCCESS' && data.areaSqFt > 0) {
                        setRoofArea(data.areaSqFt);
                        setDetectedAreaSqFt(data.areaSqFt);
                        setIsDetected(true);
                        setIsManualMode(false);
                    } else {
                        // Fallback logic handled in UI (slider for manual input)
                        setRoofArea(0);
                        setIsDetected(false);
                        setIsManualMode(true);
                        if (data.message) setApiError(data.message);
                    }

                } catch (e: any) {
                    console.error("Solar API Error:", e);
                    setRoofArea(0);
                    setIsDetected(false);
                    setIsManualMode(true);
                    setApiError(e.message || "Satellite auto-measurement unavailable for this location.");
                } finally {
                    setIsMeasuring(false);
                }
            };

            fetchRoofData();
        }
    }, [step, coordinates]);


    // -------------------------------------------------------------
    // Pricing Algorithm
    // -------------------------------------------------------------
    const calculateEstimate = () => {
        // Base Cost = Area * Material Cost
        let total = roofArea * selectedMaterial.costPerSqFt;

        // Pitch Multiplier (Steeper = More labor/safety gear)
        total *= pitch.factor;

        // Complexity Multiplier (More partial cuts/waste)
        total *= complexity.factor;

        // Waste Factor (Standard 10-15%)
        total *= 1.15;

        return Math.round(total / 100) * 100; // Round to nearest 100
    };

    const handleSaveQuote = async () => {
        setIsSubmitting(true);
        const quote = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            address: address,
            zipCode: '32822', // Mock
            roofAreaSqFt: Math.round(roofArea),
            material: selectedMaterial,
            estimatedCost: calculateEstimate()
        };
        await saveQuote(quote);
        setIsSubmitting(false);
        onSchedule(`Quote Generated: $${calculateEstimate().toLocaleString()} for ${selectedMaterial.name}`, address, calculateEstimate());
    };

    return (
        <div className="max-w-4xl mx-auto">

            {/* Step 1: Address Input (Premium Hero Style) */}
            {step === 1 && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-6">
                        <MapPin className="w-8 h-8 text-phoenix-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Measure Your Roof</h2>
                    <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                        Enter your address to instantly get a satellite-based roof measurement and a precise material estimate.
                    </p>

                    <div className="max-w-xl mx-auto relative">
                        <input
                            ref={autoCompleteRef}
                            type="text"
                            className="w-full p-4 pl-6 text-lg border-2 border-gray-200 rounded-2xl focus:border-phoenix-500 focus:ring-4 focus:ring-phoenix-100 transition outline-none"
                            placeholder="Enter your street address..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button
                            className="absolute right-2 top-2 bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition"
                            onClick={() => { if (coordinates) setStep(2) }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Satellite Analysis & Configuration (The Dashboard) */}
            {step === 2 && (
                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Left: Satellite Visualizer */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative aspect-[4/3] group">
                            <div ref={mapRef} className="w-full h-full opacity-90 group-hover:opacity-100 transition duration-700" />

                            {/* Overlay UI */}
                            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40">
                                <div className="flex justify-between items-start">
                                    <span className="bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                                        LIVE SATELITE FEED
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white/80 text-sm font-medium">
                                            {isManualMode ? 'Manual Roof Area' : 'Detected Roof Area'}
                                        </span>
                                        {isDetected && !isManualMode && (
                                            <button
                                                onClick={() => setIsManualMode(true)}
                                                className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md border border-white/20 transition backdrop-blur-sm"
                                            >
                                                Adjust
                                            </button>
                                        )}
                                        {isManualMode && isDetected && (
                                            <button
                                                onClick={() => {
                                                    setIsManualMode(false);
                                                    setRoofArea(detectedAreaSqFt);
                                                }}
                                                className="pointer-events-auto bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] px-2 py-0.5 rounded-md border border-blue-500/30 transition backdrop-blur-sm"
                                            >
                                                Reset to Detected
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-4xl font-black text-white flex items-end gap-2">
                                        {isMeasuring ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-phoenix-400" />
                                        ) : (
                                            <>
                                                {roofArea > 0 ? Math.round(roofArea).toLocaleString() : '---'}
                                                <span className="text-lg font-medium text-white/60 mb-1">sq ft</span>
                                            </>
                                        )}
                                    </div>

                                    {(isManualMode || (roofArea === 0 && !isMeasuring)) && (
                                        <div className="mt-4 pointer-events-auto bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                            {!isDetected && (
                                                <>
                                                    <p className="text-red-300 text-xs mb-3 flex items-center gap-2 font-bold uppercase tracking-wider">
                                                        <InfoIcon className="w-4 h-4" /> {apiError || "Satellite auto-measurement unavailable"}
                                                    </p>
                                                    <p className="text-white/60 text-[10px] mb-3 leading-tight">
                                                        {apiError ? "We couldn't find precise building data for this address. Please enter the area manually." : "Please select your approximate roof area manually to continue with your estimate."}
                                                    </p>
                                                </>
                                            )}
                                            {isDetected && (
                                                <p className="text-white/80 text-[10px] mb-3 font-medium">
                                                    Drag the slider to adjust your roof area measurement:
                                                </p>
                                            )}
                                            <input
                                                type="range"
                                                min="1000" max="6000" step="50"
                                                value={roofArea || 0}
                                                onChange={(e) => {
                                                    setRoofArea(Number(e.target.value));
                                                    setIsManualMode(true);
                                                }}
                                                className="w-full accent-phoenix-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between mt-1 px-0.5">
                                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">1,000</span>
                                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">6,000</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex gap-4 items-start">
                            <Info className="w-6 h-6 text-phoenix-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-phoenix-900">Why this estimate is accurate</h4>
                                <p className="text-sm text-phoenix-800/80 mt-1 leading-relaxed">
                                    We use the same satellite data as insurance adjusters to measure your roof's footprint, then apply local code requirements for waste and ice & water shield.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Configurator */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col h-full">
                        <div className="mb-0 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-gray-400" />
                                Configure Your Roof
                            </h3>

                            {/* Material Selector */}
                            <div className="mb-8">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Roofing System</label>
                                <div className="space-y-3">
                                    {MATERIALS.map((m) => (
                                        <div
                                            key={m.id}
                                            onClick={() => setSelectedMaterial(m)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedMaterial.id === m.id
                                                ? 'border-phoenix-600 bg-phoenix-50 shadow-md'
                                                : 'border-gray-100 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${m.image})` }} />
                                            <div>
                                                <div className="font-bold text-gray-900">{m.name}</div>
                                                <div className="text-xs text-gray-500">{m.lifespan} • {m.description}</div>
                                            </div>
                                            <div className="ml-auto">
                                                {selectedMaterial.id === m.id && <div className="w-4 h-4 bg-phoenix-600 rounded-full" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sliders for Pitch & Complexity */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> Pitch (Steepness)
                                    </label>
                                    <div className="space-y-2">
                                        {PITCH_OPTIONS.map((p) => (
                                            <button
                                                key={p.label}
                                                onClick={() => setPitch(p)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${pitch.label === p.label ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {p.label} <span className="opacity-60 text-xs font-normal">- {p.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                        <Sliders className="w-4 h-4" /> Complexity
                                    </label>
                                    <div className="space-y-2">
                                        {COMPLEXITY_OPTIONS.map((c) => (
                                            <button
                                                key={c.label}
                                                onClick={() => setComplexity(c)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${complexity.label === c.label ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total & Action */}
                        <div className="border-t pt-6 bg-slate-50 -mx-8 -mb-8 p-8 rounded-b-3xl">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">Estimated Project Total</p>
                                    <p className="text-xs text-gray-400">Includes materials, labor & waste</p>
                                </div>
                                <div className="text-4xl font-extrabold text-slate-900">
                                    ${calculateEstimate().toLocaleString()}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveQuote}
                                disabled={isSubmitting || roofArea === 0}
                                className="w-full py-4 bg-phoenix-600 hover:bg-phoenix-700 text-white font-bold rounded-xl shadow-lg shadow-phoenix-500/30 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Hammer className="w-5 h-5" />}
                                Save Quote & Schedule Inspection
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
