import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange} disabled={uploading} />

      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover z-0">
        <source src="/bg-hero.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/35 z-0" />

      {/* Side nav dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
        {['UPLOAD', 'RESUME', 'INTERVIEW', 'KNOWLEDGE'].map((label, i) => (
          <button key={label} type="button"
            onClick={() => containerRef.current?.scrollTo({ top: i * window.innerHeight, behavior: 'smooth' })}
            className="group flex items-center gap-3 cursor-pointer">
            <span className={`text-[8px] font-medium uppercase tracking-[0.15em] transition-all duration-700 opacity-0 group-hover:opacity-100 ${i === activeSection ? '!opacity-100 text-[var(--color-accent)]' : 'text-white/40'}`}>{label}</span>
            <div className={`transition-all duration-700 rounded-full ${i === activeSection ? 'w-3 h-3 bg-[var(--color-accent)] shadow-[0_0_12px_rgba(200,149,108,0.5)]' : 'w-1.5 h-1.5 bg-white/25 group-hover:bg-white/50'}`} />
          </button>
        ))}
      </div>

      {/* Section 1: Hero */}
      <section className="relative h-screen w-full snap-start snap-always flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {activeSection === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center px-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-[var(--color-accent)] mb-8">AI-POWERED PLATFORM</p>
              <h1 className="text-editorial text-[clamp(40px,9vw,130px)] text-white leading-[0.85]">PREPARE YOUR<br /><span className="italic">NEXT INTERVIEW</span></h1>
              <p className="mt-8 text-[15px] text-white/45 max-w-[480px]">上传简历，AI 自动分析并生成面试策略</p>
              <motion.button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="mt-14 group relative flex h-32 w-32 mx-auto items-center justify-center rounded-full cursor-pointer"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-[var(--color-accent)]/60 transition-all duration-700" />
                <div className="absolute inset-2 rounded-full border border-white/10 group-hover:border-[var(--color-accent)]/30 transition-all duration-700" />
                <div className="absolute inset-0 rounded-full group-hover:bg-[var(--color-accent)]/5 group-hover:shadow-[0_0_60px_rgba(200,149,108,0.2)] transition-all duration-700" />
                <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-700" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="none" stroke="rgba(200,149,108,0.4)" strokeWidth="0.5" strokeDasharray="20 80" strokeLinecap="round" /></svg>
                {uploading ? <Loader2 className="h-7 w-7 text-[var(--color-accent)] animate-spin" /> : <Upload className="h-7 w-7 text-white/50 group-hover:text-[var(--color-accent)] transition-colors duration-500" />}
                <span className="absolute -bottom-10 text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-hover:text-[var(--color-accent)] transition-colors">{uploading ? 'ANALYZING...' : 'UPLOAD RESUME'}</span>
              </motion.button>
              {error && <p className="mt-12 text-[13px] text-rose-300">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="w-[1px] h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* Section 2: Resume */}
      <section className="relative h-screen w-full snap-start snap-always flex items-center overflow-hidden">
        <AnimatePresence>
          {activeSection === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="flex w-full h-full items-center px-8 md:px-16 lg:px-24 gap-12">
              <div className="hidden lg:block w-[42%] h-[70vh] -ml-8 overflow-hidden rounded-r-[32px] shadow-2xl relative">
                <img src="/section-resume.jpg" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              </div>
              <div className="flex-1 lg:pl-12">
                <div className="flex items-center gap-4 mb-8"><div className="w-12 h-[1px] bg-[var(--color-accent)]" /><span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--color-accent)]">RESUME BUILDER</span></div>
                <h2 className="text-editorial text-[clamp(32px,6vw,80px)] text-white leading-[0.9]">BUILD YOUR<br /><span className="italic">PERFECT RESUME</span></h2>
                <p className="mt-6 text-[14px] text-white/40 max-w-[380px]">使用 AI 或模板创建专业简历，一键生成</p>
                <ActionButton icon={FileText} label="开始创建" onClick={() => navigate('/resume-builder')} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Section 3: Interview */}
      <section className="relative h-screen w-full snap-start snap-always flex items-end overflow-hidden">
        <img src="/section-interview.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <AnimatePresence>
          {activeSection === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="relative z-10 px-8 md:px-16 lg:px-24 pb-28 w-full">
              <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--color-accent)] mb-4 block">MOCK INTERVIEW</span>
              <h2 className="text-editorial text-[clamp(36px,7vw,90px)] text-white leading-[0.9]">MASTER THE<br /><span className="italic">ART OF INTERVIEW</span></h2>
              <p className="mt-5 text-[14px] text-white/45 max-w-[420px]">智能模拟面试，实时反馈，持续提升表现</p>
              <ActionButton icon={Users} label="模拟面试" onClick={() => navigate('/interviews')} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Section 4: Knowledge */}
      <section className="relative h-screen w-full snap-start snap-always flex items-center overflow-hidden">
        <AnimatePresence>
          {activeSection === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="flex w-full h-full items-center px-8 md:px-16 lg:px-24">
              <div className="flex-1 max-w-[550px]">
                <div className="flex items-center gap-4 mb-8"><div className="w-12 h-[1px] bg-[var(--color-accent)]" /><span className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--color-accent)]">KNOWLEDGE BASE</span></div>
                <h2 className="text-editorial text-[clamp(32px,6vw,80px)] text-white leading-[0.9]">EXPLORE YOUR<br /><span className="italic">KNOWLEDGE BASE</span></h2>
                <p className="mt-6 text-[14px] text-white/40 max-w-[380px]">构建个人知识库，AI 问答助手随时待命</p>
                <ActionButton icon={BookOpen} label="知识问答" onClick={() => navigate('/knowledgebase')} />
              </div>
              <div className="hidden lg:block flex-shrink-0 w-[360px] xl:w-[420px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
                  <img src="/section-knowledge.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Page counter */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <span className="text-[10px] font-medium text-[var(--color-accent)]">{String(activeSection + 1).padStart(2, '0')}</span>
        <div className="w-10 h-[1px] bg-white/20" />
        <span className="text-[10px] font-medium text-white/30">04</span>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <motion.button type="button" onClick={onClick}
      className="mt-10 group flex items-center gap-4 rounded-full border border-white/15 px-6 py-3 cursor-pointer transition-all duration-700 hover:border-[var(--color-accent)]/50 hover:shadow-[0_0_40px_rgba(200,149,108,0.12)]"
      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 group-hover:bg-[var(--color-accent)]/20 transition-all duration-500">
        <Icon className="h-4 w-4 text-[var(--color-accent)]" />
      </div>
      <span className="text-[12px] font-medium text-white/70 group-hover:text-white transition-colors">{label}</span>
      <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all duration-500" />
    </motion.button>
  );
}
