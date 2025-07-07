import React, { useState, useEffect, useRef } from "react";
import {
  Type,
  List,
  Hash,
  Quote,
  Minus,
  StickyNote,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

const COMMANDS = [
  {
    id: "text",
    title: "Text",
    description: "Just start writing with plain text",
    icon: Type,
    prefix: "",
  },
  {
    id: "heading1",
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    prefix: "# ",
  },
  {
    id: "heading2",
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    prefix: "## ",
  },
  {
    id: "heading3",
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    prefix: "### ",
  },
  {
    id: "bullet",
    title: "Bullet list",
    description: "Create a simple bullet list",
    icon: List,
    prefix: "- ",
  },
  {
    id: "numbered",
    title: "Numbered list",
    description: "Create a numbered list",
    icon: List,
    prefix: "1. ",
  },
  {
    id: "quote",
    title: "Quote",
    description: "Capture a quote",
    icon: Quote,
    prefix: "> ",
  },
  {
    id: "divider",
    title: "Divider",
    description: "Add a horizontal line",
    icon: Minus,
    prefix: "---",
  },
  {
    id: "note",
    title: "Note",
    description: "Create a note with title",
    icon: StickyNote,
    prefix: "[[",
  },
  {
    id: "task",
    title: "Task",
    description: "Create a to-do item",
    icon: CheckSquare,
    prefix: "- [ ] ",
  },
];

export default function SlashCommandMenu({
  isVisible,
  position,
  onSelect,
  onClose,
  searchQuery = "",
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const menuRef = useRef(null);

  // 検索クエリに基づいてコマンドをフィルタリング
  const filteredCommands = COMMANDS.filter((command) =>
    command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // 位置調整のロジック
  useEffect(() => {
    if (!isVisible || !menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const menuHeight = menu.offsetHeight || 300; // fallback
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newTop = position.top;
    let newLeft = position.left;

    // --- メニューの高さを考慮して上下を切り替え ---
    if (newTop + menuHeight > viewportHeight) {
      // 画面下端に収まらない場合は上側に表示
      newTop = newTop - menuHeight;
    }

    // 右端で切れる場合の調整
    if (newLeft + menuRect.width > viewportWidth) {
      newLeft = viewportWidth - menuRect.width - 10;
    }

    // 左端で切れる場合の調整
    if (newLeft < 10) {
      newLeft = 10;
    }

    // 上端で切れる場合の調整
    if (newTop < 10) {
      newTop = 10;
    }

    console.log('SlashCommandMenu position:', position, 'adjustedPosition:', { top: newTop, left: newLeft });
    setAdjustedPosition({ top: newTop, left: newLeft });
  }, [isVisible, position]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            onSelect(filteredCommands[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, selectedIndex, filteredCommands, onSelect, onClose]);

  if (!isVisible || filteredCommands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg backdrop-blur-md min-w-64 max-w-80 transition-all duration-150 ease-out glass-strong"
      style={{
        top: adjustedPosition.top,
        left: adjustedPosition.left,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.95)',
        zIndex: 99999,
      }}
    >
      <div className="p-2">
        <div className="text-xs font-medium text-[var(--color-flist-text-muted)] px-2 py-1 mb-1 uppercase tracking-wide">
          Blocks
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map((command, index) => {
            const Icon = command.icon;
            return (
              <button
                key={command.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  index === selectedIndex
                    ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] border border-[var(--color-flist-primary)]"
                    : "text-[var(--color-flist-text-primary)] hover:bg-[var(--color-flist-surface-hover)] border border-transparent"
                }`}
                onClick={() => onSelect(command)}
              >
                <Icon
                  size={16}
                  className={`${
                    index === selectedIndex
                      ? "text-[var(--color-flist-primary)]"
                      : "text-[var(--color-flist-text-muted)]"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {command.title}
                  </div>
                  <div className="text-xs text-[var(--color-flist-text-muted)] truncate">
                    {command.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 