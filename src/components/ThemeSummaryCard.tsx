import React, { useState } from 'react';
import type { ThemeSummary } from '../types/plan';
import { Edit2, Check, X, Sparkles } from 'lucide-react';

interface ThemeSummaryCardProps {
  summary: ThemeSummary;
  guestCount: number;
  budgetTarget: number;
  blueprintUrl?: string | null;
  onUpdate?: (updatedSummary: ThemeSummary, updatedGuestCount?: number, updatedBudgetTarget?: number) => void;
  onGenerateBlueprint?: () => void;
  isEditable?: boolean;
}

const ThemeSummaryCard: React.FC<ThemeSummaryCardProps> = ({ summary, guestCount, budgetTarget, blueprintUrl, onUpdate, onGenerateBlueprint, isEditable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ThemeSummary>(summary);
  const [editGuestCount, setEditGuestCount] = useState<number>(guestCount);
  const [editBudgetTarget, setEditBudgetTarget] = useState<number>(budgetTarget);

  const handleSave = () => {
    if (onUpdate) onUpdate(editData, editGuestCount, editBudgetTarget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(summary);
    setEditGuestCount(guestCount);
    setEditBudgetTarget(budgetTarget);
    setIsEditing(false);
  };

  return (
    <div className="glass-card rounded-[2rem] p-10 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 rounded-full blur-3xl -z-0 group-hover:scale-110 transition-transform duration-700" />
      
      {isEditable && !isEditing && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-8 right-8 p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all z-20 opacity-0 group-hover:opacity-100"
        >
          <Edit2 size={18} />
        </button>
      )}

      {isEditing && (
        <div className="absolute top-8 right-8 flex gap-2 z-20">
          <button onClick={handleSave} className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
            <Check size={18} />
          </button>
          <button onClick={handleCancel} className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 transition-all">
            <X size={18} />
          </button>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-6 max-w-3xl">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Title</span>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="text-4xl font-black text-white bg-slate-900 border border-indigo-500/30 rounded-xl px-4 py-2 w-full outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Concept Strategy</span>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="text-lg leading-relaxed text-slate-300 bg-slate-900 border border-indigo-500/30 rounded-xl px-4 py-2 w-full h-32 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black text-white mb-6 tracking-tighter leading-tight">{summary.title}</h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium max-w-3xl">{summary.description}</p>
              </>
            )}
          </div>
          
          <div className="lg:w-1/3 flex flex-col gap-6">
            {blueprintUrl ? (
              <div className="relative group/blueprint rounded-2xl overflow-hidden border border-white/10 aspect-square lg:aspect-video shadow-2xl">
                <img src={blueprintUrl} alt="Event Blueprint" className="w-full h-full object-cover opacity-80 group-hover/blueprint:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Architectural Blueprint</span>
                </div>
              </div>
            ) : (
              isEditable && onGenerateBlueprint && (
                <button 
                  onClick={onGenerateBlueprint}
                  className="w-full aspect-square lg:aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-4 transition-all group/gen"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover/gen:text-indigo-400 group-hover/gen:scale-110 transition-all">
                    <Sparkles size={24} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/gen:text-indigo-400">Initialize Blueprint</span>
                </button>
              )
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-10">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Vibe</span>
            {isEditing ? (
              <input
                type="text"
                value={editData.vibe}
                onChange={(e) => setEditData({ ...editData, vibe: e.target.value })}
                className="text-white text-xl font-bold tracking-tight bg-slate-900 border border-indigo-500/30 rounded-lg px-3 py-1 outline-none"
              />
            ) : (
              <span className="text-white text-xl font-bold tracking-tight">{summary.vibe}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em]">Geographic Node</span>
            <span className="text-white text-xl font-bold tracking-tight">{summary.location}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Entity Density</span>
            {isEditing ? (
              <input
                type="number"
                value={editGuestCount}
                onChange={(e) => setEditGuestCount(parseInt(e.target.value) || 0)}
                className="text-white text-xl font-bold tracking-tight bg-slate-900 border border-amber-500/30 rounded-lg px-3 py-1 outline-none"
              />
            ) : (
              <span className="text-white text-xl font-bold tracking-tight font-mono">{guestCount} Guests</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Resource Cap</span>
            {isEditing ? (
              <input
                type="number"
                value={editBudgetTarget}
                onChange={(e) => setEditBudgetTarget(parseFloat(e.target.value) || 0)}
                className="text-white text-xl font-bold tracking-tight bg-slate-900 border border-emerald-500/30 rounded-lg px-3 py-1 outline-none"
              />
            ) : (
              <span className="text-white text-xl font-bold tracking-tight font-mono">${budgetTarget.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSummaryCard;
