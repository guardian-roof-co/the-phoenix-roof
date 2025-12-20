
import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Upload, CheckCircle, AlertTriangle, Loader2, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { analyzeRoofCondition } from '../services/geminiService';

// Local Markdown helper to avoid dependency issues
const MarkdownDisplay = ({ text }: { text: string }) => {
  return (
    <div className="prose prose-sm prose-slate max-w-none">
      {text.split('\n').map((line, i) => (
        <p key={i} className={`mb-2 ${line.startsWith('#') ? 'font-bold text-gray-900 mt-4' : 'text-gray-700'}`}>
          {line.replace(/^#+\s/, '')}
        </p>
      ))}
    </div>
  )
}

interface SelfInspectionProps {
  onSchedule: () => void;
}

export const SelfInspection: React.FC<SelfInspectionProps> = ({ onSchedule }) => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // Street View State
  const [streetViewUrl, setStreetViewUrl] = useState<string | null>(null);
  const [streetViewBase64, setStreetViewBase64] = useState<string | null>(null);
  
  // User Uploads
  const [groundPhoto, setGroundPhoto] = useState<{data: string, mime: string} | null>(null);
  const [eavePhoto, setEavePhoto] = useState<{data: string, mime: string} | null>(null);
  
  // Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const addressInputRef = useRef<HTMLInputElement>(null);

  // --- STEP 1: Address & Street View ---
  useEffect(() => {
    if (step === 1 && window.google && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setAddress(place.formatted_address || '');
          setCoords({ lat, lng });

          // Fetch Static Street View
          const apiKey = window.GOOGLE_MAPS_API_KEY;
          
          if (apiKey) {
            const url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&fov=90&heading=0&pitch=10&key=${apiKey}`;
            setStreetViewUrl(url);
            
            // Convert to Base64 for Gemini
            fetch(url)
              .then(res => {
                  if (!res.ok) throw new Error("Network response was not ok");
                  return res.blob();
              })
              .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                   if (typeof reader.result === 'string') {
                       setStreetViewBase64(reader.result.split(',')[1]);
                   }
                };
                reader.readAsDataURL(blob);
              })
              .catch(err => {
                  console.warn("Street View auto-fetch for AI skipped (CORS restriction). Using user photos only.");
                  setStreetViewBase64(null);
              });
          }
        }
      });
    }
  }, [step]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ground' | 'eave') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        const payload = { data: base64, mime: file.type };
        if (type === 'ground') setGroundPhoto(payload);
        else setEavePhoto(payload);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setStep(3);
    
    try {
      const userImages = [];
      if (groundPhoto) userImages.push({ data: groundPhoto.data, mimeType: groundPhoto.mime });
      if (eavePhoto) userImages.push({ data: eavePhoto.data, mimeType: eavePhoto.mime });

      const analysisText = await analyzeRoofCondition(streetViewBase64, userImages);
      setResult(analysisText);
    } catch (error) {
      setResult("### Error\nCould not complete analysis. Please try again or schedule an in-person inspection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-8 space-x-4">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-phoenix-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
           <div className="w-12 h-1 bg-gray-200"><div className={`h-full bg-phoenix-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`}></div></div>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-phoenix-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
           <div className="w-12 h-1 bg-gray-200"><div className={`h-full bg-phoenix-600 transition-all ${step >= 3 ? 'w-full' : 'w-0'}`}></div></div>
           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-phoenix-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* STEP 1: LOCATION & STREET VIEW */}
          {step === 1 && (
            <div className="p-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Location</h2>
               <p className="text-gray-500 mb-6">First, let's confirm your property using Google Street View.</p>
               
               <div className="relative mb-6">
                 <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                 <input
                   ref={addressInputRef}
                   type="text"
                   placeholder="Enter property address..."
                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-500 outline-none"
                 />
               </div>

               {streetViewUrl && (
                 <div className="mb-6 rounded-xl overflow-hidden shadow-md border border-gray-200">
                    <img 
                        src={streetViewUrl} 
                        alt="Street View" 
                        className="w-full h-64 object-cover" 
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="bg-gray-50 p-2 text-xs text-center text-gray-500">
                        Is this your house? If not, try entering the address again.
                    </div>
                 </div>
               )}

               <button
                 disabled={!coords}
                 onClick={() => setStep(2)}
                 className="w-full bg-phoenix-600 text-white py-3 rounded-lg font-bold hover:bg-phoenix-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 Confirm & Continue <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          )}

          {/* STEP 2: PHOTO UPLOAD */}
          {step === 2 && (
            <div className="p-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Self-Inspection Photos</h2>
               <p className="text-gray-500 mb-6">
                 <AlertTriangle className="w-4 h-4 inline text-yellow-500 mr-1" />
                 <strong>Safety First:</strong> Do not climb on the roof. Take photos from the ground or a safe window.
               </p>

               <div className="space-y-6">
                  {/* Photo 1 */}
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition relative ${groundPhoto ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                     {groundPhoto ? (
                        <div className="relative w-full h-48">
                            <img 
                                src={`data:${groundPhoto.mime};base64,${groundPhoto.data}`} 
                                alt="Ground View" 
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute top-2 right-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setGroundPhoto(null); }}
                                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Full View
                            </div>
                        </div>
                     ) : (
                        <div onClick={() => document.getElementById('ground-upload')?.click()} className="cursor-pointer py-8">
                            <Camera className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                            <p className="font-bold text-gray-700">Upload Full House View</p>
                            <p className="text-xs text-gray-500">Take a photo from the street showing the whole roof</p>
                        </div>
                     )}
                     <input id="ground-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'ground')} />
                  </div>

                  {/* Photo 2 */}
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition relative ${eavePhoto ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                     {eavePhoto ? (
                        <div className="relative w-full h-48">
                            <img 
                                src={`data:${eavePhoto.mime};base64,${eavePhoto.data}`} 
                                alt="Eave View" 
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute top-2 right-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setEavePhoto(null); }}
                                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Eave View
                            </div>
                        </div>
                     ) : (
                        <div onClick={() => document.getElementById('eave-upload')?.click()} className="cursor-pointer py-8">
                            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                            <p className="font-bold text-gray-700">Upload Eaves/Gutter View</p>
                            <p className="text-xs text-gray-500">Take a photo looking up at the edge of the roof</p>
                        </div>
                     )}
                     <input id="eave-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'eave')} />
                  </div>
               </div>

               <div className="mt-8 flex gap-4">
                   <button onClick={() => setStep(1)} className="px-4 py-3 text-gray-500 hover:text-gray-700 font-medium">Back</button>
                   <button
                    disabled={!groundPhoto || !eavePhoto}
                    onClick={handleAnalysis}
                    className="flex-1 bg-phoenix-600 text-white py-3 rounded-lg font-bold hover:bg-phoenix-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                     Analyze Photos <ShieldCheck className="w-4 h-4" />
                   </button>
               </div>
            </div>
          )}

          {/* STEP 3: ANALYSIS & VERDICT */}
          {step === 3 && (
            <div className="p-8">
               {isAnalyzing ? (
                 <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-16 h-16 text-phoenix-600 animate-spin mb-6" />
                    <h3 className="text-xl font-bold text-gray-900">Analyzing Structural Integrity...</h3>
                    <p className="text-gray-500 mt-2 text-center max-w-sm">
                        Our AI is checking Street View data and your photos for signs of sagging, moss, or shingle damage.
                    </p>
                 </div>
               ) : (
                 <div>
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Inspection Results</h2>
                    </div>

                    <div className="prose prose-sm prose-slate max-w-none bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <MarkdownDisplay text={result || ''} />
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-500 mb-4">
                            Based on this result, you can proceed with your maintenance plan or book a repair.
                        </p>
                        <button
                            onClick={onSchedule}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition"
                        >
                            Schedule Next Step
                        </button>
                    </div>
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
