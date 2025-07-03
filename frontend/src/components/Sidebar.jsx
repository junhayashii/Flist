import useLists from "../hooks/useLists";
import useFolders from "../hooks/useFolders";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/flist-icon.png";
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
  Calendar,
  ChevronLeft,
  User,
  LogOut,
  Settings,
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
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`w-full flex items-center px-4 py-2 rounded-lg cursor-pointer text-sm transition-all duration-200 relative group ${
        isSelected 
          ? "bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)]" 
          : "text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)]"
      } ${isDragging ? "opacity-60 scale-105 shadow-xl rotate-1" : ""}`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ドラッグ中のオーバーレイ */}
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--color-flist-accent)]/10 border-2 border-dashed border-[var(--color-flist-accent)] rounded-lg animate-pulse" />
      )}

      {editingId === list.id ? (
        <input
          ref={inputRef}
          className="w-full px-2 py-1 text-sm border border-[var(--color-flist-border)] rounded-md focus:outline-none focus:border-[var(--color-flist-accent)] bg-[var(--color-flist-surface)] ml-6"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={() => onEdit(list.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEdit(list.id);
            if (e.key === "Escape") onRename(null);
          }}
        />
      ) : (
        <div className="flex items-center space-x-3 ml-6">
          <List size={16} className="text-[var(--color-flist-muted)]" />
          <span className="truncate">{list.title || "Untitled"}</span>
        </div>
      )}

      {/* アクションボタン - Notion風 */}
      {isHovered && !isDragging && editingId !== list.id && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(list.id);
            }}
            className="p-1 rounded-md hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] hover:text-[var(--color-flist-dark)] transition-colors"
          >
            <Edit2 size={14} />
          </button>
        </div>
      )}

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg py-1 z-50 min-w-[160px] backdrop-blur-md"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-left text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)] flex items-center space-x-2 transition-colors"
            onClick={() => {
              onRename(list.id);
              setShowContextMenu(false);
            }}
          >
            <Edit2 size={16} />
            <span>Rename List</span>
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
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
        className={`flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[var(--color-flist-surface-hover)] cursor-pointer transition-all duration-200 relative ${
          isOver ? "bg-[var(--color-flist-accent)]/5 border border-[var(--color-flist-accent)]" : ""
        }`}
        onClick={onToggle}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-2 relative z-10">
          {isExpanded ? (
            <ChevronDown size={16} className={`${isOver ? "text-[var(--color-flist-accent)]" : "text-[var(--color-flist-muted)]"}`} />
          ) : (
            <ChevronRight size={16} className={`${isOver ? "text-[var(--color-flist-accent)]" : "text-[var(--color-flist-muted)]"}`} />
          )}
          <Folder size={16} className={`${isOver ? "text-[var(--color-flist-accent)]" : "text-[var(--color-flist-muted)]"}`} />
          <span className={`text-sm font-medium ${isOver ? "text-[var(--color-flist-accent)]" : "text-[var(--color-flist-dark)]"}`}>
            {folder.title}
          </span>
        </div>
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddList(folder.id);
            }}
            className="p-1 rounded-md hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] transition-colors relative z-10"
            title="Add List"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      {isExpanded && (
        <div className={`ml-6 space-y-1 transition-all duration-200 ${isOver ? "bg-[var(--color-flist-accent)]/5 rounded-lg p-1" : ""}`}>
          {children}
        </div>
      )}

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg py-1 z-50 min-w-[160px] backdrop-blur-md"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-left text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)] flex items-center space-x-2 transition-colors"
            onClick={() => {
              onRename(folder.id);
              setShowContextMenu(false);
            }}
          >
            <Edit2 size={16} />
            <span>Rename Folder</span>
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
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

