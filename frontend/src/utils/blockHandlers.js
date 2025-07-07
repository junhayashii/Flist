import { updateBlock as apiUpdateBlock } from "../api/blocks";

export const getBlockType = (text) => {
  const trimmed = text.trim();
  if (trimmed.startsWith("- [ ] ")) return "task";
  if (trimmed.startsWith("- [x] ")) return "task-done";
  if (trimmed.startsWith("### ")) return "heading3";
  if (trimmed.startsWith("## ")) return "heading2";
  if (trimmed.startsWith("# ")) return "heading1";
  if (/^\d+\.\s/.test(trimmed)) return "numbered";
  if (trimmed.startsWith("- ")) return "bullet";
  if (trimmed.startsWith("> ")) return "quote";
  if (trimmed === "---") return "divider";
  if (/^\[\[.+\]\]$/.test(trimmed)) return "note";
  return "text";
};

export const handleBlur = async ({
  block,
  el,
  setBlocks,
  saveBlock,
  updateBlock = apiUpdateBlock,
}) => {
  if (!el) return;

  const html = el.innerText.trim();
  const newType = getBlockType(html);

  // Preserve the original type for special blocks unless the content clearly indicates a different type
  const correctedType = (() => {
    // If the block is a special type and the new content doesn't match any specific pattern, keep the original type
    if (block.type === "task" || block.type === "task-done") {
      return newType === "text" ? block.type : newType;
    }
    if (block.type === "note") {
      return newType === "text" ? block.type : newType;
    }
    if (block.type === "heading1" || block.type === "heading2" || block.type === "heading3") {
      return newType === "text" ? block.type : newType;
    }
    if (block.type === "bullet" || block.type === "numbered") {
      return newType === "text" ? block.type : newType;
    }
    if (block.type === "quote") {
      return newType === "text" ? block.type : newType;
    }
    return newType;
  })();

  // Add markdown formatting based on the corrected type
  let finalHtml = html;
  if (correctedType === "bullet" && !html.startsWith("- ")) {
    finalHtml = `- ${html}`;
  } else if (correctedType === "numbered" && !/^\d+\.\s/.test(html)) {
    // For numbered lists, preserve the current number if possible
    const currentNumber = block.html.match(/^(\d+)\./)?.[1] || "1";
    finalHtml = `${currentNumber}. ${html}`;
  } else if (correctedType === "heading1" && !html.startsWith("# ")) {
    finalHtml = `# ${html}`;
  } else if (correctedType === "heading2" && !html.startsWith("## ")) {
    finalHtml = `## ${html}`;
  } else if (correctedType === "heading3" && !html.startsWith("### ")) {
    finalHtml = `### ${html}`;
  }

  if (finalHtml === block.html && correctedType === block.type) return;

  const updatedBlock = {
    ...block,
    html: finalHtml,
    type: correctedType,
  };

  if (String(block.id).startsWith("tmp-")) {
    const saved = await saveBlock(updatedBlock);
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? saved : b)));
  } else {
    await updateBlock(updatedBlock);
    setBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? updatedBlock : b))
    );
  }

  // Dispatch event for real-time task count updates if this is a task
  if (updatedBlock.type === "task" || updatedBlock.type === "task-done") {
    window.dispatchEvent(new CustomEvent('taskUpdated', { detail: updatedBlock }));
  }
};

export const handleInput = async ({
  e,
  id,
  blocks,
  setBlocks,
  updateBlock,
}) => {
  const html = e.target.innerText;
  const block = blocks.find((b) => b.id === id);
  if (!block) return;

  const updatedBlock = {
    ...block,
    html,
  };

  setBlocks((prev) => prev.map((b) => (b.id === id ? updatedBlock : b)));

  if (!id.toString().startsWith("tmp-")) {
    await updateBlock(updatedBlock);
    
    // Dispatch event for real-time updates if this is a task or note
    if (updatedBlock.type === "task" || updatedBlock.type === "task-done") {
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: updatedBlock }));
    } else if (updatedBlock.type === "note") {
      window.dispatchEvent(new CustomEvent('noteUpdated', { detail: updatedBlock }));
    }
  }
};

export const handleToggleDone = async ({
  blockId,
  blocks,
  setBlocks,
  updateBlock,
}) => {
  const updatedBlocks = blocks.map((block) =>
    block.id === blockId
      ? {
          ...block,
          type: block.type === "task-done" ? "task" : "task-done",
          html:
            (block.type === "task-done" ? "- [ ] " : "- [x] ") +
            block.html.replace(/^- \[[ x]\] /, ""),
        }
      : block
  );

  setBlocks(updatedBlocks);

  const updatedBlock = updatedBlocks.find((b) => b.id === blockId);
  if (updatedBlock) {
    await updateBlock(updatedBlock);
    
    // Dispatch event for real-time task count updates
    window.dispatchEvent(new CustomEvent('taskUpdated', { detail: updatedBlock }));
  }
};
