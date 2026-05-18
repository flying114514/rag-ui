import { ArrowRight, FileStack, PenLine, Sparkles, WandSparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';

const options = [
  {
    label: '从模板开始搭建',
    desc: '选择专业模板，快速进入编辑状态',
    icon: PenLine,
    path: '/resume-builder/templates',
  },
  {
    label: '直接 AI 生成简历',
    desc: '根据你的背景自动生成高质量内容',
    icon: Sparkles,
    path: '/resume-builder/ai',
  },
  {
    label: '查看已有简历',
    desc: '继续优化、复盘与投递管理',
    icon: FileStack,
    path: '/history',
  },
];

export default function ResumeGenerateHubPage() {
  const navigate = useNavigate();

  return (
    <div className="relative px-8 md:px-12 pb-16 pt-10 max-w-[1440px] mx-auto">
      <PageHeader title="简历生成" description="使用 AI 或模板创建专业简历" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/50">
          <WandSparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          Resume Intelligence Suite
        </div>

        <h2 className="mt-8 text-editorial text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[var(--color-cream)]">
          Craft Resume
          <br />
          <span className="italic text-[var(--color-accent)]">Like An AI Native</span>
        </h2>

        <p className="mt-5 max-w-[560px] text-[14px] leading-relaxed text-white/40">
          选择你的起点，进入统一的 AI 工作流：模板搭建、智能生成、持续优化。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="mt-14 grid gap-5 md:grid-cols-3"
      >
        {options.map((option, idx) => (
          <motion.button
            key={option.label}
            type="button"
            onClick={() => navigate(option.path)}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left backdrop-blur-sm transition-all duration-500 hover:border-[var(--color-accent)]/30 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_rgba(200,149,108,0.08)]"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/15 group-hover:shadow-[0_0_20px_rgba(200,149,108,0.2)] transition-all duration-500">
              <option.icon className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="text-[16px] font-semibold text-[var(--color-cream)]">{option.label}</div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/40">{option.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30 group-hover:text-[var(--color-accent)] transition-colors duration-500">
              Step {idx + 1}
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.7 }}
        className="mt-12 flex flex-wrap items-center gap-4"
      >
        <button type="button" onClick={() => navigate('/resume-builder/ai')}
          className="group flex items-center gap-4 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-7 py-3.5 transition-all duration-500 hover:bg-[var(--color-accent)]/20 hover:shadow-[0_0_30px_rgba(200,149,108,0.15)] cursor-pointer">
          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-[13px] font-medium text-[var(--color-cream)]">立即开始 AI 生成</span>
        </button>
        <button type="button" onClick={() => navigate('/resume-builder/templates')}
          className="group flex items-center gap-4 rounded-full border border-white/10 px-7 py-3.5 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer">
          <PenLine className="h-4 w-4 text-white/50" />
          <span className="text-[13px] font-medium text-white/60 group-hover:text-white/80 transition-colors">查看模板库</span>
        </button>
      </motion.div>
    </div>
  );
}
