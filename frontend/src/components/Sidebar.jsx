import useLists from "../hooks/useLists";
import useFolders from "../hooks/useFolders";
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
  Sidebar as SidebarIcon,
  Inbox as InboxIcon,
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

const DraggableList = ({ list, isSelected, onClick, onEdit, editingId, draftTitle, setDraftTitle, inputRef, onDelete, onRename, taskCount }) => {
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
      className={`w-full flex items-center px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 relative group hover-lift ${
        isSelected 
          ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm" 
          : "text-[var(--color-flist-text-secondary)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)]"
      } ${isDragging ? "opacity-60 scale-105 shadow-xl rotate-1" : ""}`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--color-flist-primary)]/10 border-2 border-dashed border-[var(--color-flist-primary)] rounded-lg animate-pulse" />
      )}

      {editingId === list.id ? (
        <input
          ref={inputRef}
          className="input w-full text-sm"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={() => onEdit(list.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEdit(list.id);
            if (e.key === "Escape") onRename(null);
          }}
        />
      ) : (
        <div className="flex items-center space-x-2">
          <List size={14} className="text-[var(--color-flist-text-muted)]" />
          <span className="truncate font-medium">{list.title || "Untitled"}</span>
        </div>
      )}

      {/* Task count */}
      {taskCount > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <span className="bg-[rgba(59,130,246,0.08)] text-[var(--color-flist-primary)] text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center border border-[rgba(59,130,246,0.12)]">
            {taskCount}
          </span>
        </div>
      )}

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg py-1 z-50 min-w-[160px] glass-strong fade-in"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-left text-[var(--color-flist-text-primary)] hover:bg-[var(--color-flist-surface-hover)] flex items-center space-x-2 transition-colors"
            onClick={() => {
              onRename(list.id);
              setShowContextMenu(false);
            }}
          >
            <Edit2 size={16} />
            <span>Rename List</span>
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-left text-[var(--color-flist-error)] hover:bg-[var(--color-flist-error-light)] flex items-center space-x-2 transition-colors"
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
    <div className="space-y-0.5">
      <div
        ref={setNodeRef}
        className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--color-flist-surface-hover)] cursor-pointer transition-all duration-200 relative hover-lift ${
          isOver ? "bg-[var(--color-flist-primary-light)]" : ""
        }`}
        onClick={onToggle}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-2 relative z-10">
          {isExpanded ? (
            <ChevronDown size={14} className={`${isOver ? "text-[var(--color-flist-primary)]" : "text-[var(--color-flist-text-muted)]"}`} />
          ) : (
            <ChevronRight size={14} className={`${isOver ? "text-[var(--color-flist-primary)]" : "text-[var(--color-flist-text-muted)]"}`} />
          )}
          <Folder size={14} className={`${isOver ? "text-[var(--color-flist-primary)]" : "text-[var(--color-flist-text-muted)]"}`} />
          <span className={`text-sm font-medium ${isOver ? "text-[var(--color-flist-primary)]" : "text-[var(--color-flist-text-primary)]"}`}>
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
        <div className={`ml-4 space-y-0.5 transition-all duration-200 ${isOver ? "bg-[var(--color-flist-accent)]/5 rounded-lg p-1" : ""}`}>
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
  const { lists, addList, updateList, refreshLists, deleteList, getTaskCount } = useLists(selectedListId, setSelectedListId);
  const { folders, addFolder, editFolder, removeFolder } = useFolders();

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
    <div className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-[var(--color-flist-surface)] border-r border-[var(--color-flist-border)] flex flex-col overflow-hidden shadow-sm glass`}>
      <div className="p-4 border-b border-[var(--color-flist-border)]">
        {/* Header with close button on the right */}
        <div className="flex items-center justify-between mb-2">
          {/* Spacer to push close button to the right */}
          <div className="flex-1"></div>
          
          {/* Close button on the right */}
          {sidebarOpen && setSidebarOpen && (
            <button
              className="p-1.5 rounded-lg hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-text-muted)] hover:text-[var(--color-flist-text-primary)] transition-all duration-200 hover-scale focus-ring"
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
            >
              <SidebarIcon size={16} />
            </button>
          )}
        </div>

        {/* Navigation items in order */}
        <div className="space-y-1">
          {/* 1. Inbox */}
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
              selectedListId === "inbox"
                ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm"
                : "text-[var(--color-flist-text-secondary)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)]"
            }`}
            onClick={() => setSelectedListId("inbox")}
          >
            <InboxIcon size={16} />
            <span>Inbox</span>
          </button>

          {/* 2. Today */}
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
              selectedListId === "today"
                ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm"
                : "text-[var(--color-flist-text-secondary)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)]"
            }`}
            onClick={() => setSelectedListId("today")}
          >
            <Calendar size={16} />
            <span>Today</span>
          </button>

          {/* 3. Dashboard */}
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
              selectedListId === "dashboard" 
                ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm" 
                : "text-[var(--color-flist-text-secondary)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)]"
            }`}
            onClick={() => setSelectedListId("dashboard")}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          {/* 4. Tasks */}
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
              selectedListId === "tasks" 
                ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm" 
                : "text-[var(--color-flist-text-secondary)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)]"
            }`}
            onClick={() => setSelectedListId("tasks")}
          >
            <CheckSquare size={16} />
            <span>Tasks</span>
          </button>

          {/* 5. Notes */}
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
              selectedListId === "notes" 
                ? "bg-[var(--color-flist-primary-light)] text-[var(--color-flist-primary)] shadow-sm" 
                : "text-[var(--color-flist-text-secondary)] hover:bg-[var(--color-flist-surface-hover)] hover:text-[var(--color-flist-text-primary)]"
            }`}
            onClick={() => setSelectedListId("notes")}
          >
            <FileText size={16} />
            <span>Notes</span>
          </button>
        </div>
      </div>

      {/* Explorer */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-normal text-[var(--color-flist-text-muted)]">My Lists</h2>
            <div className="flex space-x-1">
              <button
                onClick={handleAddFolder}
                className="p-1.5 rounded-lg hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-text-muted)] hover:text-[var(--color-flist-text-primary)] transition-all duration-200 hover-scale focus-ring"
                title="New Folder"
              >
                <Folder size={16} />
              </button>
              <button
                onClick={() => handleAddList()}
                className="p-1.5 rounded-lg hover:bg-[var(--color-flist-surface-hover)] text-[var(--color-flist-text-muted)] hover:text-[var(--color-flist-text-primary)] transition-all duration-200 hover-scale focus-ring"
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
            <div className="space-y-0.5">
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
                      taskCount={getTaskCount(list.id)}
                    />
                  ))}
                </DroppableFolder>
              ))}

              {/* Unorganized Drop Zone: フォルダの下に移動 */}
              <UnorganizedDropZone>
                {listsByFolder['unorganized']?.length > 0 && (
                  <div className="space-y-0.5">
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
                        taskCount={getTaskCount(list.id)}
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


    </div>
  );
};

export default Sidebar;

