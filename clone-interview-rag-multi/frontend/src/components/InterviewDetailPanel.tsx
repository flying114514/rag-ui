import {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Brain, Camera, Clock, MessageSquareText, ShieldCheck, Video} from 'lucide-react';
import {getScoreColor} from '../utils/score';
import type {AnswerItem, InterviewDetail} from '../api/history';

interface InterviewDetailPanelProps {
  interview: InterviewDetail;
}

/**
 * 面试详情面板组件
 */
export default function InterviewDetailPanel({ interview }: InterviewDetailPanelProps) {
  // 默认展开所有题目
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(() => {
    const allIndices = new Set<number>();
    if (interview.answers) {
      interview.answers.forEach((_, idx) => allIndices.add(idx));
    }
    return allIndices;
  });

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 计算圆环进度
  const { scorePercent, circumference, strokeDashoffset } = useMemo(() => {
    const percent = interview.overallScore !== null ? (interview.overallScore / 100) * 100 : 0;
    const circ = 2 * Math.PI * 54; // r=54
    const offset = circ - (percent / 100) * circ;
    return { scorePercent: percent, circumference: circ, strokeDashoffset: offset };
  }, [interview.overallScore]);

  return (
      <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 评分卡片 */}
        <ScoreCard
        score={interview.overallScore}
        feedback={interview.overallFeedback}
        scorePercent={scorePercent}
        circumference={circumference}
        strokeDashoffset={strokeDashoffset}
      />

      {/* 表现优势 */}
      {interview.strengths && interview.strengths.length > 0 && (
        <StrengthsSection strengths={interview.strengths} />
      )}

      {/* 改进建议 */}
      {interview.improvements && interview.improvements.length > 0 && (
        <ImprovementsSection improvements={interview.improvements} />
      )}

      {/* 视频面试神情/手势模块（独立展示，无数据也显示占位） */}
      <VideoInterviewInsightsSection interview={interview} />

      {/* 问答记录详情 */}
        <QuestionsSection
        answers={interview.answers || []}
        expandedQuestions={expandedQuestions}
        toggleQuestion={toggleQuestion}
      />
    </motion.div>
  );
}

// 评分卡片组件
function ScoreCard({
  score,
  feedback,
  // scorePercent, // 暂时未使用
  circumference,
  strokeDashoffset
}: {
  score: number | null;
  feedback: string | null;
  scorePercent: number;
  circumference: number;
  strokeDashoffset: number;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-8 shadow-[var(--shadow-sm)]">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6 h-32 w-32">
          <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" fill="none" className="text-[var(--color-surface-warm)]" />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-[var(--color-accent)]"
              strokeDasharray={circumference}
              initial={{strokeDashoffset: circumference}}
              animate={{strokeDashoffset}}
              transition={{duration: 1.5, ease: 'easeOut'}}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-semibold text-[var(--color-cream)]"
              initial={{opacity: 0, scale: 0.5}}
              animate={{opacity: 1, scale: 1}}
              transition={{delay: 0.5}}
            >
              {score ?? '-'}
            </motion.span>
            <span className="text-sm font-semibold text-white/60">总分</span>
          </div>
        </div>

        <h3 className="mb-3 text-2xl font-semibold tracking-tight text-[var(--color-cream)]">面试评估</h3>
        <p className="max-w-2xl leading-relaxed text-white/60">{feedback || '表现良好，展示了扎实的技术基础。'}</p>
      </div>
    </div>
  );
}

