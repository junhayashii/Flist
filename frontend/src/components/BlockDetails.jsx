import React, { useState, useEffect } from "react";
import BlockEditor from "./BlockEditor";
import { updateBlockDueDate } from "../api/blocks";

export default function BlockDetails({ block }) {
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
    } catch (err) {
      console.error("期日更新失敗:", err);
    }
  };

  return (
    <div className="w-96 border-l border-gray-200 p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">タスクの詳細</h2>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        期日
      </label>
      <input
        type="date"
        className="border px-2 py-1 rounded w-full mb-4"
        value={localBlock.due_date?.slice(0, 10) || ""}
        onChange={handleDueDateChange}
      />

      <h3 className="text-sm text-gray-600 mb-1">メモ</h3>
      <BlockEditor parentBlockId={block.id} listId={block.list} />
    </div>
  );
}
