import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlannerFormData, EventRequest } from '../types/plan';
import { Sparkles, Loader2, AlertCircle, Terminal, Cpu, Database, Activity, RefreshCcw } from 'lucide-react';
import { generatePlan } from '../api/planService';

const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PlannerFormData>({
    eventType: '',
    location: '',
    date: '',
    time: '',
    guestCount: '',
    budget: '',
    theme: '',
    culturalPreference: '',
    dietaryConstraints: '',
    specialNotes: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PlannerFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Partial<Record<keyof PlannerFormData, string>> = {};
    if (!formData.eventType) newErrors.eventType = 'FIELD_REQUIRED: EVENT_TYPE';
    if (!formData.location) newErrors.location = 'FIELD_REQUIRED: LOCATION_COORDS';
    if (!formData.date) newErrors.date = 'FIELD_REQUIRED: TEMPORAL_MARKER';
    if (!formData.guestCount) newErrors.guestCount = 'FIELD_REQUIRED: ENTITY_DENSITY';
    if (!formData.budget) newErrors.budget = 'FIELD_REQUIRED: RESOURCE_CAP';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof PlannerFormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof PlannerFormData];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const requestData: EventRequest = {
        event_type: formData.eventType,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        guest_count: parseInt(formData.guestCount),
        budget: parseFloat(formData.budget),
        theme_preference: formData.theme || undefined,
        cultural_preference: formData.culturalPreference || undefined,
        dietary_constraints: formData.dietaryConstraints || undefined,
        special_notes: formData.specialNotes || undefined,
      };

      const plan = await generatePlan(requestData);
      navigate('/dashboard', { state: { plan } });
    } catch (err: any) {
      console.error('API Error:', err);
      setApiError(err.response?.data?.detail || 'CONNECTION_FAILURE: Neural link interrupted. Please retry sequence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pt-12 pb-24 relative overflow-hidden">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-t-4 border-l-4 border-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={40} className="text-white animate-pulse" />
            </div>
          </div>
          <h2 className="mt-8 text-2xl font-black text-white uppercase tracking-[0.3em]">Calibrating Neural Engine</h2>
          <p className="mt-2 text-indigo-400 font-mono text-xs uppercase tracking-widest animate-pulse">Constructing temporal flow & resource matrices...</p>
        </div>
      )}

      {/* Background Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <header className="mb-12 border-l-4 border-indigo-500 pl-6">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Terminal size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Configuration Module</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Initialize Mission</h1>
          <p className="text-slate-500 font-medium text-sm">Input event parameters to calibrate the AuraPlan neural engine.</p>
        </header>

        {apiError && (
          <div className="mb-8 p-6 bg-pink-500/10 border border-pink-500/30 rounded-2xl flex items-center gap-4 text-pink-500 animate-fade-in">
            <AlertCircle size={24} />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest">System Error</p>
              <p className="text-sm font-bold">{apiError}</p>
            </div>
            <button 
              onClick={() => setApiError(null)}
              className="p-2 hover:bg-pink-500/20 rounded-lg transition-colors"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Parameters */}
          <AstroCard title="Primary Core Parameters" icon={<Cpu size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AstroField label="Event Designation" error={errors.eventType}>
                <input
                  type="text"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  placeholder="ENGAGEMENT_PARTY"
                  className={astroInputClasses(!!errors.eventType)}
                />
              </AstroField>

              <AstroField label="Node Location" error={errors.location}>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="TORONTO_ON"
                  className={astroInputClasses(!!errors.location)}
                />
              </AstroField>

              <AstroField label="Temporal Marker" error={errors.date}>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={astroInputClasses(!!errors.date)}
                />
              </AstroField>

              <AstroField label="Start Time (UTC)">
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={astroInputClasses(false)}
                />
              </AstroField>

              <AstroField label="Entity Density" error={errors.guestCount}>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  placeholder="40"
                  className={astroInputClasses(!!errors.guestCount)}
                />
              </AstroField>

              <AstroField label="Resource Allocation (CAD)" error={errors.budget}>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="3000.00"
                  className={astroInputClasses(!!errors.budget)}
                />
              </AstroField>
            </div>
          </AstroCard>

          {/* Secondary Intelligence */}
          <AstroCard title="Secondary Intelligence" icon={<Database size={18} />}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AstroField label="Aesthetic DNA / Theme">
                  <input
                    type="text"
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    placeholder="MODERN_INDUSTRIAL"
                    className={astroInputClasses(false)}
                  />
                </AstroField>

                <AstroField label="Cultural Protocol">
                  <input
                    type="text"
                    name="culturalPreference"
                    value={formData.culturalPreference}
                    onChange={handleChange}
                    placeholder="FUSION_PROTOCOL"
                    className={astroInputClasses(false)}
                  />
                </AstroField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AstroField label="Bio-Constraints / Dietary">
                  <input
                    type="text"
                    name="dietaryConstraints"
                    value={formData.dietaryConstraints}
                    onChange={handleChange}
                    placeholder="VEGAN_ADAPTED"
                    className={astroInputClasses(false)}
                  />
                </AstroField>
                <AstroField label="Special Directives">
                  <input
                    type="text"
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={handleChange}
                    placeholder="SURPRISE_SEQUENCE_L7"
                    className={astroInputClasses(false)}
                  />
                </AstroField>
              </div>
            </div>
          </AstroCard>

          {/* System Status / Submit */}
          <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
            <div className="flex-1 glass-card rounded-2xl p-4 flex items-center gap-4 border-indigo-500/20">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Activity size={20} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Engine Status</p>
                <p className="text-xs font-bold text-white uppercase font-mono">Standby • Ready for sequence</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-indigo-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 uppercase tracking-tighter"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Calibrating...
                </>
              ) : (
                <>
                  Execute Plan
                  <Sparkles size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AstroCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="glass-card rounded-[1.5rem] overflow-hidden border-white/5 shadow-2xl">
    <div className="bg-white/5 px-8 py-4 border-b border-white/5 flex items-center gap-3">
      <div className="text-indigo-400">{icon}</div>
      <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h2>
    </div>
    <div className="p-8">
      {children}
    </div>
  </div>
);

const AstroField: React.FC<{ label: string, children: React.ReactNode, error?: string }> = ({ label, children, error }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    {children}
    {error && (
      <span className="text-[10px] text-pink-500 font-black flex items-center gap-1.5 mt-1 ml-1 uppercase tracking-tight animate-fade-in">
        <AlertCircle size={12} />
        {error}
      </span>
    )}
  </div>
);

const astroInputClasses = (hasError: boolean) => `
  w-full px-4 py-3 bg-slate-900 border font-mono text-sm transition-all outline-none rounded-xl
  placeholder:text-slate-700 text-white
  ${hasError 
    ? 'border-pink-500/50 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.1)]' 
    : 'border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-slate-800'}
`;

export default PlannerPage;
