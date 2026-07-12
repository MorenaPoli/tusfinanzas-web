import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Users, Shield, LogOut, Copy, Check, Trash2, Plus, Sparkles } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'

export default function Family() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: family, isLoading } = trpc.family.getMyFamily.useQuery();

  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Mutations
  const createFamily = trpc.family.createFamily.useMutation({
    onSuccess: () => {
      utils.family.getMyFamily.invalidate();
      utils.finance.getTotals.invalidate();
      utils.finance.listTransactions.invalidate();
      utils.goals.list.invalidate();
    },
    onError: (err) => {
      alert(err.message || 'Error al crear el grupo.');
    },
  });

  const joinFamily = trpc.family.joinFamily.useMutation({
    onSuccess: () => {
      utils.family.getMyFamily.invalidate();
      utils.finance.getTotals.invalidate();
      utils.finance.listTransactions.invalidate();
      utils.goals.list.invalidate();
    },
    onError: (err) => {
      alert(err.message || 'Error al unirse al grupo.');
    },
  });

  const leaveFamily = trpc.family.leaveFamily.useMutation({
    onSuccess: () => {
      utils.family.getMyFamily.invalidate();
      utils.finance.getTotals.invalidate();
      utils.finance.listTransactions.invalidate();
      utils.goals.list.invalidate();
    },
    onError: (err) => {
      alert(err.message || 'Error al salir del grupo.');
    },
  });

  const removeMember = trpc.family.removeMember.useMutation({
    onSuccess: () => {
      utils.family.getMyFamily.invalidate();
      utils.finance.getTotals.invalidate();
      utils.finance.listTransactions.invalidate();
      utils.goals.list.invalidate();
    },
    onError: (err) => {
      alert(err.message || 'Error al remover miembro.');
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    setActionLoading(true);
    await createFamily.mutateAsync({ name: familyName });
    setActionLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyCode.trim()) return;
    setActionLoading(true);
    await joinFamily.mutateAsync({ code: familyCode });
    setActionLoading(false);
  };

  const handleCopy = () => {
    if (!family?.code) return;
    navigator.clipboard.writeText(family.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-6 pt-6 pb-20">
      {/* Back Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <h1 className="font-bold text-lg">Finanzas Familiares</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : family ? (
        // STATE 1: User is in a family
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Family Group Card */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/[0.08]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center">
                <Users size={24} className="text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Grupo Familiar</p>
                <h2 className="text-xl font-bold text-white">{family.name}</h2>
              </div>
            </div>

            {/* Invitation Code */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Código de Invitación</p>
                <p className="text-sm font-mono font-bold text-white/90 mt-0.5">{family.code}</p>
              </div>
              <button
                onClick={handleCopy}
                className={`p-2.5 rounded-lg border transition-all ${
                  copied
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                    : 'bg-white/5 border-white/[0.08] text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-white/30 mt-3">
              Comparte este código con tus familiares para invitarlos al grupo (máximo 6 integrantes en total).
            </p>
          </div>

          {/* Members List */}
          <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.06] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
              Miembros del Grupo ({family.members.length})
            </h3>
            <div className="space-y-3">
              {family.members.map((mem) => {
                const isAdmin = mem.role === 'admin';
                const isMe = mem.id === user?.id;
                return (
                  <div key={mem.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                        isAdmin ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/5 text-white/60'
                      }`}>
                        {mem.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold truncate text-white">{mem.name}</p>
                          {isMe && (
                            <span className="text-[9px] bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-full text-white/40">
                              Tú
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30 truncate">{mem.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        isAdmin ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' : 'bg-white/[0.04] text-white/40'
                      }`}>
                        {isAdmin ? 'Admin' : 'Miembro'}
                      </span>

                      {/* Admin removal tool */}
                      {family.myRole === 'admin' && !isMe && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de que quieres remover a ${mem.name}?`)) {
                              removeMember.mutate({ memberId: mem.id });
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#FF4D6A]/10 text-white/20 hover:text-[#FF4D6A] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              onClick={() => {
                const msg = family.myRole === 'admin'
                  ? 'Como Administrador/Dueño del grupo, si sales se disolverá por completo el grupo familiar y todos sus miembros serán desvinculados. ¿Estás seguro?'
                  : '¿Estás seguro de que quieres salir del grupo familiar? Dejarás de compartir transacciones y metas.';
                if (confirm(msg)) {
                  leaveFamily.mutate();
                }
              }}
              disabled={actionLoading}
              className="w-full py-3.5 rounded-xl border border-[#FF4D6A]/20 bg-[#FF4D6A]/5 hover:bg-[#FF4D6A]/10 text-[#FF4D6A] text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> {family.myRole === 'admin' ? 'Disolver y Salir del Grupo' : 'Salir del Grupo'}
            </button>
          </div>
        </motion.div>
      ) : (
        // STATE 2: User is NOT in a family
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Welcome Info banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/[0.06]">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-[#8B5CF6]" /> Finanzas en Equipo
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              El Plan Familiar te permite vincular hasta 5 familiares. Compartirán presupuestos, patrimonio neto consolidado, transacciones de gastos e ingresos, y metas de ahorro comunes en tiempo real.
            </p>
          </div>

          {/* Form 1: Join Family Group */}
          <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.06] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Unirse a un Grupo Familiar</h3>
              <p className="text-[10px] text-white/30 mt-0.5">Ingresa el código que te envió el creador del grupo.</p>
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={familyCode}
                onChange={e => setFamilyCode(e.target.value)}
                placeholder="Ej: FAM-XXXXXX"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#8B5CF6] placeholder:text-white/20"
              />
              <button
                type="submit"
                disabled={!familyCode.trim() || actionLoading}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/[0.08] hover:bg-white/10 hover:border-white/20 text-white text-xs font-bold transition-all"
              >
                Unirse al Grupo
              </button>
            </form>
          </div>

          {/* Form 2: Create Family Group */}
          <div className="p-5 rounded-2xl bg-[#111] border border-white/[0.06] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Crear un Nuevo Grupo Familiar</h3>
              <p className="text-[10px] text-white/30 mt-0.5">Solo disponible para usuarios suscriptos al Plan Familiar.</p>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                placeholder="Nombre del Grupo (ej: Familia García)"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#8B5CF6] placeholder:text-white/20"
              />
              <button
                type="submit"
                disabled={!familyName.trim() || actionLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white text-xs font-bold transition-all shadow-md"
              >
                Crear Grupo Familiar
              </button>
            </form>
          </div>

          {/* Upgrade Banner for Free/Pro users */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FF2D92]/10 to-[#8B5CF6]/5 border border-[#FF2D92]/20 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">¿Aún no tienes el Plan Familiar?</p>
              <p className="text-[10px] text-white/40 mt-0.5 leading-normal">
                Suscripción familiar por $8.99/mes. Agrega a tu pareja o familiares.
              </p>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] text-white text-[11px] font-bold shrink-0 shadow-md"
            >
              Cambiar Plan
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
