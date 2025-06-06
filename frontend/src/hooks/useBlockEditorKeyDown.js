// hooks/useBlockEditorKeyDown.js
export function useBlockEditorKeyDown({
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
}) {
  const isEmptyBlock = (el) => el?.textContent.trim() === "";

  const isCursorAtStart = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return false;
    const range = sel.getRangeAt(0);
    return range.startOffset === 0 && range.endOffset === 0;
  };

  const handleKeyDown = async (e, block, index) => {
    const el = blockRefs.current[block.id];
    const html = el?.innerText || "";
    const sel = window.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;

    const prevBlock = blocks[index - 1];
    const nextBlock = blocks[index + 1];

    // Arrow Up/Down
    if (["ArrowUp", "ArrowDown"].includes(e.key) && range) {
      const rect = range.getBoundingClientRect();
      caretX.current = rect.left;
      const currentTop = rect.top;

      const targetIndex = e.key === "ArrowUp" ? index - 1 : index + 1;
      const targetBlock = blocks[targetIndex];

      if (targetBlock) {
        e.preventDefault();
        if (targetBlock.id === selectedBlockId) {
          onSelectedBlock?.(targetBlock);
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

    // Arrow Left
    if (e.key === "ArrowLeft" && range?.startOffset === 0 && prevBlock) {
      e.preventDefault();
      setEditingBlockId(prevBlock.id);
      setFocusBlockId(prevBlock.id);
      caretToStart.current = false;
      requestAnimationFrame(() => {
        const prevEl = blockRefs.current[prevBlock.id];
        if (document.contains(prevEl)) {
          prevEl.focus();
          const r = document.createRange();
          r.selectNodeContents(prevEl);
          r.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
        }
      });
    }

    // Arrow Right
    if (
      e.key === "ArrowRight" &&
      range?.endOffset === html.length &&
      nextBlock
    ) {
      e.preventDefault();
      setEditingBlockId(nextBlock.id);
      setFocusBlockId(nextBlock.id);
      caretToStart.current = true;
      requestAnimationFrame(() => {
        const nextEl = blockRefs.current[nextBlock.id];
        if (document.contains(nextEl)) {
          nextEl.focus();
          const r = document.createRange();
          r.selectNodeContents(nextEl);
          r.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
        }
      });
    }

    // 空のタスクでEnter/Backspaceならtext化
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

    // Enter = 新規ブロック
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
        list: block.list,
        parent: block.parent || null,
      };
      const saved = await saveBlock(newBlock);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, saved);
      setBlocks(newBlocks);
      setFocusBlockId(saved.id);
      return;
    }

    // Backspace = 削除
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

  return { handleKeyDown };
}
