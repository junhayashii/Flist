import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

export default function App() {
  const [selectedListId, setSelectedListId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

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
