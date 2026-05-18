import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { authApi, saveAuthSession } from '../api/auth';
import { getErrorMessage } from '../api/request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/upload';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(username.trim(), password);
      saveAuthSession(res);
      toast.success('登录成功');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#050505]">

      {/* === VIDEO BACKGROUND === */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      >
        <source src="/bg-hero.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/70 to-[#050505]/40" />

      {/* Giant editorial text */}
      <motion.div
        className="absolute inset-0 flex items-end justify-end pointer-events-none select-none p-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
      >
        <h1 className="text-editorial text-[clamp(80px,14vw,200px)] text-white/[0.04] leading-none text-right">
          AI
        </h1>
      </motion.div>

      {/* Form content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 lg:items-start lg:pl-[8%]">
        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-12 flex items-center gap-3">
            <div className="h-[2px] w-8 bg-[var(--color-accent)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--color-stone)]">AI Interview Platform</span>
          </div>

          <h2 className="text-display text-[clamp(32px,5vw,44px)] text-[var(--color-cream)]">
            Welcome<br />back
          </h2>
          <p className="mt-4 text-[15px] text-[var(--color-stone)]">登录你的账号继续使用</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-stone)] mb-2.5">用户名</label>
              <Input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="请输入用户名" required minLength={3} />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-stone)] mb-2.5">密码</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="请输入密码" required minLength={8} />
            </div>
            <Button type="submit" variant="accent" size="lg" disabled={loading} className="mt-6 w-full">
              {loading ? '登录中…' : '登录'}
            </Button>
          </form>

          <p className="mt-10 text-center text-[13px] text-[var(--color-stone)]">
            没有账号？{' '}
            <Link to="/register" className="text-[var(--color-accent)] hover:underline underline-offset-4">注册</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
