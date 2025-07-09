import React, { useState, useEffect, useRef } from "react";
import BlockEditor from "./editor/BlockEditor";
import { updateBlockDueDate, updateBlock, fetchBlock, fetchTags, createTag, deleteBlock } from "../api/blocks";
import { CheckCircle, Circle, Tag, X, CalendarDays, MoreVertical, List as ListIcon, Star } from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";
import CustomTagPicker from "./CustomTagPicker";
import { fetchListMap } from "../api/lists";

export default function BlockDetails({ block, onClose, onUpdate, onDelete, setSelectedListId }) {
  const [localBlock, setLocalBlock] = useState(block);
  const [allTags, setAllTags] = useState([]);
  const [lists, setLists] = useState({});
  const titleRef = useRef(null);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const contextMenuRef = useRef(null);

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

  // Fetch list map for showing list name
  useEffect(() => {
    async function loadLists() {
      try {
        const listMap = await fetchListMap();
        setLists(listMap);
      } catch {
        // ignore
      }
    }
    if (block.type === "task" || block.type === "task-done" || block.type === "note") {
      loadLists();
    }
  }, [block.list, block.type]);

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

  // Handle clicking outside context menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenuOpen(false);
      }
    };

    if (contextMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenuOpen]);

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

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteBlock(block.id);
        // Dispatch the correct event for instant UI update
        if (block.type === "note") {
          window.dispatchEvent(new CustomEvent('noteDeleted', { detail: block }));
        } else {
          window.dispatchEvent(new CustomEvent('taskDeleted', { detail: block }));
        }
        onDelete?.(block);
        onClose?.();
      } catch (err) {
        console.error("Task deletion failed:", err);
      }
    }
  };

  const getTitleText = () => {
    if (localBlock.type === "note") {
      return localBlock.html?.match(/\[\[(.+?)\]\]/)?.[1] || "(無題ノート)";
    }
    return localBlock.html?.replace(/^- \[[ xX]?\] /, "") || "(無題タスク)";
  };

  // Add handler for checkbox toggle
  const handleCheckboxToggle = async () => {
    if (localBlock.type !== "task" && localBlock.type !== "task-done") return;
    const newType = localBlock.type === "task-done" ? "task" : "task-done";
    const newHtml = (newType === "task-done" ? "- [x] " : "- [ ] ") + getTitleText();
    const updatedBlock = { ...localBlock, type: newType, html: newHtml };
    setLocalBlock(updatedBlock);
    await updateBlock(updatedBlock);
    onUpdate?.(updatedBlock);
    window.dispatchEvent(new CustomEvent('taskUpdated', { detail: updatedBlock }));
  };

  const handlePinToggle = async () => {
    const updatedBlock = { ...localBlock, is_pinned: !localBlock.is_pinned };
    setLocalBlock(updatedBlock);
    try {
      await updateBlock(updatedBlock);
      onUpdate?.(updatedBlock);
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: updatedBlock }));
    } catch (err) {
      console.error("ピン留め更新失敗:", err);
    }
  };

  return (
    <div className="w-[32rem] border-l border-[var(--color-flist-border)] bg-[var(--color-flist-bg)] h-screen flex flex-col">
      <div className="flex-none p-8 pt-10 relative">
        {/* Close button and context menu - top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Pin button */}
          <button
            onClick={handlePinToggle}
            className={`p-2 rounded-lg transition-all duration-200 hover-scale focus-ring ${
              localBlock.is_pinned 
                ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50" 
                : "text-[var(--color-flist-text-muted)] hover:text-[var(--color-flist-text-primary)] hover:bg-[var(--color-flist-surface-hover)]"
            }`}
            title={localBlock.is_pinned ? "Unpin" : "Pin"}
          >
            <Star size={18} fill={localBlock.is_pinned ? "currentColor" : "none"} />
          </button>

          {/* Context menu button */}
          <div className="relative">
            <button
              onClick={() => setContextMenuOpen(!contextMenuOpen)}
              className="p-2 rounded-lg text-[var(--color-flist-text-muted)] hover:text-[var(--color-flist-text-primary)] hover:bg-[var(--color-flist-surface-hover)] transition-all duration-200 hover-scale focus-ring"
            >
              <MoreVertical size={18} />
            </button>
            
            {/* Context menu dropdown */}
            {contextMenuOpen && (
              <div
                ref={contextMenuRef}
                className="absolute right-0 mt-2 w-48 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg backdrop-blur-md z-10"
              >
                <button
                  onClick={handleDeleteTask}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-lg"
                >
                  Delete task
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--color-flist-text-muted)] hover:text-[var(--color-flist-text-primary)] hover:bg-[var(--color-flist-surface-hover)] transition-all duration-200 hover-scale focus-ring"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          {(localBlock.type === "task" || localBlock.type === "task-done") && (
            <button
              onClick={handleCheckboxToggle}
              className="w-6 h-6 flex items-center justify-center text-[var(--color-flist-accent)] hover:scale-105 transition-transform focus:outline-none"
              style={{ marginRight: 4 }}
              tabIndex={0}
              aria-label={localBlock.type === "task-done" ? "Mark as incomplete" : "Mark as complete"}
            >
              {localBlock.type === "task-done" ? (
                <CheckCircle className="w-6 h-6" strokeWidth={1.5} />
              ) : (
                <Circle className="w-6 h-6" strokeWidth={1.5} />
              )}
            </button>
          )}
          <h2
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            className="text-xl font-semibold outline-none border-b border-transparent focus:border-[var(--color-flist-primary)] transition-colors text-[var(--color-flist-text-primary)]"
            style={{ textDecoration: localBlock.type === "task-done" ? "line-through" : "none", color: localBlock.type === "task-done" ? "#aaa" : undefined }}
          >
            {getTitleText()}
          </h2>
        </div>

        {/* Due Date and Tags - Side by Side */}
        <div className="mb-0 flex flex-wrap gap-2 items-center">
          {/* List name pill (as pill, same row as due date/tags) */}
          {((localBlock.type === "task" || localBlock.type === "task-done" || localBlock.type === "note") && localBlock.list && lists[localBlock.list]) && (
            <button
              onClick={() => setSelectedListId?.(localBlock.list)}
              className="flex items-center gap-2 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-full px-4 py-1 text-[var(--color-flist-dark)] text-sm font-medium shadow-sm hover:border-[var(--color-flist-accent)] transition-colors"
              type="button"
            >
              <ListIcon className="w-4 h-4 text-[var(--color-flist-accent)]" />
              {lists[localBlock.list]}
            </button>
          )}
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
