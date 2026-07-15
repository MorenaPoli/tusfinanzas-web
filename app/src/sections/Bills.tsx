import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Calendar, Clock, DollarSign, CheckCircle2, Trash2, CalendarDays } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import MiniKeypad from '@/components/MiniKeypad';

export default function Bills() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: billsList = [], isLoading } = trpc.bills.listBills.useQuery();

  const createBill = trpc.bills.createBill.useMutation({
    onSuccess: () => {
      utils.bills.listBills.invalidate();
      setName('');
      setAmount('15000');
      setDueDate(new Date().toISOString().slice(0, 10));
      setCategory('Servicios');
      setShowForm(false);
    },
  });

  const payBill = trpc.bills.payBill.useMutation({
    onSuccess: () => {
      utils.bills.listBills.invalidate();
      utils.finance.listTransactions.invalidate();
      utils.finance.getTotals.invalidate();
      utils.budget.getBudgetReport.invalidate();
    },
  });

  const deleteBill = trpc.bills.deleteBill.useMutation({
    onSuccess: () => {
      utils.bills.listBills.invalidate();
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('15000');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('Servicios');
  const [showKeypad, setShowKeypad] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount.trim() || parseFloat(amount) <= 0) return;
    createBill.mutate({
      name,
      amount,
      dueDate,
      category,
    });
  };

  // Computations
  const totalAmount = billsList.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const paidAmount = billsList.filter(b => b.isPaid === 1).reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const unpaidAmount = totalAmount - paidAmount;

  // Calendar rendering computations
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const firstDayIndex = new Date(year, month, 1).getDay(); // day of week 0-6
  const totalDays = new Date(year, month + 1, 0).getDate(); // days in month
  const monthName = today.toLocaleString('es-ES', { month: 'long' });

  // Map bills to days
  const billsMap = new Map<number, typeof billsList>();
  for (const b of billsList) {
    const rawDateStr = b.dueDate instanceof Date ? b.dueDate.toISOString().slice(0, 10) : String(b.dueDate).slice(0, 10);
    const [bYear, bMonth, bDay] = rawDateStr.split('-').map(Number);
    if (bYear === year && bMonth - 1 === month) {
      if (!billsMap.has(bDay)) billsMap.set(bDay, []);
      billsMap.get(bDay)!.push(b);
    }
  }

  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const daysArray = [];
  // Fill leading empty cells
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Fill real days
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  const selectedDayBills = selectedDay ? (billsMap.get(selectedDay) || []) : [];

  return (
    <div id="bills-panel" className="max-w-lg mx-auto px-6 pt-6 pb-20 bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <h1 className="font-bold text-lg">Agenda de Vencimientos</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white font-semibold text-xs shadow-md"
        >
          <Plus size={12} /> {showForm ? 'Cerrar' : 'Programar'}
        </button>
      </div>

      {/* Bill creation form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-6 space-y-3"
          >
            <div className="p-5 rounded-2xl glass-card space-y-3">
              <div>
                <label className="text-[10px] text-white/40 uppercase font-semibold">Descripción del Servicio</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Suscripción AWS / Alquiler / Gas"
                  required
                  className="w-full mt-1 px-4 py-2.5 glass rounded-xl text-xs text-white focus:outline-none focus:border-[#FF2D92]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Monto ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    onFocus={() => setShowKeypad(true)}
                    required
                    className="w-full mt-1 px-4 py-2.5 glass rounded-xl text-xs text-white focus:outline-none focus:border-[#FF2D92] font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-semibold">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 glass rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Servicios" className="bg-[#0A0A0A]">Servicios</option>
                    <option value="Alquiler" className="bg-[#0A0A0A]">Alquiler</option>
                    <option value="Educación" className="bg-[#0A0A0A]">Educación</option>
                    <option value="Impuestos" className="bg-[#0A0A0A]">Impuestos</option>
                    <option value="Otros" className="bg-[#0A0A0A]">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase font-semibold">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                  className="w-full mt-1 px-4 py-2.5 glass rounded-xl text-xs text-white focus:outline-none focus:border-[#FF2D92] font-mono"
                />
              </div>

              {showKeypad && (
                <div className="pt-2 border-t border-white/[0.04]">
                  <MiniKeypad value={amount} onChange={setAmount} onClose={() => setShowKeypad(false)} />
                </div>
              )}

              <button
                type="submit"
                disabled={createBill.isPending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white text-xs font-bold shadow-md"
              >
                {createBill.isPending ? 'Guardando...' : 'Programar Vencimiento'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: totalAmount, color: '#FFD166' },
          { label: 'Pagado', value: paidAmount, color: '#10B981' },
          { label: 'Pendiente', value: unpaidAmount, color: '#FF4D6A' },
        ].map((s) => (
          <div key={s.label} className="p-3.5 rounded-xl glass-card text-center">
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">{s.label}</p>
            <p className="text-sm font-extrabold mt-1" style={{ color: s.color }}>${s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Calendar Month Grid */}
      <div className="p-5 rounded-2xl glass-card mb-6">
        <div className="flex items-center gap-2 mb-4 text-theme-accent">
          <CalendarDays size={14} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 capitalize">
            {monthName} {year}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map((d) => (
            <span key={d} className="text-[9px] font-bold text-white/30 uppercase">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const hasBills = billsMap.has(day);
            const isSelected = selectedDay === day;
            const isToday = today.getDate() === day && today.getMonth() === month;
            
            // Determine day indicator dot color
            const dayBills = billsMap.get(day) || [];
            const hasUnpaid = dayBills.some(b => b.isPaid === 0);

            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative text-xs transition-all ${
                  isSelected
                    ? 'bg-theme-accent text-white shadow-md shadow-theme-glow/15 scale-105'
                    : isToday
                    ? 'bg-white/10 text-white font-bold border border-white/20'
                    : 'glass hover:bg-white/5 text-white/70'
                }`}
              >
                <span>{day}</span>
                {hasBills && (
                  <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                    hasUnpaid ? 'bg-[#FF4D6A]' : 'bg-[#10B981]'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Bills list */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
          Vencimientos del día {selectedDay} de {monthName}
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : selectedDayBills.length === 0 ? (
          <div className="p-5 rounded-2xl glass-card text-center text-white/20 text-xs">
            Sin servicios o facturas venciendo este día.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayBills.map((b) => (
              <div key={b.id} className="p-4 rounded-xl glass-card flex items-center justify-between gap-3 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    b.isPaid === 1 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#FF4D6A]/10 text-[#FF4D6A]'
                  }`}>
                    {b.isPaid === 1 ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{b.name}</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      Categoría: {b.category} · ${parseFloat(b.amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {b.isPaid === 0 && (
                    <button
                      onClick={() => payBill.mutate({ id: b.id })}
                      disabled={payBill.isPending}
                      className="px-2.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-white text-[10px] font-bold transition-all active:scale-95 shadow-md"
                    >
                      Pagar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("¿Seguro de que deseas eliminar este vencimiento?")) {
                        deleteBill.mutate({ id: b.id });
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-[#FF4D6A] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
