import {useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {historyApi, type AnalyzeStatus, type ResumeListItem} from '../api/history';
import DeleteConfirmDialog from '../components/dialogs/DeleteConfirmDialog';
import {formatDateOnly} from '../utils/date';
import {getScoreProgressColor} from '../utils/score';
import {toast} from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HistoryListProps {
  onSelectResume: (id: number) => void;
}

type StatusFilter = 'ALL' | AnalyzeStatus;
type SortOption = 'uploadedAtDesc' | 'uploadedAtAsc' | 'scoreDesc' | 'scoreAsc' | 'filenameAsc';

function resolveAnalyzeStatus(resume: ResumeListItem): AnalyzeStatus {
  if (resume.analyzeStatus) {
    return resume.analyzeStatus;
  }
  return resume.latestScore !== undefined ? 'COMPLETED' : 'PENDING';
}

function getAnalyzeStatusText(status: AnalyzeStatus): string {
  switch (status) {
    case 'COMPLETED':
      return '已完成';
    case 'PROCESSING':
      return '分析中';
    case 'PENDING':
      return '待分析';
    case 'FAILED':
      return '失败';
    default:
      return '待分析';
  }
}

function getStatusBadgeVariant(status: AnalyzeStatus): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'PROCESSING':
      return 'warning';
    case 'FAILED':
      return 'danger';
    case 'PENDING':
    default:
      return 'default';
  }
}

