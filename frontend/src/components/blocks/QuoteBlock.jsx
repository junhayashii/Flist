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
    <blockquote
      id={`block-${block.id}`}
      tabIndex={-1}
      className={`border-l-4 pl-4 text-gray-600 italic px-2 py-1 cursor-pointer ${
        isSelected
          ? "bg-[var(--color-flist-accent)]/10 rounded-lg"
          : "hover:bg-[var(--color-flist-surface)] rounded-lg"
      }`}
      onClick={() => onClick?.(block.id)}
    >
      {isEditable ? (
        <span
          ref={(el) => {
            localRef.current = el;
            if (el) editableRef?.(el);
          }}
          contentEditable
          suppressContentEditableWarning
          className="outline-none whitespace-nowrap"
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => onKeyDown?.(e)}
        >
          {text}
        </span>
      ) : (
        text
      )}
    </blockquote>
  );
}