/** UnorganizedDropZone: フォルダ外にリストをドロップするためのドロップエリア */
const UnorganizedDropZone = ({ isOver, children }) => {
  const { setNodeRef, isOver: isDropping } = useDroppable({ id: 'unorganized' });
  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver || isDropping
          ? 'bg-[var(--color-flist-accent)]/5 border border-[var(--color-flist-accent)] rounded-lg p-2'
          : ''
      }`}
      style={{ padding: 0, margin: 0 }}
    >
      {children}
    </div>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, selectedListId, setSelectedListId }) => {
  const { lists, addList, updateList, refreshLists, deleteList } = useLists(selectedListId, setSelectedListId);
  const { folders, addFolder, editFolder, removeFolder } = useFolders();
  const { user, logout } = useAuth();

  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [activeId, setActiveId] = useState(null);
  const inputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddList = async (folderId = null) => {
    try {
      await addList("New List", folderId);
    } catch (error) {
      console.error("Failed to add list:", error);
      alert("Failed to add list. Please try again.");
    }
  };

  const handleAddFolder = async () => {
    try {
      await addFolder("New Folder");
    } catch (error) {
      console.error("Failed to add folder:", error);
      alert("Failed to add folder. Please try again.");
    }
  };

  const handleSaveTitle = async (id, isFolder = false) => {
    if (draftTitle.trim() === "") return;
    try {
      if (isFolder) {
        await editFolder(id, draftTitle);
      } else {
        await updateList(id, { title: draftTitle });
      }
      setEditingId(null);
      setDraftTitle("");
    } catch (error) {
      console.error("Failed to save title:", error);
      alert("Failed to save title. Please try again.");
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active && over && active.id !== over.id) {
      try {
        if (over.id === 'unorganized') {
          await moveListToFolder(active.id, null); // フォルダ外に移動
        } else {
          await moveListToFolder(active.id, over.id.replace('folder-', ''));
        }
        await refreshLists();
      } catch (error) {
        console.error("Failed to move list:", error);
        alert("Failed to move list. Please try again.");
      }
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

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      try {
        await logout();
      } catch (error) {
        console.error("ログアウトエラー:", error);
      }
    }
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
    <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 bg-[var(--color-flist-surface)] border-r border-[var(--color-flist-border)] flex flex-col overflow-hidden shadow-sm`}>
      <div className="p-6 border-b border-[var(--color-flist-border)] relative">
        {/* Close button */}
        {sidebarOpen && setSidebarOpen && (
          <button
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-[var(--color-flist-blue-light)]/40 text-[var(--color-flist-accent)] transition-colors z-10"
            onClick={() => setSidebarOpen(false)}
            title="サイドバーを閉じる"
          >
            <ChevronLeft size={22} />
          </button>
        )}
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

              {/* Unorganized Drop Zone: フォルダの下に移動 */}
              <UnorganizedDropZone>
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
              </UnorganizedDropZone>
            </div>

            <DragOverlay
              modifiers={[
                ({ transform }) => ({
                  ...transform,
                  y: transform.y - 20,
                }),
              ]}
              dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
              }}
            >
              {activeList ? (
                <div className="w-full flex items-center px-3 py-2 rounded-lg bg-white shadow-lg border border-[var(--color-flist-accent)] opacity-90">
                  <div className="flex items-center space-x-2">
                    <List className="w-4 h-4 text-[var(--color-flist-accent)]" />
                    <span className="truncate text-sm text-[var(--color-flist-dark)] max-w-32">
                      {activeList.title || "Untitled"}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Account Section */}
      <div className="p-4 border-t border-[var(--color-flist-border)] bg-[var(--color-flist-surface)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[var(--color-flist-accent)] rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--color-flist-dark)] truncate max-w-[160px]">
                {user?.email || "User"}
              </span>
              <span className="text-xs text-[var(--color-flist-muted)]">
                {user?.is_staff ? "Admin" : "User"}
              </span>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => {/* TODO: Settings */}}
              className="p-1 rounded-md hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-muted)] transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="p-1 rounded-md hover:bg-red-50 text-[var(--color-flist-muted)] hover:text-red-600 transition-colors"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

