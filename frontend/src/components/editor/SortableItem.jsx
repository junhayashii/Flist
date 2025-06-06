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
      className="flex gap-2 group"
    >
      <div
        {...listeners}
        className="cursor-grab text-gray-400 opacity-0 group-hover:opacity-100 p-1"
      >
        <GripVertical size={16} />
      </div>
      <div className="flex-1">{renderBlock(block, index)}</div>
    </div>
  );
}
