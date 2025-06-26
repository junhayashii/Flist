import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function SortableItem({ block, index, renderBlock }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
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
      className={`relative group ${isDragging ? "z-50" : ""}`}
    >
      <div
        {...listeners}
        className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-all duration-200 p-1 rounded hover:bg-[var(--color-flist-surface-hover)]"
      >
        <GripVertical size={14} className="text-[var(--color-flist-muted)]" />
      </div>
      
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--color-flist-accent)]/5 border-2 border-dashed border-[var(--color-flist-accent)] rounded-lg animate-pulse" />
      )}
      
      <div className={`flex-1 transition-all duration-200 ${isDragging ? "scale-105 shadow-lg" : ""}`}>
        <div className="min-w-0">{renderBlock(block, index)}</div>
      </div>
    </div>
  );
}