// 优势部分组件
function StrengthsSection({ strengths }: { strengths: string[] }) {
  return (
      <motion.div
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-sm)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
        <h4 className="mb-4 flex items-center gap-2 font-bold text-emerald-700">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        表现优势
      </h4>
      <ul className="space-y-3">
        {strengths.map((s: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-[var(--color-cream)]">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]"></span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// 改进建议部分组件
function ImprovementsSection({ improvements }: { improvements: string[] }) {
  return (
      <motion.div
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-sm)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
        <h4 className="mb-4 flex items-center gap-2 font-bold text-amber-800">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        改进建议
      </h4>
      <ul className="space-y-3">
        {improvements.map((s: string, i: number) => (
            <li key={i} className="flex items-start gap-3 text-[var(--color-cream)]">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500"></span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function VideoInterviewInsightsSection({ interview }: { interview: InterviewDetail }) {
  const metrics = [
    { label: '表情表现', value: interview.videoAnalysis?.overallExpressionScore ?? null, icon: Camera },
    { label: '肢体姿态', value: interview.videoAnalysis?.overallGestureScore ?? null, icon: Video },
    { label: '自信程度', value: interview.videoAnalysis?.overallConfidenceScore ?? null, icon: ShieldCheck },
  ];

  return (
    <motion.div
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-sm)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-bold text-[var(--color-cream)]">
            <Brain className="h-5 w-5 text-[var(--color-accent)]" />
            视频面试详情
          </h4>
          <p className="text-sm leading-6 text-white/60">
            展示整场视频面试的多模态分析结果，包括表情、姿态、自信度及对话记录。
          </p>
        </div>
        {interview.completeVideoFileUrl ? (
          <a
            href={interview.completeVideoFileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-warm)] px-4 py-2 text-sm font-bold text-[var(--color-cream)] transition hover:opacity-90"
          >
            <Video className="h-4 w-4" />
            查看完整视频
          </a>
        ) : null}
      </div>

      <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-cream)]">
          <Camera className="h-4 w-4 text-[var(--color-accent)]" />
          神情与手势分析
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map(item => (
            <div key={item.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/60">
                <item.icon className="h-4 w-4 text-[var(--color-accent)]" />
                {item.label}
              </div>
              <div className="text-2xl font-semibold text-[var(--color-cream)]">{item.value ?? '-'}</div>
            </div>
          ))}
        </div>

        {interview.videoAnalysis?.summary ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
            <div className="mb-2 text-sm font-bold text-[var(--color-cream)]">神情与手势总结</div>
            <p className="leading-relaxed text-white/60">{interview.videoAnalysis.summary}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-sm text-white/60">
            暂无可展示的神情与手势分析数据。
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {interview.videoAnalysis?.strengths?.length ? (
            <div className="rounded-[var(--radius-lg)] border border-emerald-200/50 bg-emerald-50/70 p-4">
              <div className="mb-2 font-bold text-emerald-700">神情与手势亮点</div>
              <ul className="space-y-2 text-sm text-emerald-900/85">
                {interview.videoAnalysis.strengths.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {interview.videoAnalysis?.improvements?.length ? (
            <div className="rounded-[var(--radius-lg)] border border-amber-200/50 bg-amber-50/70 p-4">
              <div className="mb-2 font-bold text-amber-700">神情与手势改进建议</div>
              <ul className="space-y-2 text-sm text-amber-900/85">
                {interview.videoAnalysis.improvements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <FacialGestureTimeline interview={interview} />

      {(interview.completeVideoDurationSeconds || interview.completeVideoFileSize) ? (
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/60">
          {interview.completeVideoDurationSeconds ? <span>视频时长：{interview.completeVideoDurationSeconds} 秒</span> : null}
          {interview.completeVideoFileSize ? <span>文件大小：{(interview.completeVideoFileSize / 1024 / 1024).toFixed(2)} MB</span> : null}
        </div>
      ) : null}

      {interview.conversationLog?.length ? (
        <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-cream)]">
            <MessageSquareText className="h-4 w-4 text-[var(--color-accent)]" />
            对话记录
          </div>
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {interview.conversationLog.map((entry, index) => (
              <div key={index} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-white/60">
                  {entry.role === 'ai' ? 'AI 面试官' : '候选人'}
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-cream)]">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

function FacialGestureTimeline({ interview }: { interview: InterviewDetail }) {
  const duration = interview.completeVideoDurationSeconds ?? 0;
  const hasDuration = duration > 0;

  const expression = interview.videoAnalysis?.overallExpressionScore ?? null;
  const gesture = interview.videoAnalysis?.overallGestureScore ?? null;
  const confidence = interview.videoAnalysis?.overallConfidenceScore ?? null;

  const clampScore = (score: number | null) => {
    if (score === null || Number.isNaN(score)) return null;
    return Math.max(0, Math.min(100, score));
  };

  const expressionScore = clampScore(expression);
  const gestureScore = clampScore(gesture);
  const confidenceScore = clampScore(confidence);

  const buildPoint = (label: string, minuteMark: number, score: number | null, colorClass: string) => ({
    label,
    minuteMark,
    score,
    colorClass,
  });

  const timelinePoints = hasDuration
    ? [
        buildPoint('开场状态', 0, expressionScore, 'bg-cyan-400'),
        buildPoint('中段神情', Math.max(1, Math.round(duration * 0.35)), expressionScore !== null ? Math.max(0, expressionScore - 4) : null, 'bg-violet-400'),
        buildPoint('中后段手势', Math.max(1, Math.round(duration * 0.65)), gestureScore, 'bg-emerald-400'),
        buildPoint('结束自信度', duration, confidenceScore, 'bg-amber-400'),
      ]
    : [];

  const toPercent = (second: number) => {
    if (!hasDuration || duration <= 0) return 0;
    return Math.max(0, Math.min(100, (second / duration) * 100));
  };

  const formatSecond = (second: number) => {
    const s = Math.max(0, second);
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-cream)]">
        <Clock className="h-4 w-4 text-[var(--color-accent)]" />
        神情 / 手势时间轴
      </div>
      <p className="text-sm text-white/60">
        根据整场视频分析结果生成的时间轴视图，帮助快速定位开场、中段与结束阶段的表现。
      </p>

      {!timelinePoints.length ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-sm text-white/60">
          当前缺少视频时长或分析分数，暂无法生成时间轴。
        </div>
      ) : (
        <div className="mt-5">
          <div className="relative h-2 rounded-full bg-[var(--color-surface-raised)]">
            {timelinePoints.map((point, idx) => (
              <div
                key={`${point.label}-${idx}`}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${toPercent(point.minuteMark)}%` }}
              >
                <span className={`block h-3 w-3 -translate-x-1/2 rounded-full ${point.colorClass} shadow`} />
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {timelinePoints.map((point, idx) => (
              <div key={`${point.label}-card-${idx}`} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-white/60">
                  <span>{point.label}</span>
                  <span>{formatSecond(point.minuteMark)}</span>
                </div>
                <div className="text-sm font-bold text-[var(--color-cream)]">
                  {point.score !== null ? `神情/手势参考分：${point.score}` : '暂无分数'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 问答部分组件
function QuestionsSection({
  answers,
  expandedQuestions,
  toggleQuestion
}: {
  answers: AnswerItem[];
  expandedQuestions: Set<number>;
  toggleQuestion: (index: number) => void;
}) {
  return (
    <div>
      <h4 className="mb-4 flex items-center gap-2 font-bold text-[var(--color-cream)]">
        <svg className="h-5 w-5 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        问答记录详情
      </h4>

      <div className="space-y-4">
        {answers.map((answer, idx) => (
          <QuestionCard
            key={idx}
            answer={answer}
            index={idx}
            isExpanded={expandedQuestions.has(idx)}
            onToggle={() => toggleQuestion(idx)}
          />
        ))}
      </div>
    </div>
  );
}

// 问题卡片组件
function QuestionCard({
  answer,
  index,
  isExpanded,
  onToggle
}: {
  answer: AnswerItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
      <motion.div
          className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      {/* 问题头部 */}
        <div
            className="flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--color-surface-warm)]"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-warm)] text-sm font-bold text-[var(--color-cream)]">
            {answer.questionIndex + 1}
          </span>
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-warm)] px-3 py-1 text-xs font-bold text-white/60">
            {answer.category || '综合'}
          </span>
          <span className={`font-semibold ${getScoreColor(answer.score, [80, 60])}`}>
            得分: {answer.score}
          </span>
        </div>
          <motion.svg
          className="h-5 w-5 text-white/60"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </div>

      {/* 问题内容 */}
      <div className="px-5 pb-2">
        <p className="font-semibold leading-relaxed text-[var(--color-cream)]">{answer.question}</p>
      </div>

      {/* 展开内容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* 你的回答 */}
              <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-warm)] p-4">
                <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-white/60">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  你的回答
                </p>
                <p className={`leading-relaxed ${
                  !answer.userAnswer || answer.userAnswer === '不知道'
                    ? 'text-red-500 font-medium'
                      : 'text-[var(--color-cream)]'
                }`}>
                  "{answer.userAnswer || '(未回答)'}"
                </p>
              </div>

              {/* AI 深度评价 */}
              {answer.feedback && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-bold text-white/60">
                    <svg className="h-4 w-4 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 9L12 15L9 12L3 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    AI 深度评价
                  </p>
                  <p className="pl-6 leading-relaxed text-[var(--color-cream)]">{answer.feedback}</p>
                </div>
              )}

              {/* 参考答案 */}
              {answer.referenceAnswer && (
                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-4">
                    <p className="mb-3 flex items-center gap-2 text-sm font-bold text-white/60">
                    <svg className="h-4 w-4 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    参考答案
                  </p>
                    <div
                        className="whitespace-pre-line leading-relaxed text-[var(--color-cream)]">{answer.referenceAnswer}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
