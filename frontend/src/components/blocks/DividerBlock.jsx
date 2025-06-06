import React from "react";

export default function DividerBlock({ block, onClick }) {
  return (
    <hr
      tabIndex={-1}
      className="my-4 border-t border-gray-300 cursor-pointer"
      onClick={() => onClick?.(block.id)}
    />
  );
}
