import React, { useState, useEffect, useRef } from "react";
import TaskBlock from "../components/blocks/TaskBlock";
import { fetchTasks, updateTask, deleteBlock } from "../api/blocks";
import { fetchListMap } from "../api/lists";
import { parseISO } from "date-fns";
import {
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  CheckSquare,
  Clock,
  List,
  X,
} from "lucide-react";

const TaskListView = ({ onSelectTask, selectedBlockId }) => {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState({});
  const [selectedLists, setSelectedLists] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, completed, pending
  const [dateFilter, setDateFilter] = useState("all"); // all, today, tomorrow, this-week
  const [sortBy, setSortBy] = useState("due-date"); // due-date, created, updated, title
  const [sortOrder] = useState("asc"); // asc, desc
  const [editingBlockId, setEditingBlockId] = useState(null);
  const taskRefs = useRef({});

  useEffect(() => {
    const loadData = async () => {
      const [taskData, listMap] = await Promise.all([
        fetchTasks(),
        fetchListMap(),
      ]);
      setTasks(taskData);
      setLists(listMap);
    };
    loadData();

    // Add event listener for task updates
    const handleTaskUpdate = (event) => {
      const updatedTask = event.detail;
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    };

    window.addEventListener('taskUpdated', handleTaskUpdate);
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate);
    };
  }, []);

  const handleDelete = async (task) => {
    try {
      await deleteBlock(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error("タスク削除失敗:", err);
    }
  };

  const handleToggle = async (task) => {
    const updated = {
      ...task,
      type: task.type === "task-done" ? "task" : "task-done",
      html:
        (task.type === "task-done" ? "- [ ] " : "- [x] ") +
        task.html.replace(/^- \[[ x]\] /, ""),
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    await updateTask(updated);
  };

  const handleBlur = async (task) => {
    const el = taskRefs.current[task.id];
    if (!el) return;
    const html = el.innerText;
    const updated = {
      ...task,
      html:
        html.startsWith("- [ ] ") || html.startsWith("- [x] ")
          ? html
          : task.type === "task-done"
          ? "- [x] " + html
          : "- [ ] " + html,
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, html: updated.html } : t))
    );
    await updateTask(updated);
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Apply status filter
    if (statusFilter === "completed") {
      filtered = filtered.filter((t) => t.type === "task-done");
    } else if (statusFilter === "pending") {
      filtered = filtered.filter((t) => t.type === "task");
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filtered = filtered.filter((t) => {
        if (!t.due_date) return false;
        const dueDate = parseISO(t.due_date);
        switch (dateFilter) {
          case "today":
            return dueDate >= today && dueDate < tomorrow;
          case "tomorrow":
            return dueDate >= tomorrow && dueDate < nextWeek;
          case "this-week":
            return dueDate >= today && dueDate < nextWeek;
          default:
            return true;
        }
      });
    }

    // Apply list filter
    if (selectedLists.length > 0) {
      filtered = filtered.filter((t) => selectedLists.includes(String(t.list)));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "due-date":
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          comparison = parseISO(a.due_date) - parseISO(b.due_date);
          break;
        case "created":
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        case "updated":
          comparison = new Date(a.updated_at) - new Date(b.updated_at);
          break;
        case "title":
          comparison = a.html.localeCompare(b.html);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const clearFilters = () => {
    setSelectedLists([]);
    setStatusFilter("all");
    setDateFilter("all");
  };

  const filteredTasks = getFilteredAndSortedTasks();

  const handleKeyDown = async (e, task, index) => {
    const el = taskRefs.current[task.id];
    if (!el) return;

    const html = el.innerText || "";
    
    // 空のタスクをテキストに戻す処理
    const isEmptyTask = 
      (task.type === "task" || task.type === "task-done") &&
      /^-\s\[[ x]?\]\s*$/.test(html.trim());

    if (isEmptyTask && (e.key === "Enter" || e.key === "Backspace")) {
      e.preventDefault();
      const updatedTask = { ...task, type: "text", html: "" };
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updatedTask : t))
      );
      setEditingBlockId(task.id);
      await updateTask(updatedTask);
      return;
    }

    // 上下キーでの移動処理
    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      const targetIndex = e.key === "ArrowUp" ? index - 1 : index + 1;
      const targetTask = filteredTasks[targetIndex];

      if (targetTask) {
        e.preventDefault();
        setEditingBlockId(targetTask.id);
        onSelectTask?.(targetTask);

        requestAnimationFrame(() => {
          const targetEl = taskRefs.current[targetTask.id];
          if (targetEl) {
            targetEl.focus();
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(targetEl);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        });
      }
    }
  };

  const handleEmptyTaskEnterOrBackspace = async (task) => {
    const updatedTask = { ...task, type: "text", html: "" };
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updatedTask : t))
    );
    setEditingBlockId(task.id);
    await updateTask(updatedTask);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-6 backdrop-blur-md">
        {/* Filter/Sort */}
        <div className="bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-xl shadow-sm px-6 py-4 mb-6 max-w-8xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 text-sm border border-[var(--color-flist-border)] rounded-lg px-3 py-1.5 bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] hover:border-[var(--color-flist-accent)] transition-all duration-200"
              >
                <Filter size={16} className="text-[var(--color-flist-muted)]" />
                <span className="text-[var(--color-flist-dark)]">Filter</span>
                {(selectedLists.length > 0 || statusFilter !== "all" || dateFilter !== "all") && (
                  <span className="bg-[var(--color-flist-blue-light)] text-[var(--color-flist-accent)] px-2 py-0.5 rounded-full text-xs font-medium">
                    Active
                  </span>
                )}
              </button>
              {filterOpen && (
                <div className="absolute z-10 mt-2 w-64 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg backdrop-blur-md">
                  <div className="p-3 border-b border-[var(--color-flist-border)]">
                    <h3 className="text-sm font-medium text-[var(--color-flist-dark)] mb-2">Status</h3>
                    <div className="space-y-2">
                      {["all", "pending", "completed"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center gap-2 text-sm text-[var(--color-flist-dark)] cursor-pointer hover:text-[var(--color-flist-accent)] transition-colors"
                        >
                          <input
                            type="radio"
                            checked={statusFilter === status}
                            onChange={() => setStatusFilter(status)}
                            className="w-4 h-4 text-[var(--color-flist-accent)] border-[var(--color-flist-border)] focus:ring-[var(--color-flist-accent)]"
                          />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 border-b border-[var(--color-flist-border)]">
                    <h3 className="text-sm font-medium text-[var(--color-flist-dark)] mb-2">Due Date</h3>
                    <div className="space-y-2">
                      {[
                        { value: "all", label: "All" },
                        { value: "today", label: "Today" },
                        { value: "tomorrow", label: "Tomorrow" },
                        { value: "this-week", label: "This Week" },
                      ].map(({ value, label }) => (
                        <label
                          key={value}
                          className="flex items-center gap-2 text-sm text-[var(--color-flist-dark)] cursor-pointer hover:text-[var(--color-flist-accent)] transition-colors"
                        >
                          <input
                            type="radio"
                            checked={dateFilter === value}
                            onChange={() => setDateFilter(value)}
                            className="w-4 h-4 text-[var(--color-flist-accent)] border-[var(--color-flist-border)] focus:ring-[var(--color-flist-accent)]"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-[var(--color-flist-dark)] mb-2">Lists</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(lists).map(([id, list]) => (
                        <label
                          key={id}
                          className="flex items-center gap-2 text-sm text-[var(--color-flist-dark)] cursor-pointer hover:text-[var(--color-flist-accent)] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLists.includes(id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLists([...selectedLists, id]);
                              } else {
                                setSelectedLists(selectedLists.filter((l) => l !== id));
                              }
                            }}
                            className="w-4 h-4 text-[var(--color-flist-accent)] border-[var(--color-flist-border)] rounded focus:ring-[var(--color-flist-accent)]"
                          />
                          {list.title}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 border-t border-[var(--color-flist-border)]">
                    <button
                      onClick={clearFilters}
                      className="w-full text-sm text-[var(--color-flist-accent)] hover:text-[var(--color-flist-accent-hover)] transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-sm border border-[var(--color-flist-border)] rounded-lg px-3 py-1.5 bg-[var(--color-flist-surface)] hover:bg-[var(--color-flist-surface-hover)] hover:border-[var(--color-flist-accent)] transition-all duration-200"
              >
                {sortOrder === "asc" ? (
                  <SortAsc size={16} className="text-[var(--color-flist-muted)]" />
                ) : (
                  <SortDesc size={16} className="text-[var(--color-flist-muted)]" />
                )}
                <span className="text-[var(--color-flist-dark)]">Sort</span>
              </button>
              {sortOpen && (
                <div className="absolute z-10 mt-2 w-48 bg-[var(--color-flist-surface)] border border-[var(--color-flist-border)] rounded-lg shadow-lg backdrop-blur-md">
                  <div className="p-2">
                    {[
                      { value: "due-date", label: "Due Date" },
                      { value: "created", label: "Created" },
                      { value: "updated", label: "Updated" },
                      { value: "title", label: "Title" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setSortBy(value);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          sortBy === value
                            ? "text-[var(--color-flist-accent)] bg-[var(--color-flist-blue-light)]"
                            : "text-[var(--color-flist-dark)] hover:bg-[var(--color-flist-surface-hover)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="max-w-8xl mx-auto space-y-1">
          {filteredTasks.map((task, index) => (
            <TaskBlock
              key={task.id}
              block={task}
              onClick={() => onSelectTask(task)}
              onToggle={handleToggle}
              onOpenDetail={() => onSelectTask(task)}
              listName={lists[task.list]?.title}
              isEditable={editingBlockId === task.id}
              onBlur={handleBlur}
              editableRef={(el) => (taskRefs.current[task.id] = el)}
              onEmptyTaskEnterOrBackspace={() => handleEmptyTaskEnterOrBackspace(task)}
              isSelected={selectedBlockId === task.id}
              onDelete={() => handleDelete(task)}
              editingBlockId={editingBlockId}
              onKeyDown={(e) => handleKeyDown(e, task, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskListView;
