import React from "react";
import { ChevronRight } from "lucide-react";

export default function NoteBlock({
  block,
  onClick,
  onOpenDetail,
  isSelected,
}) {
  const noteTitle = block.html.match(/\[\[(.+?)\]\]/)?.[1] || "ノート";

  return (
    <div
      tabIndex={-1}
      className={`px-3 py-1 font-medium cursor-pointer flex justify-between items-center hover:bg-blue-50 rounded ${
        isSelected ? "bg-blue-100" : ""
      }`}
      onClick={() => {
        onClick?.(block.id);
        onOpenDetail?.(block);
      }}
    >
      <span className="text-blue-700">📘 {noteTitle}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail?.(block);
        }}
        className="text-gray-400 hover:text-blue-500 p-1"
      >
        <ChevronRight size={10} strokeWidth={4} />
      </button>
    </div>
  );
}
