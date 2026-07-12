import { Outlet, useLocation, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { LayoutDashboard, ListPlus, Receipt, BarChart3, Sparkles, LogOut, HelpCircle, Target, Shield, LineChart, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const NAV = [
  { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { path: '/transactions', label: 'Movimientos', icon: Receipt },
  { path: '/add', label: 'Agregar', icon: ListPlus, isCenter: true },
  { path: '/summary', label: 'Resumen', icon: BarChart3 },
  { path: '/chat', label: 'Experto', icon: Sparkles },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/quotes', label: 'Inversiones', icon: LineChart },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-white/[0.06] bg-[#0A0A0A]/95 backdrop-blur-xl z-50">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.jpg" alt="TusFinanzas" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-bold text-lg tracking-tight">TusFinanzas</span>
        </div>

        {/* User */}
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {(user as any)?.avatar ? (
              <img src={(user as any).avatar} alt="" className="w-9 h-9 rounded-full" />
            ) : (
              <img src="/logo.jpg" alt="" className="w-9 h-9 rounded-full object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-semibold shadow-[0_4px_20px_rgba(255,45,146,0.3)] hover:shadow-[0_4px_30px_rgba(255,45,146,0.5)] transition-shadow mt-4">
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            }

            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  active
                    ? 'bg-white/[0.08] text-white font-medium border border-white/[0.08]'
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                }`}>
                <Icon size={20} className={active ? 'text-[#FF2D92]' : ''} />
                <span className="text-sm">{item.label}</span>
                {active && <motion.div layoutId="sidebar-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF2D92]" />}
              </button>
            );
          })}
        </nav>

        {/* Support + Admin + Logout */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <button onClick={() => navigate('/family')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              isActive('/family') ? 'bg-white/[0.08] text-white font-medium border border-white/[0.08]' : 'text-white/30 hover:bg-white/[0.04] hover:text-white/60'
            }`}>
            <Users size={18} className={isActive('/family') ? 'text-[#FF2D92]' : ''} />
            <span className="text-sm">Mi Familia</span>
          </button>
          <button onClick={() => navigate('/support')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              isActive('/support') ? 'bg-white/[0.08] text-white font-medium border border-white/[0.08]' : 'text-white/30 hover:bg-white/[0.04] hover:text-white/60'
            }`}>
            <HelpCircle size={18} className={isActive('/support') ? 'text-[#FF2D92]' : ''} />
            <span className="text-sm">Soporte</span>
          </button>
          {/* Admin link - only shown for admins */}
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                isActive('/admin') ? 'bg-white/[0.08] text-white font-medium border border-white/[0.08]' : 'text-white/30 hover:bg-white/[0.04] hover:text-white/60'
              }`}>
              <Shield size={18} className={isActive('/admin') ? 'text-[#FF2D92]' : ''} />
              <span className="text-sm">Admin</span>
            </button>
          )}
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-all text-left">
            <LogOut size={18} />
            <span className="text-sm">Cerrar sesion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-2xl border-t border-white/[0.06]">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
          {NAV.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <motion.button key={item.path} whileTap={{ scale: 0.9 }} onClick={() => navigate(item.path)}
                  className="relative -mt-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-[0_4px_20px_rgba(255,45,146,0.4)]">
                  <Icon size={24} className="text-white" />
                </motion.button>
              );
            }

            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1 py-1 px-3 relative">
                <Icon size={20} className={active ? 'text-[#FF2D92]' : 'text-white/30'} />
                <span className={`text-[10px] ${active ? 'text-[#FF2D92] font-medium' : 'text-white/30'}`}>{item.label}</span>
                {active && <motion.div layoutId="nav-indicator" className="absolute -top-2 w-6 h-0.5 bg-[#FF2D92] rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
