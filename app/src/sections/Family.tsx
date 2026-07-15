import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Users, Shield, LogOut, Copy, Check, Trash2, Plus, Sparkles, MessageCircle } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'

export default function Family() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: family, isLoading } = trpc.family.getMyFamily.useQuery();

  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Fetch family chat messages with automatic updates (long poll style)
  const { data: messages = [], refetch: refetchMessages } = trpc.family.listMessages.useQuery(undefined, {
    enabled: !!family,
    refetchInterval: 3500 // refresh chat every 3.5 seconds
  });

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const updateLimit = trpc.family.updateMemberLimit.useMutation({
    onSuccess: () => {
      utils.family.getMyFamily.invalidate();
    },
    onError: (err) => {
      alert(err.message || 'Error al actualizar el límite.');
    },
  });

  const sendMessage = trpc.family.sendMessage.useMutation({
    onSuccess: () => {
      setChatInput('');
      refetchMessages();
    },
    onError: (err) => {
      alert(err.message || 'Error al enviar el mensaje.');
    }
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;
    setActionLoading(true);
    try {
      await createFamily.mutateAsync({ name: familyName });
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyCode.trim()) return;
    setActionLoading(true);
    try {
      await joinFamily.mutateAsync({ code: familyCode });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = () => {
    if (!family?.code) return;
    navigator.clipboard.writeText(family.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage.mutate({ message: chatInput });
  };

  return (
    <div id="family-panel" className="max-w-lg mx-auto px-6 pt-6 pb-24">
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
          <div className="relative overflow-hidden p-6 rounded-2xl glass-strong glow-purple">
            <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.12) 0%, transparent 60%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.18)', boxShadow: '0 0 20px rgba(139,92,246,0.25)' }}>
                  <Users size={24} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Grupo Familiar</p>
                  <h2 className="text-xl font-bold text-white">{family.name}</h2>
                </div>
              </div>

              {/* Member capacity bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Capacidad</span>
                  <span className={`text-[10px] font-bold ${ family.members.length >= 6 ? 'text-[#FF4D6A]' : family.members.length >= 4 ? 'text-[#FFD166]' : 'text-[#8B5CF6]' }`}>
                    {family.members.length}/6 integrantes
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(family.members.length / 6) * 100}%`, background: family.members.length >= 6 ? '#FF4D6A' : family.members.length >= 4 ? '#FFD166' : 'linear-gradient(90deg, #8B5CF6, #FF2D92)' }} />
                </div>
                {family.members.length >= 6 && <p className="text-[10px] text-[#FF4D6A] mt-1">Grupo completo. No se pueden agregar más integrantes.</p>}
              </div>

              {/* Invitation Code */}
              <div className="p-4 rounded-xl glass flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">Código de Invitación</p>
                  <p className="text-sm font-mono font-bold text-white/90 mt-0.5 tracking-widest">{family.code}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`p-2.5 rounded-lg border transition-all ${
                    copied
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                      : 'glass border-white/[0.08] text-white/60 hover:text-white'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-white/25 mt-3">
                Comparte este código con tus familiares para invitarlos (máximo 6 integrantes en total).
              </p>
            </div>
          </div>

          {/* Members List with Spending Limits */}
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
              <Users size={12} className="text-white/30" /> Integrantes ({family.members.length}/6)
            </h3>
            <div className="space-y-3">
              {family.members.map((mem, idx) => {
                const isAdmin = mem.role === 'admin';
                const isMe = mem.id === user?.id;
                
                return (
                  <div key={mem.id} className="p-3.5 rounded-xl glass space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {mem.avatar && !mem.avatar.startsWith('http') && !mem.avatar.startsWith('/') ? (
                          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg select-none shrink-0 shadow-sm">
                            {mem.avatar}
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: isAdmin ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)', color: isAdmin ? '#8B5CF6' : `hsl(${(idx * 60) % 360}, 70%, 70%)`, boxShadow: isAdmin ? '0 0 12px rgba(139,92,246,0.3)' : 'none' }}>
                            {mem.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold truncate text-white">{mem.name}</p>
                            {isMe && (
                              <span className="text-[9px] glass border border-white/10 px-1.5 py-0.5 rounded-full text-white/40">Tú</span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/30 truncate">{mem.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          isAdmin ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/20' : 'glass text-white/40'
                        }`}>
                          {isAdmin ? 'Admin' : 'Miembro'}
                        </span>

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

                    {/* Member Spending Limit Bar */}
                    {!isAdmin && (
                      <div className="pt-2 border-t border-white/[0.04] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/40">Gasto mensual este mes:</span>
                          <span className="font-semibold text-white/80">
                            ${mem.spentThisMonth.toLocaleString()} / {mem.spendingLimit ? `$${mem.spendingLimit.toLocaleString()}` : 'Sin Límite'}
                          </span>
                        </div>
                        
                        {mem.spendingLimit && (
                          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                mem.spentThisMonth >= mem.spendingLimit ? 'bg-[#FF4D6A]' : 'bg-theme-accent'
                              }`}
                              style={{ width: `${Math.min(100, (mem.spentThisMonth / mem.spendingLimit) * 100)}%` }}
                            />
                          </div>
                        )}

                        {/* Admin Limit Editor */}
                        {family.myRole === 'admin' && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <input
                              id={`limit-input-${mem.id}`}
                              type="number"
                              placeholder={mem.spendingLimit ? `Límite: $${mem.spendingLimit}` : "Asignar tope $"}
                              className="w-full px-2.5 py-1.5 glass rounded-lg text-[10px] text-white focus:outline-none focus:border-theme-accent font-semibold"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const target = e.currentTarget;
                                  const val = target.value.trim() === '' ? null : parseFloat(target.value);
                                  if (val !== null && (isNaN(val) || val < 0)) {
                                    alert("Por favor, ingresa un monto válido mayor o igual a 0.");
                                    return;
                                  }
                                  updateLimit.mutate({ targetUserId: mem.id, limit: val });
                                  target.value = '';
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById(`limit-input-${mem.id}`) as HTMLInputElement;
                                if (el) {
                                  const val = el.value.trim() === '' ? null : parseFloat(el.value);
                                  if (val !== null && (isNaN(val) || val < 0)) {
                                    alert("Por favor, ingresa un monto válido.");
                                    return;
                                  }
                                  updateLimit.mutate({ targetUserId: mem.id, limit: val });
                                  el.value = '';
                                }
                              }}
                              className="px-2 py-1.5 rounded-lg bg-theme-accent text-white text-[10px] font-bold hover:opacity-95 active:scale-95 transition-all shrink-0"
                            >
                              Aplicar
                            </button>
                            {mem.spendingLimit && (
                              <button
                                onClick={() => updateLimit.mutate({ targetUserId: mem.id, limit: null })}
                                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-white/50 hover:text-white transition-all shrink-0 border border-white/5"
                              >
                                Quitar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Family Chat Container */}
          <div className="p-5 rounded-2xl glass-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
              <MessageCircle size={14} className="text-theme-accent" /> Chat Grupal Familiar
            </h3>

            <div className="h-44 overflow-y-auto space-y-2.5 p-3 glass rounded-xl custom-scrollbar flex flex-col">
              {messages.length === 0 ? (
                <p className="text-[10px] text-white/20 text-center py-12 my-auto">El chat está vacío. ¡Envía un mensaje familiar!</p>
              ) : (
                messages.map((msg: any) => {
                  const isMe = msg.userId === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <span className="text-[9px] text-white/30 mb-0.5">{msg.userName}</span>
                      <div className={`px-3 py-1.5 rounded-xl text-xs ${
                        isMe ? 'bg-theme-accent text-white rounded-tr-none shadow-md shadow-theme-glow/10' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'
                      }`} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe un mensaje familiar..."
                className="flex-1 px-3 py-2.5 glass border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-theme-accent"
              />
              <button
                type="submit"
                disabled={sendMessage.isPending}
                className="px-4 py-2.5 rounded-xl bg-theme-accent text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Enviar
              </button>
            </form>
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
          <div className="relative overflow-hidden p-5 rounded-2xl glass-strong glow-purple">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top left, rgba(139,92,246,0.10) 0%, transparent 60%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/25 to-transparent" />
            <div className="relative">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Users size={18} className="text-theme-accent" /> Control Multifamiliar
              </h2>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                El Plan Familiar te permite vincular cuentas de hasta 6 integrantes. Compartan presupuestos, saldos de capital, metas de ahorro y chateen de forma coordinada.
              </p>
            </div>
          </div>

          {/* Join Group */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div>
              <h3 className="font-bold text-sm text-white">Unirse a un Grupo Familiar</h3>
              <p className="text-[10px] text-white/30 mt-0.5">Ingresa el código que te envió el administrador</p>
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={familyCode}
                onChange={e => setFamilyCode(e.target.value)}
                placeholder="Código de Invitación (ej: FAM-12345)"
                required
                className="w-full px-4 py-3 glass border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-theme-accent font-semibold tracking-wider text-center"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs tracking-wide transition-all"
              >
                {actionLoading ? 'Uniéndose...' : 'Unirse al Grupo'}
              </button>
            </form>
          </div>

          {/* Create Group */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div>
              <h3 className="font-bold text-sm text-white">Crear Nuevo Grupo</h3>
              <p className="text-[10px] text-white/30 mt-0.5">Define un nombre para tu núcleo familiar (ej: Familia Poli)</p>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                placeholder="Nombre del grupo (ej: Familia Poli)"
                required
                className="w-full px-4 py-3 glass border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-theme-accent"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-bold text-xs tracking-wide shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {actionLoading ? 'Creando...' : 'Crear mi Grupo Familiar'}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  )
}
