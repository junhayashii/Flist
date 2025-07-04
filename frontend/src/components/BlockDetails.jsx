import React, { useState, useEffect, useRef } from "react";
import BlockEditor from "./editor/BlockEditor";
import { updateBlockDueDate, updateBlock, fetchBlock, fetchTags, createTag } from "../api/blocks";
import { Tag } from "lucide-react";

export default function BlockDetails({ block, onClose, onUpdate }) {
  const [localBlock, setLocalBlock] = useState(block);
  const [allTags, setAllTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const titleRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

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

  // Filtered suggestions for dropdown
  const filteredTags = allTags.filter(
    t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !localBlock.tags?.some(tag => tag.id === t.id)
  );
  const exactMatch = allTags.find(t => t.name.toLowerCase() === tagInput.trim().toLowerCase());
  const canCreate = tagInput.trim() && !exactMatch;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

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
    setTagInput("");
    setShowDropdown(false);
    setHighlightedIndex(0);
  };

  const handleCreateAndAddTag = async (name) => {
    if (!name.trim()) return;
    const tag = await createTag(name.trim());
    setAllTags([...allTags, tag]);
    await handleAddTag(tag);
  };

  const handleInputChange = (e) => {
    setTagInput(e.target.value);
    setShowDropdown(true);
    setHighlightedIndex(0);
  };

  const handleInputKeyDown = (e) => {
    if (!showDropdown && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setShowDropdown(true);
      return;
    }
    if (showDropdown) {
      if (e.key === "ArrowDown") {
        setHighlightedIndex(i => Math.min(i + 1, (canCreate ? filteredTags.length : filteredTags.length - 1)));
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setHighlightedIndex(i => Math.max(i - 1, 0));
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (canCreate && highlightedIndex === filteredTags.length) {
          handleCreateAndAddTag(tagInput);
        } else if (filteredTags[highlightedIndex]) {
          handleAddTag(filteredTags[highlightedIndex]);
        }
        e.preventDefault();
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    }
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

  const getTitleText = () => {
    if (localBlock.type === "note") {
      return localBlock.html?.match(/\[\[(.+?)\]\]/)?.[1] || "(無題ノート)";
    }
    return localBlock.html?.replace(/^- \[[ xX]?\] /, "") || "(無題タスク)";
  };

  return (
    <div className="w-[32rem] border-l border-[var(--color-flist-border)] bg-[var(--color-flist-bg)] backdrop-blur-md h-screen flex flex-col">
      <div className="flex-none p-8 pt-10 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-flist-muted)] hover:text-[var(--color-flist-dark)] transition-colors"
        >
          ✕
        </button>

        {/* タイトル */}
        <h2
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
          className="text-lg font-medium mb-6 outline-none border-b border-transparent focus:border-[var(--color-flist-accent)] transition-colors"
        >
          {getTitleText()}
        </h2>

        {/* タグ選択 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} className="text-[var(--color-flist-muted)]" />
            <span className="text-sm font-medium text-[var(--color-flist-text-secondary)]">
              タグ
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {localBlock.tags?.map(tag => (
              <span
                key={tag.id}
                title={tag.name.length > 16 ? tag.name : undefined}
                className="px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-150 cursor-default flex items-center gap-1"
                style={{
                  background: 'var(--color-flist-accent-light)',
                  color: 'var(--color-flist-accent)',
                  border: '1px solid var(--color-flist-accent)',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                #{tag.name.length > 16 ? tag.name.slice(0, 14) + '…' : tag.name}
                <button onClick={() => handleRemoveTag(tag.id)} className="ml-1 text-[var(--color-flist-muted)] hover:text-red-500">×</button>
              </span>
            ))}
          </div>
          <div className="relative" ref={dropdownRef}>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-sm bg-transparent border-b border-[var(--color-flist-border)] focus:outline-none focus:border-[var(--color-flist-accent)] px-1 py-1"
              placeholder="タグを追加..."
              value={tagInput}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleInputKeyDown}
              autoComplete="off"
              style={{ minWidth: 120 }}
            />
            {showDropdown && (filteredTags.length > 0 || canCreate) && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-[var(--color-flist-border)] rounded shadow-lg max-h-40 overflow-auto">
                {filteredTags.map((tag, idx) => (
                  <div
                    key={tag.id}
                    className={`px-3 py-2 cursor-pointer text-sm ${highlightedIndex === idx ? 'bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)]' : ''}`}
                    onMouseDown={() => handleAddTag(tag)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    {tag.name}
                  </div>
                ))}
                {canCreate && (
                  <div
                    className={`px-3 py-2 cursor-pointer text-sm font-semibold ${highlightedIndex === filteredTags.length ? 'bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)]' : ''}`}
                    onMouseDown={() => handleCreateAndAddTag(tagInput)}
                    onMouseEnter={() => setHighlightedIndex(filteredTags.length)}
                  >
                    + 新しいタグ「{tagInput}」を作成
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* タスク用の期日入力 */}
        {localBlock.type !== "note" && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-[var(--color-flist-muted)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium text-[var(--color-flist-text-secondary)]">
                期日
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-flist-surface)] rounded-lg border border-[var(--color-flist-border)] px-3 py-2 shadow-sm hover:border-[var(--color-flist-accent)] transition-colors">
              <input
                type="date"
                className="flex-1 text-sm bg-transparent focus:outline-none text-[var(--color-flist-dark)]"
                value={localBlock.due_date?.slice(0, 10) || ""}
                onChange={handleDueDateChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* メモセクション */}
      <div className="flex-1 flex flex-col p-8 pt-0">
        <div className="space-y-2 flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[var(--color-flist-muted)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="text-sm font-medium text-[var(--color-flist-text-secondary)]">
              メモ
            </span>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden">
            <BlockEditor parentBlockId={block.id} listId={block.list} />
          </div>
        </div>
      </div>
    </div>
  );
}
