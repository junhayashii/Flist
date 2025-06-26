import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AppLayout() {
  const [selectedListId, setSelectedListId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        sidebarOpen={sidebarOpen}
        selectedListId={selectedListId}
        setSelectedListId={setSelectedListId}
      />
      <MainContent
        selectedListId={selectedListId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
      />
    </div>
  );
}
