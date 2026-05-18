import {useCallback, useEffect, useMemo, useRef, useState, Fragment} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {
  Check,
  ChevronDown,
  Database,
  Download,
  Edit3,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {knowledgeBaseApi, KnowledgeBaseItem, KnowledgeBaseStats, SortOption, VectorStatus,} from '../api/knowledgebase';
import DeleteConfirmDialog from '../components/dialogs/DeleteConfirmDialog';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface KnowledgeBaseManagePageProps {
  onUpload: () => void;
  onChat: () => void;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

// 状态Badge变体映射
function getStatusBadgeVariant(status: VectorStatus): 'success' | 'warning' | 'danger' | 'default' {
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

// 状态文本
function getStatusText(status: VectorStatus): string {
  switch (status) {
    case 'COMPLETED':
      return '已完成';
    case 'PROCESSING':
      return '处理中';
    case 'PENDING':
      return '待处理';
    case 'FAILED':
      return '失败';
    default:
      return '未知';
  }
}

// 统计卡片组件
function StatCard({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-border)] text-[var(--color-cream)]">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-[var(--color-stone)]">{label}</p>
          <p className="text-2xl font-black tracking-tight text-[var(--color-cream)]">{value.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function KnowledgeBaseManagePage({ onUpload, onChat }: KnowledgeBaseManagePageProps) {
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('time');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [deleteItem, setDeleteItem] = useState<KnowledgeBaseItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedKnowledgeBaseIds, setSelectedKnowledgeBaseIds] = useState<Set<number>>(new Set());

  // 分类编辑状态
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const [revectorizing, setRevectorizing] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const groupedKnowledgeBases = useMemo(() => {
    const folders: Array<{ category: string; items: KnowledgeBaseItem[] }> = [];
    const regularItems: KnowledgeBaseItem[] = [];

    const folderMap = new Map<string, KnowledgeBaseItem[]>();
    knowledgeBases.forEach(kb => {
      if (kb.category?.startsWith('面试收藏/')) {
        const list = folderMap.get(kb.category) || [];
        list.push(kb);
        folderMap.set(kb.category, list);
      } else {
        regularItems.push(kb);
      }
    });

    folderMap.forEach((items, category) => {
      folders.push({
        category,
        items: items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
      });
    });

    folders.sort((a, b) => b.category.localeCompare(a.category, 'zh-CN'));
    return { folders, regularItems };
  }, [knowledgeBases]);

  const toggleFolder = (category: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 加载数据（不显示loading状态，用于轮询）
  const loadDataSilent = useCallback(async () => {
    try {
      const [statsData, kbList, categoryList] = await Promise.all([
        knowledgeBaseApi.getStatistics(),
        searchKeyword
          ? knowledgeBaseApi.search(searchKeyword)
          : selectedCategory
          ? knowledgeBaseApi.getByCategory(selectedCategory)
          : knowledgeBaseApi.getAllKnowledgeBases(sortBy),
        knowledgeBaseApi.getAllCategories(),
      ]);
      setStats(statsData);
      setKnowledgeBases(kbList);
      setSelectedKnowledgeBaseIds(prev => {
        const allowed = new Set(kbList.map(item => item.id));
        return new Set([...prev].filter(id => allowed.has(id)));
      });
      setCategories(categoryList);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  }, [searchKeyword, sortBy, selectedCategory]);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, kbList, categoryList] = await Promise.all([
        knowledgeBaseApi.getStatistics(),
        searchKeyword
          ? knowledgeBaseApi.search(searchKeyword)
          : selectedCategory
          ? knowledgeBaseApi.getByCategory(selectedCategory)
          : knowledgeBaseApi.getAllKnowledgeBases(sortBy),
        knowledgeBaseApi.getAllCategories(),
      ]);
      setStats(statsData);
      setKnowledgeBases(kbList);
      setSelectedKnowledgeBaseIds(prev => {
        const allowed = new Set(kbList.map(item => item.id));
        return new Set([...prev].filter(id => allowed.has(id)));
      });
      setCategories(categoryList);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, sortBy, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 轮询：当有 PENDING 或 PROCESSING 状态时，每5秒刷新一次
  useEffect(() => {
    const hasPendingItems = knowledgeBases.some(
      kb => kb.vectorStatus === 'PENDING' || kb.vectorStatus === 'PROCESSING'
    );

    if (hasPendingItems && !loading) {
      const timer = setInterval(() => {
        loadDataSilent();
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [knowledgeBases, loading, loadDataSilent]);

  // 重新向量化
  const handleRevectorize = async (id: number) => {
    try {
      setRevectorizing(id);
      await knowledgeBaseApi.revectorize(id);
      await loadDataSilent();
    } catch (error) {
      console.error('重新向量化失败:', error);
    } finally {
      setRevectorizing(null);
    }
  };

  // 删除知识库
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleting(true);
      await knowledgeBaseApi.deleteKnowledgeBase(deleteItem.id);
      setDeleteItem(null);
      await loadData();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleting(false);
    }
  };

  const allKnowledgeBaseIds = knowledgeBases.map(item => item.id);
  const allVisibleSelected = allKnowledgeBaseIds.length > 0 && allKnowledgeBaseIds.every(id => selectedKnowledgeBaseIds.has(id));

  const toggleSelectAllVisible = () => {
    setSelectedKnowledgeBaseIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        allKnowledgeBaseIds.forEach(id => next.delete(id));
      } else {
        allKnowledgeBaseIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: number) => {
    setSelectedKnowledgeBaseIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    const ids = [...selectedKnowledgeBaseIds];
    if (ids.length === 0) return;
    if (!window.confirm(`确定删除选中的 ${ids.length} 个知识库吗？`)) return;

    try {
      setDeleting(true);
      for (const id of ids) {
        await knowledgeBaseApi.deleteKnowledgeBase(id);
      }
      setSelectedKnowledgeBaseIds(new Set());
      await loadData();
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setDeleting(false);
    }
  };

  // 下载知识库
    const handleDownload = async (kb: KnowledgeBaseItem) => {
        try {
            const blob = await knowledgeBaseApi.downloadKnowledgeBase(kb.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = kb.originalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('下载失败:', error);
        }
  };

  // 开始编辑分类
  const handleStartEditCategory = (kb: KnowledgeBaseItem) => {
    setEditingCategoryId(kb.id);
    setEditingCategoryValue(kb.category || '');
    setTimeout(() => {
      categoryInputRef.current?.focus();
    }, 50);
  };

  // 取消编辑分类
  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryValue('');
  };

  // 保存分类
  const handleSaveCategory = async (id: number) => {
    try {
      setSavingCategory(true);
      const categoryToSave = editingCategoryValue.trim() || null;
      await knowledgeBaseApi.updateCategory(id, categoryToSave);
      setEditingCategoryId(null);
      setEditingCategoryValue('');
      await loadData();
    } catch (error) {
      console.error('更新分类失败:', error);
    } finally {
      setSavingCategory(false);
    }
  };

  // 处理分类输入框按键
  const handleCategoryKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveCategory(id);
    } else if (e.key === 'Escape') {
      handleCancelEditCategory();
    }
  };

  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="relative px-8 md:px-12 pb-16 pt-10 max-w-[1440px] mx-auto">
      <PageHeader
        title="知识库"
        description="管理你的知识库文档"
        actions={
          <div className="flex flex-wrap gap-2">
            {selectedKnowledgeBaseIds.size > 0 ? (
              <Button
                variant="danger"
                onClick={handleBatchDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                批量删除（{selectedKnowledgeBaseIds.size}）
              </Button>
            ) : null}
            <Button variant="primary" onClick={onUpload}>
              <Upload className="h-4 w-4" strokeWidth={2} />
              上传知识库
            </Button>
            <Button variant="secondary" onClick={onChat}>
              <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
              问答助手
            </Button>
          </div>
        }
      />
      {/* 统计卡片 */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          <StatCard icon={Database} label="知识库总数" value={stats.totalCount} />
          <StatCard icon={MessageSquare} label="总提问次数" value={stats.totalQuestionCount} />
          <StatCard icon={Eye} label="总访问次数" value={stats.totalAccessCount} />
        </div>
      )}

      {/* 搜索和筛选栏 */}
        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="min-w-[200px] flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-stone)]" strokeWidth={1.75} />
              <Input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="搜索知识库名称..."
                className="pl-10"
              />
            </div>
          </form>

          <div className="relative">
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value as SortOption);
                setSearchKeyword('');
                setSelectedCategory(null);
              }}
              className="h-10 cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 pl-4 pr-10 text-[13px] text-[var(--color-cream)] focus:border-[var(--color-border-focus)] focus:outline-none [&>option]:bg-[var(--color-surface)] [&>option]:text-[var(--color-cream)]"
            >
              <option value="time">按时间排序</option>
              <option value="size">按大小排序</option>
              <option value="access">按访问排序</option>
              <option value="question">按提问排序</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-stone)]" />
          </div>

          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={e => {
                setSelectedCategory(e.target.value || null);
                setSearchKeyword('');
              }}
              className="h-10 cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 pl-4 pr-10 text-[13px] text-[var(--color-cream)] focus:border-[var(--color-border-focus)] focus:outline-none [&>option]:bg-[var(--color-surface)] [&>option]:text-[var(--color-cream)]"
            >
              <option value="">全部分类</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-stone)]" />
          </div>
        </div>
      </div>

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-stone)]" />
          </div>
        ) : knowledgeBases.length === 0 ? (
          <div className="py-20 text-center">
            <HardDrive className="mx-auto mb-4 h-16 w-16 text-[var(--color-stone)]" strokeWidth={1.25} />
              <p className="text-white/60">暂无知识库</p>
            <button
              type="button"
              onClick={onUpload}
              className="mt-4 text-sm font-bold text-[var(--color-cream)] hover:underline"
            >
              上传第一个知识库
            </button>
          </div>
        ) : (
          <table className="w-full">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-warm)]">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
                </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">
                  名称
                </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">
                  分类
                </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">
                  大小
                </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">
                  状态
                </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">
                  提问
                </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">
                  上传时间
                </th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-[var(--color-stone)]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedKnowledgeBases.folders.map((folder) => {
                const expanded = Boolean(expandedFolders[folder.category]);
                return (
                  <Fragment key={folder.category}>
                    <tr key={`folder-${folder.category}`} className="border-b border-[var(--color-border)] bg-[var(--color-surface-warm)]">
                      <td colSpan={8} className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() => toggleFolder(folder.category)}
                          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1.5 text-sm font-semibold text-white/60 transition hover:bg-[var(--color-surface-warm)]"
                        >
                          {expanded ? <FolderOpen className="h-4 w-4 text-amber-200" /> : <Folder className="h-4 w-4 text-amber-200" />}
                          <span>{folder.category}</span>
                          <span className="text-xs text-[var(--color-stone)]">({folder.items.length} 题)</span>
                        </button>
                      </td>
                    </tr>
                    {expanded && folder.items.map((kb, index) => (
                      <motion.tr
                        key={kb.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] transition-colors hover:bg-[var(--color-surface-warm)]"
                      >
                        <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedKnowledgeBaseIds.has(kb.id)} onChange={() => toggleSelectOne(kb.id)} />
                        </td>
                        <td className="px-6 py-4 pl-10">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[var(--color-stone)]" strokeWidth={1.75} />
                            <div>
                              <p className="font-semibold text-[var(--color-cream)]">{kb.name}</p>
                              <p className="text-xs text-[var(--color-stone)]">{kb.originalFilename}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default">收藏题目</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">{formatFileSize(kb.fileSize)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(kb.vectorStatus)}>{getStatusText(kb.vectorStatus)}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">{kb.questionCount}</td>
                        <td className="px-6 py-4 text-sm text-[var(--color-stone)]">{formatDate(kb.uploadedAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(kb)} title="下载">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteItem(kb)} title="删除">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </Fragment>
                );
              })}

              {groupedKnowledgeBases.regularItems.map((kb, index) => (
                <motion.tr
                  key={kb.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-warm)]"
                >
                  <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedKnowledgeBaseIds.has(kb.id)} onChange={() => toggleSelectOne(kb.id)} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[var(--color-stone)]" strokeWidth={1.75} />
                      <div>
                          <p className="font-semibold text-[var(--color-cream)]">{kb.name}</p>
                          <p className="text-xs text-[var(--color-stone)]">{kb.originalFilename}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <AnimatePresence mode="wait">
                      {editingCategoryId === kb.id ? (
                        <motion.div
                          key="editing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <input
                            ref={categoryInputRef}
                            type="text"
                            value={editingCategoryValue}
                            onChange={(e) => setEditingCategoryValue(e.target.value)}
                            onKeyDown={(e) => handleCategoryKeyDown(e, kb.id)}
                            placeholder="输入分类名称"
                            list="category-suggestions"
                            className="w-28 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-2 py-1 text-sm text-[var(--color-cream)] focus:border-[var(--color-border-focus)] focus:outline-none"
                            disabled={savingCategory}
                          />
                          <datalist id="category-suggestions">
                            {categories.map((cat) => (
                              <option key={cat} value={cat} />
                            ))}
                          </datalist>
                          <button
                            onClick={() => handleSaveCategory(kb.id)}
                            disabled={savingCategory}
                            className="p-1 text-green-400 hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
                            title="保存"
                          >
                            {savingCategory ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <Button variant="ghost" size="sm" onClick={handleCancelEditCategory} disabled={savingCategory} title="取消">
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="display"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 group/category"
                        >
                          {kb.category ? (
                              <Badge variant="default">{kb.category}</Badge>
                          ) : (
                              <span className="text-sm text-[var(--color-stone)]">未分类</span>
                          )}
                          <button
                            onClick={() => handleStartEditCategory(kb)}
                            className="rounded-[var(--radius-md)] p-1 text-[var(--color-stone)] opacity-0 transition-all hover:bg-[var(--color-surface-warm)] hover:text-[var(--color-cream)] group-hover/category:opacity-100"
                            title="编辑分类"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                    {formatFileSize(kb.fileSize)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(kb.vectorStatus)}>
                        {getStatusText(kb.vectorStatus)}
                    </Badge>
                  </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                    {kb.questionCount}
                  </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-stone)]">
                    {formatDate(kb.uploadedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* 下载按钮 */}
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(kb)} title="下载">
                        <Download className="w-4 h-4" />
                      </Button>
                      {/* 重新向量化按钮（仅 FAILED 状态显示） */}
                      {kb.vectorStatus === 'FAILED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevectorize(kb.id)}
                          disabled={revectorizing === kb.id}
                          title="重新向量化"
                        >
                          <RefreshCw className={`w-4 h-4 ${revectorizing === kb.id ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                      {/* 删除按钮 */}
                      <Button variant="ghost" size="sm" onClick={() => setDeleteItem(kb)} title="删除">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteItem !== null}
        item={deleteItem}
        itemType="知识库"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}
