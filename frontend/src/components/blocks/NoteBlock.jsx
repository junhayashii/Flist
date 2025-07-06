import React, { useEffect, useRef } from "react";
import { ChevronRight, StickyNote, Tag } from "lucide-react";

export default function NoteBlock({
  block,
  onClick,
  onOpenDetail,
  isSelected,
  isEditable = false,
  editableRef,
  onBlur,
  onKeyDown,
}) {
  const noteTitle = block.html.match(/\[\[(.+?)\]\]/)?.[1] || "Note";

  const localRef = useRef(null);

  useEffect(() => {
    if (isEditable && localRef.current) {
      localRef.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(localRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditable]);

  const handleBlur = () => {
    if (!localRef.current) return;
    
    const newTitle = localRef.current.innerText.trim();
    if (!newTitle) return;

    // 新しいタイトルでマークダウン形式を作成
    const newHtml = `[[${newTitle}]]`;
    const updatedBlock = { ...block, html: newHtml, type: "note" };
    
    onBlur?.(updatedBlock);
  };

  return (
    <div
      id={`block-${block.id}`}
      tabIndex={-1}
      className={`p-3 cursor-pointer rounded-lg transition-all duration-200 ${
        isSelected
          ? "bg-[var(--color-flist-accent)]/10 shadow-sm"
          : "hover:bg-[var(--color-flist-surface-hover)]"
      }`}
      onClick={() => {
        onClick?.(block.id);
        onOpenDetail?.(block);
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 flex-shrink-0 mt-0.5">
          <StickyNote size={20} strokeWidth={1.5} className="text-[var(--color-flist-accent)]" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Note title */}
          {isEditable ? (
            <div
              ref={(el) => {
                localRef.current = el;
                if (el) editableRef?.(el);
              }}
              contentEditable
              suppressContentEditableWarning
              className="outline-none text-base font-medium leading-6 text-[var(--color-flist-dark)]"
              onBlur={handleBlur}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => onKeyDown?.(e)}
            >
              {noteTitle}
            </div>
          ) : (
            <div className="text-base font-medium leading-6 text-[var(--color-flist-dark)]">
              {noteTitle}
            </div>
          )}

          {/* Tags below title */}
        {block.tags && block.tags.length > 0 && (
            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--color-flist-muted)]">
              <div className="flex flex-wrap gap-1">
            {block.tags.map(tag => (
              <span
                key={tag.id}
                title={tag.name.length > 16 ? tag.name : undefined}
                    className="tag tag-primary flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] text-xs font-medium"
              >
                <Tag className="w-3 h-3 text-[var(--color-flist-accent)]" />
                {tag.name.length > 16 ? tag.name.slice(0, 14) + '…' : tag.name}
              </span>
            ))}
              </div>
          </div>
        )}
      </div>

        <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail?.(block);
        }}
        className="text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] p-1 transition-colors"
      >
            <ChevronRight size={14} strokeWidth={2} />
      </button>
        </div>
      </div>
    </div>
  );
}
