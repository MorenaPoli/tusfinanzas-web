import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, Trash2, TrendingUp, Wallet, CreditCard, PiggyBank, Gem, MapPin } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

function useFinancialContext() {
  const { data: totals } = trpc.finance.getTotals.useQuery();
  const { user } = useAuth();
  return {
    income: totals?.income ?? 0,
    expense: totals?.expense ?? 0,
    capital: totals?.capital ?? 0,
    debt: totals?.debt ?? 0,
    assets: totals?.asset ?? 0,
    netWorth: totals?.netWorth ?? 0,
    investment: totals?.investment ?? 0,
    country: (user as any)?.country || 'Argentina',
  };
}

// Country-specific financial data
const COUNTRY_DATA: Record<string, {
  currency: string;
  brokers: string;
  bondSites: string;
  cryptoExchanges: string;
  banks: string;
  examples: string;
  taxNotes: string;
}> = {
  Argentina: {
    currency: 'ARS',
    brokers: 'IOL (invertironline.com), Balanz, PPI, Bull Market',
    bondSites: 'invertironline.com, tu home banking',
    cryptoExchanges: 'Lemon Cash, Buenbit, Ripio, Belo',
    banks: 'Mercado Pago, Brubank, Naranja X',
    examples: 'AL30, GD30, TX26 (bonos argentinos). CEDEARS como VOO, AAPL en pesos.',
    taxNotes: 'Bienes Personales: minimo no alcanzado hasta $100M ARS. Ganancias: 5% sobre renta financiera.',
  },
  Mexico: {
    currency: 'MXN',
    brokers: 'GBM+, Kuspit, Bursanet, CetesDirecto',
    bondSites: 'cetesdirecto.com (sin comision)',
    cryptoExchanges: 'Bitso, Binance P2P',
    banks: 'BBVA, Banorte, Hey Banco',
    examples: 'Cetes (28/91/182 dias), Udibonos, S&P 500 ETF (CETES+GBM)',
    taxNotes: 'ISR: 0.15% sobre ganancias en bolsa. Cetes estan exentos.',
  },
  Colombia: {
    currency: 'COP',
    brokers: 'Tecnoaccion, Acciones y Valores, Alianza',
    bondSites: 'tu banco de confianza',
    cryptoExchanges: 'Buda, Binance P2P',
    banks: 'Nequi, Daviplata, Lulo Bank',
    examples: 'TES UVR, CDT, ETF COLCAP',
    taxNotes: 'Rentas no laborales: 10% retencion en la fuente.',
  },
  Chile: {
    currency: 'CLP',
    brokers: 'LarrainVial, Banchile, Renta4, Fintual',
    bondSites: 'tu AFP o cuenta 2 (voluntaria)',
    cryptoExchanges: 'Buda, Orionx',
    banks: 'Banco Itau, Banco de Chile, Tenpo',
    examples: 'Fondo Mutuo APV, ETF S&P 500, Deposito a Plazo',
    taxNotes: 'Retiros AFP: primeras 150 UF anuales sin retencion.',
  },
  Espana: {
    currency: 'EUR',
    brokers: 'MyInvestor, Indexa Capital, Interactive Brokers',
    bondSites: 'cartera personal en broker',
    cryptoExchanges: 'Bitpanda, Binance EU',
    banks: 'N26, Revolut, Trade Republic',
    examples: 'ETF Vanguard (VWCE, VUSA), Letras del Tesoro, Pagarés bancarios',
    taxNotes: 'IRPF: 19% hasta 6.000 EUR, 21% hasta 50.000 EUR, 23% resto. Exento primeros 1.500 EUR de dividendos.',
  },
  default: {
    currency: 'USD',
    brokers: 'Interactive Brokers, TD Ameritrade',
    bondSites: 'treasurydirect.gov, broker',
    cryptoExchanges: 'Coinbase, Binance, Kraken',
    banks: 'Wise, Revolut',
    examples: 'VOO, VTI, VXUS, BNDW (ETFs globales)',
    taxNotes: 'Consulta tu contador local.',
  },
};

function getCountryData(country: string) {
  return COUNTRY_DATA[country] || COUNTRY_DATA.default;
}



// ... rest of component stays the same
function FinItem({ icon: Icon, color, label, value }: { icon: typeof TrendingUp; color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} style={{ color }} />
      <div>
        <p className="text-[10px] text-white/40">{label}</p>
        <p className="text-sm font-bold" style={{ color }}>${value.toLocaleString('en-US')}</p>
      </div>
    </div>
  );
}

