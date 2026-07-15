import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, Filter, X, Download, UploadCloud, Sparkles, Plus } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import type { TransactionType } from '@/types'
import { useSubscription } from '@/hooks/useSubscription'

const getDateStr = (d: unknown): string => d instanceof Date ? d.toISOString().slice(0, 10) : String(d);

export default function Transactions() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { isFree } = useSubscription();

  const { data: transactions, isLoading } = trpc.finance.listTransactions.useQuery();

  const [cachedTransactions, setCachedTransactions] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('tusfinanzas_cached_transactions');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (transactions) {
      localStorage.setItem('tusfinanzas_cached_transactions', JSON.stringify(transactions));
      setCachedTransactions(transactions);
    }
  }, [transactions]);

  const deleteTx = trpc.finance.deleteTransaction.useMutation({
    onSuccess: () => {
      utils.finance.listTransactions.invalidate();
      utils.finance.getTotals.invalidate();
    },
  });

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // CSV Import state
  const [importing, setImporting] = useState(false);
  const [parsedRows, setParsedRows] = useState<{ date: string; description: string; amount: number; type: TransactionType; category: string }[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [importCurrency, setImportCurrency] = useState('USD');
  const [isDragging, setIsDragging] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const classifyCsv = trpc.finance.classifyCsvRows.useMutation();
  const bulkInsert = trpc.finance.bulkInsertTransactions.useMutation({
    onSuccess: (res) => {
      utils.finance.listTransactions.invalidate();
      utils.finance.getTotals.invalidate();
      alert(`Se importaron ${res.count} transacciones exitosamente.`);
      setImporting(false);
      setParsedRows([]);
    },
    onError: (err) => {
      alert(err.message || 'Error al guardar las transacciones.');
    }
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processCsvFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCsvFile(file);
    if (e.target) e.target.value = '';
  };

  const processCsvFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert("El archivo seleccionado no es un CSV válido. Por favor sube un archivo con extensión .csv.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        alert("El archivo CSV está vacío o no contiene suficientes filas.");
        return;
      }

      const headers = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase());
      
      let dateIdx = -1;
      let descIdx = -1;
      let amountIdx = -1;

      headers.forEach((h, idx) => {
        if (h.includes("fecha") || h.includes("date")) dateIdx = idx;
        if (h.includes("descripcion") || h.includes("desc") || h.includes("concepto") || h.includes("detail")) descIdx = idx;
        if (h.includes("monto") || h.includes("amount") || h.includes("importe") || h.includes("valor")) amountIdx = idx;
      });

      if (dateIdx === -1) dateIdx = 0;
      if (descIdx === -1) descIdx = 1;
      if (amountIdx === -1) amountIdx = headers.length > 2 ? 2 : 1;

      const tempRows: { date: string; description: string; amount: number; type: TransactionType; category: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
        const finalCols = cols.length === 1 ? line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, '')) : cols;

        if (finalCols.length <= Math.max(dateIdx, descIdx, amountIdx)) continue;

        const rawDate = finalCols[dateIdx];
        const rawDesc = finalCols[descIdx] || "Transacción CSV";
        const rawAmountStr = finalCols[amountIdx] || "0";

        let cleanAmount = parseFloat(rawAmountStr.replace(/[^0-9.-]/g, ''));
        if (isNaN(cleanAmount)) cleanAmount = 0;

        let formattedDate = new Date().toISOString().slice(0, 10);
        try {
          if (rawDate.includes("/")) {
            const parts = rawDate.split("/");
            if (parts.length === 3) {
              if (parts[2].length === 4) {
                formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              } else if (parts[0].length === 4) {
                formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              }
            }
          } else if (rawDate.includes("-")) {
            const parts = rawDate.split("-");
            if (parts.length === 3) {
              if (parts[2].length === 4) {
                formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              } else if (parts[0].length === 4) {
                formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              }
            }
          } else {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toISOString().slice(0, 10);
            }
          }
        } catch (_) {}

        tempRows.push({
          date: formattedDate,
          description: rawDesc,
          amount: Math.abs(cleanAmount),
          type: cleanAmount >= 0 ? "income" : "expense",
          category: "Otros"
        });
      }

      if (tempRows.length === 0) {
        alert("No se pudieron parsear filas válidas del archivo CSV.");
        return;
      }

      setImporting(true);
      setIsClassifying(true);

      try {
        const payload = tempRows.map(r => ({ description: r.description, amount: r.amount }));
        const classifications = await classifyCsv.mutateAsync({ rows: payload });
        
        classifications.forEach(c => {
          if (tempRows[c.index]) {
            tempRows[c.index].type = c.type;
            tempRows[c.index].category = c.category;
          }
        });
      } catch (err) {
        console.error("Classification error:", err);
      } finally {
        setIsClassifying(false);
        setParsedRows(tempRows);
      }
    };

    reader.readAsText(file);
  };

  const handleSaveImport = () => {
    const invalidRows = parsedRows.filter(r => isNaN(r.amount) || r.amount <= 0 || !r.description.trim() || !r.category.trim());
    if (invalidRows.length > 0) {
      alert("Por favor asegúrate de que todas las filas tengan montos mayores a 0, descripciones y categorías válidas.");
      return;
    }

    const payload = parsedRows.map(r => ({
      type: r.type,
      category: r.category,
      amount: String(r.amount),
      description: r.description,
      currency: importCurrency,
      date: r.date
    }));
    bulkInsert.mutate({ transactions: payload });
  };

  const filtered = cachedTransactions?.filter(t => filter === 'all' || t.type === filter) || [];

  // Sort flat list based on criteria
  const sorted = [...filtered].sort((a, b) => {
    const ad = a.date instanceof Date ? a.date.toISOString() : String(a.date);
    const bd = b.date instanceof Date ? b.date.toISOString() : String(b.date);
    const am = parseFloat(a.amount);
    const bm = parseFloat(b.amount);

    if (sortBy === 'date-desc') {
      return bd.localeCompare(ad);
    } else if (sortBy === 'date-asc') {
      return ad.localeCompare(bd);
    } else if (sortBy === 'amount-desc') {
      return bm - am;
    } else {
      return am - bm;
    }
  });

  // Group by month maintaining order
  const grouped: Record<string, typeof sorted> = {};
  for (const t of sorted) {
    const month = getDateStr(t.date).slice(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(t);
  }
  const sortedMonths = Object.keys(grouped).sort((a, b) => {
    return sortBy === 'date-asc' ? a.localeCompare(b) : b.localeCompare(a);
  });

  const filters: { key: TransactionType | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'income', label: 'Ingresos' },
    { key: 'expense', label: 'Gastos' },
    { key: 'investment', label: 'Inversiones' },
    { key: 'debt', label: 'Deudas' },
    { key: 'asset', label: 'Bienes' },
  ];

  const exportToCSV = () => {
    if (isFree) {
      alert("La exportación a CSV es una función exclusiva del Plan Pro. Suscribite para acceder.");
      navigate('/checkout');
      return;
    }
    if (!cachedTransactions || cachedTransactions.length === 0) {
      alert("No hay transacciones para exportar.");
      return;
    }

    const headers = ["ID", "Fecha", "Tipo", "Categoria", "Monto", "Descripcion"];
    const rows = cachedTransactions.map(t => [
      t.id,
      getDateStr(t.date),
      t.type,
      t.category,
      t.amount,
      `"${(t.description || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tusfinanzas_movimientos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // prevent memory leak
  };

  return (
    <div className="max-w-lg mx-auto px-6 pt-6">
      {/* Offline banner */}
      {isOffline && (
        <div className="mb-4 py-2.5 px-4 rounded-xl bg-[#FF4D6A]/10 border border-[#FF4D6A]/20 text-[#FF4D6A] text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6A]" />
          Modo sin conexión · Mostrando datos locales en caché
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <h1 className="font-bold text-lg">Movimientos</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={exportToCSV} className="p-2 rounded-xl hover:bg-white/5" title="Exportar a CSV">
            <Download size={18} className="text-white/60" />
          </button>
          <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl glass border border-white/5 text-xs text-white/80 focus:outline-none focus:border-theme-accent cursor-pointer"
          >
            <option value="date-desc" className="bg-[#0A0A0A]">Más recientes</option>
            <option value="date-asc" className="bg-[#0A0A0A]">Más antiguos</option>
            <option value="amount-desc" className="bg-[#0A0A0A]">Monto mayor</option>
            <option value="amount-asc" className="bg-[#0A0A0A]">Monto menor</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${
              showFilters ? 'bg-white/10 border-white/20 text-white' : 'glass border-white/5 text-white/60 hover:text-white'
            }`}>
            <Filter size={18} />
          </button>
        </div>
        </div>
      </div>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="flex flex-wrap gap-2">
              {filters.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    filter === f.key ? 'bg-[#FF2D92] border-[#FF2D92] text-white shadow-md shadow-[#FF2D92]/20' : 'glass text-white/40 hover:text-white/60'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Import Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileDrop(e); }}
        className={`relative group p-6 mb-6 rounded-2xl border border-dashed transition-all text-center cursor-pointer ${
          isDragging 
            ? 'bg-theme-accent-10 border-theme-accent scale-[1.01]' 
            : 'border-white/[0.1] hover:border-theme-accent/50 glass-card hover:bg-white/[0.01]'
        }`}
      >
        {isClassifying ? (
          <div className="py-2 space-y-2">
            <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-white/80 animate-pulse">Clasificando movimientos con Gemini...</p>
            <p className="text-[10px] text-white/40">Analizando conceptos, montos y categorías adecuadas...</p>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud size={28} className={`mx-auto mb-2 transition-all duration-300 ${
              isDragging ? 'text-theme-accent scale-110' : 'text-white/30 group-hover:text-theme-accent'
            }`} />
            <p className="text-xs font-semibold text-white/80">Importar Extracto Bancario (CSV)</p>
            <p className="text-[10px] text-white/40 mt-1">Arrastra tu archivo aquí o haz clic para subirlo. Clasificado por Gemini.</p>
          </>
        )}
      </div>

      {/* Transactions */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedMonths.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-white/30 mb-4">Sin movimientos aún</p>
          <button
            onClick={() => navigate('/add')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md"
          >
            <Plus size={14} /> Agregar mi primer movimiento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map(month => (
            <div key={month}>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3 sticky top-0">
                {new Date(month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
              <div className="space-y-2">
                {grouped[month].sort((a, b) => {
                  const ad = getDateStr(a.date);
                  const bd = getDateStr(b.date);
                  return bd.localeCompare(ad);
                }).map(t => {
                  const dateStr = getDateStr(t.date);
                  return (
                    <motion.div key={t.id} layout className="flex items-center justify-between p-4 rounded-2xl glass-card">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          t.type === 'income' ? 'bg-[#00E5FF]/10' :
                          t.type === 'expense' ? 'bg-[#FF4D6A]/10' :
                          t.type === 'investment' ? 'bg-[#6366F1]/10' :
                          t.type === 'debt' ? 'bg-[#EF4444]/10' : 'bg-[#8B5CF6]/10'
                        }`}>
                          <span className="text-xs font-bold" style={{ color: TYPE_COLORS[t.type as keyof typeof TYPE_COLORS] }}>
                            {t.type === 'income' ? '+' : t.type === 'asset' ? '+' : '-'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.description || t.category}</p>
                          <p className="text-[10px] text-white/30">
                            {dateStr} · {t.category}
                            {t.isOfflinePending && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-[#FFD166]/10 text-[#FFD166] text-[8px] font-bold tracking-wider uppercase animate-pulse border border-[#FFD166]/20">
                                Pendiente
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-sm font-bold ${t.type === 'income' || t.type === 'asset' ? 'text-[#00E5FF]' : 'text-[#FF4D6A]'}`}>
                          {t.type === 'income' || t.type === 'asset' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()} <span className="text-[10px] opacity-60 ml-0.5">{(t as any).currency || 'USD'}</span>
                        </p>
                        {!t.isOfflinePending && (
                          deleteConfirm === t.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => { deleteTx.mutate({ id: t.id }); setDeleteConfirm(null); }}
                                className="px-2 py-1 rounded-lg bg-[#FF4D6A]/20 text-[#FF4D6A] text-[10px] font-semibold hover:bg-[#FF4D6A]/30 transition-colors">
                                Confirmar
                              </button>
                              <button onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 rounded-lg bg-white/5 text-white/40 text-[10px] hover:bg-white/10 transition-colors">
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(t.id)}
                              className="p-1.5 rounded-lg hover:bg-[#FF4D6A]/10 transition-colors">
                              <Trash2 size={14} className="text-white/20 hover:text-[#FF4D6A]" />
                            </button>
                          )
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      <AnimatePresence>
        {importing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl glass-strong rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] glow-purple"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-[#8B5CF6] animate-pulse" /> Importador Inteligente IA
                  </h2>
                  <p className="text-[10px] text-white/40 mt-0.5">Clasificación inteligente realizada por Gemini</p>
                </div>
                <button
                  onClick={() => { setImporting(false); setParsedRows([]); }}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {isClassifying ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-3 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Analizando extracto bancario...</p>
                      <p className="text-xs text-white/40 mt-1">Nuestra IA Gemini está clasificando categorías y transacciones.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Settings row */}
                    <div className="flex items-center justify-between p-4 rounded-2xl glass">
                      <div>
                        <p className="text-xs font-bold text-white">Divisa de Importación</p>
                        <p className="text-[10px] text-white/30">Se aplicará a todos los movimientos importados</p>
                      </div>
                      <div className="flex gap-1.5 p-0.5 rounded-lg glass">
                        {['USD', 'ARS', 'MXN', 'EUR'].map(curr => (
                          <button
                            key={curr}
                            onClick={() => setImportCurrency(curr)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                              importCurrency === curr ? 'bg-[#8B5CF6] text-white shadow-sm shadow-[#8B5CF6]/30' : 'text-white/40 hover:text-white'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Table */}
                    <div className="space-y-3">
                      {parsedRows.map((row, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          <div className="md:col-span-3 flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-white/30 md:hidden font-bold">Fecha</span>
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => {
                                const newRows = [...parsedRows];
                                newRows[idx].date = e.target.value;
                                setParsedRows(newRows);
                              }}
                              className="w-full glass border border-white/[0.08] px-2 py-1.5 rounded-lg text-[11px] text-white/80 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                            />
                          </div>
                          <div className="md:col-span-3 flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-white/30 md:hidden font-bold">Detalle</span>
                            <input
                              type="text"
                              value={row.description}
                              onChange={(e) => {
                                const newRows = [...parsedRows];
                                newRows[idx].description = e.target.value;
                                setParsedRows(newRows);
                              }}
                              className="w-full glass border border-white/[0.08] px-2 py-1.5 rounded-lg text-[11px] text-white/80 focus:outline-none focus:border-[#8B5CF6] transition-colors truncate"
                            />
                          </div>
                          <div className="md:col-span-2 flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-white/30 md:hidden font-bold">Monto</span>
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => {
                                const newRows = [...parsedRows];
                                newRows[idx].amount = parseFloat(e.target.value) || 0;
                                setParsedRows(newRows);
                              }}
                              className="w-full glass border border-white/[0.08] px-2 py-1.5 rounded-lg text-[11px] text-white font-bold focus:outline-none focus:border-[#8B5CF6] transition-colors"
                            />
                          </div>
                          <div className="md:col-span-2 flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-white/30 md:hidden font-bold">Tipo</span>
                            <select
                              value={row.type}
                              onChange={(e) => {
                                const newRows = [...parsedRows];
                                newRows[idx].type = e.target.value as any;
                                setParsedRows(newRows);
                              }}
                              className="w-full glass border border-white/[0.08] px-2 py-1.5 rounded-lg text-[11px] text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                            >
                              <option value="income">Ingreso</option>
                              <option value="expense">Gasto</option>
                              <option value="investment">Inversión</option>
                              <option value="debt">Deuda</option>
                              <option value="asset">Bien/Activo</option>
                            </select>
                          </div>
                          <div className="md:col-span-2 flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-wider text-white/30 md:hidden font-bold">Categoría</span>
                            <input
                              type="text"
                              value={row.category}
                              onChange={(e) => {
                                const newRows = [...parsedRows];
                                newRows[idx].category = e.target.value;
                                setParsedRows(newRows);
                              }}
                              className="w-full glass border border-white/[0.08] px-2 py-1.5 rounded-lg text-[11px] text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                              placeholder="Categoría"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              {!isClassifying && (
                <div className="p-6 border-t border-white/[0.08] flex items-center justify-end gap-3 bg-white/[0.01]">
                  <button
                    onClick={() => { setImporting(false); setParsedRows([]); }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveImport}
                    disabled={bulkInsert.isPending}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    {bulkInsert.isPending ? 'Guardando...' : `Guardar ${parsedRows.length} movimientos`}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TYPE_COLORS = {
  income: '#00E5FF', expense: '#FF4D6A', investment: '#6366F1', debt: '#EF4444', asset: '#8B5CF6',
};
