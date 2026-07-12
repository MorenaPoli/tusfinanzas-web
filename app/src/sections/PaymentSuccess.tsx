import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-[#10B981]" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-3">Pago exitoso!</h1>
        <p className="text-sm text-white/50 mb-2 leading-relaxed">
          Tu suscripcion fue activada correctamente. Ya tenes acceso a todas las funciones premium.
        </p>
        <p className="text-xs text-white/30 mb-8">
          Puede tardar unos segundos en activarse. Si no ves los cambios, recarga la pagina.
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,45,146,0.3)]"
        >
          <Sparkles size={18} /> Ir al dashboard <ArrowRight size={18} />
        </motion.button>

        <button
          onClick={() => navigate('/chat')}
          className="mt-3 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Probar el Experto IA ahora →
        </button>
      </motion.div>
    </div>
  );
}
