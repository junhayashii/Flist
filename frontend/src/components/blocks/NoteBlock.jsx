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
  const hasTags = block.tags && block.tags.length > 0;

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

  return (
    <div
      id={`block-${block.id}`}
      tabIndex={-1}
      className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition-colors ${
        isSelected
          ? "bg-[var(--color-flist-accent)]/10 rounded-xl"
          : "hover:bg-[var(--color-flist-surface)] rounded-xl"
      }`}
      onClick={() => {
        onClick?.(block.id);
        onOpenDetail?.(block);
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 pt-1 pb-1 font-medium">
          <StickyNote size={20} strokeWidth={2} className="text-[var(--color-flist-accent)]" />
          {isEditable ? (
            <div
              ref={(el) => {
                localRef.current = el;
                if (el) editableRef?.(el);
              }}
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              onBlur={() => onBlur?.(block)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => onKeyDown?.(e)}
            >
              {noteTitle}
            </div>
          ) : (
            <div>{noteTitle}</div>
          )}
        </div>
        {hasTags && (
          <div className="flex items-center gap-1 text-xs text-[var(--color-flist-text-secondary)] mt-1">
            <Tag className="w-3 h-3 text-[var(--color-flist-muted)]" />
            <span>{block.tags.map(tag => tag.name).join(", ")}</span>
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail?.(block);
        }}
        className="text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] p-1 transition-colors"
      >
        <ChevronRight size={14} strokeWidth={3} />
      </button>
    </div>
  );
}
