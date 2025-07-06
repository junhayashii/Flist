import { useState, useRef, useEffect } from "react";
import { Tag as TagIcon, Check, X } from "lucide-react";

export default function CustomTagPicker({
  tags = [],
  allTags = [],
  onAddTag,
  onRemoveTag,
  onCreateTag,
  onClear,
  open,
  setOpen,
}) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(allTags);
  const inputRef = useRef();
  const popoverRef = useRef();

  useEffect(() => {
    setFiltered(
      allTags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, allTags]);

  // Close popover on outside click
  useEffect(() => {
    function handleClick(e) {
      if (open && popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  // Show comma-separated tags in pill
  const tagNames = tags.map(t => t.name).join(", ");

  // Check if tag is selected
  const isSelected = (tag) => tags.some(t => t.id === tag.id);

  // Create tag if not found
  const canCreate = search.trim() && !allTags.some(t => t.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-full px-4 py-1 text-[var(--color-flist-dark)] text-sm font-medium shadow-sm hover:border-[var(--color-flist-accent)] transition-colors"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <TagIcon className="w-4 h-4 text-[var(--color-flist-accent)]" />
        {tagNames || <span className="text-[var(--color-flist-muted)]">Add tag</span>}
        {tags.length > 0 && (
          <X
            className="w-3 h-3 ml-2 text-[var(--color-flist-muted)] hover:text-[var(--color-flist-accent)]"
            onClick={e => { e.stopPropagation(); onClear?.(); }}
          />
        )}
      </button>
      {open && (
        <div ref={popoverRef} className="absolute z-50 mt-2 left-0 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-xl shadow-xl min-w-[220px] p-0 text-sm">
          <div className="flex items-center px-3 py-2 border-b border-[var(--color-flist-border)]">
            <input
              ref={inputRef}
              className="w-full bg-transparent outline-none text-[var(--color-flist-dark)] text-sm placeholder-[var(--color-flist-muted)]"
              placeholder="Search or create label"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto divide-y divide-[var(--color-flist-border)]">
            {filtered.map(tag => (
              <button
                key={tag.id}
                className={`flex items-center w-full px-3 py-2 gap-2 text-left hover:bg-[var(--color-flist-blue-light)] transition-colors ${isSelected(tag) ? "bg-[var(--color-flist-blue-light)]" : ""}`}
                onClick={() => isSelected(tag) ? onRemoveTag(tag) : onAddTag(tag)}
                type="button"
              >
                <TagIcon className="w-4 h-4 text-[var(--color-flist-accent)]" />
                <span className="flex-1 text-[var(--color-flist-dark)]">{tag.name}</span>
                {isSelected(tag) && <Check className="w-4 h-4 text-[var(--color-flist-accent)]" />}
              </button>
            ))}
            {canCreate && (
              <button
                className="flex items-center w-full px-3 py-2 gap-2 text-left hover:bg-[var(--color-flist-blue-light)] transition-colors"
                onClick={() => { onCreateTag(search.trim()); setSearch(""); }}
                type="button"
              >
                <TagIcon className="w-4 h-4 text-[var(--color-flist-accent)]" />
                <span className="flex-1 text-[var(--color-flist-accent)] font-semibold">Create "{search.trim()}"</span>
              </button>
            )}
          </div>
          <div className="px-3 py-2 border-t border-[var(--color-flist-border)]">
            <button
              className="w-full py-1 rounded-full bg-[var(--color-flist-blue-light)] text-[var(--color-flist-muted)] font-medium hover:bg-[var(--color-flist-accent)]/10 transition-colors text-sm"
              onClick={() => { onClear?.(); setOpen(false); }}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 