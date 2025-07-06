import { useState, useEffect } from "react";
import BlockEditor from "./editor/BlockEditor";
import BlockDetails from "./BlockDetails";
import TaskListView from "../pages/TaskListView";
import NoteListView from "../pages/NoteListView";
import Dashboard from "../pages/Dashboard";
import CalendarPage from "../pages/CalendarPage";


import { Plus, Sidebar, PanelLeftOpen, X } from "lucide-react";

export default function MainContent({
  selectedListId,
  sidebarOpen,
  setSidebarOpen,
  selectedTask,
  setSelectedTask,
  refreshKey,
}) {


  const [showOpenButton, setShowOpenButton] = useState(false);



  useEffect(() => {
    setSelectedTask(null);
  }, [selectedListId, setSelectedTask]);

  // Listen for block updates from main content
  useEffect(() => {
    const handleBlockUpdated = (event) => {
      const updatedBlock = event.detail;
      // If the updated block is the currently selected task, update it
      if (selectedTask && selectedTask.id === updatedBlock.id) {
        setSelectedTask(updatedBlock);
      }
    };

    window.addEventListener('taskUpdated', handleBlockUpdated);
    window.addEventListener('noteUpdated', handleBlockUpdated);
    
    return () => {
      window.removeEventListener('taskUpdated', handleBlockUpdated);
      window.removeEventListener('noteUpdated', handleBlockUpdated);
    };
  }, [selectedTask, setSelectedTask]);

  // Handle sidebar open button timing
  useEffect(() => {
    if (!sidebarOpen) {
      // Wait for sidebar transition to complete (300ms) before showing open button
      const timer = setTimeout(() => {
        setShowOpenButton(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowOpenButton(false);
    }
  }, [sidebarOpen]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar open button when closed */}
      {showOpenButton && setSidebarOpen && (
        <button
          className="fixed top-4 left-16 z-50 p-1.5 rounded-lg hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-text-muted)] hover:text-[var(--color-flist-text-primary)] transition-all duration-200 hover-scale focus-ring"
          onClick={() => setSidebarOpen(true)}
          title="Open sidebar"
        >
          <Sidebar size={16} />
        </button>
      )}
      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-[var(--color-flist-bg)] overflow-hidden">
        <div className="flex-1 overflow-y-auto">


          {/* メイン表示（ブロック or タスク） */}
          <div className="mt-2">
            {selectedListId === "dashboard" ? (
              <Dashboard />
            ) : selectedListId === "tasks" ? (
              <TaskListView
                onSelectTask={setSelectedTask}
                selectedBlockId={selectedTask?.id}
              />
            ) : selectedListId === "notes" ? (
              <NoteListView
                onSelectNote={setSelectedTask}
                selectedNote={selectedTask}
              />
            ) : selectedListId === "calendar" ? (
              <CalendarPage 
                onSelectTask={setSelectedTask} 
                selectedBlockId={selectedTask?.id}
                refreshKey={refreshKey}
              />
            ) : selectedListId ? (
              <BlockEditor
                listId={selectedListId}
                onSelectedBlock={(block) => setSelectedTask(block)}
                selectedBlockId={selectedTask?.id}
                selectedBlock={selectedTask}
              />
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
          {!["tasks", "notes", "calendar"].includes(selectedListId) && selectedTask && 
           (selectedTask.type === "task" ||
            selectedTask.type === "task-done" ||
            selectedTask.type === "note") && (
            <div className="w-[32rem] shrink-0 overflow-y-auto border-l border-[var(--color-flist-border)] bg-[var(--color-flist-surface)] backdrop-blur-md">
              <BlockDetails
                block={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={(updated) => {
                  setSelectedTask(updated);
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
          
          {/* タスク、ノート、カレンダーページでは従来通り */}
          {["tasks", "notes", "calendar"].includes(selectedListId) && selectedTask && (
            <div className="w-[32rem] shrink-0 overflow-y-auto border-l border-[var(--color-flist-border)] bg-[var(--color-flist-surface)] backdrop-blur-md">
              <BlockDetails
                block={selectedTask}
                onClose={() => setSelectedTask(null)}
                onUpdate={(updated) => {
                  setSelectedTask(updated);
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


    </div>
  );
}
