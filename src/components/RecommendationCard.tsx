import React from 'react';
import type { Recommendation } from '../types/plan';
import { ArrowUpRight, ExternalLink, Star, Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const handleClick = () => {
    if (recommendation.source_url) {
      window.open(recommendation.source_url, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="glass-card group p-0 rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col h-full border-white/5 hover:border-indigo-500/30 shadow-2xl"
    >
      {/* Image Header */}
      {recommendation.image_url ? (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={recommendation.image_url} 
            alt={recommendation.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
          <div className="absolute top-4 left-4">
            <span className="inline-block px-3 py-1 rounded-lg bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              {recommendation.type}
            </span>
          </div>
          {recommendation.rating && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black flex items-center gap-1.5">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              GRADE {recommendation.rating}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 pb-0">
          <div className="flex items-start justify-between mb-4">
            <span className="inline-block px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {recommendation.type}
            </span>
            {recommendation.rating && (
              <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black flex items-center gap-1.5">
                <Star size={10} className="text-amber-400 fill-amber-400" />
                GRADE {recommendation.rating}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="p-8 flex-1 flex flex-col">
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500 z-20">
          {recommendation.source_url ? <ExternalLink className="text-white" size={24} /> : <ArrowUpRight className="text-white" size={24} />}
        </div>
        
        <h3 className="text-2xl font-black text-white mb-4 tracking-tighter group-hover:text-indigo-400 transition-colors">
          {recommendation.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed font-medium line-clamp-3">
          {recommendation.description}
        </p>
        
        {recommendation.specialties && recommendation.specialties.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {recommendation.specialties.map((s, i) => (
              <span key={i} className="text-[9px] font-bold text-slate-500 uppercase border border-slate-800 px-2 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Aura Insights Section */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Aura Insight</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            {recommendation.type === 'Venue' ? 'Consider this space for its architectural synergy with your theme. Optimal for high-impact lighting installations.' : 
             recommendation.type === 'Catering' ? 'Pair this menu with signature botanical cocktails to enhance the sensory experience.' :
             'This entity aligns with your aesthetic DNA. We recommend early calibration to secure temporal slot.'}
          </p>
        </div>

        <div className="mt-auto pt-8 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Vetted</span>
            {recommendation.location && (
              <span className="text-[10px] font-bold text-indigo-400/70 uppercase mt-0.5">{recommendation.location}</span>
            )}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
