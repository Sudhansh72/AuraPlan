import React, { useState } from 'react';
import type { BudgetItem } from '../types/plan';
import { Edit2, Check, X } from 'lucide-react';

interface BudgetTableProps {
  budget: BudgetItem[];
  onUpdate?: (updatedBudget: BudgetItem[]) => void;
  isEditable?: boolean;
}

const BudgetTable: React.FC<BudgetTableProps> = ({ budget, onUpdate, isEditable = true }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const totalCost = budget.reduce((sum, item) => sum + item.estimated_cost, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const handleEdit = (index: number, value: number) => {
    setEditingIndex(index);
    setEditValue(value.toString());
  };

  const handleSave = (index: number) => {
    if (!onUpdate) return;
    const newBudget = [...budget];
    newBudget[index] = {
      ...newBudget[index],
      estimated_cost: parseFloat(editValue) || 0
    };
    onUpdate(newBudget);
    setEditingIndex(null);
  };

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sector</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Allocation</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Telemetry</th>
              {isEditable && <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right w-20">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {budget.map((item, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6 text-sm font-black text-white">{item.item}</td>
                <td className="px-8 py-6">
                  <span className="inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.category}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-white text-right font-mono">
                  {editingIndex === index ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-32 bg-slate-900 border border-indigo-500/50 rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      autoFocus
                    />
                  ) : (
                    formatCurrency(item.estimated_cost)
                  )}
                </td>
                <td className="px-8 py-6 text-xs text-slate-400 font-medium max-w-xs">{item.notes}</td>
                {isEditable && (
                  <td className="px-8 py-6 text-right">
                    {editingIndex === index ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSave(index)} className="text-green-400 hover:text-green-300 transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingIndex(null)} className="text-pink-400 hover:text-pink-300 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEdit(index, item.estimated_cost)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white">
              <td colSpan={2} className="px-8 py-8 text-xl font-black uppercase tracking-tighter">Aggregated Load</td>
              <td className="px-8 py-8 text-2xl font-black text-right font-mono tracking-tighter">{formatCurrency(totalCost)}</td>
              <td colSpan={isEditable ? 2 : 1} className="px-8 py-8 text-[10px] font-black uppercase tracking-widest opacity-70 italic text-right">System Balanced</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default BudgetTable;
