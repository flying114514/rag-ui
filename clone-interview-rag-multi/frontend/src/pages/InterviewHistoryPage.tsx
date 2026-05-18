import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EvaluateStatus, historyApi, InterviewItem } from '../api/history';
import { formatDate } from '../utils/date';
import DeleteConfirmDialog from '../components/dialogs/DeleteConfirmDialog';
import { AlertCircle, CheckCircle, ChevronRight, Clock, Download, FileText, Loader2, PlayCircle, RefreshCw, Search, Sparkles, Trash2, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

interface InterviewHistoryPageProps {
  onBack: () => void;
  onViewInterview: (sessionId: string, resumeId?: number) => void;
  onContinueInterview: (resumeId: number, sessionId: string) => void;
}
interface InterviewWithResume extends InterviewItem { resumeId: number; resumeFilename: string; evaluateStatus?: EvaluateStatus; evaluateError?: string; }
interface InterviewStats { totalCount: number; completedCount: number; averageScore: number; }

function StatCard({ icon: Icon, label, value, suffix }: { icon: LucideIcon; label: string; value: number | string; suffix?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] p-5 backdrop-blur-[20px]">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-200"><Icon className="h-5 w-5" strokeWidth={2} /></div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-stone)]">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-cream)]">{value}{suffix ? <span className="ml-1 text-base text-[var(--color-stone)]">{suffix}</span> : null}</p>
        </div>
      </div>
    </motion.div>
  );
}

const isCompletedStatus = (status: string) => status === 'COMPLETED' || status === 'EVALUATED';
const isInProgressStatus = (status: string) => status === 'IN_PROGRESS' || status === 'CREATED';
const isEvaluateCompleted = (i: InterviewWithResume) => i.evaluateStatus === 'COMPLETED' || i.status === 'EVALUATED';
const isEvaluating = (i: InterviewWithResume) => i.evaluateStatus === 'PENDING' || i.evaluateStatus === 'PROCESSING';
const isEvaluateFailed = (i: InterviewWithResume) => i.evaluateStatus === 'FAILED';

function StatusIcon({ interview }: { interview: InterviewWithResume }) {
  if (isEvaluateFailed(interview)) return <AlertCircle className="h-4 w-4 text-rose-400" />;
  if (isEvaluating(interview)) return <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />;
  if (isEvaluateCompleted(interview)) return <CheckCircle className="h-4 w-4 text-emerald-400" />;
  if (isInProgressStatus(interview.status)) return <PlayCircle className="h-4 w-4 text-sky-400" />;
  return <Clock className="h-4 w-4 text-amber-400" />;
}

function getStatusText(i: InterviewWithResume) {
  if (isEvaluateFailed(i)) return '评估失败';
  if (isEvaluating(i)) return i.evaluateStatus === 'PROCESSING' ? '评估中' : '等待评估';
  if (isEvaluateCompleted(i)) return '已完成';
  if (isInProgressStatus(i.status)) return '进行中';
  if (isCompletedStatus(i.status)) return '已提交';
  return '已创建';
}

function getScoreColor(score: number) { if (score >= 80) return 'bg-emerald-400'; if (score >= 60) return 'bg-amber-400'; return 'bg-rose-400'; }

