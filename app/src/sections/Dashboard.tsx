import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Wallet, TrendingUp, TrendingDown, PiggyBank, Gem, CreditCard, Sparkles, Plus, Crown, AlertTriangle, Trash2 } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { useEffect, useMemo, useState } from 'react'
import NotificationBell from '@/components/NotificationBell'
import OnboardingTour from '@/components/OnboardingTour'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { plan, isFree, nearLimit, atLimit, txCount, txLimit, txPercent } = useSubscription();
  const utils = trpc.useUtils();

  const [currency, setCurrency] = useState<string>(() => localStorage.getItem('iafinanzas_currency') || 'USD');

  const { data: totals } = trpc.finance.getTotals.useQuery({ currency });
  const { data: transactions } = trpc.finance.listTransactions.useQuery();
  const { data: dailyQuote } = trpc.finance.getDailyQuote.useQuery();

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('Comida');
  const [budgetAmount, setBudgetAmount] = useState('');

  const { data: budgetReport = [] } = trpc.budget.getBudgetReport.useQuery();

  const setBudget = trpc.budget.set.useMutation({
    onSuccess: () => {
      utils.budget.getBudgetReport.invalidate();
      setIsBudgetModalOpen(false);
      setBudgetAmount('');
    },
  });

  const deleteBudget = trpc.budget.delete.useMutation({
    onSuccess: () => utils.budget.getBudgetReport.invalidate(),
  });

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount.trim() || parseFloat(budgetAmount) <= 0) return;
    setBudget.mutate({
      category: budgetCategory,
      amount: budgetAmount,
    });
  };



  const recent = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => {
      const ad = a.date instanceof Date ? a.date.toISOString() : String(a.date);
      const bd = b.date instanceof Date ? b.date.toISOString() : String(b.date);
      return bd.localeCompare(ad);
    }).slice(0, 5);
  }, [transactions]);

  const netWorth = totals?.netWorth ?? 0;
  const isPositive = netWorth >= 0;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 pb-4">
      {/* Header - mobile only */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="IAfinanzas" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-lg tracking-tight">IAfinanzas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 hidden sm:inline">{user?.name || 'Usuario'}</span>
          <NotificationBell />
          <button onClick={logout} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <LogOut size={16} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">
              Hola, <span className="bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Usuario'}</span>
            </h1>
            {isFree ? (
              <span className="px-2.5 py-0.5 rounded-full glass text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                Gratis
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF2D92]/20 to-[#8B5CF6]/20 border border-[#FF2D92]/30 text-[10px] text-[#FF2D92] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Crown size={10} /> {plan}
              </span>
            )}
          </div>
          <p className="text-sm text-white/40">Así va tu dinero hoy</p>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-xl glass self-start sm:self-auto">
          {['USD', 'ARS', 'MXN', 'EUR'].map(curr => (
            <button
              key={curr}
              onClick={() => {
                setCurrency(curr);
                localStorage.setItem('iafinanzas_currency', curr);
                utils.finance.getTotals.invalidate();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === curr
                  ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-md glow-pink'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Free plan limit bar */}
      {isFree && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="p-4 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Transacciones este mes</span>
              <span className={`text-xs font-semibold ${nearLimit ? 'text-[#FF4D6A]' : 'text-white/40'}`}>
                {txCount}/{txLimit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${atLimit ? 'bg-[#FF4D6A]' : nearLimit ? 'bg-[#FFD166]' : 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6]'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, txPercent)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            {nearLimit && !atLimit && (
              <p className="text-[10px] text-[#FFD166] mt-2">
                Te quedan pocas transacciones gratis. <button onClick={() => navigate('/checkout')} className="underline hover:text-[#FF2D92] transition-colors">Suscribite a Pro</button> para ilimitadas.
              </p>
            )}
            {atLimit && (
              <p className="text-[10px] text-[#FF4D6A] mt-2">
                Alcanzaste el limite mensual. <button onClick={() => navigate('/checkout')} className="underline font-semibold hover:text-[#FF2D92] transition-colors">Suscribite a Pro</button> para seguir cargando.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Upgrade CTA for free users */}
      {isFree && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full p-4 rounded-2xl glass-card border border-[#FF2D92]/15 hover:border-[#FF2D92]/35 transition-all group glow-pink"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] flex items-center justify-center shadow-[0_4px_20px_rgba(255,45,146,0.35)]">
                  <Crown size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold group-hover:text-[#FF2D92] transition-colors">Suscribite a Pro</p>
                  <p className="text-[10px] text-white/40">Transacciones ilimitadas + IA ilimitado por $4.99/mes</p>
                </div>
              </div>
              <span className="text-xs text-[#FF2D92] font-semibold shrink-0">→</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Alert Card for Budget Overrun */}
      {totals && totals.income > 0 && (totals.expense / totals.income) >= 0.8 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="p-4 rounded-2xl glass-card border border-[#FF4D6A]/25 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF4D6A]/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-[#FF4D6A]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#FF4D6A]">¡Límite de presupuesto en riesgo!</p>
              <p className="text-xs text-white/60 mt-0.5">
                Tus gastos de este mes (${totals.expense.toLocaleString()}) representan el {((totals.expense / totals.income) * 100).toFixed(0)}% de tus ingresos. Te sugerimos recortar gastos no esenciales.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Net Worth Hero Card */}
      <motion.div id="summary-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl p-7 mb-6 glass-strong glow-pink">
        {/* Inner glow ring */}
        <div className="absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(ellipse at top right, rgba(255,45,146,0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(139,92,246,0.10) 0%, transparent 60%)' }} />
        {/* Shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative">
          <p className="text-[11px] text-white/30 uppercase tracking-[0.25em] font-semibold mb-3">Patrimonio Neto</p>
          <h2 className={`text-5xl sm:text-6xl font-black tracking-tight ${isPositive ? 'text-white' : 'text-[#FF4D6A]'}`}
            style={isPositive ? { textShadow: '0 0 40px rgba(255,255,255,0.12)' } : {}}>
            ${Math.abs(netWorth).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-white/25 mt-3 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-[#10B981]' : 'bg-[#FF4D6A]'} animate-pulse`} />
            {isPositive ? 'Capital positivo' : 'Capital negativo'} · {currency}
          </p>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { icon: TrendingUp, label: 'Ingresos', value: totals?.income ?? 0, color: '#00E5FF', glow: 'rgba(0,229,255,0.15)' },
          { icon: TrendingDown, label: 'Gastos', value: totals?.expense ?? 0, color: '#FF4D6A', glow: 'rgba(255,77,106,0.15)' },
          { icon: Wallet, label: 'Capital', value: totals?.capital ?? 0, color: '#FFD166', glow: 'rgba(255,209,102,0.12)' },
          { icon: PiggyBank, label: 'Patrimonio', value: totals?.netWorth ?? 0, color: '#10B981', glow: 'rgba(16,185,129,0.12)' },
        ].map((s) => (
          <motion.div key={s.label} variants={item}
            className="p-4 rounded-2xl glass-card cursor-default"
            style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07)` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${s.glow}`, boxShadow: `0 0 16px ${s.glow}` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>${s.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Secondary Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Gem, label: 'Bienes', value: totals?.asset ?? 0, color: '#8B5CF6', glow: 'rgba(139,92,246,0.15)' },
          { icon: CreditCard, label: 'Deudas', value: totals?.debt ?? 0, color: '#EF4444', glow: 'rgba(239,68,68,0.12)' },
          { icon: TrendingUp, label: 'Inversiones', value: totals?.investment ?? 0, color: '#6366F1', glow: 'rgba(99,102,241,0.15)' },
        ].map((s) => (
          <motion.div key={s.label} variants={item}
            className="p-3 rounded-xl glass-card text-center"
            style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-2"
              style={{ background: s.glow }}>
              <s.icon size={14} style={{ color: s.color }} />
            </div>
            <p className="text-[10px] text-white/30 mb-0.5">{s.label}</p>
            <p className="text-sm font-bold" style={{ color: s.color }}>${s.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily Quote */}
      {dailyQuote && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl mb-6 glass-card border border-[#FF2D92]/12"
          style={{ background: 'linear-gradient(135deg, rgba(255,45,146,0.06) 0%, rgba(139,92,246,0.06) 50%, rgba(99,102,241,0.04) 100%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[#FF2D92]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#FF2D92]">Consejo del día</span>
          </div>
          <p className="text-sm text-white/70 italic">&ldquo;{dailyQuote.text}&rdquo;</p>
        </motion.div>
      )}

      {/* Category Budgets Panel (Stage 8) */}
      <div id="budgets-panel" className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/60">Presupuestos de Gastos</h2>
          <button onClick={() => setIsBudgetModalOpen(true)} className="text-xs text-[#FF2D92] hover:underline flex items-center gap-1 font-semibold">
            <Plus size={12} /> Gestionar
          </button>
        </div>

        {budgetReport.length === 0 ? (
          <div className="p-6 rounded-2xl glass-card text-center text-white/30 text-xs">
            No definiste ningún presupuesto mensual por categoría aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {budgetReport.map((b) => {
              const color = b.percent >= 100 ? '#FF4D6A' : b.percent >= 80 ? '#FFD166' : '#10B981';
              const strokeDasharray = 2 * Math.PI * 20;
              const strokeDashoffset = strokeDasharray - (Math.min(100, b.percent) / 100) * strokeDasharray;

              return (
                <div key={b.id} className="p-4 rounded-2xl glass-card flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    {/* SVG Circular Progress Ring */}
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" className="stroke-white/5 fill-transparent" strokeWidth="4.5" />
                        <circle cx="24" cy="24" r="20" className="fill-transparent transition-all duration-500 ease-out" 
                          strokeWidth="4.5" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
                          stroke={color} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold" style={{ color }}>
                        {Math.round(b.percent)}%
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold capitalize text-white">{b.category}</h3>
                      <p className="text-[10px] text-white/40 font-medium">Gastado: ${b.spent.toLocaleString()} / ${b.limit.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button onClick={() => deleteBudget.mutate({ id: b.id })} className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/60">Últimos movimientos</h2>
          <button onClick={() => navigate('/transactions')} className="text-xs text-[#FF2D92] hover:underline">Ver todos</button>
        </div>

        {recent.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-8 rounded-2xl glass-card text-center">
            <p className="text-sm text-white/30 mb-3">Sin transacciones aun</p>
            <button onClick={() => navigate('/add')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF2D92]/10 border border-[#FF2D92]/20 text-xs text-[#FF2D92] hover:bg-[#FF2D92]/20 transition-colors">
              <Plus size={14} /> Agregar mi primera transaccion
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {recent.map((t, i) => {
              const dateStr = t.date instanceof Date ? t.date.toISOString().slice(0, 10) : String(t.date);
              return (
                <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between p-4 rounded-2xl glass-card cursor-pointer"
                  onClick={() => navigate('/transactions')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${TYPE_BG[t.type]}`, boxShadow: `0 0 12px ${TYPE_BG[t.type]}` }}>
                      <span className="text-xs font-bold" style={{ color: TYPE_COLORS[t.type] }}>
                        {t.type === 'income' || t.type === 'asset' ? '+' : '-'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.description || t.category}</p>
                      <p className="text-[10px] text-white/30">{dateStr} · {t.category}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${t.type === 'income' || t.type === 'asset' ? 'text-[#00E5FF]' : 'text-[#FF4D6A]'}`}>
                    {t.type === 'income' || t.type === 'asset' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()} <span className="text-[10px] opacity-60 ml-0.5">{t.currency || 'USD'}</span>
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Management Glass Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl glass-strong p-6 border border-white/[0.08] relative"
            >
              <h3 className="text-lg font-bold mb-1">Definir Presupuesto</h3>
              <p className="text-xs text-white/40 mb-4">Controlá tus gastos mensuales por categoría</p>

              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Categoría</label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass border border-white/[0.08] text-sm focus:outline-none focus:border-[#FF2D92]"
                  >
                    {['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Salud', 'Educación', 'Otros'].map(cat => (
                      <option key={cat} value={cat} className="bg-[#0A0A0A]">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Límite Mensual</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 50000"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass border border-white/[0.08] text-sm focus:outline-none focus:border-[#FF2D92] text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBudgetModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <OnboardingTour />
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  income: '#00E5FF', expense: '#FF4D6A', investment: '#6366F1', debt: '#EF4444', asset: '#8B5CF6',
};

const TYPE_BG: Record<string, string> = {
  income: 'rgba(0,229,255,0.12)', expense: 'rgba(255,77,106,0.12)', investment: 'rgba(99,102,241,0.12)', debt: 'rgba(239,68,68,0.10)', asset: 'rgba(139,92,246,0.12)',
};
