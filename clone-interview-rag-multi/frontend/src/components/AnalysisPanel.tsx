import {useMemo} from 'react';
import {motion} from 'framer-motion';
import RadarChart from './RadarChart';
import ScoreProgressBar from './ScoreProgressBar';
import {formatDateTime} from '../utils/date';
import {AlertCircle, CheckCircle2, Clock, Download, Loader2, RefreshCw, Target, TrendingUp,} from 'lucide-react';
import type {AnalyzeStatus} from '../api/history';

interface AnalysisPanelProps {
  analysis: any;
  analyzeStatus?: AnalyzeStatus;
  analyzeError?: string;
  onExport: () => void;
  exporting: boolean;
  onReanalyze?: () => void;
  reanalyzing?: boolean;
}

/**
 * 简历分析面板组件
 */
export default function AnalysisPanel({
  analysis,
  analyzeStatus,
  analyzeError,
  onExport,
  exporting,
  onReanalyze,
  reanalyzing,
}: AnalysisPanelProps) {
  // 准备雷达图数据
  const radarData = useMemo(() => {
    if (!analysis) return [];

    const projectScore = analysis.projectScore || 0;
    const skillMatchScore = analysis.skillMatchScore || 0;
    const contentScore = analysis.contentScore || 0;
    const structureScore = analysis.structureScore || 0;
    const expressionScore = analysis.expressionScore || 0;

    const projectFullMark = 40;
    const skillMatchFullMark = 20;
    const contentFullMark = 15;
    const structureFullMark = 15;
    const expressionFullMark = 10;

    return [
      {
        subject: '表达专业性',
        score: expressionScore,
        fullMark: expressionFullMark
      },
      {
        subject: '技能匹配',
        score: skillMatchScore,
        fullMark: skillMatchFullMark
      },
      {
        subject: '内容完整性',
        score: contentScore,
        fullMark: contentFullMark
      },
      {
        subject: '结构清晰度',
        score: structureScore,
        fullMark: structureFullMark
      },
      {
        subject: '项目经验',
        score: projectScore,
        fullMark: projectFullMark
      }
    ];
  }, [analysis]);

  // 按优先级分类建议
  const suggestionsByPriority = useMemo(() => {
    if (!analysis?.suggestions) return { high: [], medium: [], low: [] };

    const suggestions = analysis.suggestions;
    return {
      high: suggestions.filter((s: any) => s.priority === '高'),
      medium: suggestions.filter((s: any) => s.priority === '中'),
      low: suggestions.filter((s: any) => s.priority === '低')
    };
  }, [analysis]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高':
        return 'bg-rose-500/10 border-rose-500/30';
      case '中':
        return 'bg-amber-500/10 border-amber-500/30';
      case '低':
        return 'bg-cyan-500/10 border-cyan-500/30';
      default:
        return 'bg-white/5 border-white/12';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case '高':
        return 'bg-rose-500/20 text-rose-200';
      case '中':
        return 'bg-amber-500/20 text-amber-200';
      case '低':
        return 'bg-cyan-500/20 text-cyan-200';
      default:
        return 'bg-white/10 text-white/70';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '项目': 'bg-purple-500/15 text-purple-200',
      '技能': 'bg-indigo-500/15 text-indigo-200',
      '内容': 'bg-emerald-500/15 text-emerald-200',
      '格式': 'bg-pink-500/15 text-pink-200',
      '结构': 'bg-cyan-500/15 text-cyan-200',
      '表达': 'bg-orange-500/15 text-orange-200'
    };
    return colors[category] || 'bg-white/10 text-white/70';
  };

  // 检测分析结果是否有效
  const hasErrorKeywords = analysis?.summary && (
    analysis.summary.includes('I/O error') ||
    analysis.summary.includes('分析过程中出现错误') ||
    analysis.summary.includes('简历分析失败') ||
    analysis.summary.includes('Remote host terminated') ||
    analysis.summary.includes('handshake')
  );
  const isAnalysisValid = analysis &&
    analysis.overallScore >= 10 &&
    analysis.summary &&
    !hasErrorKeywords;

  // 判断是否为"分析中"状态
  const isProcessing = analyzeStatus === 'PENDING' ||
    analyzeStatus === 'PROCESSING' ||
    (analyzeStatus === undefined && !analysis);

  // 处理分析中状态
  if (isProcessing) {
    const isExplicitProcessing = analyzeStatus === 'PROCESSING';
    return (
        <div className="rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-12 text-center shadow-[var(--shadow-md)]">
          <div
              className="w-16 h-16 mx-auto mb-6 bg-blue-500/15 rounded-full flex items-center justify-center">
          {isExplicitProcessing ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin"/>
          ) : (
              <Clock className="w-8 h-8 text-yellow-500"/>
          )}
        </div>
          <h3 className="text-xl font-semibold text-[var(--color-cream)] mb-2">
          {isExplicitProcessing ? 'AI 正在分析中...' : '等待分析'}
        </h3>
          <p className="text-white/60 mb-4">
          {isExplicitProcessing
            ? '请稍候，AI 正在对您的简历进行深度分析'
            : '简历已上传成功，即将开始 AI 分析'}
        </p>
          <p className="text-sm text-[var(--color-stone)]">页面将自动刷新显示分析结果</p>
      </div>
    );
  }

  // 处理分析失败状态
  if (analyzeStatus === 'FAILED' || !isAnalysisValid) {
    return (
        <div className="rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-12 text-center shadow-[var(--shadow-md)]">
          <div
              className="w-16 h-16 mx-auto mb-6 bg-rose-500/15 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500"/>
        </div>
          <h3 className="text-xl font-semibold text-[var(--color-cream)] mb-2">分析失败</h3>
          <p className="text-white/60 mb-4">AI 服务暂时不可用，请稍后重试</p>
        {(analyzeError || analysis?.summary) && (
            <div
                className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-left mb-4">
              <p className="text-sm text-rose-200">{analyzeError || analysis.summary}</p>
          </div>
        )}
        {onReanalyze && (
          <motion.button
            onClick={onReanalyze}
            disabled={reanalyzing}
            className="mx-auto flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} />
            {reanalyzing ? '重新分析中...' : '重新分析'}
          </motion.button>
        )}
      </div>
    );
  }

  const projectScore = analysis.projectScore || 0;
  const skillMatchScore = analysis.skillMatchScore || 0;
  const contentScore = analysis.contentScore || 0;
  const structureScore = analysis.structureScore || 0;
  const expressionScore = analysis.expressionScore || 0;

  return (
    <div className="space-y-6 text-white">
      {/* 核心评价和雷达图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 核心评价 */}
        <motion.div
            className="rounded-[26px] border border-white/12 bg-white/[0.06] p-6 shadow-[0_18px_48px_rgba(2,6,23,0.36)] backdrop-blur-[22px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6 text-white">
            <div className="flex items-center gap-2 text-white/72">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">核心评价</span>
            </div>
            <motion.button
              onClick={onExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-full border border-white/12 bg-black/20 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-black/28 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              {exporting ? '导出中...' : '导出分析报告'}
            </motion.button>
          </div>

          <div
              className="rounded-[24px] border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
            <p className="mb-6 text-lg leading-relaxed text-white/92">
              {analysis.summary || '候选人具备扎实的技术基础，有大型项目架构经验。'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
                <span className="mb-2 block text-sm font-semibold text-cyan-200/90">总分</span>
                <span className="text-4xl font-bold text-white">{analysis.overallScore || 0}</span>
                <span className="text-sm text-white/60">/ 100</span>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
                <span className="mb-2 block text-sm font-semibold text-fuchsia-200/90">分析时间</span>
                <span className="text-sm text-white/80">
                  {formatDateTime(analysis.analyzedAt)}
                </span>
              </div>
            </div>

            {/* 优势标签 */}
            {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                  <span
                      className="mb-3 block text-sm font-semibold text-emerald-200/90">优势亮点</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.strengths.map((s: string, i: number) => (
                      <span key={i}
                            className="rounded-xl border border-emerald-300/22 bg-emerald-400/12 px-3 py-1.5 text-sm font-medium text-emerald-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 多维度评分雷达图 */}
        <motion.div
            className="rounded-[26px] border border-white/12 bg-white/[0.06] p-6 shadow-[0_18px_48px_rgba(2,6,23,0.36)] backdrop-blur-[22px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6 text-white/72">
            <Target className="w-5 h-5 text-fuchsia-200" />
            <span className="font-semibold text-white">多维度评分</span>
          </div>

          <RadarChart data={radarData} height={320} />

          {/* 维度得分详情 */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ScoreProgressBar
              label="项目经验"
              score={projectScore}
              maxScore={40}
              color="bg-purple-500"
              delay={0.3}
              className="col-span-2"
            />
            <ScoreProgressBar
              label="技能匹配"
              score={skillMatchScore}
              maxScore={20}
              color="bg-blue-500"
              delay={0.4}
            />
            <ScoreProgressBar
              label="内容完整性"
              score={contentScore}
              maxScore={15}
              color="bg-emerald-500"
              delay={0.5}
            />
            <ScoreProgressBar
              label="结构清晰度"
              score={structureScore}
              maxScore={15}
              color="bg-cyan-500"
              delay={0.6}
            />
            <ScoreProgressBar
              label="表达专业性"
              score={expressionScore}
              maxScore={10}
              color="bg-orange-500"
              delay={0.7}
            />
          </div>
        </motion.div>
      </div>

      {/* 改进建议 - 按优先级分类 */}
      <motion.div
          className="rounded-[26px] border border-white/12 bg-white/[0.06] p-6 shadow-[0_18px_48px_rgba(2,6,23,0.36)] backdrop-blur-[22px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-6 flex items-center gap-2 text-white/72">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-semibold text-white">改进建议</span>
          <span className="text-sm text-white/46">
            ({analysis.suggestions?.length || 0} 条)
          </span>
        </div>

        <div className="space-y-6">
          {/* 高优先级 */}
          {suggestionsByPriority.high.length > 0 && (
            <SuggestionSection
              priority="高"
              suggestions={suggestionsByPriority.high}
              getPriorityColor={getPriorityColor}
              getPriorityBadgeColor={getPriorityBadgeColor}
              getCategoryColor={getCategoryColor}
              delay={0.4}
            />
          )}

          {/* 中优先级 */}
          {suggestionsByPriority.medium.length > 0 && (
            <SuggestionSection
              priority="中"
              suggestions={suggestionsByPriority.medium}
              getPriorityColor={getPriorityColor}
              getPriorityBadgeColor={getPriorityBadgeColor}
              getCategoryColor={getCategoryColor}
              delay={0.5}
            />
          )}

          {/* 低优先级 */}
          {suggestionsByPriority.low.length > 0 && (
            <SuggestionSection
              priority="低"
              suggestions={suggestionsByPriority.low}
              getPriorityColor={getPriorityColor}
              getPriorityBadgeColor={getPriorityBadgeColor}
              getCategoryColor={getCategoryColor}
              delay={0.6}
            />
          )}

          {analysis.suggestions?.length === 0 && (
              <div className="py-8 text-center text-white/52">暂无改进建议</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// 建议分组组件
function SuggestionSection({
  priority,
  suggestions,
  getPriorityColor,
  getPriorityBadgeColor,
  getCategoryColor,
  delay
}: {
  priority: string;
  suggestions: any[];
  getPriorityColor: (p: string) => string;
  getPriorityBadgeColor: (p: string) => string;
  getCategoryColor: (c: string) => string;
  delay: number;
}) {
  const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
    '高': {
      bg: 'bg-rose-500/10',
      text: 'text-rose-200',
      border: 'bg-rose-400/30'
    },
    '中': {
      bg: 'bg-amber-500/10',
      text: 'text-amber-200',
      border: 'bg-amber-400/30'
    },
    '低': {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-200',
      border: 'bg-cyan-400/30'
    }
  };

  const colors = priorityColors[priority] || priorityColors['中'];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${colors.bg} ${colors.text}`}>
          {priority}优先级 ({suggestions.length})
        </span>
        <div className={`h-px flex-1 ${colors.border}`}></div>
      </div>
      <div className="space-y-3">
        {suggestions.map((s: any, i: number) => (
            <motion.div
            key={`${priority}-${i}`}
            className={`rounded-[22px] border p-4 backdrop-blur-sm ${getPriorityColor(priority)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.1 }}
          >
            <div className="flex items-start gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityBadgeColor(priority)}`}>
                {priority}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(s.category || '其他')}`}>
                {s.category || '其他'}
              </span>
            </div>
            <div className="mb-2">
              <p className="mb-1 font-semibold text-white/90">{s.issue || '问题描述'}</p>
              <p className="text-sm leading-relaxed text-white/70">{s.recommendation || s}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
