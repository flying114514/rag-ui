import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, FileText, Loader2, Upload, Users } from 'lucide-react';
import { resumeApi } from '../api/resume';
import { getErrorMessage } from '../api/request';

interface UploadPageProps {
  onUploadComplete: (resumeId: number) => void;
}

export default function UploadPage({ onUploadComplete }: UploadPageProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const data = await resumeApi.uploadAndAnalyze(file);
      if (!data.storage?.resumeId) throw new Error('上传失败，请重试');
      onUploadComplete(data.storage.resumeId);
    } catch (err) {
      setError(getErrorMessage(err));
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollTop / window.innerHeight);
    setActiveSection(Math.min(idx, 3));
  };

  return (
    <div ref={containerRef} onScroll={handleScroll}
      className="h-screen overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} disabled={uploading} />

      {/* Side nav dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
        {['UPLOAD', 'RESUME', 'INTERVIEW', 'KNOWLEDGE'].map((label, i) => (
          <button key={label} type="button"
            onClick={() => containerRef.current?.scrollTo({ top: i * window.innerHeight, behavior: 'smooth' })}
            className="group flex items-center gap-3 cursor-pointer">
            <span className={`text-[8px] font-medium uppercase tracking-[0.15em] transition-all duration-500 opacity-0 group-hover:opacity-100 ${i === activeSection ? '!opacity-100 text-[var(--color-accent)]' : 'text-white/40'}`}>{label}</span>
            <div className={`transition-all duration-500 rounded-full ${i === activeSection ? 'w-3 h-3 bg-[var(--color-accent)] shadow-[0_0_12px_rgba(200,149,108,0.5)]' : 'w-1.5 h-1.5 bg-white/25 group-hover:bg-white/50'}`} />
          </button>
        ))}
      </div>

      {/* ===== SECTION 1: HERO - Centered cinematic ===== */}
      <Section1 active={activeSection === 0} uploading={uploading} error={error} onUpload={() => fileInputRef.current?.click()} />

      {/* ===== SECTION 2: RESUME - Image left, text right ===== */}
      <Section2 active={activeSection === 1} onNavigate={() => navigate('/resume-builder')} />

      {/* ===== SECTION 3: INTERVIEW - Full bleed image with text overlay ===== */}
      <Section3 active={activeSection === 2} onNavigate={() => navigate('/interviews')} />

      {/* ===== SECTION 4: KNOWLEDGE - Text left, tilted image right ===== */}
      <Section4 active={activeSection === 3} onNavigate={() => navigate('/knowledgebase')} />
    </div>
  );
}

function Section1({ active, uploading, error, onUpload }: { active: boolean; uploading: boolean; error: string; onUpload: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full snap-start snap-always flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale }}>
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/bg-hero.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <div className="absolute inset-0 bg-black/45" />

      <motion.div className="relative z-10 text-center px-8" style={{ y, opacity }}>
        {active && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-[var(--color-accent)] mb-8">AI-POWERED PLATFORM</p>
            <h1 className="text-editorial text-[clamp(40px,9vw,130px)] text-white leading-[0.85]">
              PREPARE YOUR<br /><span className="italic">NEXT INTERVIEW</span>
            </h1>
            <p className="mt-8 text-[15px] text-white/45 max-w-[480px] mx-auto">上传简历，AI 自动分析并生成面试策略</p>
            <motion.button type="button" onClick={onUpload} disabled={uploading}
              className="mt-14 group relative flex h-32 w-32 mx-auto items-center justify-center rounded-full cursor-pointer"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-[var(--color-accent)]/60 transition-all duration-700" />
              <div className="absolute inset-2 rounded-full border border-white/10 group-hover:border-[var(--color-accent)]/30 transition-all duration-700" />
              <div className="absolute inset-0 rounded-full group-hover:bg-[var(--color-accent)]/5 group-hover:shadow-[0_0_60px_rgba(200,149,108,0.2),inset_0_0_30px_rgba(200,149,108,0.08)] transition-all duration-700" />
              <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-700" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(200,149,108,0.4)" strokeWidth="0.5" strokeDasharray="20 80" strokeLinecap="round" />
              </svg>
              {uploading ? <Loader2 className="h-7 w-7 text-[var(--color-accent)] animate-spin" /> : <Upload className="h-7 w-7 text-white/50 group-hover:text-[var(--color-accent)] transition-colors duration-500" />}
              <span className="absolute -bottom-10 text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-hover:text-[var(--color-accent)] transition-colors duration-500">{uploading ? 'ANALYZING...' : 'UPLOAD RESUME'}</span>
            </motion.button>
            {error && <p className="mt-8 text-[13px] text-[var(--color-danger-text)]">{error}</p>}
          </motion.div>
        )}
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-[1px] h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}

