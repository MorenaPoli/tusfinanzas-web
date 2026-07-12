import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react'

export default function PaymentFailure() {
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
          className="w-20 h-20 rounded-full bg-[#FF4D6A]/10 border border-[#FF4D6A]/20 flex items-center justify-center mx-auto mb-6"
        >
          <XCircle size={40} className="text-[#FF4D6A]" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-3">El pago no se completo</h1>
        <p className="text-sm text-white/50 mb-8 leading-relaxed">
          No te preocupes, no se te cobro nada. Podes intentar de nuevo o elegir otro metodo de pago.
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/checkout')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,45,146,0.3)] mb-3"
        >
          <RotateCcw size={18} /> Intentar de nuevo
        </motion.button>

        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs text-white/30 hover:text-white/50 transition-colors flex items-center gap-1 mx-auto"
        >
          <ArrowLeft size={12} /> Volver al dashboard
        </button>
      </motion.div>
    </div>
  );
}
