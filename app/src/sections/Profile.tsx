import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Globe, Palette, Save, Coins, MessageSquare, Trash2, Check, Sparkles, Shield } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeType } from '@/hooks/useTheme'

const AVATAR_PRESETS = ['🚀', '🦁', '🦊', '🦄', '🤖', '🦅', '👑', '💎', '🍀', '⚡', '🌟', '🎯'];

const THEMES: { id: ThemeType; name: string; colors: string; desc: string }[] = [
  { id: 'neon', name: 'Obsidiana Neón', colors: 'from-[#FF2D92] to-[#8B5CF6]', desc: 'Tema clásico con auroras rosa y morado' },
  { id: 'emerald', name: 'Bosque Esmeralda', colors: 'from-[#10B981] to-[#059669]', desc: 'Estilo ecológico con tonos verdes y teal' },
  { id: 'sapphire', name: 'Zafiro Profundo', colors: 'from-[#3B82F6] to-[#6366F1]', desc: 'Aspecto tecnológico con índigo y azul' },
  { id: 'cyber', name: 'Ámbar Ciberpunk', colors: 'from-[#F59E0B] to-[#EF4444]', desc: 'Estilo energético con naranja y rojo' }
];

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState(user?.name || '');
  const [country, setCountry] = useState(user?.country || 'Argentina');
  const [avatar, setAvatar] = useState(user?.avatar || '🚀');
  const [currency, setCurrency] = useState(() => localStorage.getItem('tusfinanzas_currency') || 'USD');
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState(() => localStorage.getItem('tusfinanzas_lang') || 'es');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { data: goals = [] } = trpc.goals.list.useQuery();
  const { data: budgetReport = [] } = trpc.budget.getBudgetReport.useQuery();
  const { data: portfolio } = trpc.finance.getPortfolio.useQuery();
  const { data: transactions = [] } = trpc.finance.listTransactions.useQuery();
  const { data: bills = [] } = trpc.bills.listBills.useQuery();
  const { data: sessions = [] } = trpc.auth.listSessions.useQuery();

  const achievements = useMemo(() => {
    const hasGoals = goals.length > 0;
    const hasPortfolio = (portfolio?.holdings?.length ?? 0) > 0;
    const hasBudgets = budgetReport.length >= 2;
    const hasTransactions = transactions.length >= 5;
    const hasBillsPaid = bills.length > 0 && bills.every(b => b.isPaid === 1);

    const list = [
      { id: 'ahorrador', title: 'Ahorrador Estrella', desc: 'Tienes al menos 1 meta de ahorro activa.', active: hasGoals, icon: '🎯' },
      { id: 'inversor', title: 'Inversor Activo', desc: 'Posees activos en tu cartera virtual.', active: hasPortfolio, icon: '📈' },
      { id: 'previsor', title: 'Planificador Consecuente', desc: 'Definiste 2 o más presupuestos de gastos.', active: hasBudgets, icon: '🛡️' },
      { id: 'organizado', title: 'Finanzas Ordenadas', desc: 'Registraste 5 o más movimientos.', active: hasTransactions, icon: '📊' },
      { id: 'al_dia', title: 'Al Día con Cuentas', desc: 'Tienes todos tus vencimientos pagados.', active: hasBillsPaid, icon: '⚡' },
    ];

    const score = Math.round((list.filter(a => a.active).length / list.length) * 100);
    return { list, score };
  }, [goals, budgetReport, portfolio, transactions, bills]);

  // Sync state if user query loads later
  useEffect(() => {
    if (user) {
      setName(user.name);
      setCountry(user.country || 'Argentina');
      setAvatar(user.avatar || '🚀');
    }
  }, [user]);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      // Force reload page / reload user context
      utils.auth.me.invalidate();
      setSuccessMsg('¡Perfil actualizado con éxito!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  });

  const clearChat = trpc.finance.clearChat.useMutation({
    onSuccess: () => {
      alert('Historial de chat borrado.');
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update DB profile details
      await updateProfile.mutateAsync({
        name,
        country,
        avatar
      });

      // 2. Update local storage preferences
      localStorage.setItem('tusfinanzas_currency', currency);
      localStorage.setItem('tusfinanzas_theme', theme);
      localStorage.setItem('tusfinanzas_lang', language);

      // Force currency list invalidation if exists
      utils.finance.getTotals.invalidate();
    } catch (err) {
      alert('Error al guardar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = () => {
    const conf = confirm('¿Estás seguro de que deseas eliminar TODOS tus datos financieros? Esta acción no se puede deshacer.');
    if (conf) {
      alert('Para eliminar tu cuenta de forma permanente, por favor ponte en contacto con soporte a través de WhatsApp.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-6 pb-24 bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <h1 className="font-bold text-xl">Mi Perfil e Iconografía</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card & Avatar Selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl glass-strong border border-white/[0.08] relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top left, rgba(255,45,146,0.1) 0%, transparent 60%)' }} />
          
          <div className="relative">
            <h3 className="font-bold text-sm text-white/80 mb-4 flex items-center gap-2">
              <User size={16} className="text-[#FF2D92]" /> Detalle Personal e Avatar
            </h3>

            {/* Avatar Selector Showcase */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FF2D92]/20 to-[#8B5CF6]/20 border-2 border-[#FF2D92]/50 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(255,45,146,0.25)] select-none">
                {avatar}
              </div>
              <div className="flex-1 w-full">
                <span className="text-xs text-white/50 block mb-2 font-medium">Selecciona un icono como foto de perfil</span>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        avatar === emoji 
                          ? 'bg-[#FF2D92]/20 border border-[#FF2D92] scale-110 shadow-[0_0_10px_rgba(255,45,146,0.3)]' 
                          : 'glass border-white/5 hover:bg-white/5'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold block">Nombre en la Plataforma</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Ej: Nicolás Poli"
                className="w-full px-4 py-3 glass border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#FF2D92] transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Financial & Location Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-bold text-sm text-white/80 flex items-center gap-2">
            <Globe size={16} className="text-[#8B5CF6]" /> Configuración Local y Divisas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Country Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold block">País (Ajusta los consejos de IA)</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="Argentina" className="bg-[#0A0A0A]">Argentina</option>
                <option value="Mexico" className="bg-[#0A0A0A]">México</option>
                <option value="Espana" className="bg-[#0A0A0A]">España</option>
                <option value="Colombia" className="bg-[#0A0A0A]">Colombia</option>
                <option value="Chile" className="bg-[#0A0A0A]">Chile</option>
                <option value="Uruguay" className="bg-[#0A0A0A]">Uruguay</option>
                <option value="Otro" className="bg-[#0A0A0A]">Otro / Global</option>
              </select>
            </div>

            {/* Default Currency Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/60 font-semibold block">Divisa Predeterminada</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="USD" className="bg-[#0A0A0A]">Dólar (USD)</option>
                <option value="ARS" className="bg-[#0A0A0A]">Peso Argentino (ARS)</option>
                <option value="MXN" className="bg-[#0A0A0A]">Peso Mexicano (MXN)</option>
                <option value="EUR" className="bg-[#0A0A0A]">Euro (EUR)</option>
                <option value="COP" className="bg-[#0A0A0A]">Peso Colombiano (COP)</option>
                <option value="CLP" className="bg-[#0A0A0A]">Peso Chileno (CLP)</option>
                <option value="UYU" className="bg-[#0A0A0A]">Peso Uruguayo (UYU)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Customizations / Page Themes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-6 rounded-3xl glass-card space-y-4">
          <h3 className="font-bold text-sm text-white/80 flex items-center gap-2">
            <Palette size={16} className="text-[#00E5FF]" /> Personalización de Pantalla
          </h3>

          <div className="space-y-3">
            <span className="text-xs text-white/50 block font-medium">Selecciona el tema de fondo</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEMES.map(t => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 relative overflow-hidden ${
                      active 
                        ? 'bg-white/[0.06] border-white/20 text-white shadow-md' 
                        : 'bg-white/[0.01] border-white/[0.04] text-white/60 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">{t.name}</span>
                      <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${t.colors} flex items-center justify-center shrink-0`}>
                        {active && <Check size={8} className="text-white" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-white/40 leading-snug">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs text-white/60 font-semibold block">Idioma de Asesoría</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="es" className="bg-[#0A0A0A]">Español (Latinoamérica)</option>
              <option value="es-ES" className="bg-[#0A0A0A]">Español (España)</option>
              <option value="en" className="bg-[#0A0A0A]">English (United States)</option>
            </select>
          </div>

          {/* Achievements Section */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white/80 flex items-center gap-2">
                <Sparkles size={16} className="text-theme-accent" /> Logros y Salud Financiera
              </h3>
              <span className="text-xs font-black text-theme-accent">{achievements.score}% Score</span>
            </div>

            <div className="space-y-1">
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-theme-accent to-[#00E5FF] transition-all duration-1000" style={{ width: `${achievements.score}%` }} />
              </div>
              <p className="text-[10px] text-white/30 text-right font-medium">Índice general de constancia financiera</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.list.map((ach) => (
                <div key={ach.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  ach.active 
                    ? 'bg-white/[0.03] border-theme-accent/30 text-white shadow-sm' 
                    : 'bg-white/[0.01] border-white/[0.04] text-white/30 opacity-60'
                }`}>
                  <span className="text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">{ach.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{ach.title}</h4>
                    <p className="text-[9px] text-white/40 mt-0.5 leading-snug">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notifications / Feedback message */}
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <Sparkles size={14} className="animate-spin" /> {successMsg}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-bold text-sm shadow-[0_4px_24px_rgba(255,45,146,0.3)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      {/* Account Safety Settings */}
      <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-4">
        <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest">Zona de Seguridad y Datos</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => clearChat.mutate()}
            className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] text-left transition-all group"
          >
            <MessageSquare size={18} className="text-white/40 group-hover:text-white transition-colors mb-2" />
            <p className="text-xs font-bold text-white/80">Limpiar Historial de Chat</p>
            <p className="text-[10px] text-white/30 mt-0.5">Borra la conversación completa con el experto IA</p>
          </button>

          <button
            type="button"
            onClick={handleDeleteData}
            className="p-4 rounded-2xl bg-[#FF4D6A]/5 border border-[#FF4D6A]/10 hover:bg-[#FF4D6A]/10 text-left transition-all group"
          >
            <Trash2 size={18} className="text-[#FF4D6A]/60 group-hover:text-[#FF4D6A] transition-colors mb-2" />
            <p className="text-xs font-bold text-red-300">Eliminar Mis Datos</p>
            <p className="text-[10px] text-[#FF4D6A]/40 mt-0.5">Remueve transacciones, presupuestos e historial</p>
          </button>
        </div>

        {/* Session Audit trail */}
        <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
          <h5 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
            <Shield size={14} className="text-[#FF2D92]" /> Historial de Sesiones Activas
          </h5>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <p className="text-xs text-white/20">Cargando historial de sesiones...</p>
            ) : (
              sessions.map((s) => {
                const ua = s.userAgent.toLowerCase();
                let platform = "Dispositivo";
                if (ua.includes("windows")) platform = "Windows";
                else if (ua.includes("macintosh") || ua.includes("mac os x")) platform = "macOS";
                else if (ua.includes("linux")) platform = "Linux";
                else if (ua.includes("android")) platform = "Android";
                else if (ua.includes("iphone") || ua.includes("ipad")) platform = "iOS";

                let browser = "Navegador";
                if (ua.includes("firefox")) browser = "Firefox";
                else if (ua.includes("chrome") && !ua.includes("chromium")) browser = "Chrome";
                else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
                else if (ua.includes("edge")) browser = "Edge";

                return (
                  <div key={s.id} className="flex justify-between items-center p-3 rounded-xl glass text-xs">
                    <div>
                      <p className="font-bold text-white/80">{platform} · {browser}</p>
                      <p className="text-[10px] text-white/30 mt-0.5 font-mono">IP: {s.ipAddress}</p>
                    </div>
                    <span className="text-[10px] text-white/40 font-semibold font-mono">
                      {new Date(s.createdAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
