import React from "react";
import { List, ChevronRight } from "lucide-react";

export default function TableOfContents({ blocks, onHeadingClick }) {
  // 見出しブロックを抽出
  const headings = blocks
    .filter(block => 
      block.type === "heading1" || 
      block.type === "heading2" || 
      block.type === "heading3"
    )
    .map(block => {
      const level = parseInt(block.type.replace("heading", ""));
      const text = block.html.replace(/^#+\s/, "");
      return {
        id: block.id,
        level,
        text,
        block
      };
    });

  if (headings.length === 0) {
    return (
      <div className="w-[32rem] border-l border-[var(--color-flist-border)] bg-[var(--color-flist-bg)] backdrop-blur-md h-screen flex flex-col">
        <div className="flex-none p-8 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <List size={20} className="text-[var(--color-flist-muted)]" />
            <h2 className="text-lg font-medium text-[var(--color-flist-dark)]">
              Table of Contents
            </h2>
          </div>
          <div className="text-center py-12">
            <div className="text-[var(--color-flist-muted)] mb-2">
              <List size={48} className="mx-auto" />
            </div>
            <p className="text-sm text-[var(--color-flist-text-secondary)]">
              このリストには見出しがありません
            </p>
            <p className="text-xs text-[var(--color-flist-muted)] mt-1">
              # 見出し1、## 見出し2、### 見出し3 を追加してください
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getIndentClass = (level) => {
    switch (level) {
      case 1: return "ml-0";
      case 2: return "ml-4";
      case 3: return "ml-8";
      default: return "ml-0";
    }
  };

  const getHeadingStyle = (level) => {
    switch (level) {
      case 1: return "text-base font-semibold";
      case 2: return "text-sm font-medium";
      case 3: return "text-xs";
      default: return "text-sm";
    }
  };

  return (
    <div className="w-[32rem] border-l border-[var(--color-flist-border)] bg-[var(--color-flist-bg)] backdrop-blur-md h-screen flex flex-col">
      <div className="flex-none p-8 pt-10">
        <div className="flex items-center gap-2 mb-6">
          <List size={20} className="text-[var(--color-flist-muted)]" />
          <h2 className="text-lg font-medium text-[var(--color-flist-dark)]">
            Table of Contents
          </h2>
        </div>
        
        <div className="space-y-1">
          {headings.map((heading, index) => (
            <button
              key={heading.id}
              onClick={() => onHeadingClick?.(heading.block)}
              className={`w-full text-left p-2 rounded-lg hover:bg-[var(--color-flist-surface-hover)] transition-colors group ${getIndentClass(heading.level)}`}
            >
              <div className={`flex items-center gap-2 ${getHeadingStyle(heading.level)}`}>
                <ChevronRight 
                  size={12} 
                  className="text-[var(--color-flist-muted)] group-hover:text-[var(--color-flist-accent)] transition-colors" 
                />
                <span className="text-[var(--color-flist-dark)] group-hover:text-[var(--color-flist-accent)] transition-colors truncate">
                  {heading.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 