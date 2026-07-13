import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, Trash2, Users, CreditCard, Sparkles, AlertTriangle } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: notifications = [] } = trpc.notification.list.useQuery();
  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => utils.notification.list.invalidate(),
  });

  const unreadCount = notifications.filter(n => n.isRead === 0).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAsRead.mutate({});
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return <AlertTriangle size={14} className="text-[#FF4D6A]" />;
      case 'family':
        return <Users size={14} className="text-[#8B5CF6]" />;
      case 'payment':
        return <CreditCard size={14} className="text-[#10B981]" />;
      case 'ia_tip':
        return <Sparkles size={14} className="text-[#00E5FF]" />;
      default:
        return <Info size={14} className="text-white/40" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return 'bg-[#FF4D6A]/10 border-[#FF4D6A]/20';
      case 'family':
        return 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20';
      case 'payment':
        return 'bg-[#10B981]/10 border-[#10B981]/20';
      case 'ia_tip':
        return 'bg-[#00E5FF]/10 border-[#00E5FF]/20';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="p-2 rounded-xl glass hover:bg-white/10 transition-colors relative flex items-center justify-center text-white/70 hover:text-white"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF2D92] animate-pulse" />
        )}
      </motion.button>

      {/* Glass Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-96 rounded-2xl glass-strong border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-50 text-left"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-white">Notificaciones</h3>
                <p className="text-[10px] text-white/40 mt-0.5">Mensajes y alertas recientes</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead.mutate({})}
                  className="flex items-center gap-1 text-[9px] font-semibold text-[#FF2D92] hover:underline"
                >
                  <Check size={10} /> Marcar leído
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 divide-y divide-white/[0.04]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-xs">
                  <Bell size={20} className="mx-auto mb-2 text-white/10" />
                  No tenés notificaciones aún
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors flex items-start gap-3 hover:bg-white/[0.02] ${
                      n.isRead === 0 ? 'bg-white/[0.01]' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg shrink-0 border flex items-center justify-center ${getBgColor(n.type)}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${n.isRead === 0 ? 'text-white' : 'text-white/60'} truncate`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-white/40 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[8px] text-white/20 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('es-AR')} a las{' '}
                        {new Date(n.createdAt).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
