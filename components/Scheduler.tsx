import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Loader2, Video, MapPin, Calendar, Clock, User, Phone, Mail, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// REPLACE THIS with your actual Google Calendar Appointment Schedule URL
const GOOGLE_CALENDAR_BOOKING_URL = 'https://calendar.app.google/AUJDFzkqMMp8NQKa7';

interface SchedulerProps {
  initialNotes?: string;
}

export const Scheduler: React.FC<SchedulerProps> = ({ initialNotes }) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAppointment } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('Morning (8am - 12pm)');
  const [notes, setNotes] = useState(initialNotes || '');
  const [meetingType, setMeetingType] = useState<'in-person' | 'virtual'>('in-person');

  const addressRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<any>(null);

  useEffect(() => {
    if (window.google && window.google.maps && addressRef.current && !autocompleteInstance.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setAddress(place.formatted_address);
        }
      });
      autocompleteInstance.current = autocomplete;
    }
  }, []);

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
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        newErrors.phone = 'Please enter a valid 10-digit US phone number';
      }
    }

    if (!address.trim()) newErrors.address = 'Property address is required';
    if (meetingType === 'in-person' && !date) newErrors.date = 'Preferred date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    // Helper to get HubSpot tracking cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    const hutk = getCookie('hubspotutk');
    const utmSource = sessionStorage.getItem('utm_source');
    const utmMedium = sessionStorage.getItem('utm_medium');
    const utmCampaign = sessionStorage.getItem('utm_campaign');

    const fullNotes = meetingType === 'virtual'
      ? `VIRTUAL BOOKING REQUESTED - REDIRECTED TO GOOGLE CALENDAR.\n\nNotes: ${notes}`
      : `Requested: ${date} at ${time}. Interaction: ${meetingType}. Notes: ${notes}`;

    // 1. HubSpot Sync for Operations Team (via Backend Bridge)
    try {
      await fetch('/api/quotes-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          address,
          date,
          time,
          notes,
          leadSource: `Website Scheduler (${meetingType})`,
          pageUri: window.location.href,
          pageName: 'Scheduler',
          hutk,
          utmSource,
          utmMedium,
          utmCampaign
        })
      });
    } catch (e) {
      console.warn('[HubSpot Bridge Error]', e);
    }

    // 2. Local State update
    addAppointment({
      userName: `${firstName} ${lastName}`,
      userEmail: email,
      userPhone: phone,
      date,
      time,
      type: 'inspection',
      meetingType,
      notes: fullNotes
    });

    setIsSubmitting(false);

    if (meetingType === 'virtual') {
      window.open(GOOGLE_CALENDAR_BOOKING_URL, '_blank');
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in-up">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 italic uppercase">
          {meetingType === 'virtual' ? 'Opening Calendar...' : 'Request Logged'}
        </h2>
        <p className="text-lg text-slate-600 mb-8 font-medium">
          {meetingType === 'virtual'
            ? "Our operations team has your details. We've opened Google Calendar for you to pick an exact time."
            : `Your request is with our Grand Rapids operations team. We'll call ${phone} to confirm your slot.`
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => setSubmitted(false)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-xl">
            Go Back
          </button>
          {meetingType === 'virtual' && (
            <a
              href={GOOGLE_CALENDAR_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl flex items-center justify-center gap-2"
            >
              Re-open Calendar <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 mt-10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-4 h-4 text-phoenix-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">616 Ops Connection</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Book Your 616 Visit</h2>
        <p className="mt-4 text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">Schedule a free roof assessment with our local Grand Rapids operations team.</p>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-10">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-100 p-2 rounded-2xl inline-flex shadow-inner">
              <button
                type="button"
                onClick={() => setMeetingType('in-person')}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meetingType === 'in-person' ? 'bg-white shadow-md text-phoenix-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MapPin className="w-4 h-4" /> In-Person
              </button>
              <button
                type="button"
                onClick={() => setMeetingType('virtual')}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meetingType === 'virtual' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Video className="w-4 h-4" /> Virtual Booking
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">First Name</label>
              <div className="relative">
                <User className={`absolute left-5 top-5 w-5 h-5 ${errors.firstName ? 'text-red-400' : 'text-slate-300'}`} />
                <input required type="text" value={firstName} onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors(prev => { const n = { ...prev }; delete n.firstName; return n; });
                }} className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.firstName ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 Transition-all`} placeholder="First Name" />
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
                <input required type="text" value={lastName} onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors(prev => { const n = { ...prev }; delete n.lastName; return n; });
                }} className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.lastName ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 Translation-all`} placeholder="Last Name" />
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Phone Number</label>
              <div className="relative">
                <Phone className={`absolute left-5 top-5 w-5 h-5 ${errors.phone ? 'text-red-400' : 'text-slate-300'}`} />
                <input required type="tel" value={phone} onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => { const n = { ...prev }; delete n.phone; return n; });
                }} className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.phone ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 transition-all`} placeholder="(616) 555-0123" />
                {errors.phone && (
                  <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-5 top-5 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-slate-300'}`} />
                <input required type="email" value={email} onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => { const n = { ...prev }; delete n.email; return n; });
                }} className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.email ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 transition-all`} placeholder="you@example.com" />
                {errors.email && (
                  <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Property Address</label>
            <div className="relative">
              <MapPin className={`absolute left-5 top-5 w-5 h-5 ${errors.address ? 'text-red-400' : 'text-slate-300'}`} />
              <input
                ref={addressRef}
                required
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors(prev => { const n = { ...prev }; delete n.address; return n; });
                }}
                className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.address ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold placeholder-slate-400 transition-all`}
                placeholder="Grand Rapids Address..."
              />
              {errors.address && (
                <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address}
                </div>
              )}
            </div>
          </div>

          {meetingType === 'in-person' ? (
            <div className="grid md:grid-cols-2 gap-10 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Preferred Date</label>
                <div className="relative">
                  <Calendar className={`absolute left-5 top-5 w-5 h-5 ${errors.date ? 'text-red-400' : 'text-slate-300'} pointer-events-none`} />
                  <input required type="date" value={date} onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors(prev => { const n = { ...prev }; delete n.date; return n; });
                  }} className={`w-full pl-14 pr-6 py-5 bg-slate-50 border ${errors.date ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-phoenix-50'} rounded-2xl outline-none font-bold transition-all`} />
                  {errors.date && (
                    <div className="flex items-center gap-1.5 mt-2 ml-4 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
                      <AlertCircle className="w-3 h-3" />
                      {errors.date}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Time Window</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-5 w-5 h-5 text-slate-300 pointer-events-none" />
                  <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full pl-14 pr-10 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-phoenix-50 outline-none bg-white font-bold appearance-none">
                    <option>Morning (8am - 12pm)</option>
                    <option>Afternoon (12pm - 4pm)</option>
                    <option>Evening (4pm - 6pm)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex items-start gap-5 animate-fade-in shadow-inner">
              <Calendar className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-black text-blue-900 uppercase text-xs tracking-widest mb-2">Instant Virtual Booking</p>
                <p className="text-blue-700 text-sm font-medium leading-relaxed">Pick your exact 15-minute slot on our operations calendar after submitting this form. We'll send you the video link immediately.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Project Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-phoenix-50 h-40 font-medium placeholder-slate-400 shadow-inner" placeholder="Describe any leaks, damage, or specific requests for our team..."></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-black py-6 rounded-[2.5rem] transition-all text-lg flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl active:scale-[0.98] ${meetingType === 'virtual' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-slate-900 hover:bg-black shadow-slate-200'
              }`}
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              meetingType === 'virtual' ? "Continue to Calendar" : "Request Free Inspection"
            )}
            {meetingType === 'virtual' && !isSubmitting && <ExternalLink className="w-5 h-5" />}
          </button>

          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
            <div className="h-px bg-slate-200 w-12"></div>
            Direct Sync with Grand Rapids Operations
            <div className="h-px bg-slate-200 w-12"></div>
          </div>
        </form>
      </div>
    </div>
  );
};