function Section2({ active, onNavigate }: { active: boolean; onNavigate: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const textX = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30]);

  return (
    <section ref={ref} className="relative h-screen w-full snap-start snap-always flex items-center overflow-hidden bg-[#060606]">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-15">
        <source src="/bg-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      <div className="relative z-10 flex w-full h-full items-center px-8 md:px-16 lg:px-24 gap-12">
        <motion.div className="hidden lg:block w-[42%] h-[70vh] -ml-8" style={{ y: imgY }}>
          <div className="relative w-full h-full overflow-hidden rounded-r-[32px] shadow-[var(--shadow-xl)]">
            <img src="/section-resume.jpg" alt="Resume" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          </div>
        </motion.div>

        <motion.div className="flex-1 lg:pl-12" style={{ x: textX }}>
          {active && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-[1px] bg-[var(--color-accent)]" />
                <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--color-accent)]">RESUME BUILDER</span>
              </div>
              <h2 className="text-editorial text-[clamp(32px,6vw,80px)] text-white leading-[0.9]">
                BUILD YOUR<br /><span className="italic">PERFECT RESUME</span>
              </h2>
              <p className="mt-6 text-[14px] text-white/40 max-w-[380px] leading-relaxed">使用 AI 或模板创建专业简历，一键生成</p>
              <motion.button type="button" onClick={onNavigate} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="mt-12 group relative flex items-center gap-6 rounded-full border border-white/15 pl-2 pr-10 py-2 cursor-pointer transition-all duration-700 hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_50px_rgba(200,149,108,0.15)]"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 group-hover:bg-[var(--color-accent)]/20 group-hover:shadow-[0_0_30px_rgba(200,149,108,0.3)] transition-all duration-500">
                  <FileText className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">开始创建</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.15em]">RESUME BUILDER</span>
                </div>
                <ArrowRight className="ml-4 h-5 w-5 text-white/20 group-hover:text-[var(--color-accent)] group-hover:translate-x-2 transition-all duration-500" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Section3({ active, onNavigate }: { active: boolean; onNavigate: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 0.95]);

  return (
    <section ref={ref} className="relative h-screen w-full snap-start snap-always overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
        <img src="/section-interview.jpg" alt="Interview" className="absolute inset-0 w-full h-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      <div className="relative z-10 flex h-full flex-col justify-end px-8 md:px-16 lg:px-24 pb-24">
        {active && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--color-accent)] mb-4 block">MOCK INTERVIEW</span>
            <h2 className="text-editorial text-[clamp(36px,7vw,90px)] text-white leading-[0.9]">
              MASTER THE<br /><span className="italic">ART OF INTERVIEW</span>
            </h2>
            <p className="mt-5 text-[14px] text-white/45 max-w-[420px]">智能模拟面试，实时反馈，持续提升表现</p>
            <motion.button type="button" onClick={onNavigate} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-10 group relative flex items-center gap-6 rounded-full border border-white/15 pl-2 pr-10 py-2 cursor-pointer transition-all duration-700 hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_50px_rgba(200,149,108,0.15)]"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 group-hover:bg-[var(--color-accent)]/20 group-hover:shadow-[0_0_30px_rgba(200,149,108,0.3)] transition-all duration-500">
                <Users className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">模拟面试</span>
                <span className="text-[10px] text-white/30 uppercase tracking-[0.15em]">START INTERVIEW</span>
              </div>
              <ArrowRight className="ml-4 h-5 w-5 text-white/20 group-hover:text-[var(--color-accent)] group-hover:translate-x-2 transition-all duration-500" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function Section4({ active, onNavigate }: { active: boolean; onNavigate: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgRotate = useTransform(scrollYProgress, [0, 1], [4, -2]);
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -30]);

  return (
    <section ref={ref} className="relative h-screen w-full snap-start snap-always flex items-center overflow-hidden bg-[#050505]">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-10">
        <source src="/bg-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-transparent to-black/80" />

      <div className="relative z-10 flex w-full h-full items-center px-8 md:px-16 lg:px-24">
        <motion.div className="flex-1 max-w-[550px]" style={{ y: textY }}>
          {active && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-[1px] bg-[var(--color-accent)]" />
                <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--color-accent)]">KNOWLEDGE BASE</span>
              </div>
              <h2 className="text-editorial text-[clamp(32px,6vw,80px)] text-white leading-[0.9]">
                EXPLORE YOUR<br /><span className="italic">KNOWLEDGE BASE</span>
              </h2>
              <p className="mt-6 text-[14px] text-white/40 max-w-[380px]">构建个人知识库，AI 问答助手随时待命</p>
              <motion.button type="button" onClick={onNavigate} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="mt-12 group relative flex items-center gap-6 rounded-full border border-white/15 pl-2 pr-10 py-2 cursor-pointer transition-all duration-700 hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_50px_rgba(200,149,108,0.15)]"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 group-hover:bg-[var(--color-accent)]/20 group-hover:shadow-[0_0_30px_rgba(200,149,108,0.3)] transition-all duration-500">
                  <BookOpen className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">知识问答</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.15em]">KNOWLEDGE BASE</span>
                </div>
                <ArrowRight className="ml-4 h-5 w-5 text-white/20 group-hover:text-[var(--color-accent)] group-hover:translate-x-2 transition-all duration-500" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        <motion.div className="hidden lg:block flex-shrink-0 w-[360px] xl:w-[420px]" style={{ rotate: imgRotate }}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 shadow-[var(--shadow-xl)]">
            <img src="/section-knowledge.jpg" alt="Knowledge" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}