import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Crown, Users, Zap, Shield, BarChart3, Download, Infinity, CreditCard } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'

type Billing = 'monthly' | 'yearly';
type Plan = 'pro' | 'family';

const PLAN_CONFIG: Record<Plan, {
  name: string; desc: string; icon: typeof Crown; color: string; gradient: string;
  features: string[]; monthly: number; yearly: number; yearlyDiscount: string;
}> = {
  pro: {
    name: 'Pro',
    desc: 'Para quienes quieren control total',
    icon: Crown,
    color: '#FF2D92',
    gradient: 'from-[#FF2D92]/10 to-[#8B5CF6]/5',
    features: [
      'Transacciones ilimitadas',
      'Experto IA ilimitado',
      'Graficos avanzados',
      'Exportar CSV/Excel',
      'Historial ilimitado',
      'Soporte prioritario',
    ],
    monthly: 4.99,
    yearly: 39.99,
    yearlyDiscount: '33% OFF',
  },
  family: {
    name: 'Familiar',
    desc: 'Para familias que comparten finanzas',
    icon: Users,
    color: '#8B5CF6',
    gradient: 'from-[#8B5CF6]/10 to-[#6366F1]/5',
    features: [
      'Todo lo de Pro',
      'Hasta 5 familiares',
      'Categorias compartidas',
      'Resumen grupal mensual',
      'Metas familiares',
    ],
    monthly: 8.99,
    yearly: 69.99,
    yearlyDiscount: '35% OFF',
  },
};

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('pro');
  const [billing, setBilling] = useState<Billing>('monthly');
  const [loading, setLoading] = useState(false);

  const createPref = trpc.mercadopago.createPreference.useMutation({
    onSuccess: (data) => {
      setLoading(false);
      // Redirect to MercadoPago checkout
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else if (data.sandboxInitPoint) {
        window.location.href = data.sandboxInitPoint;
      }
    },
    onError: () => {
      setLoading(false);
      alert('Error al crear la preferencia de pago. Intenta de nuevo.');
    },
  });

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setLoading(true);
    createPref.mutate({ plan: selectedPlan, billing });
  };

  const plan = PLAN_CONFIG[selectedPlan];
  const price = billing === 'monthly' ? plan.monthly : plan.yearly;
  const period = billing === 'monthly' ? '/mes' : '/ano';

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <div>
            <h1 className="font-bold text-lg">Suscribirse</h1>
            <p className="text-xs text-white/40">Elegi tu plan</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 flex-1">
        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.keys(PLAN_CONFIG) as Plan[]).map((key) => {
            const p = PLAN_CONFIG[key];
            const Icon = p.icon;
            const active = selectedPlan === key;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedPlan(key)}
                className={`p-5 rounded-2xl border transition-all text-left ${
                  active
                    ? 'glass-strong'
                    : 'glass-card hover:border-white/[0.12]'
                }`}
                style={active ? { borderColor: `${p.color}50`, boxShadow: `0 0 30px ${p.color}22, inset 0 1px 0 rgba(255,255,255,0.10)` } : undefined}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={20} style={{ color: active ? p.color : '#666' }} />
                  <span className={`font-bold ${active ? 'text-white' : 'text-white/60'}`}>{p.name}</span>
                </div>
                <p className="text-xs text-white/40">{p.desc}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-2 p-1 rounded-xl glass mb-6">
          <button
            onClick={() => setBilling('monthly')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              billing === 'monthly'
                ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-lg'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              billing === 'yearly'
                ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-lg'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            Anual <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded-full">{plan.yearlyDiscount}</span>
          </button>
        </div>

        {/* Price Display */}
        <motion.div
          key={`${selectedPlan}-${billing}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass-strong mb-6 text-center"
          style={{ boxShadow: `0 0 40px ${plan.color}15, inset 0 1px 0 rgba(255,255,255,0.10)` }}
        >
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-5xl font-extrabold bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">
              ${price}
            </span>
            <span className="text-white/30 text-sm">{period}</span>
          </div>
          {billing === 'yearly' && (
            <p className="text-xs text-[#10B981]">
              Ahorras ${((plan.monthly * 12) - plan.yearly).toFixed(2)} por ano
            </p>
          )}
        </motion.div>

        {/* Features */}
        <div className="p-5 rounded-2xl glass-card mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Qué incluye</p>
          <div className="space-y-3">
            {plan.features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-[#10B981]" />
                </div>
                <span className="text-sm text-white/70">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subscribe Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-bold text-lg shadow-[0_4px_24px_rgba(255,45,146,0.35)] hover:shadow-[0_4px_40px_rgba(255,45,146,0.5)] transition-all flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard size={20} /> Suscribirse ahora
            </>
          )}
        </motion.button>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-xs text-white/20 mb-8">
          <Shield size={12} />
          <span>Pago seguro via MercadoPago. Cancela cuando quieras.</span>
        </div>

        {/* Comparison */}
        <div className="border-t border-white/[0.06] pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Comparativa</p>
          <div className="space-y-3">
            {[
              { icon: Infinity, label: 'Transacciones', free: '30/mes', pro: 'Ilimitadas', family: 'Ilimitadas' },
              { icon: Zap, label: 'Experto IA', free: '5/dia', pro: 'Ilimitado', family: 'Ilimitado' },
              { icon: BarChart3, label: 'Graficos', free: 'Basicos', pro: 'Avanzados', family: 'Avanzados' },
              { icon: Download, label: 'Exportar', free: 'No', pro: 'CSV/Excel', family: 'CSV/Excel' },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2 text-white/40">
                  <row.icon size={12} />
                  <span>{row.label}</span>
                </div>
                <div className="text-center text-white/30">{row.free}</div>
                <div className="text-center text-[#FF2D92] font-medium">{row.pro}</div>
                <div className="text-center text-[#8B5CF6] font-medium">{row.family}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
