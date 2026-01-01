import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Loader2, Video, MapPin, Calendar, Clock, User, Phone, Mail, ExternalLink, ShieldCheck, AlertCircle, Users, MessageSquare, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';

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

    const fullNotes = meetingType === 'virtual'
      ? `VIRTUAL BOOKING REQUESTED - REDIRECTED TO GOOGLE CALENDAR.\n\nNotes: ${notes}`
      : `Requested: ${date} at ${time}. Interaction: ${meetingType}. Notes: ${notes}`;

    // 1. HubSpot Sync for Operations Team (via Backend Bridge)
    try {
      await apiClient.post('/api/quotes-sync', {
        email,
        firstName,
        lastName,
        phone,
        address,
        date,
        time,
        notes,
        leadSource: `Website Scheduler (${meetingType})`,
        pageName: 'Scheduler'
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
              className="bg-phoenix-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-phoenix-700 transition shadow-xl flex items-center justify-center gap-2"
            >
              Open Calendar <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Left Side - Info */}
          <div className="lg:col-span-2 bg-slate-900 p-8 lg:p-12 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-phoenix-600/20 text-phoenix-400 text-sm font-bold uppercase tracking-widest mb-8">
              <ShieldCheck className="w-4 h-4" /> Grand Rapids, MI
            </div>
            <h1 className="text-4xl font-black italic uppercase leading-tight mb-6">
              Schedule Your <span className="text-phoenix-500">Free</span> Inspection
            </h1>
            <p className="text-slate-400 text-lg mb-12 font-medium">
              Pick a time that works for you. Our local team will arrive on time and provide a complete visual assessment.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-phoenix-500" />
                </div>
                <div>
                  <div className="font-bold text-lg">30-45 Minutes</div>
                  <div className="text-slate-400 text-sm">Professional Inspection</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-phoenix-500" />
                </div>
                <div>
                  <div className="font-bold text-lg">No Obligation</div>
                  <div className="text-slate-400 text-sm">Strict No-Pressure Policy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-3 p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Meeting Type Toggle */}
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMeetingType('in-person')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition ${meetingType === 'in-person' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Users className="w-5 h-5" /> In-Person
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingType('virtual')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition ${meetingType === 'virtual' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Video className="w-5 h-5" /> Virtual
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full bg-slate-50 border-2 ${errors.firstName ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:border-slate-900 outline-none transition font-medium`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-xs text-red-500 font-bold">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full bg-slate-50 border-2 ${errors.lastName ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:border-slate-900 outline-none transition font-medium`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && <p className="mt-1 text-xs text-red-500 font-bold">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-slate-50 border-2 ${errors.email ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:border-slate-900 outline-none transition font-medium`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500 font-bold">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-slate-50 border-2 ${errors.phone ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:border-slate-900 outline-none transition font-medium`}
                      placeholder="(616) 000-0000"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-500 font-bold">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Property Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    ref={addressRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full bg-slate-50 border-2 ${errors.address ? 'border-red-500' : 'border-slate-100'} rounded-2xl py-4 pl-12 pr-4 focus:border-slate-900 outline-none transition font-medium`}
                    placeholder="Start typing your address..."
                  />
                </div>
                {errors.address && <p className="mt-1 text-xs text-red-500 font-bold">{errors.address}</p>}
              </div>

              {meetingType === 'in-person' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-fade-in">
                  <div>
                    <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2 italic">Preferred Day</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full bg-white border-2 ${errors.date ? 'border-red-500' : 'border-slate-100'} rounded-xl py-3 pl-12 pr-4 focus:border-slate-900 outline-none transition font-bold`}
                      />
                    </div>
                    {errors.date && <p className="mt-1 text-xs text-red-500 font-bold">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2 italic">Time Window</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-12 pr-4 focus:border-slate-900 outline-none appearance-none transition font-bold"
                      >
                        <option>Morning (8am - 12pm)</option>
                        <option>Afternoon (1pm - 5pm)</option>
                        <option>Evening (5pm - 7pm)</option>
                        <option>Weekend Request</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Project Notes (Optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-slate-900 outline-none transition font-medium resize-none"
                    placeholder="Tell us about your roof issues..."
                  />
                </div>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex gap-3 animate-shake">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-bold">
                    Please fill out all required fields before submitting.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-slate-900 text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {meetingType === 'virtual' ? 'Pick a Time on Calendar' : 'Request Free Inspection'}
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
