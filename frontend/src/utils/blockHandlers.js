import { updateBlock as apiUpdateBlock, createBlock } from "../api/blocks";

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

  const correctedType =
    (block.type === "task" || block.type === "task-done") && newType === "text"
      ? block.type
      : newType;

  // ✅ newType に応じてマークダウン補完
  let finalHtml = html;
  if (newType === "bullet" && !html.startsWith("- ")) {
    finalHtml = `- ${html}`;
  } else if (newType === "heading1" && !html.startsWith("# ")) {
    finalHtml = `# ${html}`;
  } else if (newType === "heading2" && !html.startsWith("## ")) {
    finalHtml = `## ${html}`;
  } else if (newType === "heading3" && !html.startsWith("### ")) {
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
  if (updatedBlock) await updateBlock(updatedBlock);
};
