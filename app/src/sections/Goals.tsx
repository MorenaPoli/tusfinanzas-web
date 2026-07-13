import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Target, Trash2, Calendar } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import MiniKeypad from '@/components/MiniKeypad';

const GOAL_ICONS = ['🎯', '🚗', '🏠', '✈️', '📱', '💻', '🎓', '💍', '🏥', '👶', '🐶', '✨'];

const SUGGESTED_GOALS = [
  { name: 'Fondo de Emergencia (3 meses)', target: '150000', icon: '🎯' },
  { name: 'Viaje a las Cataratas / Bariloche', target: '350000', icon: '✈️' },
  { name: 'Cambiar el Celular', target: '200000', icon: '📱' },
  { name: 'Notebook para Programar', target: '450000', icon: '💻' },
  { name: 'Invertir en Acciones/CEDEARs', target: '80000', icon: '✨' },
  { name: 'Enganche para Departamento', target: '1200000', icon: '🏠' },
  { name: 'Curso de Especialización', target: '60000', icon: '🎓' },
  { name: 'Cambiar el Auto (Ahorro inicial)', target: '950000', icon: '🚗' },
  { name: 'Vacaciones de Verano', target: '250000', icon: '✈️' },
  { name: 'Bici Eléctrica / Monopatín', target: '180000', icon: '⚡' },
];

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

  const handleSuggestGoal = () => {
    const randomGoal = SUGGESTED_GOALS[Math.floor(Math.random() * SUGGESTED_GOALS.length)];
    setName(randomGoal.name);
    setTarget(randomGoal.target);
    setIcon(randomGoal.icon);
    // Set a date 6 months from now
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setDeadline(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;
    const targetVal = parseFloat(target);
    if (isNaN(targetVal) || targetVal <= 0) {
      alert("El monto de la meta debe ser mayor a 0.");
      return;
    }
    createGoal.mutate({ name, targetAmount: target, deadline: deadline || undefined, icon });
    setName(''); setTarget(''); setDeadline(''); setIcon('🎯');
  };

  const totalTarget = goals?.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0) ?? 0;
  const totalCurrent = goals?.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0) ?? 0;
  const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <div id="goals-panel" className="min-h-screen bg-transparent px-6 py-6">
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40">Progreso general</span>
              <span className="text-xs font-semibold text-[#FF2D92]">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6]"
                initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1 }} />
            </div>
            <p className="text-xs text-white/30 mt-2">
              ${totalCurrent.toLocaleString('en-US')} de ${totalTarget.toLocaleString('en-US')} de meta
            </p>
          </motion.div>
        )}

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit} className="overflow-hidden mb-6 space-y-3">
              <div className="p-5 rounded-2xl glass-card space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white/50">Nueva Meta de Ahorro</span>
                  <button
                    type="button"
                    onClick={handleSuggestGoal}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF2D92] hover:text-[#8B5CF6] transition-colors bg-white/5 px-2.5 py-1 rounded-lg border border-white/5"
                  >
                    ✨ Sugerir Meta
                  </button>
                </div>
                <div>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Nombre de la meta (ej: Auto nuevo)"
                    className="w-full px-4 py-3 glass rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92] transition-colors"
                    required />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-semibold">Monto y Fecha límite</span>
                    <button
                      type="button"
                      onClick={() => setShowKeypad(!showKeypad)}
                      className="text-[10px] text-[#FF2D92] font-semibold hover:underline"
                    >
                      {showKeypad ? 'Ocultar teclado' : 'Ver teclado numérico'}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <input type="number" value={target} onChange={e => setTarget(e.target.value)}
                      placeholder="Monto meta ($)" min="1"
                      className="flex-1 px-4 py-3 glass rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92] transition-colors"
                      required />
                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                      className="flex-1 px-4 py-3 glass rounded-xl text-sm text-white focus:outline-none focus:border-[#FF2D92] transition-colors" />
                  </div>
                  <AnimatePresence>
                    {showKeypad && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <MiniKeypad value={target} onChange={setTarget} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(i => (
                    <button key={i} type="button" onClick={() => setIcon(i)}
                      className={`w-8 h-8 rounded-lg text-sm transition-all ${icon === i ? 'bg-[#FF2D92]/20 border border-[#FF2D92] shadow-sm' : 'glass hover:bg-white/10'}`}>
                      {i}
                    </button>
                  ))}
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white font-semibold text-sm shadow-md shadow-[#FF2D92]/10">
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
          <div className="space-y-4">
            {/* Big Permanent CTA button card at the top of the list */}
            <motion.button
              onClick={() => {
                setShowForm(!showForm);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full p-4 rounded-2xl glass border border-dashed border-white/20 hover:border-[#FF2D92]/40 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2.5 text-xs font-bold text-white/70 hover:text-white"
            >
              <Plus size={16} className="text-[#FF2D92]" />
              Añadir Nueva Meta de Ahorro
            </motion.button>

            {goals?.map((g, i) => {
              const pct = Math.min(100, (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100);
              return (
                <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-2xl glass-card border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">{g.icon}</span>
                      <div>
                        <p className="text-base font-bold text-white leading-tight">{g.name}</p>
                        <p className="text-xs text-white/50 mt-1 font-medium">
                          ${parseFloat(g.currentAmount).toLocaleString()} <span className="text-white/30">de</span> ${parseFloat(g.targetAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="+ Aportar $" className="w-28 px-3 py-1.5 glass rounded-xl text-xs text-white focus:outline-none focus:border-[#FF2D92] transition-colors animate-pulse-slow font-semibold animate-pulse-slow"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseFloat(e.currentTarget.value);
                            if (isNaN(val) || val <= 0) {
                              alert("Por favor, ingresa un monto válido mayor a 0.");
                              return;
                            }
                            const current = parseFloat(g.currentAmount);
                            const target = parseFloat(g.targetAmount);
                            const left = target - current;
                            if (val > left) {
                              alert(`El aporte supera el monto faltante. Lo máximo que podés aportar es $${left.toLocaleString()}.`);
                              return;
                            }
                            const newAmount = (current + val).toString();
                            updateProgress.mutate({ id: g.id, currentAmount: newAmount });
                            e.currentTarget.value = '';
                          }
                        }} />
                      <button onClick={() => deleteGoal.mutate({ id: g.id })}
                        className="p-2 rounded-xl hover:bg-[#FF4D6A]/10 transition-colors">
                        <Trash2 size={16} className="text-white/30 hover:text-[#FF4D6A]" />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs font-semibold text-[#FF2D92]">{pct.toFixed(0)}% completado</span>
                    {g.deadline && (
                      <span className="text-xs text-white/40 flex items-center gap-1.5">
                        <Calendar size={12} className="text-white/30" /> {new Date(g.deadline).toLocaleDateString('es-ES')}
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
