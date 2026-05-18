import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { authApi, saveAuthSession } from '../api/auth';
import { getErrorMessage } from '../api/request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(username.trim(), password);
      saveAuthSession(res);
      toast.success('注册成功');
      navigate('/upload', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[520px] xl:w-[600px] relative flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a2e] via-[#1a1145] to-[#0d1b3e]" />
        <div className="absolute top-[30%] right-[10%] w-[280px] h-[280px] rounded-full bg-gradient-to-r from-purple-500/25 to-pink-500/15 blur-[70px] animate-float" />
        <div className="absolute bottom-[25%] left-[15%] w-[220px] h-[220px] rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/10 blur-[60px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[55%] right-[35%] w-[180px] h-[180px] rounded-full bg-gradient-to-r from-cyan-400/15 to-indigo-400/10 blur-[50px] animate-glow" />

        <motion.div
          className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-white/10 backdrop-blur-sm border border-white/10">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-display text-[20px] text-white/90">Interview</span>
          </div>

          <div className="max-w-[420px]">
            <motion.h1
              className="text-display text-[clamp(36px,5vw,48px)] text-white leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Start your<br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-clip-text text-transparent animate-gradient">
                journey today
              </span>
            </motion.h1>
            <motion.p
              className="mt-6 text-[16px] leading-relaxed text-white/50 max-w-[360px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              创建账号即可使用简历分析、模拟面试、知识库问答等全部功能。数据仅对你可见。
            </motion.p>
          </div>

          <p className="text-[12px] text-white/25 tracking-wider uppercase">Your data stays private</p>
        </motion.div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-[var(--color-surface)] gradient-mesh">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-accent)] to-indigo-600 shadow-[var(--shadow-sm)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-display text-[18px] text-[var(--color-ink)]">Interview</span>
          </div>

          <h1 className="text-display text-[32px] text-[var(--color-ink)]">Create account</h1>
          <p className="mt-3 text-[15px] text-[var(--color-ink-muted)]">用户名 3~64 字符，密码至少 8 位</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[var(--color-ink)] mb-2">用户名</label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="请输入用户名"
                required
                minLength={3}
                maxLength={64}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[var(--color-ink)] mb-2">密码</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="至少 8 位"
                required
                minLength={8}
                maxLength={128}
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={loading}
              className="mt-4 w-full"
            >
              {loading ? '提交中…' : '注册并登录'}
            </Button>
          </form>

          <p className="mt-10 text-center text-[14px] text-[var(--color-ink-muted)]">
            已有账号？{' '}
            <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline underline-offset-4">
              登录
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
