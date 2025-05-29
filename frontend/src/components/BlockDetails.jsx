import React, { useState, useEffect } from "react";
import BlockEditor from "./BlockEditor";

export default function BlockDetails({ block }) {
  const [localBlock, setLocalBlock] = useState(block);

  // ブロックが変わった時、localBlockを更新
  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  const handleDueDateChange = async (e) => {
    const newDueDate = e.target.value; // yyyy-MM-dd 形式
    const updatedBlock = { ...localBlock, due_date: newDueDate };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/blocks/${block.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ due_date: newDueDate }),
      });

      if (!res.ok) {
        throw new Error("期日更新に失敗しました");
      }

      setLocalBlock(updatedBlock);
    } catch (err) {
      console.error("期日更新失敗:", err);
    }
  };

  return (
    <div className="w-96 border-l border-gray-200 p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">タスクの詳細</h2>

      <label className="block text-sm font-medium text-gray-700 mb-1">期日</label>
      <input
        type="date"
        className="border px-2 py-1 rounded w-full mb-4"
        value={
          localBlock.due_date
            ? localBlock.due_date.slice(0, 10) // "2025-05-30T00:00:00Z" → "2025-05-30"
            : ""
        }
        onChange={handleDueDateChange}
      />

      <h3 className="text-sm text-gray-600 mb-1">メモ</h3>
      <BlockEditor parentBlockId={block.id} listId={block.list} />
    </div>
  );
}