export default function AIChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFree } = useSubscription();
  const ctx = useFinancialContext();
  const utils = trpc.useUtils();

  const { data: dbMessages } = trpc.finance.listChatMessages.useQuery();
  const sendMessage = trpc.finance.sendMessage.useMutation({
    onSuccess: () => utils.finance.listChatMessages.invalidate(),
  });
  const clearChat = trpc.finance.clearChat.useMutation({
    onSuccess: () => utils.finance.listChatMessages.invalidate(),
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const todayUserMessages = messages.filter(m => m.role === 'user').length;
  const freeChatLimit = 100;
  const freeChatBlocked = isFree && todayUserMessages >= freeChatLimit;

  useEffect(() => {
    if (dbMessages) setMessages(dbMessages.map(m => ({ id: m.id, role: m.role, content: m.content })));
  }, [dbMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading || freeChatBlocked) return;
    const text = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Add user message optimistically to the local state so the user sees it immediately
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: text }]);
    
    sendMessage.mutate(
      { content: text },
      {
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: (err) => {
          setIsLoading(false);
          alert(err.message);
        }
      }
    );
  };

  const quickPrompts = [
    'Quiero invertir $500',
    'Como pago mis deudas',
    'Fondo de emergencia',
    `Brokers en ${ctx.country}`,
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
              <ArrowLeft size={20} className="text-white/60" />
            </button>
            <img src="/logo.jpg" alt="Tu Experto" className="w-9 h-9 rounded-full object-cover shadow-[0_0_20px_rgba(255,45,146,0.3)]" />
            <div>
              <h1 className="font-bold text-sm">Tu Experto</h1>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] text-white/40">En linea</span>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-white/40">
              <MapPin size={10} /> {ctx.country}
            </div>
          </div>
          <button onClick={() => clearChat.mutate()} className="p-2 rounded-xl hover:bg-white/5 transition-colors" title="Limpiar conversacion">
            <Trash2 size={16} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-full mx-auto mb-6 shadow-[0_0_40px_rgba(255,45,146,0.15)] overflow-hidden">
                <img src="/logo.jpg" alt="Tu Experto" className="w-full h-full object-cover" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Tu Experto Financiero</h2>
              <p className="text-sm text-white/40 mb-2 max-w-sm mx-auto">
                Te ayudo con instrucciones concretas para {ctx.country}.
              </p>
              <div className="flex items-center justify-center gap-1 mb-6 px-2 py-1 rounded-full bg-white/[0.05] text-[10px] text-white/40 inline-flex">
                <MapPin size={10} /> Recomendaciones para {ctx.country}
              </div>

              {/* Financial Summary */}
              {(ctx.income > 0 || ctx.expense > 0) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left max-w-sm mx-auto">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#FF2D92] mb-4">Tu situacion actual</p>
                  <div className="grid grid-cols-2 gap-4">
                    {ctx.income > 0 && <FinItem icon={TrendingUp} color="#00E5FF" label="Ingresos" value={ctx.income} />}
                    {ctx.expense > 0 && <FinItem icon={Wallet} color="#FF4D6A" label="Gastos" value={ctx.expense} />}
                    {ctx.debt > 0 && <FinItem icon={CreditCard} color="#EF4444" label="Deudas" value={ctx.debt} />}
                    {ctx.assets > 0 && <FinItem icon={Gem} color="#8B5CF6" label="Bienes" value={ctx.assets} />}
                    {ctx.investment > 0 && <FinItem icon={PiggyBank} color="#10B981" label="Inversiones" value={ctx.investment} />}
                    {ctx.netWorth !== 0 && <FinItem icon={TrendingUp} color={ctx.netWorth >= 0 ? '#FFD166' : '#FF4D6A'} label="Patrimonio" value={ctx.netWorth} />}
                  </div>
                </motion.div>
              )}

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((p, i) => (
                  <motion.button key={p} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    onClick={() => setInput(p)}
                    className="px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-white/60 hover:bg-white/[0.1] hover:border-white/[0.15] transition-all">
                    {p}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' && (
                      <img src="/logo.jpg" alt="Experto" className="w-9 h-9 rounded-full object-cover shrink-0 shadow-[0_0_12px_rgba(255,45,146,0.3)]" />
                    )}
                    {msg.role === 'user' && (
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white/60">{(user?.name || 'U')[0]}</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'assistant'
                        ? 'bg-white/[0.04] border border-white/[0.08] text-white/80'
                        : 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <img src="/logo.jpg" alt="Experto" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-6 pb-6 pt-3 bg-gradient-to-t from-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          {isFree && messages.length > 0 && (
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[10px] text-white/20">
                {freeChatBlocked ? 'Limite diario alcanzado' : `${freeChatRemaining} mensajes gratis hoy`}
              </span>
              {freeChatBlocked && (
                <button onClick={() => navigate('/checkout')} className="text-[10px] text-[#FF2D92] hover:underline">
                  Suscribite a Pro para ilimitado
                </button>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !freeChatBlocked && (e.preventDefault(), handleSend())}
              placeholder={freeChatBlocked ? 'Limite alcanzado. Suscribite a Pro.' : `Preguntame sobre finanzas en ${ctx.country}...`}
              className="flex-1 px-5 py-4 bg-[#1A1A1A] border border-white/[0.08] rounded-full text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#8B5CF6] transition-colors"
              disabled={isLoading || freeChatBlocked} />
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim() || isLoading || freeChatBlocked}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                input.trim() && !freeChatBlocked ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] shadow-[0_0_20px_rgba(255,45,146,0.3)]' : 'bg-white/[0.05]'
              }`}>
              <Send size={18} className={input.trim() && !freeChatBlocked ? 'text-white' : 'text-white/30'} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
