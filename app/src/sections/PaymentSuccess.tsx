import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { trpc } from '@/providers/trpc'

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  // Polling query: refetch subscription every 1500ms while plan is 'free'
  const { data: subData } = trpc.subscription.getMyPlan.useQuery(undefined, {
    refetchInterval: (query) => {
      const plan = query.state.data?.plan;
      return !plan || plan === 'free' ? 1500 : false;
    }
  });

  const isPendingActivation = !subData || subData.plan === 'free';

  // Invalidate other queries once subscription changes
  useEffect(() => {
    if (subData && subData.plan !== 'free') {
      utils.auth.me.invalidate();
      utils.subscription.getMonthlyCount.invalidate();
    }
  }, [subData, utils]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Aurora Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#FF2D92]/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#8B5CF6]/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full text-center p-8 rounded-3xl glass-strong border border-white/[0.06] relative z-10 shadow-2xl"
      >
        {isPendingActivation ? (
          <div className="py-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-20 h-20 rounded-full border border-[#FF2D92]/20 flex items-center justify-center mx-auto mb-6"
            >
              <Loader2 size={36} className="text-[#FF2D92]" />
            </motion.div>

            <h1 className="text-xl font-bold mb-3">Procesando pago...</h1>
            <p className="text-sm text-white/50 leading-relaxed mb-1">
              Estamos validando tu suscripción con Mercado Pago de forma segura.
            </p>
            <p className="text-xs text-white/30 animate-pulse">
              Esto puede tomar unos segundos, por favor no cierres esta pestaña.
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            >
              <CheckCircle size={40} className="text-[#10B981]" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-3">¡Plan {subData.plan === 'family' ? 'Familiar' : 'Pro'} Activado!</h1>
            <p className="text-sm text-white/50 mb-8 leading-relaxed">
              Tu pago fue aprobado. Ya contás con acceso ilimitado a todas las herramientas y al Experto Financiero IA.
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,45,146,0.3)] hover:opacity-90 transition-opacity"
            >
              <Sparkles size={18} /> Ir al dashboard <ArrowRight size={18} />
            </motion.button>

            <button
              onClick={() => navigate('/chat')}
              className="mt-4 text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Probar el Experto IA ahora →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
