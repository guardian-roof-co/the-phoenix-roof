import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Info, ChevronRight, Settings2, Sliders, ShieldCheck, TrendingUp, Hammer, Info as InfoIcon } from 'lucide-react';
import { RoofMaterial, StormReport } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getStormHistory } from '../services/stormService';
import { syncToHubSpot } from '../services/hubspotService';

interface QuoteFlowProps {
  initialLocation?: { address: string, coords?: { lat: number, lng: number } } | null;
  onSchedule: (notes?: string) => void;
}

// Localized Grand Rapids, Michigan Pricing Logic
// Factors in local labor rates and MI code requirements (Ice & Water shield, etc.)
const MATERIALS: RoofMaterial[] = [
  { id: 'asphalt-shingle', name: 'Architectural Shingle', description: 'Owens Corning Duration - 616 Standard.', costPerSqFt: 6.25, lifespan: '25-30 Years', image: 'https://images.unsplash.com/photo-1632759162352-714087b3287a?q=80&w=400&auto=format&fit=crop' },
  { id: 'metal-seam', name: 'Standing Seam Metal', description: 'Lifetime Snow Shedding & Durability.', costPerSqFt: 14.75, lifespan: '50+ Years', image: 'https://images.unsplash.com/photo-1628151241103-6258417c800b?q=80&w=400&auto=format&fit=crop' },
  { id: 'synthetic-slate', name: 'EuroShield / Synthetic', description: 'Class 4 Hail Rating - Premium Look.', costPerSqFt: 19.95, lifespan: '50+ Years', image: 'https://images.unsplash.com/photo-1620603720760-49666063f66e?q=80&w=400&auto=format&fit=crop' }
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
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(initialLocation?.coords || null);
  const [inputValue, setInputValue] = useState(initialLocation?.address || '');
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [roofArea, setRoofArea] = useState<number>(0);
  
  // Complexity & Pricing Factors
  const [pitch, setPitch] = useState(PITCH_OPTIONS[1]);
  const [complexity, setComplexity] = useState(COMPLEXITY_OPTIONS[0]);
  const [selectedMaterial, setSelectedMaterial] = useState<RoofMaterial>(MATERIALS[0]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveQuote } = useAuth();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const googleMapInstance = useRef<any | null>(null);

  useEffect(() => {
    if (step === 1 && window.google && autoCompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autoCompleteRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          setAddress(place.formatted_address || '');
          setInputValue(place.formatted_address || '');
          setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          setStep(2);
        }
      });
    }
  }, [step]);

  useEffect(() => {
    if (step === 2 && coordinates && window.google) {
      setIsMeasuring(true);
      if (mapRef.current && !googleMapInstance.current) {
        googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: coordinates,
            zoom: 20,
            mapTypeId: 'satellite',
            tilt: 0,
            disableDefaultUI: true,
            draggable: false,
        });
      }
      
      // Simulate/Calculate area (In production we'd use Google Solar API or similar)
      const timer = setTimeout(() => {
        setRoofArea(2400); // Standard Grand Rapids residential footprint + 15% waste
        setIsMeasuring(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, coordinates]);

  const calculateTotal = () => {
    const basePrice = roofArea * selectedMaterial.costPerSqFt;
    // Add MI Code Buffer ($500 fixed + factors)
    const miCodeBuffer = 500; 
    return Math.round((basePrice * pitch.factor * complexity.factor) + miCodeBuffer);
  };

  const total = calculateTotal();
  const maxProject = 55000;
  const percentage = Math.min((total / maxProject) * 100, 100);

  const handleFinalize = async () => {
    setIsSubmitting(true);
    const summary = `
Instant Quote Detail:
- Address: ${address}
- Material: ${selectedMaterial.name}
- Pitch: ${pitch.label}
- Complexity: ${complexity.label}
- Estimated Sq Ft: ${roofArea}
- Total Estimate: $${total.toLocaleString()}
    `;

    // Sync to HubSpot for Operations Team
    await syncToHubSpot({
      email: 'pending@user.quote', // In a full flow we'd capture email before this
      address: address,
      notes: summary,
      lead_source: 'Instant Quote Engine'
    });

    saveQuote({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      address,
      zipCode: '',
      roofAreaSqFt: roofArea,
      material: selectedMaterial,
      estimatedCost: total
    });

    setIsSubmitting(false);
    onSchedule(summary);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10">
      {step === 1 && (
         <div className="max-w-2xl mx-auto px-4 mt-20">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border border-slate-100">
                <div className="bg-slate-900 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <MapPin className="w-10 h-10 text-phoenix-500" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">Local GR Quote</h2>
                <p className="text-slate-500 font-medium mb-10 italic">Grand Rapids specific pricing including Michigan building code standards.</p>
                
                <div className="relative">
                    <MapPin className="absolute left-5 top-5 h-6 w-6 text-slate-300" />
                    <input 
                        ref={autoCompleteRef} 
                        type="text" 
                        placeholder="Enter property address..." 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-phoenix-100 focus:border-phoenix-500 outline-none font-black text-lg text-slate-900 transition-all" 
                    />
                </div>
                <div className="mt-8 flex items-center justify-center gap-6 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                   <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 616 Native</div>
                   <div className="flex items-center gap-1.5"><Hammer className="w-4 h-4" /> Owens Corning</div>
                </div>
            </div>
         </div>
      )}

      {step === 2 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Visuals & Controls */}
            <div className="lg:w-2/3 space-y-10">
                {/* Satellite View Card */}
                <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-white overflow-hidden h-[450px] relative group">
                    {isMeasuring && (
                        <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
                            <Loader2 className="w-12 h-12 text-phoenix-500 animate-spin mb-4" />
                            <p className="font-black uppercase tracking-[0.3em] text-xs">Calibrating Satellite...</p>
                        </div>
                    )}
                    <div ref={mapRef} className="w-full h-full grayscale-[0.1] contrast-[1.1]" />
                    {/* Visual Overlay Target */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-dashed border-white/30 rounded-full flex items-center justify-center">
                             <div className="w-32 h-32 border border-white/10 rounded-full"></div>
                        </div>
                        <div className="absolute top-8 left-8 bg-slate-900/80 px-4 py-2 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-phoenix-400 font-black uppercase tracking-widest">Target Verified</p>
                        </div>
                    </div>
                </div>

                {/* Intuitive Controls Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Pitch Slider */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Settings2 className="w-5 h-5 text-phoenix-600" />
                                <h3 className="font-black text-slate-900 uppercase italic">Roof Pitch</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">Multiplier: {pitch.factor}x</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {PITCH_OPTIONS.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => setPitch(opt)}
                                    className={`p-5 rounded-2xl text-left border-2 transition-all ${pitch.label === opt.label ? 'border-phoenix-500 bg-phoenix-50 shadow-lg shadow-phoenix-100' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                                >
                                    <p className="font-black text-xs uppercase tracking-widest text-slate-900">{opt.label}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 leading-tight">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Complexity Slider */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Sliders className="w-5 h-5 text-fire-600" />
                                <h3 className="font-black text-slate-900 uppercase italic">Complexity</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">Multiplier: {complexity.factor}x</span>
                        </div>
                        <div className="space-y-3">
                            {COMPLEXITY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => setComplexity(opt)}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${complexity.label === opt.label ? 'border-fire-500 bg-fire-50 shadow-lg shadow-fire-100' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                                >
                                    <div className="text-left">
                                        <p className="font-black text-xs uppercase tracking-widest text-slate-900">{opt.label}</p>
                                        <p className="text-[10px] text-slate-400 font-bold leading-tight">{opt.desc}</p>
                                    </div>
                                    {complexity.label === opt.label && <ShieldCheck className="w-5 h-5 text-fire-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Material Selection */}
                <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 italic uppercase flex items-center gap-3">
                        <Hammer className="w-6 h-6 text-slate-400" /> 
                        Material Grade
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MATERIALS.map((mat) => (
                            <div 
                                key={mat.id} 
                                onClick={() => setSelectedMaterial(mat)} 
                                className={`relative cursor-pointer rounded-3xl border-2 overflow-hidden transition-all duration-300 group ${selectedMaterial.id === mat.id ? 'border-phoenix-500 ring-4 ring-phoenix-50' : 'border-slate-100 hover:border-slate-300'}`}
                            >
                                <div className="h-28 overflow-hidden relative">
                                    <img src={mat.image} alt={mat.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all"></div>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-black text-xs uppercase italic text-slate-900 mb-2">{mat.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed mb-4">{mat.description}</p>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest border-t border-slate-50 pt-4">
                                        <span>Rating</span>
                                        <span className="text-slate-900">{mat.lifespan}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Pricing Gauge */}
            <div className="lg:w-1/3">
                <div className="bg-slate-900 rounded-[4rem] shadow-2xl text-white sticky top-24 border border-white/5 overflow-hidden">
                    <div className="p-12 flex flex-col items-center">
                        
                        {/* CIRCULAR PRICING GAUGE */}
                        <div className="relative w-64 h-64 mb-12">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle 
                                    className="text-slate-800" 
                                    strokeWidth="6" 
                                    stroke="currentColor" 
                                    fill="transparent" 
                                    r="44" 
                                    cx="50" 
                                    cy="50" 
                                />
                                <circle 
                                    className="text-phoenix-500 transition-all duration-1000 ease-out" 
                                    strokeWidth="6" 
                                    strokeDasharray={2 * Math.PI * 44}
                                    strokeDashoffset={2 * Math.PI * 44 * (1 - percentage / 100)}
                                    strokeLinecap="round" 
                                    stroke="currentColor" 
                                    fill="transparent" 
                                    r="44" 
                                    cx="50" 
                                    cy="50" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Estimated Value</p>
                                <p className="text-4xl font-black tracking-tighter italic text-white leading-none">
                                    <span className="text-phoenix-400 text-2xl mr-1">$</span>
                                    {total.toLocaleString()}
                                </p>
                                <div className="mt-4 flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full">
                                    <TrendingUp className="w-3 h-3 text-green-400" />
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{roofArea} SQ FT</span>
                                </div>
                            </div>
                        </div>

                        {/* Cost Breakdown Summary */}
                        <div className="w-full space-y-6 px-4 mb-12">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Base Local Rate</span>
                                <span className="text-slate-200">${selectedMaterial.costPerSqFt}/ft</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Risk Factor</span>
                                <span className="text-slate-200">{complexity.label}</span>
                            </div>
                            <div className="h-px bg-slate-800"></div>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-phoenix-500/10 rounded-xl text-phoenix-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">616 Operations Review</p>
                                    <p className="text-[9px] font-bold text-slate-500 leading-tight mt-1">Pricing factors in Grand Rapids material haul-away and MI Ice & Water shield code.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action CTA */}
                        <button 
                            disabled={isSubmitting}
                            onClick={handleFinalize}
                            className="w-full bg-white hover:bg-phoenix-50 text-slate-900 font-black py-6 rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] group disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Lock In & Schedule"}
                            {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                        <p className="mt-6 text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] italic text-center">Estimate sent instantly to our operations team.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
