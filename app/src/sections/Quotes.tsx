import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, AlertTriangle, PartyPopper, RotateCcw, Coins, LineChart, Wallet, Plus, Minus, X } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { QUOTES_BY_TYPE } from '@/types';
import MiniKeypad from '@/components/MiniKeypad';

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

const generateSparklinePoints = (symbol: string, currentPrice: number, change: number) => {
  const points = [];
  const seed = symbol.charCodeAt(0) + (symbol.charCodeAt(1) || 0);
  let val = currentPrice * (1 - (change / 100));
  points.push(val);
  
  for (let i = 1; i <= 5; i++) {
    const factor = Math.sin(seed + i) * 0.015;
    val = val * (1 + factor);
    points.push(val);
  }
  points.push(currentPrice);
  
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  
  return points.map((p, idx) => {
    const x = (idx / 6) * 44 + 2;
    const y = 22 - ((p - min) / range) * 18 + 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
};

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
  const [activeTab, setActiveTab] = useState<'quotes' | 'market' | 'portfolio'>('market');

  const { data: totals } = trpc.finance.getTotals.useQuery();
  const { data: dailyQuote } = trpc.finance.getDailyQuote.useQuery();
  
  const { data: portfolio, refetch: refetchPortfolio } = trpc.finance.getPortfolio.useQuery();

  const buyAsset = trpc.finance.buyAsset.useMutation({
    onSuccess: () => {
      refetchPortfolio();
      setSelectedAsset(null);
      setTradeShares('1');
      setShowKeypad(false);
    },
    onError: (err) => {
      alert(err.message || 'Error al comprar.');
    }
  });

  const sellAsset = trpc.finance.sellAsset.useMutation({
    onSuccess: () => {
      refetchPortfolio();
      setSelectedAsset(null);
      setTradeShares('1');
      setShowKeypad(false);
    },
    onError: (err) => {
      alert(err.message || 'Error al vender.');
    }
  });

  const [regenerating, setRegenerating] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  
  // Trade Modal states
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = useState('1');
  const [showKeypad, setShowKeypad] = useState(false);

  // Asset allocation simulation states
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

  // Simulated ticks of market in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      setAssets(prev =>
        prev.map(asset => {
          const percentage = (Math.random() * 0.4 - 0.2) / 100;
          const newPrice = Math.max(1, asset.price * (1 + percentage));
          const changeDelta = percentage * 100;
          return {
            ...asset,
            price: newPrice,
            change: Number((asset.change + changeDelta).toFixed(2)),
          };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      utils.finance.getDailyQuote.invalidate();
      setRegenerating(false);
    }, 600);
  };

  const handleAllocationChange = (symbol: string, val: number) => {
    const parsed = Math.max(0, Math.min(100, val));
    const newAllocations = { ...allocations, [symbol]: parsed };
    const otherSymbols = Object.keys(newAllocations).filter(s => s !== symbol);

    const remaining = 100 - parsed;
    const sumOthers = otherSymbols.reduce((sum, s) => sum + allocations[s], 0);

    if (sumOthers > 0) {
      otherSymbols.forEach(s => {
        newAllocations[s] = Math.round((allocations[s] / sumOthers) * remaining);
      });
    } else if (otherSymbols.length > 0) {
      const share = Math.floor(remaining / otherSymbols.length);
      otherSymbols.forEach(s => {
        newAllocations[s] = share;
      });
    }

    // Rounding adjustment
    const currentTotal = Object.values(newAllocations).reduce((sum, v) => sum + v, 0);
    const error = 100 - currentTotal;
    if (error !== 0 && otherSymbols.length > 0) {
      newAllocations[otherSymbols[0]] = Math.max(0, newAllocations[otherSymbols[0]] + error);
    }

    setAllocations(newAllocations);
  };

  const getAssetPrice = (symbol: string) => {
    if (symbol === 'CASH') return 1;
    return assets.find(a => a.symbol === symbol)?.price ?? 1;
  };

  const getAssetChange = (symbol: string) => {
    if (symbol === 'CASH') return 0;
    return assets.find(a => a.symbol === symbol)?.change ?? 0;
  };

  const totalAllocation = Object.values(allocations).reduce((s, v) => s + v, 0);
  const simulatedPortfolioValue = Object.entries(allocations).reduce((total, [symbol, pct]) => {
    const allocatedCash = (pct / 100) * simulationAmount;
    if (symbol === 'CASH') return total + allocatedCash;
    const changePct = getAssetChange(symbol) / 100;
    return total + (allocatedCash * (1 + changePct));
  }, 0);

  const simulatedProfit = simulatedPortfolioValue - simulationAmount;
  const simulatedProfitPct = (simulatedProfit / simulationAmount) * 100;

  // Real-time calculations for virtual portfolio
  const portfolioHoldings = portfolio?.holdings || [];
  const virtualCash = portfolio?.cash ?? 100000;
  
  const totalHoldingsCost = portfolioHoldings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
  const totalHoldingsValue = portfolioHoldings.reduce((sum, h) => {
    const price = getAssetPrice(h.symbol);
    return sum + (h.shares * price);
  }, 0);

  const totalVirtualPortfolioVal = virtualCash + totalHoldingsValue;
  const totalPortfolioProfit = totalHoldingsValue - totalHoldingsCost;
  const portfolioProfitPercent = totalHoldingsCost > 0 ? (totalPortfolioProfit / totalHoldingsCost) * 100 : 0;

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    const sharesNum = parseFloat(tradeShares);
    if (isNaN(sharesNum) || sharesNum <= 0) {
      alert("Por favor ingrese una cantidad válida mayor a 0.");
      return;
    }
    if (tradeType === 'buy') {
      buyAsset.mutate({
        symbol: selectedAsset.symbol,
        shares: sharesNum,
        price: selectedAsset.price,
      });
    } else {
      sellAsset.mutate({
        symbol: selectedAsset.symbol,
        shares: sharesNum,
        price: selectedAsset.price,
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 pt-6 pb-20 bg-transparent">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <h1 className="font-bold text-lg">Inversiones Simuladas</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-xl glass mb-6">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'market'
              ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <LineChart size={14} /> Mercado
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'portfolio'
              ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Wallet size={14} /> Mi Cartera
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quotes'
              ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-lg'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <Sparkles size={14} /> Consejos
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'market' && (
          <motion.div key="market" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
            {/* Live Ticker */}
            <div className="p-5 rounded-2xl glass-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Coins size={14} className="text-[#FF2D92]" /> Cotizaciones y Operaciones
                </h2>
                <span className="flex items-center gap-1.5 text-[9px] font-semibold text-[#00E5FF] px-2 py-0.5 rounded-full bg-[#00E5FF]/10 animate-pulse">
                  ● Vivo
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {assets.map((asset) => {
                  const up = asset.change >= 0;
                  const sparklinePoints = generateSparklinePoints(asset.symbol, asset.price, asset.change);

                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setTradeType('buy');
                        setTradeShares('1');
                      }}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] flex items-center justify-between text-left transition-all hover:scale-[1.01]"
                    >
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{asset.symbol}</span>
                          <span className="text-[9px] text-white/30 truncate max-w-[50px]">{asset.name}</span>
                        </div>
                        <p className="text-sm font-extrabold mt-1 text-white/90">
                          ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>

                      <svg className="w-12 h-6 shrink-0 select-none mr-2">
                        <polyline fill="none" stroke={up ? '#10B981' : '#FF4D6A'} strokeWidth="1.5" points={sparklinePoints} />
                      </svg>

                      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold shrink-0 ${
                        up ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#FF4D6A]/10 text-[#FF4D6A]'
                      }`}>
                        {up ? '+' : ''}{asset.change.toFixed(2)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Portfolio Allocator Simulator */}
            <div className="p-5 rounded-2xl glass-card space-y-4">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-[#8B5CF6]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Simulador de Asignación</h2>
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-semibold">Monto de Simulación (USD)</label>
                <input
                  type="number"
                  value={simulationAmount}
                  onChange={e => setSimulationAmount(Math.max(100, Number(e.target.value)))}
                  className="w-full mt-1.5 px-4 py-3 glass rounded-xl text-sm text-white focus:outline-none focus:border-[#FF2D92]"
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

                {Object.entries(allocations).map(([symbol, pct]) => {
                  const assetColor = symbol === 'CASH' ? '#A3AAAE' : (assets.find(a => a.symbol === symbol)?.color ?? '#8B5CF6');
                  return (
                    <div key={symbol} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white/80">{symbol === 'CASH' ? 'Efectivo (USD)' : symbol}</span>
                        <span className="text-white/60">{pct}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pct}
                        onChange={e => handleAllocationChange(symbol, Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF2D92]"
                        style={{ accentColor: assetColor }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Simulation Result */}
              <div className="p-4 rounded-xl glass bg-white/[0.01] border border-white/[0.04] flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Valor Estimado del Portafolio</p>
                  <p className="text-xl font-extrabold text-white mt-0.5">${simulatedPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold text-center ${simulatedProfit >= 0 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#FF4D6A]/10 text-[#FF4D6A]'}`}>
                  <p className="text-[9px] uppercase tracking-wider">Rendimiento</p>
                  <p>{simulatedProfit >= 0 ? '+' : ''}{simulatedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({simulatedProfitPct.toFixed(2)}%)</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'portfolio' && (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
            {/* Portfolio Summary Card */}
            <div className="p-5 rounded-2xl glass-card border border-white/[0.06] relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Valor Neto Virtual</p>
                    <h3 className="text-2xl font-black text-white">${totalVirtualPortfolioVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-xl text-center text-xs font-bold ${
                    totalPortfolioProfit >= 0 ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#FF4D6A]/15 text-[#FF4D6A]'
                  }`}>
                    <p className="text-[9px] uppercase tracking-wider text-white/40">Ganancia Flotante</p>
                    <p>{totalPortfolioProfit >= 0 ? '+' : ''}${totalPortfolioProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({portfolioProfitPercent.toFixed(2)}%)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.04]">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase font-semibold">Efectivo Disponible</p>
                    <p className="text-sm font-bold text-white/80">${virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/30 uppercase font-semibold">Valor en Activos</p>
                    <p className="text-sm font-bold text-white/80">${totalHoldingsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings list */}
            <div className="p-5 rounded-2xl glass-card space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                <Wallet size={14} className="text-theme-accent" /> Activos en Cartera
              </h2>

              {portfolioHoldings.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/20">
                  No tienes activos comprados. ¡Usa tu saldo en efectivo virtual para operar en la pestaña Mercado!
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolioHoldings.map((h) => {
                    const price = getAssetPrice(h.symbol);
                    const cost = h.shares * h.avgPrice;
                    const value = h.shares * price;
                    const profit = value - cost;
                    const up = profit >= 0;

                    return (
                      <div key={h.symbol} className="p-3.5 rounded-xl glass border border-white/[0.04] flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{h.symbol}</span>
                            <span className="text-[9px] text-white/30">{h.shares.toFixed(4)} Unidades</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-white/40">
                            <span>Promedio: ${h.avgPrice.toLocaleString()}</span>
                            <span>Valor: ${price.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs font-extrabold text-white">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            <p className={`text-[10px] font-bold ${up ? 'text-[#10B981]' : 'text-[#FF4D6A]'}`}>
                              {up ? '+' : ''}{profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                const assetObj = assets.find(a => a.symbol === h.symbol) || { symbol: h.symbol, name: h.symbol, price, change: 0, type: 'stock', color: '#8B5CF6' } as Asset;
                                setSelectedAsset(assetObj);
                                setTradeType('buy');
                                setTradeShares('1');
                              }}
                              className="w-7 h-7 rounded-lg bg-theme-accent-10 text-theme-accent flex items-center justify-center hover:bg-theme-accent-20 active:scale-90 transition-all font-bold text-xs"
                            >
                              +
                            </button>
                            <button
                              onClick={() => {
                                const assetObj = assets.find(a => a.symbol === h.symbol) || { symbol: h.symbol, name: h.symbol, price, change: 0, type: 'stock', color: '#8B5CF6' } as Asset;
                                setSelectedAsset(assetObj);
                                setTradeType('sell');
                                setTradeShares('1');
                              }}
                              className="w-7 h-7 rounded-lg bg-white/5 text-white/60 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all font-bold text-xs border border-white/5"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'quotes' && (
          <motion.div key="quotes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
            {/* Status card */}
            <div className="p-5 rounded-2xl glass-card">
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Sparkles size={18} className={c.color} />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Buy/Sell Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#0A0A0A]/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl glass-strong p-6 border border-white/[0.08] relative"
            >
              <button
                onClick={() => { setSelectedAsset(null); setShowKeypad(false); setTradeShares('1'); }}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent">Simulador de Trading</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedAsset.symbol} · {selectedAsset.name}</h3>
                <p className="text-xs text-white/40 mt-0.5">Precio de mercado: ${selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>

              {/* Selector de comprar / vender */}
              <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl mb-4">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tradeType === 'buy' ? 'bg-[#10B981] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Comprar
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tradeType === 'sell' ? 'bg-[#FF4D6A] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Vender
                </button>
              </div>

              <form onSubmit={handleTradeSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Cantidad</label>
                  <input
                    type="number"
                    value={tradeShares}
                    onChange={e => setTradeShares(e.target.value)}
                    onFocus={() => setShowKeypad(true)}
                    required
                    className="w-full mt-1.5 px-4 py-2.5 glass rounded-xl text-xs text-white focus:outline-none focus:border-theme-accent font-mono font-bold"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1.5">
                    <span>Efectivo disponible: ${virtualCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span>Total: ${(parseFloat(tradeShares || '0') * selectedAsset.price).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                  </div>
                </div>

                {showKeypad && (
                  <div className="pt-2 border-t border-white/[0.04]">
                    <MiniKeypad value={tradeShares} onChange={setTradeShares} onClose={() => setShowKeypad(false)} />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={buyAsset.isPending || sellAsset.isPending}
                  className={`w-full py-3 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95 ${
                    tradeType === 'buy' ? 'bg-[#10B981] hover:bg-[#10B981]/90' : 'bg-[#FF4D6A] hover:bg-[#FF4D6A]/90'
                  }`}
                >
                  {tradeType === 'buy' ? (buyAsset.isPending ? 'Comprando...' : 'Comprar Activo') : (sellAsset.isPending ? 'Vendiendo...' : 'Vender Activo')}
                </button>
              </form>
            </motion.div>
          </div>
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
