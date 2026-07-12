import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, AlertTriangle, PartyPopper, RotateCcw, Coins, LineChart, Wallet, Plus, Minus } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { QUOTES_BY_TYPE } from '@/types'

const statusConfig = {
  excellent: { label: 'Excelente', color: 'text-[#00E5FF]', icon: PartyPopper, bg: 'bg-[#00E5FF]/10' },
  good: { label: 'Bueno', color: 'text-[#FFD166]', icon: TrendingUp, bg: 'bg-[#FFD166]/10' },
  regular: { label: 'Regular', color: 'text-[#FF6B35]', icon: AlertTriangle, bg: 'bg-[#FF6B35]/10' },
  critical: { label: 'Crítico', color: 'text-[#FF4D6A]', icon: TrendingDown, bg: 'bg-[#FF4D6A]/10' },
};

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: 'crypto' | 'stock' | 'commodity';
  color: string;
}

const INITIAL_ASSETS: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 92450.50, change: 1.45, type: 'crypto', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', price: 3420.20, change: -0.85, type: 'crypto', color: '#627EEA' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 184.25, change: 0.32, type: 'stock', color: '#A3AAAE' },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 59.45, change: 0.12, type: 'stock', color: '#E01E2B' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.60, change: -2.15, type: 'stock', color: '#CC0000' },
  { symbol: 'GLD', name: 'Oro (ETF)', price: 218.40, change: 0.65, type: 'commodity', color: '#D4AF37' },
];

