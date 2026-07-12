import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Clock, ArrowLeft } from 'lucide-react'

export default function PaymentPending() {
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
          className="w-20 h-20 rounded-full bg-[#FFD166]/10 border border-[#FFD166]/20 flex items-center justify-center mx-auto mb-6"
        >
          <Clock size={40} className="text-[#FFD166]" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-3">Pago pendiente</h1>
        <p className="text-sm text-white/50 mb-2 leading-relaxed">
          Tu pago esta siendo procesado. En cuanto se acredite, tu suscripcion se activara automaticamente.
        </p>
        <p className="text-xs text-white/30 mb-8">
          Esto puede tardar entre unos minutos y 48hs dependiendo del metodo de pago.
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/60 font-semibold flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-colors"
        >
          <ArrowLeft size={18} /> Volver al dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}
