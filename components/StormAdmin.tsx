
import React, { useState } from 'react';
import { ShieldAlert, Plus, Save, Trash2, ArrowLeft, Image as ImageIcon, Video, MapPin, Calendar, Zap, FileText, AlertTriangle } from 'lucide-react';
import { ViewState } from '../types';

interface StormAdminProps {
  onNavigate: (view: ViewState) => void;
}

export const StormAdmin: React.FC<StormAdminProps> = ({ onNavigate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    city: '',
    date: '',
    hailSize: '',
    description: '',
    radarImage: '',
    videoEmbed: '',
    affectedAreas: '',
    slug: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.city.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + formData.date.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        hail_size: formData.hailSize,
        radar_image: formData.radarImage,
        video_embed: formData.videoEmbed,
        affected_areas: formData.affectedAreas.split(',').map(s => s.trim()).filter(Boolean)
      };

      const response = await fetch('/api/storm-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage({ text: 'Storm landing page created successfully!', type: 'success' });
        setFormData({
            city: '',
            date: '',
            hailSize: '',
            description: '',
            radarImage: '',
            videoEmbed: '',
            affectedAreas: '',
            slug: ''
        });
      } else {
        const error = await response.json();
        setMessage({ text: error.error || 'Failed to create storm page.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-lg">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase italic leading-none">Storm Template <span className="text-red-600">Admin</span></h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Spin up new landing pages instantly</p>
            </div>
          </div>

          {message.text && (
            <div className={`p-6 rounded-2xl mb-10 font-bold flex items-center gap-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.type === 'success' ? <Zap className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-6">Storm City/Name</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="e.g. Jenison / Hudsonville"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:border-red-600 outline-none transition font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-6">Storm Date</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    placeholder="e.g. March 10, 2026"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:border-red-600 outline-none transition font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-6">Hail Size</label>
                <div className="relative">
                  <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    value={formData.hailSize}
                    onChange={(e) => setFormData({...formData, hailSize: e.target.value})}
                    placeholder='e.g. 2"+'
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:border-red-600 outline-none transition font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-6">URL Slug (Optional)</label>
                <div className="relative">
                  <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="e.g. jenison-hail-march-2026"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:border-red-600 outline-none transition font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-6">Radar Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    value={formData.radarImage}
                    onChange={(e) => setFormData({...formData, radarImage: e.target.value})}
                    placeholder="https://example.com/map.jpg"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:border-red-600 outline-none transition font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-6">Video Embed URL</label>
                <div className="relative">
                  <Video className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    value={formData.videoEmbed}
                    onChange={(e) => setFormData({...formData, videoEmbed: e.target.value})}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:border-red-600 outline-none transition font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-6">Affected Areas (Comma Separated)</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    value={formData.affectedAreas}
                    onChange={(e) => setFormData({...formData, affectedAreas: e.target.value})}
                    placeholder="Jenison, Hudsonville, Georgetown"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:border-red-600 outline-none transition font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-6">Storm Description</label>
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief 2-3 sentence overview..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl py-6 px-6 focus:border-red-600 outline-none transition font-bold"
              ></textarea>
            </div>

            <div className="md:col-span-2 mt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-950 hover:bg-red-600 text-white rounded-[2rem] py-8 font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? 'CREATING...' : <><Plus className="w-6 h-6" /> Create Storm landing Page</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
