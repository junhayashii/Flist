import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function SortableItem({ block, index, renderBlock }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
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
      className="relative group"
    >
      <div
        {...listeners}
        className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab"
      >
        <GripVertical size={14} />
      </div>
      <div className="flex-1">
        <div className="min-w-0">{renderBlock(block, index)}</div>
      </div>
    </div>
  );
}
