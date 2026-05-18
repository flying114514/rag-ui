import type {InterviewChatMessage} from '../../types/interviewChat';

interface MessageItemProps {
  message: InterviewChatMessage;
}

/**
 * 面试官：无气泡，文档式排版（参考 SuperGrok AI 回复区）
 * 候选人：浅灰圆角气泡，右对齐
 */
export default function MessageItem({message}: MessageItemProps) {
  if (message.type === 'interviewer') {
    return (
      <article className="max-w-[52rem]">
        <header className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold text-[var(--color-cream)]">面试官</span>
          {message.category ? (
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-0.5 text-[11px] font-semibold text-white/60">
              {message.category}
            </span>
          ) : null}
        </header>
        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-[var(--color-cream)] prose-p:my-2 prose-headings:my-3 prose-invert">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </article>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[min(100%,36rem)]">
        <p className="mb-1.5 text-right text-[12px] font-semibold text-white/60">你</p>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface-warm)] px-4 py-3 text-[15px] leading-relaxed text-[var(--color-cream)]">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