function sortResumes(resumes: ResumeListItem[], sortBy: SortOption): ResumeListItem[] {
  return [...resumes].sort((a, b) => {
    switch (sortBy) {
      case 'uploadedAtAsc':
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case 'scoreDesc': {
        if (a.latestScore === undefined && b.latestScore === undefined) return 0;
        if (a.latestScore === undefined) return 1;
        if (b.latestScore === undefined) return -1;
        return b.latestScore - a.latestScore;
      }
      case 'scoreAsc': {
        if (a.latestScore === undefined && b.latestScore === undefined) return 0;
        if (a.latestScore === undefined) return 1;
        if (b.latestScore === undefined) return -1;
        return a.latestScore - b.latestScore;
      }
      case 'filenameAsc':
        return a.filename.localeCompare(b.filename, 'zh-CN');
      case 'uploadedAtDesc':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });
}

export default function HistoryList({ onSelectResume }: HistoryListProps) {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('uploadedAtDesc');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; filename: string } | null>(null);
  const [highlightResumeId, setHighlightResumeId] = useState<number | null>(null);
  const [pendingHighlightId, setPendingHighlightId] = useState<number | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const highlightTimerRef = useRef<number | null>(null);

  useEffect(() => {
    loadResumes();

    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newResumeId = (location.state as { newResumeId?: number } | null)?.newResumeId;
    if (typeof newResumeId === 'number') {
      setPendingHighlightId(newResumeId);
    }
  }, [location.state]);

  useEffect(() => {
    if (loading || pendingHighlightId === null) {
      return;
    }

    if (!resumes.some(resume => resume.id === pendingHighlightId)) {
      navigate(location.pathname, { replace: true, state: null });
      setPendingHighlightId(null);
      return;
    }

    if (searchTerm) {
      setSearchTerm('');
      return;
    }

    if (statusFilter !== 'ALL') {
      setStatusFilter('ALL');
      return;
    }

    if (sortBy !== 'uploadedAtDesc') {
      setSortBy('uploadedAtDesc');
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      rowRefs.current[pendingHighlightId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      setHighlightResumeId(pendingHighlightId);
      setPendingHighlightId(null);
      navigate(location.pathname, { replace: true, state: null });

      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightResumeId(current => current === pendingHighlightId ? null : current);
      }, 4000);
    }, 150);

    return () => window.clearTimeout(scrollTimer);
  }, [loading, location.pathname, navigate, pendingHighlightId, resumes, searchTerm, sortBy, statusFilter]);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const data = await historyApi.getResumes();
      setResumes(data);
    } catch (err) {
      console.error('加载历史记录失败', err);
      toast.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id, filename });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const { id } = deleteConfirm;
    setDeletingId(id);
    try {
      await historyApi.deleteResume(id);
      await loadResumes();
      setDeleteConfirm(null);
      toast.success('简历删除成功');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  };

  const displayedResumes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const filtered = resumes.filter(resume => {
      const matchesKeyword = keyword === '' || resume.filename.toLowerCase().includes(keyword);
      const currentStatus = resolveAnalyzeStatus(resume);
      const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
      return matchesKeyword && matchesStatus;
    });

    return sortResumes(filtered, sortBy);
  }, [resumes, searchTerm, sortBy, statusFilter]);

  const showFilteredEmptyState = !loading && resumes.length > 0 && displayedResumes.length === 0;
  const showInitialEmptyState = !loading && resumes.length === 0;

  return (
    <motion.div
      className="relative w-full px-8 md:px-12 pb-16 pt-10 max-w-[1440px] mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title="简历库"
        description="管理你的所有简历文件"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="text"
              placeholder="搜索简历..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-[240px]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 text-[13px] text-[var(--color-cream)] focus:border-[var(--color-border-focus)] focus:outline-none"
            >
              <option value="ALL">全部状态</option>
              <option value="PENDING">待分析</option>
              <option value="PROCESSING">分析中</option>
              <option value="COMPLETED">已完成</option>
              <option value="FAILED">失败</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 text-[13px] text-[var(--color-cream)] focus:border-[var(--color-border-focus)] focus:outline-none"
            >
              <option value="uploadedAtDesc">最新上传优先</option>
              <option value="uploadedAtAsc">最早上传优先</option>
              <option value="scoreDesc">AI 评分从高到低</option>
              <option value="scoreAsc">AI 评分从低到高</option>
              <option value="filenameAsc">按名称排序</option>
            </select>
          </div>
        }
      />

      {loading && (
        <div className="text-center py-20">
          <motion.div
            className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-[var(--color-stone)]">加载中...</p>
        </div>
      )}

      {showInitialEmptyState && (
        <motion.div
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="mb-2 text-xl font-bold text-[var(--color-cream)]">暂无简历记录</h3>
          <p className="text-[var(--color-stone)]">上传简历开始您的第一次 AI 面试分析</p>
        </motion.div>
      )}

      {showFilteredEmptyState && (
        <motion.div
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="mb-2 text-xl font-bold text-[var(--color-cream)]">未找到匹配的简历</h3>
          <p className="text-[var(--color-stone)]">请调整搜索关键词或筛选条件后重试</p>
        </motion.div>
      )}

      {!loading && displayedResumes.length > 0 && (
        <motion.div
          className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-warm)]">
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">简历名称</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">上传日期</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">AI 评分</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">分析状态</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {displayedResumes.map((resume, index) => {
                  const currentStatus = resolveAnalyzeStatus(resume);
                  const isHighlighted = highlightResumeId === resume.id;

                  return (
                    <motion.tr
                      key={resume.id}
                      ref={(node) => {
                        rowRefs.current[resume.id] = node;
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onSelectResume(resume.id)}
                      className={`group cursor-pointer border-b border-[var(--color-border)] transition-colors last:border-0 ${
                        isHighlighted
                          ? 'bg-[var(--color-accent-light)] ring-1 ring-inset ring-[var(--color-accent)]'
                          : 'hover:bg-[var(--color-surface-warm)]'
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-warm)] text-[var(--color-accent)]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-semibold text-[var(--color-cream)]">{resume.filename}</span>
                              {isHighlighted && (
                                <Badge variant="success">新上传</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-white/60">{formatDateOnly(resume.uploadedAt)}</td>
                      <td className="px-6 py-5">
                        {resume.latestScore !== undefined ? (
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
                              <motion.div
                                className={`h-full ${getScoreProgressColor(resume.latestScore)} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${resume.latestScore}%` }}
                                transition={{ duration: 0.8, delay: index * 0.05 }}
                              />
                            </div>
                            <span className="font-bold text-[var(--color-cream)]">{resume.latestScore}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--color-stone)]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <Badge
                            variant={getStatusBadgeVariant(currentStatus)}
                            title={resume.analyzeError || undefined}
                          >
                            {getAnalyzeStatusText(currentStatus)}
                          </Badge>
                          {currentStatus === 'FAILED' && resume.analyzeError && (
                            <p title={resume.analyzeError} className="mt-2 max-w-[220px] truncate text-xs text-red-500">
                              {resume.analyzeError}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(resume.id, resume.filename, e)}
                            disabled={deletingId === resume.id}
                            title="删除简历"
                          >
                            {deletingId === resume.id ? (
                              <motion.div
                                className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              />
                            ) : (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </Button>
                          <svg
                            className="h-5 w-5 text-[var(--color-stone)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-cream)]"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      )}

      <DeleteConfirmDialog
        open={deleteConfirm !== null}
        item={deleteConfirm}
        itemType="简历"
        loading={deletingId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        customMessage={
          deleteConfirm ? (
            <>
              <p className="mb-2">确定要删除简历 <strong>"{deleteConfirm.filename}"</strong> 吗？</p>
              <p className="mb-2 text-sm text-white/60">删除后将同时删除：</p>
              <ul className="mb-2 list-inside list-disc text-sm text-white/60">
                <li>简历评价记录</li>
                <li>所有模拟面试记录</li>
              </ul>
              <p className="text-sm font-semibold text-red-600">此操作不可恢复！</p>
            </>
          ) : undefined
        }
      />
    </motion.div>
  );
}
