import { useState, useEffect } from "react";
import BlockEditor from "./editor/BlockEditor";
import BlockDetails from "./BlockDetails";
import TaskListView from "../pages/TaskListView";
import NoteListView from "../pages/NoteListView";
import { fetchLists, updateListTitle } from "../api/lists";
import { createTask, createNote } from "../api/blocks";
import { Plus } from "lucide-react";

export default function MainContent({
  selectedListId,
  sidebarOpen,
  setSidebarOpen,
  renderAddButton,
}) {
  const [lists, setLists] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    const loadLists = async () => {
      try {
        const data = await fetchLists();
        setLists(data);
      } catch (error) {
        console.error("リスト取得エラー:", error);
      }
    };
    loadLists();
  }, []);

  useEffect(() => {
    setSelectedBlock(null);
  }, [selectedListId]);

  const selectedList = lists.find((list) => list.id === selectedListId);

  const handleSaveTitle = async () => {
    const trimmed = draftTitle.trim();
    if (trimmed && selectedList?.id) {
      try {
        const updated = await updateListTitle(selectedList.id, trimmed);
        setLists((prev) =>
          prev.map((l) =>
            l.id === updated.id ? { ...l, title: updated.title } : l
          )
        );
      } catch (err) {
        console.error("タイトル更新失敗:", err);
      }
    }
    setEditing(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* メイン編集ペイン */}
      <div className="flex-1 flex flex-col bg-[var(--color-flist-bg)] backdrop-blur-md overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-center w-full max-w-8xl px-8 pt-8">
            {selectedListId &&
              (selectedListId !== "tasks" && selectedListId !== "notes" ? (
                editing ? (
                  <input
                    className="text-xl font-semibold tracking-tight border-b border-gray-300 focus:outline-none focus:border-blue-400 bg-transparent"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle();
                      if (e.key === "Escape") setEditing(false);
                    }}
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-xl font-semibold tracking-tight text-[var(--color-flist-dark)] cursor-text"
                    onClick={() => {
                      setDraftTitle(selectedList?.title || "");
                      setEditing(true);
                    }}
                  >
                    {selectedList?.title || "Untitled"}
                  </h2>
                )
              ) : (
                <h2 className="text-xl font-semibold tracking-tight text-[var(--color-flist-dark)]">
                  {selectedListId === "tasks" ? "Tasks" : "Notes"}
                </h2>
              ))}

            {/* Newボタン */}
            {selectedListId === "tasks" && (
              <button
                onClick={async () => {
                  const newTask = await createTask("New Task");
                  setSelectedBlock(newTask);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
              >
                <Plus size={16} />
                New Task
              </button>
            )}
            {selectedListId === "notes" && (
              <button
                onClick={async () => {
                  const newNote = await createNote("New Note");
                  setSelectedBlock(newNote);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
              >
                <Plus size={16} />
                New Note
              </button>
            )}
          </div>

          {/* メイン表示（ブロック or タスク） */}
          <div className="mt-4">
            {selectedListId === "tasks" ? (
              <TaskListView
                onSelectTask={setSelectedBlock}
                selectedBlockId={selectedBlock?.id}
              />
            ) : selectedListId === "notes" ? (
              <NoteListView
                onSelectNote={setSelectedBlock}
                selectedNote={selectedBlock}
              />
            ) : selectedListId ? (
              <div className="max-w-8xl mx-auto p-8">
                <BlockEditor
                  listId={selectedListId}
                  onSelectedBlock={(block) => setSelectedBlock(block)}
                  selectedBlockId={selectedBlock?.id}
                  selectedBlock={selectedBlock}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full px-6">
                <div className="text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    リストを選択してください
                  </h3>
                  <p className="text-gray-500">
                    左のサイドバーからリストを選択するか、新しいリストを作成してください。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* タスクの詳細パネル（右） */}
      {selectedBlock &&
        (selectedBlock.type === "task" ||
          selectedBlock.type === "task-done" ||
          selectedBlock.type === "note") && (
          <div className="w-[32rem] shrink-0 overflow-y-auto border-l border-[var(--color-flist-border)] bg-[var(--color-flist-bg)]">
            <BlockDetails
              block={selectedBlock}
              onClose={() => setSelectedBlock(null)}
              onUpdateBlock={(updated) => {
                setSelectedBlock(updated);
              }}
            />
          </div>
        )}
    </div>
  );
}
