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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function BlockEditor({
  listId,
  parentBlockId,
  onSelectedBlock,
  selectedBlockId,
  selectedBlock,
}) {
  const { blocks, setBlocks, loadBlocks, saveBlock, updateBlock, deleteBlock } =
    useBlocks(listId, parentBlockId);

  const [editingBlockId, setEditingBlockId] = useState(null);
  const [focusBlockId, setFocusBlockId] = useState(null);
  const blockRefs = useRef({});
  const caretX = useRef(null);
  const caretToStart = useRef(false);

  useEffect(() => {
    loadBlocks();
  }, [listId, parentBlockId]);

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
  });

  const handleBlockClick = (blockId) => {
    setEditingBlockId(blockId);
    setFocusBlockId(blockId);
  };

  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      const updated = newBlocks.map((b, i) => ({ ...b, order: i * 100 }));
      setBlocks(updated);
      updated.forEach((b) => updateBlock?.(b));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1 p-4 bg-white/70 backdrop-blur rounded-xl shadow-sm">
          {blocks
            .sort((a, b) => a.order - b.order)
            .map((block, index) => (
              <SortableItem
                key={block.id}
                block={block}
                index={index}
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
                    ...params,
                  })
                }
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