export default function InterviewHistoryPage({ onBack: _onBack, onViewInterview, onContinueInterview }: InterviewHistoryPageProps) {
  const [interviews, setInterviews] = useState<InterviewWithResume[]>([]);
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<InterviewWithResume | null>(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<string | null>(null);
  const [collectingRecord, setCollectingRecord] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const loadAllInterviews = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const resumes = await historyApi.getResumes();
      const all: InterviewWithResume[] = [];
      for (const r of resumes) {
        const d = await historyApi.getResumeDetail(r.id);
        d.interviews?.forEach(i => all.push({ ...i, resumeId: r.id, resumeFilename: r.filename }));
      }
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInterviews(all);
      setSelectedSessionIds(prev => {
        const allowed = new Set(all.map(item => item.sessionId));
        return new Set([...prev].filter(id => allowed.has(id)));
      });
      const evaluated = all.filter(isEvaluateCompleted);
      const total = evaluated.reduce((s, i) => s + (i.overallScore || 0), 0);
      setStats({ totalCount: all.length, completedCount: evaluated.length, averageScore: evaluated.length ? Math.round(total / evaluated.length) : 0 });
    } catch (e) { console.error('加载面试记录失败', e); }
    finally { if (!isPolling) setLoading(false); }
  }, []);

  useEffect(() => { loadAllInterviews(); }, [loadAllInterviews]);
  useEffect(() => {
    const has = interviews.some(isEvaluating);
    if (has) pollingRef.current = window.setInterval(() => loadAllInterviews(true), 3000);
    else if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [interviews, loadAllInterviews]);

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeletingSessionId(deleteItem.sessionId);
    try { await historyApi.deleteInterview(deleteItem.sessionId); await loadAllInterviews(); setDeleteItem(null); }
    catch (e) { alert(e instanceof Error ? e.message : '删除失败，请稍后重试'); }
    finally { setDeletingSessionId(null); }
  };

  const handleExport = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExporting(sessionId);
    try {
      const blob = await historyApi.exportInterviewPdf(sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `面试报告_${sessionId.slice(-8)}.pdf`; document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch { alert('导出失败，请重试'); }
    finally { setExporting(null); }
  };

  const handleCollectRecord = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectingRecord(sessionId);
    try {
      const result = await historyApi.collectInterviewRecord(sessionId);
      const statusText = result.vectorStatus === 'COMPLETED' ? '已完成向量化' : '已进入向量化队列';
      toast.success(`已整理并上传知识库（${result.knowledgeBaseCategory}）· ${statusText}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '整理上传失败，请重试');
    } finally {
      setCollectingRecord(null);
    }
  };

  const list = interviews.filter(i => i.resumeFilename.toLowerCase().includes(searchTerm.toLowerCase()));
  const allVisibleSelected = list.length > 0 && list.every(i => selectedSessionIds.has(i.sessionId));

  const toggleSelectAllVisible = () => {
    setSelectedSessionIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        list.forEach(item => next.delete(item.sessionId));
      } else {
        list.forEach(item => next.add(item.sessionId));
      }
      return next;
    });
  };

  const toggleSelectOne = (sessionId: string) => {
    setSelectedSessionIds(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    const ids = [...selectedSessionIds];
    if (ids.length === 0) return;
    if (!window.confirm(`确定删除选中的 ${ids.length} 条面试记录吗？`)) return;

    setDeletingSessionId('BATCH');
    try {
      for (const id of ids) {
        await historyApi.deleteInterview(id);
      }
      setSelectedSessionIds(new Set());
      await loadAllInterviews();
    } catch (e) {
      alert(e instanceof Error ? e.message : '批量删除失败，请稍后重试');
    } finally {
      setDeletingSessionId(null);
    }
  };

  return (
    <motion.div className="w-full px-8 md:px-12 pb-16 pt-10 max-w-[1440px] mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="面试记录" description="查看所有面试历史和评分" actions={
        selectedSessionIds.size > 0 ? (
          <Button
            variant="danger"
            size="sm"
            onClick={handleBatchDelete}
            disabled={deletingSessionId !== null}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            批量删除（{selectedSessionIds.size}）
          </Button>
        ) : undefined
      } />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-[280px] items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2.5 focus-within:border-[var(--color-border-focus)]">
          <Search className="h-5 w-5 text-[var(--color-stone)]" strokeWidth={1.8} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索简历名称..." className="flex-1 bg-transparent text-[15px] text-[var(--color-cream)] outline-none placeholder:text-[var(--color-stone)]" />
        </div>
      </div>

      {stats ? <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"><StatCard icon={Users} label="面试总数" value={stats.totalCount} /><StatCard icon={CheckCircle} label="已完成" value={stats.completedCount} /><StatCard icon={TrendingUp} label="平均分数" value={stats.averageScore} suffix="分" /></div> : null}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-white/60" /></div> : null}

      {!loading && list.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-20 text-center"><Users className="mx-auto mb-4 h-16 w-16 text-[var(--color-stone)]" strokeWidth={1.25} /><h3 className="mb-2 text-xl font-semibold text-[var(--color-cream)]">暂无面试记录</h3><p className="text-white/60">开始一次模拟面试后，记录将显示在这里</p></motion.div>
      ) : null}

      {!loading && list.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[0_18px_60px_rgba(2,6,23,0.52)]">
          <table className="w-full">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-warm)]"><tr><th className="px-4 py-4 text-left"><input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} /></th><th className="px-6 py-4 text-left text-[11px] tracking-[0.14em] text-[var(--color-stone)]">关联简历</th><th className="px-6 py-4 text-left text-[11px] tracking-[0.14em] text-[var(--color-stone)]">题目数</th><th className="px-6 py-4 text-left text-[11px] tracking-[0.14em] text-[var(--color-stone)]">状态</th><th className="px-6 py-4 text-left text-[11px] tracking-[0.14em] text-[var(--color-stone)]">得分</th><th className="px-6 py-4 text-left text-[11px] tracking-[0.14em] text-[var(--color-stone)]">创建时间</th><th className="px-6 py-4 text-right text-[11px] tracking-[0.14em] text-[var(--color-stone)]">操作</th></tr></thead>
            <tbody>
              <AnimatePresence>
                {list.map((i, idx) => (
                  <motion.tr key={i.sessionId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => onViewInterview(i.sessionId, i.resumeId)} className="group cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-surface-warm)]">
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedSessionIds.has(i.sessionId)} onChange={() => toggleSelectOne(i.sessionId)} /></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-[var(--color-stone)]" strokeWidth={1.8} /><div><p className="font-medium text-[var(--color-cream)]">{i.resumeFilename}</p><p className="text-xs text-[var(--color-stone)]">#{i.sessionId.slice(-8)}</p></div></div></td>
                    <td className="px-6 py-4"><span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1 text-sm text-white/60">{i.totalQuestions} 题</span></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><StatusIcon interview={i} /><span className="text-sm text-white/60">{getStatusText(i)}</span></div></td>
                    <td className="px-6 py-4">{isEvaluateCompleted(i) && i.overallScore !== null ? <div className="flex items-center gap-3"><div className="h-2 w-16 overflow-hidden rounded-full bg-[var(--color-surface-warm)]"><motion.div className={`h-full ${getScoreColor(i.overallScore)} rounded-full`} initial={{ width: 0 }} animate={{ width: `${i.overallScore}%` }} transition={{ duration: 0.8, delay: idx * 0.05 }} /></div><span className="font-semibold text-[var(--color-cream)]">{i.overallScore}</span></div> : isEvaluating(i) ? <span className="text-sm text-[var(--color-accent)]">生成中…</span> : isEvaluateFailed(i) ? <span className="text-sm text-rose-300" title={i.evaluateError}>失败</span> : <span className="text-[var(--color-stone)]">-</span>}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{formatDate(i.createdAt)}</td>
                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-1">{isInProgressStatus(i.status) ? <button onClick={e => { e.stopPropagation(); onContinueInterview(i.resumeId, i.sessionId); }} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-4 py-2 text-sm font-bold text-[var(--color-cream)] shadow-[0_0_20px_rgba(200,149,108,0.2)] transition hover:scale-[1.03] hover:bg-[var(--color-accent)]/25" title="继续面试"><PlayCircle className="h-4 w-4" />继续面试</button> : null}{isEvaluateCompleted(i) ? <button onClick={e => handleExport(i.sessionId, e)} disabled={exporting === i.sessionId || collectingRecord === i.sessionId} className="rounded-full p-2 text-[var(--color-stone)] hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-cream)] disabled:opacity-50">{exporting === i.sessionId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}</button> : null}{isEvaluateCompleted(i) ? <button onClick={e => handleCollectRecord(i.sessionId, e)} disabled={collectingRecord === i.sessionId || exporting === i.sessionId} className="rounded-full p-2 text-[var(--color-accent)]/70 hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] disabled:opacity-50" title="一键整理并上传知识库">{collectingRecord === i.sessionId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}</button> : null}<button onClick={e => { e.stopPropagation(); setDeleteItem(i); }} disabled={deletingSessionId === i.sessionId} className="rounded-full p-2 text-[var(--color-stone)] hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button><ChevronRight className="h-5 w-5 text-[var(--color-stone)] transition group-hover:translate-x-0.5 group-hover:text-white/60" /></div></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      ) : null}

      <DeleteConfirmDialog open={deleteItem !== null} item={deleteItem ? { id: deleteItem.id, sessionId: deleteItem.sessionId } : null} itemType="面试记录" loading={deletingSessionId !== null} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteItem(null)} />
    </motion.div>
  );
}
