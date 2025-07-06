import React, { useEffect, useRef } from "react";

export default function HeadingBlock({ 
  block, 
  level = 1, 
  onClick, 
  isEditable = false,
  editableRef,
  onBlur,
  onKeyDown,
  isSelected = false
}) {
  const baseClass = "px-3 py-1 cursor-pointer";
  const levels = {
    1: "text-2xl font-bold",
    2: "text-xl font-semibold",
    3: "text-lg font-medium",
  };
  const headingText = block.html.replace(/^#+\s/, "");

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

    // Call the parent onBlur handler - it will handle the text processing
    onBlur?.();
  };

  const Tag = `h${level}`;

  return (
    <Tag
      id={`block-${block.id}`}
      tabIndex={-1}
      className={`${baseClass} ${levels[level]} ${
        isSelected
          ? "bg-[var(--color-flist-accent)]/10 rounded-xl"
          : "hover:bg-[var(--color-flist-surface)] rounded-xl"
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
          {headingText}
        </span>
      ) : (
        headingText
      )}
    </Tag>
  );
}
