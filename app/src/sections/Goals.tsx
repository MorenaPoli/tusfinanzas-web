import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Target, Trash2, Calendar } from 'lucide-react';
import { trpc } from '@/providers/trpc';

const GOAL_ICONS = ['🎯', '🚗', '🏠', '✈️', '📱', '💻', '🎓', '💍', '🏥', '👶', '🐶', '✨'];

export default function Goals() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: goals, isLoading } = trpc.goals.list.useQuery();
  const createGoal = trpc.goals.create.useMutation({
    onSuccess: () => { utils.goals.list.invalidate(); setShowForm(false); },
  });
  const deleteGoal = trpc.goals.delete.useMutation({
    onSuccess: () => utils.goals.list.invalidate(),
  });
  const updateProgress = trpc.goals.updateProgress.useMutation({
    onSuccess: () => utils.goals.list.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;
    createGoal.mutate({ name, targetAmount: target, deadline: deadline || undefined, icon });
    setName(''); setTarget(''); setDeadline(''); setIcon('🎯');
  };

  const totalTarget = goals?.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0) ?? 0;
  const totalCurrent = goals?.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0) ?? 0;
  const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
              <ArrowLeft size={20} className="text-white/60" />
            </button>
            <h1 className="font-bold text-lg">Metas de Ahorro</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] flex items-center justify-center shadow-[0_4px_20px_rgba(255,45,146,0.3)]">
            <Plus size={18} className="text-white" />
          </button>
        </div>

        {/* Progress */}
        {goals && goals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 rounded-2xl bg-[#1A1A1A] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40">Progreso general</span>
              <span className="text-xs font-semibold text-[#FF2D92]">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6]"
                initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1 }} />
            </div>
            <p className="text-xs text-white/30 mt-2">
              ${totalCurrent.toLocaleString('en-US')} de ${totalTarget.toLocaleString('en-US')} meta
            </p>
          </motion.div>
        )}

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit} className="overflow-hidden mb-6 space-y-3">
              <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/[0.06] space-y-3">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nombre de la meta (ej: Auto nuevo)"
                  className="w-full px-4 py-3 bg-[#111] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92]"
                  required />
                <div className="flex gap-3">
                  <input type="number" value={target} onChange={e => setTarget(e.target.value)}
                    placeholder="Monto meta ($)" min="1"
                    className="flex-1 px-4 py-3 bg-[#111] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92]"
                    required />
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#111] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#FF2D92]" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(i => (
                    <button key={i} type="button" onClick={() => setIcon(i)}
                      className={`w-8 h-8 rounded-lg text-sm ${icon === i ? 'bg-[#FF2D92]/20 border border-[#FF2D92]' : 'bg-white/[0.05] border border-transparent'} transition-colors`}>
                      {i}
                    </button>
                  ))}
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white font-semibold text-sm">
                  Crear meta
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Goals List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : goals?.length === 0 ? (
          <div className="text-center py-20">
            <Target size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-sm text-white/30 mb-2">Sin metas aún</p>
            <p className="text-xs text-white/20 mb-4">Crea tu primera meta de ahorro</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md"
            >
              <Plus size={14} /> Crear mi primera meta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals?.map((g, i) => {
              const pct = Math.min(100, (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100);
              return (
                <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{g.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{g.name}</p>
                        <p className="text-[10px] text-white/40">
                          ${parseFloat(g.currentAmount).toLocaleString()} / ${parseFloat(g.targetAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="+ Aportar $" className="w-24 px-2.5 py-1 bg-[#111] border border-white/[0.08] rounded-xl text-[10px] text-white focus:outline-none focus:border-[#FF2D92]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseFloat(e.currentTarget.value);
                            if (val > 0) {
                              const newAmount = (parseFloat(g.currentAmount) + val).toString();
                              updateProgress.mutate({ id: g.id, currentAmount: newAmount });
                              e.currentTarget.value = '';
                            }
                          }
                        }} />
                      <button onClick={() => deleteGoal.mutate({ id: g.id })}
                        className="p-1.5 rounded-lg hover:bg-[#FF4D6A]/10 transition-colors">
                        <Trash2 size={14} className="text-white/20 hover:text-[#FF4D6A]" />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-white/30">{pct.toFixed(0)}% completado</span>
                    {g.deadline && (
                      <span className="text-[10px] text-white/30 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(g.deadline).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
