import React, { useState, useEffect, useRef } from "react";
import TaskBlock from "../components/blocks/TaskBlock";
import { fetchTasks, createTask, updateTask, deleteBlock } from "../api/blocks";
import { fetchListMap } from "../api/lists";

const TaskListView = ({ onSelectTask, selectedBlockId }) => {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState({});
  const [selectedLists, setSelectedLists] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
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

  const filteredTasks = selectedLists.length
    ? tasks.filter((t) => selectedLists.includes(String(t.list)))
    : tasks;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto px-10 py-8 backdrop-blur-md">
        {/* Filter/Sort + Add */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-6 max-w-8xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Filter:</span>
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="text-sm border rounded px-3 py-1 bg-white hover:bg-gray-100"
              >
                Filter by List ▾
              </button>
              {filterOpen && (
                <div className="absolute z-10 bg-white border rounded shadow mt-1 p-2 space-y-1 max-h-60 overflow-y-auto">
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
                      />
                      {name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <label className="text-sm text-gray-600">Sort:</label>
            <select className="text-sm border rounded px-2 py-1">
              <option>Due Date</option>
            </select>
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
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskListView;
