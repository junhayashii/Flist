import { useEffect } from "react";

export function useClickOutsideBlur({
  editingBlockId,
  blocks,
  blockRefs,
  handleBlockBlur,
  setEditingBlockId,
  setBlocks,
  saveBlock,
  updateBlock,
}) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!editingBlockId) return;
      const el = blockRefs.current[editingBlockId];
      if (!el) return;

      if (!el.contains(e.target)) {
        const block = blocks.find((b) => b.id === editingBlockId);
        if (block) {
          handleBlockBlur({
            block,
            el: blockRefs.current[block.id],
            setBlocks,
            saveBlock,
            updateBlock,
          });
          setEditingBlockId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingBlockId, blocks]);
}
