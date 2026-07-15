import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, ListPlus, Receipt, BarChart3, Sparkles, LogOut, HelpCircle, Target, Shield, LineChart, Users, Menu, X, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import NotificationBell from '@/components/NotificationBell'

const NAV = [
  { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { path: '/transactions', label: 'Movimientos', icon: Receipt },
  { path: '/add', label: 'Agregar', icon: ListPlus, isCenter: true },
  { path: '/summary', label: 'Resumen', icon: BarChart3 },
  { path: '/chat', label: 'Experto', icon: Sparkles },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/quotes', label: 'Inversiones', icon: LineChart },
  { path: '/bills', label: 'Vencimientos', icon: Calendar },
];

export default function Layout() {
  useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tickerAssets, setTickerAssets] = useState([
    { symbol: 'BTC', price: 92450.50, change: 1.45 },
    { symbol: 'ETH', price: 3420.20, change: -0.85 },
    { symbol: 'AAPL', price: 184.25, change: 0.32 },
    { symbol: 'KO', price: 59.45, change: 0.12 },
    { symbol: 'TSLA', price: 248.60, change: -2.15 },
    { symbol: 'GLD', price: 218.40, change: 0.65 },
  ]);

  useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 50;
        const y = (e.clientY / window.innerHeight - 0.5) * 50;
        setMousePos({ x, y });
        rafId = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerAssets(prev => prev.map(asset => {
        const factor = 1 + (Math.random() - 0.5) * 0.0006;
        const newPrice = asset.price * factor;
        const changeDiff = (factor - 1) * 100;
        return {
          ...asset,
          price: newPrice,
          change: Math.max(-99, Math.min(99, asset.change + changeDiff)),
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const renderTickers = (keyPrefix: string) => (
    <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
      {tickerAssets.map((asset, i) => {
        const up = asset.change >= 0;
        return (
          <button
            key={`${keyPrefix}-${asset.symbol}-${i}`}
            onClick={() => navigate('/quotes')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity active:scale-95 text-left focus:outline-none"
          >
            <span className="font-bold text-white/40">{asset.symbol}</span>
            <span className="font-extrabold text-white/80">${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${up ? 'text-[#10B981] bg-[#10B981]/10' : 'text-[#FF4D6A] bg-[#FF4D6A]/10'}`}>
              {up ? '▲' : '▼'} {Math.abs(asset.change).toFixed(2)}%
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden relative">
      {/* Ticker Marquee */}
      <div className="w-full h-8 bg-black/50 backdrop-blur-md border-b border-white/[0.04] overflow-hidden flex items-center z-50 select-none">
        <div className="flex w-full overflow-hidden">
          {renderTickers('m1')}
          {renderTickers('m2')}
          {renderTickers('m3')}
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Ambient Aurora Background */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ background: '#080810' }}>
        <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full animate-float-slow transition-transform duration-1000 ease-out"
          style={{ 
            background: 'radial-gradient(ellipse, rgba(var(--theme-glow), 0.28) 0%, transparent 70%)', 
            filter: 'blur(70px)',
            transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`
          }} />
        <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full animate-float-slower transition-transform duration-1000 ease-out"
          style={{ 
            background: 'radial-gradient(ellipse, rgba(var(--theme-glow), 0.2) 0%, transparent 70%)', 
            filter: 'blur(70px)',
            transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px)`
          }} />
        <div className="absolute top-[35%] right-[5%] w-[40%] h-[40%] rounded-full animate-float-medium transition-transform duration-1000 ease-out"
          style={{ 
            background: 'radial-gradient(ellipse, rgba(var(--theme-glow), 0.15) 0%, transparent 70%)', 
            filter: 'blur(65px)',
            transform: `translate(${mousePos.x * 1.2}px, ${mousePos.y * -1.2}px)`
          }} />
        <div className="absolute top-[60%] left-[20%] w-[30%] h-[30%] rounded-full animate-float-slow transition-transform duration-1000 ease-out"
          style={{ 
            background: 'radial-gradient(ellipse, rgba(var(--theme-glow), 0.12) 0%, transparent 70%)', 
            filter: 'blur(55px)',
            transform: `translate(${mousePos.x * -1}px, ${mousePos.y * 1}px)`
          }} />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-3.5rem)] sticky top-8 z-50 glass-strong border-r border-white/[0.06] pb-4">
        {/* Logo & Notifications */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Tus Finanzas" className="w-9 h-9 rounded-lg object-cover" />
            <span className="font-bold text-lg tracking-tight">Tus Finanzas</span>
          </div>
          <NotificationBell />
        </div>

        {/* User - Click to go to Profile */}
        <div className="px-4 mb-4">
          <button 
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all text-left group active:scale-[0.98]"
          >
            {(user as any)?.avatar && !(user as any).avatar.startsWith('http') && !(user as any).avatar.startsWith('/') ? (
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg select-none shrink-0 group-hover:scale-105 transition-transform">
                {(user as any).avatar}
              </div>
            ) : (user as any)?.avatar ? (
              <img src={(user as any).avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 group-hover:scale-105 transition-transform" />
            ) : (
              <img src="/logo.jpg" alt="" className="w-9 h-9 rounded-full object-cover shrink-0 group-hover:scale-105 transition-transform" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-white transition-colors">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email || ''}</p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
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
      <main className="flex-1 min-h-screen pb-24 lg:pb-0 relative z-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/60 backdrop-blur-3xl border-t border-white/[0.08] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {/* Inicio */}
          <button onClick={() => { setShowMobileMenu(false); navigate('/dashboard'); }} className="flex flex-col items-center gap-1 py-1 px-3 relative">
            <LayoutDashboard size={20} className={isActive('/dashboard') ? 'text-[#FF2D92]' : 'text-white/30'} />
            <span className={`text-[10px] ${isActive('/dashboard') ? 'text-[#FF2D92] font-medium' : 'text-white/30'}`}>Inicio</span>
            {isActive('/dashboard') && <motion.div layoutId="nav-indicator" className="absolute -top-2 w-6 h-0.5 bg-[#FF2D92] rounded-full" />}
          </button>

          {/* Movimientos */}
          <button onClick={() => { setShowMobileMenu(false); navigate('/transactions'); }} className="flex flex-col items-center gap-1 py-1 px-3 relative">
            <Receipt size={20} className={isActive('/transactions') ? 'text-[#FF2D92]' : 'text-white/30'} />
            <span className={`text-[10px] ${isActive('/transactions') ? 'text-[#FF2D92] font-medium' : 'text-white/30'}`}>Movimientos</span>
            {isActive('/transactions') && <motion.div layoutId="nav-indicator" className="absolute -top-2 w-6 h-0.5 bg-[#FF2D92] rounded-full" />}
          </button>

          {/* Agregar (Center Button) */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShowMobileMenu(false); navigate('/add'); }}
            className="relative -mt-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-[0_4px_20px_rgba(255,45,146,0.4)]">
            <ListPlus size={24} className="text-white" />
          </motion.button>

          {/* Experto */}
          <button onClick={() => { setShowMobileMenu(false); navigate('/chat'); }} className="flex flex-col items-center gap-1 py-1 px-3 relative">
            <Sparkles size={20} className={isActive('/chat') ? 'text-[#FF2D92]' : 'text-white/30'} />
            <span className={`text-[10px] ${isActive('/chat') ? 'text-[#FF2D92] font-medium' : 'text-white/30'}`}>Experto</span>
            {isActive('/chat') && <motion.div layoutId="nav-indicator" className="absolute -top-2 w-6 h-0.5 bg-[#FF2D92] rounded-full" />}
          </button>

          {/* Más Menu Toggle */}
          <button onClick={() => setShowMobileMenu(prev => !prev)} className="flex flex-col items-center gap-1 py-1 px-3 relative">
            <Menu size={20} className={showMobileMenu ? 'text-[#FF2D92]' : 'text-white/30'} />
            <span className={`text-[10px] ${showMobileMenu ? 'text-[#FF2D92] font-medium' : 'text-white/30'}`}>Más</span>
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Up Drawer Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] border-t border-white/[0.1] bg-[#0F0F0F]/80 backdrop-blur-3xl p-6 pb-12 shadow-[0_-8px_32px_rgba(0,0,0,0.8)]"
            >
              {/* Handlebar for premium feel */}
              <div className="w-12 h-1.5 rounded-full bg-white/10 mx-auto mb-6" onClick={() => setShowMobileMenu(false)} />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white">Menú</h3>
                  <p className="text-xs text-white/40">Más secciones de finanzas</p>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid of Sections */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { path: '/summary', label: 'Resumen', icon: BarChart3, color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10' },
                  { path: '/goals', label: 'Metas', icon: Target, color: 'text-[#FFD166]', bg: 'bg-[#FFD166]/10' },
                  { path: '/quotes', label: 'Inversiones', icon: LineChart, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
                  { path: '/bills', label: 'Vencimientos', icon: Calendar, color: 'text-[#FF4D6A]', bg: 'bg-[#FF4D6A]/10' },
                  { path: '/family', label: 'Mi Familia', icon: Users, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
                  { path: '/support', label: 'Soporte', icon: HelpCircle, color: 'text-[#FF2D92]', bg: 'bg-[#FF2D92]/10' },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate(item.path);
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                        active
                          ? 'bg-white/[0.06] border-white/20 text-white'
                          : 'bg-white/[0.02] border-white/[0.04] text-white/60 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                        <Icon size={20} className={item.color} />
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Logout Button inside drawer */}
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  logout();
                }}
                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