export default function Quotes() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<'quotes' | 'market'>('market');

  const { data: totals } = trpc.finance.getTotals.useQuery();
  const { data: dailyQuote } = trpc.finance.getDailyQuote.useQuery();
  const createQuote = trpc.finance.createDailyQuote.useMutation({
    onSuccess: () => utils.finance.getDailyQuote.invalidate(),
  });

  const [regenerating, setRegenerating] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  
  // Simulation states
  const [simulationAmount, setSimulationAmount] = useState<number>(10000);
  const [allocations, setAllocations] = useState<Record<string, number>>({
    BTC: 30,
    AAPL: 40,
    GLD: 20,
    CASH: 10,
  });

  const savingsRate = totals && totals.income > 0 ? ((totals.capital / totals.income) * 100) : 0;
  let status: 'excellent' | 'good' | 'regular' | 'critical' = 'regular';
  if (savingsRate > 20) status = 'excellent';
  else if (savingsRate > 10) status = 'good';
  else if (savingsRate >= 0) status = 'regular';
  else status = 'critical';

  const c = statusConfig[status];
  const StatusIcon = c.icon;

  const allQuotes = Object.entries(QUOTES_BY_TYPE).flatMap(([type, qs]) =>
    qs.map((text, i) => ({ id: `${type}-${i}`, text, type: type as keyof typeof statusConfig }))
  );

  // 1. Simulación de ticks de mercado en vivo
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev =>
        prev.map(asset => {
          const percentage = (Math.random() * 0.4 - 0.2) / 100; // +/- 0.2% max change
          const newPrice = Math.max(1, asset.price * (1 + percentage));
          const changeDelta = percentage * 100;
          return {
            ...asset,
            price: newPrice,
            change: asset.change + changeDelta,
          };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      const pool = QUOTES_BY_TYPE[status];
      const text = pool[Math.floor(Math.random() * pool.length)];
      const today = new Date().toISOString().slice(0, 10);
      createQuote.mutate({ text, type: status, date: today });
      setRegenerating(false);
    }, 600);
  };

  // Helper de simulador
  const handleAllocationChange = (symbol: string, value: number) => {
    const totalWithoutCurrent = Object.entries(allocations)
      .filter(([key]) => key !== symbol)
      .reduce((sum, [, val]) => sum + val, 0);

    const targetVal = Math.min(100 - totalWithoutCurrent, Math.max(0, value));
    setAllocations(prev => ({
      ...prev,
      [symbol]: targetVal,
    }));
  };

  const getAssetPrice = (symbol: string) => {
    if (symbol === 'CASH') return 1;
    return assets.find(a => a.symbol === symbol)?.price ?? 1;
  };

  const getAssetChange = (symbol: string) => {
    if (symbol === 'CASH') return 0;
    return assets.find(a => a.symbol === symbol)?.change ?? 0;
  };

  // Cómputo de valores del portafolio simulado
  const totalAllocation = Object.values(allocations).reduce((s, v) => s + v, 0);
  
  const simulatedPortfolioValue = Object.entries(allocations).reduce((total, [symbol, pct]) => {
    const allocatedCash = (pct / 100) * simulationAmount;
    if (symbol === 'CASH') return total + allocatedCash;
    // Si cambia de precio, su valor fluctúa
    const changePct = getAssetChange(symbol) / 100;
    return total + (allocatedCash * (1 + changePct));
  }, 0);

  const simulatedProfit = simulatedPortfolioValue - simulationAmount;
  const simulatedProfitPct = (simulatedProfit / simulationAmount) * 100;

  return (
    <div className="max-w-lg mx-auto px-6 pt-6 pb-20">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <h1 className="font-bold text-lg">Inversiones e Ideas</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-xl bg-[#1A1A1A] border border-white/[0.06] mb-6">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'market'
              ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <LineChart size={14} /> Mercado y Simulador
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quotes'
              ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Sparkles size={14} /> Frases Inteligentes
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'market' ? (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Live Ticker */}
            <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Coins size={14} className="text-[#FF2D92]" /> Cotizaciones en Tiempo Real
                </h2>
                <span className="flex items-center gap-1.5 text-[9px] font-semibold text-[#00E5FF] px-2 py-0.5 rounded-full bg-[#00E5FF]/10 animate-pulse">
                  ● Vivo
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {assets.map((asset) => {
                  const up = asset.change >= 0;
                  return (
                    <div key={asset.symbol} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{asset.symbol}</span>
                          <span className="text-[9px] text-white/30 truncate max-w-[70px]">{asset.name}</span>
                        </div>
                        <p className="text-sm font-extrabold mt-1 text-white/90">
                          ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
                        up ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#FF4D6A]/10 text-[#FF4D6A]'
                      }`}>
                        {up ? '+' : ''}{asset.change.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Portfolio Simulator */}
            <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.06] space-y-4">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-[#8B5CF6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Simulador de Portafolios</h2>
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-semibold">Monto a Invertir (USD)</label>
                <input
                  type="number"
                  value={simulationAmount}
                  onChange={e => setSimulationAmount(Math.max(100, Number(e.target.value)))}
                  className="w-full mt-1.5 px-4 py-3 bg-[#1A1A1A] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#FF2D92]"
                />
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] text-white/40 uppercase font-semibold flex justify-between">
                  <span>Asignación de Activos</span>
                  <span className={totalAllocation === 100 ? 'text-[#10B981]' : 'text-[#FF4D6A]'}>
                    {totalAllocation}% / 100%
                  </span>
                </p>

                {[
                  { symbol: 'BTC', label: 'Bitcoin (Crypto)', color: '#F7931A' },
                  { symbol: 'AAPL', label: 'Apple (Acciones)', color: '#A3AAAE' },
                  { symbol: 'GLD', label: 'Oro (Metales)', color: '#D4AF37' },
                  { symbol: 'CASH', label: 'Renta Fija / Efectivo', color: '#10B981' },
                ].map((alloc) => (
                  <div key={alloc.symbol} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: alloc.color }} />
                        {alloc.label}
                      </span>
                      <span className="font-bold text-white">{allocations[alloc.symbol]}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={allocations[alloc.symbol]}
                        onChange={e => handleAllocationChange(alloc.symbol, Number(e.target.value))}
                        className="flex-1 accent-[#FF2D92]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulation Result Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.04] text-center space-y-1">
                <p className="text-[10px] text-white/30 uppercase">Valor de Portafolio Simulado</p>
                <div className="text-2xl font-black text-white">
                  ${simulatedPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-bold flex items-center justify-center gap-1 ${
                  simulatedProfit >= 0 ? 'text-[#10B981]' : 'text-[#FF4D6A]'
                }`}>
                  {simulatedProfit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{simulatedProfit >= 0 ? '+' : ''}${simulatedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({simulatedProfit >= 0 ? '+' : ''}{simulatedProfitPct.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quotes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className={`p-6 rounded-2xl ${c.bg} border border-white/[0.08]`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <StatusIcon size={24} className={c.color} />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Estado Financiero</p>
                  <p className={`text-xl font-bold ${c.color}`}>{c.label}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-white/30 uppercase">Ingresos</p>
                  <p className="text-sm font-bold text-[#00E5FF]">${(totals?.income ?? 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/30 uppercase">Gastos</p>
                  <p className="text-sm font-bold text-[#FF4D6A]">${(totals?.expense ?? 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/30 uppercase">Ahorro</p>
                  <p className={`text-sm font-bold ${c.color}`}>{savingsRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Daily Quote */}
            {dailyQuote && (
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#FF2D92]/15 via-[#8B5CF6]/15 to-[#6366F1]/15 border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-[#FF2D92]" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#FF2D92]">Frase del Día</span>
                </div>
                <p className="text-lg font-semibold text-white leading-relaxed mb-4">&ldquo;{dailyQuote.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30">{new Date(dailyQuote.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  <button onClick={handleRegenerate} className="flex items-center gap-1.5 text-xs text-[#FF2D92] font-medium">
                    <RotateCcw size={12} className={regenerating ? 'animate-spin' : ''} /> Regenerar
                  </button>
                </div>
              </div>
            )}

            {/* Tips list */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Consejos del Experto</h2>
              {status === 'critical' && (
                <>
                  <Tip title="Hoy no gastes más" desc="Prioriza lo esencial. Si no es indispensable, no lo compres." color="text-[#FF4D6A]" bg="bg-[#FF4D6A]/10" />
                  <Tip title="Revisa tus suscripciones" desc="Cancela todo lo que no uses activamente." color="text-[#FF6B35]" bg="bg-[#FF6B35]/10" />
                  <Tip title="Evita comer fuera" desc="Cocinar en casa puede ahorrarte cientos por mes." color="text-[#FFD166]" bg="bg-[#FFD166]/10" />
                </>
              )}
              {status === 'regular' && (
                <>
                  <Tip title="Crea un fondo de emergencia" desc="Intenta ahorrar al menos un 10% de tus ingresos." color="text-[#FFD166]" bg="bg-[#FFD166]/10" />
                  <Tip title="Revisa los gastos hormiga" desc="Esos cafés y snacks diarios se acumulan rápidamente." color="text-[#FF6B35]" bg="bg-[#FF6B35]/10" />
                </>
              )}
              {status === 'good' && (
                <>
                  <Tip title="Considera invertir" desc="Con tu buen nivel de ahorro, podrías empezar a hacer crecer tu capital." color="text-[#00E5FF]" bg="bg-[#00E5FF]/10" />
                  <Tip title="Mantén el ritmo" desc="Lo estás haciendo muy bien. Sigue con esta constancia." color="text-[#10B981]" bg="bg-[#10B981]/10" />
                </>
              )}
              {status === 'excellent' && (
                <>
                  <Tip title="Diversifica tus inversiones" desc="Tu capacidad de ahorro es sólida. Investiga brokers locales." color="text-[#00E5FF]" bg="bg-[#00E5FF]/10" />
                  <Tip title="Planifica metas grandes" desc="Con esta disciplina, puedes pensar en comprar un auto o vivienda propia." color="text-[#8B5CF6]" bg="bg-[#8B5CF6]/10" />
                </>
              )}
            </div>

            {/* All Quotes list */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Todas las frases del sistema</h2>
              {allQuotes.map((q) => (
                <div key={q.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-white/60 mb-1">{q.text}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${statusConfig[q.type].color}`}>
                    {statusConfig[q.type].label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tip({ title, desc, color, bg }: { title: string; desc: string; color: string; bg: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Sparkles size={14} className={color} />
      </div>
      <div>
        <p className={`text-sm font-semibold ${color} mb-0.5`}>{title}</p>
        <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

