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
}) {
  const isDone = block.type === "task-done";
  const label = block.html.replace(/^- \[[ x]\] /, "");
  const hasMeta = block.due_date || listName;

  return (
    <div
      className="p-3 border rounded bg-white hover:bg-blue-50 shadow-sm cursor-pointer"
      onClick={() => onClick?.(block)}
    >
      <div className="flex items-center space-x-3">
        {/* ✅ 丸くて美しいチェックボックス（アイコン） */}
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

        {/* ✅ 本文 + メタ情報 */}
        <div className="flex-1">
          {isEditable ? (
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              className={`outline-none flex-1 ${
                isDone ? "line-through text-gray-400" : ""
              }`}
              onBlur={() => onBlur?.(block)}
              onClick={(e) => e.stopPropagation()}
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
                <span>
                  📅 {new Date(block.due_date).toLocaleDateString("ja-JP")}
                </span>
              )}
              {listName && <span>{listName}</span>}
            </div>
          )}
        </div>

        {/* ✅ 詳細パネルボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail?.(block);
          }}
          className="text-gray-400 hover:text-blue-500 p-1"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
