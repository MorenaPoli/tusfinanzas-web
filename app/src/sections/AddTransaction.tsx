import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, CreditCard, Gem } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { getCategoriesByType } from '@/types'
import type { TransactionType } from '@/types'

const TYPES: { id: TransactionType; label: string; icon: typeof TrendingUp; desc: string; color: string; gradient: string }[] = [
  { id: 'income', label: 'Ingreso', icon: TrendingUp, desc: 'Salario, freelance, alquileres...', color: '#00E5FF', gradient: 'from-[#00E5FF]/20 to-[#00E5FF]/5' },
  { id: 'expense', label: 'Gasto', icon: TrendingDown, desc: 'Comida, transporte, vivienda...', color: '#FF4D6A', gradient: 'from-[#FF4D6A]/20 to-[#FF4D6A]/5' },
  { id: 'investment', label: 'Inversion', icon: BarChart3, desc: 'ETFs, crypto, acciones...', color: '#6366F1', gradient: 'from-[#6366F1]/20 to-[#6366F1]/5' },
  { id: 'debt', label: 'Deuda', icon: CreditCard, desc: 'Tarjetas, prestamos...', color: '#EF4444', gradient: 'from-[#EF4444]/20 to-[#EF4444]/5' },
  { id: 'asset', label: 'Bien / Activo', icon: Gem, desc: 'Auto, celular, propiedad...', color: '#8B5CF6', gradient: 'from-[#8B5CF6]/20 to-[#8B5CF6]/5' },
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [step, setStep] = useState<0 | 1>(0);
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [isShaking, setIsShaking] = useState(false);

  const create = trpc.finance.createTransaction.useMutation({
    onSuccess: () => {
      utils.finance.listTransactions.invalidate();
      utils.finance.getTotals.invalidate();
      navigate('/dashboard');
    },
  });

  const handleSubmit = () => {
    if (!amount || !category) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    create.mutate({ type, category, amount, description: description || undefined, currency, date });
  };

  // Step 0: Select type
  if (step === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <h1 className="font-bold text-lg">Nuevo movimiento</h1>
        </div>
        <p className="text-sm text-white/40 mb-6">¿Qué tipo de movimiento querés registrar?</p>

        <div className="space-y-3">
          {TYPES.map((t, i) => (
            <motion.button key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => { setType(t.id); setCategory(''); setStep(1); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${t.gradient} border border-white/[0.06] hover:border-white/[0.12] transition-all text-left group`}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse" style={{ backgroundColor: `${t.color}15` }}>
                <t.icon size={24} style={{ color: t.color }} />
              </div>
              <div>
                <p className="font-semibold text-sm group-hover:text-white transition-colors">{t.label}</p>
                <p className="text-xs text-white/40">{t.desc}</p>
              </div>
              <ArrowLeft size={16} className="ml-auto text-white/20 -rotate-180 group-hover:text-white/40 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Step 1: Form
  const categories = getCategoriesByType(type);
  const typeInfo = TYPES.find(t => t.id === type)!;

  return (
    <div className="max-w-lg mx-auto px-6 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setStep(0)} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <h1 className="font-bold text-lg">{typeInfo.label}</h1>
      </div>

      <motion.div
        animate={isShaking ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-5"
      >
        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block font-bold">Monto</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg font-bold">$</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full pl-10 pr-5 py-4 glass border border-white/[0.08] rounded-2xl text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#8B5CF6] transition-colors"
              autoFocus />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block font-bold">Divisa</label>
          <div className="flex gap-2">
            {['ARS', 'USD', 'MXN', 'EUR'].map(curr => (
              <button key={curr} type="button" onClick={() => setCurrency(curr)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  currency === curr
                    ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'glass border-white/[0.08] text-white/60 hover:bg-white/5'
                }`}>
                {curr}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block font-bold">Categoría</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs border transition-all ${
                  category === c
                    ? 'bg-[#FF2D92] border-[#FF2D92] text-white shadow-[0_0_12px_rgba(255,45,146,0.3)]'
                    : 'glass border-white/[0.08] text-white/60 hover:bg-white/5'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block font-bold">Descripción (opcional)</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Salario enero"
            className="w-full px-5 py-4 glass border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#8B5CF6] transition-colors" />
        </div>

        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block font-bold">Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-5 py-4 glass border border-white/[0.08] rounded-2xl text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors" />
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={create.isPending}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
            amount && category
              ? 'bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white shadow-[0_4px_24px_rgba(255,45,146,0.35)]'
              : 'bg-white/5 text-white/30'
          }`}>
          {create.isPending ? 'Guardando...' : 'Guardar movimiento'}
        </motion.button>
      </motion.div>
    </div>
  );
}
