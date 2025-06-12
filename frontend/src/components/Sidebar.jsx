import useLists from "../hooks/useLists";
import logo from "../assets/logo.png";
import {
  CheckSquare,
  FileText,
  Plus,
  List,
  LayoutDashboard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Sidebar = ({ sidebarOpen, selectedListId, setSelectedListId }) => {
  const { lists, addList, updateListTitle } = useLists(
    selectedListId,
    setSelectedListId
  );

  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleAddList = async () => {
    const newId = await addList("");
    setEditingId(newId);
    setDraftTitle("");
  };

  const handleSaveTitle = (id) => {
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    updateListTitle(id, trimmed);
    setEditingId(null);
  };

  const baseButton =
    "w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition";
  const selected = "bg-blue-50 text-blue-600 font-semibold";
  const unselected = "text-gray-600 hover:bg-gray-100";

  return (
    <div
      className={`${
        sidebarOpen ? "w-72" : "w-0"
      } transition-all duration-300 bg-[var(--color-flist-bg)] border-r border-[var(--color-flist-border)] flex flex-col overflow-hidden shadow-sm`}
    >
      <div className="p-6 border-b border-[var(--color-flist-border)]">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-6">
          <img src={logo} alt="Flist Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-[var(--color-flist-blue-dark)] tracking-tight">
            Flist
          </h1>
        </div>

        {/* Dashboard */}
        <button
          className={`${baseButton} ${
            selectedListId === "dashboard" ? selected : unselected
          }`}
          onClick={() => setSelectedListId("dashboard")}
        >
          <LayoutDashboard
            className={`w-4 h-4 ${
              selectedListId === "dashboard" ? "text-blue-600" : "text-gray-400"
            }`}
          />
          <span>Dashboard</span>
        </button>

        {/* Tasks */}
        <button
          className={`${baseButton} ${
            selectedListId === "tasks" ? selected : unselected
          }`}
          onClick={() => setSelectedListId("tasks")}
        >
          <CheckSquare
            className={`w-4 h-4 ${
              selectedListId === "tasks" ? "text-blue-600" : "text-gray-400"
            }`}
          />
          <span>Tasks</span>
        </button>

        {/* Notes */}
        <button
          className={`${baseButton} ${
            selectedListId === "notes" ? selected : unselected
          }`}
          onClick={() => setSelectedListId("notes")}
        >
          <FileText
            className={`w-4 h-4 ${
              selectedListId === "notes" ? "text-blue-600" : "text-gray-400"
            }`}
          />
          <span>Notes</span>
        </button>
      </div>

      {/* My Lists */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500">My Lists</h2>
          <button
            onClick={handleAddList}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="space-y-1">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`w-full flex items-center px-4 py-2 rounded-lg cursor-pointer text-sm transition font-medium ${
                selectedListId === list.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedListId(list.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                console.log(`右クリック: ${list.id}`);
              }}
            >
              {editingId === list.id ? (
                <input
                  ref={inputRef}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onBlur={() => handleSaveTitle(list.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle(list.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <List className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{list.title || "Untitled"}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
