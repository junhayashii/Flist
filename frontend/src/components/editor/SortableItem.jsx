import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Copy, Trash2, MoreHorizontal } from "lucide-react";

export default function SortableItem({ block, index, renderBlock, onAddBlock, onDeleteBlock, onDuplicateBlock, onMenuOpen, activeMenuBlockId }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isMenuActive = activeMenuBlockId === block.id;

  const handleDelete = () => {
    onDeleteBlock?.(block.id);
    setShowMenu(false);
    onMenuOpen?.(null);
  };

  const handleDuplicate = () => {
    onDuplicateBlock?.(block, index);
    setShowMenu(false);
    onMenuOpen?.(null);
  };

  // メニュー外クリックで閉じる
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
        onMenuOpen?.(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu, onMenuOpen]);

  // 他のメニューが開いたらこのメニューを閉じる
  React.useEffect(() => {
    if (activeMenuBlockId && activeMenuBlockId !== block.id) {
      setShowMenu(false);
    }
  }, [activeMenuBlockId, block.id]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative group transition-all duration-200 ${
        isDragging ? "z-50" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 左側のホバーエリア - 6点とプラスボタンの表示エリアを拡張 */}
      <div className="absolute -left-12 top-0 bottom-0 w-12 flex items-center justify-center">
        {/* 6点ハンドルとプラスボタンのコンテナ */}
        <div className="flex items-center gap-1">
          {/* プラスボタン - 左側に配置 */}
          <div
            className={`transition-all duration-200 ${
              isHovered && !isDragging
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75"
            }`}
          >
            <button
              onClick={() => onAddBlock?.(index + 1)}
              className="p-1 rounded-md hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] transition-colors"
              title="Add block"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* ドラッグハンドル - 縦並び6点（小さく） */}
          <div
            className={`transition-all duration-200 ${
              isHovered || isDragging || isMenuActive
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75"
            }`}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setMenuPosition({
                x: rect.left + window.scrollX - 310,
                y: rect.top + window.scrollY - 95
              });
              onMenuOpen?.(block.id);
              setShowMenu(true);
            }}
          >
            <div className={`flex flex-col gap-0.5 p-1 rounded-md hover:bg-[var(--color-flist-surface-hover)] cursor-grab active:cursor-grabbing transition-colors ${
              isMenuActive ? "bg-[var(--color-flist-accent)]/20" : ""
            }`}>
              <div className="flex gap-0.5">
                <div className={`w-0.5 h-0.5 rounded-full transition-colors ${
                  isMenuActive ? "bg-[var(--color-flist-accent)]" : "bg-[var(--color-flist-muted)]"
                }`}></div>
                <div className={`w-0.5 h-0.5 rounded-full transition-colors ${
                  isMenuActive ? "bg-[var(--color-flist-accent)]" : "bg-[var(--color-flist-muted)]"
                }`}></div>
              </div>
              <div className="flex gap-0.5">
                <div className={`w-0.5 h-0.5 rounded-full transition-colors ${
                  isMenuActive ? "bg-[var(--color-flist-accent)]" : "bg-[var(--color-flist-muted)]"
                }`}></div>
                <div className={`w-0.5 h-0.5 rounded-full transition-colors ${
                  isMenuActive ? "bg-[var(--color-flist-accent)]" : "bg-[var(--color-flist-muted)]"
                }`}></div>
              </div>
              <div className="flex gap-0.5">
                <div className={`w-0.5 h-0.5 rounded-full transition-colors ${
                  isMenuActive ? "bg-[var(--color-flist-accent)]" : "bg-[var(--color-flist-muted)]"
                }`}></div>
                <div className={`w-0.5 h-0.5 rounded-full transition-colors ${
                  isMenuActive ? "bg-[var(--color-flist-accent)]" : "bg-[var(--color-flist-muted)]"
                }`}></div>
              </div>
            </div>
            {/* 6点クリック用の透明オーバーレイ */}
            <div
              {...listeners}
              className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
              style={{ pointerEvents: 'auto' }}
            />
          </div>
        </div>
      </div>

      {/* ブロックメニュー */}
      {showMenu && (
        <div
          className="fixed z-50 bg-white border border-[var(--color-flist-border)] rounded-lg shadow-lg backdrop-blur-md min-w-32"
          style={{
            top: Math.min(menuPosition.y, window.innerHeight - 120),
            left: Math.max(menuPosition.x, 10), // 左端で切れないように調整
          }}
        >
          <div className="py-1">
            <button
              onClick={handleDuplicate}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)] transition-colors"
            >
              <Copy size={14} />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* ドラッグ中のオーバーレイ */}
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--color-flist-accent)]/5 border border-[var(--color-flist-accent)] rounded-lg" />
      )}
      
      {/* メインコンテンツ */}
      <div 
        className={`transition-all duration-200 ${
          isDragging 
            ? "opacity-50" 
            : isMenuActive
            ? "bg-[var(--color-flist-accent)]/5 rounded-lg border border-[var(--color-flist-accent)]/30"
            : "hover:bg-[var(--color-flist-surface-hover)]/50 rounded-lg"
        }`}
      >
        <div className="min-w-0">
          {renderBlock(block, index)}
        </div>
      </div>
    </div>
  );
}
