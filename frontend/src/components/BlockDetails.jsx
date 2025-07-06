import React, { useState, useEffect, useRef } from "react";
import BlockEditor from "./editor/BlockEditor";
import { updateBlockDueDate, updateBlock, fetchBlock, fetchTags, createTag } from "../api/blocks";
import { Tag, X, CalendarDays } from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";
import CustomTagPicker from "./CustomTagPicker";

export default function BlockDetails({ block, onClose, onUpdate }) {
  const [localBlock, setLocalBlock] = useState(block);
  const [allTags, setAllTags] = useState([]);
  const titleRef = useRef(null);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);

  useEffect(() => {
    const loadBlock = async () => {
      try {
        const data = await fetchBlock(block.id);
        setLocalBlock(data);
      } catch (err) {
        console.error("ブロック取得失敗:", err);
      }
    };
    loadBlock();
  }, [block.id]);

  // Update localBlock when block prop changes (e.g., from main content updates)
  useEffect(() => {
    setLocalBlock(block);
  }, [block]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchTags();
        setAllTags(tags);
      } catch (err) {
        console.error("タグ取得失敗:", err);
      }
    };
    loadTags();
  }, []);

  const handleDueDateChange = async (e) => {
    let newDueDate = e.target.value;
    if (!newDueDate) newDueDate = null;
    const updatedBlock = { ...localBlock, due_date: newDueDate };

    try {
      await updateBlockDueDate(block.id, newDueDate);
      setLocalBlock(updatedBlock);
      onUpdate?.(updatedBlock);
      // カレンダー・サイドバーの即時リフレッシュ
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: updatedBlock }));
    } catch (err) {
      console.error("期日更新失敗:", err);
    }
  };

  const handleTitleBlur = async () => {
    if (!titleRef.current) return;

    const newTitle = titleRef.current.innerText.trim();
    if (!newTitle) return;

    let newHtml;
    if (localBlock.type === "note") {
      newHtml = `[[${newTitle}]]`;
    } else {
      // task, task-done
      const prefix = localBlock.type === "task-done" ? "- [x] " : "- [ ] ";
      newHtml = prefix + newTitle;
    }

    const updatedBlock = { ...localBlock, html: newHtml };

    try {
      await updateBlock(updatedBlock);
      setLocalBlock(updatedBlock);
      onUpdate?.(updatedBlock);
    } catch (err) {
      console.error("タイトル更新失敗:", err);
    }
  };

  const handleAddTag = async (tag) => {
    if (!tag) return;
    if (!localBlock.tags.some(t => t.id === tag.id)) {
      const updatedBlock = {
        ...localBlock,
        tag_ids: [...(localBlock.tags?.map(t => t.id) || []), tag.id],
      };
      const saved = await updateBlock(updatedBlock);
      setLocalBlock(saved);
      onUpdate?.(saved);
    }
  };

  const handleCreateAndAddTag = async (name) => {
    if (!name.trim()) return;
    const tag = await createTag(name.trim());
    await handleAddTag(tag);
  };

  const handleRemoveTag = async (tagId) => {
    const updatedBlock = {
      ...localBlock,
      tag_ids: (localBlock.tags?.map(t => t.id) || []).filter(id => id !== tagId),
    };
    const saved = await updateBlock(updatedBlock);
    setLocalBlock(saved);
    onUpdate?.(saved);
  };

  // Add a handler to clear all tags at once
  const handleClearAllTags = async () => {
    const updatedBlock = {
      ...localBlock,
      tag_ids: [],
    };
    const saved = await updateBlock(updatedBlock);
    setLocalBlock(saved);
    onUpdate?.(saved);
  };

  const getTitleText = () => {
    if (localBlock.type === "note") {
      return localBlock.html?.match(/\[\[(.+?)\]\]/)?.[1] || "(無題ノート)";
    }
    return localBlock.html?.replace(/^- \[[ xX]?\] /, "") || "(無題タスク)";
  };

  return (
    <div className="w-[32rem] border-l border-[var(--color-flist-border)] bg-[var(--color-flist-bg)] h-screen flex flex-col">
      <div className="flex-none p-8 pt-10 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--color-flist-text-muted)] hover:text-[var(--color-flist-text-primary)] hover:bg-[var(--color-flist-surface-hover)] transition-all duration-200 hover-scale focus-ring"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
          className="text-xl font-semibold mb-6 outline-none border-b border-transparent focus:border-[var(--color-flist-primary)] transition-colors text-[var(--color-flist-text-primary)]"
        >
          {getTitleText()}
        </h2>

        {/* Due Date and Tags - Side by Side */}
        <div className="mb-0 flex flex-wrap gap-2 items-center">
          {/* Due Date (as pill) */}
          {localBlock.type !== "note" && (
            <CustomDatePicker
              value={localBlock.due_date}
              onChange={async (date) => {
                await handleDueDateChange({ target: { value: date } });
              }}
              open={dateMenuOpen}
              setOpen={(v) => {
                setDateMenuOpen(v);
                if (v) setTagMenuOpen(false);
              }}
            />
          )}

          {/* Tags (as pills) */}
          <CustomTagPicker
            tags={localBlock.tags || []}
            allTags={allTags}
            onAddTag={async (tag) => await handleAddTag(tag)}
            onRemoveTag={async (tag) => await handleRemoveTag(tag.id)}
            onCreateTag={async (name) => await handleCreateAndAddTag(name)}
            onClear={handleClearAllTags}
            open={tagMenuOpen}
            setOpen={(v) => {
              if (typeof v === 'function') {
                setTagMenuOpen(prev => {
                  const next = v(prev);
                  if (next) setDateMenuOpen(false);
                  return next;
                });
              } else {
                setTagMenuOpen(v);
                if (v) setDateMenuOpen(false);
              }
            }}
          />
        </div>
      </div>

      {/* BlockEditor section, no label */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <BlockEditor parentBlockId={block.id} listId={block.list} hideTitle={true} compact={true} />
        </div>
      </div>
    </div>
  );
}
