import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Globe } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { setLocalToken } from '@/hooks/useAuth';

const COUNTRIES = [
  'Argentina', 'Mexico', 'Colombia', 'Chile', 'Peru', 'Espana',
  'Uruguay', 'Ecuador', 'Bolivia', 'Venezuela', 'Estados Unidos', 'Otro'
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Argentina');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setLocalToken(data.token);
      window.location.href = '/dashboard';
    },
    onError: (err) => {
      setError(err.message);
      setLoading(false);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setLocalToken(data.token);
      window.location.href = '/dashboard';
    },
    onError: (err) => {
      setError(err.message);
      setLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      if (password.length < 6) {
        setError('La contrasena debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }
      if (name.length < 2) {
        setError('El nombre debe tener al menos 2 caracteres');
        setLoading(false);
        return;
      }
      registerMutation.mutate({ email, password, name, country });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <img src="/logo.jpg" alt="IAfinanzas" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover shadow-[0_0_30px_rgba(255,45,146,0.3)]" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF2D92] to-[#8B5CF6] bg-clip-text text-transparent">
            IAfinanzas
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {isLogin ? 'Inicia sesion en tu cuenta' : 'Crea tu cuenta gratis'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#1A1A1A] border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92] transition-colors"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-11 pr-4 py-3.5 bg-[#1A1A1A] border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92] transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contrasena"
                className="w-full pl-11 pr-11 py-3.5 bg-[#1A1A1A] border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D92] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Country (register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="relative">
                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 z-10" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#1A1A1A] border border-white/[0.08] rounded-2xl text-sm text-white focus:outline-none focus:border-[#FF2D92] transition-colors appearance-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c} className="bg-[#1A1A1A] text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-[#FF4D6A] text-center">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF2D92] via-[#8B5CF6] to-[#6366F1] text-white font-semibold shadow-[0_4px_20px_rgba(255,45,146,0.3)] hover:shadow-[0_4px_30px_rgba(255,45,146,0.5)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Iniciar sesion' : 'Crear cuenta'} <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-white/40 mt-6">
            {isLogin ? 'No tenes cuenta?' : 'Ya tenes cuenta?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-[#FF2D92] hover:underline font-medium"
            >
              {isLogin ? 'Registrate' : 'Inicia sesion'}
            </button>
          </p>


        </motion.div>
      </div>
    </div>
  );
}
