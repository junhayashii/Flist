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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!editingBlockId) return;
      const el = blockRefs.current[editingBlockId];
      if (!el) return;

      // クリックした場所が現在のブロック内でなければ handleBlur を呼ぶ
      if (!el.contains(e.target)) {
        const block = blocks.find((b) => b.id === editingBlockId);
        if (block) {
          handleBlur(block);
          setEditingBlockId(null); // 編集モード解除
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingBlockId, blocks]);

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

    const updatedBlock = {
      ...block,
      html,
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

    // バレットリストの場合は、マークダウン記法を保持
    let finalHtml = html;
    if (block.type === "bullet" && !html.startsWith("- ")) {
      finalHtml = `- ${html}`;
    } else if (block.type === "heading1" && !html.startsWith("# ")) {
      finalHtml = `# ${html}`;
    } else if (block.type === "heading2" && !html.startsWith("## ")) {
      finalHtml = `## ${html}`;
    } else if (block.type === "heading3" && !html.startsWith("### ")) {
      finalHtml = `### ${html}`;
    }

    if (finalHtml === block.html && correctedType === block.type) return;
    const updatedBlock = {
      ...block,
      html: finalHtml,
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

  function moveCaretToClosestXAndLine(targetEl, caretX, currentTop, direction) {
    const walker = document.createTreeWalker(targetEl, NodeFilter.SHOW_TEXT);
    let bestNode = null;
    let bestOffset = 0;
    let minDiff = Infinity;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (let i = 0; i <= node.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i);
        const rects = range.getClientRects();
        if (rects.length === 0) continue;
        const rect = rects[0];

        const isCorrectLine =
          (direction === "down" && rect.top > currentTop + 2) ||
          (direction === "up" && rect.bottom < currentTop - 2);
        if (!isCorrectLine) continue;

        const diff = Math.abs(rect.left - caretX);
        if (diff < minDiff) {
          minDiff = diff;
          bestNode = node;
          bestOffset = i;
        }
      }
    }

    const sel = window.getSelection();
    const range = document.createRange();
    if (bestNode != null) {
      range.setStart(bestNode, bestOffset);
    } else {
      range.selectNodeContents(targetEl);
      range.collapse(false); // ← fallback: 末尾
    }
    sel.removeAllRanges();
    sel.addRange(range);
  }

  const handleKeyDown = async (e, block, index) => {
    const el = blockRefs.current[block.id];
    const html = el?.innerText || "";
    const sel = window.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;

    const prevBlock = blocks[index - 1];
    const nextBlock = blocks[index + 1];

    if (["ArrowUp", "ArrowDown"].includes(e.key) && range) {
      const rect = range.getBoundingClientRect();
      caretX.current = rect.left;
      const currentTop = rect.top;

      const targetIndex = e.key === "ArrowUp" ? index - 1 : index + 1;
      const targetBlock = blocks[targetIndex];
      const targetEl = targetBlock && blockRefs.current[targetBlock.id];

      if (targetBlock) {
        e.preventDefault();

        // ✅ 即編集モードに
        if (targetBlock.id === selectedBlockId) {
          onSelectedBlock?.(targetBlock); // すでに選択されていたら開いていてOK
        }
        setEditingBlockId(targetBlock.id);
        setFocusBlockId(targetBlock.id);

        requestAnimationFrame(() => {
          const el = blockRefs.current[targetBlock.id];
          if (!el) return;

          el.focus();

          const isEditable =
            targetBlock.type === "text" ||
            targetBlock.type === "task" ||
            targetBlock.type === "task-done";

          if (isEditable) {
            moveCaretToClosestXAndLine(
              el,
              caretX.current,
              currentTop,
              e.key === "ArrowUp" ? "up" : "down"
            );
          }
        });
      }
    }

    if (e.key === "ArrowLeft" && range?.startOffset === 0 && prevBlock) {
      e.preventDefault();
      setEditingBlockId(prevBlock.id);
      setFocusBlockId(prevBlock.id);
      caretToStart.current = false;

      const moveCaret = () => {
        const prevEl = blockRefs.current[prevBlock.id];
        if (document.contains(prevEl)) {
          prevEl.focus();
          const range = document.createRange();
          range.selectNodeContents(prevEl);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          requestAnimationFrame(moveCaret);
        }
      };
      requestAnimationFrame(moveCaret);
    }

    if (
      e.key === "ArrowRight" &&
      range?.endOffset === html.length &&
      nextBlock
    ) {
      e.preventDefault();
      setEditingBlockId(nextBlock.id);
      setFocusBlockId(nextBlock.id);
      caretToStart.current = true;

      const moveCaret = () => {
        const nextEl = blockRefs.current[nextBlock.id];
        if (document.contains(nextEl)) {
          nextEl.focus();
          const range = document.createRange();
          range.selectNodeContents(nextEl);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          requestAnimationFrame(moveCaret);
        }
      };
      requestAnimationFrame(moveCaret);
    }

    // タスクが空状態でEnter or Backspace
    const isEmptyTask =
      (block.type === "task" || block.type === "task-done") &&
      /^-\s\[[ x]?\]\s*$/.test(html.trim());

    if (isEmptyTask && (e.key === "Enter" || e.key === "Backspace")) {
      e.preventDefault();
      const updatedBlock = { ...block, type: "text", html: "" };
      setBlocks((prev) =>
        prev.map((b) => (b.id === block.id ? updatedBlock : b))
      );
      setEditingBlockId(block.id);
      setFocusBlockId(block.id);
      await updateBlock(updatedBlock);
      return;
    }

    // 既存のEnter処理（ブロック追加）
    if (e.key === "Enter") {
      e.preventDefault();
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

    // 既存のBackspace処理（削除）
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
          isSelected={block.id === selectedBlockId}
        />
      );
    }

    if (editingBlockId !== block.id) {
      const text = block.html;
      switch (block.type) {
        case "heading1":
          return (
            <h1
              tabIndex={-1}
              ref={(el) => el && (blockRefs.current[block.id] = el)}
              className="text-2xl font-bold px-3 py-1 cursor-pointer"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^# /, "")}
            </h1>
          );
        case "heading2":
          return (
            <h2
              tabIndex={-1}
              ref={(el) => el && (blockRefs.current[block.id] = el)}
              className="text-xl font-semibold px-3 py-1 cursor-pointer"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^## /, "")}
            </h2>
          );
        case "heading3":
          return (
            <h3
              tabIndex={-1}
              ref={(el) => el && (blockRefs.current[block.id] = el)}
              className="text-lg font-medium px-3 py-1 cursor-pointer"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^### /, "")}
            </h3>
          );
        case "bullet":
          return (
            <li
              tabIndex={-1}
              ref={(el) => el && (blockRefs.current[block.id] = el)}
              className="list-disc ml-6 px-3 py-1 cursor-pointer"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^- /, "")}
            </li>
          );
        case "numbered":
          return (
            <li
              tabIndex={-1}
              ref={(el) => el && (blockRefs.current[block.id] = el)}
              className="list-decimal ml-6 px-3 py-1 cursor-pointer"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^\d+\. /, "")}
            </li>
          );
        case "quote":
          return (
            <blockquote
              tabIndex={-1}
              ref={(el) => el && (blockRefs.current[block.id] = el)}
              className="border-l-4 pl-4 text-gray-600 italic px-3 py-1 cursor-pointer"
              onClick={() => handleBlockClick(block.id)}
            >
              {text.replace(/^> /, "")}
            </blockquote>
          );
        case "divider":
          return (
            <hr
              tabIndex={-1}
              ref={(el) => el && (blockRefs.current[block.id] = el)}
              className="my-4 border-t border-gray-300 cursor-pointer"
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
        className={`px-3 py-2 rounded-lg bg-white outline-none whitespace-pre focus:bg-blue-50 ${
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
          if (el) {
            blockRefs.current[block.id] = el;
            if (!el.dataset.initialized) {
              // 編集モードに入る際に、マークダウン記法を保持したまま表示
              el.innerText = block.html;
              el.dataset.initialized = "true";
            }
          }
        }}
        onFocus={() => setEditingBlockId(block.id)}
        onInput={(e) => handleInput(e, block.id)}
        onBlur={(e) => {
          if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
            handleBlur(block);
          }
        }}
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
        <div className="space-y-1 p-4 bg-white/70 backdrop-blur rounded-xl shadow-sm">
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
