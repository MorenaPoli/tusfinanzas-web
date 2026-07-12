import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CreditCard, MessageSquare, TrendingUp, Shield } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { enabled: isAdmin });
  const { data: users } = trpc.admin.listUsers.useQuery(undefined, { enabled: isAdmin });
  const { data: transactions } = trpc.admin.listTransactions.useQuery(undefined, { enabled: isAdmin });
  const { data: tickets } = trpc.admin.listTickets.useQuery(undefined, { enabled: isAdmin });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="text-center">
          <Shield size={48} className="text-[#FF4D6A] mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Acceso restringido</h1>
          <p className="text-sm text-white/40 mb-6">Solo administradores pueden ver este panel.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white font-semibold">
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Panel de Admin</h1>
            <p className="text-xs text-white/40">Gestion de usuarios y metricas</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Usuarios', value: stats?.users ?? 0, color: '#00E5FF' },
            { icon: CreditCard, label: 'Transacciones', value: stats?.transactions ?? 0, color: '#10B981' },
            { icon: TrendingUp, label: 'Usuarios Pro', value: stats?.proUsers ?? 0, color: '#FFD166' },
            { icon: MessageSquare, label: 'Tickets abiertos', value: stats?.openTickets ?? 0, color: '#FF2D92' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#1A1A1A] border border-white/[0.06]">
              <s.icon size={20} style={{ color: s.color }} className="mb-2" />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/60 mb-4">Usuarios registrados</h2>
          <div className="rounded-2xl bg-[#1A1A1A] border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">ID</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Nombre</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Pais</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Rol</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u) => (
                    <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/60">#{u.id}</td>
                      <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-white/60">{u.email}</td>
                      <td className="px-4 py-3 text-white/60">{u.country}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.role === 'admin' ? 'bg-[#FF2D92]/20 text-[#FF2D92]' : 'bg-white/[0.06] text-white/40'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES') : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!users || users.length === 0) && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30">Sin usuarios aun</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-white/60 mb-4">Ultimas transacciones</h2>
          <div className="rounded-2xl bg-[#1A1A1A] border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Usuario</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Categoria</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Monto</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.slice(0, 20).map((t) => (
                    <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/60">#{t.userId}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.type === 'income' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' :
                          t.type === 'expense' ? 'bg-[#FF4D6A]/10 text-[#FF4D6A]' :
                          t.type === 'investment' ? 'bg-[#6366F1]/10 text-[#6366F1]' :
                          'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                        }`}>{t.type}</span>
                      </td>
                      <td className="px-4 py-3 text-white/60">{t.category}</td>
                      <td className="px-4 py-3 text-white font-medium">${parseFloat(t.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{String(t.date)}</td>
                    </tr>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30">Sin transacciones</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Support Tickets */}
        <div>
          <h2 className="text-sm font-semibold text-white/60 mb-4">Tickets de soporte</h2>
          <div className="rounded-2xl bg-[#1A1A1A] border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">ID</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Asunto</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets?.map((t) => (
                    <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/60">#{t.id}</td>
                      <td className="px-4 py-3 text-white/60">{t.userEmail}</td>
                      <td className="px-4 py-3 text-white">{t.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.status === 'open' ? 'bg-[#FF4D6A]/10 text-[#FF4D6A]' :
                          t.status === 'in_progress' ? 'bg-[#FFD166]/10 text-[#FFD166]' :
                          'bg-[#10B981]/10 text-[#10B981]'
                        }`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-ES') : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!tickets || tickets.length === 0) && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30">Sin tickets</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
