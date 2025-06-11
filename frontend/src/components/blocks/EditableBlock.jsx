import React, { useEffect, useRef } from "react";

export default function EditableBlock({
  block,
  isSelected,
  onInput,
  onBlur,
  onKeyDown,
  editableRef,
  onFocus,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && !ref.current.dataset.initialized) {
      ref.current.innerHTML = block.html || "";
      ref.current.dataset.initialized = "true";
    }
  }, [block]);

  return (
    <div
      key={`edit-${block.id}`}
      id={`block-${block.id}`}
      contentEditable
      suppressContentEditableWarning
      className={`px-3 py-2 rounded-lg bg-white outline-none whitespace-pre-wrap break-words focus:bg-blue-50 ${
        block.type === "heading1"
          ? "text-2xl font-bold"
          : block.type === "heading2"
          ? "text-xl font-semibold"
          : block.type === "heading3"
          ? "text-lg font-medium"
          : block.type === "bullet"
          ? "list-disc ml-6"
          : block.type === "numbered"
          ? "list-decimal ml-6"
          : block.type === "quote"
          ? "border-l-4 pl-4 text-gray-600 italic"
          : ""
      }`}
      ref={(el) => {
        ref.current = el;
        editableRef?.(el);
      }}
      onFocus={onFocus}
      onInput={onInput}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}
