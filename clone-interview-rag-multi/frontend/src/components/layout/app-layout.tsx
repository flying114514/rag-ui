import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Database, FileStack, FileText, Menu, MessageSquare, Sparkles, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearAuthSession } from '@/api/auth';
import { AnimatePresence, motion } from 'framer-motion';

interface NavItem { path: string; label: string; icon: LucideIcon; }

const navItems: NavItem[] = [
  { path: '/upload', label: 'HOME', icon: Sparkles },
  { path: '/history', label: 'RESUMES', icon: FileStack },
  { path: '/resume-builder', label: 'BUILDER', icon: FileText },
  { path: '/interviews', label: 'INTERVIEWS', icon: Users },
  { path: '/knowledgebase', label: 'KNOWLEDGE', icon: Database },
  { path: '/knowledgebase/chat', label: 'CHAT', icon: MessageSquare },
];

function isActive(currentPath: string, itemPath: string) {
  if (itemPath === '/knowledgebase') return currentPath === '/knowledgebase' || currentPath === '/knowledgebase/upload';
  if (itemPath === '/resume-builder') return currentPath.startsWith('/resume-builder');
  return currentPath.startsWith(itemPath);
}

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/upload';
  const isInterview = location.pathname.startsWith('/interview/');

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Video background - only on inner pages (not home, not interview) */}
      {!isHome && !isInterview && (
        <>
          <video autoPlay loop muted playsInline
            className="fixed inset-0 w-full h-full object-cover opacity-50 pointer-events-none z-0">
            <source src="/bg-hero.mp4" type="video/mp4" />
          </video>
          <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 pointer-events-none z-0" />
        </>
      )}

      {/* Navigation - hidden on interview page */}
      {!isInterview && (
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isHome ? '' : 'bg-black/40 backdrop-blur-2xl border-b border-white/[0.06]'
      )}>
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-8 md:px-12">
          <Link to="/upload">
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--color-cream)]">AI INTERVIEW</span>
          </Link>

          <nav className="hidden lg:flex items-center">
            {navItems.map((item, i) => {
              const active = isActive(location.pathname, item.path);
              return (
                <span key={item.path} className="flex items-center">
                  {i > 0 && <span className="mx-3 text-white/20">|</span>}
                  <Link to={item.path}
                    className={cn('text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300',
                      active ? 'text-[var(--color-accent)]' : 'text-[var(--color-stone-light)] hover:text-[var(--color-cream)]')}>
                    {item.label}
                  </Link>
                </span>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button type="button" onClick={() => { clearAuthSession(); navigate('/login', { replace: true }); }}
              className="hidden lg:block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-stone-light)] hover:text-[var(--color-cream)] transition-colors cursor-pointer">
              LOGOUT
            </button>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center text-[var(--color-cream)] lg:hidden">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] lg:hidden">
              <nav className="flex flex-col gap-1 px-8 py-4">
                {navItems.map((item) => {
                  const active = isActive(location.pathname, item.path);
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                      className={cn('py-2.5 text-[11px] font-medium uppercase tracking-[0.2em]',
                        active ? 'text-[var(--color-accent)]' : 'text-[var(--color-stone-light)]')}>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      )}

      <main className={cn('relative z-10', isHome || isInterview ? '' : 'pt-20')}>
        <Outlet />
      </main>
    </div>
  );
}
