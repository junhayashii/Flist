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
      className={`flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer transition-colors ${
        isSelected
          ? "bg-[var(--color-flist-accent)]/10 rounded-lg"
          : "hover:bg-[var(--color-flist-surface)] rounded-lg"
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
              onBlur={handleBlur}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => onKeyDown?.(e)}
            >
              {noteTitle}
            </div>
          ) : (
            <div>{noteTitle}</div>
          )}
        </div>
        {/* Tag chips */}
        {block.tags && block.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {block.tags.map(tag => {
              // Simple hash to pick a color
              const colors = [
                'tag-primary',
                'tag-success', 
                'tag-warning',
                'tag-purple',
                'tag-pink',
                'tag-indigo',
                'tag-teal',
                'tag-error'
              ];
              let hash = 0;
              for (let i = 0; i < tag.name.length; i++) {
                hash = tag.name.charCodeAt(i) + ((hash << 5) - hash);
              }
              const tagColor = colors[Math.abs(hash) % colors.length];
              
              return (
              <span
                key={tag.id}
                title={tag.name.length > 16 ? tag.name : undefined}
                  className={`tag ${tagColor}`}
                >
                  <Tag size={10} />
                  {tag.name.length > 16 ? tag.name.slice(0, 14) + '…' : tag.name}
              </span>
              );
            })}
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
