import React from "react";

export default function QuoteBlock({ block, onClick }) {
  const text = block.html.replace(/^> /, "");

  return (
    <blockquote
      tabIndex={-1}
      className="border-l-4 pl-4 text-gray-600 italic px-3 py-1 cursor-pointer"
      onClick={() => onClick?.(block.id)}
    >
      {text}
    </blockquote>
  );
}
