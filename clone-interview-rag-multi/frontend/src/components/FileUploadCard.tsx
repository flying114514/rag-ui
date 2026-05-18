import {ChangeEvent, DragEvent, useCallback, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {AlertCircle, FileText, Loader2, Upload, X} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface FileUploadCardProps {
  title: string;
  subtitle: string;
  accept: string;
  formatHint: string;
  maxSizeHint: string;
  uploading?: boolean;
  uploadButtonText?: string;
  selectButtonText?: string;
  showNameInput?: boolean;
  namePlaceholder?: string;
  nameLabel?: string;
  error?: string;
  onFileSelect?: (file: File) => void;
  onUpload: (file: File, name?: string) => void;
  onBack?: () => void;
}

export default function FileUploadCard({
  title,
  subtitle,
  accept,
  formatHint,
  maxSizeHint,
  uploading = false,
  uploadButtonText = '开始上传',
  selectButtonText = '选择文件',
  showNameInput = false,
  namePlaceholder = '留空则使用文件名',
  nameLabel = '名称（可选）',
  error,
  onFileSelect,
  onUpload,
  onBack
}: FileUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [name, setName] = useState('');

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        setSelectedFile(files[0]);
        onFileSelect?.(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
        onFileSelect?.(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleUpload = () => {
    if (!selectedFile) return;
    onUpload(selectedFile, name.trim() || undefined);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16"
      initial={{opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.35}}
    >
      <header className="mb-10 text-center">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-tight text-[var(--color-cream)]">{title}</h1>
        <p className="mx-auto mt-3 max-w-prose text-[15px] leading-relaxed text-white/60">{subtitle}</p>
      </header>

      <motion.div
        className={`relative cursor-pointer rounded-[var(--radius-lg)] border bg-[var(--color-surface-raised)] p-10 shadow-[var(--shadow-sm)] transition-all sm:p-12 ${
          dragOver ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/25' : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.05}}
      >
        <input
          type="file"
          id="file-upload-input"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
        />

        <div className="text-center">
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="file-selected"
                initial={{opacity: 0, scale: 0.98}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.98}}
                className="space-y-5"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface-warm)] text-[var(--color-accent)]">
                  <FileText className="h-9 w-9" strokeWidth={1.75} />
                </div>
                <div className="mx-auto flex max-w-md items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-warm)] px-5 py-3">
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-semibold text-[var(--color-cream)]">{selectedFile.name}</p>
                    <p className="text-[13px] text-white/60">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-white/60 transition hover:bg-[var(--color-surface-warm)]"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="no-file" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-5">
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-colors ${
                    dragOver ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' : 'bg-[var(--color-surface-warm)] text-white/60'
                  }`}
                >
                  <Upload className="h-9 w-9" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-[var(--color-cream)]">点击或拖拽文件到此处</h3>
                  <p className="mt-2 text-[14px] text-white/60">
                    {formatHint}（{maxSizeHint}）
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={e => {
                    e.stopPropagation();
                    document.getElementById('file-upload-input')?.click();
                  }}
                >
                  {selectButtonText}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {showNameInput && selectedFile && (
        <motion.div
          className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-xs)]"
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
        >
          <label className="mb-2 block text-[12px] font-medium uppercase tracking-wide text-white/60">{nameLabel}</label>
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={namePlaceholder}
            disabled={uploading}
            onClick={e => e.stopPropagation()}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            className="mt-6 flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-danger-border)] bg-[var(--color-danger)] px-4 py-3 text-center text-[14px] text-[var(--color-danger-text)]"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {onBack && (
          <Button variant="secondary" size="lg" onClick={onBack}>
            返回
          </Button>
        )}
        {selectedFile && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 sm:flex-none"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                处理中…
              </>
            ) : (
              uploadButtonText
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
