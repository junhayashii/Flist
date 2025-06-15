import React, { useState, useEffect, useRef } from "react";
import TaskBlock from "../components/blocks/TaskBlock";
import { fetchTasks, createTask, updateTask, deleteBlock } from "../api/blocks";
import { fetchListMap } from "../api/lists";
import { format, parseISO } from "date-fns";
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
  const [newTaskText, setNewTaskText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, completed, pending
  const [dateFilter, setDateFilter] = useState("all"); // all, today, tomorrow, this-week
  const [sortBy, setSortBy] = useState("due-date"); // due-date, created, updated, title
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
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
  }, []);

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    const base = newTaskText.trim();
    const html = /^- \[[ xX]\] /.test(base) ? base : `- [ ] ${base}`;
    const newTask = await createTask(html);
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");
  };

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

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto px-10 py-8 backdrop-blur-md">
        {/* Filter/Sort + Add */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-6 max-w-8xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 text-sm border rounded px-3 py-1 bg-white hover:bg-gray-100"
              >
                <Filter size={16} />
                Filter
                {(selectedLists.length > 0 || statusFilter !== "all" || dateFilter !== "all") && (
                  <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                    Active
                  </span>
                )}
              </button>
              {filterOpen && (
                <div className="absolute z-10 bg-white border rounded-lg shadow-lg mt-2 p-4 space-y-4 min-w-[240px]">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-700">Status</h3>
                    <div className="space-y-1">
                      {["all", "pending", "completed"].map((status) => (
                        <label key={status} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            checked={statusFilter === status}
                            onChange={() => setStatusFilter(status)}
                            className="text-blue-600"
                          />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-700">Due Date</h3>
                    <div className="space-y-1">
                      {[
                        { value: "all", label: "All Dates" },
                        { value: "today", label: "Today" },
                        { value: "tomorrow", label: "Tomorrow" },
                        { value: "this-week", label: "This Week" },
                      ].map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            checked={dateFilter === value}
                            onChange={() => setDateFilter(value)}
                            className="text-blue-600"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-700">Lists</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {Object.entries(lists).map(([id, name]) => (
                        <label key={id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedLists.includes(id)}
                            onChange={() =>
                              setSelectedLists((prev) =>
                                prev.includes(id)
                                  ? prev.filter((x) => x !== id)
                                  : [...prev, id]
                              )
                            }
                            className="text-blue-600"
                          />
                          {name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <button
                      onClick={clearFilters}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
                    >
                      <X size={14} />
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
                className="flex items-center gap-2 text-sm border rounded px-3 py-1 bg-white hover:bg-gray-100"
              >
                {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
                Sort
              </button>
              {sortOpen && (
                <div className="absolute z-10 bg-white border rounded-lg shadow-lg mt-2 p-4 space-y-2 min-w-[200px]">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Sort by</h3>
                  {[
                    { value: "due-date", label: "Due Date", icon: Calendar },
                    { value: "created", label: "Created Date", icon: Clock },
                    { value: "updated", label: "Updated Date", icon: Clock },
                    { value: "title", label: "Title", icon: List },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setSortBy(value);
                        setSortOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-gray-100 ${
                        sortBy === value ? "text-blue-600 bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                  <div className="pt-2 border-t mt-2">
                    <button
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        setSortOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {sortOrder === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />}
                      {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {(selectedLists.length > 0 || statusFilter !== "all" || dateFilter !== "all") && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Active filters:</span>
                {statusFilter !== "all" && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                    {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </span>
                )}
                {dateFilter !== "all" && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                    {dateFilter === "today"
                      ? "Today"
                      : dateFilter === "tomorrow"
                      ? "Tomorrow"
                      : "This Week"}
                  </span>
                )}
                {selectedLists.length > 0 && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                    {selectedLists.length} List{selectedLists.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Task Cards */}
        <div className="space-y-2 max-w-8xl mx-auto">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border border-gray-200 bg-white hover:bg-blue-50 cursor-pointer shadow-sm"
            >
              <TaskBlock
                block={task}
                isEditable={true}
                editableRef={(el) => (taskRefs.current[task.id] = el)}
                onClick={() => onSelectTask?.(task)}
                onToggle={handleToggle}
                onOpenDetail={() => onSelectTask?.(task)}
                onBlur={handleBlur}
                listName={task.list ? lists[task.list] : "Inbox"}
                isSelected={selectedBlockId === task.id}
                editingBlockId={editingBlockId}
              />
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tasks match the current filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskListView;
