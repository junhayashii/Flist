import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import AppLauncher from "../components/sidebar/AppLauncher";
import CalendarSidebar from "../components/sidebar/CalendarSidebar";
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { updateBlockDueDate } from "../api/blocks";
import SettingsModal from "../components/SettingsModal";

export default function AppLayout() {
  const [selectedListId, setSelectedListId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user, loading } = useAuth();
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // タスクのdue_date変更時にサイドバーをリフレッシュ
  const handleTaskDueDateChange = () => {
    setSidebarRefreshKey(k => k + 1);
  };

  // DnDで日付セルにタスクをドロップしたときの処理
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!active || !over) return;
    const taskId = active.data?.current?.taskId;
    const overId = over.id;
    if (taskId && overId) {
      if (overId.startsWith('date-')) {
        const toDate = overId.replace('date-', '');
        await updateBlockDueDate(taskId, toDate);
        handleTaskDueDateChange();
      } else if (overId === 'no-date-tasks') {
        // Remove due date
        await updateBlockDueDate(taskId, null);
        handleTaskDueDateChange();
      }
    }
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-gray-100">
        <AppLauncher selectedListId={selectedListId} setSelectedListId={setSelectedListId} openSettings={() => setSettingsOpen(true)} />
        {selectedListId === "calendar" ? (
          <CalendarSidebar setSelectedTask={setSelectedTask} refreshKey={sidebarRefreshKey} onDragEnd={handleDragEnd} />
        ) : (
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            selectedListId={selectedListId}
            setSelectedListId={setSelectedListId}
          />
        )}
        <MainContent
          selectedListId={selectedListId}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          refreshKey={sidebarRefreshKey}
          setSelectedListId={setSelectedListId}
        />
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </DndContext>
  );
}
