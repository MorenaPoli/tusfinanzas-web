import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, Download } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const COLORS = ['#FF2D92', '#8B5CF6', '#6366F1', '#00E5FF', '#FFD166', '#10B981', '#FF4D6A', '#FF6B35'];

export default function Summary() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [currency, setCurrency] = useState<string>(() => localStorage.getItem('tusfinanzas_currency') || 'USD');

  const { data: transactions } = trpc.finance.listTransactions.useQuery();
  const { data: rates } = trpc.finance.getExchangeRates.useQuery();
  const { data: dbMessages } = trpc.finance.listChatMessages.useQuery();

  const lastAiMessage = useMemo(() => {
    if (!dbMessages) return '';
    const aiMsgs = dbMessages.filter(m => m.role === 'assistant');
    return aiMsgs.length > 0 ? aiMsgs[aiMsgs.length - 1].content : '';
  }, [dbMessages]);

  const convertAmount = (amount: number, from: string, to: string, ratesMap?: Record<string, number>) => {
    if (!ratesMap) return amount;
    const f = from.toUpperCase();
    const t = to.toUpperCase();
    const baseRateF = ratesMap[f] || 1;
    const baseRateT = ratesMap[t] || 1;
    return (amount / baseRateF) * baseRateT;
  };

  const monthData = useMemo(() => {
    if (!transactions) return null;

    const monthTxs = transactions.filter(t => {
      const d = t.date instanceof Date ? t.date.toISOString().slice(0, 10) : String(t.date);
      return d.startsWith(selectedMonth);
    });

    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + convertAmount(parseFloat(t.amount), t.currency || 'USD', currency, rates), 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + convertAmount(parseFloat(t.amount), t.currency || 'USD', currency, rates), 0);
    const investment = monthTxs.filter(t => t.type === 'investment').reduce((s, t) => s + convertAmount(parseFloat(t.amount), t.currency || 'USD', currency, rates), 0);
    const debt = monthTxs.filter(t => t.type === 'debt').reduce((s, t) => s + convertAmount(parseFloat(t.amount), t.currency || 'USD', currency, rates), 0);
    const asset = monthTxs.filter(t => t.type === 'asset').reduce((s, t) => s + convertAmount(parseFloat(t.amount), t.currency || 'USD', currency, rates), 0);
    
    const capital = income - expense;
    const savingsRate = income > 0 ? (capital / income) * 100 : 0;

    // Category breakdown for expenses
    const catMap: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      const converted = convertAmount(parseFloat(t.amount), t.currency || 'USD', currency, rates);
      catMap[t.category] = (catMap[t.category] || 0) + converted;
    });
    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Monthly trend (last 12 months!)
    const trend: { month: string; income: number; expense: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      const txs = transactions.filter(t => {
        const dVal = t.date instanceof Date ? t.date.toISOString().slice(0, 10) : String(t.date);
        return dVal.startsWith(m);
      });
      trend.push({
        month: MONTHS[d.getMonth()],
        income: txs.filter(t => t.type === 'income').reduce((s, t) => s + convertAmount(parseFloat(t.amount), t.currency || 'USD', currency, rates), 0),
        expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + convertAmount(parseFloat(t.amount), t.currency || 'USD', currency, rates), 0),
      });
    }

    return { income, expense, investment, debt, asset, capital, savingsRate, categoryData, trend };
  }, [transactions, selectedMonth, currency, rates]);

  const changeMonth = (delta: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-lg mx-auto px-6 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <h1 className="font-bold text-lg">Resumen</h1>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#1A1A1A] border border-white/[0.06]">
          {['USD', 'ARS', 'MXN', 'EUR'].map(curr => (
            <button
              key={curr}
              onClick={() => {
                setCurrency(curr);
                localStorage.setItem('tusfinanzas_currency', curr);
              }}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                currency === curr
                  ? 'bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white shadow-md'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Download PDF button */}
        <button
          onClick={() => window.print()}
          className="p-2 rounded-xl bg-[#1A1A1A] border border-white/[0.06] hover:bg-white/5 text-white/60 hover:text-white transition-all ml-1.5"
          title="Descargar Reporte PDF"
        >
          <Download size={16} />
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between mb-6 p-3 rounded-2xl bg-[#1A1A1A] border border-white/[0.06]">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-white/5">
          <ChevronLeft size={18} className="text-white/60" />
        </button>
        <span className="text-sm font-semibold capitalize">{monthLabel}</span>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-white/5">
          <ChevronRight size={18} className="text-white/60" />
        </button>
      </div>

      {!monthData ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <FinancialHealthStatus savingsRate={monthData.savingsRate} />

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.06] text-center">
              <TrendingUp size={18} className="text-[#00E5FF] mx-auto mb-2" />
              <p className="text-[10px] text-white/30 uppercase">Ingresos</p>
              <p className="text-lg font-bold text-[#00E5FF]">${monthData.income.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.06] text-center">
              <TrendingDown size={18} className="text-[#FF4D6A] mx-auto mb-2" />
              <p className="text-[10px] text-white/30 uppercase">Gastos</p>
              <p className="text-lg font-bold text-[#FF4D6A]">${monthData.expense.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.06] text-center">
              <PiggyBank size={18} className="text-[#FFD166] mx-auto mb-2" />
              <p className="text-[10px] text-white/30 uppercase">Capital</p>
              <p className="text-lg font-bold text-[#FFD166]">${monthData.capital.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.06] text-center">
              <p className="text-[10px] text-white/30 uppercase">Ahorro</p>
              <p className="text-lg font-bold text-[#10B981]">{monthData.savingsRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Trend Chart */}
          {monthData.trend.some(d => d.income > 0 || d.expense > 0) && (
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.06]">
              <p className="text-xs text-white/40 mb-3">Tendencia ultimos 6 meses</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthData.trend}>
                  <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="income" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#FF4D6A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Pie */}
          {monthData.categoryData.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.06]">
              <p className="text-xs text-white/40 mb-3">Gastos por categoria</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={monthData.categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {monthData.categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {monthData.categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-white/60">{c.name}</span>
                    </div>
                    <span className="text-xs font-medium">${c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Printable Report Container */}
      <div id="financial-report-print" className="font-sans text-black bg-white">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">TusFinanzas</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Reporte de Salud Financiera</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800">Fecha de Emisión: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">Período: {monthLabel}</p>
          </div>
        </div>

        {/* Dynamic Context Warning / Info */}
        <div className="mb-6 p-4 rounded-xl bg-gray-100 border border-gray-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Resumen General</h2>
          <p className="text-[11px] text-gray-700 leading-relaxed">
            Este informe consolida las transacciones y balances registrados para el período seleccionado. Los valores se muestran convertidos a la divisa de referencia: <strong className="text-gray-900">{currency}</strong>.
          </p>
        </div>

        {/* Metrics Grid */}
        {monthData && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-gray-300 text-center">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Ingresos Totales</p>
              <p className="text-lg font-bold mt-1 text-[#00E5FF] filter brightness-50">${monthData.income.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-300 text-center">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Gastos Totales</p>
              <p className="text-lg font-bold mt-1 text-[#FF4D6A] filter brightness-50">${monthData.expense.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-300 text-center">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Tasa de Ahorro</p>
              <p className="text-lg font-bold mt-1 text-gray-900">{monthData.savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Columns Grid */}
        {monthData && (
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Expenses by Category */}
            <div className="p-5 rounded-xl border border-gray-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3 border-b pb-2">Distribución de Gastos</h3>
              {monthData.categoryData.length === 0 ? (
                <p className="text-[11px] text-gray-400 py-6 text-center">Sin gastos registrados este mes</p>
              ) : (
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="text-[9px] text-gray-500 uppercase border-b">
                      <th className="py-2">Categoría</th>
                      <th className="py-2 text-right">Monto</th>
                      <th className="py-2 text-right">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monthData.categoryData.map(c => {
                      const pct = monthData.expense > 0 ? (c.value / monthData.expense) * 100 : 0;
                      return (
                        <tr key={c.name}>
                          <td className="py-2 font-medium">{c.name}</td>
                          <td className="py-2 text-right">${c.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="py-2 text-right">{pct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Historical balance overview */}
            <div className="p-5 rounded-xl border border-gray-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3 border-b pb-2">Historial de 12 Meses</h3>
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="text-[8px] text-gray-500 uppercase border-b">
                    <th className="py-1.5">Mes</th>
                    <th className="py-1.5 text-right">Ingresos</th>
                    <th className="py-1.5 text-right">Gastos</th>
                    <th className="py-1.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthData.trend.map(t => {
                    const bal = t.income - t.expense;
                    return (
                      <tr key={t.month}>
                        <td className="py-1.5 font-medium">{t.month}</td>
                        <td className="py-1.5 text-right text-gray-600">${t.income.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="py-1.5 text-right text-gray-600">${t.expense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className={`py-1.5 text-right font-bold ${bal >= 0 ? 'text-[#10B981] filter brightness-50' : 'text-[#FF4D6A] filter brightness-50'}`}>
                          ${bal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Advisor Panel */}
        <div className="p-5 rounded-xl border border-gray-300 bg-gray-50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2 border-b pb-2 flex items-center gap-1.5">
            💡 Consejos de tu Asesor IA
          </h3>
          <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-line">
            {lastAiMessage ? formatAiAdvice(lastAiMessage) : "Comienza a chatear con tu Asesor de IA en la pestaña 'Asesor' para recibir consejos personalizados en tus reportes descargables."}
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-8 border-t pt-4 text-center text-[9px] text-gray-400">
          TusFinanzas © 2026 — Inteligencia Artificial al servicio de tu tranquilidad financiera.
        </div>
      </div>
    </div>
  );
}

function formatAiAdvice(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function FinancialHealthStatus({ savingsRate }: { savingsRate: number }) {
  let label = "Crítico";
  let desc = "Estás gastando más de lo que ingresas o no tienes margen de ahorro. ¡Necesitas un ajuste urgente!";
  let color = "text-[#FF4D6A]";
  let bg = "bg-[#FF4D6A]/10";
  let border = "border-[#FF4D6A]/20";

  if (savingsRate > 20) {
    label = "Excelente";
    desc = "Estás ahorrando más del 20% de tus ingresos. ¡Tu salud financiera es sólida y estás listo para invertir!";
    color = "text-[#00E5FF]";
    bg = "bg-[#00E5FF]/10";
    border = "border-[#00E5FF]/20";
  } else if (savingsRate > 10) {
    label = "Bueno";
    desc = "Estás ahorrando entre el 10% y 20%. Mantén este ritmo y considera diversificar tu capital.";
    color = "text-[#FFD166]";
    bg = "bg-[#FFD166]/10";
    border = "border-[#FFD166]/20";
  } else if (savingsRate >= 0) {
    label = "Regular";
    desc = "Tu margen de ahorro es muy bajo (menos del 10%). Un presupuesto más estricto te ayudará a crecer.";
    color = "text-[#FF6B35]";
    bg = "bg-[#FF6B35]/10";
    border = "border-[#FF6B35]/20";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border ${bg} ${border}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Estado de Salud Financiera</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${bg} border ${border} ${color}`}>
          {label}
        </span>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
