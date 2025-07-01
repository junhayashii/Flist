import { useState, useEffect } from "react";
import BlockEditor from "./editor/BlockEditor";
import BlockDetails from "./BlockDetails";
import TableOfContents from "./TableOfContents";
import TaskListView from "../pages/TaskListView";
import NoteListView from "../pages/NoteListView";
import Dashboard from "../pages/Dashboard";
import CalendarPage from "../pages/CalendarPage";
import { fetchLists, updateListTitle } from "../api/lists";
import { createTask, createNote } from "../api/blocks";
import { Plus, Menu, ChevronRight, X } from "lucide-react";
import TagSelector from "./TagSelector";

export default function MainContent({
  selectedListId,
  sidebarOpen,
  setSidebarOpen,
}) {
  const [lists, setLists] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [listBlocks, setListBlocks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

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

  // リストのブロックを更新するためのコールバック
  const handleListBlocksUpdate = (blocks) => {
    setListBlocks(blocks);
  };

  // タスク作成モーダルを開く
  const handleOpenTaskModal = () => {
    setShowTaskModal(true);
    setNewTaskTitle("");
    setSelectedTags([]);
  };

  // タスク作成モーダルを閉じる
  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setNewTaskTitle("");
    setSelectedTags([]);
  };

  // タスクを作成する
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      const newTask = await createTask(newTaskTitle.trim(), selectedTags);
      setSelectedBlock(newTask);
      handleCloseTaskModal();
    } catch (error) {
      console.error("タスク作成失敗:", error);
    }
  };

  // 見出しクリック時のハンドラー
  const handleHeadingClick = (headingBlock) => {
    // 該当の見出しブロックを選択状態にする
    setSelectedBlock(headingBlock);
    
    // メインコンテンツエリアで該当ブロックにスクロール
    const event = new CustomEvent('scrollToBlock', { 
      detail: { blockId: headingBlock.id } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* サイドバーが閉じているときだけ表示する開くボタン */}
      {!sidebarOpen && setSidebarOpen && (
        <button
          className="fixed top-4 left-2 z-50 p-2 rounded-full bg-white/80 shadow-md hover:bg-[var(--color-flist-blue-light)]/40 text-[var(--color-flist-accent)] transition-colors border border-[var(--color-flist-border)]"
          onClick={() => setSidebarOpen(true)}
          title="サイドバーを開く"
        >
          <ChevronRight size={22} />
        </button>
      )}
      {/* メイン編集ペイン */}
      <div className="flex-1 flex flex-col bg-[var(--color-flist-bg)] backdrop-blur-md overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-center w-full max-w-8xl px-8 pt-8">
            {selectedListId &&
              (["tasks", "notes", "dashboard", "calendar"].includes(selectedListId) ? (
                <h2 className="text-xl font-medium tracking-tight text-[var(--color-flist-dark)]">
                  {selectedListId === "tasks"
                    ? "Tasks"
                    : selectedListId === "notes"
                    ? "Notes"
                    : selectedListId === "dashboard"
                    ? "Dashboard"
                    : "Calendar"}
                </h2>
              ) : editing ? (
                <input
                  className="text-xl font-medium tracking-tight border-b border-[var(--color-flist-border)] focus:outline-none focus:border-[var(--color-flist-accent)] bg-transparent px-1 py-0.5 transition-colors"
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
                  className="text-xl font-medium tracking-tight text-[var(--color-flist-dark)] cursor-text hover:text-[var(--color-flist-accent)] transition-colors"
                  onClick={() => {
                    setDraftTitle(selectedList?.title || "");
                    setEditing(true);
                  }}
                >
                  {selectedList?.title || "Untitled"}
                </h2>
              ))}

            {/* Newボタン */}
            {selectedListId === "tasks" && (
              <button
                onClick={handleOpenTaskModal}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-flist-accent)] text-white text-sm rounded-lg hover:bg-[var(--color-flist-accent-hover)] transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-flist-accent)] text-white text-sm rounded-lg hover:bg-[var(--color-flist-accent-hover)] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus size={16} />
                New Note
              </button>
            )}
          </div>

          {/* メイン表示（ブロック or タスク） */}
          <div className="mt-2">
            {selectedListId === "dashboard" ? (
              <Dashboard />
            ) : selectedListId === "tasks" ? (
              <TaskListView
                onSelectTask={setSelectedBlock}
                selectedBlockId={selectedBlock?.id}
              />
            ) : selectedListId === "notes" ? (
              <NoteListView
                onSelectNote={setSelectedBlock}
                selectedNote={selectedBlock}
              />
            ) : selectedListId === "calendar" ? (
              <CalendarPage onSelectTask={setSelectedBlock} selectedBlockId={selectedBlock?.id} />
            ) : selectedListId ? (
              <div className="max-w-8xl mx-auto p-8">
                <BlockEditor
                  listId={selectedListId}
                  onSelectedBlock={(block) => setSelectedBlock(block)}
                  selectedBlockId={selectedBlock?.id}
                  selectedBlock={selectedBlock}
                  onBlocksUpdate={handleListBlocksUpdate}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full px-6">
                <div className="text-center text-[var(--color-flist-muted)]">
                  <svg
                    className="mx-auto h-12 w-12 text-[var(--color-flist-muted)] mb-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-[var(--color-flist-dark)] mb-2">
                    リストを選択してください
                  </h3>
                  <p className="text-[var(--color-flist-muted)]">
                    左のサイドバーからリストを選択するか、新しいリストを作成してください。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 詳細パネル（右）- リストページでは常に表示、その他は従来通り */}
      {selectedListId && selectedListId !== "dashboard" && (
        <>
          {/* リストページ（BlockEditor使用）では常に表示 */}
          {!["tasks", "notes", "calendar"].includes(selectedListId) && (
            <div className="w-[32rem] shrink-0 overflow-y-auto border-l border-[var(--color-flist-border)] bg-[var(--color-flist-surface)] backdrop-blur-md">
              {selectedBlock && 
               (selectedBlock.type === "task" ||
                selectedBlock.type === "task-done" ||
                selectedBlock.type === "note") ? (
                <BlockDetails
                  block={selectedBlock}
                  onClose={() => setSelectedBlock(null)}
                  onUpdate={(updated) => {
                    setSelectedBlock(updated);
                    // Update the block in the main content
                    if (selectedListId === "tasks") {
                      // For TaskListView, we need to trigger a refresh
                      const event = new CustomEvent('taskUpdated', { detail: updated });
                      window.dispatchEvent(event);
                    } else if (selectedListId === "notes") {
                      // For NoteListView, we need to trigger a refresh
                      const event = new CustomEvent('noteUpdated', { detail: updated });
                      window.dispatchEvent(event);
                    }
                  }}
                />
              ) : (
                // タスクが選択されていない時は目次を表示
                <TableOfContents 
                  blocks={listBlocks} 
                  onHeadingClick={handleHeadingClick}
                />
              )}
            </div>
          )}
          
          {/* タスク、ノート、カレンダーページでは従来通り */}
          {["tasks", "notes", "calendar"].includes(selectedListId) && selectedBlock && (
            <div className="w-[32rem] shrink-0 overflow-y-auto border-l border-[var(--color-flist-border)] bg-[var(--color-flist-surface)] backdrop-blur-md">
              <BlockDetails
                block={selectedBlock}
                onClose={() => setSelectedBlock(null)}
                onUpdate={(updated) => {
                  setSelectedBlock(updated);
                  // Update the block in the main content
                  if (selectedListId === "tasks") {
                    // For TaskListView, we need to trigger a refresh
                    const event = new CustomEvent('taskUpdated', { detail: updated });
                    window.dispatchEvent(event);
                  } else if (selectedListId === "notes") {
                    // For NoteListView, we need to trigger a refresh
                    const event = new CustomEvent('noteUpdated', { detail: updated });
                    window.dispatchEvent(event);
                  }
                }}
              />
            </div>
          )}
        </>
      )}

      {/* タスク作成モーダル */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 min-w-[400px] max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[var(--color-flist-dark)]">新しいタスクを作成</h3>
              <button
                onClick={handleCloseTaskModal}
                className="text-[var(--color-flist-muted)] hover:text-[var(--color-flist-dark)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-flist-dark)] mb-2">
                  タスク名
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="タスク名を入力..."
                  className="w-full p-3 border border-[var(--color-flist-border)] rounded-lg focus:outline-none focus:border-[var(--color-flist-accent)] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateTask();
                    }
                    if (e.key === "Escape") {
                      handleCloseTaskModal();
                    }
                  }}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-flist-dark)] mb-2">
                  タグ
                </label>
                <TagSelector
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseTaskModal}
                className="px-4 py-2 text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)] rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim()}
                className="px-4 py-2 bg-[var(--color-flist-accent)] text-white rounded-lg hover:bg-[var(--color-flist-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ブロック詳細パネル */}
      {selectedBlock && (
        <BlockDetails
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onUpdate={(updatedBlock) => {
            setSelectedBlock(updatedBlock);
            // タスクリストも更新
            const event = new CustomEvent('taskUpdated', { 
              detail: updatedBlock 
            });
            window.dispatchEvent(event);
          }}
        />
      )}
    </div>
  );
}
