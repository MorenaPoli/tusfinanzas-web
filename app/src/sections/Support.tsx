import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageCircle, Mail, HelpCircle, Bug, Lightbulb, Plus, Clock, CheckCircle2, Ticket } from 'lucide-react'
import { trpc } from '@/providers/trpc'

export default function Support() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: tickets, isLoading: loadingTickets } = trpc.support.myTickets.useQuery();
  const createTicket = trpc.support.createTicket.useMutation({
    onSuccess: () => {
      utils.support.myTickets.invalidate();
      setSubject('');
      setMessage('');
      setShowForm(false);
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    createTicket.mutate(
      { subject, message },
      {
        onSuccess: () => setSubmitting(false),
        onError: () => setSubmitting(false),
      }
    );
  };

  const faqs = [
    {
      q: 'Cuanto cuesta TusFinanzas?',
      a: 'TusFinanzas es gratis para empezar. El plan Pro cuesta $4.99/mes o $39.99/ano (33% de descuento). El plan Familiar cuesta $8.99/mes o $69.99/ano.',
    },
    {
      q: 'Puedo cambiar de plan en cualquier momento?',
      a: 'Si, podes upgradear o downgradear tu plan en cualquier momento. Si cancelas, seguis teniendo acceso hasta el final del periodo pagado.',
    },
    {
      q: 'Mis datos estan seguros?',
      a: 'Absolutamente. Tus datos financieros se almacenan en una base de datos encriptada. Nadie mas puede ver tu informacion. Usamos autenticacion OAuth 2.0 de Kimi.',
    },
    {
      q: 'Que pasa si alcanzo el limite del plan gratis?',
      a: 'El plan gratis incluye 30 transacciones por mes y 5 mensajes con tu experto IA por dia. Si los alcanzas, te pedimos que consideres el plan Pro para funciones ilimitadas.',
    },
    {
      q: 'Como funciona el experto IA?',
      a: 'Tu experto IA es un asistente financiero que te da instrucciones concretas (no consejos vagos). Te dice exactamente en que pagina ir, cuanto invertir, que tickers comprar, etc.',
    },
    {
      q: 'Puedo exportar mis datos?',
      a: 'La exportacion a CSV/Excel esta disponible en el plan Pro. Desde el plan gratis siempre podes ver y gestionar tus transacciones dentro de la app.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 pt-6 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <h1 className="font-bold text-xl">Soporte y Ayuda</h1>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#FF2D92]/10 to-[#8B5CF6]/5 border border-[#FF2D92]/10">
          <MessageCircle size={24} className="text-[#FF2D92] mb-3" />
          <h3 className="font-semibold text-sm mb-1">Chat con soporte</h3>
          <p className="text-xs text-white/40 mb-3">Responde en menos de 24 horas</p>
          <button onClick={() => navigate('/chat')} className="text-xs text-[#FF2D92] font-medium hover:underline">
            Ir al chat →
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/[0.06]">
          <Mail size={24} className="text-[#8B5CF6] mb-3" />
          <h3 className="font-semibold text-sm mb-1">Email</h3>
          <p className="text-xs text-white/40 mb-3">soporte@tusfinanzas.app</p>
          <span className="text-xs text-white/20">Respondemos en 24-48hs</span>
        </motion.div>
      </div>

      {/* Support Tickets Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/60">Mis Tickets de Soporte</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white font-medium text-xs shadow-md">
            <Plus size={14} /> {showForm ? 'Cancelar' : 'Nuevo Ticket'}
          </button>
        </div>

        {/* Create Ticket Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateTicket} className="overflow-hidden mb-4 space-y-3">
              <div className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/[0.06] space-y-3">
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Asunto</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                    placeholder="Ej: Error al procesar pago"
                    className="w-full mt-1 px-4 py-3 bg-[#111] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92]"
                    required minLength={5} maxLength={200} />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Mensaje</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Describe detalladamente el inconveniente para que podamos ayudarte..."
                    rows={4}
                    className="w-full mt-1 px-4 py-3 bg-[#111] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92] resize-none"
                    required minLength={10} maxLength={5000} />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white font-semibold text-sm disabled:opacity-50">
                  {submitting ? 'Enviando...' : 'Enviar Ticket'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Tickets List */}
        {loadingTickets ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#1A1A1A] border border-white/[0.04] text-center">
            <Ticket size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">No tenés tickets activos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-[#1A1A1A] border border-white/[0.04] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/80">{t.subject}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-semibold uppercase tracking-wider ${
                      t.status === 'open' ? 'bg-[#FFD166]/10 text-[#FFD166]' :
                      t.status === 'in_progress' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' :
                      t.status === 'resolved' ? 'bg-[#10B981]/10 text-[#10B981]' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {t.status === 'open' ? 'Abierto' :
                       t.status === 'in_progress' ? 'En Curso' :
                       t.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">{t.message}</p>
                  <p className="text-[10px] text-white/20">{new Date(t.createdAt).toLocaleDateString('es-ES')} · {new Date(t.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="shrink-0 mt-1">
                  {t.status === 'resolved' || t.status === 'closed' ? (
                    <CheckCircle2 size={14} className="text-[#10B981]" />
                  ) : (
                    <Clock size={14} className="text-white/30" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick help */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
        <h2 className="text-sm font-semibold text-white/60 mb-4">Temas rapidos</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: HelpCircle, label: 'Como empezar', action: () => navigate('/dashboard') },
            { icon: Lightbulb, label: 'Consejos de ahorro', action: () => navigate('/chat') },
            { icon: Bug, label: 'Reportar un problema', action: () => navigate('/chat') },
            { icon: MessageCircle, label: 'Preguntar a la IA', action: () => navigate('/chat') },
          ].map((item) => (
            <button key={item.label} onClick={item.action}
              className="p-4 rounded-xl bg-[#1A1A1A] border border-white/[0.06] hover:border-white/[0.1] transition-all text-left">
              <item.icon size={18} className="text-[#FF2D92] mb-2" />
              <p className="text-xs font-medium">{item.label}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* FAQs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="text-sm font-semibold text-white/60 mb-4">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              className="p-4 rounded-xl bg-[#1A1A1A] border border-white/[0.04]">
              <p className="text-sm font-medium mb-1">{faq.q}</p>
              <p className="text-xs text-white/50 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
