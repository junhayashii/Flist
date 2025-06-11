import React, { useState, useEffect, useRef } from "react";
import BlockEditor from "./editor/BlockEditor";
import { updateBlockDueDate, updateBlock } from "../api/blocks";

export default function BlockDetails({ block, onClose, onUpdate }) {
  const [localBlock, setLocalBlock] = useState(block);
  const titleRef = useRef(null);

  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  const handleDueDateChange = async (e) => {
    const newDueDate = e.target.value;
    const updatedBlock = { ...localBlock, due_date: newDueDate };

    try {
      await updateBlockDueDate(block.id, newDueDate);
      setLocalBlock(updatedBlock);
      onUpdate?.(updatedBlock);
    } catch (err) {
      console.error("期日更新失敗:", err);
    }
  };

  const handleTitleBlur = async () => {
    if (!titleRef.current) return;

    const newTitle = titleRef.current.innerText.trim();
    if (!newTitle) return;

    let newHtml;
    if (localBlock.type === "note") {
      newHtml = `[[${newTitle}]]`;
    } else {
      // task, task-done
      const prefix = localBlock.type === "task-done" ? "- [x] " : "- [ ] ";
      newHtml = prefix + newTitle;
    }

    const updatedBlock = { ...localBlock, html: newHtml };

    try {
      await updateBlock(updatedBlock);
      setLocalBlock(updatedBlock);
      onUpdate?.(updatedBlock); // 即時反映
    } catch (err) {
      console.error("タイトル更新失敗:", err);
    }
  };

  const getTitleText = () => {
    if (localBlock.type === "note") {
      return localBlock.html?.match(/\[\[(.+?)\]\]/)?.[1] || "(無題ノート)";
    }
    return localBlock.html?.replace(/^- \[[ xX]?\] /, "") || "(無題タスク)";
  };

  return (
    <div className="w-[32rem] border-l border-[var(--color-flist-border)] bg-[var(--color-flist-bg)] p-8 pt-10 relative text-[var(--color-flist-dark)]">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
      >
        ✕
      </button>

      {/* タイトル */}
      <h2
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleTitleBlur}
        className="text-lg font-semibold mb-6 outline-none border-b border-transparent focus:border-blue-400"
      >
        {getTitleText()}
      </h2>

      {/* タスク用の期日入力 */}
      {localBlock.type !== "note" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            期日
          </label>
          <div className="flex items-center gap-2 bg-white rounded border border-gray-300 px-3 py-2 shadow-sm">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <input
              type="date"
              className="flex-1 text-sm bg-transparent focus:outline-none"
              value={localBlock.due_date?.slice(0, 10) || ""}
              onChange={handleDueDateChange}
            />
          </div>
        </div>
      )}

      <h3 className="text-sm font-medium mb-2">メモ</h3>
      <BlockEditor parentBlockId={block.id} listId={block.list} />
    </div>
  );
}
