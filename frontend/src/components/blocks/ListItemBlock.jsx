import React from "react";

export default function ListItemBlock({ block, type = "bullet", onClick }) {
  const baseClass = "px-3 py-1 cursor-pointer";
  const classes = {
    bullet: "list-disc ml-6",
    numbered: "list-decimal ml-6",
  };

  const cleanedText =
    type === "bullet"
      ? block.html.replace(/^- /, "")
      : block.html.replace(/^\d+\. /, "");

  return (
    <li
      id={`block-${block.id}`}
      tabIndex={-1}
      className={`${baseClass} ${classes[type]}`}
      onClick={() => onClick?.(block.id)}
    >
      {cleanedText}
    </li>
  );
}
