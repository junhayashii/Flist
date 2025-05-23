import { useState, useEffect, useRef } from "react";

export default function BlockEditor() {
  const [blocks, setBlocks] = useState([
    { id: `tmp-${Date.now()}`, html: "", type: "text" },
  ]);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [focusBlockId, setFocusBlockId] = useState(null);
  const blockRefs = useRef({});

  useEffect(() => {
    if (editingBlockId && blockRefs.current[editingBlockId]) {
      const el = blockRefs.current[editingBlockId];
      el.focus();

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [editingBlockId]);

  useEffect(() => {
    if (focusBlockId && blockRefs.current[focusBlockId]) {
      blockRefs.current[focusBlockId].focus();
      setFocusBlockId(null);
    }
  }, [blocks]);

  useEffect(() => {
    const fetchBlocks = async () => {
      const res = await fetch("http://127.0.0.1:8000/api/blocks/");
      const data = await res.json();
      setBlocks(data);
    };
    fetchBlocks();
  }, []);

  const isEmptyBlock = (el) => el?.textContent.trim() === "";

  const isCursorAtStart = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    return range.startOffset === 0 && range.endOffset === 0;
  };

  const saveBlock = async (block) => {
    const res = await fetch("http://127.0.0.1:8000/api/blocks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(block),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("保存失敗", data);
      throw new Error("保存に失敗しました");
    }

    if (data.type === "task" || data.type === "task-done") {
      await syncTaskWithBlock(data);
    }
    return data;
  };

  const handleInput = async (e, id) => {
    const html = e.target.innerText;
    console.log("handleInput: 入力内容", html);

    let updatedBlocks = blocks.map((block) =>
      block.id === id ? { ...block, html, type: getBlockType(html) } : block
    );
    setBlocks(updatedBlocks);

    let updatedBlock = updatedBlocks.find((b) => b.id === id);
    console.log("handleInput: 更新対象ブロック", updatedBlock);

    const isNew =
      typeof updatedBlock.id === "string" && updatedBlock.id.startsWith("tmp-");

    if (isNew) {
      const saved = await saveBlock(updatedBlock);
      console.log("handleInput: 保存後ブロック", saved);
      updatedBlock = saved;
      updatedBlocks = updatedBlocks.map((b) => (b.id === id ? saved : b));
      setBlocks(updatedBlocks);

      // 保存後、typeがtask系ならTaskに同期する
      if (saved.type === "task" || saved.type === "task-done") {
        await syncTaskWithBlock(saved);
      }
    } else {
      await updateBlock(updatedBlock);

      if (updatedBlock.type === "task" || updatedBlock.type === "task-done") {
        await syncTaskWithBlock(updatedBlock);
      }
    }
  };

  const syncTaskWithBlock = async (block) => {
    const label = block.html.replace(/^- \[[ x]\] /, "").trim();
    const taskPayload = {
      block: block.id,
      title: label,
      is_done: block.type === "task-done",
    };
    console.log("syncTaskWithBlock: taskPayload", taskPayload);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/tasks/?block=${block.id}`
      );
      const existingTasks = await res.json();
      console.log("syncTaskWithBlock: 既存タスク", existingTasks);

      if (existingTasks.length > 0) {
        console.log("既存タスクがあるため更新:", existingTasks[0]);
        await fetch(`http://127.0.0.1:8000/api/tasks/${existingTasks[0].id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskPayload),
        });
      } else {
        console.log("新規タスクとして保存:", taskPayload);
        await fetch("http://127.0.0.1:8000/api/tasks/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskPayload),
        });
      }
    } catch (err) {
      console.error("タスク同期エラー:", err);
    }
  };

  const handleToggleDone = async (blockId) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              type: block.type === "task-done" ? "task" : "task-done",
              html:
                (block.type === "task-done" ? "- [ ] " : "- [x] ") +
                block.html.replace(/^- \[[ x]\] /, ""),
            }
          : block
      )
    );

    const updatedBlock = blocks.find((b) => b.id === blockId);
    if (!updatedBlock) return;

    const isDone = updatedBlock.type === "task-done";
    const newType = isDone ? "task" : "task-done";
    const newPrefix = isDone ? "- [ ] " : "- [x] ";
    const newContent = updatedBlock.html.replace(/^- \[[ x]\] /, "");
    const toggledBlock = {
      ...updatedBlock,
      type: newType,
      html: newPrefix + newContent,
    };

    try {
      await updateBlock(toggledBlock);
    } catch (error) {
      console.error("タスク切替失敗:", error);
    }
  };

  const getBlockType = (text) => {
    if (text.startsWith("- [ ] ")) return "task";
    if (text.startsWith("- [x] ")) return "task-done";
    return "text";
  };

  const handleKeyDown = async (e, block, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
      const currentIndex = sortedBlocks.findIndex((b) => b.id === block.id);
      const currentOrder = sortedBlocks[currentIndex]?.order ?? 0;
      const nextOrder = sortedBlocks[currentIndex + 1]?.order;
      const newOrder =
        nextOrder !== undefined
          ? Math.floor((currentOrder + nextOrder) / 2)
          : currentOrder + 1;

      const newBlock = {
        id: `tmp-${Date.now()}`,
        html: "",
        type: "text",
        order: newOrder,
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

        // ブロックIDが一時的（保存されてない）ならAPIを呼ばない
        const isTemp =
          typeof deleteBlockId === "string" && deleteBlockId.startsWith("tmp-");

        if (!isTemp) {
          try {
            const existingTaskRes = await fetch(
              `http://127.0.0.1:8000/api/tasks/?block=${deleteBlockId}`
            );
            if (existingTaskRes.ok) {
              const existingTasks = await existingTaskRes.json();
              if (existingTasks.length > 0) {
                await fetch(
                  `http://127.0.0.1:8000/api/tasks/${existingTasks[0].id}/`,
                  { method: "DELETE" }
                );
              }
            } else {
              console.warn(
                "task fetch failed during delete:",
                await existingTaskRes.text()
              );
            }
          } catch (err) {
            console.error("タスク削除エラー:", err);
          }

          // Blockは後で削除する
          await fetch(`http://127.0.0.1:8000/api/blocks/${deleteBlockId}/`, {
            method: "DELETE",
          });
        }

        // フォーカスの移動
        if (index > 0) {
          const prevBlockId = blocks[index - 1].id;
          setEditingBlockId(prevBlockId);
        } else if (newBlocks.length > 0) {
          setEditingBlockId(newBlocks[0].id);
        }
      }
    }
  };

  const updateBlock = async (block) => {
    await fetch(`http://127.0.0.1:8000/api/blocks/${block.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(block),
    });

    if (block.type === "task" || block.type === "task-done") {
      const label = block.html.replace(/^- \[[ x]\] /, "").trim();
      const taskPayload = {
        block: block.id,
        title: label,
        is_done: block.type === "task-done",
      };

      const existingTaskRes = await fetch(
        `http://127.0.0.1:8000/api/tasks/?block=${block.id}`
      );
      const existingTasks = await existingTaskRes.json();

      if (existingTasks.length > 0) {
        await fetch(`http://127.0.0.1:8000/api/tasks/${existingTasks[0].id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskPayload),
        });
      } else {
        await fetch(`http://127.0.0.1:8000/api/tasks/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskPayload),
        });
      }
    }
  };

  return (
    <div className="space-y-2 p-4 bg-gray-50 rounded shadow">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block, index) => {
          const isEditing = editingBlockId === block.id;
          const isTask = block.type === "task" || block.type === "task-done";
          const isDone = block.type === "task-done";

          if (isTask && !isEditing) {
            const label = block.html.replace(/^- \[[ x]\] /, "");
            return (
              <div
                key={`view-${block.id}`}
                className="flex items-center space-x-2 px-2 py-1 bg-white border rounded"
                onClick={() => setEditingBlockId(block.id)}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => handleToggleDone(block.id)}
                />
                <span className={isDone ? "line-through text-gray-500" : ""}>
                  {label}
                </span>
              </div>
            );
          }

          return (
            <div
              key={`edit-${block.id}`}
              id={`block-${block.id}`}
              contentEditable
              suppressContentEditableWarning
              className="border px-2 py-1 rounded bg-white outline-none focus:ring-2 ring-blue-400"
              onFocus={() => setEditingBlockId(block.id)}
              onBlur={() => setEditingBlockId(null)}
              onInput={(e) => handleInput(e, block.id)}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
              ref={(el) => {
                if (el) {
                  blockRefs.current[block.id] = el;
                  if (el.innerText !== block.html) {
                    el.innerText = block.html;
                  }
                }
              }}
            />
          );
        })}
    </div>
  );
}
