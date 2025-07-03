import React, { useState, useEffect, useRef } from "react";
import BlockEditor from "./editor/BlockEditor";
import { updateBlockDueDate, updateBlock, fetchBlock } from "../api/blocks";
import TagSelector from "./TagSelector";
import { Tag } from "lucide-react";

export default function BlockDetails({ block, onClose, onUpdate }) {
  const [localBlock, setLocalBlock] = useState(block);
  const titleRef = useRef(null);

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

  const handleTagsChange = async (tagIds) => {
    const updatedBlock = { ...localBlock, tag_ids: tagIds };
    try {
      const data = await updateBlock(updatedBlock);
      setLocalBlock(data);
      onUpdate?.(data);
      // タグ追加も即時リフレッシュ
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: data }));
    } catch (err) {
      console.error("タグ更新失敗:", err);
    }
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
          <TagSelector
            selectedTags={localBlock.tags?.map(tag => tag.id) || []}
            onChange={handleTagsChange}
          />
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
