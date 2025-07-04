import { useEffect, useRef, forwardRef } from "react";
import { CheckCircle, Circle, ChevronRight, CalendarDays, Tag } from "lucide-react";

const TaskBlock = forwardRef(({
  block,
  onClick,
  onToggle,
  onOpenDetail,
  listName,
  isEditable = false,
  onBlur,
  editableRef,
  onEmptyTaskEnterOrBackspace,
  isSelected = false,
  onDelete,
  editingBlockId,
  onKeyDown,
}, ref) => {
  const isDone = block.type === "task-done";
  const label = block.html.replace(/^(- \[[ xX]\]\s*)+/, "");
  const hasMeta = block.due_date || listName;

  const localRef = useRef(null);

  useEffect(() => {
    if (isEditable && localRef.current && editingBlockId === block.id) {
      localRef.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(localRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditable, editingBlockId, block.id]);

  function formatDateLocal(dateStr) {
    try {
      // "2025-06-23" のような文字列が来ると仮定
      const parts = dateStr.split("-");
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JSの月は0始まり
      const day = parseInt(parts[2]);

      // タイムゾーンに依存しない日付オブジェクトを作成
      const localDate = new Date(year, month, day);

      return localDate.toLocaleDateString("pt-BR");
    } catch (e) {
      console.error("日付表示エラー:", e);
      return "";
    }
  }

  const handleKeyDown = (e) => {
    const text = localRef.current?.innerText.trim();
    if (!text && (e.key === "Enter" || e.key === "Backspace")) {
      e.preventDefault();
      onEmptyTaskEnterOrBackspace?.();
    }
    
    // 親コンポーネントのキーボード処理を呼び出し
    onKeyDown?.(e);
  };

  // Utility to get a color for a tag based on its name
  function getTagColor(name) {
    // Simple hash to pick a color
    const colors = [
      '#6366f1', // indigo
      '#10b981', // emerald
      '#f59e42', // orange
      '#f43f5e', // rose
      '#3b82f6', // blue
      '#a21caf', // purple
      '#eab308', // yellow
      '#14b8a6', // teal
      '#ef4444', // red
      '#8b5cf6', // violet
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div
      id={`block-${block.id}`}
      ref={ref}
      className={`p-2 cursor-pointer rounded-lg transition-all duration-200 ${
        isSelected 
          ? "bg-[var(--color-flist-blue-light)] border border-[var(--color-flist-accent)]" 
          : "bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] hover:border-[var(--color-flist-accent)] hover:bg-[var(--color-flist-surface-hover)]"
      }`}
      onClick={() => onClick?.(block)}
    >
      <div className="flex items-center space-x-4">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(block);
          }}
          className="w-6 h-6 cursor-pointer text-[var(--color-flist-accent)] hover:scale-105 transition-transform"
        >
          {isDone ? (
            <CheckCircle className="w-6 h-6" strokeWidth={1.5} />
          ) : (
            <Circle className="w-6 h-6" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isEditable ? (
            <div
              ref={(el) => {
                localRef.current = el;
                if (el) editableRef?.(el);
              }}
              contentEditable
              suppressContentEditableWarning
              className={`outline-none flex-1 ${
                isDone ? "line-through text-[var(--color-flist-muted)]" : "text-[var(--color-flist-dark)]"
              }`}
              onBlur={() => onBlur?.(block)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              {label}
            </div>
          ) : (
            <div
              className={
                isDone ? "line-through text-[var(--color-flist-muted)]" : "text-[var(--color-flist-dark)]"
              }
            >
              {label}
            </div>
          )}

          {/* Tag chips */}
          {block.tags && block.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {block.tags.map(tag => (
                <span
                  key={tag.id}
                  title={tag.name.length > 16 ? tag.name : undefined}
                  className="px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-150 cursor-default"
                  style={{
                    background: 'var(--color-flist-accent-light)',
                    color: 'var(--color-flist-accent)',
                    border: '1px solid var(--color-flist-accent)',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  #{tag.name.length > 16 ? tag.name.slice(0, 14) + '…' : tag.name}
                </span>
              ))}
            </div>
          )}

          {hasMeta && (
            <div className="flex items-center gap-4 text-xs mt-2">
              {block.due_date && (
                <div className="flex items-center text-sm text-[var(--color-flist-muted)] gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {formatDateLocal(block.due_date)}
                </div>
              )}
              {listName && (
                <span className="text-[var(--color-flist-muted)]">{listName}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(block);
            }}
            className="text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] p-1 transition-colors"
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-[var(--color-flist-muted)] hover:text-red-500 text-sm transition-colors"
            >
              削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

TaskBlock.displayName = 'TaskBlock';

export default TaskBlock;
