import { useEffect, useRef } from "react";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";

export default function TaskBlock({
  block,
  onClick,
  onToggle,
  onOpenDetail,
  listName,
  isEditable = false,
  onBlur,
  editableRef,
  onEmptyTaskEnterOrBackspace,
  onKeyDown,
  isSelected = false,
  onDelete,
}) {
  const isDone = block.type === "task-done";
  const label = block.html.replace(/^(- \[[ xX]\]\s*)+/, "");
  const hasMeta = block.due_date || listName;

  const localRef = useRef(null);

  useEffect(() => {
    if (isEditable && localRef.current) {
      localRef.current.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(localRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditable]);

  function formatDateLocal(dateStr) {
    try {
      // "2025-06-23" のような文字列が来ると仮定
      const parts = dateStr.split("-");
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JSの月は0始まり
      const day = parseInt(parts[2]);

      // タイムゾーンに依存しない日付オブジェクトを作成
      const localDate = new Date(year, month, day);

      return localDate.toLocaleDateString("pt-BR");
    } catch (e) {
      console.error("日付表示エラー:", e);
      return "";
    }
  }

  const handleKeyDown = (e) => {
    const text = localRef.current?.innerText.trim();
    if (!text && (e.key === "Enter" || e.key === "Backspace")) {
      e.preventDefault();
      onEmptyTaskEnterOrBackspace?.();
    }
  };

  return (
    <div
      className={`p-3 cursor-pointer ${
        isSelected ? "bg-blue-100 border border-blue-300" : "bg-white"
      }`}
      onClick={() => onClick?.(block)}
    >
      <div className="flex items-center space-x-3">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(block);
          }}
          className="w-6 h-6 cursor-pointer text-blue-600 hover:scale-105 transition-transform"
        >
          {isDone ? (
            <CheckCircle className="w-6 h-6" strokeWidth={2} />
          ) : (
            <Circle className="w-6 h-6" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1">
          {isEditable ? (
            <div
              ref={(el) => {
                localRef.current = el;
                if (el) editableRef?.(el);
              }}
              contentEditable
              suppressContentEditableWarning
              className={`outline-none flex-1 ${
                isDone ? "line-through text-gray-400" : ""
              }`}
              onBlur={() => onBlur?.(block)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => onKeyDown?.(e)}
            >
              {label}
            </div>
          ) : (
            <div
              className={
                isDone ? "line-through text-gray-400" : "text-gray-800"
              }
            >
              {label}
            </div>
          )}

          {hasMeta && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              {block.due_date && (
                <span>📅 {formatDateLocal(block.due_date)}</span>
              )}
              {listName && <span>{listName}</span>}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail?.(block);
          }}
          className="text-gray-400 hover:text-blue-500 p-1"
        >
          <ChevronRight size={10} strokeWidth={4} />
        </button>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // ペインを開かないように
              onDelete();
            }}
            className="ml-2 text-red-500 hover:text-red-700 text-sm"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}
