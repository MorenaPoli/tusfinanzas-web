import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Info, Target, Users, LayoutDashboard } from 'lucide-react';

interface TourStep {
  icon: any;
  title: string;
  desc: string;
  highlight: string;
  route: string;
  targetId: string | null;
}

const STEPS: TourStep[] = [
  {
    icon: Sparkles,
    title: '¡Bienvenido a Tus Finanzas!',
    desc: 'La plataforma de control de dinero potenciada por Inteligencia Artificial. Queremos hacerte un breve recorrido interactivo por tus herramientas comerciales.',
    highlight: 'General',
    route: '/dashboard',
    targetId: null,
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard interactivo de cristal',
    desc: 'Aquí verás tu capital neto unificado, ingresos, egresos e inversiones actualizados en tiempo real. Los gráficos y métricas reaccionan al instante.',
    highlight: 'Resumen Financiero',
    route: '/dashboard',
    targetId: 'summary-card',
  },
  {
    icon: Info,
    title: 'Presupuestos de Gastos con Alertas',
    desc: 'Establecé límites por categorías de consumo. Si te aproximás al 80% o superás el 100%, te enviaremos una notificación automática al panel de la campana superior.',
    highlight: 'Control de Consumo',
    route: '/dashboard',
    targetId: 'budgets-panel',
  },
  {
    icon: Target,
    title: 'Metas de Ahorro Colectivas',
    desc: 'Definí tus objetivos (ej. comprar un auto) y realizá aportes directos. Si estás en familia, todos los miembros del grupo familiar podrán aportar a la misma meta común.',
    highlight: 'Metas e Inversiones',
    route: '/goals',
    targetId: 'goals-panel',
  },
  {
    icon: Users,
    title: 'Finanzas Familiares y Multiusuario',
    desc: 'Invitá hasta 6 miembros de tu familia. Compartirán movimientos, aportarán a las metas y podrán chatear con el Experto IA con un historial compartido.',
    highlight: 'Plan Familiar',
    route: '/family',
    targetId: 'family-panel',
  },
];

export default function OnboardingTour() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const resizeTimer = useRef<number | null>(null);

  const step = STEPS[currentStep];
  const StepIcon = step.icon || Sparkles;

  // Initialize
  useEffect(() => {
    try {
      const completed = localStorage.getItem('tusfinanzas_onboarding_completed');
      if (!completed) {
        const timer = window.setTimeout(() => setIsVisible(true), 1200);
        return () => window.clearTimeout(timer);
      }
    } catch (err) {
      console.warn('Onboarding: localStorage not available', err);
    }
  }, []);

  // Update position & Navigation on Step change
  useEffect(() => {
    if (!isVisible) return;

    // 1. If we are not on the step's route, navigate to it
    if (location.pathname !== step.route) {
      navigate(step.route);
      setCoords(null); // Reset coords while changing route
      return;
    }

    // 2. Element measurement logic
    const measureElement = () => {
      if (!step.targetId) {
        setCoords(null);
        return;
      }

      const el = document.getElementById(step.targetId);
      if (el) {
        // Scroll target into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Grab bounding rect after scroll finishes
        const scrollTimeout = window.setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setCoords({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          });
        }, 300);

        return () => window.clearTimeout(scrollTimeout);
      } else {
        setCoords(null);
      }
    };

    // Delay measurement to allow DOM mounting
    const measureTimeout = window.setTimeout(measureElement, 400);

    // Re-measure on window resize
    const handleResize = () => {
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(measureElement, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.clearTimeout(measureTimeout);
      window.removeEventListener('resize', handleResize);
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
    };
  }, [currentStep, location.pathname, isVisible, step.route, step.targetId, navigate]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('tusfinanzas_onboarding_completed', 'true');
    } catch (err) {
      console.warn('Onboarding: localStorage save failed', err);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Render Spotlight Ring Overlay
  const highlightRing = coords && (
    <div
      className="absolute z-[45] rounded-2xl border-[3px] border-[#FF2D92] pointer-events-none transition-all duration-300 shadow-[0_0_40px_rgba(255,45,146,0.6)]"
      style={{
        top: coords.top - 6,
        left: coords.left - 6,
        width: coords.width + 12,
        height: coords.height + 12,
      }}
    >
      <span className="absolute -inset-1 rounded-2xl border border-[#8B5CF6] animate-ping opacity-60" />
    </div>
  );

  return (
    <>
      {/* Target Highlight Overlay (Absolute positioning on page scroll wrapper) */}
      <div className="absolute inset-0 z-40 pointer-events-none overflow-visible">
        {highlightRing}
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Tooltip Popup container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm rounded-2xl glass-strong border border-white/[0.08] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden pointer-events-auto flex flex-col justify-between"
            style={
              coords
                ? {
                    // Position at the bottom or near the center but always on screen
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }
                : {}
            }
          >
            {/* Top highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#00E5FF]" />

            {/* Close button */}
            <button
              onClick={handleComplete}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              <X size={15} />
            </button>

            {/* Step Indicator */}
            <div className="flex items-center gap-1 mb-3.5">
              {STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    index === currentStep ? 'w-5 bg-[#FF2D92]' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Icon Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#FF2D92]/20 to-[#8B5CF6]/20 border border-[#FF2D92]/30 flex items-center justify-center text-[#FF2D92] shrink-0">
                <StepIcon size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#FF2D92]">
                  Guía de Inicio · {step.highlight}
                </span>
                <h2 className="text-sm font-bold text-white mt-0.5 truncate">{step.title}</h2>
              </div>
            </div>

            {/* Desc */}
            <p className="text-xs text-white/60 leading-relaxed mb-5">
              {step.desc}
            </p>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-3.5 mt-2">
              <button
                onClick={handleComplete}
                className="text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors"
              >
                Saltar tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-xs font-bold text-white hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(255,45,146,0.2)]"
              >
                {currentStep === STEPS.length - 1 ? 'Empezar ahora' : 'Siguiente'}
                <ArrowRight size={11} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
