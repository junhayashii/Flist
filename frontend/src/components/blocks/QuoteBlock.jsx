import React, { useEffect, useRef } from "react";

export default function QuoteBlock({ 
  block, 
  onClick,
  isEditable = false,
  editableRef,
  onBlur,
  onKeyDown,
  isSelected = false
}) {
  const text = block.html.replace(/^> /, "");

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
    
    const newText = localRef.current.innerText.trim();
    if (!newText) return;

    // 新しいテキストでマークダウン形式を作成
    const newHtml = `> ${newText}`;
    const updatedBlock = { ...block, html: newHtml, type: "quote" };
    
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
      onClick={() => onClick?.(block.id)}
    >
      <div className="flex items-start">
        <div className="w-5 h-5 flex-shrink-0 mt-0.5">
          <div className="w-0.5 h-5 bg-[var(--color-flist-accent)] rounded-full"></div>
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
              className="outline-none text-base font-medium leading-6 text-[var(--color-flist-dark)] italic"
              onBlur={handleBlur}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => onKeyDown?.(e)}
            >
              {text}
            </div>
          ) : (
            <div className="text-base font-medium leading-6 text-[var(--color-flist-dark)] italic">
              {text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
