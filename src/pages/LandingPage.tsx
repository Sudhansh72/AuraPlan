import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, DollarSign, Globe, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden">
      {/* Background Glows */}
      <div className="glow-bg">
        <div className="glow-orb w-[500px] h-[500px] bg-indigo-600/20 top-[-100px] left-[-100px]" />
        <div className="glow-orb w-[600px] h-[600px] bg-pink-600/10 bottom-[-200px] right-[-100px]" />
        <div className="glow-orb w-[400px] h-[400px] bg-purple-600/10 top-[20%] right-[10%]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in backdrop-blur-sm">
            <Sparkles size={14} />
            The Future of Event Curation
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
            Architect your next <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
              Masterpiece
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed font-medium">
            AuraPlan blends deep AI intelligence with artistic vision to curate 
            events that aren't just planned—they're engineered for perfection.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/planner" 
              className="group relative px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
            >
              Initialize Planner
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/dashboard" 
              className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center"
            >
              Explore Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Core Intelligence</h2>
            <p className="text-slate-400 max-w-xl mx-auto font-medium">Our neural network handles the complexity, giving you back the creative freedom.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard 
              icon={<Calendar className="text-indigo-400" size={28} />}
              title="Dynamic Itinerary"
              description="Real-time flow optimization that adapts to your event's unique rhythm."
              color="indigo"
            />
            <BenefitCard 
              icon={<DollarSign className="text-pink-400" size={28} />}
              title="Budget Matrix"
              description="Precision allocation using predictive market data for maximum ROI."
              color="pink"
            />
            <BenefitCard 
              icon={<Sparkles className="text-purple-400" size={28} />}
              title="Neural Matching"
              description="AI-vetted vendors that align perfectly with your aesthetic DNA."
              color="purple"
            />
            <BenefitCard 
              icon={<Globe className="text-blue-400" size={28} />}
              title="Ethos Aware"
              description="Deep cultural intelligence integrated into every logistical decision."
              color="blue"
            />
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">© 2026 AuraPlan System • v1.0.42</p>
        </div>
      </footer>
    </div>
  );
};

const BenefitCard: React.FC<{ icon: React.ReactNode, title: string, description: string, color: string }> = ({ icon, title, description, color }) => (
  <div className="glass-card group p-8 rounded-[2rem] hover:bg-white/5 transition-all duration-500 cursor-default">
    <div className={`w-16 h-16 rounded-2xl bg-${color}-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed font-medium">{description}</p>
  </div>
);

export default LandingPage;
