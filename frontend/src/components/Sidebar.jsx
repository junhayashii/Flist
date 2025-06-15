import useLists from "../hooks/useLists";
import useFolders from "../hooks/useFolders";
import logo from "../assets/logo.png";
import {
  CheckSquare,
  FileText,
  Plus,
  List,
  LayoutDashboard,
  Folder,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { moveListToFolder } from "../api/folders";

const DraggableList = ({ list, isSelected, onClick, onEdit, editingId, draftTitle, setDraftTitle, inputRef, onDelete, onRename }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: list.id,
  });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleClickOutside = (e) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
      setShowContextMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`w-full flex items-center px-4 py-2 rounded-lg cursor-pointer text-sm transition font-medium ${
        isSelected ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      {editingId === list.id ? (
        <input
          ref={inputRef}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={() => onEdit(list.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEdit(list.id);
            if (e.key === "Escape") setEditingId(null);
          }}
        />
      ) : (
        <div className="flex items-center space-x-3">
          <List className="w-4 h-4 text-gray-400" />
          <span className="truncate">{list.title || "Untitled"}</span>
        </div>
      )}

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            onClick={() => {
              onRename(list.id);
              setShowContextMenu(false);
            }}
          >
            <Edit2 size={16} />
            <span>Rename List</span>
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
            onClick={() => {
              onDelete(list.id);
              setShowContextMenu(false);
            }}
          >
            <Trash2 size={16} />
            <span>Delete List</span>
          </button>
        </div>
      )}
    </div>
  );
};

const DroppableFolder = ({ folder, isExpanded, onToggle, onDelete, onRename, children, onAddList }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
  });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const contextMenuRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleClickOutside = (e) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
      setShowContextMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-1">
      <div
        ref={setNodeRef}
        className={`flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
          isOver ? "bg-blue-100 border-2 border-blue-400 shadow-md" : ""
        }`}
        onClick={onToggle}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown size={16} className={`${isOver ? "text-blue-500" : "text-gray-400"}`} />
          ) : (
            <ChevronRight size={16} className={`${isOver ? "text-blue-500" : "text-gray-400"}`} />
          )}
          <Folder size={16} className={`${isOver ? "text-blue-500" : "text-gray-400"}`} />
          <span className={`text-sm font-medium ${isOver ? "text-blue-600" : "text-gray-700"}`}>
            {folder.title}
          </span>
        </div>
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddList(folder.id);
            }}
            className="p-1 rounded-md hover:bg-gray-200 text-gray-500"
            title="Add List"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      {isExpanded && (
        <div className={`ml-6 space-y-1 transition-all duration-200 ${isOver ? "bg-blue-50 rounded-lg p-1" : ""}`}>
          {children}
        </div>
      )}

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            onClick={() => {
              onRename(folder.id);
              setShowContextMenu(false);
            }}
          >
            <Edit2 size={16} />
            <span>Rename Folder</span>
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
            onClick={() => {
              onDelete(folder.id);
              setShowContextMenu(false);
            }}
          >
            <Trash2 size={16} />
            <span>Delete Folder</span>
          </button>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ sidebarOpen, selectedListId, setSelectedListId }) => {
  const { lists, addList, updateList, refreshLists, deleteList } = useLists(selectedListId, setSelectedListId);
  const { folders, addFolder, editFolder, removeFolder } = useFolders();

  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showFolderMenu, setShowFolderMenu] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const inputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleAddList = async (folderId = null) => {
    const newId = await addList("", folderId);
    setEditingId(newId);
    setDraftTitle("");
  };

  const handleAddFolder = async () => {
    const newFolder = await addFolder("New Folder");
    setExpandedFolders(prev => ({ ...prev, [newFolder.id]: true }));
    setEditingId(`folder-${newFolder.id}`);
    setDraftTitle("New Folder");
  };

  const handleSaveTitle = async (id, isFolder = false) => {
    const trimmed = draftTitle.trim();
    if (!trimmed) return;

    if (isFolder) {
      const folderId = id.replace('folder-', '');
      await editFolder(folderId, { title: trimmed });
    } else {
      await updateList(id, { title: trimmed });
    }
    setEditingId(null);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const listId = active.id;
    const folderId = over.id.startsWith('folder-') ? over.id.replace('folder-', '') : null;

    try {
      await moveListToFolder(listId, folderId);
      await refreshLists();
    } catch (error) {
      console.error('Failed to move list:', error);
    } finally {
      setActiveId(null);
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleDeleteList = async (listId) => {
    if (!confirm("Are you sure you want to delete this list?")) return;
    try {
      await deleteList(listId);
    } catch (error) {
      console.error("Failed to delete list:", error);
      alert("Failed to delete list. Please try again.");
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm("Are you sure you want to delete this folder? All lists inside will be moved to unorganized.")) return;
    try {
      await removeFolder(folderId);
    } catch (error) {
      console.error("Failed to delete folder:", error);
      alert("Failed to delete folder. Please try again.");
    }
  };

  const handleRenameFolder = (folderId) => {
    setEditingId(`folder-${folderId}`);
    setDraftTitle(folders.find(f => f.id === folderId)?.title || "");
  };

  const baseButton = "w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition";
  const selected = "bg-blue-50 text-blue-600 font-semibold";
  const unselected = "text-gray-600 hover:bg-gray-100";

  // Group lists by folder
  const listsByFolder = lists.reduce((acc, list) => {
    const folderId = list.folder ? list.folder.id : 'unorganized';
    if (!acc[folderId]) {
      acc[folderId] = [];
    }
    acc[folderId].push(list);
    return acc;
  }, {});

  const activeList = activeId ? lists.find(list => list.id === activeId) : null;

  return (
    <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 bg-[var(--color-flist-bg)] border-r border-[var(--color-flist-border)] flex flex-col overflow-hidden shadow-sm`}>
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
          className={`${baseButton} ${selectedListId === "dashboard" ? selected : unselected}`}
          onClick={() => setSelectedListId("dashboard")}
        >
          <LayoutDashboard className={`w-4 h-4 ${selectedListId === "dashboard" ? "text-blue-600" : "text-gray-400"}`} />
          <span>Dashboard</span>
        </button>

        {/* Tasks */}
        <button
          className={`${baseButton} ${selectedListId === "tasks" ? selected : unselected}`}
          onClick={() => setSelectedListId("tasks")}
        >
          <CheckSquare className={`w-4 h-4 ${selectedListId === "tasks" ? "text-blue-600" : "text-gray-400"}`} />
          <span>Tasks</span>
        </button>

        {/* Notes */}
        <button
          className={`${baseButton} ${selectedListId === "notes" ? selected : unselected}`}
          onClick={() => setSelectedListId("notes")}
        >
          <FileText className={`w-4 h-4 ${selectedListId === "notes" ? "text-blue-600" : "text-gray-400"}`} />
          <span>Notes</span>
        </button>
      </div>

      {/* Explorer */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-500">My Lists</h2>
            <div className="flex space-x-1">
              <button
                onClick={handleAddFolder}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                title="New Folder"
              >
                <Folder size={16} />
              </button>
              <button
                onClick={() => handleAddList()}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                title="New List"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-1">
              {/* Folders */}
              {folders.map((folder) => (
                <DroppableFolder
                  key={folder.id}
                  folder={folder}
                  isExpanded={expandedFolders[folder.id]}
                  onToggle={() => toggleFolder(folder.id)}
                  onDelete={handleDeleteFolder}
                  onRename={handleRenameFolder}
                  onAddList={handleAddList}
                >
                  {listsByFolder[folder.id]?.map((list) => (
                    <DraggableList
                      key={list.id}
                      list={list}
                      isSelected={selectedListId === list.id}
                      onClick={() => setSelectedListId(list.id)}
                      onEdit={handleSaveTitle}
                      editingId={editingId}
                      draftTitle={draftTitle}
                      setDraftTitle={setDraftTitle}
                      inputRef={inputRef}
                      onDelete={handleDeleteList}
                      onRename={(id) => {
                        setEditingId(id);
                        setDraftTitle(list.title || "");
                      }}
                    />
                  ))}
                </DroppableFolder>
              ))}

              {/* Unorganized Lists */}
              {listsByFolder['unorganized']?.length > 0 && (
                <div className="space-y-1">
                  {listsByFolder['unorganized'].map((list) => (
                    <DraggableList
                      key={list.id}
                      list={list}
                      isSelected={selectedListId === list.id}
                      onClick={() => setSelectedListId(list.id)}
                      onEdit={handleSaveTitle}
                      editingId={editingId}
                      draftTitle={draftTitle}
                      setDraftTitle={setDraftTitle}
                      inputRef={inputRef}
                      onDelete={handleDeleteList}
                      onRename={(id) => {
                        setEditingId(id);
                        setDraftTitle(list.title || "");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <DragOverlay>
              {activeList ? (
                <div className="w-full flex items-center px-4 py-2 rounded-lg bg-white shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <List className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{activeList.title || "Untitled"}</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

