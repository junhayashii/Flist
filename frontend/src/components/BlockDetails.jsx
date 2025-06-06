import React, { useState, useEffect } from "react";
import BlockEditor from "./editor/BlockEditor";
import { updateBlockDueDate } from "../api/blocks";

export default function BlockDetails({ block, onClose, onUpdate }) {
  const [localBlock, setLocalBlock] = useState(block);

  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  const handleDueDateChange = async (e) => {
    const newDueDate = e.target.value;
    const updatedBlock = { ...localBlock, due_date: newDueDate };

    try {
      await updateBlockDueDate(block.id, newDueDate);
      setLocalBlock(updatedBlock);
      onUpdate?.(updatedBlock); // ← 通知
    } catch (err) {
      console.error("期日更新失敗:", err);
    }
  };

  const getTitle = () => {
    if (localBlock.type === "note") {
      return localBlock.html?.match(/\[\[(.+?)\]\]/)?.[1] || "(無題ノート)";
    }
    return localBlock.html?.replace(/^- \[[ xX]?\] /, "") || "(無題タスク)";
  };

  return (
    <div className="w-96 border-l border-gray-200 p-4 bg-white pt-16">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-lg font-semibold mb-4">{getTitle()}</h2>

      {localBlock.type !== "note" && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            期日
          </label>
          <input
            type="date"
            className="border px-2 py-1 rounded w-full mb-4"
            value={localBlock.due_date?.slice(0, 10) || ""}
            onChange={handleDueDateChange}
          />
        </>
      )}

      <h3 className="text-sm text-gray-600 mb-1">メモ</h3>
      <BlockEditor parentBlockId={block.id} listId={block.list} />
    </div>
  );
}
