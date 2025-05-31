import { useState, useEffect, useRef } from "react";

export default function BlockEditor({
  listId,
  parentBlockId,
  onSelectedBlock,
}) {
  const [blocks, setBlocks] = useState([]);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [focusBlockId, setFocusBlockId] = useState(null);
  const blockRefs = useRef({});

  useEffect(() => {
    const fetchBlocks = async () => {
      const res = await fetch("http://127.0.0.1:8000/api/blocks/");
      const data = await res.json();

      const filtered = data.filter((b) => {
        const isTopLevel = parentBlockId == null;
        const matchesList = String(b.list) === String(listId);
        const matchesParent = String(b.parent_block) === String(parentBlockId);

        return isTopLevel
          ? matchesList &&
              (b.parent_block === null || b.parent_block === undefined)
          : matchesParent;
      });

      if (filtered.length > 0) {
        setBlocks(filtered);
      } else {
        setBlocks([
          {
            id: `tmp-${Date.now()}`,
            html: "",
            type: "text",
            order: 0,
            list: listId,
            parent: parentBlockId || null,
          },
        ]);
      }
    };

    fetchBlocks();
  }, [listId, parentBlockId]);

  useEffect(() => {
    if (focusBlockId && blockRefs.current[focusBlockId]) {
      const el = blockRefs.current[focusBlockId];
      const block = blocks.find((b) => b.id === focusBlockId);
      const isEditable =
        block?.type === "text" || editingBlockId === focusBlockId;

      if (isEditable) {
        requestAnimationFrame(() => {
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
    if (text.startsWith("- [ ] ")) return "task";
    if (text.startsWith("- [x] ")) return "task-done";
    return "text";
  };

  const saveBlock = async (block) => {
    const payload = {
      ...block,
      list: parentBlockId ? null : listId,
      parent_block: parentBlockId || null,
    };

    const res = await fetch("http://127.0.0.1:8000/api/blocks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error("保存に失敗しました");
    return data;
  };

  const updateBlock = async (block) => {
    const payload = {
      ...block,
      list: parentBlockId ? null : listId,
      parent_block: parentBlockId || null,
    };

    const res = await fetch(`http://127.0.0.1:8000/api/blocks/${block.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("更新失敗", error);
    }
  };

  const handleInput = async (e, id) => {
    const html = e.target.innerText;
    const updatedBlocks = blocks.map((b) =>
      b.id === id ? { ...b, html, type: getBlockType(html) } : b
    );
    setBlocks(updatedBlocks);

    const updatedBlock = updatedBlocks.find((b) => b.id === id);
    if (!updatedBlock.id.toString().startsWith("tmp-")) {
      await updateBlock(updatedBlock);
    }
  };

  const handleBlur = async (block) => {
    const el = blockRefs.current[block.id];
    if (!el) return;
    const html = el.innerText;

    const updatedBlock = {
      ...block,
      html,
      type: getBlockType(html),
    };

    if (String(updatedBlock.id).startsWith("tmp-")) {
      const saved = await saveBlock(updatedBlock);
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? saved : b)));
    } else {
      await updateBlock(updatedBlock);
    }
  };

  const handleKeyDown = async (e, block, index) => {
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
    }

    if (e.key === "Backspace") {
      const el = blockRefs.current[block.id];
      if (isEmptyBlock(el) && isCursorAtStart()) {
        e.preventDefault();
        if (blocks.length === 1) return;

        const deleteBlockId = block.id;
        const newBlocks = blocks.filter((b) => b.id !== deleteBlockId);
        setBlocks(newBlocks);

        if (!String(deleteBlockId).startsWith("tmp-")) {
          await fetch(`http://127.0.0.1:8000/api/blocks/${deleteBlockId}/`, {
            method: "DELETE",
          });
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

  return (
    <div className="space-y-2 p-4 bg-white/70 backdrop-blur rounded-xl shadow-sm">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block, index) => {
          const isTask = block.type === "task" || block.type === "task-done";
          const isDone = block.type === "task-done";
          const label = block.html.replace(/^- \[[ x]\] /, "");

          if (isTask && editingBlockId !== block.id) {
            return (
              <div
                key={`view-${block.id}-${index}`}
                className="flex items-center justify-between px-3 py-2 bg-white border rounded-lg hover:bg-blue-50 shadow-sm"
                onClick={() => {
                  setEditingBlockId(block.id);
                  setFocusBlockId(block.id);
                }}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => handleToggleDone(block.id)}
                  />
                  <span
                    className={
                      isDone ? "line-through text-gray-400" : "text-gray-800"
                    }
                  >
                    {label}
                  </span>
                  {block.due_date && (
                    <span className="ml-4 text-xs text-blue-500">
                      📅 {new Date(block.due_date).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectedBlock?.(block);
                  }}
                  className="text-gray-400 hover:text-blue-500"
                >
                  ▶
                </button>
              </div>
            );
          }

          return (
            <div
              key={`edit-${block.id}-${index}`}
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
        })}
    </div>
  );
}
