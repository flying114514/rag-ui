import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Database, FileStack, FileText, LogOut, MessageSquare, Sparkles, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearAuthSession } from '@/api/auth';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navItems: NavItem[] = [
  { path: '/upload', label: '上传简历', icon: Sparkles },
  { path: '/history', label: '简历库', icon: FileStack },
  { path: '/resume-builder', label: '简历生成', icon: FileText },
  { path: '/interviews', label: '面试记录', icon: Users },
  { path: '/knowledgebase', label: '知识库', icon: Database },
  { path: '/knowledgebase/chat', label: '问答助手', icon: MessageSquare },
];

function isActive(currentPath: string, itemPath: string) {
  if (itemPath === '/knowledgebase') return currentPath === '/knowledgebase' || currentPath === '/knowledgebase/upload';
  if (itemPath === '/resume-builder') return currentPath.startsWith('/resume-builder');
  return currentPath.startsWith(itemPath);
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[var(--color-ink)]/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col bg-[var(--color-surface-raised)] transition-transform duration-300 ease-[var(--ease-out)] shadow-[1px_0_0_var(--color-border)]',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        <div className="flex h-[72px] items-center px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-accent)] to-indigo-600 shadow-[var(--shadow-sm)]">
              <Sparkles className="h-4 w-4 text-white" />
              <div className="absolute inset-0 rounded-[var(--radius-md)] bg-white/10 animate-glow" />
            </div>
            <span className="text-display text-[18px] text-[var(--color-cream)]">Interview</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-stone)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-cream)] md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(location.pathname, item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[14px] font-medium transition-all duration-200',
                  active
                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] border-l-[3px] border-l-[var(--color-accent)] pl-[calc(0.75rem-3px)]'
                    : 'text-white/60 hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-cream)]'
                )}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--color-border)] px-3 py-4">
          <button
            type="button"
            onClick={() => {
              clearAuthSession();
              navigate('/login', { replace: true });
            }}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] font-medium text-[var(--color-stone)] transition-all duration-200 hover:bg-[var(--color-danger)] hover:text-[var(--color-danger-text)] cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
            退出登录
          </button>
        </div>
      </aside>
    </>
  );
}
