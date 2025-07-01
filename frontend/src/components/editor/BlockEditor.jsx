import { useState, useEffect, useRef } from "react";
import SortableItem from "./SortableItem";
import useBlocks from "../../hooks/useBlocks";
import { useBlockEditorKeyDown } from "../../hooks/useBlockEditorKeyDown";
import { moveCaretToClosestXAndLine } from "../../utils/caret";
import {
  handleInput as handleBlockInput,
  handleBlur as handleBlockBlur,
  handleToggleDone as toggleDone,
} from "../../utils/blockHandlers";
import renderBlock from "../blocks/renderBlock";
import { useClickOutsideBlur } from "../../hooks/useClickOutsideBlur";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

export default function BlockEditor({
  listId,
  parentBlockId,
  onSelectedBlock,
  selectedBlockId,
  selectedBlock,
  onBlocksUpdate,
}) {
  const { blocks, setBlocks, loadBlocks, saveBlock, updateBlock, deleteBlock } =
    useBlocks(listId, parentBlockId);

  const [editingBlockId, setEditingBlockId] = useState(null);
  const [focusBlockId, setFocusBlockId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activeMenuBlockId, setActiveMenuBlockId] = useState(null);
  const [isSlashMenuVisible, setIsSlashMenuVisible] = useState(false);
  const blockRefs = useRef({});
  const caretX = useRef(null);
  const caretToStart = useRef(false);

  useEffect(() => {
    loadBlocks();
  }, [listId, parentBlockId]);

  useEffect(() => {
    if (onBlocksUpdate) {
      onBlocksUpdate(blocks);
    }
  }, [blocks, onBlocksUpdate]);

  useEffect(() => {
    const handleScrollToBlock = (event) => {
      const { blockId } = event.detail;
      const blockElement = document.getElementById(`block-${blockId}`);
      if (blockElement) {
        blockElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        blockElement.classList.add('ring-2', 'ring-[var(--color-flist-accent)]', 'ring-opacity-50');
        setTimeout(() => {
          blockElement.classList.remove('ring-2', 'ring-[var(--color-flist-accent)]', 'ring-opacity-50');
        }, 2000);
      }
    };

    window.addEventListener('scrollToBlock', handleScrollToBlock);
    return () => {
      window.removeEventListener('scrollToBlock', handleScrollToBlock);
    };
  }, []);

  useEffect(() => {
    if (focusBlockId && blockRefs.current[focusBlockId]) {
      const el = blockRefs.current[focusBlockId];
      const block = blocks.find((b) => b.id === focusBlockId);
      if (!block) return;

      requestAnimationFrame(() => {
        setEditingBlockId(focusBlockId);
        el.focus();

        const selection = window.getSelection();

        if (caretX.current !== null) {
          moveCaretToClosestXAndLine(
            el,
            caretX.current,
            el.getBoundingClientRect().top,
            "down"
          );
        } else {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(caretToStart.current);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        caretToStart.current = false;
        caretX.current = null;
      });

      setFocusBlockId(null);
    }
  }, [blocks, focusBlockId, editingBlockId]);

  useEffect(() => {
    if (selectedBlock?.id) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === selectedBlock.id ? { ...b, ...selectedBlock } : b
        )
      );
    }
  }, [selectedBlock]);

  useClickOutsideBlur({
    editingBlockId,
    blocks,
    blockRefs,
    handleBlockBlur,
    setEditingBlockId,
    setBlocks,
    saveBlock,
    updateBlock,
  });

  const { handleKeyDown } = useBlockEditorKeyDown({
    blocks,
    setBlocks,
    blockRefs,
    setEditingBlockId,
    setFocusBlockId,
    updateBlock,
    saveBlock,
    deleteBlock,
    selectedBlockId,
    onSelectedBlock,
    moveCaretToClosestXAndLine,
    caretX,
    caretToStart,
    isSlashMenuVisible,
  });

  const handleBlockClick = (blockId) => {
    setEditingBlockId(blockId);
    setFocusBlockId(blockId);

    const clicked = blocks.find((b) => b.id === blockId);
    if (
      clicked?.type === "task" ||
      clicked?.type === "task-done" ||
      clicked?.type === "note"
    ) {
      onSelectedBlock?.(clicked);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      const updated = newBlocks.map((b, i) => ({ ...b, order: i * 100 }));
      setBlocks(updated);
      updated.forEach((b) => updateBlock?.(b));
    }
  };

  // 新しいブロックを追加する関数
  const handleAddBlock = (index) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "text",
      html: "",
      order: (index + 0.5) * 100,
      list: listId,
      parent: parentBlockId,
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    
    // 順序を再計算
    const updated = newBlocks.map((b, i) => ({ ...b, order: i * 100 }));
    setBlocks(updated);
    
    // 新しいブロックを保存
    saveBlock?.(newBlock);
    
    // 新しいブロックにフォーカス
    setTimeout(() => {
      setFocusBlockId(newBlock.id);
    }, 100);
  };

  // ブロックを削除する関数
  const handleDeleteBlock = (blockId) => {
    if (!confirm("このブロックを削除しますか？")) return;
    
    const newBlocks = blocks.filter(b => b.id !== blockId);
    setBlocks(newBlocks);
    
    // 削除されたブロックを削除
    deleteBlock?.(blockId);
  };

  // ブロックを複製する関数
  const handleDuplicateBlock = (block, index) => {
    const duplicatedBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: (index + 0.5) * 100,
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicatedBlock);
    
    // 順序を再計算
    const updated = newBlocks.map((b, i) => ({ ...b, order: i * 100 }));
    setBlocks(updated);
    
    // 複製されたブロックを保存
    saveBlock?.(duplicatedBlock);
  };

  const activeBlock = activeId ? blocks.find(block => block.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`space-y-1 p-4 bg-white/70 backdrop-blur rounded-xl ${blocks.length > 0 ? 'shadow-sm' : ''}`}>
          {blocks.length > 0 ? (
            blocks
              .sort((a, b) => a.order - b.order)
              .map((block, index) => (
                <SortableItem
                  key={block.id}
                  block={block}
                  index={index}
                  onAddBlock={handleAddBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onDuplicateBlock={handleDuplicateBlock}
                  onMenuOpen={setActiveMenuBlockId}
                  activeMenuBlockId={activeMenuBlockId}
                  renderBlock={(params) =>
                    renderBlock({
                      block,
                      index,
                      blocks,
                      editingBlockId,
                      selectedBlockId,
                      blockRefs,
                      handleBlockClick,
                      handleToggleDone: toggleDone,
                      handleBlur: handleBlockBlur,
                      handleKeyDown,
                      handleInput: handleBlockInput,
                      setEditingBlockId,
                      setBlocks,
                      saveBlock,
                      updateBlock,
                      setIsSlashMenuVisible,
                      ...params,
                    })
                  }
                />
              ))
          ) : (
            // 空の状態のプラスボタン
            <div className="relative group">
              <div className="absolute -left-12 top-0 bottom-0 w-12 flex items-center justify-center">
                <button
                  onClick={() => handleAddBlock(0)}
                  className="p-1 rounded-md hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)] transition-colors"
                  title="Add first block"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="min-h-[2rem] flex items-center justify-center text-[var(--color-flist-muted)] text-sm">
                Click the + button to add your first block
              </div>
            </div>
          )}
        </div>
      </SortableContext>
      
      <DragOverlay
        modifiers={[
          ({ transform }) => ({
            ...transform,
            x: transform.x - 280,
            y: transform.y - 20,
          }),
        ]}
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeBlock ? (
          <div className="bg-white shadow-lg border border-[var(--color-flist-accent)] rounded-lg p-3 opacity-90">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[var(--color-flist-accent)] rounded-full"></div>
              <span className="text-sm text-[var(--color-flist-dark)] truncate max-w-48">
                {activeBlock.html ? 
                  activeBlock.html.replace(/^#+\s|^- \[[ xX]?\]\s|^- \s|^> \s|^\[\[|\]\]$/, "").substring(0, 40) || "Empty block"
                  : "Empty block"
                }
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
