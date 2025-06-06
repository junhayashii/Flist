import React from "react";

export default function HeadingBlock({ block, level = 1, onClick }) {
  const baseClass = "px-3 py-1 cursor-pointer";
  const levels = {
    1: "text-2xl font-bold",
    2: "text-xl font-semibold",
    3: "text-lg font-medium",
  };
  const headingText = block.html.replace(/^#+\s/, "");

  const Tag = `h${level}`;

  return (
    <Tag
      tabIndex={-1}
      className={`${baseClass} ${levels[level]}`}
      onClick={() => onClick?.(block.id)}
    >
      {headingText}
    </Tag>
  );
}
