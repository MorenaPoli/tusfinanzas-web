import { useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Smartphone, Brain,
  CreditCard, PiggyBank, BarChart3, Lock, Bell,
  ArrowRight, Check, Star, Quote, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Local authentication path redirect
const authPath = "/auth";

/* ─── Direct mount entry wrapper ─── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  /* ─── data ─── */
  const features = [
    {
      icon: Brain,
      title: 'Experto IA Personal',
      desc: 'No consejos genericos. Te dice EXACTAMENTE en que pagina invertir, cuanto poner y que tickers comprar.',
      color: '#FF2D92',
    },
    {
      icon: BarChart3,
      title: 'Control Total',
      desc: 'Ingresos, gastos, inversiones, bienes y deudas. Todo en un solo lugar con calculo automatico de patrimonio neto.',
      color: '#8B5CF6',
    },
    {
      icon: PiggyBank,
      title: 'Resumen Mensual',
      desc: 'Graficos de barras, torta y tendencias. Sabe exactamente en que gastas mas y como mejorar.',
      color: '#6366F1',
    },
    {
      icon: Bell,
      title: 'Frases Inteligentes',
      desc: 'Cada dia una frase personalizada segun tu situacion financiera. Te motiva cuando vas bien y te alerta cuando no.',
      color: '#FFD166',
    },
    {
      icon: Lock,
      title: 'Tus Datos Son Tuyos',
      desc: 'Informacion encriptada y segura en la base de datos. Nadie mas puede ver tu informacion financiera.',
      color: '#10B981',
    },
    {
      icon: Smartphone,
      title: 'Desde Cualquier Lado',
      desc: 'Funciona perfecto en tu celular, tablet o computadora. Disenado mobile-first para usarlo en el dia a dia.',
      color: '#00E5FF',
    },
  ];

  const steps = [
    { num: '01', title: 'Registrate', desc: 'Entra con tu cuenta de Kimi en segundos. Sin formularios largos.' },
    { num: '02', title: 'Carga tus datos', desc: 'Agrega tus ingresos, gastos, bienes y deudas. Toma menos de 5 minutos.' },
    { num: '03', title: 'Recibe tu analisis', desc: 'Mira tu patrimonio neto, resumen mensual y tendencias al instante.' },
    { num: '04', title: 'Pregunta al experto', desc: 'Tu experto IA te guia con instrucciones concretas para mejorar tus finanzas.' },
  ];

  const testimonials = [
    {
      name: 'Mariana G.',
      role: 'Contadora, Buenos Aires',
      text: 'En 3 meses pude ver donde se me iba la plata. Me di cuenta que gastaba $800 solo en delivery. La IA me dio un plan concreto y ahora ahorro el 20% de mi sueldo.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Carlos R.',
      role: 'Desarrollador, Mexico DF',
      text: 'Probe YNAB y era demasiado complejo. Tus Finanzas es directo: cargo mis gastos, veo mis graficos y el experto me dice que hacer. Por $4.99 esta regalado.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Lucia M.',
      role: 'Emprendedora, Montevideo',
      text: 'Tenia deuda en 3 tarjetas y no sabia por cual empezar. El experto me dio el plan exacto: pague la mas cara primero y en 8 meses sali de deuda.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Andres P.',
      role: 'Estudiante, Santiago',
      text: 'Uso la version gratis y con 30 transacciones al mes me alcanza perfecto. Cuando empiece a trabajar de seguro me paso al Pro por la IA.',
      stars: 4,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sofia L.',
      role: 'Marketing Manager, Madrid',
      text: 'La frase del dia me mantiene enfocada. Cuando veo que mi patrimonio crece, me motiva a seguir ahorrando. Es simple pero efectivo.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Juan D.',
      role: 'Ingeniero, Bogota',
      text: 'Le pregunte al experto como invertir $500 y me dio tickers reales con precios exactos. Compre VTI y VXUS siguiendo sus instrucciones. Ahora tengo un portfolio.',
      stars: 5,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    },
  ];

  const comparisons = [
    { feature: 'Precio mensual', us: '$4.99', ynab: '$14.99', mint: '$0*', note: '*Mint cerro en 2024' },
    { feature: 'Transacciones ilimitadas', us: 'Si', ynab: 'Si', mint: 'N/A' },
    { feature: 'Experto IA personal', us: 'Si', ynab: 'No', mint: 'No' },
    { feature: 'Graficos avanzados', us: 'Si', ynab: 'Si', mint: 'Basico' },
    { feature: 'Exportar datos', us: 'Si (Pro)', ynab: 'Si', mint: 'No' },
    { feature: 'Sin publicidad', us: 'Si', ynab: 'Si', mint: 'Lleno de ads' },
  ];

  const faqs = [
    { q: 'Cuanto cuesta Tus Finanzas?', a: 'Es gratis para empezar. El plan Pro cuesta $4.99 al mes o $39.99 al ano (33% de descuento). El plan Familiar es $8.99/mes o $69.99/ano.' },
    { q: 'Puedo usarlo gratis para siempre?', a: 'Si. El plan gratis incluye 30 transacciones por mes, resumen basico, frases del dia y 5 consultas al experto IA por dia. Para muchos usuarios es suficiente.' },
    { q: 'Mis datos estan seguros?', a: 'Absolutamente. Usamos autenticacion OAuth 2.0 de Kimi, encriptacion de datos y cada usuario solo ve su propia informacion. Tus datos financieros nunca se comparten.' },
    { q: 'Como funciona el experto IA?', a: 'Es un asistente financiero que te da instrucciones concretas, no consejos vagos. Le preguntas "como invierto $500" y te responde con tickers reales, precios exactos y pasos para comprar.' },
    { q: 'Puedo cancelar en cualquier momento?', a: 'Si. Sin compromisos, sin preguntas. Cancelas cuando quieras y seguis teniendo acceso hasta el final del periodo pagado.' },
    { q: 'Funciona en mi celular?', a: 'Si. Esta disenado mobile-first. Funciona perfecto en cualquier celular, tablet o computadora. Solo necesitas internet.' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-x-hidden">
      {/* ═══════ NAV ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Tus Finanzas" className="w-9 h-9 rounded-lg object-cover" />
            <span className="font-bold text-lg tracking-tight">Tus Finanzas</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funciones" className="text-sm text-white/50 hover:text-white transition-colors">Funciones</a>
            <a href="#precios" className="text-sm text-white/50 hover:text-white transition-colors">Precios</a>
            <a href="#faq" className="text-sm text-white/50 hover:text-white transition-colors">FAQ</a>
            <a href={authPath} className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white text-sm font-medium hover:shadow-[0_4px_20px_rgba(255,45,146,0.4)] transition-shadow">
              Empezar gratis
            </a>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="pt-32 pb-20 relative">
        {/* bg effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#FF2D92]/8 via-transparent to-transparent rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF2D92]/10 border border-[#FF2D92]/20 text-[#FF2D92] text-xs font-semibold mb-6">
                  <Star size={12} fill="#FF2D92" /> 73% mas barato que YNAB
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-6">
                Controla tu dinero
                <span className="block bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
                  como un experto
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-lg text-white/50 leading-relaxed mb-8 max-w-lg">
                Tus Finanzas te ayuda a gestionar ingresos, gastos, inversiones y deudas.
                Tu experto IA te guia con instrucciones concretas para mejorar tus finanzas.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 mb-8">
                <a href={authPath}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(255,45,146,0.35)] hover:shadow-[0_4px_40px_rgba(255,45,146,0.5)] transition-shadow">
                  Empezar gratis <ArrowRight size={20} />
                </a>
                <span className="px-8 py-4 text-white/30 text-sm flex items-center justify-center">
                  Sin tarjeta de credito
                </span>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex items-center gap-4 text-xs text-white/30">
                 <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80'
                  ].map((url, idx) => (
                    <img key={idx} src={url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-[#0A0A0A] opacity-80" />
                  ))}
                </div>
                <span>+2.400 personas ya lo usan</span>
              </motion.div>
            </div>

            {/* Phone mockup */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="hidden lg:flex justify-center">
              <div className="relative w-[300px] h-[600px] bg-[#111] rounded-[40px] border border-white/10 p-3 shadow-2xl shadow-[#FF2D92]/10">
                <div className="w-full h-full bg-[#0A0A0A] rounded-[32px] overflow-hidden p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm">Tus Finanzas</span>
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" alt="" className="w-6 h-6 rounded-full object-cover" />
                  </div>
                  <p className="text-[9px] text-white/30 uppercase mb-1">Patrimonio Neto</p>
                  <p className="text-3xl font-extrabold mb-4">$24,580</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {['Ingresos +$8,500','Gastos -$3,200','Capital +$5,300','Ahorro 62%'].map((l,i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#1A1A1A]">
                        <p className="text-[8px] text-white/30">{l.split(' ')[0]}</p>
                        <p className="text-sm font-bold" style={{color:['#00E5FF','#FF4D6A','#FFD166','#10B981'][i]}}>
                          {l.split(' ').slice(1).join(' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#FF2D92]/10 to-[#8B5CF6]/10 mb-3">
                    <p className="text-[9px] text-[#FF2D92] mb-1">Consejo del dia</p>
                    <p className="text-[11px] text-white/60">&ldquo;Tu patrimonio crece. Segui asi.&rdquo;</p>
                  </div>
                  <div className="space-y-2">
                    {['Salario mensual','Alquiler','Supermercado'].map((item,i) => (
                      <div key={item} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A1A1A]">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center">
                            <CreditCard size={10} className="text-white/30" />
                          </div>
                          <span className="text-[11px]">{item}</span>
                        </div>
                        <span className="text-[11px] font-bold" style={{color: i===0?'#00E5FF':'#FF4D6A'}}>
                          {i===0?'+$5,000':'-$'+(800+i*400)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST BAR ═══════ */}
      <section className="border-y border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { num: '2.400+', label: 'usuarios activos' },
            { num: '$4.99', label: 'precio Pro mensual' },
            { num: '30', label: 'transacciones gratis' },
            { num: '4.8', label: 'valoracion promedio' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">
                {s.num}
              </p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="funciones" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-[10px] text-[#FF2D92] uppercase tracking-[0.2em] font-semibold">Funciones</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-3 mb-4">
                Todo lo que necesitas para<br />
                <span className="bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">controlar tu dinero</span>
              </h2>
              <p className="text-white/40 max-w-lg mx-auto">
                Sin complicaciones. Sin funciones que nunca vas a usar. Solo lo esencial, hecho bien.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="p-6 rounded-2xl bg-[#111] border border-white/[0.06] hover:border-white/[0.1] transition-all group h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${f.color}15` }}>
                    <f.icon size={22} style={{ color: f.color }} />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-[10px] text-[#FF2D92] uppercase tracking-[0.2em] font-semibold">Como funciona</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-3">
                De la confusion al <span className="bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">control total</span> en 4 pasos
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1}>
                <div className="relative p-6 rounded-2xl bg-[#111] border border-white/[0.06] text-center h-full">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF2D92]/20 to-[#8B5CF6]/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(255,45,146,0.15)]">
                    <span className="text-lg font-black bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">{s.num}</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-[10px] text-[#FF2D92] uppercase tracking-[0.2em] font-semibold">Testimonios</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-3 mb-4">
                Lo que dicen <span className="bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">nuestros usuarios</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="p-6 rounded-2xl bg-[#111] border border-white/[0.06] hover:border-white/[0.1] transition-all h-full flex flex-col">
                  <Quote size={20} className="text-[#FF2D92]/30 mb-3" />
                  <p className="text-sm text-white/60 leading-relaxed mb-4 flex-1">{t.text}</p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={12} className={s < t.stars ? 'text-[#FFD166] fill-[#FFD166]' : 'text-white/10'} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-[10px] text-white/30">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COMPARISON ═══════ */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-[10px] text-[#FF2D92] uppercase tracking-[0.2em] font-semibold">Comparativa</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-3 mb-4">
                Por que elegir <span className="bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">Tus Finanzas</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl bg-[#111] border border-white/[0.06] overflow-hidden">
              <div className="grid grid-cols-4 gap-0 text-center">
                <div className="p-4 text-[10px] text-white/30 uppercase tracking-wider font-semibold border-b border-white/[0.06]">Caracteristica</div>
                <div className="p-4 text-[10px] text-[#FF2D92] uppercase tracking-wider font-bold border-b border-white/[0.06] bg-[#FF2D92]/5">Tus Finanzas</div>
                <div className="p-4 text-[10px] text-white/30 uppercase tracking-wider font-semibold border-b border-white/[0.06]">YNAB</div>
                <div className="p-4 text-[10px] text-white/30 uppercase tracking-wider font-semibold border-b border-white/[0.06]">Mint</div>

                {comparisons.map((c, i) => (
                  <div key={i} className="contents">
                    <div className={`p-4 text-xs text-white/50 border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>{c.feature}</div>
                    <div className={`p-4 text-xs font-semibold text-[#10B981] border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-[#FF2D92]/[0.02]' : ''}`}>{c.us}</div>
                    <div className={`p-4 text-xs text-white/40 border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>{c.ynab}</div>
                    <div className={`p-4 text-xs text-white/40 border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>{c.mint}</div>
                  </div>
                ))}
              </div>
              {comparisons[0].note && (
                <p className="p-3 text-[10px] text-white/20 text-center">{comparisons[0].note}</p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ PRICING ═══════ */}
      <section id="precios" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <span className="text-[10px] text-[#FF2D92] uppercase tracking-[0.2em] font-semibold">Precios</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-3 mb-4">
                Simple, transparente, <span className="bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">accesible</span>
              </h2>
              <p className="text-white/40 max-w-md mx-auto">
                Empeza gratis. Cuando quieras desbloquear todo el potencial, tenemos un plan que se adapta a vos.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* Free */}
            <Reveal delay={0.1}>
              <div className="p-7 rounded-3xl bg-[#111] border border-white/[0.06] flex flex-col h-full">
                <div className="mb-6">
                  <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-2">Gratis</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">$0</span>
                    <span className="text-white/30 text-sm">/mes</span>
                  </div>
                  <p className="text-xs text-white/30 mt-2">Para empezar a organizarte</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['30 transacciones/mes','Resumen basico','Frase del dia','5 consultas IA/dia','Historial 3 meses'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/50">
                      <Check size={14} className="text-[#10B981] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a href={authPath} className="w-full py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/60 font-semibold text-sm text-center hover:bg-white/[0.08] transition-colors">
                  Empezar gratis
                </a>
              </div>
            </Reveal>

            {/* PRO */}
            <Reveal delay={0.2}>
              <div className="relative p-7 rounded-3xl bg-gradient-to-b from-[#FF2D92]/10 to-[#8B5CF6]/5 border border-[#FF2D92]/30 flex flex-col h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-xs font-bold text-white shadow-lg">
                  Mas popular
                </div>
                <div className="mb-6">
                  <p className="text-xs text-[#FF2D92] uppercase tracking-wider font-semibold mb-2">Pro</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">$4.99</span>
                    <span className="text-white/30 text-sm">/mes</span>
                  </div>
                  <p className="text-xs text-white/30 mt-2">O $39.99/ano (33% off)</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Transacciones ilimitadas',
                    'Experto IA ilimitado',
                    'Graficos avanzados',
                    'Exportar CSV/Excel',
                    'Historial ilimitado',
                    'Soporte prioritario',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={14} className="text-[#FF2D92] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a href={authPath} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-semibold text-sm text-center shadow-[0_4px_20px_rgba(255,45,146,0.3)] hover:shadow-[0_4px_30px_rgba(255,45,146,0.5)] transition-shadow">
                  Empezar Pro
                </a>
              </div>
            </Reveal>

            {/* Familiar */}
            <Reveal delay={0.3}>
              <div className="p-7 rounded-3xl bg-[#111] border border-white/[0.06] flex flex-col h-full">
                <div className="mb-6">
                  <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-2">Familiar</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">$8.99</span>
                    <span className="text-white/30 text-sm">/mes</span>
                  </div>
                  <p className="text-xs text-white/30 mt-2">O $69.99/ano (35% off)</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Todo lo de Pro',
                    'Hasta 5 familiares',
                    'Categorias compartidas',
                    'Resumen grupal mensual',
                    'Metas familiares',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/50">
                      <Check size={14} className="text-[#8B5CF6] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a href={authPath} className="w-full py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/60 font-semibold text-sm text-center hover:bg-white/[0.08] transition-colors">
                  Empezar Familiar
                </a>
              </div>
            </Reveal>
          </div>

          <p className="text-center text-xs text-white/20 mt-6">
            Cancela en cualquier momento. Sin compromisos.
          </p>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section id="faq" className="py-24 bg-[#080808]">
        <div className="max-w-2xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-[10px] text-[#FF2D92] uppercase tracking-[0.2em] font-semibold">FAQ</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-3">
                Preguntas <span className="bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">frecuentes</span>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="rounded-xl bg-[#111] border border-white/[0.06] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm font-medium pr-4">{faq.q}</span>
                    <ChevronDown size={16} className={`text-white/30 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-xs text-white/50 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Empeza a controlar tu dinero
              <span className="block bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
                hoy mismo
              </span>
            </h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Gratis para empezar. Sin tarjeta de credito. Sin compromisos.
            </p>
            <a href={authPath}
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-bold text-lg shadow-[0_4px_30px_rgba(255,45,146,0.4)] hover:shadow-[0_4px_50px_rgba(255,45,146,0.6)] transition-shadow">
              Crear cuenta gratis <ArrowRight size={22} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo.jpg" alt="Tus Finanzas" className="w-7 h-7 rounded-lg object-cover" />
                <span className="font-bold text-sm">Tus Finanzas</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                Controla tus finanzas con un experto IA a tu lado. Simple, seguro y accesible.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Producto</p>
              <ul className="space-y-2">
                {['Funciones','Precios','Seguridad','Roadmap'].map(l => (
                  <li key={l}><a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Soporte</p>
              <ul className="space-y-2">
                {['Centro de ayuda','Contacto','Status','Privacidad'].map(l => (
                  <li key={l}><a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Comparativas</p>
              <ul className="space-y-2">
                {['vs YNAB','vs Mint','vs PocketGuard'].map(l => (
                  <li key={l}><span className="text-xs text-white/30">{l}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-white/20"> {new Date().getFullYear()} Tus Finanzas. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-[10px] text-white/20 hover:text-white/40 transition-colors">Terminos</a>
              <a href="#" className="text-[10px] text-white/20 hover:text-white/40 transition-colors">Privacidad</a>
              <a href="#" className="text-[10px] text-white/20 hover:text-white/40 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
