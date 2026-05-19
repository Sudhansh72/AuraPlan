import React, { useState } from 'react';
import type { ItineraryItem } from '../types/plan';
import { Clock, Edit2, Check, X, MapPin, Sparkles, Coffee, Utensils, Music, Camera, GlassWater, DoorOpen } from 'lucide-react';

interface TimelineProps {
  items: ItineraryItem[];
  onUpdate?: (updatedItems: ItineraryItem[]) => void;
  isEditable?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ items, onUpdate, isEditable = true }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<ItineraryItem | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditData({ ...items[index] });
  };

  const handleSave = () => {
    if (onUpdate && editData && editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = editData;
      onUpdate(newItems);
    }
    setEditingIndex(null);
    setEditData(null);
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('arrival') || t.includes('door')) return <DoorOpen size={18} />;
    if (t.includes('welcome') || t.includes('opening')) return <Sparkles size={18} />;
    if (t.includes('dining') || t.includes('dinner') || t.includes('lunch') || t.includes('gourmet')) return <Utensils size={18} />;
    if (t.includes('music') || t.includes('dance') || t.includes('dj')) return <Music size={18} />;
    if (t.includes('photo')) return <Camera size={18} />;
    if (t.includes('drink') || t.includes('toast') || t.includes('cocktail')) return <GlassWater size={18} />;
    if (t.includes('speech')) return <Coffee size={18} />;
    return <Clock size={18} />;
  };

  return (
    <div className="relative space-y-2">
      {/* Decorative vertical track */}
      <div className="absolute left-[2.25rem] top-8 bottom-8 w-px bg-white/10 hidden md:block" />
      
      {items.map((item, index) => (
        <div key={index} className="group relative flex flex-col md:flex-row gap-6 md:gap-12 p-6 md:p-8 rounded-[1.5rem] hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
          
          {/* Temporal Label (Left Side) */}
          <div className="flex items-center md:items-start gap-4 md:w-32 pt-1 relative z-10">
            <div className="md:hidden w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Clock size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] font-mono">{item.time}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">Checkpoint T+{index}</span>
            </div>
          </div>

          {/* Center Connector (Desktop) */}
          <div className="hidden md:flex flex-col items-center relative pt-1">
            <div className={`w-10 h-10 rounded-xl bg-slate-900 border transition-all duration-500 flex items-center justify-center z-10 
              ${editingIndex === index ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'border-white/10 group-hover:border-indigo-500/50 group-hover:scale-110'}
            `}>
              <div className="text-indigo-400">
                {getIcon(item.title)}
              </div>
            </div>
            {index !== items.length - 1 && (
              <div className="w-px flex-1 bg-gradient-to-b from-indigo-500/50 to-transparent mt-4" />
            )}
          </div>

          {/* Content (Right Side) */}
          <div className="flex-1 space-y-2 relative z-10">
            {editingIndex === index && editData ? (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Time Marker</label>
                    <input
                      type="text"
                      value={editData.time}
                      onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Directive Details</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:border-indigo-500 outline-none h-24"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-black uppercase hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                    <Check size={14} /> Commit
                  </button>
                  <button onClick={() => setEditingIndex(null)} className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-400 rounded-lg text-xs font-black uppercase hover:bg-pink-500/20 transition-all border border-pink-500/20">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase italic group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-2xl">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                      <MapPin size={10} className="text-indigo-500/50" />
                      Sector Optimized
                    </div>
                  </div>
                </div>
                
                {isEditable && (
                  <button 
                    onClick={() => handleEdit(index)}
                    className="self-end md:self-start opacity-0 group-hover:opacity-100 p-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all shadow-xl"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
