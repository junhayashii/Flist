import { useState, useEffect, useRef } from "react";
import TaskBlock from "./TaskBlock";
import useBlocks from "../hooks/useBlocks";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

function SortableItem({ block, index, renderBlock }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex gap-2 group"
    >
      <div
        {...listeners}
        className="cursor-grab text-gray-400 opacity-0 group-hover:opacity-100 p-1"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-1">{renderBlock(block, index)}</div>
    </div>
  );
}

export default function BlockEditor({
  listId,
  parentBlockId,
  onSelectedBlock,
}) {
  const { blocks, setBlocks, loadBlocks, saveBlock, updateBlock, deleteBlock } =
    useBlocks(listId, parentBlockId);

  const [editingBlockId, setEditingBlockId] = useState(null);
  const [focusBlockId, setFocusBlockId] = useState(null);
  const blockRefs = useRef({});

  useEffect(() => {
    loadBlocks();
  }, [listId, parentBlockId]);

  useEffect(() => {
    if (focusBlockId && blockRefs.current[focusBlockId]) {
      const el = blockRefs.current[focusBlockId];
      const block = blocks.find((b) => b.id === focusBlockId);
      const isEditable =
        block?.type === "text" ||
        block?.type === "task" ||
        block?.type === "task-done" ||
        editingBlockId === focusBlockId;

      if (isEditable) {
        requestAnimationFrame(() => {
          setEditingBlockId(focusBlockId);
          el.focus();
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        });
      }

      setFocusBlockId(null);
    }
  }, [blocks, focusBlockId, editingBlockId]);

  const isEmptyBlock = (el) => el?.textContent.trim() === "";

  const isCursorAtStart = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return false;
    const range = sel.getRangeAt(0);
    return range.startOffset === 0 && range.endOffset === 0;
  };

  const getBlockType = (text) => {
    const trimmed = text.trim();
    if (trimmed.startsWith("- [ ] ")) return "task";
    if (trimmed.startsWith("- [x] ")) return "task-done";
    if (trimmed.startsWith("### ")) return "heading3";
    if (trimmed.startsWith("## ")) return "heading2";
    if (trimmed.startsWith("# ")) return "heading1";
    if (/^\d+\.\s/.test(trimmed)) return "numbered";
    if (trimmed.startsWith("- ")) return "bullet";
    if (trimmed.startsWith("> ")) return "quote";
    if (trimmed === "---") return "divider";
    return "text";
  };

  const handleInput = async (e, id) => {
    const html = e.target.innerText;
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const newType = getBlockType(html);
    const shouldUpdateType =
      block.type === "text" && (newType === "task" || newType === "task-done");
    const updatedBlock = {
      ...block,
      html,
      type: shouldUpdateType ? newType : block.type,
    };
    setBlocks((prev) => prev.map((b) => (b.id === id ? updatedBlock : b)));
    if (!id.toString().startsWith("tmp-")) {
      await updateBlock(updatedBlock);
    }
  };

  const handleBlur = async (block) => {
    const el = blockRefs.current[block.id];
    if (!el) return;
    const html = el.innerText.trim();
    const newType = getBlockType(html);
    const correctedType =
      (block.type === "task" || block.type === "task-done") &&
      newType === "text"
        ? block.type
        : newType;
    if (html === block.html && correctedType === block.type) return;
    const updatedBlock = {
      ...block,
      html,
      type: correctedType,
    };
    if (String(block.id).startsWith("tmp-")) {
      const saved = await saveBlock(updatedBlock);
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? saved : b)));
    } else {
      await updateBlock(updatedBlock);
      setBlocks((prev) =>
        prev.map((b) => (b.id === block.id ? updatedBlock : b))
      );
    }
  };

  const handleKeyDown = async (e, block, index) => {
    const el = blockRefs.current[block.id];
    const html = el?.innerText || "";
    if (e.key === "Enter") {
      e.preventDefault();
      const isEmptyTask =
        (block.type === "task" || block.type === "task-done") &&
        /^-\s\[\s?\]\s*$/.test(html.trim());
      if (isEmptyTask) {
        const updatedBlock = { ...block, type: "text", html: "" };
        setBlocks((prev) =>
          prev.map((b) => (b.id === block.id ? updatedBlock : b))
        );
        setEditingBlockId(block.id);
        setFocusBlockId(block.id);
        await updateBlock(updatedBlock);
        return;
      }
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const currentOrder = sorted[index]?.order ?? 0;
      const nextOrder = sorted[index + 1]?.order;
      const newOrder =
        nextOrder !== undefined
          ? (currentOrder + nextOrder) / 2
          : currentOrder + 1;
      const newBlock = {
        id: `tmp-${Date.now()}`,
        html: "",
        type: "text",
        order: newOrder,
        list: listId,
        parent: parentBlockId || null,
      };
      const saved = await saveBlock(newBlock);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, saved);
      setBlocks(newBlocks);
      setFocusBlockId(saved.id);
      return;
    }

    if (e.key === "Backspace") {
      if (isEmptyBlock(el) && isCursorAtStart()) {
        e.preventDefault();
        if (blocks.length === 1) return;
        const deleteBlockId = block.id;
        const newBlocks = blocks.filter((b) => b.id !== deleteBlockId);
        setBlocks(newBlocks);
        if (!String(deleteBlockId).startsWith("tmp-")) {
          await deleteBlock(deleteBlockId);
        }
        const prevBlock = blocks[index - 1];
        if (prevBlock) {
          setEditingBlockId(prevBlock.id);
          setFocusBlockId(prevBlock.id);
        } else if (newBlocks.length > 0) {
          setEditingBlockId(newBlocks[0].id);
          setFocusBlockId(newBlocks[0].id);
        }
      }
    }
  };

  const handleToggleDone = async (blockId) => {
    const updatedBlocks = blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            type: block.type === "task-done" ? "task" : "task-done",
            html:
              (block.type === "task-done" ? "- [ ] " : "- [x] ") +
              block.html.replace(/^- \[[ x]\] /, ""),
          }
        : block
    );
    setBlocks(updatedBlocks);
    const updatedBlock = updatedBlocks.find((b) => b.id === blockId);
    if (updatedBlock) await updateBlock(updatedBlock);
  };

  const handleBlockClick = (blockId) => {
    setEditingBlockId(blockId);
    setFocusBlockId(blockId);
  };

  const renderBlock = (block, index) => {
    const isTask = block.type === "task" || block.type === "task-done";
    const isEditing = editingBlockId === block.id;
    if (isTask) {
      return (
        <TaskBlock
          key={`task-${block.id}`}
          block={block}
          onClick={() => handleBlockClick(block.id)}
          onToggle={() => handleToggleDone(block.id)}
          onOpenDetail={onSelectedBlock}
          isEditable={isEditing}
          onBlur={() => handleBlur(block)}
          editableRef={(el) => {
            if (el) blockRefs.current[block.id] = el;
          }}
          onKeyDown={(e) => handleKeyDown(e, block, index)}
        />
      );
    }
    if (editingBlockId !== block.id) {
      const text = block.html;
      switch (block.type) {
        case "heading1":
          return (
            <h1
              className="text-2xl font-bold px-3 py-1 cursor-pointer"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^# /, "")}
            </h1>
          );
        case "heading2":
          return (
            <h2
              className="text-xl font-semibold px-3 py-1"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^## /, "")}
            </h2>
          );
        case "heading3":
          return (
            <h3
              className="text-lg font-medium px-3 py-1"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^### /, "")}
            </h3>
          );
        case "bullet":
          return (
            <li
              className="list-disc ml-6 px-3 py-1"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^- /, "")}
            </li>
          );
        case "numbered":
          return (
            <li
              className="list-decimal ml-6 px-3 py-1"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^\d+\. /, "")}
            </li>
          );
        case "quote":
          return (
            <blockquote
              className="border-l-4 pl-4 text-gray-600 italic px-3 py-1"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^> /, "")}
            </blockquote>
          );
        case "divider":
          return (
            <hr
              className="my-4 border-t border-gray-300"
              onClick={() => handleBlockClick(block.id)}
            />
          );
      }
    }
    return (
      <div
        key={`edit-${block.id}`}
        id={`block-${block.id}`}
        contentEditable
        suppressContentEditableWarning
        className="border px-3 py-2 rounded-lg bg-white shadow-sm outline-none focus:ring-2 ring-blue-400"
        ref={(el) => {
          if (el) {
            blockRefs.current[block.id] = el;
            if (!el.dataset.initialized) {
              el.innerText = block.html;
              el.dataset.initialized = "true";
            }
          }
        }}
        onFocus={() => setEditingBlockId(block.id)}
        onInput={(e) => handleInput(e, block.id)}
        onBlur={() => handleBlur(block)}
        onKeyDown={(e) => handleKeyDown(e, block, index)}
      />
    );
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
        <div className="space-y-2 p-4 bg-white/70 backdrop-blur rounded-xl shadow-sm">
          {blocks
            .sort((a, b) => a.order - b.order)
            .map((block, index) => (
              <SortableItem
                key={block.id}
                block={block}
                index={index}
                renderBlock={renderBlock}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
