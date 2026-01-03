import React, { useState } from 'react';
import { CheckCircle, Loader2, User, Phone, Mail, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export const Signup: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [zip, setZip] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!firstName.trim()) newErrors.firstName = 'First name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last name is required';

        if (!email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
            let cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
                cleanPhone = cleanPhone.substring(1);
            }
            if (cleanPhone.length !== 10) {
                newErrors.phone = 'Please enter a valid 10-digit US phone number';
            }
        }

        if (!zip.trim()) {
            newErrors.zip = 'ZIP code is required';
        } else if (!/^\d{5}$/.test(zip.trim())) {
            newErrors.zip = 'Please enter a valid 5-digit US ZIP code';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Use unified API client (handles tracking automatically)
            console.log('[Signup] Submitting via API Client...');
            await apiClient.post('/api/signups', {
                firstName,
                lastName,
                email,
                phone,
                zip,
                leadSource: 'Website Signup Page'
            });

            setSubmitted(true);
        } catch (err: any) {
            console.error("Signup Error:", err);
            alert(err.message || "There was an issue creating your account. Please try again or call 616-319-HAIL.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in-up">
                <div className="bg-phoenix-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                    <CheckCircle className="w-12 h-12 text-phoenix-600" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 italic uppercase">
                    Welcome to the Nest!
                </h2>
                <p className="text-lg text-slate-600 mb-8 font-medium">
                    Thanks for signing up, {firstName}. Your account has been created successfully. We've sent a confirmation email to {email}.
                </p>
                <button
                    onClick={() => {
                        setSubmitted(false);
                        setFirstName('');
                        setLastName('');
                        setEmail('');
                        setPhone('');
                        setZip('');
                        setErrors({});
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-xl"
                >
                    Back to Signup
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 mt-10">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full mb-6">
                    <ShieldCheck className="w-4 h-4 text-phoenix-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Join The Phoenix Family</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Create Your Account</h2>
                <p className="mt-4 text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">Early access to storm reports, instant quotes, and premium maintenance planning.</p>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <form onSubmit={handleSubmit} noValidate className="p-10 md:p-16 space-y-10">
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">First Name</label>
                                <div className="relative">
                                    <User className={`absolute left-5 top-5 w-5 h-5 ${errors.firstName ? 'text-red-400' : 'text-slate-300'}`} />
                                    <input
                                        required
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => {
                                            setFirstName(e.target.value);
                                            if (errors.firstName) setErrors(prev => { const n = { ...prev }; delete n.firstName; return n; });
                                        }}
                                        className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.firstName ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 transition-all`}
                                        placeholder="First Name"
                                    />
                                    {errors.firstName && (
                                        <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.firstName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Last Name</label>
                                <div className="relative">
                                    <User className={`absolute left-5 top-5 w-5 h-5 ${errors.lastName ? 'text-red-400' : 'text-slate-300'}`} />
                                    <input
                                        required
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => {
                                            setLastName(e.target.value);
                                            if (errors.lastName) setErrors(prev => { const n = { ...prev }; delete n.lastName; return n; });
                                        }}
                                        className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.lastName ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 transition-all`}
                                        placeholder="Last Name"
                                    />
                                    {errors.lastName && (
                                        <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.lastName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                                <div className="relative">
                                    <Mail className={`absolute left-5 top-5 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-slate-300'}`} />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors(prev => { const n = { ...prev }; delete n.email; return n; });
                                        }}
                                        className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.email ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 transition-all`}
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && (
                                        <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Phone Number</label>
                                <div className="relative">
                                    <Phone className={`absolute left-5 top-5 w-5 h-5 ${errors.phone ? 'text-red-400' : 'text-slate-300'}`} />
                                    <input
                                        required
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            if (errors.phone) setErrors(prev => { const n = { ...prev }; delete n.phone; return n; });
                                        }}
                                        className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.phone ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 transition-all`}
                                        placeholder="(616) 555-0123"
                                    />
                                    {errors.phone && (
                                        <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">ZIP Code</label>
                            <div className="relative">
                                <MapPin className={`absolute left-5 top-5 w-5 h-5 ${errors.zip ? 'text-red-400' : 'text-slate-300'}`} />
                                <input
                                    required
                                    type="text"
                                    value={zip}
                                    onChange={(e) => {
                                        setZip(e.target.value);
                                        if (errors.zip) setErrors(prev => { const n = { ...prev }; delete n.zip; return n; });
                                    }}
                                    className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.zip ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 transition-all`}
                                    placeholder="e.g. 49503"
                                />
                                {errors.zip && (
                                    <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.zip}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full text-white font-black py-6 rounded-[2.5rem] bg-phoenix-600 hover:bg-phoenix-700 transition-all text-lg flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl active:scale-[0.98] shadow-phoenix-200"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create My Account"}
                    </button>

                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        <div className="h-px bg-slate-200 w-12"></div>
                        Join 1,000+ Happy Grand Rapids Homeowners
                        <div className="h-px bg-slate-200 w-12"></div>
                    </div>
                </form>
            </div>
        </div>
    );
};
