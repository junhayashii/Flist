import React, { useEffect, useRef } from "react";

export default function ListItemBlock({ 
  block, 
  type = "bullet", 
  onClick,
  isEditable = false,
  editableRef,
  onBlur,
  onKeyDown,
  isSelected = false
}) {
  const baseClass = "px-2 py-1 cursor-pointer";
  const classes = {
    bullet: "list-disc ml-3",
    numbered: "list-decimal ml-3",
  };

  const cleanedText =
    type === "bullet"
      ? block.html.replace(/^- /, "")
      : block.html.replace(/^\d+\. /, "");

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

  return (
    <li
      id={`block-${block.id}`}
      tabIndex={-1}
      className={`${baseClass} ${classes[type]} ${
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
          {cleanedText}
        </span>
      ) : (
        cleanedText
      )}
    </li>
  );
}
