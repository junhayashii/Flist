export function useBlockEditorKeyDown({
  blocks,
  setBlocks,
  blockRefs,
  setEditingBlockId,
  setFocusBlockId,
  updateBlock,
  saveBlock,
  deleteBlock,
  onSelectedBlock,
  moveCaretToClosestXAndLine,
  caretX,
  caretToStart,
  isSlashMenuVisible = false,
}) {
  const handleKeyDown = async (e, block, index) => {
    const el = blockRefs.current[block.id];
    const html = el?.innerText || "";
    const sel = window.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;

    const prevBlock = blocks[index - 1];
    const nextBlock = blocks[index + 1];

    // スラッシュメニューが開いている時は矢印キーでのブロック移動を無効にする
    if (isSlashMenuVisible && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
      return;
    }

    // --- Shift+Enter = <br> 改行挿入
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      if (!range) return;

      const spacer = document.createTextNode("\u200B");
      const br = document.createElement("br");

      range.deleteContents();
      range.insertNode(spacer);
      range.insertNode(br);

      const newRange = document.createRange();
      newRange.setStartAfter(spacer);
      newRange.setEndAfter(spacer);
      sel.removeAllRanges();
      sel.addRange(newRange);
      return;
    }

    // --- 通常のEnter = 新規ブロック挿入
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

    // --- Arrow Up/Down 移動
    if (["ArrowUp", "ArrowDown"].includes(e.key) && range) {
      const rect = range.getBoundingClientRect();
      caretX.current = rect.left;
      const currentTop = rect.top;
      const targetIndex = e.key === "ArrowUp" ? index - 1 : index + 1;
      const targetBlock = blocks[targetIndex];

      if (targetBlock) {
        e.preventDefault();
        onSelectedBlock?.(targetBlock);
        setEditingBlockId(targetBlock.id);
        setFocusBlockId(targetBlock.id);

        requestAnimationFrame(() => {
          const el = blockRefs.current[targetBlock.id];
          if (!el) return;
          el.focus();

          const isEditable = ["text", "task", "task-done", "note", "heading1", "heading2", "heading3", "bullet", "numbered", "quote"].includes(
            targetBlock.type
          );

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

    // --- Arrow Left
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
          sel.removeAllRanges();
          sel.addRange(r);
        }
      });
    }

    // --- Arrow Right
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
          sel.removeAllRanges();
          sel.addRange(r);
        }
      });
    }

    // --- 空のタスクをテキストに戻す
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

    // --- Backspace 処理
    if (e.key === "Backspace") {
      if (!range || !el) return;

      const isAtStart =
        range.startOffset === 0 &&
        range.endOffset === 0 &&
        (range.startContainer === el || range.startContainer === el.firstChild);

      const htmlContent = el.innerHTML.replace(/\u200B/g, "").trim();
      const isTrulyEmpty = htmlContent === "" || htmlContent === "<br>";

      // ブロック削除
      if (isAtStart && isTrulyEmpty) {
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
        return;
      }

      // <br> の削除
      const container = range.startContainer;
      const offset = range.startOffset;

      if (
        container.nodeType === Node.ELEMENT_NODE &&
        container.childNodes[offset - 1]?.nodeName === "BR"
      ) {
        e.preventDefault();
        container.childNodes[offset - 1].remove();
        return;
      }

      if (
        container.nodeType === Node.TEXT_NODE &&
        container.previousSibling?.nodeName === "BR" &&
        offset === 0
      ) {
        e.preventDefault();
        container.previousSibling.remove();
        return;
      }
    }
  };

  return { handleKeyDown };
}
