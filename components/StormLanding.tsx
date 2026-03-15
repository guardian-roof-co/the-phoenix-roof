
import React, { useState, useRef, useEffect } from 'react';
import {
    ShieldAlert,
    MapPin,
    Phone,
    User as UserIcon,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Play,
    FileSearch,
    Map as MapIcon,
    ShieldCheck,
    Zap,
    Clock,
    ThumbsUp,
    Star,
    Activity,
    Award,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Info,
    CheckCircle,
    FileText,
    ExternalLink,
    XCircle,
    MessageSquare,
    ClipboardCheck
} from 'lucide-react';
import { OnScheduleHandler } from '../types';
import { apiClient } from '../services/apiClient';
import { StormData } from '../data/storms';

interface StormLandingProps {
    storm: StormData;
    onSchedule: OnScheduleHandler;
}

export const StormLanding: React.FC<StormLandingProps> = ({ storm, onSchedule }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentCertIndex, setCurrentCertIndex] = useState(0);
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    const addressRef = useRef<HTMLInputElement>(null);
    const autocompleteInstance = useRef<any>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const totalSlides = storm.stormPhotos.length + (storm.videoEmbed ? 1 : 0);
            if (totalSlides > 1) {
                setCurrentImageIndex(prev => (prev + 1) % totalSlides);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [storm.stormPhotos.length, storm.videoEmbed]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCertIndex(prev => (prev + 1) % 6); // 8 cards total, 3 shown = 6 starting positions (0-5)
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonialIndex(prev => (prev + 1) % 4); // 4 testimonials
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (window.google && window.google.maps && addressRef.current && !autocompleteInstance.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(addressRef.current, {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setFormData(prev => ({ ...prev, address: place.formatted_address! }));
                }
            });
            autocompleteInstance.current = autocomplete;
        }
    }, []);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            if (cleanPhone.length < 10) newErrors.phone = 'Enter a valid phone number';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await apiClient.post('/api/quotes-sync', {
                firstName: formData.name.split(' ')[0],
                lastName: formData.name.split(' ').slice(1).join(' ') || 'Customer',
                phone: formData.phone,
                address: formData.address,
                email: 'storm-lead@roofbyphoenix.com',
                leadSource: 'Storm Page Template',
                pageName: storm.slug,
                notes: `URGENT STORM LEAD: ${storm.hailSize} Hail area (${storm.city} - ${storm.date}).`
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTextClick = () => {
        window.location.href = "sms:6163194245?body=ROOF";
    };

    return (
        <div className="bg-white min-h-screen text-slate-900 font-sans selection:bg-red-500/30 overflow-x-hidden">
            {/* HERO SECTION */}
            <section className="relative pt-12 pb-12 lg:pt-16 lg:pb-16 overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[60%] h-full bg-red-600 skew-x-12 transform translate-x-1/4 blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="flex items-center justify-center gap-6 md:gap-10 mb-6">
                            <span className="w-4 h-4 md:w-6 md:h-6 bg-red-600 rounded-full beacon-red shrink-0"></span>
                            <h3 className="text-4xl md:text-[5.5rem] font-black text-red-600 tracking-tighter uppercase italic leading-none m-0">
                                STORM DAMAGE ALERT
                            </h3>
                            <span className="w-4 h-4 md:w-6 md:h-6 bg-red-600 rounded-full beacon-red shrink-0"></span>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                            {storm.city} • HAILSTORM — {storm.date}
                        </h1>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* LEFT SIDE — Storm Info */}
                        <div className="text-left animate-fade-in">
                            <p className="text-2xl md:text-3xl text-yellow-400 font-black italic mb-4 uppercase tracking-tight leading-none">
                                {storm.hailSize} HAIL CONFIRMED IN YOUR AREA
                            </p>

                            <p className="text-lg text-slate-300 font-medium mb-6 leading-relaxed max-w-xl">
                                {storm.description}
                            </p>

                            <div className="relative rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl group">
                                <div className="aspect-video bg-slate-900 flex items-center justify-center">
                                    {storm.radarImage ? (
                                        <img src={storm.radarImage} alt="Storm Radar Map" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-8">
                                            <MapIcon className="w-16 h-16 text-red-600 mx-auto mb-4 opacity-50" />
                                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Radar Impact Zone Data</p>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Impact Zone: {storm.affectedAreas.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE — Contact Form */}
                        <div id="contact-form" className="lg:sticky lg:top-32">
                            {!submitted ? (
                                <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-2xl border border-slate-100">
                                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 uppercase italic tracking-tight mb-1 text-center leading-tight">Schedule Your Free <br /> <span className="text-red-600">Forensic Inspection</span></h3>
                                    <p className="text-slate-500 text-[9px] font-black uppercase text-center mb-6 italic tracking-widest opacity-60">No Obligations • 100% Free • Local Experts</p>

                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    className={`w-full bg-slate-50 border-2 ${errors.name ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-3.5 pl-14 pr-6 focus:border-red-600 outline-none transition font-bold text-slate-900`}
                                                    placeholder="Your Name"
                                                />
                                            </div>

                                            <div className="relative">
                                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                    className={`w-full bg-slate-50 border-2 ${errors.phone ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-3.5 pl-14 pr-6 focus:border-red-600 outline-none transition font-bold text-slate-900`}
                                                    placeholder="Phone Number"
                                                />
                                            </div>

                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    ref={addressRef}
                                                    type="text"
                                                    required
                                                    value={formData.address}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                                    className={`w-full bg-slate-50 border-2 ${errors.address ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-3.5 pl-14 pr-6 focus:border-red-600 outline-none transition font-bold text-slate-900`}
                                                    placeholder="Property Address"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-red-600 hover:bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-70 text-base mt-2"
                                        >
                                            {isSubmitting ? 'SENDING...' : 'Get My Free Inspection'}
                                            <ArrowRight className="w-5 h-5" />
                                        </button>

                                        <div className="text-center pt-3 border-t border-slate-100 mt-4">
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 px-4 whitespace-nowrap">Or text ROOF to 616-319-HAIL</p>
                                            <button
                                                type="button"
                                                onClick={handleTextClick}
                                                className="inline-flex items-center gap-2 text-red-600 font-black uppercase text-[9px] tracking-widest hover:text-slate-900 transition-colors bg-red-50 px-4 py-2 rounded-full"
                                            >
                                                <MessageSquare className="w-3 h-3" /> Send Text Message
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 text-center animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase italic mb-4">SUCCESS!</h3>
                                    <p className="text-slate-600 font-bold mb-8">
                                        We've received your data. A Phoenix Specialist will contact you shortly to coordinate your assessment.
                                    </p>
                                    <button onClick={() => setSubmitted(false)} className="text-red-600 text-xs font-black uppercase tracking-widest hover:underline">
                                        Submit Another Address
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* STORM EVIDENCE SECTION */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20">
                        <div>
                            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight italic uppercase mb-8">What Happened on <span className="text-red-600">{storm.date}</span></h3>

                            <div className="space-y-8 mt-10">
                                <div className="flex items-start gap-4">
                                    <span className="text-red-600 text-3xl leading-none">•</span>
                                    <div>
                                        <p className="text-xl text-slate-600 font-medium leading-relaxed">
                                            {storm.description}
                                        </p>
                                        {/* <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-black text-slate-400 uppercase tracking-widest">
                                            <span>Date: {storm.date}</span>
                                            <span>•</span>
                                            <span>Hail: {storm.hailSize}</span>
                                            <span>•</span>
                                            <span>Areas: {storm.affectedAreas.join(', ')}</span>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="relative group rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] bg-slate-100 flex items-center justify-center">
                                {(() => {
                                    const totalPhotos = storm.stormPhotos.length;
                                    const hasVideo = !!storm.videoEmbed;
                                    const totalSlides = totalPhotos + (hasVideo ? 1 : 0);

                                    if (totalSlides === 0) {
                                        return (
                                            <div className="text-center p-8">
                                                <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Evidence Coming Soon</p>
                                            </div>
                                        );
                                    }

                                    const isVideoSlide = hasVideo && currentImageIndex === totalPhotos;

                                    return (
                                        <>
                                            {isVideoSlide ? (
                                                <a href="https://www.youtube.com/watch?v=fiK26B6bPM4" target="_blank" rel="noopener noreferrer" className="w-full h-full bg-slate-900 relative flex items-center justify-center cursor-pointer group/video overflow-hidden">
                                                    <img src="https://img.youtube.com/vi/fiK26B6bPM4/hqdefault.jpg" alt="Storm Footage Preview" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover/video:opacity-40 transition-opacity duration-300" />
                                                    <div className="relative z-10 text-center">
                                                        <div className="w-16 h-16 bg-red-600/90 backdrop-blur-md rounded-full flex items-center justify-center mx-auto shadow-2xl border-2 border-white/20 group-hover/video:scale-110 transition-transform duration-300">
                                                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                                                        </div>
                                                    </div>
                                                </a>
                                            ) : (
                                                <img
                                                    src={storm.stormPhotos[currentImageIndex]}
                                                    alt={`Storm evidence ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}

                                            {totalSlides > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === 0 ? totalSlides - 1 : prev - 1)); }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 z-20"
                                                    >
                                                        <ChevronLeft className="w-6 h-6" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev === totalSlides - 1 ? 0 : prev + 1)); }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 z-20"
                                                    >
                                                        <ChevronRight className="w-6 h-6" />
                                                    </button>
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                                        {Array.from({ length: totalSlides }).map((_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                                                                className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}

                                            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-20">
                                                <p className="text-[9px] font-black text-white uppercase tracking-widest">
                                                    {isVideoSlide ? 'Featured Video' : `Storm Evidence ${currentImageIndex + 1}/${totalPhotos}`}
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHAT TO LOOK FOR SECTION */}
            <section className="py-16 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight italic uppercase mb-6">Signs of <span className="text-red-600">Hail Damage</span></h3>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                            Hail damage isn't always obvious from the ground. Here is what our forensic inspectors look for when assessing your property.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: "Shingles", desc: "Bruising/denting of the shingle mat, loss of granules, and fractures.", icon: ShieldAlert },
                            { title: "Gutters", desc: "Small dings or dents in the metal. If your gutters are hit, your roof likely is too.", icon: Activity },
                            { title: "Siding", desc: "Cracking, chipping, or hole-like 'bruises' on vinyl or aluminum siding.", icon: MapPin },
                            { title: "Windows", desc: "Damaged screens, dented frames, or cracked glass from wind-blown hail.", icon: Award }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 uppercase italic mb-4">{item.title}</h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 bg-red-600 rounded-[3rem] p-10 lg:p-16 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-black/10 skew-x-12 transform translate-x-1/2"></div>
                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h4 className="text-3xl font-black uppercase italic mb-6">Warning Signs for Homeowners</h4>
                                <ul className="space-y-4">
                                    {[
                                        "Sudden increase in roof granules in downspouts",
                                        "Water spots on ceilings or in the attic",
                                        "Neighbors already getting roof replacements",
                                        "Door knockers offering 'Free Roofs' without data"
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                                            <p className="font-bold opacity-90">{text}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-yellow-400">Forensic Pro Tip</p>
                                <p className="text-lg font-medium leading-relaxed">
                                    "A roof that looks fine from the curb often has micro-fractures in the shingle mat that will cause leaks within 12-24 months. Don't wait for a leak to file a claim."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* INSURANCE PROCESS SECTION */}
            <section className="py-16 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 md:mb-20">
                        <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight italic uppercase">The <span className="text-blue-600">Insurance Process</span></h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-16 md:gap-12 mb-20">
                        {[
                            { step: "01", title: "Forensic Evidence", desc: "We document the damage with photos, video, and radar path data before you call insurance." },
                            { step: "02", title: "Claim Filing", desc: "You contact your carrier with the data we provide. We help explain the documentation to the adjuster." },
                            { step: "03", title: "Site Assessment", desc: "We meet the insurance adjuster on-site to ensure they see every forensic hit we documented." }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <span className="absolute -top-10 -left-6 text-8xl font-black text-slate-100 group-hover:text-blue-50 transition-colors -z-10">{item.step}</span>
                                <h4 className="text-2xl font-black text-slate-900 uppercase italic mb-4">{item.title}</h4>
                                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
                        <div className="bg-slate-950 rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 blur-[80px] opacity-20"></div>
                            <h4 className="text-2xl font-black uppercase italic mb-8 text-red-500 flex items-center gap-3">
                                <XCircle className="w-6 h-6 shrink-0" /> Common Pitfalls
                            </h4>
                            <ul className="space-y-6">
                                {[
                                    { t: "Signing Too Early", d: "Never sign a 'contingency' or 'contract' before you see a detailed damage report." },
                                    { t: "Not Enough Documentation", d: "Generic photos aren't enough. Claims fail because there isn't scientific proof of hail impact." },
                                    { t: "Trusting Verbal Promises", d: "If a contractor 'promises' a covered claim, they are being dishonest. Only the carrier approves claims." }
                                ].map((item, i) => (
                                    <li key={i} className="border-l-4 border-slate-800 pl-4 md:pl-6 py-2">
                                        <p className="font-black uppercase text-sm mb-1">{item.t}</p>
                                        <p className="text-slate-400 text-sm font-medium">{item.d}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-blue-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 text-white shadow-2xl">
                            <h4 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                                <ClipboardCheck className="w-6 h-6" /> Why Documentation Matters
                            </h4>
                            <p className="text-xl font-medium leading-relaxed italic mb-10">
                                "A covered claim requires evidence. Without physical proof of impact, adjusters are forced to deny. Our Forensic Report provides that proof."
                            </p>
                            <a
                                href="https://www.canva.com/design/DAHDqPdwVkw/1vcYb1AHjA5UE8cgLkcCbA/view?utm_content=DAHDqPdwVkw&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h670a6a8d3f"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-white text-blue-700 font-black uppercase text-xs tracking-[0.2em] px-8 py-5 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                            >
                                <FileText className="w-5 h-5" /> View Sample Report <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>


            {/* WHY PHOENIX SECTION */}
            <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16 flex flex-col items-center">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight italic uppercase mb-2 md:mb-4 text-center">The Phoenix Standard</h2>
                        <h3 className="text-base md:text-2xl font-black text-slate-500 uppercase tracking-[0.2em] italic mb-8 text-center leading-relaxed">Forensic Inspectors, <br className="md:hidden" /><span className="text-red-600">Not Salesmen</span></h3>
                        <div className="inline-flex flex-col md:flex-row items-center gap-2 md:gap-3 bg-blue-600 text-white px-6 py-3 md:py-3 rounded-[2rem] shadow-lg group hover:bg-blue-700 transition-all duration-300 text-center mx-4">
                            <MapPin className="w-5 h-5 animate-pulse group-hover:animate-bounce shrink-0 hidden md:block" />
                            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">Locally owned in Grand Rapids, MI</span>
                        </div>
                    </div>


                    <div className="relative mb-20 group">
                        <div className="overflow-hidden px-0 md:px-0">
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateX(-${currentCertIndex * (typeof window !== 'undefined' && window.innerWidth >= 768 ? 33.333333 : 100)}%)` }}
                            >
                                {[
                                    { title: "HAAG Certified Inspector", icon: "/certifications/haag-certified.png" },
                                    { title: "Installation of Asphalt Shingle Roofs", icon: "/certifications/bei-main.png" },
                                    { title: "Building Code for Asphalt Shingle Roofs", icon: "/certifications/bei-main.png" },
                                    { title: "Documentation of Asphalt Shingle Roofs", icon: "/certifications/bei-main.png" },
                                    { title: "Hail Damage Identification", icon: "/certifications/bei-main.png" },
                                    { title: "Wind Damage Identification", icon: "/certifications/bei-main.png" },
                                    { title: "Asphalt Shingle Roof Forensic Inspector", icon: "/certifications/bei-main.png" },
                                    { title: "Temporary Repairs to Roof Coverings", icon: "/certifications/haag-repairs.jpg" }
                                ].map((cert, i) => (
                                    <div key={i} className="min-w-full md:min-w-[33.333333%] flex-shrink-0 px-2 lg:px-4">
                                        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center h-full min-h-[220px] md:min-h-[260px] justify-center mx-2 md:mx-0">
                                            <div className="w-28 h-20 md:w-40 md:h-28 mb-6">
                                                <img src={cert.icon} alt={cert.title} className="w-full h-full object-contain" />
                                            </div>
                                            <h4 className="text-sm md:text-base font-black uppercase text-slate-800 tracking-tight leading-tight max-w-[200px]">{cert.title}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={() => setCurrentCertIndex(prev => (prev === 0 ? 5 : prev - 1))}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-100 rounded-full hidden md:flex items-center justify-center text-slate-300 hover:text-red-600 hover:border-red-600 shadow-sm transition-all -ml-5 z-30 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentCertIndex(prev => (prev === 5 ? 0 : prev + 1))}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-100 rounded-full hidden md:flex items-center justify-center text-slate-300 hover:text-red-600 hover:border-red-600 shadow-sm transition-all -mr-5 z-30 opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center gap-2 mt-10">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentCertIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentCertIndex ? 'bg-red-600 w-6' : 'bg-slate-200 hover:bg-slate-300'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="bg-white p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 w-full overflow-hidden">
                            {/* CLIENT TESTIMONIALS SECTION */}
                            <div className="mb-6 text-center lg:text-left">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic uppercase mb-2">Client <span className="text-blue-600">Testimonials</span></h3>
                            </div>

                            <div className="relative overflow-hidden min-h-[200px]">
                                <div
                                    className="flex transition-transform duration-700 ease-in-out"
                                    style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}
                                >
                                    {[
                                        {
                                            name: "Sarah J.",
                                            location: "Grand Rapids, MI",
                                            text: "Having a team that is so professional to handle something so important is wonderful. Bre is on top of everything and so amazing with communication and the whole team is so knowledgeable and thorough, making it all feel seamless!",
                                            rating: 5,
                                            date: "2 months ago"
                                        },
                                        {
                                            name: "Michael R.",
                                            location: "Rockford, MI",
                                            text: "Professional, knowledgeable and we felt well taken care of and supported throughout our entire roof replacement. Highly recommend Phoenix Roofing for their attention to detail.",
                                            rating: 5,
                                            date: "4 months ago"
                                        },
                                        {
                                            name: "David T.",
                                            location: "Grand Rapids, MI",
                                            text: "They said what they were going to do and did an Awesome Job! Honest estimates and reliable craftsmanship. Thanks Phoenix Roofing & Exterior!",
                                            rating: 5,
                                            date: "1 month ago"
                                        },
                                        {
                                            name: "Jennifer L.",
                                            location: "Kentwood, MI",
                                            text: "The communication was outstanding. From the initial inspection to the final cleanup, they kept us informed and treated our home with respect. Best roofing experience we've had.",
                                            rating: 5,
                                            date: "3 weeks ago"
                                        }
                                    ].map((review, i) => (
                                        <div key={i} className="min-w-full w-full shrink-0">
                                            <div className="flex text-amber-400 mb-6">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="w-5 h-5 fill-current" />
                                                ))}
                                            </div>
                                            <p className="text-lg text-slate-600 font-medium italic leading-relaxed mb-6">
                                                "{review.text}"
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                                                    {review.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 uppercase italic">{review.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{review.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6 justify-center lg:justify-start">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentTestimonialIndex(i)}
                                        className={`h-1.5 rounded-full transition-all ${i === currentTestimonialIndex ? 'bg-blue-600 w-8' : 'bg-slate-200'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="text-center md:text-left py-8">
                            <h4 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 mb-6 leading-tight">See why we are <br className="hidden md:block"/><span className="text-red-600">different.</span></h4>
                            <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed mb-8 md:mb-10 mx-auto md:mx-0 max-w-sm">
                                Most contractors want to sell you a roof. We want to provide you with a forensic assessment of your property's structural integrity.
                            </p>
                            <button
                                onClick={() => window.open('https://www.canva.com/design/DAHDqPdwVkw/1vcYb1AHjA5UE8cgLkcCbA/view', '_blank')}
                                className="inline-flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 text-slate-900 font-black uppercase text-xs md:text-sm tracking-widest hover:text-red-600 transition-colors border-b-4 border-red-600 pb-2 break-words"
                            >
                                <span>Sample inspection report</span> <ArrowRight className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEEK A SECOND OPINION SECTION */}
            <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-red-600/5 -skew-x-12 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight italic uppercase mb-6">SEEK A <span className="text-red-600">SECOND OPINION</span></h2>
                        <p className="text-slate-400 font-bold max-w-2xl mx-auto text-lg uppercase tracking-widest opacity-80">Already had a door knocker visit? Compare the difference.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-16">
                        <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 border border-white/10 group hover:border-red-600/30 transition-all">
                            <h4 className="text-2xl md:text-3xl font-black uppercase italic mb-8 md:mb-10 flex items-center gap-3 md:gap-4 text-red-500">
                                <ShieldCheck className="w-8 h-8 shrink-0" /> Phoenix Provides:
                            </h4>
                            <ul className="space-y-4 md:space-y-6">
                                {[
                                    "Detailed, free, forensic report",
                                    "No obligations/contingencies",
                                    "5+ forensic certifications",
                                    "Local Grand Rapids business"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                                        <p className="font-bold opacity-90 text-sm md:text-base">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-red-950/30 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 border border-red-900/30 group hover:border-red-600/30 transition-all">
                            <h4 className="text-2xl md:text-3xl font-black uppercase italic mb-8 md:mb-10 flex items-start md:items-center gap-3 md:gap-4 text-slate-300">
                                <AlertTriangle className="w-8 h-8 text-yellow-500 shrink-0 mt-1 md:mt-0" /> Seek a Second Opinion If:
                            </h4>
                            <ul className="space-y-4 md:space-y-6">
                                {[
                                    "Limited photos and promises of a covered claim",
                                    "Someone promised you a covered claim",
                                    "The insurance process was described as easy"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                                        <p className="font-bold text-slate-400 group-hover:text-slate-300 transition-colors">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* BOTTOM CTA SECTION */}
            <section className="py-32 bg-red-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="text-left text-white">
                            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 uppercase italic leading-none">
                                DON'T MISS YOUR <br />
                                <span className="text-yellow-400 italic">FILING WINDOW.</span>
                            </h2>
                            <p className="text-2xl font-black uppercase italic mb-12 tracking-widest opacity-80 leading-relaxed">
                                SECURE YOUR FORENSIC SPOT BEFORE THE DEADLINES HIT.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                                <a
                                    href="tel:6163194245"
                                    className="bg-slate-950 text-white px-8 py-5 md:px-10 md:py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl text-sm md:text-base"
                                >
                                    <Phone className="w-5 h-5" /> Call 616-319-HAIL
                                </a>
                                <button
                                    onClick={handleTextClick}
                                    className="bg-white text-red-600 px-8 py-5 md:px-10 md:py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-2xl text-sm md:text-base"
                                >
                                    <MessageSquare className="w-5 h-5" /> Text ROOF to 616
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 lg:p-14 shadow-2xl">
                            {!submitted ? (
                                <>
                                    <h4 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic mb-8 text-center">Request a <br /> <span className="text-red-600">Free Forensic Inspection</span></h4>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 focus:border-red-600 outline-none transition font-bold text-slate-900"
                                            placeholder="Your Name"
                                        />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 focus:border-red-600 outline-none transition font-bold text-slate-900"
                                            placeholder="Phone Number"
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-6 focus:border-red-600 outline-none transition font-bold text-slate-900"
                                            placeholder="Property Address"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-red-600 hover:bg-slate-900 text-white rounded-2xl py-6 font-black uppercase tracking-widest transition-all shadow-xl mt-4"
                                        >
                                            Get My Free Inspection
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
                                    <p className="font-black text-2xl uppercase italic text-slate-900">Request Received!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
