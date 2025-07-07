import { useState } from "react";
import {
  fetchAllBlocks,
  createBlock,
  updateBlock as apiUpdateBlock,
  deleteBlock as apiDeleteBlock,
} from "../api/blocks";

export default function useBlocks(listId, parentBlockId) {
  const [blocks, setBlocks] = useState([]);

  const loadBlocks = async () => {
    const data = await fetchAllBlocks();
    const filtered = data.filter((b) => {
      const isTopLevel = parentBlockId == null;
      const matchesList = String(b.list) === String(listId);
      const matchesParent = String(b.parent_block) === String(parentBlockId);

      return isTopLevel
        ? matchesList &&
            (b.parent_block === null || b.parent_block === undefined)
        : matchesParent;
    });

    if (filtered.length > 0) {
      setBlocks(filtered);
    } else {
      setBlocks([
        {
          id: `tmp-${Date.now()}`,
          html: "",
          type: "text",
          order: 0,
          list: listId,
          parent: parentBlockId || null,
        },
      ]);
    }
  };

  const saveBlock = async (block) => {
    const payload = {
      ...block,
      list: parentBlockId ? null : listId,
      parent_block: parentBlockId || null,
    };
    return await createBlock(payload);
  };

  const updateBlock = async (block) => {
    const payload = {
      id: block.id,
      html: block.html,
      type: block.type,
      order: block.order,
      list: parentBlockId ? null : listId,
      parent_block: parentBlockId || null,
    };
    await apiUpdateBlock(payload);
  };

  const deleteBlock = async (id) => {
    await apiDeleteBlock(id);
  };

  return {
    blocks,
    setBlocks,
    loadBlocks,
    saveBlock,
    updateBlock,
    deleteBlock,
  };
}
