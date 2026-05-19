import React, { useState, useRef, useEffect } from 'react';
import type { EventPlan, Recommendation } from '../types/plan';
import type { BotMode, VendorMatch, ResourceImage } from '../types/bot';
import { Send, User, Bot, Loader2, Sparkles, MapPin, DollarSign, ExternalLink, AlertCircle, Plus } from 'lucide-react';
import { sendBotMessage } from '../api/botService';
import { useNavigate } from 'react-router-dom';

interface ChatPanelProps {
  eventContext?: EventPlan | null;
  planId?: string | null;
  onAddRecommendation?: (rec: Recommendation) => void;
  onApplyUpdate?: (updatedPlan: EventPlan) => void;
}

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  vendors?: VendorMatch[];
  images?: ResourceImage[];
  notes?: string | null;
}

const MODES: { value: BotMode; label: string }[] = [
  { value: 'planner', label: 'Planner' },
  { value: 'budget', label: 'Budget' },
  { value: 'vendors', label: 'Vendors' },
  { value: 'food', label: 'Food' },
  { value: 'decor', label: 'Decor' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'culture', label: 'Culture' }
];

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'B': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'C': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'D': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'F': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const ChatPanel: React.FC<ChatPanelProps> = ({ eventContext, planId, onAddRecommendation, onApplyUpdate }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Neural link established. I am Aura. Your event architecture is ready for fine-tuning. What shall we modify?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleAddVendor = (vendor: VendorMatch) => {
    if (onAddRecommendation) {
      onAddRecommendation({
        type: vendor.type,
        title: vendor.name,
        description: vendor.description,
        location: vendor.location,
        estimated_price: vendor.estimated_price_range,
        rating: vendor.sentiment_grade,
        review_snippet: vendor.review_snippet,
        source_url: vendor.source_url,
        image_url: vendor.image_url,
        specialties: [vendor.type, "Bot Discovered"]
      });
    }
  };

  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<BotMode>('planner');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setError(null);

    try {
      const response = await sendBotMessage({
        message: userText,
        bot_mode: activeMode,
        event_context: eventContext,
        plan_id: planId,
        location: eventContext?.theme_summary?.location
      });

      const assistantMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.bot_response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vendors: response.matched_vendors,
        images: response.resource_images,
        notes: response.notes
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.plan_update && onApplyUpdate) {
        onApplyUpdate(response.plan_update as EventPlan);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Communication link unstable. Neural processing failed.');
      }
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] glass-card rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl relative">
      {/* Header */}
      <div className="px-8 py-6 bg-white/5 border-b border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-indigo-500 rounded-full blur opacity-20 animate-pulse" />
              <div className="relative w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                <Bot size={22} className="text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-white">Aura Core</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Active Link</span>
              </div>
            </div>
          </div>
          <Sparkles size={18} className="text-indigo-400/50" />
        </div>
        
        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2">
          {MODES.map(mode => (
            <button
              key={mode.value}
              onClick={() => setActiveMode(mode.value)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all border ${
                activeMode === mode.value
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-transparent">
        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border ${
                msg.role === 'user' 
                  ? 'bg-white/5 border-white/10 text-white' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="space-y-2">
                <div className={`p-5 rounded-3xl text-sm leading-relaxed font-medium shadow-lg whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-white text-slate-950 rounded-tr-none' 
                    : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none backdrop-blur-md'
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[10px] font-black text-slate-500 uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>

            {/* Vendor Cards */}
            {msg.vendors && msg.vendors.length > 0 && (
              <div className="w-full pl-14 space-y-3">
                {msg.notes && (
                  <p className="text-xs text-amber-400 font-medium italic">{msg.notes}</p>
                )}
                {msg.vendors.map((vendor, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group/vcard">
                    {vendor.image_url && (
                      <div className="h-32 w-full overflow-hidden relative">
                        <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover transition-transform group-hover/vcard:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      </div>
                    )}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm">{vendor.name}</h4>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <MapPin size={12} /> {vendor.location} • {vendor.type}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getGradeColor(vendor.sentiment_grade)}`}>
                          Grade {vendor.sentiment_grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{vendor.description}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                            <DollarSign size={12} /> {vendor.estimated_price_range}
                          </span>
                          {onAddRecommendation && (
                            <button 
                              onClick={() => handleAddVendor(vendor)}
                              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all group/add"
                              title="Add to Vetted Entities"
                            >
                              <Plus size={14} className="group-hover/add:rotate-90 transition-transform" />
                            </button>
                          )}
                        </div>
                        {vendor.source_url && (
                          <a href={vendor.source_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            View <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resource Images */}
            {msg.images && msg.images.length > 0 && (
              <div className="w-full pl-14 grid grid-cols-2 gap-3 mt-2">
                {msg.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-900 border border-white/10 aspect-video">
                    <img src={img.image_url} alt={img.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    {img.source_url && (
                      <a href={img.source_url} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-lg backdrop-blur-sm text-white hover:bg-black/80 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
            <div className="flex gap-4 items-center text-indigo-400 bg-indigo-500/5 px-6 py-3 rounded-full border border-indigo-500/10 backdrop-blur-md">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Neural Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 bg-white/5 border-t border-white/10 backdrop-blur-xl">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Instruct Aura in ${MODES.find(m => m.value === activeMode)?.label} mode...`}
            className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all"
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="absolute right-2 p-3 bg-white text-slate-950 rounded-xl hover:bg-indigo-400 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/5"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
