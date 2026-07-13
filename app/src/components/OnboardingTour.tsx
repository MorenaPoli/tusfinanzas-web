import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Info, Target, Users, LayoutDashboard } from 'lucide-react';

const STEPS = [
  {
    icon: Sparkles,
    title: '¡Bienvenido a IAfinanzas!',
    desc: 'La plataforma de control de dinero potenciada por Inteligencia Artificial. Queremos hacerte un breve recorrido por tus herramientas financieras.',
    highlight: 'General',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard interactivo de cristal',
    desc: 'Aquí verás tu capital neto unificado, ingresos, egresos y tu patrimonio actualizado en tiempo real. Pasá el mouse para interactuar con las auroras de fondo.',
    highlight: 'Resumen Financiero',
  },
  {
    icon: Info,
    title: 'Presupuestos de Gastos con Alertas',
    desc: 'Establecé límites por categorías de consumo. Si te aproximás al 80% o superás el 100%, te enviaremos una notificación automáticamente al panel de la campana superior.',
    highlight: 'Control de Consumo',
  },
  {
    icon: Target,
    title: 'Metas de Ahorro Colectivas',
    desc: 'Definí tus objetivos (ej. comprar un auto) y realizá aportes directos. Si estás en familia, todos los miembros del grupo familiar podrán aportar a la misma meta común.',
    highlight: 'Metas e Inversiones',
  },
  {
    icon: Users,
    title: 'Finanzas Familiares y Multiusuario',
    desc: 'Invitá hasta 6 miembros de tu familia. Compartirán movimientos, aportarán a las metas y podrán chatear con el Experto IA con un historial compartido.',
    highlight: 'Plan Familiar',
  },
];

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('iafinanzas_onboarding_completed');
    if (!completed) {
      // Small timeout to let dashboard load before starting tour
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('iafinanzas_onboarding_completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md rounded-2xl glass-strong border border-white/[0.08] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#00E5FF]" />

          {/* Close button */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Step Indicator */}
          <div className="flex items-center gap-1.5 mb-4">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'w-6 bg-[#FF2D92]' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF2D92]/20 to-[#8B5CF6]/20 border border-[#FF2D92]/30 flex items-center justify-center text-[#FF2D92]">
              <StepIcon size={20} />
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FF2D92]">
                Guía de Inicio · {step.highlight}
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">{step.title}</h2>
            </div>
          </div>

          {/* Desc */}
          <p className="text-xs text-white/60 leading-relaxed mb-6">
            {step.desc}
          </p>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
            <button
              onClick={handleComplete}
              className="text-[11px] font-bold text-white/40 hover:text-white/70 transition-colors"
            >
              Saltar tour
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-xs font-bold text-white hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(255,45,146,0.2)]"
            >
              {currentStep === STEPS.length - 1 ? 'Empezar ahora' : 'Siguiente'}
              <ArrowRight size={12} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
