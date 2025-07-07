import React, { useEffect, useRef } from "react";
import { useSlashCommand } from "../../hooks/useSlashCommand";
import SlashCommandMenu from "../SlashCommandMenu";

export default function EditableBlock({
  block,
  onInput,
  onBlur,
  onKeyDown,
  editableRef,
  onFocus,
  onSelectCommand,
  setIsSlashMenuVisible,
}) {
  const ref = useRef(null);

  const {
    isVisible: isSlashMenuVisible,
    position: slashMenuPosition,
    searchQuery: slashSearchQuery,
    handleInput: handleSlashInput,
    handleSelectCommand: handleSlashSelectCommand,
    handleClose: handleSlashClose,
  } = useSlashCommand({
    onSelectCommand: (command, slashIndex) => {
      if (!ref.current) return;

      const text = ref.current.innerText;
      const beforeSlash = text.slice(0, slashIndex);
      const afterSlash = text.slice(slashIndex + slashSearchQuery.length + 1);
      
      // コマンドに応じてテキストを置換
      let newText;
      if (command.id === "divider") {
        newText = beforeSlash + "---" + afterSlash;
      } else if (command.id === "note") {
        newText = beforeSlash + "[[Note]]" + afterSlash;
      } else {
        newText = beforeSlash + command.prefix + afterSlash;
      }

      ref.current.innerText = newText;
      
      // カーソルを適切な位置に移動
      const newCursorPosition = beforeSlash.length + command.prefix.length;
      const range = document.createRange();
      const sel = window.getSelection();
      
      if (ref.current.firstChild) {
        range.setStart(ref.current.firstChild, newCursorPosition);
        range.setEnd(ref.current.firstChild, newCursorPosition);
      } else {
        range.setStart(ref.current, newCursorPosition);
        range.setEnd(ref.current, newCursorPosition);
      }
      
      sel.removeAllRanges();
      sel.addRange(range);

      // 入力イベントを発火
      if (onInput) {
        const event = { target: { innerText: newText } };
        onInput(event);
      }

      // コマンド選択時のコールバック
      if (onSelectCommand) {
        onSelectCommand(command, block);
      }
    },
    blockRef: ref,
  });

  useEffect(() => {
    if (ref.current && !ref.current.dataset.initialized) {
      ref.current.innerHTML = block.html || "";
      ref.current.dataset.initialized = "true";
    }
  }, [block]);

  const handleInput = (e) => {
    // スラッシュコマンドの処理
    handleSlashInput(e, ref);
    
    // 通常の入力処理
    if (onInput) {
      onInput(e);
    }
  };

  // スラッシュメニューの状態を親コンポーネントに通知
  useEffect(() => {
    if (setIsSlashMenuVisible) {
      setIsSlashMenuVisible(isSlashMenuVisible);
    }
  }, [isSlashMenuVisible, setIsSlashMenuVisible]);

  return (
    <div className="relative">
      <div
        key={`edit-${block.id}`}
        id={`block-${block.id}`}
        contentEditable
        suppressContentEditableWarning
        className={`px-3 py-2 rounded-lg bg-[var(--color-flist-surface)] outline-none whitespace-pre-wrap break-words transition-all duration-200 focus:bg-[var(--color-flist-surface)] focus:border focus:border-[var(--color-flist-primary)] focus:shadow-sm ${
          block.type === "heading1"
            ? "text-2xl font-bold text-[var(--color-flist-text-primary)]"
            : block.type === "heading2"
            ? "text-xl font-semibold text-[var(--color-flist-text-primary)]"
            : block.type === "heading3"
            ? "text-lg font-medium text-[var(--color-flist-text-primary)]"
            : block.type === "bullet"
            ? "list-disc ml-6 text-[var(--color-flist-text-primary)]"
            : block.type === "numbered"
            ? "list-decimal ml-6 text-[var(--color-flist-text-primary)]"
            : block.type === "quote"
            ? "border-l-4 border-[var(--color-flist-primary)] pl-4 text-[var(--color-flist-text-secondary)] italic"
            : "text-[var(--color-flist-text-primary)]"
        }`}
        ref={(el) => {
          ref.current = el;
          editableRef?.(el);
        }}
        onFocus={onFocus}
        onInput={handleInput}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      
      <SlashCommandMenu
        isVisible={isSlashMenuVisible}
        position={slashMenuPosition}
        searchQuery={slashSearchQuery}
        onSelect={handleSlashSelectCommand}
        onClose={handleSlashClose}
      />
    </div>
  );
}
