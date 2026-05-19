import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { mockPlan } from '../data/mockPlan';
import ThemeSummaryCard from '../components/ThemeSummaryCard';
import Timeline from '../components/Timeline';
import BudgetTable from '../components/BudgetTable';
import RecommendationCard from '../components/RecommendationCard';
import ChatPanel from '../components/ChatPanel';
import { MessageSquare, LayoutDashboard, Calendar, DollarSign, Lightbulb, Sparkles, Eye, Loader2, Save, CheckCircle2 } from 'lucide-react';
import type { EventPlan, BudgetItem, ThemeSummary, ItineraryItem, Recommendation } from '../types/plan';
import { getPlanHistory, updatePlan, optimizePlan } from '../api/planService';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  useEffect(() => {
    const loadPlan = async () => {
      // 1. Try to get plan from location state
      const stateData = (location.state as any);
      if (stateData?.plan) {
        // If it's an EventHistoryItem (from generatePlan)
        if (stateData.plan.id && stateData.plan.generated_plan_json) {
          setPlan(stateData.plan.generated_plan_json);
          setEventId(stateData.plan.id);
        } else {
          // Fallback for direct plan object
          setPlan(stateData.plan);
        }
        setIsLoading(false);
        return;
      }

      // 2. If no state, try to fetch from history
      try {
        const history = await getPlanHistory();
        if (history && history.length > 0) {
          // Use the newest event's plan
          setPlan(history[0].generated_plan_json);
          setEventId(history[0].id);
          setIsPreview(false);
        } else {
          // 3. Fallback to mockPlan if no history
          setPlan(mockPlan);
          setIsPreview(true);
        }
      } catch (error) {
        console.error('Failed to fetch plan history:', error);
        setPlan(mockPlan);
        setIsPreview(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [location.state]);

  const handleBudgetUpdate = (newBudget: BudgetItem[]) => {
    if (!plan) return;
    setPlan({ ...plan, budget_matrix: newBudget });
    setIsModified(true);
  };

  const handleThemeUpdate = (newSummary: ThemeSummary, newGuestCount?: number, newBudgetTarget?: number) => {
    if (!plan) return;
    const updatedPlan = { ...plan, theme_summary: newSummary };
    if (newGuestCount !== undefined) updatedPlan.guest_count = newGuestCount;
    if (newBudgetTarget !== undefined) updatedPlan.budget_target = newBudgetTarget;
    setPlan(updatedPlan);
    setIsModified(true);
  };

  const handleItineraryUpdate = (newItinerary: ItineraryItem[]) => {
    if (!plan) return;
    setPlan({ ...plan, itinerary: newItinerary });
    setIsModified(true);
  };

  const handleAddRecommendation = (rec: Recommendation) => {
    if (!plan) return;
    setPlan({ 
      ...plan, 
      recommendations: [rec, ...plan.recommendations] 
    });
    setIsModified(true);
  };

  const handleApplyUpdate = (updatedPlan: EventPlan) => {
    setPlan(updatedPlan);
    setIsModified(true);
  };

  const handleSave = async () => {
    if (!eventId || !plan || isSaving) return;
    
    setIsSaving(true);
    try {
      await updatePlan(eventId, {
        generated_plan_json: plan,
        budget: plan.budget_matrix.reduce((sum, item) => sum + item.estimated_cost, 0),
        theme_preference: plan.theme_summary.vibe,
        guest_count: plan.guest_count
      });
      setIsModified(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Failed to save changes. System link unstable.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptimize = async (instruction?: string) => {
    if (!plan || isOptimizing) return;
    
    setIsOptimizing(true);
    try {
      const optimized = await optimizePlan(plan, instruction);
      setPlan(optimized);
      setIsModified(true);
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Aura is currently over capacity. Neural optimization failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateBlueprint = () => {
    handleOptimize("Generate a detailed architectural blueprint and spatial layout for this event.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Retrieving Roadmap...</h2>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 relative">
       {/* Background Glows */}
       <div className="glow-bg">
        <div className="glow-orb w-[600px] h-[600px] bg-indigo-600/10 top-[-100px] right-[-100px]" />
        <div className="glow-orb w-[500px] h-[500px] bg-pink-600/5 bottom-[-100px] left-[-100px]" />
      </div>

      {/* Header */}
      <header className="pt-24 pb-12 mb-12 relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                  <Sparkles size={12} />
                  AI Strategy Generated
                </div>
                {isPreview && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                    <Eye size={12} />
                    Preview Mode
                  </div>
                )}
                {isModified && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                    Unsaved Local Changes
                  </div>
                )}
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Event Roadmap</h1>
              <p className="text-slate-400 mt-3 font-medium text-lg">Your bespoke architectural plan for <span className="text-indigo-400">{plan.theme_summary.title}</span></p>
            </div>
            <div className="flex items-center gap-4">
              {!isPreview && (
                <button 
                  onClick={() => handleOptimize()}
                  disabled={isOptimizing}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-indigo-400 border border-indigo-500/30 font-black text-sm uppercase tracking-wider hover:bg-indigo-500/10 transition-all disabled:opacity-50"
                >
                  {isOptimizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Optimize with Aura
                </button>
              )}
              {isModified && (
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-500 text-white font-black text-sm uppercase tracking-wider hover:bg-indigo-400 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Commit Changes
                </button>
              )}
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-widest animate-fade-in">
                  <CheckCircle2 size={18} />
                  Synchronized
                </div>
              )}
              <button 
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${
                  showChat 
                    ? 'bg-white text-slate-950 shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                <MessageSquare size={18} />
                {showChat ? 'Close Assistant' : 'Neural Chat'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className={`${showChat ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-16 transition-all duration-500`}>
            
            {/* Theme Summary */}
            <section className="animate-fade-in">
              <SectionHeader icon={<LayoutDashboard size={20} />} title="Concept Ethos" />
              <ThemeSummaryCard 
                summary={plan.theme_summary} 
                guestCount={plan.guest_count}
                budgetTarget={plan.budget_target}
                blueprintUrl={plan.blueprint_url}
                onUpdate={handleThemeUpdate}
                onGenerateBlueprint={handleGenerateBlueprint}
                isEditable={!isPreview}
              />
            </section>

            {/* Itinerary */}
            <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <SectionHeader icon={<Calendar size={20} />} title="Temporal Flow" />
              <div className="glass-card rounded-[2.5rem] p-10">
                <Timeline 
                  items={plan.itinerary} 
                  onUpdate={handleItineraryUpdate}
                  isEditable={!isPreview}
                />
              </div>
            </section>

            {/* Budget */}
            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <SectionHeader icon={<DollarSign size={20} />} title="Financial Matrix" />
              <BudgetTable 
                budget={plan.budget_matrix} 
                onUpdate={handleBudgetUpdate}
                isEditable={!isPreview}
              />
            </section>

            {/* Recommendations */}
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <SectionHeader icon={<Lightbulb size={20} />} title="Vetted Entities" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plan.recommendations.map((rec, index) => (
                  <RecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Chat */}
          {showChat && (
            <aside className="lg:col-span-4 sticky top-28 h-fit animate-fade-in">
              <ChatPanel 
                eventContext={plan} 
                planId={eventId} 
                onAddRecommendation={handleAddRecommendation}
                onApplyUpdate={handleApplyUpdate}
              />
              <div className="mt-8 p-8 glass-card rounded-[2rem] border-indigo-500/20">
                <h4 className="text-sm font-black text-indigo-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <Lightbulb size={16} />
                  System Insight
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  The current plan is optimized for a <span className="text-white font-bold">{plan.guest_count}-guest density</span>. You can instruct the assistant to "re-scale for {Math.round(plan.guest_count * 1.5)}" to adjust all matrices.
                </p>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Mobile Chat Toggle */}
      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="lg:hidden fixed bottom-8 right-8 w-16 h-16 bg-white text-slate-950 rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner">
      {icon}
    </div>
    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-6" />
  </div>
);

export default DashboardPage;


